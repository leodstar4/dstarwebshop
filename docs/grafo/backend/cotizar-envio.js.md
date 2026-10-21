---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/cotizar-envio.js"
lineas: 27
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# cotizar-envio.js

`dstar-store/netlify/functions/cotizar-envio.js` · 27 líneas

Función /api/cotizar-envio: exige CP, estado, ciudad y colonia, arma el paquete en servidor (parcel de quotes.js con el catálogo de catalog-store.js), cotiza con cotizar() de lib/skydropx.js y guarda la cotización ligada a destino y carrito (saveQuote, vence a los 15 min); límite de 20 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[skydropx.js]], [[validate.js]], [[catalog-store.js]], [[stock-store.js]], [[quotes.js]], [[rate-limit.js]], [[http.js]]
- Usa: [[Netlify]], [[Skydropx]]

## Funciones y clases

- `handler` (línea 8)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `e3d0817` · Skydropx auth: sanitiza credenciales y loguea error_description completo
- 2026-06-07 · `89b8f32` · Checkout completo: envíos Skydropx Pro v2 + correo de confirmación

