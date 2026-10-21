---
tags: [codigo, backend]
ruta: "dstar-store/netlify/edge-functions/producto-meta.js"
lineas: 68
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# producto-meta.js

`dstar-store/netlify/edge-functions/producto-meta.js` · 68 líneas

Edge function en /producto.html y /producto: con ?id= busca la prenda activa en /api/catalogo (3 s; si falla usa products-data.js) y reescribe title, description, canonical y og:* con la foto vía Cloudinary (f_jpg,c_pad,b_auto,w_1200,h_630), y agrega product:price y JSON-LD Product.

Parte de: [[Backend]]

## Conexiones

- Llama a la API: [[catalogo.js]] (`/api/catalogo`)
- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`)
- Referencia a: [[producto.html]]

## Funciones y clases

- `esc` (línea 5)
- `ogImage` (línea 6)
- `setMeta` (línea 7)
- `jsonLd` (línea 10)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

