// Capturas de los menús con vidrio (header, menú móvil, carrito, toast y barra de compra).
// Uso (dentro de dstar-store, con el servidor en 127.0.0.1:8888):
//   node tests/perf/captura-menus.js [carpeta-de-salida]
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(process.argv[2] || 'tests/perf/reportes/menus');
const BASE = process.env.DIAG_URL || 'http://127.0.0.1:8888';
const ITEM = [{ id: 'dstar-bts-shirt-01', name: 'BORN TO SHINE', price: 450, size: 'M', qty: 1, image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine1_mhdrgc.jpg' }];

async function abrir(browser, viewport, ruta) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, serviceWorkers: 'block', hasTouch: viewport.width < 800, isMobile: viewport.width < 800 });
  await context.addInitScript((cart) => localStorage.setItem('dstar_cart', JSON.stringify(cart)), ITEM);
  const page = await context.newPage();
  await page.route('**/api/**', (r) => r.abort());
  await page.goto(BASE + ruta);
  await page.waitForFunction(() => !document.querySelector('.loader') || document.querySelector('.loader--gone') || getComputedStyle(document.querySelector('.loader')).display === 'none', null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1800);
  return page;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const foto = (page, nombre, clip) => page.screenshot({ path: path.join(OUT, `${nombre}.png`), ...(clip ? { clip } : {}) });

  const pc = await abrir(browser, { width: 1440, height: 900 }, '/');
  await pc.evaluate(() => document.getElementById('drops').scrollIntoView({ block: 'start' }));
  await pc.mouse.wheel(0, 260);
  await pc.waitForTimeout(500);
  await pc.mouse.wheel(0, -90);
  await pc.waitForTimeout(1200);
  await foto(pc, 'pc-1-header', { x: 0, y: 0, width: 1440, height: 220 });
  await pc.locator('#cartBtn').click();
  await pc.waitForTimeout(1200);
  await foto(pc, 'pc-2-carrito', { x: 840, y: 0, width: 600, height: 900 });
  await pc.close();

  const cel = await abrir(browser, { width: 390, height: 844 }, '/');
  await cel.evaluate(() => document.getElementById('drops').scrollIntoView({ block: 'start' }));
  await cel.mouse.wheel(0, 260);
  await cel.waitForTimeout(500);
  await cel.mouse.wheel(0, -90);
  await cel.waitForTimeout(1200);
  await foto(cel, 'cel-1-header');
  await cel.locator('#menuBtn').click();
  await cel.waitForTimeout(1200);
  await foto(cel, 'cel-2-menu');
  await cel.locator('#menuBtn').click();
  await cel.waitForTimeout(600);
  await cel.locator('#cartBtn').click();
  await cel.waitForTimeout(1200);
  await foto(cel, 'cel-3-carrito');
  await cel.close();

  const ficha = await abrir(browser, { width: 390, height: 844 }, '/producto.html?id=dstar-bts-shirt-01');
  await ficha.mouse.wheel(0, 900);
  await ficha.waitForTimeout(1500);
  await foto(ficha, 'cel-4-barra-compra');
  await ficha.close();
  await browser.close();
})();
