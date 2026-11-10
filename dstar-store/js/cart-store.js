(function (root) {
  const KEY = 'dstar_cart';
  const CATALOG_KEY = 'dstar_catalog';
  if (!root.DSTAR_PRODUCTS) root.DSTAR_PRODUCTS = [];
  const validCatalog = (list) => Array.isArray(list) && list.every((p) => p && typeof p.id === 'string' && Array.isArray(p.sizes));
  const replaceCatalog = (list) => root.DSTAR_PRODUCTS.splice(0, root.DSTAR_PRODUCTS.length, ...list);
  try {
    const cached = JSON.parse(localStorage.getItem(CATALOG_KEY));
    if (validCatalog(cached?.products) && cached.products.length) replaceCatalog(cached.products);
  } catch {}

  let confirmed = false;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  if (controller) setTimeout(() => controller.abort(), 5000);
  const remote = Promise.resolve()
    .then(() => fetch('/api/catalogo', { cache: 'no-store', signal: controller ? controller.signal : undefined }))
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!validCatalog(data?.products)) return;
      confirmed = true;
      try {
        localStorage.setItem(CATALOG_KEY, JSON.stringify({ at: Date.now(), products: data.products }));
      } catch {}
      if (JSON.stringify(data.products) === JSON.stringify(root.DSTAR_PRODUCTS)) return;
      replaceCatalog(data.products);
      root.dispatchEvent(new CustomEvent('dstar:catalog'));
    })
    .catch(() => {});
  root.DSTAR_CATALOG_READY = Promise.race([remote, new Promise((resolve) => setTimeout(resolve, 5000))]);

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
      if (!product || product.active === false || !product.sizes.includes(item.size)) continue;
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
    let next = cart;
    if (!confirmed) {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY));
        const known = new Set(catalog().map((p) => p.id));
        if (Array.isArray(raw)) next = cart.concat(raw.filter((i) => i && typeof i.id === 'string' && !known.has(i.id)));
      } catch {}
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
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
