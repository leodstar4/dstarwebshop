---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/mp-preference.js"
lineas: 70
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mp-preference.js

`dstar-store/netlify/functions/mp-preference.js` · 70 líneas

Función /api/mp-preference: con el checkout_id del navegador (pedido dstar_<uuid>) valida cliente, catálogo, stock y cotización (verifyQuote y getRatePrice), aparta el stock 25 min (reservar), guarda el pedido con trackingToken en orders-store.js y crea la preferencia en modo binario sin ticket, cajero ni transferencia, que vence a los 15 min y regresa a seguimiento.html; reusa la preferencia vigente, permite reintentar si Mercado Pago falló y responde restart:true si la anterior venció; límite de 10 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[validate.js]], [[catalog-store.js]], [[stock-store.js]], [[orders-store.js]], [[quotes.js]], [[skydropx.js]], [[rate-limit.js]], [[http.js]]
- Llama a la API: [[mp-webhook.js]] (`/api/mp-webhook`)
- Referencia a: [[seguimiento.html]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Skydropx]]
- Lee la variable: [[URL_SITIO]], [[MP_ACCESS_TOKEN]], [[MP_WEBHOOK_SECRET]]

## Funciones y clases

- `handler` (línea 10)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `fd99f34` · Checkout: cobrar el envío junto con la prenda en el mismo pago

