---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1444
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1444 líneas

Lógica principal: render de productos, detalle de producto (galería, carrusel y lightbox), carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto con intención de hover.

Parte de: [[Frontend]]

## Conexiones

- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`), [[cart-store.js]] (`DSTAR_CART`)
- Referencia a: [[producto.html]], [[checkout.html]], [[terminos.html]], [[index.html]], [[sw.js]]
- Usa: [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `cdnOpt` (línea 10)
- `cdnSrcset` (línea 24)
- `cdnPicture` (línea 28)
- `imgFallback` (línea 41)
- `initApp` (línea 70)
- `initLiveStock` (línea 110)
- `initNav` (línea 120)
- `setNav` (línea 125)
- `renderProducts` (línea 190)
- `isProductSoldOut` (línea 223)
- `cardBadgeHtml` (línea 227)
- `cardInfoHtml` (línea 232)
- `patchProductCard` (línea 249)
- `applyLiveStock` (línea 264)
- `initCardPrefetch` (línea 280)
- `warm` (línea 284)
- `cardOf` (línea 306)
- `initCart` (línea 321)
- `openCart` (línea 336)
- `closeCart` (línea 342)
- `updateCartUI` (línea 348)
- `changeQty` (línea 406)
- `removeFromCart` (línea 421)
- `saveCart` (línea 427)
- `stockDisponible` (línea 431)
- `escapeHtml` (línea 436)
- `handleCheckout` (línea 445)
- `initScrollAnimations` (línea 459)
- `showToast` (línea 477)
- `renderLookbook` (línea 570)
- `renderBlog` (línea 598)
- `renderFAQ` (línea 627)
- `toggleFAQ` (línea 655)
- `formatPrice` (línea 680)
- `initScrollProgress` (línea 687)
- `measure` (línea 693)
- `paint` (línea 694)
- `initRippleButtons` (línea 712)
- `TextScramble` (línea 735)
- `initTextScramble` (línea 781)
- y 21 más

## Últimos cambios

- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache

