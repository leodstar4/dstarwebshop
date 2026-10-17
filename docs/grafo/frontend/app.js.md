---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1887
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1887 líneas

Lógica principal: render de productos, detalle de producto (galería y carrusel con placeholder borroso LQIP, y lightbox en `<dialog>` con vuelo FLIP, zoom, gestos táctiles y teclado), carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; sin handlers inline: un listener de error en captura aplica imgFallback a las imágenes con data-fallback, la FAQ usa data-faq y las tallas delegación en #pdSizes; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto (primera foto y LQIP de la galería) con intención de hover.

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
- `initLiveStock` (línea 117)
- `initNav` (línea 127)
- `setNav` (línea 132)
- `renderProducts` (línea 197)
- `isProductSoldOut` (línea 230)
- `cardBadgeHtml` (línea 234)
- `cardInfoHtml` (línea 239)
- `patchProductCard` (línea 256)
- `applyLiveStock` (línea 271)
- `initCardPrefetch` (línea 287)
- `warm` (línea 291)
- `cardOf` (línea 314)
- `initCart` (línea 329)
- `openCart` (línea 344)
- `closeCart` (línea 350)
- `updateCartUI` (línea 356)
- `changeQty` (línea 414)
- `removeFromCart` (línea 429)
- `saveCart` (línea 435)
- `stockDisponible` (línea 439)
- `escapeHtml` (línea 444)
- `handleCheckout` (línea 453)
- `initScrollAnimations` (línea 467)
- `showToast` (línea 485)
- `renderLookbook` (línea 578)
- `renderBlog` (línea 606)
- `renderFAQ` (línea 635)
- `toggleFAQ` (línea 667)
- `formatPrice` (línea 692)
- `initScrollProgress` (línea 699)
- `measure` (línea 705)
- `paint` (línea 706)
- `initRippleButtons` (línea 724)
- `TextScramble` (línea 747)
- `initTextScramble` (línea 793)
- y 60 más

## Últimos cambios

- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes

