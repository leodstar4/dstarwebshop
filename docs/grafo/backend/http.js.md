---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/http.js"
lineas: 29
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# http.js

`dstar-store/netlify/lib/http.js` · 29 líneas

Utilidades de las funciones: reply con no-store, body (JSON de máximo 100 KB), admin (PANEL_PASSWORD con timingSafeEqual y origen permitido), failure, request con timeout de 20 s y mp() para la API de Mercado Pago.

Parte de: [[Backend]]

## Conexiones

- Importa: [[validate.js]]
- Usa: [[Mercado Pago]]
- Lee la variable: [[PANEL_PASSWORD]], [[MP_ACCESS_TOKEN]]

## Funciones y clases

- `reply` (línea 3)
- `body` (línea 4)
- `admin` (línea 8)
- `hash` (línea 13)
- `failure` (línea 17)
- `request` (línea 18)
- `mp` (línea 24)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

