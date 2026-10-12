(function (root) {
  const KEY = 'dstar_cart';

  function catalog() {
    return root.DSTAR_PRODUCTS || [];
  }

  function stockFor(product, size) {
    if (!product) return 0;
    if (product.badge === 'SOLDOUT') return 0;
    return product.sizesStock ? (product.sizesStock[size] || 0) : (product.stock || 0);
  }

  function load() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(KEY));
    } catch {
      raw = null;
    }
    if (!Array.isArray(raw)) return [];
    const products = catalog();
    const merged = new Map();
    for (const item of raw) {
      if (!item || typeof item.id !== 'string' || typeof item.size !== 'string') continue;
      const product = products.find((p) => p.id === item.id);
      if (!product || !product.sizes.includes(item.size)) continue;
      const key = `${item.id}|${item.size}`;
      const qty = (merged.get(key)?.qty || 0) + (Number.isInteger(item.qty) && item.qty > 0 ? item.qty : 1);
      merged.set(key, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: item.size,
        qty: Math.min(qty, stockFor(product, item.size))
      });
    }
    return [...merged.values()].filter((i) => i.qty > 0);
  }

  function save(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch {}
  }

  let syncing = null;
  function syncStock() {
    if (syncing) return syncing;
    if (!/^https?:$/.test(location.protocol) || typeof fetch !== 'function') return Promise.resolve(false);
    syncing = fetch('/api/stock', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const live = json && json.stock;
        if (!live || typeof live !== 'object') return false;
        let changed = false;
        for (const p of catalog()) {
          const sizes = live[p.id];
          if (!sizes || !p.sizesStock) continue;
          for (const size of p.sizes) {
            const n = sizes[size];
            if (Number.isInteger(n) && n !== p.sizesStock[size]) {
              p.sizesStock[size] = n;
              changed = true;
            }
          }
          p.stock = p.sizes.reduce((sum, s) => sum + (p.sizesStock[s] || 0), 0);
        }
        if (changed) root.dispatchEvent(new CustomEvent('dstar:stock'));
        return changed;
      })
      .catch(() => false);
    return syncing;
  }

  root.DSTAR_CART = { load, save, stockFor, syncStock };
})(window);
