// ============================================
// DSTAR — WEBHOOK DE MERCADO PAGO
// ============================================
// Si el pago está aprobado y el monto coincide con el calculado al crear la
// preferencia, descuenta el stock, genera la guía en Skydropx y envía el correo.
// Si algo requiere revisión manual, avisa a la tienda por correo. Cada pago se
// procesa una sola vez (registro en Netlify Blobs).
//
// Variables de entorno:
//   MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET (clave secreta de webhooks en el panel de MP)
//   SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET
//   DIRECCION_ORIGEN, TELEFONO_ORIGEN, EMAIL_ORIGEN, GMAIL_USER, GMAIL_APP_PASSWORD
// ============================================

const crypto = require('crypto');
const { SKYDROPX_BASE, getSkydropxToken } = require('../lib/skydropx');


const headers = { 'Content-Type': 'application/json' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });


function firmaValida(event, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NETLIFY_DEV !== 'true') {
      console.error('mp-webhook — MP_WEBHOOK_SECRET no configurado; se rechaza la notificación');
      return false;
    }
    console.warn('mp-webhook — MP_WEBHOOK_SECRET no configurado; no se verifica la firma');
    return true;
  }
  const h = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const parts = Object.fromEntries(String(h['x-signature'] || '').split(',').map((p) => p.trim().split('=')));
  if (!parts.ts || !parts.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId;
  let manifest = `id:${id};`;
  if (h['x-request-id']) manifest += `request-id:${h['x-request-id']};`;
  manifest += `ts:${parts.ts};`;
  const esperado = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(esperado);
  const b = Buffer.from(String(parts.v1));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') return reply(200, { ok: true });
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
  try {
    const body = JSON.parse(event.body || '{}');
    const qs = event.queryStringParameters || {};
    if ((body.type || qs.type) !== 'payment') return reply(200, { ok: true });
    const id = String(qs['data.id'] || body.data?.id || '');
    if (!/^\d{1,20}$/.test(id)) return reply(400, { error: 'ID inválido' });
    if (!firmaValida(event, id)) return reply(401, { error: 'Firma inválida' });
    if (process.env.CONTEXT === 'production') await require('../lib/jobs').dispatch({ type: 'payment', id });
    else await require('../lib/payment-service').syncPayment(event, id);
    return reply(200, { ok: true });
  } catch (e) {
    console.error('mp-webhook:', e.message);
    return reply(503, { error: 'No se pudo procesar; reintentar' });
  }
};

