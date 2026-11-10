---
tags: [codigo, frontend]
ruta: "dstar-store/css/style.css"
lineas: 3827
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# style.css

`dstar-store/css/style.css` · 3827 líneas

Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye el loader (.loader__video, desvanecido solo de opacity y .loader--gone), la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header, el fondo body::before con image-set (AVIF y f_auto), `picture { display: contents }` para los `<picture>` de app.js, el lightbox de producto (.pd-lightbox), el placeholder borroso --pd-lqip de la galería, el bloque BOTONES — liquid glass (botones claros y oscuros con los tokens --btn-light*, --btn-dark* y --ease-spring*, sin backdrop-filter, con reflejo ::after que sigue a --glass-x/--glass-y y presión con la propiedad scale para no chocar con el transform de GSAP), la píldora del nav (.header__pill), el carrito que abre con resorte y entra escalonado (.cart-drawer--entering), la miniatura .cart-fly, la inclinación del logo del hero (--tilt-x/--tilt-y) y la view transition pd-photo entre la tarjeta y la primera foto de la ficha, las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js, el bloque SAFE AREAS con env(safe-area-inset-*) para viewport-fit=cover y, al final, el bloque AVISOS (.alert-form, --drop y --size) de los formularios #dropAlert y #pdAlert.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[Cloudinary]], [[GSAP]]

## Bloques BEM

`.loader`, `.logo-3d`, `.announcement-bar`, `.header`, `.cart-btn`, `.menu-btn`, `.mobile-nav`, `.hero`, `.section-header`, `.section-title`, `.section-line`, `.drops`, `.products-grid`, `.product-card`, `.about`, `.contact`, `.footer`, `.cart-overlay`, `.cart-drawer`, `.cart-item`, `.size-btn`, `.shake`, `.img-fullscreen`, `.cart-fly`, `.toast`, `.section-sub`, `.lookbook`, `.lookbook-item`, `.blog`, `.blog-card`, `.faq`, `.blog-post`, `.scramble-char`, `.lookbook-panel`, `.lookbook-lb`, `.split-char`, `.split-line-mask`, `.is-scrolled`, `.split-word`, `.product-detail`

## Variables CSS

`--black`, `--dark`, `--concrete`, `--concrete-light`, `--concrete-dark`, `--white`, `--offwhite`, `--accent`, `--red`, `--green`, `--font-display`, `--font-heading`, `--font-mono`, `--ease`, `--ease-out`, `--orange`, `--dur-fast`, `--dur-base`, `--dur-slow`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--z-progress`, `--z-header`, `--z-nav`, `--z-overlay`, `--z-drawer`, `--z-toast`, `--z-loader`, `--glass-tint`, `--glass-tint-strong`, `--glass-fallback`, `--glass-sheen`, `--glass-edge`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--ease-spring`, `--ease-spring-soft`

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla

