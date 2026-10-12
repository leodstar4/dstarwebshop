---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 1395
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 1395 líneas

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
- `renderProducts` (línea 163)
- `isProductSoldOut` (línea 194)
- `cardBadgeHtml` (línea 198)
- `cardInfoHtml` (línea 203)
- `patchProductCard` (línea 220)
- `applyLiveStock` (línea 235)
- `initCardPrefetch` (línea 251)
- `warm` (línea 255)
- `cardOf` (línea 271)
- `initCart` (línea 286)
- `openCart` (línea 301)
- `closeCart` (línea 307)
- `updateCartUI` (línea 313)
- `changeQty` (línea 367)
- `removeFromCart` (línea 382)
- `saveCart` (línea 388)
- `stockDisponible` (línea 392)
- `escapeHtml` (línea 397)
- `handleCheckout` (línea 406)
- `initScrollAnimations` (línea 420)
- `showToast` (línea 438)
- `renderLookbook` (línea 528)
- `renderBlog` (línea 557)
- `renderFAQ` (línea 582)
- `toggleFAQ` (línea 610)
- `formatPrice` (línea 635)
- `initScrollProgress` (línea 642)
- `initRippleButtons` (línea 656)
- `TextScramble` (línea 679)
- `initTextScramble` (línea 725)
- `initProductPage` (línea 748)
- `set` (línea 782)
- `patchProductPageStock` (línea 832)
- `_pdInitMobileUX` (línea 873)
- `pdSrcset` (línea 932)
- y 14 más

## Últimos cambios

- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `4a93fdf` · Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas

