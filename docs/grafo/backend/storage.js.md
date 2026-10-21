---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/storage.js"
lineas: 55
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# storage.js

`dstar-store/netlify/lib/storage.js` · 55 líneas

Acceso a Netlify Blobs con lectura fuerte y escritura condicional por etag (update reintenta hasta 12 veces y si no da 409); stores con sufijo por deploy fuera de producción; memoria solo con DSTAR_MEMORY_STORE y NODE_ENV=test sin NETLIFY.

Parte de: [[Backend]]

## Conexiones

- Usa la global: [[correcciones.test.cjs]] (`DSTAR_MEMORY_STORE`)
- Usa: [[Netlify Blobs]], [[Netlify]]
- Lee la variable: [[DSTAR_MEMORY_STORE]]

## Funciones y clases

- `clone` (línea 4)
- `open` (línea 5)
- `update` (línea 39)
- `resetForTests` (línea 50)

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

