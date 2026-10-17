// ============================================
// DSTAR — COTIZAR ENVÍO CON SKYDROPX PRO (API v2 / OAuth2)
// ============================================
// Recibe por POST: { cp_destino, estado, ciudad, colonia, peso, alto, ancho, largo }
// Autentica vía OAuth2 (client_credentials), crea una cotización y devuelve
// las tarifas normalizadas (con rate_id para generar la guía después).
//
// Variables de entorno necesarias en Netlify:
//   SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET = credenciales OAuth de Skydropx Pro
//   CP_ORIGEN, ORIGEN_ESTADO, ORIGEN_MUNICIPIO, ORIGEN_COLONIA = dirección del almacén
// ============================================

const { cotizar } = require('../lib/skydropx');
const { str, origenPermitido } = require('../lib/validate');
const { limitar, demasiadas } = require('../lib/rate-limit');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }
  if (!origenPermitido(event)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origen no permitido' }) };
  }
  const retry = await limitar(event, 'cotizar', 20, 600);
  if (retry) return demasiadas(retry);

  try {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
    const cp_destino = str(body.cp_destino, 5);
    const estado = str(body.estado, 60);
    const ciudad = str(body.ciudad, 80);
    const colonia = str(body.colonia, 80);
    const clamp = (v, min, max, def) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
    };
    const peso = clamp(body.peso, 0.1, 10, 0.5);
    const alto = clamp(body.alto, 1, 60, 10);
    const ancho = clamp(body.ancho, 1, 60, 20);
    const largo = clamp(body.largo, 1, 60, 20);

    if (!/^\d{5}$/.test(cp_destino) || !estado || !ciudad || !colonia) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan datos de destino: CP, estado, ciudad y colonia' })
      };
    }

    let cotizacion;
    try {
      cotizacion = await cotizar(
        { cp: cp_destino, estado, ciudad, colonia },
        { length: Math.round(largo), width: Math.round(ancho), height: Math.round(alto), weight: peso }
      );
    } catch (err) {
      if (err.config) {
        console.error('cotizar-envio —', err.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Servicio de envíos no configurado' }) };
      }
      console.error('Skydropx quotation error:', err.message);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Error al cotizar el envío' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(cotizacion) };

  } catch (error) {
    console.error('cotizar-envio — error inesperado:', error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
