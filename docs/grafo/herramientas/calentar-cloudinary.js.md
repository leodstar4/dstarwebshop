---
tags: [codigo, herramienta]
ruta: "scripts/calentar-cloudinary.js"
lineas: 67
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# calentar-cloudinary.js

`scripts/calentar-cloudinary.js` · 67 líneas

Pide una vez a Cloudinary todas las variantes que usa la web a partir de products-data.js (tarjetas, galería y lightbox hasta 2400, miniaturas, LQIP y la imagen para compartir de 1200x630) para que ningún cliente espere a que se generen; se corre tras agregar o cambiar fotos.

Parte de: [[Herramientas]]

## Conexiones

- Importa: [[products-data.js]]

## Funciones y clases

- `withTransform` (línea 21)
- `urlsFor` (línea 23)
- `warm` (línea 35)
- `main` (línea 46)
- `worker` (línea 50)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché

