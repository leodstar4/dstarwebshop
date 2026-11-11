---
tags: [codigo, frontend]
ruta: "dstar-store/js/gsap-animations.js"
lineas: 580
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# gsap-animations.js

`dstar-store/js/gsap-animations.js` · 580 líneas

Animaciones del index y del detalle (arrancan en DOMContentLoaded, ya sin esperar DSTAR_CATALOG_READY): hero (initHero) con SplitText en líneas y letras con máscara por línea: las letras suben del centro hacia afuera con translate y rotate mientras el tagline parpadea de opacidad, y el CTA entra con translate y opacity, todo con element.animate() al recibir dstar:loaded y sin scale sobre texto, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor (initMagneticButtons: un solo mousemove con requestAnimationFrame para .hero__cta, .product-detail__add, .cart-drawer__checkout y #cartBtn; el ripple y el reflejo de puntero viven en app.js); el SplitText que parte solo en líneas va con aria: none. El contenido es visible por defecto y respeta prefers-reduced-motion.

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
- `initHero` (línea 77)
- `play` (línea 92)
- `initSectionHeaders` (línea 119)
- `initProductReveal` (línea 140)
- `initLookbookReveal` (línea 164)
- `initAbout` (línea 193)
- `initBlogReveal` (línea 244)
- `initRiseIns` (línea 268)
- `initLookbook` (línea 291)
- `openAt` (línea 324)
- `closeLb` (línea 333)
- `onKey` (línea 354)
- `scrollToPanel` (línea 406)
- `setActive` (línea 414)
- `initCustomCursor` (línea 455)
- `initMagneticButtons` (línea 512)
- `release` (línea 523)
- `invalidate` (línea 527)
- `update` (línea 534)
- `run` (línea 568)

## Últimos cambios

- 2026-11-11 · `4469385` · Museo 3D con probador, ajustes de botones y animaciones, sitemap y documentación al día
- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida

