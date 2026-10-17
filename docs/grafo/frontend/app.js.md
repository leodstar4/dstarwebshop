---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1873
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1873 líneas

Lógica principal: render de productos, detalle de producto (galería y carrusel con placeholder borroso LQIP, y lightbox en `<dialog>` con vuelo FLIP, zoom, gestos táctiles y teclado), carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto (primera foto y LQIP de la galería) con intención de hover.

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
- `cardOf` (línea 307)
- `initCart` (línea 322)
- `openCart` (línea 337)
- `closeCart` (línea 343)
- `updateCartUI` (línea 349)
- `changeQty` (línea 407)
- `removeFromCart` (línea 422)
- `saveCart` (línea 428)
- `stockDisponible` (línea 432)
- `escapeHtml` (línea 437)
- `handleCheckout` (línea 446)
- `initScrollAnimations` (línea 460)
- `showToast` (línea 478)
- `renderLookbook` (línea 571)
- `renderBlog` (línea 599)
- `renderFAQ` (línea 628)
- `toggleFAQ` (línea 656)
- `formatPrice` (línea 681)
- `initScrollProgress` (línea 688)
- `measure` (línea 694)
- `paint` (línea 695)
- `initRippleButtons` (línea 713)
- `TextScramble` (línea 736)
- `initTextScramble` (línea 782)
- y 60 más

## Últimos cambios

- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

