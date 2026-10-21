---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/catalogo.js"
lineas: 12
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# catalogo.js

`dstar-store/netlify/handlers/catalogo.js` · 12 líneas

Función /api/catalogo: catálogo activo de catalog-store.js con el stock vivo de stock-store.js; lo leen cart-store.js y las edge functions.

Parte de: [[Backend]]

## Conexiones

- Importa: [[catalog-store.js]], [[stock-store.js]], [[http.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 4)

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción

