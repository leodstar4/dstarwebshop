// ============================================
// DSTAR — PANEL DE PEDIDOS (solo lectura)
// ============================================
// GET con header Authorization: Bearer <PANEL_PASSWORD>. Devuelve los pedidos
// guardados por mp-webhook en Netlify Blobs, del más reciente al más viejo.
//
// Variables de entorno: PANEL_PASSWORD (mínimo 16 caracteres)
// ============================================

const crypto = require('crypto');
const { openStore } = require('../lib/orders-store');
const { limitar, demasiadas } = require('../lib/rate-limit');

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
const digest = (v) => crypto.createHash('sha256').update(String(v)).digest();

function autorizado(event, password) {
  const h = event.headers || {};
  const auth = String(h.authorization || h.Authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token.length > 0 && crypto.timingSafeEqual(digest(token), digest(password));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return reply(405, { error: 'Método no permitido' });
  const retry = await limitar(event, 'panel', 30, 600);
  if (retry) return demasiadas(retry);

  const password = process.env.PANEL_PASSWORD || '';
  if (password.length < 16) return reply(503, { error: 'Panel no configurado: falta PANEL_PASSWORD (mínimo 16 caracteres) en Netlify' });
  if (!autorizado(event, password)) return reply(401, { error: 'Contraseña incorrecta' });

  try {
    const pedidos = await openStore(event).list();
    pedidos.sort((a, b) => (b.at || 0) - (a.at || 0));
    return reply(200, { pedidos });
  } catch (error) {
    console.error('pedidos — error al leer:', error.message);
    return reply(500, { error: 'No se pudieron leer los pedidos' });
  }
};
