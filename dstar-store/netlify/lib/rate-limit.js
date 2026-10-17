// Límite de peticiones por IP con ventana fija. Sin IP (llamadas internas o
// pruebas) no limita. La IP se guarda como hash, nunca en claro.
const crypto = require('crypto');

const memoria = new Map();

function abrir(event) {
  try {
    const { connectLambda, getStore } = require('@netlify/blobs');
    if (event && event.blobs) connectLambda(event);
    const store = getStore('limites');
    return {
      leer: (key) => store.get(key, { type: 'json' }),
      escribir: (key, value) => store.setJSON(key, value)
    };
  } catch {
    return {
      leer: async (key) => memoria.get(key) || null,
      escribir: async (key, value) => { memoria.set(key, value); }
    };
  }
}

function ipDe(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || h['client-ip'] || '';
}

// Devuelve los segundos que faltan para poder reintentar, o 0 si la petición pasa.
async function limitar(event, nombre, max, ventanaSeg) {
  const ip = ipDe(event);
  if (!ip) return 0;
  const key = `${nombre}-${crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32)}`;
  const ventana = Math.floor(Date.now() / (ventanaSeg * 1000));
  try {
    const store = abrir(event);
    const previo = await store.leer(key);
    const n = previo && previo.ventana === ventana ? previo.n + 1 : 1;
    if (n > max) return Math.max(1, Math.ceil((ventana + 1) * ventanaSeg - Date.now() / 1000));
    await store.escribir(key, { ventana, n });
  } catch {
    return 0;
  }
  return 0;
}

function demasiadas(retry) {
  return {
    statusCode: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retry), 'Cache-Control': 'no-store' },
    body: JSON.stringify({ error: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.' })
  };
}

module.exports = { limitar, demasiadas };
