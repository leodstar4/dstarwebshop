---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/flujo-compra.spec.js"
lineas: 285
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# flujo-compra.spec.js

`dstar-store/tests/e2e/flujo-compra.spec.js` · 285 líneas

Pruebas E2E del flujo de compra: carrito, checkout vacío, menú móvil, página de producto, selector de talla y lightbox de la galería (teclado, zoom y cierre con Escape).

Parte de: [[Pruebas]]

## Conexiones

- Llama a la API: [[cotizar-envio.js]] (`/api/cotizar-envio`), [[mp-preference.js]] (`/api/mp-preference`)
- Visita: [[index.html]], [[checkout.html]], [[born-to-shine-detras-del-drop.html]]
- Referencia a: [[producto.html]], [[gracias.html]]
- Usa: [[Playwright]], [[Netlify]], [[Cloudinary]]

## Funciones y clases

- `gotoCheckoutConCarrito` (línea 145)

## Casos de prueba

- Página principal
- carga y muestra productos
- header sticky visible
- scroll progress bar existe
- Carrito
- abre y cierra el drawer
- carrito vacío muestra mensaje
- Página de producto
- carga y muestra información del producto
- selector de talla muestra opciones
- botón comprar bloqueado sin talla y se desbloquea al elegir
- galería abre el lightbox, navega con teclado y cierra con Escape
- Navegación móvil
- menú hamburguesa abre y cierra
- Checkout
- carrito vacío muestra mensaje en vez del formulario
- renderiza el resumen del pedido con subtotal correcto
- PAGAR sin completar el formulario marca errores accesibles
- email inválido se rechaza con aria-invalid
- cotiza envío y al seleccionar tarifa actualiza el total
- flujo completo redirige al init_point de Mercado Pago
- Blog
- artículo carga y muestra contenido
- botón de regreso al blog funciona

## Últimos cambios

- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `fd99f34` · Checkout: cobrar el envío junto con la prenda en el mismo pago
- 2026-06-16 · `c1431e1` · Checkout: a11y, validación, peso dinámico, tests E2E y micro-animaciones

