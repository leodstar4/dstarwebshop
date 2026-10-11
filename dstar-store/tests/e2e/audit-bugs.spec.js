import { test, expect } from '@playwright/test';
import path from 'path';
import crypto from 'crypto';

const FN_DIR = path.resolve(process.cwd(), 'netlify/functions');
const WEBHOOK_SECRET = 'test-secret';

const webhookEvent = (id, secret = WEBHOOK_SECRET) => {
  const ts = '1700000000';
  const v1 = crypto.createHmac('sha256', secret).update(`id:${id};request-id:req-1;ts:${ts};`).digest('hex');
  return {
    httpMethod: 'POST',
    headers: { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'req-1' },
    body: JSON.stringify({ type: 'payment', data: { id } })
  };
};

const PRODUCT_URL = '/producto.html?id=dstar-bts-shirt-01';

const seedCart = [{
  id: 'dstar-bts-shirt-01', name: 'BORN TO SHINE', price: 450,
  image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_blwlew.webp',
  size: 'S', qty: 1
}];

async function seed(page, value) {
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem('__seeded')) {
      localStorage.setItem('dstar_cart', v);
      sessionStorage.setItem('__seeded', '1');
    }
  }, value);
}

async function fillCheckout(page, cp = '64000') {
  await page.fill('#nombre', 'Test User');
  await page.fill('#email', 'test@example.com');
  await page.fill('#telefono', '8112345678');
  await page.fill('#calle', 'Calle 1 #2');
  await page.fill('#colonia', 'Centro');
  await page.fill('#ciudad', 'Monterrey');
  await page.fill('#estado', 'Nuevo Leon');
  await page.fill('#cp', cp);
  await page.locator('#cp').blur();
}

test.describe('AUDIT — storage corrupto', () => {
  for (const [label, raw] of [['JSON inválido', '{roto'], ['null', 'null'], ['objeto', '{"a":1}']]) {
    test(`home con dstar_cart=${label} sigue funcionando`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await seed(page, raw);
      await page.goto('/');
      await page.waitForTimeout(800);
      expect(errors, errors.join('\n')).toEqual([]);
    });

    test(`checkout con dstar_cart=${label} sigue funcionando`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await seed(page, raw);
      await page.goto('/checkout.html');
      await page.waitForTimeout(500);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }
});

test.describe('AUDIT — stock por talla', () => {
  test('no se puede agregar más piezas que sizesStock (S = 1)', async ({ page }) => {
    await seed(page, '[]');
    await page.goto(PRODUCT_URL);
    await page.locator('#pdSizes .size-btn[data-size="S"]').click();
    await page.locator('#pdAddBtn').click();
    await page.locator('#cartClose').click();
    await page.locator('#pdAddBtn').click();
    const qty = await page.evaluate(() => JSON.parse(localStorage.getItem('dstar_cart'))[0].qty);
    expect(qty).toBeLessThanOrEqual(1);
  });
});

