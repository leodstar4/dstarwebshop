// ============================================
// DSTAR — CREAR PREFERENCIA DE MERCADO PAGO
// (con soporte de envío y metadata de Skydropx)
// ============================================
// Recibe por POST: { items, cliente, carrier_id, parcel, total }
// Crea la preferencia en MercadoPago y guarda en metadata los datos
// necesarios para generar la guía de envío automáticamente en el webhook.
//
// Variables de entorno necesarias en Netlify:
//   MP_ACCESS_TOKEN = tu access token de MercadoPago
//   URL_SITIO       = https://tu-sitio.netlify.app
// ============================================

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, cliente, carrier_id, parcel, total } = body;

    // Validar datos mínimos
    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'El carrito está vacío' })
      };
    }
    if (!cliente || !carrier_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan datos del cliente o del envío' })
      };
    }

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    const URL_SITIO = process.env.URL_SITIO || 'https://dstar.netlify.app';

    if (!MP_TOKEN) {
      console.error('mp-preference — falta MP_ACCESS_TOKEN');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Pagos no configurados' })
      };
    }

    // Mapear los items del carrito al formato de MercadoPago
    const mpItems = items.map(item => ({
      title:      item.title      || `${item.name} — Talla ${item.size}`,
      unit_price: item.unit_price || item.price,
      quantity:   item.quantity   || item.qty,
      currency_id: 'MXN'
    }));

    // Construir la preferencia de pago
    const preference = {
      items: mpItems,

      // Datos del pagador
      payer: {
        name:  cliente.nombre   || '',
        email: cliente.email    || '',
        phone: { number: cliente.telefono || '' }
      },

      // Metadatos — se usan en el webhook para generar la guía automáticamente
      metadata: {
        cliente,
        carrier_id,
        parcel: parcel || { weight: 0.5, height: 15, width: 20, length: 5 }
      },

      // URLs de retorno después del pago
      back_urls: {
        success: `${URL_SITIO}/gracias.html`,
        failure: `${URL_SITIO}/checkout.html`,
        pending: `${URL_SITIO}/checkout.html`
      },
      auto_return: 'approved',

      // URL para recibir el webhook de pago aprobado
      notification_url: `${URL_SITIO}/.netlify/functions/mp-webhook`,

      // Referencia interna
      statement_descriptor: 'DSTAR',
      external_reference:   `dstar_${Date.now()}`
    };

    // Crear la preferencia en MercadoPago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    if (!mpResponse.ok) {
      const errData = await mpResponse.text();
      console.error('MercadoPago error al crear preferencia:', errData);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Error al crear la preferencia de pago' })
      };
    }

    const mpData = await mpResponse.json();

    // Devolver el link de pago al frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id:                 mpData.id,
        init_point:         mpData.init_point,          // URL de producción
        sandbox_init_point: mpData.sandbox_init_point   // URL de pruebas
      })
    };

  } catch (error) {
    console.error('mp-preference — error inesperado:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
