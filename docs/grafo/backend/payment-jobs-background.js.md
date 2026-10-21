---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/payment-jobs-background.js"
lineas: 12
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# payment-jobs-background.js

`dstar-store/netlify/functions/payment-jobs-background.js` · 12 líneas

Background Function que ejecuta los trabajos firmados de lib/jobs.js: reconcile (reconcile.js; lanza error si quedaron pedidos con fallo para que se reintente) y payment (syncPayment de payment-service.js); 401 sin firma válida.

Parte de: [[Backend]]

## Conexiones

- Importa: [[jobs.js]], [[reconcile.js]], [[payment-service.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 2)

