const { registrar, limpiar } = require('../lib/analytics');
const { catalog } = require('../lib/catalog-store');
const { limitar } = require('../lib/rate-limit');
const { origenPermitido } = require('../lib/validate');
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|curl|wget|python|node-fetch/i;
const done = { statusCode: 204, headers: { 'Cache-Control': 'no-store' } };
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Método no permitido' }) };
  const ua = event.headers?.['user-agent'] || '';
  if (!ua || BOT.test(ua) || !origenPermitido(event) || (event.body || '').length > 1000) return done;
  let raw;
  try { raw = JSON.parse(event.body || '{}'); } catch { return done; }
  try {
    const ev = limpiar(raw, ['product', 'add'].includes(raw?.e) ? await catalog(event) : []);
    if (!ev || await limitar(event, 'evento', 300, 600)) return done;
    await registrar(event, ev);
  } catch (e) { console.error('evento:', e.message); }
  return done;
};
