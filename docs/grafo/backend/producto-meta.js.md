---
tags: [codigo, backend]
ruta: "dstar-store/netlify/edge-functions/producto-meta.js"
lineas: 63
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# producto-meta.js

`dstar-store/netlify/edge-functions/producto-meta.js` · 63 líneas

Edge function en /producto.html y /producto: con ?id= reescribe title, description, canonical y og:* con los datos de products-data.js y la foto vía Cloudinary (f_jpg,c_pad,b_auto,w_1200,h_630), y agrega product:price y JSON-LD Product.

Parte de: [[Backend]]

## Conexiones

- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`)
- Referencia a: [[producto.html]]

## Funciones y clases

- `esc` (línea 5)
- `ogImage` (línea 6)
- `setMeta` (línea 7)
- `jsonLd` (línea 10)

