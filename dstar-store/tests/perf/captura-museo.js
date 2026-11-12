// Capturas del gato del museo para revisar el modelo y el fit de la ropa.
// Uso (dentro de dstar-store, con el servidor en 127.0.0.1:8888):
//   node tests/perf/captura-museo.js [carpeta-de-salida] [piezas, p. ej. 0,3,4]
// DIAG_GPU=1 usa la GPU real (más rápido); sin ella se renderiza por software.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(process.argv[2] || 'tests/perf/reportes/museo');
const SOLO = process.argv[3] ? process.argv[3].split(',').map(Number) : null;
const BASE = process.env.DIAG_URL || 'http://127.0.0.1:8888';
const GPU = !!process.env.DIAG_GPU;
const ESPERA = GPU ? 0.35 : 1;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: GPU ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.route('**/api/**', (r) => r.abort());
  await page.goto(`${BASE}/museo.html`);
  await page.locator('#museoEntrar').click();
  const pausa = (ms) => page.waitForTimeout(ms * ESPERA);
  const caja = await page.locator('#museoCanvas').boundingBox();
  const cx = caja.x + caja.width / 2;
  const cy = caja.y + caja.height * 0.3;
  const girar = async (rad) => {
    const px = Math.round(-rad / 0.004);
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + px / 2, cy + 20, { steps: 4 });
    await page.mouse.move(cx + px, cy, { steps: 4 });
    await pausa(700);
    await page.mouse.up();
  };
  const foto = async (nombre) => {
    await page.evaluate(() => document.querySelectorAll('.museo-ficha, .museo-hud, .museo-bar').forEach((el) => { el.style.opacity = '0'; }));
    await page.screenshot({ path: path.join(OUT, `${nombre}.png`), clip: { x: caja.x + caja.width * 0.2, y: caja.y + caja.height * 0.12, width: caja.width * 0.6, height: caja.height * 0.8 } });
    await page.evaluate(() => document.querySelectorAll('.museo-ficha, .museo-hud, .museo-bar').forEach((el) => { el.style.opacity = ''; }));
  };
  const vistas = async (nombre) => {
    const camara = page.locator('#museoCamara');
    if ((await camara.getAttribute('aria-pressed')) !== 'true') await camara.click();
    await pausa(6000);
    await foto(`${nombre}-1-frente`);
    await girar(0.75);
    await pausa(2500);
    await foto(`${nombre}-2-tres-cuartos`);
    await girar(0.72);
    await pausa(2500);
    await foto(`${nombre}-3-perfil`);
    await girar(1.67);
    await pausa(5000);
    await foto(`${nombre}-4-espalda`);
  };

  const total = Number(await page.locator('#museoTotal').textContent());
  if (!SOLO || SOLO.includes(-1)) {
    await pausa(3000);
    await vistas('00-gato');
  }
  for (let i = 0; i < total; i++) {
    await page.locator('#museoNext').click();
    if (SOLO && !SOLO.includes(i)) continue;
    await pausa(9000);
    const probar = page.locator('#museoFichaProbar');
    if (await probar.isHidden()) continue;
    await probar.click();
    await page.waitForFunction(() => document.getElementById('museoFichaProbar').getAttribute('aria-pressed') === 'true', null, { timeout: 60000 });
    await pausa(7000);
    await vistas(`${String(i + 1).padStart(2, '0')}-prenda`);
  }
  await browser.close();
  if (errores.length) {
    process.stderr.write(`${errores.join('\n')}\n`);
    process.exit(1);
  }
})();
