import { test, expect } from '@playwright/test';
process.env.NODE_ENV = 'test';
process.env.DSTAR_MEMORY_STORE = 'true';
test.beforeEach(() => { require(process.cwd() + '/netlify/lib/storage.js').resetForTests(); });
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, 'package.json'));
const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
const CSP = toml.match(/Content-Security-Policy = "([^"]+)"/)[1].replace(/;\s*upgrade-insecure-requests/, '');

const PRODUCT_URL = '/producto.html?id=dstar-bts-shirt-01';
const seedCart = JSON.stringify([{
  id: 'dstar-bts-shirt-01', name: 'BORN TO SHINE', price: 450,
  image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_blwlew.webp',
  size: 'S', qty: 1
}]);

const INDEXABLES = ['/', PRODUCT_URL, '/terminos.html', '/agradecimientos.html', '/blog/born-to-shine-detras-del-drop.html',
  '/blog/como-cuidar-tu-ropa.html', '/blog/streetwear-mexico-escena.html'];
const PRIVADAS = ['/pedidos.html', '/checkout.html', '/gracias.html', '/error-pago.html', '/pago-pendiente.html', '/offline.html', '/no-existe'];

test.describe('Seguridad — CSP sin unsafe-inline', () => {
  test('script-src no permite inline y los hashes están al día', () => {
    test.skip(test.info().project.name !== 'Desktop', 'solo una vez');
    const { scriptSrc } = require('../scripts/csp-hashes.js');
    const actual = CSP.match(/script-src [^;]*/)[0];
    expect(actual).not.toContain('unsafe-inline');
    expect(actual, 'corre: node scripts/csp-hashes.js').toBe(scriptSrc());
  });

  for (const url of [...INDEXABLES, ...PRIVADAS]) {
    test(`sin bloqueos de la CSP en ${url}`, async ({ page }) => {
      const violaciones = [];
      const errores = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) violaciones.push(m.text()); });
      await page.addInitScript((cart) => {
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
        try { localStorage.setItem('dstar_cart', cart); } catch {}
      }, seedCart);
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() !== 'document') return route.continue();
        const response = await route.fetch();
        await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': CSP } });
      });
      await page.goto(url);
      await page.waitForTimeout(1500);
      violaciones.push(...(await page.evaluate(() => window.__csp)));
      expect(violaciones, violaciones.join('\n')).toEqual([]);
      expect(errores, errores.join('\n')).toEqual([]);
    });
  }
});

test.describe('SEO — metadatos para buscadores y redes', () => {
  for (const url of INDEXABLES) {
    test(`${url} tiene canonical e imagen para compartir`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.+\.(jpg|webp)$|f_jpg/);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /DSTAR/);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    });
  }

  for (const url of PRIVADAS) {
    test(`${url} no se indexa`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });
  }

  test('una ruta que no existe muestra la página 404 de la marca', async ({ page }) => {
    const response = await page.goto('/esta-pagina-no-existe');
    expect(response.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('ESTA PIEZA NO EXISTE');
    await expect(page.getByRole('link', { name: 'VOLVER AL INICIO' })).toHaveAttribute('href', '/');
  });

  test('las redes enlazan a Instagram real y no quedan links vacíos', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    await expect(page.locator('a[href="https://www.instagram.com/dstar_.4/"]').first()).toBeAttached();
  });
});

test.describe('Edge functions y límites (sin red)', () => {
  test.beforeEach(() => { test.skip(test.info().project.name !== 'Desktop', 'solo una vez'); });

  async function cargarEdge(nombre) {
    globalThis.DSTAR_PRODUCTS = require('./js/products-data.js');
    const mod = await import(pathToFileURL(path.join(ROOT, 'netlify/edge-functions', nombre)).href);
    return typeof mod.default === 'function' ? mod.default : mod.default.default;
  }

  test('producto-meta pone nombre, precio, foto y canonical de la prenda', async () => {
    const edge = await cargarEdge('producto-meta.js');
    const html = fs.readFileSync(path.join(ROOT, 'producto.html'), 'utf8');
    const context = { next: async () => new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } }) };
    const originalFetch = global.fetch;
    global.fetch = async () => Response.json({ products: globalThis.DSTAR_PRODUCTS });
    try {
    const res = await edge(new Request(`https://dstarshop.netlify.app${PRODUCT_URL}`), context);
    const out = await res.text();
    expect(out).toContain('<title>BORN TO SHINE — DSTAR</title>');
    expect(out).toContain(`<link rel="canonical" href="https://dstarshop.netlify.app${PRODUCT_URL}">`);
    expect(out).toMatch(/<meta property="og:image" content="https:\/\/res\.cloudinary\.com\/[^"]*f_jpg[^"]*borntoshinedosvistas/);
    expect(out).toContain('<meta property="product:price:amount" content="450">');
    expect(out).toContain('"@type":"Product"');

    const otro = await edge(new Request('https://dstarshop.netlify.app/producto.html?id=no-existe'), context);
    expect(await otro.text()).toBe(html);
    } finally { global.fetch = originalFetch; }
  });

  test('sitemap incluye cada producto y las páginas públicas', async () => {
    const edge = await cargarEdge('sitemap.js');
    const xml = await (await edge()).text();
    for (const p of globalThis.DSTAR_PRODUCTS) expect(xml).toContain(`producto.html?id=${p.id}</loc>`);
    expect(xml).toContain('<loc>https://dstarshop.netlify.app/</loc>');
    expect(xml).not.toContain('checkout');
  });

  test('cotizar-envio responde 429 cuando una misma IP abusa', async () => {
    process.env.URL = 'https://dstarshop.netlify.app';
    const { handler } = require('./netlify/functions/cotizar-envio.js');
    const event = { httpMethod: 'POST', headers: { 'x-nf-client-connection-ip': '203.0.113.9' }, body: '{}' };
    const codigos = [];
    for (let i = 0; i < 21; i++) codigos.push((await handler(event)).statusCode);
    expect(codigos.slice(0, 20).every((c) => c === 400)).toBe(true);
    const ultimo = await handler(event);
    expect(ultimo.statusCode).toBe(429);
    expect(Number(ultimo.headers['Retry-After'])).toBeGreaterThan(0);
  });
});