// ============================================
// GENERAR GUÍA EN SKYDROPX PRO (v2)
// ============================================
async function crearGuiaSkydropx({ cliente, rate_id, parcel, total }) {
  if (!rate_id || !cliente) throw Object.assign(new Error('Pedido sin tarifa o destino'), { notSent: true });
  const token = await getSkydropxToken().catch(e => { throw Object.assign(e, { notSent: true }); });

  const shipmentBody = {
    shipment: {
      rate_id,
      address_from: {
        street1: process.env.DIRECCION_ORIGEN || '',
        name: process.env.NOMBRE_ORIGEN || 'DSTAR Store',
        company: process.env.EMPRESA_ORIGEN || 'DSTAR',
        phone: process.env.TELEFONO_ORIGEN || '',
        email: process.env.EMAIL_ORIGEN || '',
        reference: process.env.REFERENCIA_ORIGEN || 'Almacén DSTAR'
      },
      address_to: {
        street1: [cliente.calle, cliente.colonia].filter(Boolean).join(', '),
        name: cliente.nombre || '',
        company: cliente.nombre || '-',
        phone: cliente.telefono || '',
        email: cliente.email || '',
        reference: cliente.referencia || 'Sin referencia'
      },
      packages: [{
        package_number: '1',
        package_protected: false,
        declared_value: Math.round(total || (parcel && parcel.declared_value) || 1000),
        consignment_note: process.env.SKYDROPX_CONSIGNMENT_NOTE || '53102400',
        package_type: process.env.SKYDROPX_PACKAGE_TYPE || '4G'
      }]
    }
  };

  const response = await fetch(`${SKYDROPX_BASE}/shipments/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(shipmentBody),
    signal: AbortSignal.timeout(20000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(`Skydropx shipment error (${response.status})`), { upstreamStatus: response.status });
  }

  // Respuesta JSON:API — el tracking/label vienen en included[].attributes
  const pkg = (data.included || []).find(
    (i) => i && i.attributes && (i.attributes.tracking_number || i.attributes.label_url)
  );
  const attrs = pkg ? pkg.attributes : {};

  return {
    shipment_id: data.data?.id || '',
    tracking_number: attrs.tracking_number
      || (data.data && data.data.attributes && data.data.attributes.master_tracking_number)
      || '',
    label_url: attrs.label_url || '',
    tracking_url: attrs.tracking_url_provider || '',
    carrier: (data.data && data.data.attributes && data.data.attributes.carrier_name) || ''
  };
}

// ============================================
// CORREO DE AGRADECIMIENTO (Gmail SMTP / nodemailer)
// ============================================
const fmtMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 })
    .format(Number(n) || 0);

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildEmailHtml({ cliente, guia, items, total, paymentId, incluirEtiqueta }) {
  const rows = (items || []).map((it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f0ede8;font-size:14px;">
        ${esc(it.title)} <span style="color:#8a8a83;">× ${esc(it.quantity)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f0ede8;font-size:14px;text-align:right;white-space:nowrap;">
        ${fmtMXN((Number(it.unit_price) || 0) * (Number(it.quantity) || 1))}
      </td>
    </tr>`).join('');

  const direccion = [cliente.calle, cliente.colonia, `${cliente.ciudad || ''}, ${cliente.estado || ''}`, `C.P. ${cliente.cp || ''}`]
    .filter((p) => p && p.trim() && p.trim() !== ',').map(esc).join('<br>');

  const tracking = guia.tracking_number
    ? `<p style="margin:0 0 6px;color:#8a8a83;font-size:11px;letter-spacing:2px;">NÚMERO DE RASTREO</p>
       <p style="margin:0 0 4px;color:#f0ede8;font-size:20px;font-weight:bold;letter-spacing:1px;">${esc(guia.tracking_number)}</p>
       ${guia.carrier ? `<p style="margin:0 0 16px;color:#8a8a83;font-size:12px;">Paquetería: ${esc(guia.carrier)}</p>` : ''}`
    : `<p style="margin:0 0 16px;color:#8a8a83;font-size:13px;">Tu número de rastreo estará disponible muy pronto.</p>`;

  const trackBtn = guia.tracking_url
    ? `<a href="${esc(guia.tracking_url)}" style="display:inline-block;background:#e63232;color:#fff;text-decoration:none;font-size:13px;letter-spacing:2px;padding:14px 28px;border-radius:2px;margin:4px 8px 4px 0;">RASTREAR PEDIDO</a>`
    : '';
  // La etiqueta para imprimir solo se incluye en la copia de la tienda.
  const labelBtn = (incluirEtiqueta && guia.label_url)
    ? `<a href="${esc(guia.label_url)}" style="display:inline-block;background:#141414;color:#f0ede8;text-decoration:none;font-size:13px;letter-spacing:2px;padding:14px 28px;border-radius:2px;border:1px solid #2a2a2a;margin:4px 0;">VER GUÍA DE ENVÍO (IMPRIMIR)</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0f0f0f;border:1px solid #2a2a2a;border-radius:4px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0;color:#e63232;font-size:24px;font-weight:bold;letter-spacing:6px;">DSTAR</p>
          <p style="margin:8px 0 0;color:#8a8a83;font-size:10px;letter-spacing:3px;">DEL BARRIO PARA EL BARRIO</p>
        </td></tr>

        <tr><td style="padding:24px 32px 8px;">
          <p style="margin:0 0 8px;color:#e63232;font-size:10px;letter-spacing:3px;">PEDIDO CONFIRMADO</p>
          <h1 style="margin:0 0 12px;color:#f0ede8;font-size:26px;letter-spacing:2px;">Gracias, ${esc((cliente.nombre || '').split(' ')[0] || 'crack')} 🖤</h1>
          <p style="margin:0;color:#b0b0a8;font-size:14px;line-height:1.7;">
            Tu pago fue aprobado. Si la guía aún no aparece, te enviaremos una actualización cuando esté lista.
          </p>
        </td></tr>

        <tr><td style="padding:16px 32px 0;">
          <div style="background:#141414;border:1px solid #2a2a2a;border-radius:3px;padding:20px;">
            ${tracking}
            ${trackBtn}${labelBtn}
          </div>
        </td></tr>

        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 8px;color:#8a8a83;font-size:11px;letter-spacing:2px;">TU PEDIDO</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows || '<tr><td style="color:#8a8a83;font-size:13px;padding:10px 0;">Detalle no disponible</td></tr>'}
            <tr>
              <td style="padding:14px 0 0;color:#f0ede8;font-size:14px;font-weight:bold;letter-spacing:1px;">TOTAL</td>
              <td style="padding:14px 0 0;color:#e63232;font-size:22px;font-weight:bold;text-align:right;">${fmtMXN(total)}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 8px;color:#8a8a83;font-size:11px;letter-spacing:2px;">ENVIAMOS A</p>
          <p style="margin:0;color:#b0b0a8;font-size:13px;line-height:1.7;">${esc(cliente.nombre)}<br>${direccion}</p>
        </td></tr>

        <tr><td style="padding:28px 32px 32px;">
          <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 16px;">
          <p style="margin:0 0 4px;color:#5c5c57;font-size:11px;">Pedido #${esc(paymentId || '')}</p>
          <p style="margin:0;color:#5c5c57;font-size:11px;line-height:1.7;">
            ¿Dudas? Escríbenos a <a href="mailto:${esc(process.env.EMAIL_ORIGEN || 'dstarstudioss@gmail.com')}" style="color:#e63232;">${esc(process.env.EMAIL_ORIGEN || 'dstarstudioss@gmail.com')}</a><br>
            DSTAR © streetwear exclusivo
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

exports.crearGuiaSkydropx = crearGuiaSkydropx;
exports.buildEmailHtml = buildEmailHtml;
