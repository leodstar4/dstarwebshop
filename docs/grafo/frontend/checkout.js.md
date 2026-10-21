---
tags: [codigo, frontend]
ruta: "dstar-store/js/checkout.js"
lineas: 568
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# checkout.js

`dstar-store/js/checkout.js` · 568 líneas

Lógica del checkout: espera DSTAR_CATALOG_READY, resumen del carrito con miniaturas AVIF, cotización con /.netlify/functions/cotizar-envio y pago con /.netlify/functions/mp-preference usando un checkout_id estable en sessionStorage (dstar_checkout_attempt, que se borra si el servidor responde restart); guarda dstar_last_order para seguimiento.html; fallback de imágenes con data-fallback.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[cotizar-envio.js]] (`/api/cotizar-envio`), [[mp-preference.js]] (`/api/mp-preference`)
- Usa la global: [[cart-store.js]] (`DSTAR_CART`)
- Referencia a: [[seguimiento.html]], [[index.html]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `escapeHtml` (línea 20)
- `thumbUrl` (línea 25)
- `thumbSrcset` (línea 29)
- `formatPrice` (línea 34)
- `showToast` (línea 41)
- `renderOrderSummary` (línea 86)
- `actualizarTotal` (línea 123)
- `cotizarEnvio` (línea 146)
- `renderTarifas` (línea 230)
- `validarFormulario` (línea 341)
- `marcarError` (línea 346)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

