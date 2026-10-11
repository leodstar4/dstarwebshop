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

const { SKYDROPX_BASE, getSkydropxToken } = require('../lib/skydropx');
const { str, origenPermitido } = require('../lib/validate');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }
  if (!origenPermitido(event)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origen no permitido' }) };
  }

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

    const CP_ORIGEN = process.env.CP_ORIGEN;
    const ORIGEN_ESTADO = process.env.ORIGEN_ESTADO;
    const ORIGEN_MUNICIPIO = process.env.ORIGEN_MUNICIPIO;
    const ORIGEN_COLONIA = process.env.ORIGEN_COLONIA;

    if (!CP_ORIGEN || !ORIGEN_ESTADO || !ORIGEN_MUNICIPIO || !ORIGEN_COLONIA) {
      console.error('cotizar-envio — faltan variables de origen (CP_ORIGEN/ORIGEN_*)');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Servicio de envíos no configurado' }) };
    }

    const token = await getSkydropxToken();

    const quotationBody = {
      quotation: {
        address_from: {
          country_code: 'MX',
          postal_code: String(CP_ORIGEN),
          area_level1: ORIGEN_ESTADO,
          area_level2: ORIGEN_MUNICIPIO,
          area_level3: ORIGEN_COLONIA
        },
        address_to: {
          country_code: 'MX',
          postal_code: String(cp_destino),
          area_level1: estado,
          area_level2: ciudad,
          area_level3: colonia
        },
        parcels: [{
          length: Math.round(largo),
          width: Math.round(ancho),
          height: Math.round(alto),
          weight: peso
        }]
      }
    };

    const res = await fetch(`${SKYDROPX_BASE}/quotations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(quotationBody)
    });

    let data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Skydropx quotation error:', res.status, JSON.stringify(data).slice(0, 300));
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Error al cotizar el envío' }) };
    }

    // Las tarifas se completan de forma progresiva — si no está completa,
    // hacemos polling al GET /quotations/:id hasta que termine.
    const qid = data.id;
    let rates = data.rates || [];
    let attempts = 0;
    while (!data.is_completed && qid && attempts < 6) {
      await sleep(800);
      const g = await fetch(`${SKYDROPX_BASE}/quotations/${qid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (g.ok) {
        data = await g.json().catch(() => data);
        rates = data.rates || rates;
      }
      attempts++;
    }

    // Normalizar: solo tarifas exitosas con precio válido, ordenadas por precio
    const normalized = (rates || [])
      .filter((r) => r && r.success !== false && r.total != null)
      .map((r) => ({
        rate_id: r.id,
        carrier: r.provider_display_name || r.provider_name || 'Paquetería',
        service: r.provider_service_name || '',
        price: parseFloat(r.total),
        currency: r.currency_code || 'MXN',
        days: r.days
      }))
      .filter((r) => !isNaN(r.price))
      .sort((a, b) => a.price - b.price);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ quotation_id: qid, rates: normalized })
    };

  } catch (error) {
    console.error('cotizar-envio — error inesperado:', error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
