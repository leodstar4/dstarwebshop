import { test, expect } from '@playwright/test';

// ============================================
// FLUJO DE COMPRA — Golden path + edge cases
// ============================================

test.describe('Página principal', () => {
  test('carga y muestra productos', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DSTAR/i);

    // Loader desaparece
    await expect(page.locator('.loader')).toHaveClass(/hidden/, { timeout: 6000 });

    // Al menos un producto visible
    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 8000 });
  });

  test('header sticky visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.header')).toBeVisible();
  });

  test('scroll progress bar existe', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#scrollProgress')).toBeAttached();
  });
});

test.describe('Carrito', () => {
  test('abre y cierra el drawer', async ({ page }) => {
    await page.goto('/');
    await page.locator('.loader').waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});

    await page.locator('#cartBtn').click();
    await expect(page.locator('.cart-drawer')).toHaveClass(/open/);

    await page.locator('#cartClose').click();
    await expect(page.locator('.cart-drawer')).not.toHaveClass(/open/);
  });

  test('carrito vacío muestra mensaje', async ({ page }) => {
    await page.goto('/');
    await page.locator('.loader').waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});
    await page.evaluate(() => localStorage.removeItem('dstar_cart'));
    await page.reload();

    await page.locator('#cartBtn').click();
    await expect(page.locator('#cartEmpty')).toBeVisible();
  });
});

test.describe('Página de producto', () => {
  test('carga y muestra información del producto', async ({ page }) => {
    await page.goto('/producto.html');
    await expect(page).toHaveTitle(/DSTAR/i);

    // Info panel visible
    await expect(page.locator('.product-detail__info')).toBeVisible({ timeout: 8000 });
  });

  test('selector de talla muestra opciones', async ({ page }) => {
    await page.goto('/producto.html');
    await expect(page.locator('.product-detail__sizes')).toBeVisible({ timeout: 8000 });
    const sizeBtns = page.locator('.size-btn');
    await expect(sizeBtns.first()).toBeVisible();
  });

  test('botón comprar deshabilitado sin talla seleccionada', async ({ page }) => {
    await page.goto('/producto.html');
    const addBtn = page.locator('.product-detail__add');
    await expect(addBtn).toBeDisabled();
  });
});

test.describe('Navegación móvil', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('menú hamburguesa abre y cierra', async ({ page }) => {
    await page.goto('/');
    await page.locator('.loader').waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});

    const menuBtn = page.locator('#menuBtn');
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();
    await expect(page.locator('#mobileNav')).toHaveClass(/open/);

    await menuBtn.click();
    await expect(page.locator('#mobileNav')).not.toHaveClass(/open/);
  });
});

test.describe('Blog', () => {
  test('artículo carga y muestra contenido', async ({ page }) => {
    await page.goto('/blog/born-to-shine-detras-del-drop.html');
    await expect(page).toHaveTitle(/DSTAR/i);
    await expect(page.locator('.blog-post__title')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.blog-post__body')).toBeVisible();
  });

  test('botón de regreso al blog funciona', async ({ page }) => {
    await page.goto('/blog/born-to-shine-detras-del-drop.html');
    const backBtn = page.locator('.blog-post__back');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toHaveAttribute('href', /blog/);
  });
});
