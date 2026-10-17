---
tags: [codigo, herramienta]
ruta: "scripts/calentar-cloudinary.js"
lineas: 66
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# calentar-cloudinary.js

`scripts/calentar-cloudinary.js` · 66 líneas

Pide una vez a Cloudinary todas las variantes que usa la web a partir de products-data.js (tarjetas, galería y lightbox hasta 2400, miniaturas y LQIP) para que ningún cliente espere a que se generen; se corre tras agregar o cambiar fotos.

Parte de: [[Herramientas]]

## Conexiones

- Importa: [[products-data.js]]

## Funciones y clases

- `withTransform` (línea 21)
- `urlsFor` (línea 23)
- `warm` (línea 34)
- `main` (línea 45)
- `worker` (línea 49)

