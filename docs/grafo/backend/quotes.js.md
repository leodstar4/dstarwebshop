---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/quotes.js"
lineas: 31
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# quotes.js

`dstar-store/netlify/lib/quotes.js` · 31 líneas

Cotizaciones: parcel calcula peso y medidas desde el catálogo (+0.1 kg y 2 cm; más de 10 kg o 60 cm pide cotización especial), saveQuote las guarda 15 min ligadas a CP, estado, ciudad, colonia y carrito, y verifyQuote las comprueba antes de pagar.

Parte de: [[Backend]]

## Conexiones

- Importa: [[storage.js]]

## Funciones y clases

- `normalize` (línea 2)
- `destination` (línea 3)
- `cartKey` (línea 4)
- `parcel` (línea 5)
- `saveQuote` (línea 17)
- `verifyQuote` (línea 23)

