// ============================================
// DSTAR — CREAR PREFERENCIA DE MERCADO PAGO
// ============================================
// Esta función crea una preferencia de pago en Mercado Pago
// y devuelve el link de pago para redirigir al cliente.
//
// Variables de entorno necesarias en Netlify:
//   MERCADOPAGO_ACCESS_TOKEN = tu access token de producción
//   SITE_URL = https://tu-sitio.netlify.app
// ============================================

const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { items } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No items in cart' })
      };
    }

    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const SITE_URL = process.env.SITE_URL || 'https://dstar.netlify.app';

    if (!ACCESS_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Mercado Pago not configured' })
      };
    }

    // Crear preferencia de pago
    const preference = {
      items: items.map(item => ({
        title: item.title,
        unit_price: item.unit_price,
        quantity: item.quantity,
        currency_id: 'MXN'
      })),
      back_urls: {
        success: `${SITE_URL}/gracias.html`,
        failure: `${SITE_URL}/error-pago.html`,
        pending: `${SITE_URL}/pago-pendiente.html`
      },
      auto_return: 'approved',
      // Recoger dirección de envío en Mercado Pago
      shipments: {
        mode: 'not_specified',
        cost: 0,    // Ajusta el costo de envío o calcula dinámicamente
        receiver_address: {}
      },
      // Datos extra
      statement_descriptor: 'DSTAR',
      external_reference: `dstar_${Date.now()}`
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MercadoPago error:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create payment preference' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: data.id,
        init_point: data.init_point,           // URL de pago en producción
        sandbox_init_point: data.sandbox_init_point  // URL de pago en sandbox (testing)
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
