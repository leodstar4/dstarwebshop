---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/catalog-store.js"
lineas: 40
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# catalog-store.js

`dstar-store/netlify/lib/catalog-store.js` · 40 líneas

Catálogo persistente en Netlify Blobs (store catalogo, clave products) con products-data.js de respaldo; saveProduct valida con cleanProduct (fotos HTTPS de Cloudinary, tallas, peso y medidas) y un producto nuevo entra con stock 0.

Parte de: [[Backend]]

## Conexiones

- Importa: [[products-data.js]], [[storage.js]], [[validate.js]]
- Usa: [[Cloudinary]]

## Funciones y clases

- `catalog` (línea 4)
- `cleanProduct` (línea 8)
- `photo` (línea 12)
- `saveProduct` (línea 29)

