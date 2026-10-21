---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/storage.js"
lineas: 54
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# storage.js

`dstar-store/netlify/lib/storage.js` · 54 líneas

Acceso a Netlify Blobs con lectura fuerte y escritura condicional por etag (update reintenta hasta 12 veces y si no da 409); stores con sufijo por deploy fuera de producción; memoria solo con DSTAR_MEMORY_STORE y NODE_ENV=test sin NETLIFY.

Parte de: [[Backend]]

## Conexiones

- Usa la global: [[correcciones.test.cjs]] (`DSTAR_MEMORY_STORE`)
- Usa: [[Netlify Blobs]], [[Netlify]]
- Lee la variable: [[DSTAR_MEMORY_STORE]]

## Funciones y clases

- `clone` (línea 3)
- `open` (línea 4)
- `update` (línea 39)
- `resetForTests` (línea 49)

