---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/skydropx.js"
lineas: 108
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# skydropx.js

`dstar-store/netlify/lib/skydropx.js` · 108 líneas

Cliente de Skydropx: token OAuth con caché (getSkydropxToken), precio actual de una tarifa (getRatePrice, con carrier y service) y cotizar(destino, parcel); lo usan cotizar-envio.js, mp-preference.js, pedidos.js, payment-service.js y mp-webhook.js.

Parte de: [[Backend]]

## Conexiones

- Usa: [[Skydropx]]
- Lee la variable: [[SKYDROPX_CLIENT_ID]], [[SKYDROPX_CLIENT_SECRET]]

## Funciones y clases

- `clean` (línea 5)
- `getSkydropxToken` (línea 7)
- `getRatePrice` (línea 34)
- `sleep` (línea 55)
- `cotizar` (línea 59)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

