---
tags: [codigo, frontend]
ruta: "dstar-store/js/app.js"
lineas: 2205
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# app.js

`dstar-store/js/app.js` · 2205 líneas

Lógica principal: initApp pinta con el catálogo que ya tiene cart-store.js y solo espera DSTAR_CATALOG_READY en la ficha si la pieza no está en local; applyCatalog (evento dstar:catalog) vuelve a pintar las tarjetas o recarga la ficha una vez si cambió algo más que el stock; render de productos, detalle de producto (galería y carrusel con placeholder borroso LQIP, y lightbox en `<dialog>` con vuelo FLIP, zoom, gestos táctiles y teclado), carrito (drawer con role dialog: inert mientras está cerrado, foco que entra y regresa, Escape y Tab atrapado; flyToCart hace volar una miniatura al ícono al agregar desde la ficha), stock en vivo, formularios de aviso (initAlertForm a /api/avisame y updateSizeAlert con las tallas agotadas; la llamada con #dropAlert queda inerte mientras index.html no tenga ese formulario), eventos product, add y alert con DSTAR_TRACK de metricas.js, lookbook, blog, FAQ, toasts y efectos de texto; ripple de los botones con un solo click delegado (initRippleButtons agrega un .btn-ripple) y reflejo que sigue al puntero con otro listener delegado (initGlassLight con --glass-x/--glass-y en .header__inner y .product-detail__add), inclinación 3D de las tarjetas hacia el puntero (initCardTilt: un pointermove delegado en #productsGrid con requestAnimationFrame, solo puntero fino y sin reduced motion, variables --card-rx/--card-ry/--card-px/--card-py), píldora del nav con aria-current="location" en la sección visible (initNavPill) e inclinación del logo del hero (initLogoTilt); sin handlers inline: un listener de error en captura aplica imgFallback a las imágenes con data-fallback, la FAQ usa data-faq y las tallas delegación en #pdSizes; arma las fotos de Cloudinary como `<picture>` con AVIF y f_auto de respaldo (cdnPicture, que también usa gsap-animations.js), marca is-scrolled en `<html>` y precarga el detalle de producto (primera foto y LQIP de la galería) con intención de hover; al hacer clic en una tarjeta le pone view-transition-name pd-photo a su foto.

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
- `catalogShape` (línea 129)
- `needsRebuild` (línea 130)
- `applyCatalog` (línea 133)
- `initLiveStock` (línea 156)
- `initNav` (línea 166)
- `setNav` (línea 171)
- `renderProducts` (línea 236)
- `isProductSoldOut` (línea 270)
- `cardBadgeHtml` (línea 274)
- `cardInfoHtml` (línea 279)
- `patchProductCard` (línea 296)
- `applyLiveStock` (línea 311)
- `initCardPrefetch` (línea 327)
- `warm` (línea 331)
- `cardOf` (línea 354)
- `clearMorph` (línea 365)
- `initCart` (línea 381)
- `openCart` (línea 410)
- `closeCart` (línea 422)
- `flyToCart` (línea 433)
- `inView` (línea 436)
- `done` (línea 459)
- `updateCartUI` (línea 473)
- `changeQty` (línea 531)
- `removeFromCart` (línea 546)
- `saveCart` (línea 552)
- `stockDisponible` (línea 556)
- `escapeHtml` (línea 561)
- `handleCheckout` (línea 570)
- `initScrollAnimations` (línea 584)
- `showToast` (línea 602)
- `renderLookbook` (línea 695)
- `renderBlog` (línea 723)
- `renderFAQ` (línea 752)
- `toggleFAQ` (línea 784)
- y 79 más

## Últimos cambios

- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla

