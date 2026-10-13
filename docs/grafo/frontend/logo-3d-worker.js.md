---
tags: [codigo, frontend]
ruta: "dstar-store/js/logo-3d-worker.js"
lineas: 249
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# logo-3d-worker.js

`dstar-store/js/logo-3d-worker.js` · 249 líneas

Web Worker del logo 3D en Chromium: descarga el MP4 apilado (color arriba, alfa abajo), lo decodifica con WebCodecs y lo dibuja con WebGL a 60 fps sobre los OffscreenCanvas que le pasa logo-3d.js (si se atrasa salta hasta 3 cuadros para ponerse al día), en pausa si ninguna vista es visible o la pestaña está oculta; recibe view, size, visible, hidden y start, y responde live o error.

Parte de: [[Frontend]]

## Funciones y clases

- `fail` (línea 20)
- `createGL` (línea 28)
- `shader` (línea 31)
- `resize` (línea 55)
- `parseMp4` (línea 63)
- `boxes` (línea 66)
- `path` (línea 83)
- `hex` (línea 93)
- `feed` (línea 130)
- `draw` (línea 138)
- `tick` (línea 153)
- `update` (línea 175)
- `preroll` (línea 189)
- `start` (línea 200)

## Últimos cambios

- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla

