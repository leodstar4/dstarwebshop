---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1400
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1400 líneas

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
- `isProductSoldOut` (línea 189)
- `cardBadgeHtml` (línea 193)
- `cardInfoHtml` (línea 198)
- `patchProductCard` (línea 215)
- `applyLiveStock` (línea 230)
- `initCardPrefetch` (línea 246)
- `warm` (línea 250)
- `initCart` (línea 276)
- `openCart` (línea 291)
- `closeCart` (línea 297)
- `updateCartUI` (línea 303)
- `changeQty` (línea 357)
- `removeFromCart` (línea 372)
- `saveCart` (línea 378)
- `stockDisponible` (línea 382)
- `escapeHtml` (línea 387)
- `handleCheckout` (línea 396)
- `initScrollAnimations` (línea 410)
- `showToast` (línea 428)
- `renderLookbook` (línea 518)
- `renderBlog` (línea 547)
- `renderFAQ` (línea 572)
- `toggleFAQ` (línea 600)
- `formatPrice` (línea 625)
- `initScrollProgress` (línea 632)
- `initRippleButtons` (línea 646)
- `TextScramble` (línea 669)
- `initTextScramble` (línea 715)
- `initProductPage` (línea 738)
- `set` (línea 772)
- `patchProductPageStock` (línea 824)
- `_pdRevealPage` (línea 863)
- `clearFlag` (línea 864)
- `_pdInitMobileUX` (línea 878)
- y 15 más

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- 2026-10-10 · `a3628f5` · Carga más rápida: viewport antes de precargas, loader inline, logo 3D a 60fps, lookbook responsive, sin salto de layout
- 2026-10-10 · `8e69a51` · Logo 3D girando (AVIF animada) en loader y hero, script de diagnóstico de fluidez