test.describe('AUDIT — checkout', () => {
  test('respuesta tardía de cotización (CP viejo) pisa la del CP nuevo', async ({ page }) => {
    await seed(page, JSON.stringify(seedCart));
    await page.route('**/.netlify/functions/cotizar-envio', async (route) => {
      const body = JSON.parse(route.request().postData());
      if (body.cp_destino === '01000') {
        await new Promise((r) => setTimeout(r, 1500));
        return route.fulfill({ json: { rates: [{ rate_id: 'RATE_CP_01000', carrier: 'VIEJO', service: 'x', price: 99, days: 3 }] } });
      }
      return route.fulfill({ json: { rates: [{ rate_id: 'RATE_CP_64000', carrier: 'NUEVO', service: 'y', price: 150, days: 2 }] } });
    });
    let prefBody = null;
    await page.route('**/.netlify/functions/mp-preference', (route) => {
      prefBody = JSON.parse(route.request().postData());
      return route.fulfill({ json: { init_point: '/error-pago.html' } });
    });
    await page.goto('/checkout.html');
    await fillCheckout(page, '01000');
    await page.fill('#cp', '64000');
    await page.locator('#cp').blur();
    await page.waitForTimeout(2000);
    await page.locator('input[name="tarifa"]').first().check();
    await page.locator('#btnPagar').click();
    await page.waitForURL('**/error-pago.html');
    expect(prefBody.cliente.cp).toBe('64000');
    expect(prefBody.rate_id).toBe('RATE_CP_64000');
  });

  test('cambiar CP a uno inválido deja la tarifa anterior seleccionada', async ({ page }) => {
    await seed(page, JSON.stringify(seedCart));
    await page.route('**/.netlify/functions/cotizar-envio', (route) =>
      route.fulfill({ json: { rates: [{ rate_id: 'R1', carrier: 'DHL', service: 'x', price: 120, days: 1 }] } }));
    await page.goto('/checkout.html');
    await fillCheckout(page, '64000');
    await page.locator('input[name="tarifa"]').first().check();
    await page.fill('#cp', '6400');
    await page.locator('#cp').blur();
    await expect(page.locator('#envioDisplay')).toHaveText('--');
  });

  test('etiqueta de días: 1 día debe decir "1 DÍA"', async ({ page }) => {
    await seed(page, JSON.stringify(seedCart));
    await page.route('**/.netlify/functions/cotizar-envio', (route) =>
      route.fulfill({ json: { rates: [{ rate_id: 'R1', carrier: 'DHL', service: 'x', price: 120, days: 1 }] } }));
    await page.goto('/checkout.html');
    await fillCheckout(page);
    await expect(page.locator('.tarifa-detalle').first()).not.toContainText('1 DÍAS');
  });

  test('volver desde Mercado Pago (bfcache) deja el botón PAGAR usable', async ({ page, browserName }) => {
    await seed(page, JSON.stringify(seedCart));
    await page.route('**/.netlify/functions/cotizar-envio', (route) =>
      route.fulfill({ json: { rates: [{ rate_id: 'R1', carrier: 'DHL', service: 'x', price: 120, days: 2 }] } }));
    await page.route('**/.netlify/functions/mp-preference', (route) =>
      route.fulfill({ json: { init_point: '/error-pago.html' } }));
    await page.goto('/checkout.html');
    await page.evaluate(() => window.addEventListener('pageshow', (e) => { window.__persisted = e.persisted; }));
    await fillCheckout(page);
    await page.locator('input[name="tarifa"]').first().check();
    await page.locator('#btnPagar').click();
    await page.waitForURL('**/error-pago.html');
    await page.goBack();
    await page.waitForTimeout(500);
    const persisted = await page.evaluate(() => window.__persisted === true);
    test.skip(!persisted, `bfcache no restauró la página en ${browserName}; el bug sólo se manifiesta con bfcache`);
    await expect(page.locator('#btnPagar')).toBeEnabled();
  });
});

