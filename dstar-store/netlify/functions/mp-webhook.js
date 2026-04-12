// ============================================
// DSTAR — WEBHOOK DE MERCADO PAGO
// ============================================
// Recibe notificaciones de MercadoPago cuando un pago cambia de estado.
// Si el pago es aprobado, genera automáticamente la guía de envío con Skydropx.
//
// Configurar esta URL en MercadoPago como notification_url:
//   https://tu-sitio.netlify.app/.netlify/functions/mp-webhook
//
// Variables de entorno necesarias:
//   MP_ACCESS_TOKEN   = Bearer token de MercadoPago
//   SKYDROPX_API_KEY  = token de Skydropx
//   CP_ORIGEN, DIRECCION_ORIGEN, TELEFONO_ORIGEN, EMAIL_ORIGEN
// ============================================

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // MercadoPago puede enviar GET para verificar el endpoint
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  // Solo procesar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // MercadoPago envía type y data.id en la notificación
    const { type, data } = body;

    // Solo procesar notificaciones de tipo "payment"
    if (type !== 'payment') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, skipped: `tipo ignorado: ${type}` })
      };
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Falta data.id en el webhook' })
      };
    }

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      console.error('mp-webhook — falta MP_ACCESS_TOKEN');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'MP no configurado' }) };
    }

    // Consultar los detalles del pago a la API de MercadoPago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('Error consultando pago MP:', errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No se pudo consultar el pago' })
      };
    }

    const payment = await mpResponse.json();

    // Solo continuar si el pago está aprobado
    if (payment.status !== 'approved') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, skipped: `estado ignorado: ${payment.status}` })
      };
    }

    // Extraer los metadatos del pago (guardados al crear la preferencia)
    const { cliente, carrier_id, parcel } = payment.metadata || {};

    if (!cliente || !carrier_id) {
      console.error('mp-webhook — metadata incompleta:', payment.metadata);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, skipped: 'metadata de envío incompleta' })
      };
    }

    // Generar la guía de envío llamando a la lógica de Skydropx directamente
    const guiaResult = await crearGuiaSkydropx({ cliente, carrier_id, parcel });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        tracking_number: guiaResult.tracking_number,
        label_url:       guiaResult.label_url
      })
    };

  } catch (error) {
    console.error('mp-webhook — error inesperado:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};

// ============================================
// LÓGICA DE SKYDROPX (interna — no expuesta)
// Duplicada aquí para no depender de imports
// entre funciones de Netlify.
// ============================================
async function crearGuiaSkydropx({ cliente, carrier_id, parcel }) {
  const API_KEY    = process.env.SKYDROPX_API_KEY;
  const CP_ORIGEN  = process.env.CP_ORIGEN;
  const DIR_ORIGEN = process.env.DIRECCION_ORIGEN;
  const TEL_ORIGEN = process.env.TELEFONO_ORIGEN;
  const EMAIL_ORIG = process.env.EMAIL_ORIGEN;

  if (!API_KEY || !CP_ORIGEN) {
    throw new Error('Skydropx no está configurado');
  }

  const paquete = {
    weight: parcel?.weight || 0.5,
    height: parcel?.height || 15,
    width:  parcel?.width  || 20,
    length: parcel?.length || 5
  };

  const shipmentBody = {
    address_from: {
      name:     'DSTAR Store',
      company:  'DSTAR',
      address1: DIR_ORIGEN || '',
      zip:      CP_ORIGEN,
      city:     'Toluca',
      province: 'Estado de México',
      country:  'MX',
      phone:    TEL_ORIGEN || '',
      email:    EMAIL_ORIG || ''
    },
    address_to: {
      name:     cliente.nombre   || '',
      address1: cliente.calle    || '',
      address2: cliente.colonia  || '',
      zip:      cliente.cp       || '',
      city:     cliente.ciudad   || '',
      province: cliente.estado   || '',
      country:  'MX',
      phone:    cliente.telefono || '',
      email:    cliente.email    || ''
    },
    parcel:             paquete,
    carrier_account_id: carrier_id
  };

  const response = await fetch('https://api.skydropx.com/v1/shipments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${API_KEY}`
    },
    body: JSON.stringify(shipmentBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Skydropx error: ${errText}`);
  }

  const data = await response.json();

  return {
    tracking_number: data.tracking_number || data.data?.attributes?.tracking_number || '',
    label_url:       data.label_url       || data.data?.attributes?.label_url       || ''
  };
}
