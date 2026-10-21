---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 641
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 641 líneas

Animaciones del index y del detalle (arrancan después de DSTAR_CATALOG_READY): hero letra por letra (SplitText) y CTA con element.animate() al recibir dstar:loaded, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor; el SplitText que parte solo en líneas va con aria: none. El contenido es visible por defecto y respeta prefers-reduced-motion.

Parte de: [[Frontend]]

## Conexiones

- Usa la global: [[cart-store.js]] (`DSTAR_CATALOG_READY`)
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
- `run` (línea 629)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla

