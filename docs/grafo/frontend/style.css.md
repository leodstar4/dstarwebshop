---
tags: [codigo, frontend]
ruta: "dstar-store/css/style.css"
lineas: 3957
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# style.css

`dstar-store/css/style.css` · 3957 líneas

Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye el loader (.loader__video, desvanecido solo de opacity y .loader--gone), la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header, el fondo body::before con image-set (AVIF y f_auto), `picture { display: contents }` para los `<picture>` de app.js, el lightbox de producto (.pd-lightbox), el placeholder borroso --pd-lqip de la galería, el bloque BOTONES — diseño de producción (placas blancas planas que pasan a gris claro y brillan al apuntar, checkout y barra fija en píldora, tallas de línea fina con ✓ en la activa, link de Instagram y flechas del lookbook de línea fina y cerrar carrito redondo; un solo bloque sin !important ni backdrop-filter, con presión por la propiedad scale para no chocar con el transform de GSAP, el ripple .btn-ripple y cursor crosshair en los CTA en desktop), el reflejo del header y de .product-detail__add que sigue a --glass-x/--glass-y, la píldora del nav (.header__pill), el carrito que abre con resorte y entra escalonado (.cart-drawer--entering), la miniatura .cart-fly, la inclinación del logo del hero (--tilt-x/--tilt-y) y la view transition pd-photo entre la tarjeta y la primera foto de la ficha, las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js, el bloque SAFE AREAS con env(safe-area-inset-*) para viewport-fit=cover, el bloque AVISOS (.alert-form, --drop y --size) de los formularios #dropAlert y #pdAlert, el bloque MUSEO (.museo-teaser) de la entrada al museo en index.html y, al final, el bloque INMERSIÓN: banda .kinetic, animaciones ligadas al scroll con animation-timeline dentro de @supports y prefers-reduced-motion: no-preference (heroSink, kineticLeft/kineticRight, stampTurn, riseIn), transición entre páginas pageOut/pageIn en ::view-transition-old/new(root) e inclinación 3D de las tarjetas con --card-rx/--card-ry/--card-px/--card-py.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[Cloudinary]], [[GSAP]]

## Bloques BEM

`.loader`, `.logo-3d`, `.announcement-bar`, `.header`, `.cart-btn`, `.menu-btn`, `.mobile-nav`, `.hero`, `.section-header`, `.section-title`, `.section-line`, `.drops`, `.products-grid`, `.product-card`, `.about`, `.contact`, `.footer`, `.cart-overlay`, `.cart-drawer`, `.cart-item`, `.size-btn`, `.shake`, `.img-fullscreen`, `.cart-fly`, `.toast`, `.section-sub`, `.lookbook`, `.lookbook-item`, `.blog`, `.blog-card`, `.faq`, `.blog-post`, `.scramble-char`, `.lookbook-panel`, `.lookbook-lb`, `.split-char`, `.split-line-mask`, `.is-scrolled`, `.split-word`, `.product-detail`

## Variables CSS

`--black`, `--dark`, `--concrete`, `--concrete-light`, `--concrete-dark`, `--white`, `--offwhite`, `--accent`, `--red`, `--green`, `--font-display`, `--font-heading`, `--font-mono`, `--ease`, `--ease-out`, `--orange`, `--dur-fast`, `--dur-base`, `--dur-slow`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--z-progress`, `--z-header`, `--z-nav`, `--z-overlay`, `--z-drawer`, `--z-toast`, `--z-loader`, `--glass-tint`, `--glass-tint-strong`, `--glass-fallback`, `--glass-sheen`, `--glass-edge`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--ease-spring`, `--ease-spring-soft`

## Últimos cambios

- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes

