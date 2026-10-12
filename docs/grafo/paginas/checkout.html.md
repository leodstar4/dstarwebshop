---
tags: [codigo, pagina]
ruta: "dstar-store/checkout.html"
lineas: 1245
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# checkout.html

`dstar-store/checkout.html` · 1245 líneas

Checkout: datos del cliente, cotización de envío y pago con Mercado Pago.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[products-data.js]], [[cart-store.js]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[index.html]], [[terminos.html]]
- Llama a la API: [[cotizar-envio.js]] (`/api/cotizar-envio`), [[mp-preference.js]] (`/api/mp-preference`)
- Usa la global: [[cart-store.js]] (`DSTAR_CART`)
- Usa: [[Netlify]], [[Mercado Pago]], [[Skydropx]], [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Funciones y clases

- `calcularPeso` (línea 732)
- `escapeHtml` (línea 736)
- `formatPrice` (línea 743)
- `showToast` (línea 750)
- `renderOrderSummary` (línea 780)
- `actualizarTotal` (línea 813)
- `cotizarEnvio` (línea 836)
- `renderTarifas` (línea 924)
- `validarFormulario` (línea 1033)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `461aa1d` · Ícono de la PWA con fondo blanco y logo a color
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `be7be88` · Restaura fondo y cards flotantes, logo 3D nuevo y hero en svh para evitar tirones

