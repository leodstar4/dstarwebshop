---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/stock.js"
lineas: 22
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# stock.js

`dstar-store/netlify/handlers/stock.js` · 22 líneas

Función /api/stock: devuelve el stock disponible por producto y talla (leerStock sobre el catálogo de catalog-store.js, ya sin piezas apartadas); límite de 120 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[stock-store.js]], [[catalog-store.js]], [[rate-limit.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 5)

