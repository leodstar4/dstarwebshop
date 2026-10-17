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
  // producto.html requiere ?id= válido; sin él redirige a la home
  const PRODUCT_URL = '/producto.html?id=dstar-bts-shirt-01';

  test('carga y muestra información del producto', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await expect(page).toHaveTitle(/DSTAR/i);

    // Info panel visible
    await expect(page.locator('.product-detail__info')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#pdName')).not.toBeEmpty();
    for (const sel of ['#pdName', '#pdPrice', '#pdAddBtn']) {
      await expect(page.locator(sel)).toHaveCSS('opacity', '1', { timeout: 3000 });
    }
  });

  test('selector de talla muestra opciones', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await expect(page.locator('.product-detail__sizes')).toBeVisible({ timeout: 8000 });
    const sizeBtns = page.locator('#pdSizes .size-btn');
    await expect(sizeBtns.first()).toBeVisible();
  });

  test('botón comprar bloqueado sin talla y se desbloquea al elegir', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    const addBtn = page.locator('#pdAddBtn');
    // El botón usa data-state="locked" hasta elegir talla (no el atributo disabled)
    await expect(addBtn).toHaveAttribute('data-state', 'locked', { timeout: 8000 });

    // Al elegir una talla disponible, sale del estado bloqueado
    await page.locator('#pdSizes .size-btn:not([disabled])').first().click();
    await expect(addBtn).not.toHaveAttribute('data-state', 'locked');
  });

  test('galería abre el lightbox, navega con teclado y cierra con Escape', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    const opener = page.locator('.pd-gallery-img:visible, .pd-carousel__item:visible').first();
    await expect(opener).toBeVisible({ timeout: 8000 });
    await opener.click();

    const lightbox = page.locator('#pdLightbox');
    await expect(lightbox).toHaveAttribute('open', '');
    await expect(page.locator('#pdLbCurrent')).toHaveText('01');
    await expect(page.locator('.pd-lightbox__frame').first()).toHaveClass(/pd-lightbox__frame--loaded/, { timeout: 8000 });

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#pdLbCurrent')).toHaveText('02');
    await expect(page.locator('#pdLbLive')).toHaveText(/Foto 2 de/);

    await page.keyboard.press('+');
    await expect(page.locator('#pdLbZoom')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('-');
    await expect(page.locator('#pdLbZoom')).toHaveAttribute('aria-pressed', 'false');

    await page.keyboard.press('Escape');
    await expect(lightbox).not.toHaveAttribute('open', '');
    await expect(page.locator('html')).not.toHaveClass(/pd-lightbox-open/);
    await expect(page.locator('.pd-gallery-img[data-index="1"]:visible, .pd-carousel__item[data-index="1"]:visible')).toBeFocused();
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

test.describe('Checkout', () => {
  // Carrito de prueba con la misma forma que guarda app.js
  const seedCart = [
    {
      id: 'dstar-bts-jort-01',
      name: 'OVER AS F**K',
      price: 500,
      image: 'https://res.cloudinary.com/dflyysqln/image/upload/overasdosvistas_lwrtst.webp',
      size: 'M',
      qty: 1
    }
  ];

  async function gotoCheckoutConCarrito(page, cart = seedCart) {
    await page.addInitScript((c) => {
      localStorage.setItem('dstar_cart', JSON.stringify(c));
    }, cart);
    await page.goto('/checkout.html');
  }

  test('carrito vacío muestra mensaje en vez del formulario', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('dstar_cart'));
    await page.goto('/checkout.html');
    await expect(page.locator('.cart-empty-msg')).toBeVisible();
    await expect(page.locator('#formEnvio')).toHaveCount(0);
  });

  test('renderiza el resumen del pedido con subtotal correcto', async ({ page }) => {
    await gotoCheckoutConCarrito(page);
    await expect(page.locator('.order-item')).toHaveCount(1);
    await expect(page.locator('#subtotalDisplay')).toContainText('500');
    await expect(page.locator('#totalDisplay')).toContainText('500');
  });

  test('PAGAR sin completar el formulario marca errores accesibles', async ({ page }) => {
    await gotoCheckoutConCarrito(page);
    await page.locator('#btnPagar').click();

    await expect(page.locator('#toast')).toHaveClass(/visible/);
    // Los campos vacíos quedan marcados con aria-invalid
    await expect(page.locator('#nombre')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('email inválido se rechaza con aria-invalid', async ({ page }) => {
    await gotoCheckoutConCarrito(page);
    await page.fill('#nombre', 'Juan Perez');
    await page.fill('#email', 'correo-sin-arroba');
    await page.fill('#telefono', '5512345678');
    await page.fill('#calle', 'Av Siempre Viva 123');
    await page.fill('#colonia', 'Centro');
    await page.fill('#cp', '06000');
    await page.fill('#ciudad', 'CDMX');
    await page.fill('#estado', 'CDMX');
    await page.locator('#btnPagar').click();
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('cotiza envío y al seleccionar tarifa actualiza el total', async ({ page }) => {
    // Mock de la función de cotización
    await page.route('**/.netlify/functions/cotizar-envio', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quotation_id: 'q_test',
          rates: [
            { rate_id: 'r1', carrier: 'FEDEX', service: 'Express', price: 150, currency: 'MXN', days: 2 }
          ]
        })
      })
    );

    await gotoCheckoutConCarrito(page);
    await page.fill('#colonia', 'Centro');
    await page.fill('#cp', '06000');
    await page.fill('#ciudad', 'CDMX');
    await page.fill('#estado', 'CDMX');
    await page.locator('#estado').blur();

    const opcion = page.locator('.tarifa-opcion').first();
    await expect(opcion).toBeVisible({ timeout: 8000 });
    await opcion.locator('input[type="radio"]').check();

    await expect(page.locator('#totalDisplay')).toContainText('650');
    await expect(page.locator('#envioDisplay')).toContainText('150');
  });

  test('flujo completo redirige al init_point de Mercado Pago', async ({ page }) => {
    await page.route('**/.netlify/functions/cotizar-envio', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quotation_id: 'q_test',
          rates: [{ rate_id: 'r1', carrier: 'FEDEX', service: 'Express', price: 150, currency: 'MXN', days: 2 }]
        })
      })
    );
    // Captura el body enviado para verificar que el envío se cobra en el pago
    let prefBody = null;
    await page.route('**/.netlify/functions/mp-preference', (route) => {
      prefBody = route.request().postDataJSON();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'pref_test', init_point: '/gracias.html?payment_id=demo&collection_status=approved' })
      });
    });

    await gotoCheckoutConCarrito(page);
    await page.fill('#nombre', 'Juan Perez');
    await page.fill('#email', 'juan@example.com');
    await page.fill('#telefono', '5512345678');
    await page.fill('#calle', 'Av Siempre Viva 123');
    await page.fill('#colonia', 'Centro');
    await page.fill('#cp', '06000');
    await page.fill('#ciudad', 'CDMX');
    await page.fill('#estado', 'CDMX');
    await page.locator('#estado').blur();

    await page.locator('.tarifa-opcion input[type="radio"]').first().check();
    await page.locator('#btnPagar').click();

    // Redirige a gracias.html (init_point mockeado) que limpia el carrito
    await page.waitForURL(/gracias\.html/, { timeout: 8000 });
    const cart = await page.evaluate(() => localStorage.getItem('dstar_cart'));
    expect(cart).toBeNull();

    // El costo del envío se envía para cobrarse junto con la prenda
    expect(prefBody).not.toBeNull();
    expect(prefBody.items).toEqual([{ id: 'dstar-bts-jort-01', size: 'M', qty: 1 }]);
    expect(prefBody.quotation_id).toBe('q_test');
    expect(prefBody.rate_id).toBe('r1');
    expect(prefBody.envio).toBeUndefined();
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
