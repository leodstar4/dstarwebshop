const { catalog } = require('../lib/catalog-store');
const { leerStock } = require('../lib/stock-store');
const { reply, failure } = require('../lib/http');
exports.handler = async event => {
  if (event.httpMethod !== 'GET') return reply(405, { error: 'Método no permitido' });
  try {
    const products = await catalog(event);
    const stock = await leerStock(event, products);
    return reply(200, { products: products.filter(p => p.active !== false).map(p => ({ ...p, sizesStock: stock[p.id], stock: Object.values(stock[p.id]).reduce((a, b) => a + b, 0) })) });
  } catch (e) { return failure(e); }
};
