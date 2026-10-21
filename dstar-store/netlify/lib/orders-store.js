const { open, update } = require('./storage');
function openStore(event) {
  const store = open('pedidos', event);
  return {
    get: async key => (await store.read(key))?.data || null,
    set: (key, value) => update(store, key, () => value),
    update: (key, fn) => update(store, key, fn),
    list: () => store.list(),
    claim: async (key, staleMs, owner) => {
      let claimed = false;
      await update(store, key, prev => {
        claimed = false;
        if (prev?.lock && prev.lock.until > Date.now()) return undefined;
        claimed = true;
        return { ...prev, lock: { owner, until: Date.now() + staleMs } };
      });
      return claimed;
    },
    release: (key, owner) => update(store, key, prev => prev?.lock?.owner === owner ? { ...prev, lock: null } : undefined)
  };
}
module.exports = { openStore };
