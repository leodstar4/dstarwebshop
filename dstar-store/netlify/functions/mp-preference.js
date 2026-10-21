const crypto = require('crypto');
const { validarCliente, construirPedido, origenPermitido, str } = require('../lib/validate');
const { catalog } = require('../lib/catalog-store');
const { leerStock, reservar } = require('../lib/stock-store');
const { openStore } = require('../lib/orders-store');
const { verifyQuote } = require('../lib/quotes');
const { getRatePrice } = require('../lib/skydropx');
const { limitar, demasiadas } = require('../lib/rate-limit');
const { reply, body, failure, mp } = require('../lib/http');
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
  if (!origenPermitido(event)) return reply(403, { error: 'Origen no permitido' });
  const retry = await limitar(event, 'pago', 10, 600);
  if (retry) return demasiadas(retry);
  let store, orderId, owner;
  try {
    const b = body(event);
    const { cliente, errores } = validarCliente(b.cliente);
    if (errores.length) return reply(400, { error: 'Datos del cliente inválidos', campos: errores });
    // This browser-generated random identifier makes retrying a checkout safe.
    if (!/^[a-f0-9-]{36}$/.test(b.checkout_id || '')) return reply(400, { error: 'Actualiza el checkout antes de pagar.' });
    orderId = 'dstar_' + b.checkout_id;
    store = openStore(event); owner = crypto.randomUUID();
    if (!await store.claim(orderId, 120000, owner)) return reply(409, { error: 'Tu pago se está preparando. Espera un momento.' });
    const fingerprint = crypto.createHash('sha256').update(JSON.stringify({ cliente, items: b.items, q: b.quotation_id, r: b.rate_id })).digest('hex');
    const previous = await store.get(orderId);
    if (previous.fingerprint && previous.fingerprint !== fingerprint) return reply(409, { error: 'El pedido cambió. Reinicia el pago.' });
    if (previous.preference?.init_point && previous.expiresAt > Date.now()) return reply(200, { ...previous.preference, order_id: orderId, tracking_token: previous.trackingToken });
    if (previous.paymentId || previous.preferenceState === 'ready') return reply(409, { error: 'Tu sesión de pago venció. Da clic en PAGAR otra vez.', restart: true });
    const products = await catalog(event);
    const pedido = construirPedido(b.items, await leerStock(event, products, orderId), products);
    if (pedido.error) return reply(400, { error: pedido.error });
    const { quote, rate } = await verifyQuote(event, str(b.quotation_id, 100), str(b.rate_id, 100), cliente, pedido.items);
    const fresh = await getRatePrice(b.quotation_id, b.rate_id);
    if (!fresh || fresh.currency !== 'MXN' || Math.abs(fresh.price - rate.price) > 0.01) return reply(400, { error: 'La tarifa de envío cambió; vuelve a cotizar.' });
    const site = (process.env.URL_SITIO || process.env.URL || '').replace(/\/$/, '');
    if (!/^https:\/\//.test(site) || !process.env.MP_ACCESS_TOKEN || !process.env.MP_WEBHOOK_SECRET) throw new Error('Pagos no configurados');
    const expiresAt = Date.now() + 15 * 60000;
    // Extra grace period protects a payment approved at the checkout deadline.
    const reservedUntil = expiresAt + 10 * 60000;
    const stockItems = pedido.items.map(i => ({ id: i.id, size: i.size, qty: i.quantity }));
    const total = Math.round((pedido.subtotal + rate.price) * 100) / 100;
    const token = previous.trackingToken || crypto.randomBytes(32).toString('hex');
    const mpItems = pedido.items.map(({ id, size, ...i }) => i);
    if (rate.price > 0) mpItems.push({ title: 'Envío — ' + rate.carrier, unit_price: rate.price, quantity: 1, currency_id: 'MXN' });
    await reservar(event, orderId, stockItems, reservedUntil, products);
    await store.update(orderId, p => ({ ...p, fingerprint, createdAt: p.createdAt || Date.now(), at: Date.now(), expiresAt, reservedUntil, paymentStatus: 'pending', fulfillment: 'pending', status: 'pending', trackingToken: token, pedido: { cliente, items: mpItems, total, subtotal: pedido.subtotal }, stockItems, shipping: { rate_id: b.rate_id, quotation_id: b.quotation_id, parcel: quote.parcel, envio: rate } }));
    await store.update(orderId, p => ({ ...p, preferenceState: 'creating' }));
    const back = site + '/seguimiento.html#' + orderId + '/' + token;
    const preference = {
      items: mpItems, payer: { name: cliente.nombre, email: cliente.email, phone: { number: cliente.telefono } },
      metadata: { order_id: orderId, cliente, rate_id: b.rate_id, quotation_id: b.quotation_id, parcel: quote.parcel, envio: rate, order_items: mpItems, stock_items: stockItems, expected_total: total },
      external_reference: orderId, binary_mode: true,
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }, { id: 'atm' }] },
      expires: true, expiration_date_from: new Date().toISOString(), expiration_date_to: new Date(expiresAt).toISOString(),
      back_urls: { success: back, failure: back, pending: back }, auto_return: 'approved',
      notification_url: site + '/.netlify/functions/mp-webhook', statement_descriptor: 'DSTAR'
    };
    const data = await mp('/checkout/preferences', { method: 'POST', body: JSON.stringify(preference) });
    if (!data.id || !data.init_point) throw new Error('Respuesta de pago incompleta');
    const redirect = new URL(data.init_point);
    if (redirect.protocol !== 'https:' || !['www.mercadopago.com.mx', 'mercadopago.com.mx'].includes(redirect.hostname)) throw new Error('URL de pago no válida');
    const result = { id: data.id, init_point: data.init_point, total, expiresAt };
    await store.update(orderId, p => ({ ...p, preferenceState: 'ready', preference: result }));
    return reply(200, { ...result, order_id: orderId, tracking_token: token });
  } catch (e) {
    return failure(e);
  } finally { if (store && owner) await store.release(orderId, owner).catch(() => {}); }
};
