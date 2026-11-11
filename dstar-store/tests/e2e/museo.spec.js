import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const activos = (page) => page.evaluate(() => window.DSTAR_PRODUCTS.filter((p) => p.active !== false).map((p) => ({ id: p.id, name: p.name })));

async function abrirMuseo(page) {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('/museo.html');
  await expect(page.locator('#museoListaGrid li').first()).toBeAttached();
  return errores;
}

test.describe('Museo — vista de lista', () => {
  test('muestra todas las piezas con link a su producto', async ({ page }) => {
    const errores = await abrirMuseo(page);
    const productos = await activos(page);
    const modo = page.locator('#museoModo');
    if (await modo.isVisible() && (await modo.getAttribute('aria-pressed')) === 'false') await modo.click();

    await expect(page.locator('#museoLista')).toBeVisible();
    await expect(page.locator('#museoListaGrid li')).toHaveCount(productos.length);
    await expect(page.locator('#museoListaGrid a').first()).toHaveAttribute('href', `producto.html?id=${productos[0].id}`);
    await expect(page.locator('#museoListaGrid h3').first()).toHaveText(productos[0].name);

    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde).toBeLessThanOrEqual(0);
    expect(errores, errores.join('\n')).toEqual([]);
  });

  test('sin WebGL cae a la lista y avisa', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (tipo, ...resto) {
        return /webgl/i.test(tipo) ? null : original.call(this, tipo, ...resto);
      };
    });
    const errores = await abrirMuseo(page);
    await expect(page.locator('#museoLista')).toBeVisible();
    await expect(page.locator('#museoListaNota')).toBeVisible();
    await expect(page.locator('#museoModo')).toBeHidden();
    await expect(page.locator('#museoSala')).toBeHidden();
    expect(errores, errores.join('\n')).toEqual([]);
  });

  test('con movimiento reducido abre en lista', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrirMuseo(page);
    await expect(page.locator('#museoLista')).toBeVisible();
    await expect(page.locator('#museoSala')).toBeHidden();
  });
});

test.describe('Museo — recorrido 3D', () => {
  test('entrar, pasar de obra en obra y abrir la pieza', async ({ page }) => {
    const errores = await abrirMuseo(page);
    test.skip(await page.locator('#museoModo').isHidden(), 'este navegador de prueba no tiene WebGL');
    const productos = await activos(page);

    await expect(page.locator('#museoSala')).toBeVisible();
    await expect(page.locator('#museoHud')).toBeHidden();
    await page.locator('#museoEntrar').click();
    await expect(page.locator('#museoHud')).toBeVisible();
    await expect(page.locator('#museoTotal')).toHaveText(String(productos.length).padStart(2, '0'));

    for (const boton of ['#museoPrev', '#museoNext', '#museoModo']) {
      const caja = await page.locator(boton).boundingBox();
      expect(caja.width).toBeGreaterThanOrEqual(44);
      expect(caja.height).toBeGreaterThanOrEqual(44);
    }

    await page.locator('#museoNext').click();
    await expect(page.locator('#museoFicha')).toBeVisible();
    await expect(page.locator('#museoFichaNombre')).toHaveText(productos[0].name);
    await expect(page.locator('#museoActual')).toHaveText('01');

    await page.locator('#museoNext').click();
    await expect(page.locator('#museoFichaNombre')).toHaveText(productos[1].name);
    await expect(page.locator('#museoFichaLink')).toHaveAttribute('href', `producto.html?id=${productos[1].id}`);

    await page.locator('#museoFichaCerrar').click();
    await expect(page.locator('#museoFicha')).toBeHidden();

    await page.locator('#museoPrev').click();
    await expect(page.locator('#museoFichaNombre')).toHaveText(productos[0].name);
    await page.locator('#museoFichaLink').click();
    await expect(page).toHaveURL(new RegExp(`producto\\.html\\?id=${productos[0].id}`));
    expect(errores, errores.join('\n')).toEqual([]);
  });
});

test.describe('Museo — probador', () => {
  test('el gato se prueba prendas, las combina y se las quita', async ({ page }) => {
    const foto = fs.readFileSync(path.join(process.cwd(), 'assets/brand/favicon-32.png'));
    await page.route('https://res.cloudinary.com/**', (r) => r.fulfill({ body: foto, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' } }));
    const errores = await abrirMuseo(page);
    test.skip(await page.locator('#museoModo').isHidden(), 'este navegador de prueba no tiene WebGL');
    const productos = await activos(page);
    const probar = page.locator('#museoFichaProbar');
    const quitar = page.locator('#museoQuitar');

    await page.locator('#museoEntrar').click();
    await expect(quitar).toBeHidden();
    await page.locator('#museoNext').click();
    await expect(probar).toBeVisible();
    await expect(probar).toHaveAttribute('aria-pressed', 'false');
    const caja = await probar.boundingBox();
    expect(caja.height).toBeGreaterThanOrEqual(44);

    await probar.click();
    await expect(probar).toHaveAttribute('aria-pressed', 'true');
    await expect(probar).toContainText('QUITAR');
    await expect(page.locator('#museoVoz')).toHaveText(`El gato se puso ${productos[0].name}.`);
    await expect(quitar).toBeVisible();

    await page.locator('#museoNext').click();
    await expect(probar).toHaveAttribute('aria-pressed', 'false');
    await probar.click();
    await expect(probar).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#museoPrev').click();
    await expect(probar).toHaveAttribute('aria-pressed', 'true');

    await probar.click();
    await expect(probar).toHaveAttribute('aria-pressed', 'false');
    await expect(quitar).toBeVisible();
    await quitar.click();
    await expect(quitar).toBeHidden();
    await page.locator('#museoNext').click();
    await expect(probar).toHaveAttribute('aria-pressed', 'false');
    expect(errores, errores.join('\n')).toEqual([]);
  });
});

test.describe('Museo — entradas desde la tienda', () => {
  test('el home tiene el bloque y el menú enlaza al museo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.museo-teaser__cta')).toHaveAttribute('href', '/museo.html');
    await expect(page.locator('#mainNav a[href="/museo.html"]')).toHaveCount(1);
    await expect(page.locator('#mobileNav a[href="/museo.html"]')).toHaveCount(1);
  });

  test('el museo regresa a la tienda', async ({ page }) => {
    await abrirMuseo(page);
    await page.locator('.museo-bar a[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);
  });
});
