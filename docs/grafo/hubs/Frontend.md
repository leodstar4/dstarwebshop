---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Frontend

JavaScript del navegador, estilos y service worker.

Parte de: [[DSTAR]]

## Contenido

- [[app.js]] — Lógica principal: render de productos, carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; marca is-scrolled en <html> y precarga el detalle de producto con intención de hover.
- [[blog-transitions.js]] — Animaciones de los artículos del blog: entrada del encabezado, título palabra por palabra con SplitText, reveal del contenido con IntersectionObserver y barra de progreso de lectura con ScrollTrigger cuando el navegador no soporta animation-timeline.
- [[cart-store.js]] — Carrito en localStorage (dstar_cart) y sincronización del stock con /api/stock.
- [[gsap-animations.js]] — Animaciones del index y del detalle: hero letra por letra con GSAP y SplitText, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.
- [[logo-3d.js]] — Logo 3D animado: video con alfa compuesto en WebGL (dpr máximo 2, un dibujo por cuadro de video, video en pausa si ninguna vista es visible), con modo de ahorro de batería.
- [[products-data.js]] — Catálogo estático de productos; lo leen el navegador y el backend (validación de precios y stock).
- [[style.css]] — Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header y las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js.
- [[sw.js]] — Service worker de la PWA: precache del shell, network-first para páginas, caché de imágenes; nunca cachea /api ni el checkout.

