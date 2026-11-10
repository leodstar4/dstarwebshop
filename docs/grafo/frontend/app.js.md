---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 2172
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 2172 líneas

Lógica principal: initApp pinta con el catálogo que ya tiene cart-store.js y solo espera DSTAR_CATALOG_READY en la ficha si la pieza no está en local; applyCatalog (evento dstar:catalog) vuelve a pintar las tarjetas o recarga la ficha una vez si cambió algo más que el stock; render de productos, detalle de producto (galería y carrusel con placeholder borroso LQIP, y lightbox en `<dialog>` con vuelo FLIP, zoom, gestos táctiles y teclado), carrito (drawer con role dialog: inert mientras está cerrado, foco que entra y regresa, Escape y Tab atrapado; flyToCart hace volar una miniatura al ícono al agregar desde la ficha), stock en vivo, formularios de aviso (initAlertForm a /api/avisame y updateSizeAlert con las tallas agotadas), eventos product, add y alert con DSTAR_TRACK de metricas.js, lookbook, blog, FAQ, toasts y efectos de texto; efectos de los botones de style.css con listeners delegados (initRippleButtons con .btn-ripple e initGlassLight con --glass-x/--glass-y), píldora del nav con aria-current="location" en la sección visible (initNavPill) e inclinación del logo del hero (initLogoTilt); sin handlers inline: un listener de error en captura aplica imgFallback a las imágenes con data-fallback, la FAQ usa data-faq y las tallas delegación en #pdSizes; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto (primera foto y LQIP de la galería) con intención de hover; al hacer clic en una tarjeta le pone view-transition-name pd-photo a su foto.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[avisame.js]] (`/api/avisame`)
- Usa la global: [[cart-store.js]] (`DSTAR_PRODUCTS`), [[metricas.js]] (`DSTAR_TRACK`)
- Referencia a: [[producto.html]], [[checkout.html]], [[terminos.html]], [[index.html]], [[sw.js]]
- Usa: [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `cdnOpt` (línea 10)
- `cdnSrcset` (línea 24)
- `cdnPicture` (línea 28)
- `imgFallback` (línea 41)
- `initApp` (línea 79)
- `catalogShape` (línea 128)
- `needsRebuild` (línea 129)
- `applyCatalog` (línea 132)
- `initLiveStock` (línea 155)
- `initNav` (línea 165)
- `setNav` (línea 170)
- `renderProducts` (línea 235)
- `isProductSoldOut` (línea 269)
- `cardBadgeHtml` (línea 273)
- `cardInfoHtml` (línea 278)
- `patchProductCard` (línea 295)
- `applyLiveStock` (línea 310)
- `initCardPrefetch` (línea 326)
- `warm` (línea 330)
- `cardOf` (línea 353)
- `clearMorph` (línea 364)
- `initCart` (línea 380)
- `openCart` (línea 409)
- `closeCart` (línea 421)
- `flyToCart` (línea 432)
- `inView` (línea 435)
- `done` (línea 458)
- `updateCartUI` (línea 472)
- `changeQty` (línea 530)
- `removeFromCart` (línea 545)
- `saveCart` (línea 551)
- `stockDisponible` (línea 555)
- `escapeHtml` (línea 560)
- `handleCheckout` (línea 569)
- `initScrollAnimations` (línea 583)
- `showToast` (línea 601)
- `renderLookbook` (línea 694)
- `renderBlog` (línea 722)
- `renderFAQ` (línea 751)
- `toggleFAQ` (línea 783)
- y 77 más

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop

