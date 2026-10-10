const memory = new Map();

function openStore(event) {
  try {
    const { connectLambda, getStore } = require('@netlify/blobs');
    if (event && event.blobs) connectLambda(event);
    const store = getStore('pedidos');
    return {
      get: (key) => store.get(key, { type: 'json' }),
      set: (key, value) => store.setJSON(key, value)
    };
  } catch (err) {
    if (process.env.NETLIFY && process.env.CONTEXT) {
      console.error('orders-store — Netlify Blobs no disponible, usando memoria:', err.message);
    }
    return {
      get: async (key) => memory.get(key) || null,
      set: async (key, value) => { memory.set(key, value); }
    };
  }
}

module.exports = { openStore };
