// Aggregate counters only: no cookies, IPs or per-visitor identifiers are stored.
const { open, update } = require('./storage');
const SHARDS = 4;
const EVENTS = ['view', 'product', 'add', 'checkout', 'pay', 'alert'];
const DEVICES = ['movil', 'tablet', 'escritorio'];
const dia = (ms = Date.now()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(ms);
function bump(map, key, max) {
  if (!(key in map) && Object.keys(map).length >= max) key = 'otros';
  map[key] = (map[key] || 0) + 1;
}
function limpiar(raw, products) {
  const b = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  if (!EVENTS.includes(b.e)) return null;
  const out = { e: b.e };
  if (b.e === 'view') {
    out.path = typeof b.path === 'string' && /^\/[a-z0-9._/-]{0,100}$/.test(b.path) ? b.path : '/otra';
    out.visit = b.visit === true;
    out.source = typeof b.source === 'string' && /^[a-z0-9.-]{1,40}$/.test(b.source) ? b.source : 'directo';
    out.device = DEVICES.includes(b.device) ? b.device : 'escritorio';
  }
  if (b.e === 'product' || b.e === 'add') {
    if (typeof b.id !== 'string' || !products.some(p => p.id === b.id)) return null;
    out.id = b.id;
  }
  return out;
}
function sumar(d, ev) {
  d = d || {};
  const counts = d.counts = d.counts || {};
  counts[ev.e] = (counts[ev.e] || 0) + 1;
  if (ev.e === 'view') {
    bump(d.paths = d.paths || {}, ev.path, 60);
    if (ev.visit) {
      counts.visit = (counts.visit || 0) + 1;
      bump(d.sources = d.sources || {}, ev.source, 40);
      bump(d.devices = d.devices || {}, ev.device, 5);
    }
  }
  if (ev.id) {
    const products = d.products = d.products || {};
    if (!products[ev.id] && Object.keys(products).length >= 200) return d;
    const p = products[ev.id] = products[ev.id] || {};
    p[ev.e] = (p[ev.e] || 0) + 1;
  }
  return d;
}
async function registrar(event, ev) {
  await update(open('analitica', event), dia() + '-' + Math.floor(Math.random() * SHARDS), d => sumar(d, ev));
}
function merge(into, from) {
  for (const [k, v] of Object.entries(from || {})) {
    if (typeof v === 'number') into[k] = (into[k] || 0) + v;
    else merge(into[k] = into[k] || {}, v);
  }
  return into;
}
const top = (map, n) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
async function resumen(event, dias, now = Date.now()) {
  const store = open('analitica', event);
  const fechas = [...new Set(Array.from({ length: dias }, (_, i) => dia(now - i * 86400000)))].reverse();
  const shards = await Promise.all(fechas.map(f => Promise.all(Array.from({ length: SHARDS }, (_, s) => store.read(f + '-' + s)))));
  const total = {};
  const porDia = fechas.map((f, i) => {
    const d = shards[i].reduce((acc, r) => merge(acc, r?.data), {});
    merge(total, d);
    return { dia: f, ...(d.counts || {}) };
  });
  return {
    dias: porDia,
    totales: total.counts || {},
    productos: Object.entries(total.products || {}).map(([id, c]) => ({ id, product: c.product || 0, add: c.add || 0 })).sort((a, b) => b.product - a.product),
    fuentes: top(total.sources || {}, 15),
    dispositivos: top(total.devices || {}, 5),
    paginas: top(total.paths || {}, 15)
  };
}
module.exports = { registrar, resumen, limpiar, sumar, dia, EVENTS };
