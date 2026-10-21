import '../../js/products-data.js';

const SITE = 'https://dstar4.party';
const PAGES = [
  '/',
  '/terminos.html',
  '/privacidad.html',
  '/agradecimientos.html',
  '/blog/born-to-shine-detras-del-drop.html',
  '/blog/como-cuidar-tu-ropa.html',
  '/blog/streetwear-mexico-escena.html'
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export default async (request) => {
  let products = globalThis.DSTAR_PRODUCTS || [];
  if (request) try { const r = await fetch(new URL('/api/catalogo', request.url), { signal: AbortSignal.timeout(3000) }); if (r.ok) { const data = await r.json(); if (Array.isArray(data.products)) products = data.products; } } catch {}
  const urls = [
    ...PAGES.map((p) => SITE + p),
    ...products.filter(p => p.active !== false).map((p) => `${SITE}/producto.html?id=${encodeURIComponent(p.id)}`)
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
};

export const config = { path: '/sitemap.xml' };