test.describe('AUDIT — errores JS por página', () => {
  const pages = ['/', PRODUCT_URL, '/checkout.html', '/gracias.html', '/error-pago.html', '/pago-pendiente.html',
    '/agradecimientos.html', '/blog/born-to-shine-detras-del-drop.html', '/blog/como-cuidar-tu-ropa.html',
    '/blog/streetwear-mexico-escena.html'];
  for (const url of pages) {
    test(`sin pageerror en ${url}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await seed(page, JSON.stringify(seedCart));
      await page.goto(url);
      await page.waitForTimeout(1500);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }
});

test.describe('AUDIT — Netlify Functions (handler directo, fetch stub, sin red)', () => {
  test.beforeEach(() => { test.skip(test.info().project.name !== 'Desktop', 'solo una vez'); });

  test('mp-preference rechaza precios manipulados desde el cliente', async () => {
    const realFetch = global.fetch;
    let sent = null;
    global.fetch = async (url, opts) => {
      sent = JSON.parse(opts.body);
      return new Response(JSON.stringify({ id: 'p', init_point: 'x' }), { status: 200 });
    };
    process.env.MP_ACCESS_TOKEN = 'TEST';
    try {
      const { handler } = require(path.join(FN_DIR, 'mp-preference.js'));
      const res = await handler({ httpMethod: 'POST', body: JSON.stringify({
        items: [{ title: 'BORN TO SHINE — Talla S', unit_price: 1, quantity: 1 }],
        cliente: { nombre: 'x', email: 'a@b.co' }, rate_id: 'R1', envio: 0, total: 1
      }) });
      const charged = sent ? sent.items.reduce((s, i) => s + i.unit_price * i.quantity, 0) : null;
      expect(res.statusCode === 400 || charged >= 450, `MP cobraría $${charged}`).toBe(true);
    } finally {
      global.fetch = realFetch;
    }
  });

  test('mp-webhook es idempotente: el mismo pago aprobado no crea 2 guías', async () => {
    const realFetch = global.fetch;
    let shipments = 0;
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('api.mercadopago.com/v1/payments/')) {
        return new Response(JSON.stringify({ status: 'approved', transaction_amount: 570, currency_id: 'MXN',
          metadata: { cliente: { nombre: 'x', email: 'a@b.co' }, rate_id: 'R1', parcel: {}, expected_total: 570 } }), { status: 200 });
      }
      if (u.includes('/oauth/token')) return new Response(JSON.stringify({ access_token: 't', expires_in: 7200 }), { status: 200 });
      if (u.includes('/shipments')) { shipments++; return new Response(JSON.stringify({ included: [] }), { status: 201 }); }
      throw new Error('red no permitida: ' + u);
    };
    process.env.MP_ACCESS_TOKEN = 'TEST';
    process.env.SKYDROPX_CLIENT_ID = 'id';
    process.env.SKYDROPX_CLIENT_SECRET = 'secret';
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    try {
      const { handler } = require(path.join(FN_DIR, 'mp-webhook.js'));
      process.env.MP_WEBHOOK_SECRET = WEBHOOK_SECRET;
      const ev = webhookEvent('123');
      await handler(ev);
      await handler(ev);
      await Promise.all([handler(webhookEvent('124')), handler(webhookEvent('124')), handler(webhookEvent('124'))]);
      expect(shipments).toBe(2);
    } finally {
      global.fetch = realFetch;
    }
  });

  test('mp-preference cobra precio de catálogo + envío de Skydropx', async () => {
    const realFetch = global.fetch;
    let sent = null;
    global.fetch = async (url, opts) => {
      const u = String(url);
      if (u.includes('/oauth/token')) return new Response(JSON.stringify({ access_token: 't', expires_in: 7200 }), { status: 200 });
      if (u.includes('/quotations/Q1')) return new Response(JSON.stringify({ rates: [{ id: 'R1', total: '120.5', provider_display_name: 'DHL' }] }), { status: 200 });
      if (u.includes('api.mercadopago.com/checkout/preferences')) {
        sent = JSON.parse(opts.body);
        return new Response(JSON.stringify({ id: 'p', init_point: 'x' }), { status: 200 });
      }
      throw new Error('red no permitida: ' + u);
    };
    process.env.MP_ACCESS_TOKEN = 'TEST';
    process.env.URL_SITIO = 'https://example.test';
    process.env.SKYDROPX_CLIENT_ID = 'id';
    process.env.SKYDROPX_CLIENT_SECRET = 'secret';
    try {
      const { handler } = require(path.join(FN_DIR, 'mp-preference.js'));
      const cliente = { nombre: 'Test User', email: 'test@example.com', telefono: '8112345678', calle: 'Calle 1 #2',
        colonia: 'Centro', cp: '64000', ciudad: 'Monterrey', estado: 'Nuevo Leon' };
      const ok = await handler({ httpMethod: 'POST', body: JSON.stringify({
        items: [{ id: 'dstar-bts-shirt-01', size: 'S', qty: 1, price: 1 }], cliente, quotation_id: 'Q1', rate_id: 'R1', envio: 0
      }) });
      expect(ok.statusCode).toBe(200);
      expect(sent.items.reduce((s, i) => s + i.unit_price * i.quantity, 0)).toBe(570.5);
      expect(sent.metadata.expected_total).toBe(570.5);
      expect(sent.back_urls.failure).toContain('/error-pago.html');

      const sinStock = await handler({ httpMethod: 'POST', body: JSON.stringify({
        items: [{ id: 'dstar-bts-shirt-01', size: 'S', qty: 2 }], cliente, quotation_id: 'Q1', rate_id: 'R1'
      }) });
      expect(sinStock.statusCode).toBe(400);
    } finally {
      global.fetch = realFetch;
    }
  });

  test('mp-webhook no genera guía si el monto pagado es menor al esperado', async () => {
    const realFetch = global.fetch;
    let shipments = 0;
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('api.mercadopago.com/v1/payments/')) {
        return new Response(JSON.stringify({ status: 'approved', transaction_amount: 1, currency_id: 'MXN',
          metadata: { cliente: { nombre: 'x', email: 'a@b.co' }, rate_id: 'R1', parcel: {}, expected_total: 570 } }), { status: 200 });
      }
      if (u.includes('/shipments')) { shipments++; return new Response('{}', { status: 201 }); }
      throw new Error('red no permitida: ' + u);
    };
    process.env.MP_ACCESS_TOKEN = 'TEST';
    try {
      const { handler } = require(path.join(FN_DIR, 'mp-webhook.js'));
      process.env.MP_WEBHOOK_SECRET = WEBHOOK_SECRET;
      const res = await handler(webhookEvent('999'));
      expect(res.statusCode).toBe(200);
      expect(res.body).not.toContain('label');
      expect(shipments).toBe(0);
    } finally {
      global.fetch = realFetch;
    }
  });

  test('mp-webhook rechaza notificaciones sin firma o con firma falsa', async () => {
    const realFetch = global.fetch;
    let consultas = 0;
    global.fetch = async () => { consultas++; throw new Error('no debería consultar MP'); };
    process.env.MP_ACCESS_TOKEN = 'TEST';
    const secretPrevio = process.env.MP_WEBHOOK_SECRET;
    try {
      const { handler } = require(path.join(FN_DIR, 'mp-webhook.js'));
      process.env.MP_WEBHOOK_SECRET = WEBHOOK_SECRET;
      const sinFirma = await handler({ httpMethod: 'POST', body: JSON.stringify({ type: 'payment', data: { id: '555' } }) });
      const falsa = await handler(webhookEvent('555', 'otra-clave'));
      delete process.env.MP_WEBHOOK_SECRET;
      const sinSecreto = await handler(webhookEvent('555'));
      expect([sinFirma.statusCode, falsa.statusCode, sinSecreto.statusCode]).toEqual([401, 401, 401]);
      expect(consultas).toBe(0);
    } finally {
      global.fetch = realFetch;
      if (secretPrevio) process.env.MP_WEBHOOK_SECRET = secretPrevio;
    }
  });

  test('cotizar-envio y mp-preference rechazan peticiones de otros sitios', async () => {
    const realFetch = global.fetch;
    global.fetch = async () => { throw new Error('red no permitida'); };
    process.env.URL = 'https://dstarshop.netlify.app';
    try {
      const preference = require(path.join(FN_DIR, 'mp-preference.js')).handler;
      const cotizar = require(path.join(FN_DIR, 'cotizar-envio.js')).handler;
      const ajeno = { httpMethod: 'POST', headers: { origin: 'https://evil.example', host: 'dstarshop.netlify.app' }, body: '{}' };
      expect((await preference(ajeno)).statusCode).toBe(403);
      expect((await cotizar(ajeno)).statusCode).toBe(403);
      const propio = { ...ajeno, headers: { origin: 'https://dstarshop.netlify.app', host: 'dstarshop.netlify.app' } };
      expect((await preference(propio)).statusCode).toBe(400);
      expect((await cotizar(propio)).statusCode).toBe(400);
    } finally {
      global.fetch = realFetch;
      delete process.env.URL;
    }
  });
});
