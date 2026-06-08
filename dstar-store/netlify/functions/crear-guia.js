// ============================================
// DSTAR — CREAR GUÍA DE ENVÍO EN SKYDROPX PRO (API v2 / OAuth2)
// ============================================
// Recibe por POST: { cliente, rate_id, parcel, total }
// Crea el shipment en Skydropx Pro y devuelve tracking + URL de etiqueta.
//
// Variables de entorno necesarias en Netlify:
//   SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET
//   DIRECCION_ORIGEN, TELEFONO_ORIGEN, EMAIL_ORIGEN
//   (opcionales) NOMBRE_ORIGEN, EMPRESA_ORIGEN, REFERENCIA_ORIGEN,
//                SKYDROPX_CONSIGNMENT_NOTE, SKYDROPX_PACKAGE_TYPE
// ============================================

const SKYDROPX_BASE = 'https://pro.skydropx.com/api/v1';

let _tokenCache = { token: null, exp: 0 };

async function getSkydropxToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.exp) return _tokenCache.token;

  const client_id = process.env.SKYDROPX_CLIENT_ID;
  const client_secret = process.env.SKYDROPX_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    throw new Error('Skydropx no configurado: faltan SKYDROPX_CLIENT_ID / SKYDROPX_CLIENT_SECRET');
  }

  const res = await fetch(`${SKYDROPX_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id, client_secret, grant_type: 'client_credentials' })
  });
  if (!res.ok) throw new Error(`Skydropx auth falló (${res.status})`);

  const data = await res.json();
  _tokenCache = { token: data.access_token, exp: now + ((data.expires_in || 7200) * 1000) - 60000 };
  return _tokenCache.token;
}

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
    const { cliente, rate_id, parcel, total } = body;

    if (!cliente || !rate_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan datos: cliente y rate_id son requeridos' })
      };
    }

    const token = await getSkydropxToken();

    const shipmentBody = {
      shipment: {
        rate_id,
        address_from: {
          street1: process.env.DIRECCION_ORIGEN || '',
          name: process.env.NOMBRE_ORIGEN || 'DSTAR Store',
          company: process.env.EMPRESA_ORIGEN || 'DSTAR',
          phone: process.env.TELEFONO_ORIGEN || '',
          email: process.env.EMAIL_ORIGEN || '',
          reference: process.env.REFERENCIA_ORIGEN || 'Almacén DSTAR'
        },
        address_to: {
          street1: [cliente.calle, cliente.colonia].filter(Boolean).join(', '),
          name: cliente.nombre || '',
          company: cliente.nombre || '-',
          phone: cliente.telefono || '',
          email: cliente.email || '',
          reference: cliente.referencia || 'Sin referencia'
        },
        packages: [{
          package_number: '1',
          package_protected: false,
          declared_value: Math.round(total || (parcel && parcel.declared_value) || 1000),
          consignment_note: process.env.SKYDROPX_CONSIGNMENT_NOTE || '53102400',
          package_type: process.env.SKYDROPX_PACKAGE_TYPE || '4G'
        }]
      }
    };

    const skydropxResponse = await fetch(`${SKYDROPX_BASE}/shipments/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(shipmentBody)
    });

    const data = await skydropxResponse.json().catch(() => ({}));
    if (!skydropxResponse.ok) {
      console.error('Skydropx error al crear guía:', skydropxResponse.status, JSON.stringify(data).slice(0, 300));
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Error al generar la guía de envío' }) };
    }

    // Respuesta JSON:API — tracking/label viven en included[].attributes
    const pkg = (data.included || []).find(
      (i) => i && i.attributes && (i.attributes.tracking_number || i.attributes.label_url)
    );
    const attrs = pkg ? pkg.attributes : {};

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        tracking_number: attrs.tracking_number
          || (data.data && data.data.attributes && data.data.attributes.master_tracking_number)
          || '',
        label_url: attrs.label_url || '',
        tracking_url: attrs.tracking_url_provider || ''
      })
    };

  } catch (error) {
    console.error('crear-guia — error inesperado:', error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
