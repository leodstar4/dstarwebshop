const { resumen } = require('../lib/analytics');
const { admin, reply, failure } = require('../lib/http');
const { limitar, demasiadas } = require('../lib/rate-limit');
exports.handler = async event => {
  if (event.httpMethod !== 'GET') return reply(405, { error: 'Método no permitido' });
  const retry = await limitar(event, 'panel', 120, 600);
  if (retry) return demasiadas(retry);
  try {
    admin(event);
    const dias = Math.min(90, Math.max(1, parseInt(event.queryStringParameters?.dias, 10) || 14));
    return reply(200, await resumen(event, dias));
  } catch (e) { return failure(e); }
};
