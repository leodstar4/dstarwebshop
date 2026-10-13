---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 640
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 640 líneas

Animaciones del index y del detalle: hero letra por letra con GSAP y SplitText, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `BLUR_EASE` (línea 14)
- `revealOnEnter` (línea 22)
- `prepare` (línea 37)
- `prepareAll` (línea 46)
- `safely` (línea 51)
- `fontsReady` (línea 61)
- `splitChars` (línea 66)
- `splitLines` (línea 71)
- `initHero` (línea 79)
- `play` (línea 92)
- `initSectionHeaders` (línea 106)
- `initProductReveal` (línea 127)
- `initLookbookReveal` (línea 151)
- `initAbout` (línea 180)
- `initBlogReveal` (línea 231)
- `initRiseIns` (línea 255)
- `initLookbook` (línea 278)
- `openAt` (línea 311)
- `closeLb` (línea 320)
- `onKey` (línea 341)
- `scrollToPanel` (línea 393)
- `setActive` (línea 401)
- `initButtonEffects` (línea 442)
- `spawnRipple` (línea 461)
- `initCustomCursor` (línea 523)
- `initMagneticButtons` (línea 580)
- `invalidate` (línea 591)
- `run` (línea 628)

## Últimos cambios

- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

