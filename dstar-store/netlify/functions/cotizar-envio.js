// ============================================
// DSTAR — COTIZAR ENVÍO CON SKYDROPX
// ============================================
// Recibe por POST: { cp_destino, peso, alto, ancho, largo }
// Consulta la API de Skydropx y regresa las tarifas disponibles.
//
// Variables de entorno necesarias en Netlify:
//   SKYDROPX_API_KEY  = tu token de Skydropx
//   CP_ORIGEN         = código postal del almacén (ej. 50000)
// ============================================

exports.handler = async (event) => {
  // Cabeceras CORS — permiten que el frontend llame esta función
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Manejar preflight de CORS (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    // Parsear el cuerpo de la solicitud
    const body = JSON.parse(event.body || '{}');
    const { cp_destino, peso, alto, ancho, largo } = body;

    // Validar que venga el CP destino
    if (!cp_destino) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'cp_destino es requerido' })
      };
    }

    // Leer variables de entorno
    const API_KEY   = process.env.SKYDROPX_API_KEY;
    const CP_ORIGEN = process.env.CP_ORIGEN;

    if (!API_KEY || !CP_ORIGEN) {
      console.error('Skydropx no está configurado — faltan variables de entorno');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Servicio de envíos no configurado' })
      };
    }

    // Construir el objeto del paquete con defaults si no vienen valores
    const parcel = {
      weight: peso  || 0.5,   // kg
      height: alto  || 15,    // cm
      width:  ancho || 20,    // cm
      length: largo || 5      // cm
    };

    // Llamar a la API de Skydropx para cotizar
    const skydropxResponse = await fetch('https://api.skydropx.com/v1/quotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_KEY}`
      },
      body: JSON.stringify({
        zip_from: CP_ORIGEN,
        zip_to:   cp_destino,
        parcel
      })
    });

    // Manejar errores de Skydropx
    if (!skydropxResponse.ok) {
      const errText = await skydropxResponse.text();
      console.error('Skydropx error al cotizar:', errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Error al obtener tarifas de envío' })
      };
    }

    const data = await skydropxResponse.json();

    // Devolver las tarifas al frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ rates: data.rates || [] })
    };

  } catch (error) {
    console.error('cotizar-envio — error inesperado:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