test.describe('Panel de pedidos', () => {
  const pedido = {
    id: '9001', status: 'done', at: Date.UTC(2026, 9, 17, 18), tracking: 'TRK123',
    guia: { carrier: 'FEDEX', label_url: 'https://example.com/label.pdf', tracking_url: 'javascript:alert(1)' },
    pedido: {
      cliente: { nombre: '<img src=x onerror="window.__xss=1">', email: 'a@b.com', telefono: '5512345678', calle: 'Calle 1', colonia: 'Centro', ciudad: 'CDMX', estado: 'CDMX', cp: '06000' },
      items: [{ title: 'BORN TO SHINE — Talla S', quantity: 1, unit_price: 450 }],
      total: 600
    }
  };

  test('pide contraseña, muestra los pedidos y escapa los datos del cliente', async ({ page }) => {
    await page.route('**/.netlify/functions/pedidos', (route) => {
      const ok = route.request().headers().authorization === 'Bearer clave-correcta-larga';
      route.fulfill({ status: ok ? 200 : 401, contentType: 'application/json', body: JSON.stringify(ok ? { pedidos: [pedido, { id: '9002', status: 'failed', at: 1 }] } : { error: 'Contraseña incorrecta' }) });
    });
    await page.goto('/pedidos.html');
    await page.fill('#panelPassword', 'mala');
    await page.getByRole('button', { name: 'ENTRAR' }).click();
    await expect(page.locator('#panelError')).toHaveText('Contraseña incorrecta');

    await page.fill('#panelPassword', 'clave-correcta-larga');
    await page.getByRole('button', { name: 'ENTRAR' }).click();
    await expect(page.locator('.order')).toHaveCount(2);
    await expect(page.locator('#statPedidos')).toHaveText('2');
    await expect(page.locator('#statRevisar')).toHaveText('1');
    await expect(page.locator('.order').first()).toContainText('<img src=x');
    await expect(page.locator('.order').first()).toContainText('FEDEX: TRK123');
    await expect(page.getByRole('link', { name: 'RASTREAR' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'ETIQUETA' })).toHaveAttribute('href', 'https://example.com/label.pdf');
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();

    await page.getByRole('button', { name: 'POR REVISAR' }).click();
    await expect(page.locator('.order')).toHaveCount(1);
    await expect(page.locator('.order')).toContainText('GUÍA FALLÓ');

    await page.getByRole('button', { name: 'SALIR' }).click();
    await expect(page.locator('#panelLogin')).toBeVisible();
  });

  test('la función exige PANEL_PASSWORD y la contraseña correcta', async () => {
    test.skip(test.info().project.name !== 'Desktop', 'solo una vez');
    const { handler } = require('./netlify/functions/pedidos.js');
    const ev = (auth) => ({ httpMethod: 'GET', headers: auth ? { authorization: `Bearer ${auth}` } : {} });
    delete process.env.PANEL_PASSWORD;
    expect((await handler(ev('x'))).statusCode).toBe(503);
    process.env.PANEL_PASSWORD = 'una-clave-de-prueba-larga';
    expect((await handler(ev())).statusCode).toBe(401);
    expect((await handler(ev('una-clave-de-prueba-larg'))).statusCode).toBe(401);
    const ok = await handler(ev('una-clave-de-prueba-larga'));
    expect(ok.statusCode).toBe(200);
    expect(Array.isArray(JSON.parse(ok.body).pedidos)).toBe(true);
    delete process.env.PANEL_PASSWORD;
  });
});
