const memory = new Map();

const disponible = (previo, staleMs) =>
  !previo || previo.status === 'failed' || (previo.status === 'processing' && Date.now() - previo.at >= staleMs);

function openStore(event) {
  try {
    const { connectLambda, getStore } = require('@netlify/blobs');
    if (event && event.blobs) connectLambda(event);
    const store = getStore('pedidos');
    return {
      get: (key) => store.get(key, { type: 'json' }),
      set: (key, value) => store.setJSON(key, value),
      claim: async (key, staleMs) => {
        const actual = await store.getWithMetadata(key, { type: 'json' });
        const valor = { status: 'processing', at: Date.now() };
        if (!actual) return (await store.setJSON(key, valor, { onlyIfNew: true })).modified;
        if (!disponible(actual.data, staleMs)) return false;
        return (await store.setJSON(key, valor, { onlyIfMatch: actual.etag })).modified;
      }
    };
  } catch (err) {
    if (process.env.NETLIFY && process.env.CONTEXT) {
      console.error('orders-store — Netlify Blobs no disponible, usando memoria:', err.message);
    }
    return {
      get: async (key) => memory.get(key) || null,
      set: async (key, value) => { memory.set(key, value); },
      claim: async (key, staleMs) => {
        if (!disponible(memory.get(key), staleMs)) return false;
        memory.set(key, { status: 'processing', at: Date.now() });
        return true;
      }
    };
  }
}

module.exports = { openStore };
