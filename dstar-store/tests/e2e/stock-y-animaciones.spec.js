import { test, expect } from '@playwright/test';
import path from 'path';
import crypto from 'crypto';

const FN_DIR = path.resolve(process.cwd(), 'netlify/functions');
const WEBHOOK_SECRET = 'test-secret';

const webhookEvent = (id) => {
  const ts = '1700000000';
  const v1 = crypto.createHmac('sha256', WEBHOOK_SECRET).update(`id:${id};request-id:req-1;ts:${ts};`).digest('hex');
  return {
    httpMethod: 'POST',
    headers: { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'req-1' },
    body: JSON.stringify({ type: 'payment', data: { id } })
  };
};

const cliente = { nombre: 'Test User', email: 'test@example.com', telefono: '8112345678', calle: 'Calle 1 #2',
  colonia: 'Centro', cp: '64000', ciudad: 'Monterrey', estado: 'Nuevo Leon' };

const pagoAprobado = (stockItems, monto = 500) => ({ status: 'approved', transaction_amount: monto, currency_id: 'MXN',
  metadata: { cliente, rate_id: 'R1', parcel: {}, expected_total: 500, order_items: [], stock_items: stockItems } });

function stubRed({ pagos, skydropxFalla = () => false, onShipment = () => {} }) {
  return async (url) => {
    const u = String(url);
    const pago = Object.keys(pagos).find((id) => u.includes(`api.mercadopago.com/v1/payments/${id}`));
    if (pago) return new Response(JSON.stringify(pagos[pago]), { status: 200 });
    if (u.includes('/oauth/token')) return new Response(JSON.stringify({ access_token: 't', expires_in: 7200 }), { status: 200 });
    if (u.includes('/shipments')) {
      if (skydropxFalla()) return new Response(JSON.stringify({ error: 'caido' }), { status: 500 });
      onShipment();
      return new Response(JSON.stringify({ included: [] }), { status: 201 });
    }
    if (u.includes('/quotations/Q1')) return new Response(JSON.stringify({ rates: [{ id: 'R1', total: '100', provider_display_name: 'DHL' }] }), { status: 200 });
    if (u.includes('api.mercadopago.com/checkout/preferences')) return new Response(JSON.stringify({ id: 'p', init_point: 'x' }), { status: 200 });
    throw new Error('red no permitida: ' + u);
  };
}

async function conRed(stub, fn) {
  const realFetch = global.fetch;
  const realError = console.error;
  const alertas = [];
  console.error = (...a) => { const m = a.join(' '); if (m.includes('ALERTA')) alertas.push(m); };
  global.fetch = stub;
  Object.assign(process.env, { MP_ACCESS_TOKEN: 'TEST', MP_WEBHOOK_SECRET: WEBHOOK_SECRET, URL_SITIO: 'https://example.test',
    SKYDROPX_CLIENT_ID: 'id', SKYDROPX_CLIENT_SECRET: 'secret' });
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
  try {
    await fn(alertas);
  } finally {
    global.fetch = realFetch;
    console.error = realError;
  }
}

const leerStock = async () =>
  JSON.parse((await require(path.join(FN_DIR, 'stock.js')).handler({ httpMethod: 'GET' })).body).stock;
const webhook = (id) => require(path.join(FN_DIR, 'mp-webhook.js')).handler(webhookEvent(id));

