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
    name: [rate.provider_display_name || rate.provider_name, rate.provider_service_name].filter(Boolean).join(' ')
  };
}

module.exports = { SKYDROPX_BASE, getSkydropxToken, getRatePrice };
