---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1387
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1387 líneas

Lógica principal: render de productos, carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto.

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
- `renderProducts` (línea 160)
- `isProductSoldOut` (línea 191)
- `cardBadgeHtml` (línea 195)
- `cardInfoHtml` (línea 200)
- `patchProductCard` (línea 217)
- `applyLiveStock` (línea 232)
- `initCardPrefetch` (línea 248)
- `warm` (línea 252)
- `initCart` (línea 278)
- `openCart` (línea 293)
- `closeCart` (línea 299)
- `updateCartUI` (línea 305)
- `changeQty` (línea 359)
- `removeFromCart` (línea 374)
- `saveCart` (línea 380)
- `stockDisponible` (línea 384)
- `escapeHtml` (línea 389)
- `handleCheckout` (línea 398)
- `initScrollAnimations` (línea 412)
- `showToast` (línea 430)
- `renderLookbook` (línea 520)
- `renderBlog` (línea 549)
- `renderFAQ` (línea 574)
- `toggleFAQ` (línea 602)
- `formatPrice` (línea 627)
- `initScrollProgress` (línea 634)
- `initRippleButtons` (línea 648)
- `TextScramble` (línea 671)
- `initTextScramble` (línea 717)
- `initProductPage` (línea 740)
- `set` (línea 774)
- `patchProductPageStock` (línea 824)
- `_pdInitMobileUX` (línea 865)
- `pdSrcset` (línea 924)
- `_pdBuildStack` (línea 926)
- y 13 más

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- 2026-10-10 · `a3628f5` · Carga más rápida: viewport antes de precargas, loader inline, logo 3D a 60fps, lookbook responsive, sin salto de layout
- 2026-10-10 · `8e69a51` · Logo 3D girando (AVIF animada) en loader y hero, script de diagnóstico de fluidez

