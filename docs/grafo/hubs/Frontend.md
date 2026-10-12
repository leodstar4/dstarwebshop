---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Frontend

JavaScript del navegador, estilos y service worker.

Parte de: [[DSTAR]]

## Contenido

- [[app.js]] — Lógica principal: render de productos, carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto.
- [[blog-transitions.js]] — Animaciones de los artículos del blog: entrada del encabezado, título palabra por palabra con SplitText, reveal del contenido con IntersectionObserver y barra de progreso de lectura con ScrollTrigger cuando el navegador no soporta animation-timeline.
- [[cart-store.js]] — Carrito en localStorage (dstar_cart) y sincronización del stock con /api/stock.
- [[gsap-animations.js]] — Animaciones con GSAP y SplitText servidos desde js/vendor: hero que entra al irse el loader (evento dstar:loaded), títulos con máscara, reveals de drops, lookbook, nosotros, blog y FAQ con IntersectionObserver (solo transform/opacity, sin clip-path), cursor y botones magnéticos. El contenido es visible por defecto y respeta prefers-reduced-motion.
- [[logo-3d.js]] — Logo 3D animado: video con alfa compuesto en WebGL, con modo de ahorro de batería.
- [[products-data.js]] — Catálogo estático de productos; lo leen el navegador y el backend (validación de precios y stock).
- [[style.css]] — Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye la View Transition nativa entre páginas (@view-transition) y el hero de desktop que reserva el alto del header.
- [[sw.js]] — Service worker de la PWA: precache del shell, network-first para páginas, caché de imágenes; nunca cachea /api ni el checkout.

