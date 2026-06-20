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

const SKYDROPX_BASE = 'https://pro.skydropx.com/api/v1';

// Cache del token a nivel de módulo — se reutiliza mientras la instancia esté
// caliente (el token vive 2h). Evita re-autenticar en cada request.
let _tokenCache = { token: null, exp: 0 };

async function getSkydropxToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.exp) return _tokenCache.token;

  // Sanitiza: quita espacios, saltos de línea y comillas accidentales que se
  // cuelan al pegar en el dashboard (causa típica de 401 invalid_client).
  const clean = (v) => (v == null ? '' : String(v).trim().replace(/^["']|["']$/g, ''));
  const client_id = clean(process.env.SKYDROPX_CLIENT_ID);
  const client_secret = clean(process.env.SKYDROPX_CLIENT_SECRET);
  if (!client_id || !client_secret) {
    throw new Error('Skydropx no configurado: faltan SKYDROPX_CLIENT_ID / SKYDROPX_CLIENT_SECRET');
  }

  const res = await fetch(`${SKYDROPX_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id, client_secret, grant_type: 'client_credentials' })
  });

  if (!res.ok) {
    const txt = await res.text();
    // Log completo para diagnóstico (sin exponer el secreto): el error_description
    // de Skydropx suele decir exactamente qué credencial está mal.
    console.error(
      `Skydropx auth falló (${res.status}) — client_id_len=${client_id.length} secret_len=${client_secret.length} body=${txt}`
    );
    throw new Error(`Skydropx auth falló (${res.status}): ${txt}`);
  }

  const data = await res.json();
  _tokenCache = {
    token: data.access_token,
    exp: now + ((data.expires_in || 7200) * 1000) - 60000 // 1 min de margen
  };
  return _tokenCache.token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { cp_destino, estado, ciudad, colonia, peso, alto, ancho, largo } = body;

    // La API Pro EXIGE estado/municipio/colonia además del CP
    if (!cp_destino || !estado || !ciudad || !colonia) {
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
          length: Math.round(largo || 20),
          width: Math.round(ancho || 20),
          height: Math.round(alto || 10),
          weight: peso || 0.5
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
