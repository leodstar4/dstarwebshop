const { activos, quitar, notificarTalla } = require('../lib/avisos');
const { catalog } = require('../lib/catalog-store');
const { leerStock } = require('../lib/stock-store');
const { admin, reply, body, failure } = require('../lib/http');
const { limitar, demasiadas } = require('../lib/rate-limit');
exports.handler = async event => {
  if (!['GET', 'POST'].includes(event.httpMethod)) return reply(405, { error: 'Método no permitido' });
  const retry = await limitar(event, 'panel', 120, 600);
  if (retry) return demasiadas(retry);
  try {
    admin(event);
    if (event.httpMethod === 'GET') {
      const avisos = (await activos(event)).map(({ token, ...a }) => a).sort((a, b) => b.at - a.at);
      return reply(200, { avisos });
    }
    const b = body(event);
    if (b.action === 'remove') {
      await quitar(event, b.id);
      return reply(200, { ok: true });
    }
    if (b.action !== 'notify') return reply(400, { error: 'Acción no permitida' });
    const products = await catalog(event);
    const product = products.find(p => p.id === b.productId);
    if (!product || !product.sizes.includes(b.size)) return reply(400, { error: 'Producto o talla inválidos' });
    if (!((await leerStock(event, products))[product.id]?.[b.size] > 0)) return reply(409, { error: 'Esa talla no tiene existencias; ajusta el inventario antes de avisar.' });
    return reply(200, await notificarTalla(event, product, b.size));
  } catch (e) { return failure(e); }
};