test.describe('Stock vivo y alertas (handler directo, sin red)', () => {
  test.beforeEach(() => { test.skip(test.info().project.name !== 'Desktop', 'solo una vez'); });

  test('un pago aprobado descuenta la talla y ya no se puede volver a comprar', async () => {
    await conRed(stubRed({ pagos: { 7001: pagoAprobado([{ id: 'dstar-apnm-ls-01', size: 'M', qty: 1 }]) } }), async () => {
      expect((await leerStock())['dstar-apnm-ls-01'].M).toBe(1);
      await webhook('7001');
      const despues = await leerStock();
      expect(despues['dstar-apnm-ls-01'].M).toBe(0);
      expect(despues['dstar-apnm-ls-01'].S).toBe(1);

      const preference = require(path.join(FN_DIR, 'mp-preference.js')).handler;
      const res = await preference({ httpMethod: 'POST', body: JSON.stringify({
        items: [{ id: 'dstar-apnm-ls-01', size: 'M', qty: 1 }], cliente, quotation_id: 'Q1', rate_id: 'R1'
      }) });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toContain('Sin stock');
    });
  });

  test('si Skydropx falla se avisa una vez y el reintento no descuenta dos veces', async () => {
    let falla = true;
    let guias = 0;
    const stub = stubRed({
      pagos: { 7002: pagoAprobado([{ id: 'dstar-bts-jort-01', size: 'L', qty: 1 }]) },
      skydropxFalla: () => falla,
      onShipment: () => { guias++; }
    });
    await conRed(stub, async (alertas) => {
      expect((await webhook('7002')).statusCode).toBe(500);
      expect((await webhook('7002')).statusCode).toBe(500);
      falla = false;
      expect((await webhook('7002')).statusCode).toBe(200);
      expect(guias).toBe(1);
      expect(alertas.filter((a) => a.includes('No se pudo crear la guía'))).toHaveLength(1);
      expect(alertas.filter((a) => a.includes('Sobreventa'))).toHaveLength(0);
      expect((await leerStock())['dstar-bts-jort-01'].L).toBe(0);
    });
  });

  test('dos pagos por la última pieza generan alerta de sobreventa', async () => {
    const item = [{ id: 'dstar-apnm-ls-02', size: 'L', qty: 1 }];
    await conRed(stubRed({ pagos: { 7003: pagoAprobado(item), 7004: pagoAprobado(item) } }), async (alertas) => {
      await Promise.all([webhook('7003'), webhook('7004')]);
      expect(alertas.filter((a) => a.includes('Sobreventa'))).toHaveLength(1);
    });
  });

  test('un monto distinto avisa a la tienda y no descuenta stock', async () => {
    await conRed(stubRed({ pagos: { 7005: pagoAprobado([{ id: 'dstar-apnm-shirt-01', size: 'S', qty: 1 }], 1) } }), async (alertas) => {
      await webhook('7005');
      expect(alertas.filter((a) => a.includes('no coincide'))).toHaveLength(1);
      expect((await leerStock())['dstar-apnm-shirt-01'].S).toBe(1);
    });
  });
});

test.describe('Contenido visible y animaciones', () => {
  test('sin GSAP los drops, el lookbook y el blog se ven', async ({ page }) => {
    await page.route('**/js/vendor/**', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3500);
    for (const sel of ['.product-card', '.lookbook-panel', '.blog-card', '.faq__item']) {
      const opacities = await page.locator(sel).evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
      expect(opacities.length, sel).toBeGreaterThan(0);
      expect(opacities.every((o) => o === '1'), `${sel}: ${opacities}`).toBe(true);
    }
    await expect(page.locator('.hero__tagline')).toBeVisible();
  });

  test('con animaciones todo termina visible después de recorrer la página', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.__dstarLoaded);
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < alto; y += 350) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(2500);
    const ocultos = await page.evaluate(() => Array.from(document.querySelectorAll(
      '.product-card, .lookbook-panel, .blog-card, .faq__item, .split-char, .about__value > *, .footer__inner > *'
    )).filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).map((e) => e.className));
    expect(ocultos).toEqual([]);
  });

  test('términos enlazados en el footer y junto al botón PAGAR', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer__links a[href="/terminos.html"]')).toHaveCount(1);
    await page.evaluate(() => localStorage.setItem('dstar_cart', JSON.stringify([{ id: 'dstar-bts-shirt-01', size: 'S', qty: 1 }])));
    await page.goto('/checkout.html');
    await expect(page.locator('.terms-note a[href="terminos.html"]')).toBeVisible();
    await page.goto('/terminos.html');
    await expect(page.locator('h1')).toContainText('TÉRMINOS');
  });
});
