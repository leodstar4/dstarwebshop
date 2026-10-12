// Stock vivo: products-data.js define cuántas piezas hay; aquí se guarda cuántas
// se han vendido desde ese número. Si cambias el stock de una talla en
// products-data.js, su contador de vendidas vuelve a 0.
const PRODUCTS = require('../../js/products-data.js');

const KEY = 'vendidas';
const INTENTOS = 6;
let memoria = { data: {}, etag: '0' };

function stockBase(product, size) {
  if (!product || product.badge === 'SOLDOUT') return 0;
  return product.sizesStock ? (product.sizesStock[size] || 0) : (product.stock || 0);
}

function vendidas(registro, product, size) {
  const r = registro && registro[product.id] && registro[product.id][size];
  return r && r.base === stockBase(product, size) ? r.sold : 0;
}

function calcular(registro) {
  const stock = {};
  for (const p of PRODUCTS) {
    stock[p.id] = {};
    for (const size of p.sizes) {
      stock[p.id][size] = Math.max(0, stockBase(p, size) - vendidas(registro, p, size));
    }
  }
  return stock;
}

function abrir(event) {
  try {
    const { connectLambda, getStore } = require('@netlify/blobs');
    if (event && event.blobs) connectLambda(event);
    const store = getStore('stock');
    return {
      leer: async () => {
        const r = await store.getWithMetadata(KEY, { type: 'json' });
        return r ? { data: r.data || {}, etag: r.etag } : null;
      },
      escribir: async (data, etag) => {
        const opts = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
        return (await store.setJSON(KEY, data, opts)).modified;
      }
    };
  } catch (err) {
    if (process.env.NETLIFY && process.env.CONTEXT) {
      console.error('stock-store — Netlify Blobs no disponible, usando memoria:', err.message);
    }
    return {
      leer: async () => ({ data: JSON.parse(JSON.stringify(memoria.data)), etag: memoria.etag }),
      escribir: async (data, etag) => {
        if (etag && etag !== memoria.etag) return false;
        memoria = { data, etag: String(Number(memoria.etag) + 1) };
        return true;
      }
    };
  }
}

async function leerStock(event) {
  const actual = await abrir(event).leer();
  return calcular(actual ? actual.data : {});
}

// Descuenta las piezas de un pedido. Devuelve las líneas que quedaron en
// negativo (sobreventa: dos personas pagaron la última pieza al mismo tiempo).
async function descontar(event, items) {
  const store = abrir(event);
  const lineas = (Array.isArray(items) ? items : [])
    .map((i) => ({ product: PRODUCTS.find((p) => p.id === i.id), size: String(i.size || ''), qty: Number(i.qty) || 0 }))
    .filter((l) => l.product && l.product.sizes.includes(l.size) && l.qty > 0);
  if (!lineas.length) return [];

  for (let intento = 0; intento < INTENTOS; intento++) {
    const actual = await store.leer();
    const data = actual ? actual.data : {};
    const sobreventa = [];
    for (const { product, size, qty } of lineas) {
      const base = stockBase(product, size);
      const sold = vendidas(data, product, size) + qty;
      data[product.id] = data[product.id] || {};
      data[product.id][size] = { base, sold };
      if (sold > base) sobreventa.push({ id: product.id, name: product.name, size, faltan: sold - base });
    }
    if (await store.escribir(data, actual && actual.etag)) return sobreventa;
  }
  throw new Error('No se pudo descontar el stock después de varios intentos');
}

module.exports = { leerStock, descontar, stockBase };
