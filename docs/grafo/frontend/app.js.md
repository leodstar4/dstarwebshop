---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1889
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1889 líneas

Lógica principal (initApp espera DSTAR_CATALOG_READY de cart-store.js antes de pintar): render de productos, detalle de producto (galería y carrusel con placeholder borroso LQIP, y lightbox en `<dialog>` con vuelo FLIP, zoom, gestos táctiles y teclado), carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; sin handlers inline: un listener de error en captura aplica imgFallback a las imágenes con data-fallback, la FAQ usa data-faq y las tallas delegación en #pdSizes; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto (primera foto y LQIP de la galería) con intención de hover.

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
- `initApp` (línea 77)
- `initLiveStock` (línea 119)
- `initNav` (línea 129)
- `setNav` (línea 134)
- `renderProducts` (línea 199)
- `isProductSoldOut` (línea 232)
- `cardBadgeHtml` (línea 236)
- `cardInfoHtml` (línea 241)
- `patchProductCard` (línea 258)
- `applyLiveStock` (línea 273)
- `initCardPrefetch` (línea 289)
- `warm` (línea 293)
- `cardOf` (línea 316)
- `initCart` (línea 331)
- `openCart` (línea 346)
- `closeCart` (línea 352)
- `updateCartUI` (línea 358)
- `changeQty` (línea 416)
- `removeFromCart` (línea 431)
- `saveCart` (línea 437)
- `stockDisponible` (línea 441)
- `escapeHtml` (línea 446)
- `handleCheckout` (línea 455)
- `initScrollAnimations` (línea 469)
- `showToast` (línea 487)
- `renderLookbook` (línea 580)
- `renderBlog` (línea 608)
- `renderFAQ` (línea 637)
- `toggleFAQ` (línea 669)
- `formatPrice` (línea 694)
- `initScrollProgress` (línea 701)
- `measure` (línea 707)
- `paint` (línea 708)
- `initRippleButtons` (línea 726)
- `TextScramble` (línea 749)
- `initTextScramble` (línea 795)
- y 60 más

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop

