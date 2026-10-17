/**
 * DSTAR — Precalienta en Cloudinary todas las variantes que pide la web
 *
 * Las fotos originales pesan ~24 MP; la primera vez que alguien pide un tamaño
 * nuevo Cloudinary tarda 1-2 s en generarlo. Este script los pide todos una vez
 * para que los clientes siempre reciban la versión ya generada (~100 ms).
 *
 * USO (después de agregar o cambiar fotos en products-data.js):
 *   node scripts/calentar-cloudinary.js
 *
 * Los tamaños deben coincidir con PD_WIDTHS / PD_LB_WIDTHS / renderProducts de app.js.
 */

const PRODUCTS = require('../dstar-store/js/products-data.js');

const GALLERY_WIDTHS = [600, 900, 1200, 1600, 2400];
const THUMB_WIDTHS = [150, 300];
const CARD_WIDTHS = [400, 600, 900];
const CONCURRENCY = 4;

const withTransform = (url, t) => url.replace('/image/upload/', `/image/upload/${t}/`);

function urlsFor(p) {
  const urls = [];
  for (const w of CARD_WIDTHS) urls.push(withTransform(p.image, `f_avif,q_auto,dpr_auto,w_${w},c_limit`));
  urls.push(withTransform(p.image, 'f_jpg,q_auto,c_pad,b_auto,w_1200,h_630'));
  for (const src of p.gallery || []) {
    for (const w of GALLERY_WIDTHS) urls.push(withTransform(src, `f_avif,q_auto,dpr_auto,w_${w}`));
    for (const w of THUMB_WIDTHS) urls.push(withTransform(src, `f_avif,q_auto,dpr_auto,w_${w}`));
    urls.push(withTransform(src, 'f_avif,q_auto,dpr_auto,e_blur:200,w_48'));
  }
  return urls;
}

async function warm(url) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers: { accept: 'image/avif,image/webp,*/*' } });
    await res.arrayBuffer();
    return { url, status: res.status, ms: Date.now() - t0 };
  } catch (err) {
    return { url, status: 0, ms: Date.now() - t0, error: err.message };
  }
}

async function main() {
  const queue = PRODUCTS.flatMap(urlsFor);
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const r = await warm(queue[next++]);
      results.push(r);
      const name = r.url.split('/upload/')[1];
      console.log(`${r.status === 200 ? '✓' : '✗'} ${String(r.ms).padStart(5)} ms  ${name}${r.error ? `  (${r.error})` : ''}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const failed = results.filter((r) => r.status !== 200);
  const slow = results.filter((r) => r.ms > 700).length;
  console.log(`\n${results.length} variantes · ${slow} se generaron en frío (>700 ms) · ${failed.length} fallaron`);
  if (failed.length) process.exitCode = 1;
}

main();
