---
tags: [codigo, frontend]
ruta: "dstar-store/js/logo-3d.js"
lineas: 451
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# logo-3d.js

`dstar-store/js/logo-3d.js` · 451 líneas

Logo 3D animado del hero: en Chromium adopta el worker que creó el loader de index.html (window.__logo3dWorker) o crea uno, y le pasa cada canvas (runWorker, OffscreenCanvas); si no hay soporte o el worker falla usa runVideo: `<video>` + WebGL en el hilo principal (Safari/iPhone) con respaldo WebCodecs cuando el autoplay está bloqueado (modo de ahorro); mientras el loader está visible solo dibuja el primer cuadro (held), mide el canvas con ResizeObserver (dpr máximo 3, tope de 560 px), conserva hasta 3 cuadros de atraso y pausa si ninguna vista es visible.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[logo-3d-worker.js]]

## Funciones y clases

- `release` (línea 17)
- `sizeOf` (línea 18)
- `held` (línea 23)
- `runWorker` (línea 25)
- `sync` (línea 46)
- `onVisibility` (línea 58)
- `stop` (línea 68)
- `runVideo` (línea 115)
- `createView` (línea 116)
- `visible` (línea 165)
- `upload` (línea 168)
- `render` (línea 187)
- `parseMp4` (línea 201)
- `playDecoded` (línea 270)
- `fallback` (línea 373)
- `draw` (línea 383)
- `schedule` (línea 389)
- `park` (línea 399)
- `play` (línea 412)

## Últimos cambios

- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro

