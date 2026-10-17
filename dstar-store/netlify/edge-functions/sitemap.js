import '../../js/products-data.js';

const SITE = 'https://dstarshop.netlify.app';
const PAGES = [
  '/',
  '/terminos.html',
  '/agradecimientos.html',
  '/blog/born-to-shine-detras-del-drop.html',
  '/blog/como-cuidar-tu-ropa.html',
  '/blog/streetwear-mexico-escena.html'
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export default () => {
  const urls = [
    ...PAGES.map((p) => SITE + p),
    ...(globalThis.DSTAR_PRODUCTS || []).map((p) => `${SITE}/producto.html?id=${encodeURIComponent(p.id)}`)
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
};

export const config = { path: '/sitemap.xml' };
