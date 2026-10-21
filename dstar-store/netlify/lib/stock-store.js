const PRODUCTS = require('../../js/products-data');
const { open, update } = require('./storage');
const KEY = 'vendidas';
const stockBase = (p, size) => p?.sizesStock ? (p.sizesStock[size] || 0) : (p?.stock || 0);
const key = i => i.id + '|' + i.size;
function migrate(old, products = PRODUCTS) {
  if (old?.version === 2) return old;
  const next = { version: 2, units: {}, reservations: {}, sales: {}, movements: [] };
  for (const p of products) for (const size of p.sizes) {
    const legacy = old?.[p.id]?.[size];
    next.units[p.id + '|' + size] = legacy ? Math.max(0, legacy.base - legacy.sold) : stockBase(p, size);
  }
  next.movements.push({ at: Date.now(), type: 'migration', note: 'Inventario inicial; historial anterior conservado', legacy: old || {} });
  return next;
}
function held(s, k, except) {
  return Object.entries(s.reservations).reduce((n, [id, r]) => n + (id !== except && r.until > Date.now() ? r.items.filter(i => key(i) === k).reduce((sum, i) => sum + i.qty, 0) : 0), 0);
}
const DAY = 86400000, MAX_MOVEMENTS = 2000;
function prune(s) {
  const now = Date.now();
  for (const [id, r] of Object.entries(s.reservations)) if (r.until < now - DAY) delete s.reservations[id];
  for (const [id, sale] of Object.entries(s.sales)) if (sale.at < now - 200 * DAY) delete s.sales[id];
  if (s.movements.length > MAX_MOVEMENTS) {
    const first = s.movements[0]?.type === 'migration' ? [s.movements[0]] : [];
    s.movements = [...first, ...s.movements.slice(first.length - MAX_MOVEMENTS)];
  }
  return s;
}
async function ledger(event, fn, products) {
  return update(open('stock', event), KEY, old => prune(fn(migrate(old, products))));
}
async function leerStock(event, products = PRODUCTS, except) {
  const existing = (await open('stock', event).read(KEY))?.data;
  const s = existing?.version === 2 ? existing : await ledger(event, state => state, products);
  return Object.fromEntries(products.map(p => [p.id, Object.fromEntries(p.sizes.map(size => {
    const k = p.id + '|' + size;
    return [size, p.badge === 'SOLDOUT' || p.active === false ? 0 : Math.max(0, (s.units[k] || 0) - held(s, k, except))];
  }))]));
}
async function reservar(event, id, items, until, products = PRODUCTS) {
  await ledger(event, s => {
    if (s.reservations[id]) {
      if (JSON.stringify(s.reservations[id].items) !== JSON.stringify(items)) throw new Error('Reserva incompatible');
      if (s.reservations[id].until > Date.now()) { s.reservations[id].until = Math.max(s.reservations[id].until, until); return s; }
      delete s.reservations[id];
    }
    for (const i of items) if ((s.units[key(i)] || 0) - held(s, key(i)) < i.qty)
      throw Object.assign(new Error('Sin stock suficiente; actualiza tu carrito.'), { statusCode: 409 });
    s.reservations[id] = { items, until };
    return s;
  }, products);
}
async function liberar(event, id) {
  await ledger(event, s => { delete s.reservations[id]; return s; });
}
async function descontar(event, items, paymentId, reservationId) {
  if (!paymentId) throw new Error('El descuento requiere un pago único');
  let shortages = [];
  await ledger(event, s => {
    shortages = [];
    if (s.sales[paymentId]) { shortages = s.sales[paymentId].shortages || []; return s; }
    if (!Array.isArray(items) || !items.length || new Set(items.map(key)).size !== items.length) throw new Error('Pago sin artículos válidos de inventario');
    for (const i of items) {
      if (!Number.isInteger(i.qty) || i.qty < 1 || !Object.hasOwn(s.units, key(i))) throw new Error('Artículo de inventario inválido');
      const available = (s.units[key(i)] || 0) - held(s, key(i), reservationId);
      if (available < i.qty) shortages.push({ ...i, name: i.id, faltan: i.qty - Math.max(0, available) });
    }
    if (!shortages.length) for (const i of items) s.units[key(i)] -= i.qty;
    if (reservationId) delete s.reservations[reservationId];
    s.sales[paymentId] = { at: Date.now(), items, deducted: !shortages.length, returned: {}, shortages };
    s.movements.push({ at: Date.now(), type: shortages.length ? 'shortage' : 'sale', id: paymentId, items });
    return s;
  });
  return shortages;
}
async function ajustar(event, item, operationId, note) {
  if (!Number.isInteger(item.delta) || Math.abs(item.delta) > 10000 || !note) throw new Error('Indica cantidad entera y motivo');
  return ledger(event, s => {
    const previous = s.movements.find(m => m.id === operationId);
    if (previous) {
      if (JSON.stringify(previous.item) !== JSON.stringify(item) || previous.note !== note) throw Object.assign(new Error('No cambies los datos de un reintento; abre una nueva operación.'), { statusCode: 409 });
      return s;
    }
    const k = key(item), value = (s.units[k] || 0) + item.delta;
    if (value < held(s, k) || value < 0) throw new Error('El ajuste invade piezas reservadas');
    s.units[k] = value;
    s.movements.push({ at: Date.now(), type: 'adjustment', id: operationId, item, note });
    return s;
  });
}
async function historial(event) { return migrate((await open('stock', event).read(KEY))?.data); }
module.exports = { leerStock, descontar, reservar, liberar, ajustar, historial, stockBase, migrate, prune };
