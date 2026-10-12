---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 421
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 421 líneas

Animaciones del index y del detalle: reveals por clases (.rv → .rv-run, transición CSS de opacity/transform) con IntersectionObserver, contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `reveal` (línea 11)
- `initReveals` (línea 33)
- `initCounters` (línea 51)
- `initLookbook` (línea 71)
- `openAt` (línea 103)
- `closeLb` (línea 112)
- `onKey` (línea 133)
- `scrollToPanel` (línea 185)
- `setActive` (línea 193)
- `initButtonEffects` (línea 234)
- `spawnRipple` (línea 253)
- `initCustomCursor` (línea 315)
- `initMagneticButtons` (línea 362)
- `invalidate` (línea 373)
- `run` (línea 410)

## Últimos cambios

- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- 2026-10-10 · `a3628f5` · Carga más rápida: viewport antes de precargas, loader inline, logo 3D a 60fps, lookbook responsive, sin salto de layout

