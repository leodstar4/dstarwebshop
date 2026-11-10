const { validar, suscribir, baja } = require('../lib/avisos');
const { catalog } = require('../lib/catalog-store');
const { reply, body, failure } = require('../lib/http');
const { origenPermitido } = require('../lib/validate');
const { limitar, demasiadas } = require('../lib/rate-limit');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pagina = (titulo, contenido) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' },
  body: '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>Avisos — DSTAR</title><link rel="stylesheet" href="/css/operacion.css?v=2"></head><body><main class="ops"><a class="ops__back" href="/">DSTAR / VOLVER A LA TIENDA</a><p class="ops__eyebrow">AVISOS</p><h1 class="ops__title">' + titulo + '</h1>' + contenido + '</main></body></html>'
});
exports.handler = async event => {
  const q = event.queryStringParameters || {};
  if (event.httpMethod === 'GET' && q.baja) {
    return pagina('¿DEJAR DE RECIBIR AVISOS?', '<form method="post" action="/api/avisame"><input type="hidden" name="baja" value="' + esc(q.baja) + '"><input type="hidden" name="t" value="' + esc(q.t) + '"><p>Ya no te escribiremos sobre este aviso.</p><button class="ops__btn" type="submit">CONFIRMAR BAJA</button></form>');
  }
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
  const retry = await limitar(event, 'avisame', 10, 600);
  if (retry) return demasiadas(retry);
  try {
    if (!origenPermitido(event)) return reply(403, { error: 'Origen no permitido' });
    if (/application\/x-www-form-urlencoded/.test(event.headers?.['content-type'] || '')) {
      const f = new URLSearchParams(event.body || '');
      const ok = await baja(event, f.get('baja'), f.get('t'));
      return pagina(ok ? 'LISTO' : 'ENLACE INVÁLIDO', ok ? '<p>Ya no recibirás este aviso. Puedes volver a pedirlo cuando quieras.</p>' : '<p>El enlace no es válido o ya caducó. Escríbenos si sigues recibiendo correos.</p>');
    }
    const b = body(event);
    if (b.website) return reply(200, { ok: true });
    const { aviso, error } = validar(b, b.tipo === 'talla' ? await catalog(event) : []);
    if (error) return reply(400, { error });
    await suscribir(event, aviso);
    return reply(200, { ok: true });
  } catch (e) { return failure(e); }
};
