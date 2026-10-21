---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/jobs.js"
lineas: 19
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# jobs.js

`dstar-store/netlify/lib/jobs.js` · 19 líneas

Trabajos internos: dispatch firma con HMAC de MP_WEBHOOK_SECRET y manda el trabajo a payment-jobs-background.js en URL_SITIO; authorized exige firma válida y de menos de 5 min.

Parte de: [[Backend]]

## Conexiones

- Llama a la API: [[payment-jobs-background.js]] (`/api/payment-jobs-background`)
- Usa: [[Netlify]], [[Mercado Pago]]
- Lee la variable: [[MP_WEBHOOK_SECRET]], [[URL_SITIO]]

## Funciones y clases

- `signature` (línea 2)
- `authorized` (línea 6)
- `dispatch` (línea 11)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

