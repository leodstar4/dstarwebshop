---
tags: [codigo, pagina]
ruta: "dstar-store/checkout.html"
lineas: 1257
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# checkout.html

`dstar-store/checkout.html` · 1257 líneas

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

- `calcularPeso` (línea 733)
- `escapeHtml` (línea 737)
- `thumbUrl` (línea 742)
- `thumbSrcset` (línea 746)
- `formatPrice` (línea 751)
- `showToast` (línea 758)
- `renderOrderSummary` (línea 788)
- `actualizarTotal` (línea 825)
- `cotizarEnvio` (línea 848)
- `renderTarifas` (línea 936)
- `validarFormulario` (línea 1045)

## Últimos cambios

- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `461aa1d` · Ícono de la PWA con fondo blanco y logo a color
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache

