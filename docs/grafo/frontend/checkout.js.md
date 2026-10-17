---
tags: [codigo, frontend]
ruta: "dstar-store/js/checkout.js"
lineas: 552
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# checkout.js

`dstar-store/js/checkout.js` · 552 líneas

Lógica del checkout (antes inline en checkout.html): resumen del carrito con miniaturas AVIF, cotización con /.netlify/functions/cotizar-envio, validación del formulario y pago con /.netlify/functions/mp-preference; fallback de imágenes con data-fallback.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[cotizar-envio.js]] (`/api/cotizar-envio`), [[mp-preference.js]] (`/api/mp-preference`)
- Usa la global: [[cart-store.js]] (`DSTAR_CART`)
- Referencia a: [[index.html]]
- Usa: [[Netlify]], [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `calcularPeso` (línea 21)
- `escapeHtml` (línea 25)
- `thumbUrl` (línea 30)
- `thumbSrcset` (línea 34)
- `formatPrice` (línea 39)
- `showToast` (línea 46)
- `renderOrderSummary` (línea 87)
- `actualizarTotal` (línea 124)
- `cotizarEnvio` (línea 147)
- `renderTarifas` (línea 235)
- `validarFormulario` (línea 344)
- `marcarError` (línea 349)

