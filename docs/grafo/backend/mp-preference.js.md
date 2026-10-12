---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/mp-preference.js"
lineas: 92
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mp-preference.js

`dstar-store/netlify/functions/mp-preference.js` · 92 líneas

Función /api/mp-preference: valida el pedido, el stock y el precio del envío, y crea la preferencia de pago en Mercado Pago.

Parte de: [[Backend]]

## Conexiones

- Importa: [[validate.js]], [[skydropx.js]], [[stock-store.js]]
- Llama a la API: [[mp-webhook.js]] (`/api/mp-webhook`)
- Referencia a: [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Skydropx]]
- Lee la variable: [[MP_ACCESS_TOKEN]], [[URL_SITIO]]

## Funciones y clases

- `reply` (línea 15)
- `handler` (línea 17)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `fd99f34` · Checkout: cobrar el envío junto con la prenda en el mismo pago
- 2026-06-07 · `89b8f32` · Checkout completo: envíos Skydropx Pro v2 + correo de confirmación

