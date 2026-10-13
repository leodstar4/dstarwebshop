---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 641
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 641 líneas

Animaciones del index y del detalle: hero letra por letra con GSAP y SplitText, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `BLUR_EASE` (línea 15)
- `revealOnEnter` (línea 23)
- `prepare` (línea 38)
- `prepareAll` (línea 47)
- `safely` (línea 52)
- `fontsReady` (línea 62)
- `splitChars` (línea 67)
- `splitLines` (línea 72)
- `initHero` (línea 80)
- `play` (línea 93)
- `initSectionHeaders` (línea 107)
- `initProductReveal` (línea 128)
- `initLookbookReveal` (línea 152)
- `initAbout` (línea 181)
- `initBlogReveal` (línea 232)
- `initRiseIns` (línea 256)
- `initLookbook` (línea 279)
- `openAt` (línea 312)
- `closeLb` (línea 321)
- `onKey` (línea 342)
- `scrollToPanel` (línea 394)
- `setActive` (línea 402)
- `initButtonEffects` (línea 443)
- `spawnRipple` (línea 462)
- `initCustomCursor` (línea 524)
- `initMagneticButtons` (línea 581)
- `invalidate` (línea 592)
- `run` (línea 629)

## Últimos cambios

- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache

