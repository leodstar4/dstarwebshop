const base = require('../../js/products-data');
const { open, update } = require('./storage');
const { str } = require('./validate');
async function catalog(event) {
  const value = (await open('catalogo', event).read('products'))?.data;
  return value?.products || base;
}
function cleanProduct(raw) {
  const p = { id: str(raw.id, 80), name: str(raw.name, 100), drop: str(raw.drop, 100), description: str(raw.description, 2000), price: Number(raw.price), image: str(raw.image, 1000), active: raw.active !== false };
  if (!/^[a-z0-9-]+$/.test(p.id) || !p.name || !p.drop || !Number.isFinite(p.price) || p.price < 1 || p.price > 100000) throw new Error('Producto inválido');
  p.price = Math.round(p.price * 100) / 100;
  const photo = u => { try { const x = new URL(u); return x.protocol === 'https:' && x.hostname === 'res.cloudinary.com'; } catch { return false; } };
  if (!photo(p.image)) throw new Error('Usa una imagen HTTPS de Cloudinary');
  p.gallery = (Array.isArray(raw.gallery) ? raw.gallery : [p.image]).slice(0, 12).map(u => str(u, 1000));
  if (!p.gallery.length) p.gallery = [p.image];
  if (!p.gallery.every(photo)) throw new Error('Galería inválida');
  p.sizes = [...new Set((Array.isArray(raw.sizes) ? raw.sizes : []).map(s => str(s, 12)))];
  if (!p.sizes.length || p.sizes.length > 20 || p.sizes.some(s => !/^[A-Za-z0-9 -]+$/.test(s))) throw new Error('Tallas inválidas');
  p.badge = ['LIMITED', 'NEW', 'SOLDOUT'].includes(raw.badge) ? raw.badge : null;
  p.sizesStock = Object.fromEntries(p.sizes.map(s => [s, 0]));
  p.stock = 0; // New products enter stock through a recorded adjustment only.
  p.material = str(raw.material, 500); p.care = str(raw.care, 500); p.fit = str(raw.fit, 500);
  p.measurements = str(raw.measurements, 3000);
  p.weight = Number(raw.weight || 0.4);
  p.length = Number(raw.length || 30); p.width = Number(raw.width || 25); p.height = Number(raw.height || 3);
  if (![p.weight, p.length, p.width, p.height].every(n => Number.isFinite(n) && n > 0) || p.weight > 10 || Math.max(p.length, p.width, p.height) > 100) throw new Error('Peso o medidas inválidos');
  return p;
}
async function saveProduct(event, raw) {
  const p = cleanProduct(raw);
  const seeded = await catalog(event);
  return update(open('catalogo', event), 'products', old => {
    const products = old?.products || seeded;
    const existing = products.find(x => x.id === p.id);
    if (existing) { p.sizesStock = existing.sizesStock; p.stock = existing.stock; }
    return { products: [...products.filter(x => x.id !== p.id), p], updatedAt: Date.now() };
  });
}
module.exports = { catalog, saveProduct, cleanProduct };
