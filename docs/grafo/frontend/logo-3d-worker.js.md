---
tags: [codigo, frontend]
ruta: "dstar-store/js/logo-3d-worker.js"
lineas: 265
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# logo-3d-worker.js

`dstar-store/js/logo-3d-worker.js` · 265 líneas

Web Worker del logo 3D en Chromium: descarga el MP4 apilado (color arriba, alfa abajo), lo decodifica con WebCodecs y lo dibuja con WebGL a 60 fps sobre los OffscreenCanvas que le pasa logo-3d.js (si se atrasa salta hasta 3 cuadros), calienta un contexto WebGL mientras descarga, solo dibuja el primer cuadro mientras está en hold y se pausa si ninguna vista es visible o la pestaña está oculta; recibe view, size, visible, hold, hidden y start, y responde live o error.

Parte de: [[Frontend]]

## Funciones y clases

- `fail` (línea 22)
- `createGL` (línea 30)
- `shader` (línea 33)
- `resize` (línea 57)
- `parseMp4` (línea 65)
- `boxes` (línea 68)
- `path` (línea 85)
- `hex` (línea 95)
- `feed` (línea 132)
- `draw` (línea 140)
- `tick` (línea 153)
- `update` (línea 175)
- `prime` (línea 189)
- `preroll` (línea 193)
- `start` (línea 204)

## Últimos cambios

- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla

