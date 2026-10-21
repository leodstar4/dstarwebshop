const { cotizar } = require('../lib/skydropx');
const { str, construirPedido, origenPermitido } = require('../lib/validate');
const { catalog } = require('../lib/catalog-store');
const { leerStock } = require('../lib/stock-store');
const { parcel, saveQuote } = require('../lib/quotes');
const { limitar, demasiadas } = require('../lib/rate-limit');
const { reply, body, failure } = require('../lib/http');
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
  if (!origenPermitido(event)) return reply(403, { error: 'Origen no permitido' });
  const retry = await limitar(event, 'cotizar', 20, 600);
  if (retry) return demasiadas(retry);
  try {
    const b = body(event);
    const cliente = { cp: str(b.cp_destino, 5), estado: str(b.estado, 60), ciudad: str(b.ciudad, 80), colonia: str(b.colonia, 80) };
    if (!/^\d{5}$/.test(String(b.cp_destino || '').trim()) || !cliente.estado || !cliente.ciudad || !cliente.colonia) return reply(400, { error: 'Completa CP, estado, ciudad y colonia' });
    const products = await catalog(event);
    const order = construirPedido(b.items, await leerStock(event, products), products);
    if (order.error) return reply(400, { error: order.error });
    const pack = parcel(order.items, products);
    const quote = await cotizar(cliente, pack);
    quote.rates = quote.rates.filter(r => r.currency === 'MXN' && Number.isFinite(r.price) && r.price >= 0);
    await saveQuote(event, quote, cliente, order.items, pack);
    return reply(200, quote);
  } catch (e) { return failure(e); }
};
