const SKYDROPX_BASE = 'https://pro.skydropx.com/api/v1';

let tokenCache = { token: null, exp: 0 };

const clean = (v) => (v == null ? '' : String(v).trim().replace(/^["']|["']$/g, ''));

async function getSkydropxToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.exp) return tokenCache.token;

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
    const txt = (await res.text()).slice(0, 300);
    console.error(`Skydropx auth falló (${res.status}) — client_id_len=${client_id.length} secret_len=${client_secret.length} body=${txt}`);
    throw new Error(`Skydropx auth falló (${res.status})`);
  }

  const data = await res.json();
  tokenCache = { token: data.access_token, exp: now + ((data.expires_in || 7200) * 1000) - 60000 };
  return tokenCache.token;
}

async function getRatePrice(quotationId, rateId) {
  const token = await getSkydropxToken();
  const res = await fetch(`${SKYDROPX_BASE}/quotations/${encodeURIComponent(quotationId)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Skydropx quotation ${res.status}`);
  const data = await res.json().catch(() => ({}));
  const rate = (data.rates || []).find((r) => r && String(r.id) === String(rateId) && r.success !== false);
  if (!rate) return null;
  const price = parseFloat(rate.total);
  if (!Number.isFinite(price) || price < 0) return null;
  return {
    price,
    name: [rate.provider_display_name || rate.provider_name, rate.provider_service_name].filter(Boolean).join(' '),
    carrier: rate.provider_display_name || rate.provider_name || '',
    service: rate.provider_service_name || ''
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Crea una cotización y espera a que Skydropx complete las tarifas.
// destino: { cp, estado, ciudad, colonia }; parcel: { length, width, height, weight }
async function cotizar(destino, parcel) {
  const { CP_ORIGEN, ORIGEN_ESTADO, ORIGEN_MUNICIPIO, ORIGEN_COLONIA } = process.env;
  if (!CP_ORIGEN || !ORIGEN_ESTADO || !ORIGEN_MUNICIPIO || !ORIGEN_COLONIA) {
    const err = new Error('faltan variables de origen (CP_ORIGEN/ORIGEN_*)');
    err.config = true;
    throw err;
  }
  const token = await getSkydropxToken();
  const res = await fetch(`${SKYDROPX_BASE}/quotations`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quotation: {
        address_from: { country_code: 'MX', postal_code: String(CP_ORIGEN), area_level1: ORIGEN_ESTADO, area_level2: ORIGEN_MUNICIPIO, area_level3: ORIGEN_COLONIA },
        address_to: { country_code: 'MX', postal_code: String(destino.cp), area_level1: destino.estado, area_level2: destino.ciudad, area_level3: destino.colonia },
        parcels: [parcel]
      }
    })
  });
  let data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Skydropx quotation ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);

  const qid = data.id;
  let rates = data.rates || [];
  for (let attempts = 0; !data.is_completed && qid && attempts < 6; attempts++) {
    await sleep(800);
    const g = await fetch(`${SKYDROPX_BASE}/quotations/${qid}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (g.ok) {
      data = await g.json().catch(() => data);
      rates = data.rates || rates;
    }
  }

  const normalizadas = (rates || [])
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
  return { quotation_id: qid, rates: normalizadas };
}

module.exports = { SKYDROPX_BASE, getSkydropxToken, getRatePrice, cotizar };
