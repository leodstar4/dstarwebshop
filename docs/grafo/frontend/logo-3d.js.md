---
tags: [codigo, frontend]
ruta: "dstar-store/js/logo-3d.js"
lineas: 445
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# logo-3d.js

`dstar-store/js/logo-3d.js` · 445 líneas

Logo 3D animado: en Chromium pasa cada canvas a logo-3d-worker.js (runWorker, OffscreenCanvas) y, si no hay soporte o el worker falla, usa runVideo: `<video>` + WebGL en el hilo principal (Safari/iPhone) con respaldo WebCodecs cuando el autoplay está bloqueado (modo de ahorro); mide el canvas con ResizeObserver (dpr máximo 3, tope de 560 px), conserva hasta 3 cuadros de atraso para no perder velocidad si el decodificador se retrasa y pausa si ninguna vista es visible.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[logo-3d-worker.js]]

## Funciones y clases

- `release` (línea 17)
- `sizeOf` (línea 18)
- `shown` (línea 23)
- `runWorker` (línea 25)
- `sync` (línea 40)
- `onVisibility` (línea 51)
- `stop` (línea 61)
- `runVideo` (línea 107)
- `createView` (línea 108)
- `visible` (línea 157)
- `upload` (línea 160)
- `inLoader` (línea 179)
- `render` (línea 180)
- `parseMp4` (línea 194)
- `playDecoded` (línea 263)
- `fallback` (línea 366)
- `draw` (línea 377)
- `schedule` (línea 383)
- `park` (línea 393)
- `play` (línea 406)

## Últimos cambios

- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `89f5597` · Logo 3D: video directo otra vez (la CSP bloqueaba blob: y forzaba el decodificador lento), loader espera al respaldo en 

