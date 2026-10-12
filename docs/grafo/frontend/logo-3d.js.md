---
tags: [codigo, frontend]
ruta: "dstar-store/js/logo-3d.js"
lineas: 336
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# logo-3d.js

`dstar-store/js/logo-3d.js` · 336 líneas

Logo 3D animado: video con alfa compuesto en WebGL (dpr máximo 2, unos 30 fps, video en pausa si ninguna vista es visible), con modo de ahorro de batería.

Parte de: [[Frontend]]

## Funciones y clases

- `release` (línea 15)
- `createView` (línea 17)
- `shader` (línea 23)
- `visible` (línea 68)
- `upload` (línea 71)
- `inLoader` (línea 90)
- `render` (línea 91)
- `parseMp4` (línea 105)
- `boxes` (línea 108)
- `path` (línea 125)
- `hex` (línea 135)
- `playDecoded` (línea 172)
- `feed` (línea 188)
- `tick` (línea 210)
- `resume` (línea 229)
- `preroll` (línea 241)
- `fallback` (línea 270)
- `draw` (línea 282)
- `schedule` (línea 291)
- `park` (línea 301)
- `play` (línea 307)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `89f5597` · Logo 3D: video directo otra vez (la CSP bloqueaba blob: y forzaba el decodificador lento), loader espera al respaldo en 
- 2026-10-11 · `9948892` · Logo 3D en modo de ahorro: arranca en el loader, ritmo parejo a 30 fps, una sola descarga y un solo canvas activo
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache

