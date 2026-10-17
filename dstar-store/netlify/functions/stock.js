const { leerStock } = require('../lib/stock-store');
const { limitar, demasiadas } = require('../lib/rate-limit');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Método no permitido' }) };
  }
  const retry = await limitar(event, 'stock', 120, 600);
  if (retry) return demasiadas(retry);
  try {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
      body: JSON.stringify({ stock: await leerStock(event) })
    };
  } catch (error) {
    console.error('stock — error al leer:', error.message);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No disponible' }) };
  }
};
