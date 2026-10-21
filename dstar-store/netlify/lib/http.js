const { origenPermitido } = require('./validate');
const crypto = require('crypto');
const reply = (statusCode, data) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(data) });
function body(event) {
  if (Buffer.byteLength(event.body || '') > 100000) throw Object.assign(new Error('Solicitud demasiado grande'), { statusCode: 413 });
  try { const value = JSON.parse(event.body || '{}'); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; } catch { throw Object.assign(new Error('JSON inválido'), { statusCode: 400 }); }
}
function admin(event) {
  const pass = process.env.PANEL_PASSWORD || '';
  if (pass.length < 16) throw Object.assign(new Error('Panel no configurado: falta PANEL_PASSWORD (mínimo 16 caracteres) en Netlify'), { statusCode: 503 });
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const hash = x => crypto.createHash('sha256').update(x).digest();
  if (!token || !crypto.timingSafeEqual(hash(token), hash(pass))) throw Object.assign(new Error('Contraseña incorrecta'), { statusCode: 401 });
  if (!origenPermitido(event)) throw Object.assign(new Error('Origen no permitido'), { statusCode: 403 });
}
function failure(e) { console.error(e.message); return reply(e.statusCode || 503, { error: e.statusCode && e.statusCode < 500 ? e.message : 'Servicio temporalmente no disponible. Intenta de nuevo.' }); }
async function request(url, options = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error('Servicio externo respondió ' + res.status), { upstreamStatus: res.status });
  return data;
}
const mp = (path, options = {}) => {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('Mercado Pago no configurado');
  return request('https://api.mercadopago.com' + path, { ...options, headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN, 'Content-Type': 'application/json', ...options.headers } });
};
module.exports = { reply, body, admin, failure, request, mp };
