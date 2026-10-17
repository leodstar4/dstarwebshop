---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Frontend

JavaScript del navegador, estilos y service worker.

Parte de: [[DSTAR]]

## Contenido

- [[app.js]] — Lógica principal: render de productos, detalle de producto (galería y carrusel con placeholder borroso LQIP, y lightbox en `<dialog>` con vuelo FLIP, zoom, gestos táctiles y teclado), carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; sin handlers inline: un listener de error en captura aplica imgFallback a las imágenes con data-fallback, la FAQ usa data-faq y las tallas delegación en #pdSizes; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto (primera foto y LQIP de la galería) con intención de hover.
- [[blog-transitions.js]] — Animaciones de los artículos del blog: entrada del encabezado, título palabra por palabra con SplitText, reveal del contenido con IntersectionObserver y barra de progreso de lectura con ScrollTrigger cuando el navegador no soporta animation-timeline.
- [[cart-store.js]] — Carrito en localStorage (dstar_cart) y sincronización del stock con /api/stock.
- [[checkout.js]] — Lógica del checkout (antes inline en checkout.html): resumen del carrito con miniaturas AVIF, cotización con /.netlify/functions/cotizar-envio, validación del formulario y pago con /.netlify/functions/mp-preference; fallback de imágenes con data-fallback.
- [[gracias.js]] — Script de gracias.html (antes inline): vacía dstar_cart si el pago se aprobó, muestra el número de pago y anima la entrada.
- [[gsap-animations.js]] — Animaciones del index y del detalle: hero letra por letra (SplitText) y CTA con element.animate() al recibir dstar:loaded, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor; el SplitText que parte solo en líneas va con aria: none. El contenido es visible por defecto y respeta prefers-reduced-motion.
- [[loader.js]] — Loader de index.html (antes script inline): activa mainCss y fontsCss (media print → all), cambia el póster por el `<video>` logo-3d-loader.mp4, crea temprano el worker de logo-3d-worker.js y oculta el loader disparando dstar:loaded; en la primera visita de la sesión (sessionStorage dstar-intro) espera a que gire y a que el logo del hero esté listo.
- [[logo-3d-worker.js]] — Web Worker del logo 3D en Chromium: descarga el MP4 apilado (color arriba, alfa abajo), lo decodifica con WebCodecs y lo dibuja con WebGL a 60 fps sobre los OffscreenCanvas que le pasa logo-3d.js (si se atrasa salta hasta 3 cuadros), calienta un contexto WebGL mientras descarga, solo dibuja el primer cuadro mientras está en hold y se pausa si ninguna vista es visible o la pestaña está oculta; recibe view, size, visible, hold, hidden y start, y responde live o error.
- [[logo-3d.js]] — Logo 3D animado del hero: en Chromium adopta el worker que creó el loader de index.html (window.__logo3dWorker) o crea uno, y le pasa cada canvas (runWorker, OffscreenCanvas); si no hay soporte o el worker falla usa runVideo: `<video>` + WebGL en el hilo principal (Safari/iPhone) con respaldo WebCodecs cuando el autoplay está bloqueado (modo de ahorro); mientras el loader está visible solo dibuja el primer cuadro (held), mide el canvas con ResizeObserver (dpr máximo 3, tope de 560 px), conserva hasta 3 cuadros de atraso y pausa si ninguna vista es visible.
- [[pedidos.js (js)]] — Panel de pedidos: guarda la contraseña en sessionStorage (dstar_panel), pide la lista a la función pedidos con Bearer, filtra y muestra cliente, prendas, etiqueta y rastreo de la guía y enlace de WhatsApp.
- [[products-data.js]] — Catálogo estático de productos; lo leen el navegador y el backend (validación de precios y stock).
- [[style.css]] — Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye el loader (.loader__video, desvanecido solo de opacity y .loader--gone), la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header, el fondo body::before con image-set (AVIF y f_auto), `picture { display: contents }` para los `<picture>` de app.js, el lightbox de producto (.pd-lightbox), el placeholder borroso --pd-lqip de la galería, las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js y, al final, el bloque SAFE AREAS con env(safe-area-inset-*) para viewport-fit=cover.
- [[sw.js]] — Service worker de la PWA: precache del shell (incluye js/loader.js), network-first para los archivos del sitio e imágenes de Cloudinary cache-first (hasta 80, pedidas en modo CORS y guardadas solo si responden ok); no intercepta /api, el checkout, las páginas de resultado del pago, /pedidos, los .mp4 ni las peticiones con Range.

