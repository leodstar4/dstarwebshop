---
tags: [codigo, frontend]
ruta: "dstar-store/css/style.css"
lineas: 3764
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# style.css

`dstar-store/css/style.css` · 3764 líneas

Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye el loader (.loader__video, desvanecido solo de opacity y .loader--gone), la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header, el fondo body::before con image-set (AVIF y f_auto), `picture { display: contents }` para los `<picture>` de app.js, el lightbox de producto (.pd-lightbox), el placeholder borroso --pd-lqip de la galería y las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[Cloudinary]], [[GSAP]]

## Bloques BEM

`.loader`, `.logo-3d`, `.announcement-bar`, `.header`, `.cart-btn`, `.menu-btn`, `.mobile-nav`, `.hero`, `.section-header`, `.section-title`, `.section-line`, `.drops`, `.products-grid`, `.product-card`, `.about`, `.contact`, `.footer`, `.cart-overlay`, `.cart-drawer`, `.cart-item`, `.size-btn`, `.shake`, `.img-fullscreen`, `.cart-particle`, `.toast`, `.section-sub`, `.lookbook`, `.lookbook-item`, `.blog`, `.blog-card`, `.faq`, `.blog-post`, `.ripple`, `.scramble-char`, `.lookbook-panel`, `.lookbook-lb`, `.split-char`, `.split-line-mask`, `.is-scrolled`, `.split-word`

## Variables CSS

`--black`, `--dark`, `--concrete`, `--concrete-light`, `--concrete-dark`, `--white`, `--offwhite`, `--accent`, `--red`, `--green`, `--font-display`, `--font-heading`, `--font-mono`, `--ease`, `--ease-out`, `--orange`, `--dur-fast`, `--dur-base`, `--dur-slow`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--z-progress`, `--z-header`, `--z-nav`, `--z-overlay`, `--z-drawer`, `--z-toast`, `--z-loader`, `--glass-tint`, `--glass-tint-strong`, `--glass-fallback`, `--glass-sheen`, `--glass-edge`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--hero-top`, `--hero-bottom`

## Últimos cambios

- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro

