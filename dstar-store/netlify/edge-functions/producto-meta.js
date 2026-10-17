import '../../js/products-data.js';

const SITE = 'https://dstarshop.netlify.app';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ogImage = (src) => src.replace('/image/upload/', '/image/upload/f_jpg,q_auto,c_pad,b_auto,w_1200,h_630/');
const setMeta = (html, attr, name, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*`), `$1${esc(value)}`);

function jsonLd(p, url, image) {
  const stock = p.sizesStock ? Object.values(p.sizesStock).reduce((a, b) => a + b, 0) : p.stock;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: [image],
    brand: { '@type': 'Brand', name: 'DSTAR' },
    sku: p.id,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'MXN',
      price: p.price,
      availability: p.badge === 'SOLDOUT' || !stock ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export default async (request, context) => {
  const id = new URL(request.url).searchParams.get('id');
  const p = id && (globalThis.DSTAR_PRODUCTS || []).find((x) => x.id === id);
  const response = await context.next();
  if (!p || response.status !== 200 || !(response.headers.get('content-type') || '').includes('text/html')) return response;

  const title = `${p.name} — DSTAR`;
  const description = `${p.description} $${p.price} MXN.`;
  const url = `${SITE}/producto.html?id=${encodeURIComponent(p.id)}`;
  const image = ogImage(p.image);

  let html = await response.text();
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*/, `$1${esc(url)}`);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:alt', p.name);
  html = html.replace(
    '<meta name="twitter:card"',
    `<meta property="product:price:amount" content="${p.price}">\n  <meta property="product:price:currency" content="MXN">\n  ${jsonLd(p, url, image)}\n  <meta name="twitter:card"`
  );

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('etag');
  return new Response(html, { status: 200, headers });
};

export const config = { path: ['/producto.html', '/producto'] };
