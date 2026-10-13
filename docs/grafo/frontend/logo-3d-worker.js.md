---
tags: [codigo, frontend]
ruta: "dstar-store/js/logo-3d-worker.js"
lineas: 250
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# logo-3d-worker.js

`dstar-store/js/logo-3d-worker.js` · 250 líneas

Web Worker del logo 3D en Chromium: descarga el MP4 apilado (color arriba, alfa abajo), lo decodifica con WebCodecs y lo dibuja con WebGL a 60 fps sobre los OffscreenCanvas que le pasa logo-3d.js, en pausa si ninguna vista es visible o la pestaña está oculta; recibe view, size, visible, hidden y start, y responde live o error.

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
- `update` (línea 176)
- `preroll` (línea 190)
- `start` (línea 201)

