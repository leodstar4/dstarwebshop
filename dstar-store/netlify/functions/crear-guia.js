// ============================================
// DSTAR — CREAR GUÍA DE ENVÍO EN SKYDROPX
// ============================================
// Recibe por POST: { cliente, carrier_id, parcel }
// Crea el shipment en Skydropx y devuelve número de rastreo + URL de etiqueta.
//
// Variables de entorno necesarias en Netlify:
//   SKYDROPX_API_KEY   = tu token de Skydropx
//   CP_ORIGEN          = código postal del almacén
//   DIRECCION_ORIGEN   = calle y número de origen
//   TELEFONO_ORIGEN    = teléfono del remitente
//   EMAIL_ORIGEN       = email del remitente
// ============================================

exports.handler = async (event) => {
  // Cabeceras CORS
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
    const { cliente, carrier_id, parcel } = body;

    // Validar datos mínimos necesarios
    if (!cliente || !carrier_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan datos: cliente y carrier_id son requeridos' })
      };
    }

    // Leer variables de entorno del remitente (DSTAR)
    const API_KEY    = process.env.SKYDROPX_API_KEY;
    const CP_ORIGEN  = process.env.CP_ORIGEN;
    const DIR_ORIGEN = process.env.DIRECCION_ORIGEN;
    const TEL_ORIGEN = process.env.TELEFONO_ORIGEN;
    const EMAIL_ORIG = process.env.EMAIL_ORIGEN;

    if (!API_KEY || !CP_ORIGEN) {
      console.error('crear-guia — faltan variables de entorno de Skydropx');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Servicio de envíos no configurado' })
      };
    }

    // Dimensiones del paquete con defaults
    const paquete = {
      weight: parcel?.weight || 0.5,
      height: parcel?.height || 15,
      width:  parcel?.width  || 20,
      length: parcel?.length || 5
    };

    // Construir el shipment para Skydropx
    const shipmentBody = {
      // Dirección de origen — DSTAR Store
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
      // Dirección de destino — datos del cliente
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
      // Datos del paquete
      parcel: paquete,
      // Tarifa seleccionada por el cliente
      carrier_account_id: carrier_id
    };

    // Crear el envío en Skydropx
    const skydropxResponse = await fetch('https://api.skydropx.com/v1/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_KEY}`
      },
      body: JSON.stringify(shipmentBody)
    });

    if (!skydropxResponse.ok) {
      const errText = await skydropxResponse.text();
      console.error('Skydropx error al crear guía:', errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Error al generar la guía de envío' })
      };
    }

    const data = await skydropxResponse.json();

    // Extraer número de rastreo y URL de la etiqueta
    const tracking_number = data.tracking_number || data.data?.attributes?.tracking_number || '';
    const label_url       = data.label_url       || data.data?.attributes?.label_url       || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ tracking_number, label_url })
    };

  } catch (error) {
    console.error('crear-guia — error inesperado:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
