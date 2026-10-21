const { admin, reply, body, failure } = require('../lib/http');
const { catalog, saveProduct } = require('../lib/catalog-store');
const { ajustar, historial, leerStock } = require('../lib/stock-store');
const { open, update } = require('../lib/storage');
const { limitar, demasiadas } = require('../lib/rate-limit');
exports.handler = async event => {
  const retry = await limitar(event, 'admin', 100, 600);
  if (retry) return demasiadas(retry);
  try {
    admin(event);
    const config = open('catalogo', event);
    if (event.httpMethod === 'GET') {
      const products = await catalog(event);
      return reply(200, { products, stock: await leerStock(event, products), inventory: await historial(event), settings: (await config.read('settings'))?.data || {}, health: { payment: Boolean(process.env.MP_ACCESS_TOKEN), webhook: Boolean(process.env.MP_WEBHOOK_SECRET), shipping: Boolean(process.env.SKYDROPX_CLIENT_ID && process.env.SKYDROPX_CLIENT_SECRET), mail: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM || (process.env.SMTP_USER && process.env.SMTP_PASSWORD) || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)), reconciliation: (await open('operacion', event).read('reconcile'))?.data || null } });
    }
    if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
    const b = body(event);
    if (b.action === 'product') await saveProduct(event, b.product);
    else if (b.action === 'stock') {
      const p = (await catalog(event)).find(x => x.id === b.item?.id);
      if (!p?.sizes.includes(b.item?.size) || !/^[a-f0-9-]{36}$/.test(b.operationId || '')) return reply(400, { error: 'Producto, talla u operación inválidos' });
      await ajustar(event, b.item, b.operationId, String(b.note || '').trim().slice(0, 1000));
    } else if (b.action === 'settings') {
      const s = b.settings || {}, clean = {};
      for (const k of ['legalName', 'address', 'phone', 'privacyEmail', 'contactEmail']) clean[k] = String(s[k] || '').trim().slice(0, k === 'address' ? 500 : 160);
      if (clean.privacyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.privacyEmail)) return reply(400, { error: 'Correo inválido' });
      await update(config, 'settings', () => clean);
    } else return reply(400, { error: 'Acción no permitida' });
    return reply(200, { ok: true });
  } catch (e) { return failure(e); }
};
