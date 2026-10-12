// ============================================
// DSTAR — CREAR PREFERENCIA DE MERCADO PAGO
// ============================================
// Recibe por POST: { items: [{ id, size, qty }], cliente, quotation_id, rate_id }
// Precios, stock y costo de envío se calculan aquí; nada de eso se acepta del navegador.
//
// Variables de entorno: MP_ACCESS_TOKEN, URL_SITIO (o URL que define Netlify)
// ============================================

const { validarCliente, construirPedido, origenPermitido, str } = require('../lib/validate');
const { getRatePrice } = require('../lib/skydropx');
const { leerStock } = require('../lib/stock-store');

const headers = { 'Content-Type': 'application/json' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
  if (!origenPermitido(event)) return reply(403, { error: 'Origen no permitido' });

  try {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return reply(400, { error: 'JSON inválido' }); }

    const pedido = construirPedido(body.items, await leerStock(event).catch((e) => { console.error('mp-preference — no se pudo leer el stock:', e.message); return null; }));
    if (pedido.error) return reply(400, { error: pedido.error });

    const { cliente, errores } = validarCliente(body.cliente);
    if (errores.length) return reply(400, { error: 'Datos del cliente inválidos', campos: errores });

    const quotationId = str(body.quotation_id, 64);
    const rateId = str(body.rate_id, 64);
    if (!quotationId || !rateId) return reply(400, { error: 'Selecciona una opción de envío' });

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    const URL_SITIO = (process.env.URL_SITIO || process.env.URL || '').replace(/\/$/, '');
    if (!MP_TOKEN || !URL_SITIO) {
      console.error('mp-preference — falta MP_ACCESS_TOKEN o URL_SITIO');
      return reply(500, { error: 'Pagos no configurados' });
    }

    const envio = await getRatePrice(quotationId, rateId);
    if (!envio) return reply(400, { error: 'La tarifa de envío expiró, vuelve a cotizar' });

    const mpItems = pedido.items.map(({ id, size, ...i }) => i);
    if (envio.price > 0) {
      mpItems.push({ title: envio.name ? `Envío — ${envio.name}` : 'Envío', unit_price: envio.price, quantity: 1, currency_id: 'MXN' });
    }
    const total = Math.round((pedido.subtotal + envio.price) * 100) / 100;
    const totalUnidades = pedido.items.reduce((s, i) => s + i.quantity, 0);

    const preference = {
      items: mpItems,
      payer: { name: cliente.nombre, email: cliente.email, phone: { number: cliente.telefono } },
      metadata: {
        cliente,
        rate_id: rateId,
        parcel: { weight: Math.max(0.5, Math.round(totalUnidades * 4) / 10), height: 15, width: 20, length: 5 },
        order_items: mpItems.map((i) => ({ title: i.title, quantity: i.quantity, unit_price: i.unit_price })),
        stock_items: pedido.items.map((i) => ({ id: i.id, size: i.size, qty: i.quantity })),
        expected_total: total
      },
      back_urls: {
        success: `${URL_SITIO}/gracias.html`,
        failure: `${URL_SITIO}/error-pago.html`,
        pending: `${URL_SITIO}/pago-pendiente.html`
      },
      auto_return: 'approved',
      notification_url: `${URL_SITIO}/.netlify/functions/mp-webhook`,
      statement_descriptor: 'DSTAR',
      external_reference: `dstar_${Date.now()}`
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MP_TOKEN}` },
      body: JSON.stringify(preference)
    });

    if (!mpResponse.ok) {
      console.error('MercadoPago error al crear preferencia:', mpResponse.status, (await mpResponse.text()).slice(0, 200));
      return reply(500, { error: 'Error al crear la preferencia de pago' });
    }

    const mpData = await mpResponse.json();
    return reply(200, { id: mpData.id, init_point: mpData.init_point, total });
  } catch (error) {
    console.error('mp-preference — error inesperado:', error.message);
    return reply(500, { error: 'Error interno del servidor' });
  }
};
