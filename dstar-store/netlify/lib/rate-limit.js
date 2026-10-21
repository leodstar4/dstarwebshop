const crypto = require('crypto');
const { open, update } = require('./storage');
async function limitar(event, nombre, max, ventanaSeg) {
  const h = event?.headers || {};
  const ip = h['x-nf-client-connection-ip'] || h['client-ip'];
  if (!ip) return 0;
  const key = nombre + '-' + crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
  const ventana = Math.floor(Date.now() / (ventanaSeg * 1000));
  let limited = false;
  try {
    await update(open('limites', event), key, prev => {
      const n = prev?.ventana === ventana ? prev.n : 0;
      limited = n >= max;
      return { ventana, n: limited ? n : n + 1 };
    });
  } catch { return 60; }
  return limited ? Math.max(1, Math.ceil((ventana + 1) * ventanaSeg - Date.now() / 1000)) : 0;
}
const demasiadas = retry => ({ statusCode: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retry), 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'Demasiados intentos o servicio temporalmente ocupado. Intenta más tarde.' }) });
module.exports = { limitar, demasiadas };
