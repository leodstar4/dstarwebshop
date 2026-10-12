---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 627
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 627 líneas

Animaciones del index y del detalle: hero letra por letra con GSAP y SplitText, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `revealOnEnter` (línea 21)
- `prepare` (línea 36)
- `prepareAll` (línea 45)
- `safely` (línea 50)
- `fontsReady` (línea 60)
- `splitChars` (línea 65)
- `splitLines` (línea 70)
- `initHero` (línea 78)
- `play` (línea 91)
- `initSectionHeaders` (línea 104)
- `initProductReveal` (línea 125)
- `initLookbookReveal` (línea 149)
- `initAbout` (línea 178)
- `initBlogReveal` (línea 229)
- `initRiseIns` (línea 253)
- `initLookbook` (línea 276)
- `openAt` (línea 308)
- `closeLb` (línea 317)
- `onKey` (línea 338)
- `scrollToPanel` (línea 390)
- `setActive` (línea 398)
- `initButtonEffects` (línea 439)
- `spawnRipple` (línea 458)
- `initCustomCursor` (línea 520)
- `initMagneticButtons` (línea 567)
- `invalidate` (línea 578)
- `run` (línea 615)

## Últimos cambios

- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas

