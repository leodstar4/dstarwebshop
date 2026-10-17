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
const nodemailer = require('nodemailer');
const { SKYDROPX_BASE, getSkydropxToken, cotizar } = require('../lib/skydropx');
const { openStore } = require('../lib/orders-store');
const { descontar } = require('../lib/stock-store');

const headers = { 'Content-Type': 'application/json' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
const STALE_MS = 5 * 60 * 1000;

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
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method Not Allowed' });

  try {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return reply(400, { error: 'JSON inválido' }); }

    const qs = event.queryStringParameters || {};
    if ((body.type || qs.type) !== 'payment') return reply(200, { ok: true });

    const paymentId = String(qs['data.id'] || (body.data && body.data.id) || '');
    if (!/^\d{1,20}$/.test(paymentId)) return reply(400, { error: 'id inválido' });
    if (!firmaValida(event, paymentId)) return reply(401, { error: 'Firma inválida' });

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      console.error('mp-webhook — falta MP_ACCESS_TOKEN');
      return reply(500, { error: 'MP no configurado' });
    }

    const store = openStore(event);
    const previo = await store.get(paymentId);
    if (previo && (previo.status === 'done' || (previo.status === 'processing' && Date.now() - previo.at < STALE_MS))) {
      return reply(200, { ok: true });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}`, 'Content-Type': 'application/json' }
    });
    if (!mpResponse.ok) {
      console.error('mp-webhook — error consultando pago', paymentId, mpResponse.status);
      return reply(500, { error: 'No se pudo consultar el pago' });
    }

    const payment = await mpResponse.json();
    if (payment.status !== 'approved') return reply(200, { ok: true });

    const { cliente, rate_id, parcel, envio, order_items, stock_items, expected_total } = payment.metadata || {};
    if (!(await store.claim(paymentId, STALE_MS))) return reply(200, { ok: true });

    if (!cliente || !rate_id) {
      console.error('mp-webhook — metadata incompleta en pago', paymentId);
      await store.set(paymentId, { status: 'done', at: Date.now(), revisar: true, pedido: { total: Number(payment.transaction_amount) || 0 } });
      await alertarTienda(`Pago ${paymentId} sin datos de envío`, [
        'Mercado Pago aprobó un pago que no trae los datos del cliente ni la tarifa de envío, así que no se generó guía.',
        `Monto: ${fmtMXN(payment.transaction_amount)}`,
        'Búscalo en tu panel de Mercado Pago para contactar al comprador.'
      ], paymentId);
      return reply(200, { ok: true });
    }

    const pagado = Number(payment.transaction_amount);
    const pedido = { cliente, items: order_items || [], total: pagado };
    if (payment.currency_id !== 'MXN' || !Number.isFinite(Number(expected_total)) || pagado + 0.01 < Number(expected_total)) {
      console.error(`mp-webhook — monto no coincide en pago ${paymentId}: pagado=${pagado} esperado=${expected_total} moneda=${payment.currency_id}. Revisar a mano.`);
      await store.set(paymentId, { status: 'done', at: Date.now(), revisar: true, pedido });
      await alertarTienda(`El monto del pago ${paymentId} no coincide`, [
        `Se pagó ${fmtMXN(pagado)} (${payment.currency_id}) pero el pedido costaba ${fmtMXN(expected_total)}.`,
        'No se generó guía ni se descontó stock. Revisa el pago en Mercado Pago antes de enviar.',
        ...datosCliente(cliente),
        ...lineasPedido(order_items)
      ], paymentId);
      return reply(200, { ok: true });
    }

    const registro = { ...previo, pedido };
    if (!registro.stock) {
      try {
        const sobreventa = await descontar(event, stock_items);
        registro.stock = true;
        await store.set(paymentId, { ...registro, status: 'processing', at: Date.now() });
        if (sobreventa.length) {
          await alertarTienda(`Sobreventa en el pago ${paymentId}`, [
            'Dos personas pagaron la misma pieza casi al mismo tiempo. Faltan:',
            ...sobreventa.map((l) => `• ${l.name} talla ${l.size}: ${l.faltan} pieza(s)`),
            'La guía se genera de todos modos; contacta al cliente para ofrecerle otra talla o reembolsar desde Mercado Pago.',
            ...datosCliente(cliente)
          ], paymentId);
        }
      } catch (err) {
        console.error('mp-webhook — no se pudo descontar stock:', err.message);
        await alertarTienda(`No se descontó el stock del pago ${paymentId}`, [
          `Error: ${err.message}`,
          'Ajusta el stock a mano en products-data.js.',
          ...lineasPedido(order_items)
        ], paymentId);
      }
    }

    let guiaResult;
    try {
      guiaResult = await crearGuiaConRespaldo({ cliente, rate_id, parcel, envio, total: pagado });
    } catch (err) {
      console.error('mp-webhook — Skydropx falló:', err.message);
      if (!registro.alertaGuia) {
        registro.alertaGuia = true;
        await alertarTienda(`No se pudo crear la guía del pago ${paymentId}`, [
          `Skydropx respondió: ${err.message}`,
          'El cliente ya pagó. Mercado Pago reintentará el aviso; si sigue fallando, genera la guía a mano en Skydropx con estos datos:',
          ...datosCliente(cliente),
          ...lineasPedido(order_items)
        ], paymentId);
      }
      await store.set(paymentId, { ...registro, status: 'failed', at: Date.now() });
      throw err;
    }
    await store.set(paymentId, {
      ...registro,
      status: 'done',
      at: Date.now(),
      tracking: guiaResult.tracking_number || '',
      guia: { carrier: guiaResult.carrier, label_url: guiaResult.label_url, tracking_url: guiaResult.tracking_url }
    });
    if (guiaResult.recotizada) {
      await alertarTienda(`La tarifa de envío del pago ${paymentId} había vencido`, [
        `Se generó la guía con una tarifa nueva de ${guiaResult.carrier}: ${fmtMXN(guiaResult.recotizada.ahora)} (el cliente pagó ${fmtMXN(guiaResult.recotizada.antes)} de envío).`,
        `Guía: ${guiaResult.tracking_number || '-'}`
      ], paymentId);
    }

    try {
      await enviarCorreoConfirmacion({ cliente, guia: guiaResult, items: order_items || [], total: pagado, paymentId });
    } catch (mailErr) {
      console.error('mp-webhook — fallo al enviar correo (no crítico):', mailErr.message);
    }

    return reply(200, { ok: true });
  } catch (error) {
    console.error('mp-webhook — error inesperado:', error.message);
    return reply(500, { error: 'Error interno del servidor' });
  }
};

// Un pago en efectivo (OXXO) puede aprobarse días después y para entonces la
// tarifa ya venció: se vuelve a cotizar con la misma paquetería y servicio.
async function crearGuiaConRespaldo({ cliente, rate_id, parcel, envio, total }) {
  try {
    return await crearGuiaSkydropx({ cliente, rate_id, parcel, total });
  } catch (err) {
    if (!envio || !envio.carrier || !parcel || !cliente.cp) throw err;
    const { rates } = await cotizar(
      { cp: cliente.cp, estado: cliente.estado, ciudad: cliente.ciudad, colonia: cliente.colonia },
      { length: parcel.length, width: parcel.width, height: parcel.height, weight: parcel.weight }
    ).catch(() => ({ rates: [] }));
    const igual = rates.find((r) => r.carrier === envio.carrier && r.service === envio.service);
    if (!igual || String(igual.rate_id) === String(rate_id)) throw err;
    const guia = await crearGuiaSkydropx({ cliente, rate_id: igual.rate_id, parcel, total });
    return { ...guia, recotizada: { antes: Number(envio.price) || 0, ahora: igual.price } };
  }
}

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

function transporte() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return { user, transporter: nodemailer.createTransport({ service: 'gmail', auth: { user, pass } }) };
}

function datosCliente(c) {
  return [
    `Cliente: ${c.nombre || '-'} · ${c.email || '-'} · ${c.telefono || '-'}`,
    `Dirección: ${[c.calle, c.colonia, c.ciudad, c.estado, c.cp && `C.P. ${c.cp}`].filter(Boolean).join(', ')}`,
    c.referencia ? `Referencia: ${c.referencia}` : ''
  ].filter(Boolean);
}

function lineasPedido(items) {
  return (items || []).map((i) => `• ${i.title} × ${i.quantity} — ${fmtMXN((Number(i.unit_price) || 0) * (Number(i.quantity) || 1))}`);
}

// Avisa a la tienda por correo de un pedido que necesita atención manual.
async function alertarTienda(asunto, lineas, paymentId) {
  console.error(`mp-webhook — ALERTA: ${asunto}`);
  const t = transporte();
  if (!t) {
    console.error('mp-webhook — falta GMAIL_USER / GMAIL_APP_PASSWORD; la alerta solo queda en el log');
    return;
  }
  const cuerpo = lineas.map((l) => `<p style="margin:0 0 10px;color:#f0ede8;font-size:14px;line-height:1.6;">${esc(l)}</p>`).join('');
  await t.transporter.sendMail({
    from: `"DSTAR alertas" <${t.user}>`,
    to: process.env.EMAIL_ORIGEN || t.user,
    subject: `⚠️ ${asunto}`,
    text: `${lineas.join('\n')}\n\nPago Mercado Pago #${paymentId}`,
    html: `<div style="background:#0a0a0a;padding:24px;font-family:'Courier New',monospace;">
      <p style="margin:0 0 16px;color:#e63232;font-size:12px;letter-spacing:3px;">ALERTA DE PEDIDO</p>
      <h1 style="margin:0 0 16px;color:#f0ede8;font-size:20px;">${esc(asunto)}</h1>
      ${cuerpo}
      <p style="margin:16px 0 0;color:#8a8a83;font-size:12px;">Pago Mercado Pago #${esc(paymentId)}</p>
    </div>`
  }).catch((e) => console.error('mp-webhook — no se pudo enviar la alerta:', e.message));
}

async function enviarCorreoConfirmacion({ cliente, guia, items, total, paymentId }) {
  const t = transporte();
  if (!t) {
    console.error('mp-webhook — falta GMAIL_USER / GMAIL_APP_PASSWORD; no se envía correo');
    return;
  }
  if (!cliente.email) {
    console.error('mp-webhook — el cliente no tiene email; no se envía correo');
    return;
  }
  const { user, transporter } = t;

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
