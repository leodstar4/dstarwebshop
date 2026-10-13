---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 640
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 640 líneas

Animaciones del index y del detalle: hero letra por letra (SplitText) y CTA con element.animate() al recibir dstar:loaded, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `revealOnEnter` (línea 19)
- `prepare` (línea 34)
- `prepareAll` (línea 43)
- `safely` (línea 48)
- `fontsReady` (línea 58)
- `splitChars` (línea 63)
- `splitLines` (línea 68)
- `initHero` (línea 76)
- `ctaIn` (línea 88)
- `play` (línea 94)
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

- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes

