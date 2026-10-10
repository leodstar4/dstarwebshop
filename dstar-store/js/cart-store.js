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

  root.DSTAR_CART = { load, save, stockFor };
})(window);
