---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1394
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1394 líneas

Lógica principal: render de productos, carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; marca is-scrolled en <html> y precarga el detalle de producto con intención de hover.

Parte de: [[Frontend]]

## Conexiones

- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`), [[cart-store.js]] (`DSTAR_CART`)
- Referencia a: [[producto.html]], [[checkout.html]], [[terminos.html]], [[index.html]], [[sw.js]]
- Usa: [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `cdnOpt` (línea 10)
- `initApp` (línea 42)
- `initLiveStock` (línea 82)
- `initNav` (línea 92)
- `setNav` (línea 97)
- `renderProducts` (línea 162)
- `isProductSoldOut` (línea 193)
- `cardBadgeHtml` (línea 197)
- `cardInfoHtml` (línea 202)
- `patchProductCard` (línea 219)
- `applyLiveStock` (línea 234)
- `initCardPrefetch` (línea 250)
- `warm` (línea 254)
- `cardOf` (línea 270)
- `initCart` (línea 285)
- `openCart` (línea 300)
- `closeCart` (línea 306)
- `updateCartUI` (línea 312)
- `changeQty` (línea 366)
- `removeFromCart` (línea 381)
- `saveCart` (línea 387)
- `stockDisponible` (línea 391)
- `escapeHtml` (línea 396)
- `handleCheckout` (línea 405)
- `initScrollAnimations` (línea 419)
- `showToast` (línea 437)
- `renderLookbook` (línea 527)
- `renderBlog` (línea 556)
- `renderFAQ` (línea 581)
- `toggleFAQ` (línea 609)
- `formatPrice` (línea 634)
- `initScrollProgress` (línea 641)
- `initRippleButtons` (línea 655)
- `TextScramble` (línea 678)
- `initTextScramble` (línea 724)
- `initProductPage` (línea 747)
- `set` (línea 781)
- `patchProductPageStock` (línea 831)
- `_pdInitMobileUX` (línea 872)
- `pdSrcset` (línea 931)
- y 14 más

## Últimos cambios

- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- 2026-10-10 · `a3628f5` · Carga más rápida: viewport antes de precargas, loader inline, logo 3D a 60fps, lookbook responsive, sin salto de layout

