const { open, update } = require('./storage');
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
const destination = c => [c.cp, c.estado, c.ciudad, c.colonia].map(normalize).join('|');
const cartKey = items => items.map(i => `${i.id}|${i.size}|${i.qty || i.quantity}`).sort().join(';');
function parcel(items, products) {
  let weight = 0, height = 0, length = 0, width = 0;
  for (const i of items) {
    const p = products.find(x => x.id === i.id);
    const qty = i.qty || i.quantity;
    weight += (p.weight || 0.4) * qty;
    height += (p.height || 3) * qty;
    length = Math.max(length, p.length || 30); width = Math.max(width, p.width || 25);
  }
  if (weight > 10 || height > 60) throw Object.assign(new Error('Este pedido requiere una cotización especial. Contáctanos.'), { statusCode: 400 });
  return { weight: Math.ceil((weight + 0.1) * 100 - 1e-9) / 100, height: Math.ceil(height + 2), length, width };
}
async function saveQuote(event, quote, cliente, items, parcelData) {
  if (!quote.quotation_id) throw new Error('Cotización incompleta');
  const value = { ...quote, destination: destination(cliente), cart: cartKey(items), parcel: parcelData, expires: Date.now() + 15 * 60000 };
  await update(open('cotizaciones', event), String(quote.quotation_id), () => value);
  return value;
}
async function verifyQuote(event, quotationId, rateId, cliente, items) {
  const q = (await open('cotizaciones', event).read(quotationId))?.data;
  const rate = q?.rates.find(r => String(r.rate_id) === rateId);
  if (!q || q.expires < Date.now() || q.destination !== destination(cliente) || q.cart !== cartKey(items) || !rate || rate.currency !== 'MXN')
    throw Object.assign(new Error('La cotización no corresponde a tu dirección o carrito, o venció. Vuelve a cotizar.'), { statusCode: 400 });
  return { quote: q, rate };
}
module.exports = { parcel, saveQuote, verifyQuote, cartKey, destination };
