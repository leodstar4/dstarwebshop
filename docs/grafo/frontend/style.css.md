---
tags: [codigo, frontend]
ruta: "dstar-store/css/style.css"
lineas: 3563
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# style.css

`dstar-store/css/style.css` · 3563 líneas

Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header, el fondo body::before con image-set (AVIF y f_auto), `picture { display: contents }` para los `<picture>` de app.js y las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[Cloudinary]], [[GSAP]]

## Bloques BEM

`.loader`, `.logo-3d`, `.announcement-bar`, `.header`, `.cart-btn`, `.menu-btn`, `.mobile-nav`, `.hero`, `.section-header`, `.section-title`, `.section-line`, `.drops`, `.products-grid`, `.product-card`, `.about`, `.contact`, `.footer`, `.cart-overlay`, `.cart-drawer`, `.cart-item`, `.size-btn`, `.shake`, `.img-fullscreen`, `.cart-particle`, `.toast`, `.section-sub`, `.lookbook`, `.lookbook-item`, `.blog`, `.blog-card`, `.faq`, `.blog-post`, `.ripple`, `.scramble-char`, `.lookbook-panel`, `.lookbook-lb`, `.split-char`, `.split-line-mask`, `.is-scrolled`, `.split-word`

## Variables CSS

`--black`, `--dark`, `--concrete`, `--concrete-light`, `--concrete-dark`, `--white`, `--offwhite`, `--accent`, `--red`, `--green`, `--font-display`, `--font-heading`, `--font-mono`, `--ease`, `--ease-out`, `--orange`, `--dur-fast`, `--dur-base`, `--dur-slow`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--z-progress`, `--z-header`, `--z-nav`, `--z-overlay`, `--z-drawer`, `--z-toast`, `--z-loader`, `--glass-tint`, `--glass-tint-strong`, `--glass-fallback`, `--glass-sheen`, `--glass-edge`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--hero-top`, `--hero-bottom`

## Últimos cambios

- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo

