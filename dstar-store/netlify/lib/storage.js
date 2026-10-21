// Strong reads + conditional writes. Memory is explicit and test-only.
const { connectLambda, getStore } = require('@netlify/blobs');
const stores = new Map();
const clone = v => v == null ? null : JSON.parse(JSON.stringify(v));
function open(name, event) {
  if (process.env.DSTAR_MEMORY_STORE === 'true' && process.env.NODE_ENV === 'test' && !process.env.NETLIFY) {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      read: async key => clone(m.get(key)),
      write: async (key, data, etag) => {
        const old = m.get(key);
        if ((old?.etag || null) !== (etag || null)) return false;
        m.set(key, { data: clone(data), etag: String(Number(old?.etag || 0) + 1) });
        return true;
      },
      list: async () => [...m].map(([id, v]) => ({ ...clone(v.data), id }))
    };
  }
  if (event?.blobs) connectLambda(event);
  const suffix = process.env.CONTEXT && process.env.CONTEXT !== 'production' && process.env.NETLIFY_DEV !== 'true'
    ? '-' + (process.env.DEPLOY_ID || process.env.CONTEXT) : '';
  const s = getStore({ name: name + suffix, consistency: 'strong' });
  return {
    read: key => s.getWithMetadata(key, { type: 'json', consistency: 'strong' }),
    write: async (key, data, etag) => (await s.setJSON(key, data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true })).modified,
    list: async () => {
      const entries = [];
      for await (const page of s.list({ paginate: true })) {
        for (const b of page.blobs) {
          const data = await s.get(b.key, { type: 'json', consistency: 'strong' });
          if (data) entries.push({ ...data, id: b.key });
        }
      }
      return entries;
    }
  };
}
async function update(store, key, fn) {
  for (let i = 0; i < 12; i++) {
    const old = await store.read(key);
    if (old && !old.etag) throw new Error('El almacén no devolvió etag; no se puede escribir con seguridad');
    const result = fn(clone(old?.data));
    if (result === undefined) return old?.data || null;
    if (await store.write(key, result, old?.etag)) return result;
    await new Promise(r => setTimeout(r, Math.random() * 40 * (i + 1)));
  }
  throw Object.assign(new Error('El registro cambió; intenta de nuevo.'), { statusCode: 409 });
}
function resetForTests() {
  if(process.env.NODE_ENV !== 'test' || process.env.DSTAR_MEMORY_STORE !== 'true' || process.env.NETLIFY) throw new Error('Solo pruebas');
  stores.clear();
}
module.exports = { open, update, resetForTests };
