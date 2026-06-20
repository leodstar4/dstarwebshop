// ============================================
// DSTAR — WEBHOOK DE MERCADO PAGO
// ============================================
// Recibe notificaciones de MercadoPago cuando un pago cambia de estado.
// Si el pago es aprobado, genera automáticamente la guía de envío con
// Skydropx Pro (API v2 / OAuth2) usando el rate_id guardado en la metadata.
//
// Configurar esta URL en MercadoPago como notification_url:
//   https://tu-sitio.netlify.app/.netlify/functions/mp-webhook
//
// Variables de entorno necesarias:
//   MP_ACCESS_TOKEN
//   SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET
//   CP_ORIGEN, DIRECCION_ORIGEN, TELEFONO_ORIGEN, EMAIL_ORIGEN
//   (opcionales) NOMBRE_ORIGEN, EMPRESA_ORIGEN, REFERENCIA_ORIGEN,
//                SKYDROPX_CONSIGNMENT_NOTE, SKYDROPX_PACKAGE_TYPE
// ============================================

const nodemailer = require('nodemailer');

const SKYDROPX_BASE = 'https://pro.skydropx.com/api/v1';

let _tokenCache = { token: null, exp: 0 };

async function getSkydropxToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.exp) return _tokenCache.token;

  const clean = (v) => (v == null ? '' : String(v).trim().replace(/^["']|["']$/g, ''));
  const client_id = clean(process.env.SKYDROPX_CLIENT_ID);
  const client_secret = clean(process.env.SKYDROPX_CLIENT_SECRET);
  if (!client_id || !client_secret) {
    throw new Error('Skydropx no configurado: faltan SKYDROPX_CLIENT_ID / SKYDROPX_CLIENT_SECRET');
  }

  const res = await fetch(`${SKYDROPX_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id, client_secret, grant_type: 'client_credentials' })
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(
      `Skydropx auth falló (${res.status}) — client_id_len=${client_id.length} secret_len=${client_secret.length} body=${txt}`
    );
    throw new Error(`Skydropx auth falló (${res.status}): ${txt}`);
  }

  const data = await res.json();
  _tokenCache = { token: data.access_token, exp: now + ((data.expires_in || 7200) * 1000) - 60000 };
  return _tokenCache.token;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // MercadoPago puede enviar GET para verificar el endpoint
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, data } = body;

    if (type !== 'payment') {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: `tipo ignorado: ${type}` }) };
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Falta data.id en el webhook' }) };
    }

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      console.error('mp-webhook — falta MP_ACCESS_TOKEN');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'MP no configurado' }) };
    }

    // Consultar los detalles del pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}`, 'Content-Type': 'application/json' }
    });
    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('Error consultando pago MP:', errText.slice(0, 200));
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'No se pudo consultar el pago' }) };
    }

    const payment = await mpResponse.json();

    if (payment.status !== 'approved') {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: `estado ignorado: ${payment.status}` }) };
    }

    // Metadata guardada al crear la preferencia
    const { cliente, rate_id, parcel, order_items, order_total } = payment.metadata || {};
    if (!cliente || !rate_id) {
      console.error('mp-webhook — metadata incompleta:', payment.metadata);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: 'metadata de envío incompleta' }) };
    }

    const guiaResult = await crearGuiaSkydropx({ cliente, rate_id, parcel, total: payment.transaction_amount });

    // Enviar correo de agradecimiento con guía + rastreo. NUNCA debe romper
    // el webhook: el pago y la guía ya se procesaron. Si falla, solo se loguea.
    try {
      await enviarCorreoConfirmacion({
        cliente,
        guia: guiaResult,
        items: order_items || [],
        total: order_total || payment.transaction_amount,
        paymentId
      });
    } catch (mailErr) {
      console.error('mp-webhook — fallo al enviar correo (no crítico):', mailErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        tracking_number: guiaResult.tracking_number,
        label_url: guiaResult.label_url
      })
    };

  } catch (error) {
    console.error('mp-webhook — error inesperado:', error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};

// ============================================
// GENERAR GUÍA EN SKYDROPX PRO (v2)
// ============================================
async function crearGuiaSkydropx({ cliente, rate_id, parcel, total }) {
  const token = await getSkydropxToken();

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
    body: JSON.stringify(shipmentBody)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Skydropx shipment error (${response.status}): ${JSON.stringify(data).slice(0, 300)}`);
  }

  // Respuesta JSON:API — el tracking/label vienen en included[].attributes
  const pkg = (data.included || []).find(
    (i) => i && i.attributes && (i.attributes.tracking_number || i.attributes.label_url)
  );
  const attrs = pkg ? pkg.attributes : {};

  return {
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

async function enviarCorreoConfirmacion({ cliente, guia, items, total, paymentId }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error('mp-webhook — falta GMAIL_USER / GMAIL_APP_PASSWORD; no se envía correo');
    return;
  }
  if (!cliente.email) {
    console.error('mp-webhook — el cliente no tiene email; no se envía correo');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const fromName = process.env.EMPRESA_ORIGEN || 'DSTAR';

  // El cliente recibe solo el rastreo; la etiqueta para despachar (label_url)
  // va únicamente en la copia interna de la tienda.
  const htmlCliente = buildEmailHtml({ cliente, guia, items, total, paymentId, incluirEtiqueta: false });
  const htmlTienda  = buildEmailHtml({ cliente, guia, items, total, paymentId, incluirEtiqueta: true });

  // 1) Al cliente
  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to: cliente.email,
    subject: 'Tu pedido DSTAR está confirmado 🖤',
    html: htmlCliente
  });

  // 2) Copia interna a la tienda (notificación de venta + etiqueta para imprimir)
  const storeEmail = process.env.EMAIL_ORIGEN || user;
  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to: storeEmail,
    subject: `Nueva venta — ${cliente.nombre || 'Cliente'} · ${cliente.ciudad || ''} ${cliente.cp || ''}`.trim(),
    html: htmlTienda
  }).catch((e) => console.error('mp-webhook — no se pudo enviar copia a la tienda:', e.message));
}

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
            Tu pago fue aprobado y ya estamos preparando tu envío. Aquí están tu guía y rastreo.
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
