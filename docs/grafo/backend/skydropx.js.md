---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/skydropx.js"
lineas: 106
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# skydropx.js

`dstar-store/netlify/lib/skydropx.js` · 106 líneas

Cliente de Skydropx: token OAuth con caché, consulta del precio de una tarifa (con carrier y service) y cotizar(destino, parcel), que usan cotizar-envio.js y mp-webhook.js.

Parte de: [[Backend]]

## Conexiones

- Usa: [[Skydropx]]
- Lee la variable: [[SKYDROPX_CLIENT_ID]], [[SKYDROPX_CLIENT_SECRET]]

## Funciones y clases

- `clean` (línea 5)
- `getSkydropxToken` (línea 7)
- `getRatePrice` (línea 34)
- `sleep` (línea 53)
- `cotizar` (línea 57)

## Últimos cambios

- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

