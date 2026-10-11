const PRODUCTS = require('../../js/products-data.js');

const MAX_QTY = 10;

const str = (v, max) => (typeof v === 'string' ? v.trim().replace(/[\r\n\t]+/g, ' ').slice(0, max) : '');

function origenPermitido(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin;
  if (!origin) return true;
  let host;
  try { host = new URL(origin).host; } catch { return false; }
  const permitidos = [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL, process.env.URL_SITIO]
    .filter(Boolean)
    .map((u) => { try { return new URL(u).host; } catch { return ''; } });
  permitidos.push(h.host || h.Host, h['x-forwarded-host']);
  return permitidos.includes(host);
}

function validarCliente(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const cliente = {
    nombre: str(c.nombre, 80),
    email: str(c.email, 254).toLowerCase(),
    telefono: str(c.telefono, 20).replace(/\D/g, ''),
    calle: str(c.calle, 120),
    colonia: str(c.colonia, 80),
    cp: str(c.cp, 5),
    ciudad: str(c.ciudad, 80),
    estado: str(c.estado, 60),
    referencia: str(c.referencia, 120)
  };
  const errores = [];
  if (cliente.nombre.length < 2) errores.push('nombre');
  if (!/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(cliente.email)) errores.push('email');
  if (!/^\d{10}$/.test(cliente.telefono)) errores.push('telefono');
  if (cliente.calle.length < 3) errores.push('calle');
  if (!cliente.colonia) errores.push('colonia');
  if (!/^\d{5}$/.test(cliente.cp)) errores.push('cp');
  if (!cliente.ciudad) errores.push('ciudad');
  if (!cliente.estado) errores.push('estado');
  return { cliente, errores };
}

function construirPedido(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) {
    return { error: 'El carrito está vacío o es inválido' };
  }
  const lineas = new Map();
  for (const it of rawItems) {
    const id = it && typeof it.id === 'string' ? it.id : '';
    const size = it && typeof it.size === 'string' ? it.size : '';
    const qty = it ? it.qty : undefined;
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return { error: 'Producto no disponible' };
    if (!product.sizes.includes(size)) return { error: `Talla no disponible para ${product.name}` };
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { error: 'Cantidad inválida' };
    const key = `${id}|${size}`;
    const linea = lineas.get(key) || { product, size, qty: 0 };
    linea.qty += qty;
    lineas.set(key, linea);
  }
  const items = [];
  let subtotal = 0;
  for (const { product, size, qty } of lineas.values()) {
    const disponible = product.sizesStock ? (product.sizesStock[size] || 0) : product.stock;
    if (product.badge === 'SOLDOUT' || qty > disponible) {
      return { error: `Sin stock suficiente de ${product.name} talla ${size}` };
    }
    items.push({ id: product.id, title: `${product.name} — Talla ${size}`, unit_price: product.price, quantity: qty, currency_id: 'MXN' });
    subtotal += product.price * qty;
  }
  return { items, subtotal };
}

module.exports = { validarCliente, construirPedido, origenPermitido, str };
