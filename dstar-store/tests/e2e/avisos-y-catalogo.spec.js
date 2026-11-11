import { test, expect } from '@playwright/test';
const base = { drop: 'DROP TEST', price: 450, description: 'Prenda de prueba', image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_blwlew.webp', gallery: [], active: true };
const agotada = { ...base, id: 'dstar-bts-shirt-01', name: 'BORN TO SHINE', sizes: ['S', 'L'], sizesStock: { S: 0, L: 1 }, stock: 1 };

test('la tienda pinta los productos sin esperar al catálogo remoto', async ({ page }) => {
  await page.route('**/api/catalogo', async (r) => { await new Promise((res) => setTimeout(res, 4000)); return r.fulfill({ status: 503, json: {} }); });
  await page.goto('/');
  await expect(page.locator('#productsGrid .product-card').first()).toBeAttached({ timeout: 2000 });
});

test('el catálogo remoto actualiza las tarjetas y queda en caché para la siguiente visita', async ({ page }) => {
  await page.route('**/api/catalogo', (r) => r.fulfill({ json: { products: [{ ...agotada, name: 'NOMBRE REMOTO' }] } }));
  await page.goto('/');
  await expect(page.locator('#productsGrid .product-card')).toHaveCount(1);
  await expect(page.locator('#productsGrid .product-card__name')).toHaveText('NOMBRE REMOTO');
  await page.unroute('**/api/catalogo');
  await page.route('**/api/catalogo', (r) => r.abort());
  await page.reload();
  await expect(page.locator('#productsGrid .product-card__name')).toHaveText('NOMBRE REMOTO');
});

test.skip('formulario del próximo drop pide consentimiento y confirma', async ({ page }) => {
  const enviados = [];
  await page.route('**/api/avisame', (r) => { enviados.push(r.request().postDataJSON()); return r.fulfill({ json: { ok: true } }); });
  await page.goto('/');
  const form = page.locator('#dropAlert');
  await form.scrollIntoViewIfNeeded();
  await form.getByLabel('Tu correo').fill('fan@example.com');
  await form.getByRole('button', { name: 'AVÍSAME' }).click();
  await expect(form.locator('.alert-form__status')).toContainText('aviso de privacidad');
  expect(enviados).toHaveLength(0);
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'AVÍSAME' }).click();
  await expect(form.locator('.alert-form__status')).toContainText('Listo');
  expect(enviados).toEqual([{ email: 'fan@example.com', consent: true, website: '', tipo: 'drop' }]);
});

test('ficha ofrece aviso solo para las tallas agotadas', async ({ page }) => {
  const enviados = [];
  await page.route('**/api/catalogo', (r) => r.fulfill({ json: { products: [agotada] } }));
  await page.route('**/api/stock', (r) => r.fulfill({ json: { stock: { [agotada.id]: agotada.sizesStock } } }));
  await page.route('**/api/avisame', (r) => { enviados.push(r.request().postDataJSON()); return r.fulfill({ json: { ok: true } }); });
  await page.goto('/producto.html?id=' + agotada.id);
  const form = page.locator('#pdAlert');
  await expect(form).toBeVisible();
  await expect(form.locator('#pdAlertSize option')).toHaveText(['S']);
  await form.getByLabel('Tu correo').fill('fan@example.com');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'AVÍSAME' }).click();
  await expect(form.locator('.alert-form__status')).toContainText('Listo');
  expect(enviados[0]).toMatchObject({ tipo: 'talla', productId: agotada.id, size: 'S' });
});

test('panel muestra embudo y avisos pendientes', async ({ page }) => {
  await page.route('**/.netlify/functions/pedidos', (r) => r.fulfill({ json: { pedidos: [] } }));
  await page.route('**/api/admin-store', (r) => r.fulfill({ json: { products: [agotada], stock: { [agotada.id]: { S: 2, L: 1 } }, inventory: { movements: [] }, settings: {}, health: { payment: true, webhook: true, shipping: true, mail: true } } }));
  await page.route(/\/api\/analitica/, (r) => r.fulfill({ json: { dias: [{ dia: '2026-10-29', visit: 10, view: 25, product: 6, add: 3 }], totales: { visit: 10, view: 25, product: 6, add: 3, checkout: 2, pay: 1 }, productos: [{ id: agotada.id, product: 6, add: 3 }], fuentes: [['instagram', 7]], dispositivos: [['movil', 9]], paginas: [['/', 20]] } }));
  let notify = null;
  await page.route('**/api/avisos', (r) => {
    if (r.request().method() === 'POST') { notify = r.request().postDataJSON(); return r.fulfill({ json: { enviados: 1, quedan: 0 } }); }
    return r.fulfill({ json: { avisos: [{ id: 'drop-' + 'a'.repeat(32), tipo: 'drop', email: 'a@example.com', at: Date.now() }, { id: 'talla-' + 'b'.repeat(32), tipo: 'talla', productId: agotada.id, size: 'S', email: 'b@example.com', at: Date.now() }] } });
  });
  await page.goto('/pedidos.html');
  await page.fill('#panelPassword', 'test-password-long-enough');
  await page.getByRole('button', { name: 'ENTRAR', exact: true }).click();
  await expect(page.locator('#panelAnalytics')).toContainText('Vieron un producto');
  await expect(page.locator('#panelAnalytics')).toContainText('BORN TO SHINE');
  await expect(page.locator('#panelAnalytics')).toContainText('instagram');
  await expect(page.locator('#panelAvisos')).toContainText('LISTA DEL PRÓXIMO DROP · 1');
  await page.getByRole('button', { name: 'AVISAR (1)' }).click();
  await expect(page.locator('#avisosStatus')).toContainText('Enviados 1');
  expect(notify).toEqual({ action: 'notify', productId: agotada.id, size: 'S' });
});
