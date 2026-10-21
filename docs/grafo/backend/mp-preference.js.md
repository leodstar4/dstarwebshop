---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/mp-preference.js"
lineas: 70
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mp-preference.js

`dstar-store/netlify/handlers/mp-preference.js` · 70 líneas

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

