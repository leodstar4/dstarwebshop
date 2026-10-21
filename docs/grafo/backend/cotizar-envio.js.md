---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/cotizar-envio.js"
lineas: 27
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# cotizar-envio.js

`dstar-store/netlify/handlers/cotizar-envio.js` · 27 líneas

Función /api/cotizar-envio: exige CP, estado, ciudad y colonia, arma el paquete en servidor (parcel de quotes.js con el catálogo de catalog-store.js), cotiza con cotizar() de lib/skydropx.js y guarda la cotización ligada a destino y carrito (saveQuote, vence a los 15 min); límite de 20 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[skydropx.js]], [[validate.js]], [[catalog-store.js]], [[stock-store.js]], [[quotes.js]], [[rate-limit.js]], [[http.js]]
- Usa: [[Netlify]], [[Skydropx]]

## Funciones y clases

- `handler` (línea 8)

