---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 651
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 651 líneas

Animaciones con GSAP y SplitText servidos desde js/vendor: hero que entra al irse el loader (evento dstar:loaded), títulos con máscara, reveals de drops, lookbook, nosotros, blog y FAQ con IntersectionObserver, cursor y botones magnéticos. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `revealOnEnter` (línea 15)
- `safely` (línea 29)
- `fontsReady` (línea 40)
- `splitChars` (línea 45)
- `splitLines` (línea 50)
- `initHero` (línea 58)
- `play` (línea 71)
- `initSectionHeaders` (línea 84)
- `initProductReveal` (línea 106)
- `initLookbookReveal` (línea 130)
- `initAbout` (línea 153)
- `initBlogReveal` (línea 207)
- `initRiseIns` (línea 230)
- `initLookbook` (línea 253)
- `openAt` (línea 285)
- `closeLb` (línea 294)
- `onKey` (línea 315)
- `scrollToPanel` (línea 367)
- `setActive` (línea 375)
- `initProductCardClick` (línea 417)
- `initButtonEffects` (línea 463)
- `spawnRipple` (línea 482)
- `initCustomCursor` (línea 544)
- `initMagneticButtons` (línea 591)
- `invalidate` (línea 602)
- `run` (línea 639)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- 2026-10-10 · `a3628f5` · Carga más rápida: viewport antes de precargas, loader inline, logo 3D a 60fps, lookbook responsive, sin salto de layout
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

