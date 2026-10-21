---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/pedidos.js"
lineas: 87
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# pedidos.js (functions)

`dstar-store/netlify/functions/pedidos.js` · 87 líneas

Función del panel de pedidos (admin() de lib/http.js con PANEL_PASSWORD): GET lista los pedidos sin token ni lock; POST con acciones sync, note, fulfillment (pendiente/guía lista → preparado → enviado → entregado), cancel (solo pagos pendientes), address, retry_shipping (solo tras falla definitiva y con precio confirmado), attach_shipping y retry_mail; cualquier otra (refund, return) se rechaza; límite de 120 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[orders-store.js]], [[payment-service.js]], [[validate.js]], [[skydropx.js]], [[http.js]], [[rate-limit.js]], [[reconcile.js]]
- Usa: [[Netlify]], [[Skydropx]]

## Funciones y clases

- `handler` (línea 7)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

