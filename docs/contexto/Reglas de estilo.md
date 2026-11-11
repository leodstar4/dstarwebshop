---
tags: [contexto]
---
# Reglas de estilo

Resumen de [[CLAUDE]]; los estilos viven en [[style.css]].

- Vanilla HTML, CSS y JS; sin frameworks ni TypeScript.
- Sin comentarios en el código salvo que sean estrictamente necesarios.
- CSS en BEM (`.bloque__elemento--modificador`), mobile-first y con las custom properties de `:root`.
- Imágenes siempre desde [[Cloudinary]] en AVIF con `<picture>`: `<source type="image/avif">` con `f_avif,q_auto,dpr_auto` y un `<img>` de respaldo con `f_auto,q_auto,dpr_auto`, ambos con `w_` responsive, `loading="lazy"` y `decoding="async"`. En JS se usa `cdnPicture()` de [[app.js]]; en CSS, `image-set()` con `type('image/avif')`. Nunca `f_auto` solo: entrega JPEG XL, que pesa más y decodifica más lento (regla de [[CLAUDE]] actualizada el 2026-10-12).
- Animaciones respetan `prefers-reduced-motion` ([[gsap-animations.js]]) y los revelados de scroll solo animan `opacity` y `transform` (WAAPI con `element.animate()`); el JS oculta cada elemento justo antes de animarlo, así que sin JS nada queda oculto; las animaciones ligadas al scroll van con `animation-timeline` dentro de `@supports` y `prefers-reduced-motion: no-preference` (bloque INMERSIÓN de [[style.css]]); sin `will-change` permanente en tarjetas, paneles del lookbook ni `.hero__content`. No animar `scale` sobre texto: obliga a re-rasterizarlo en cada cuadro; las entradas de texto usan translate, rotate y `opacity` ([[Rendimiento y PWA]]).
- Targets táctiles de 44x44px mínimo y `aria-*` en todo elemento interactivo.
- `100svh` en hero y secciones a pantalla completa, `100dvh` solo en overlays fijos; nunca `100vh`.
- `backdrop-filter` solo en elementos chicos y fijos de navegación (header, menú móvil, carrito, toast y barra de compra fija). Los botones no lo usan: son placas blancas planas con hover gris claro y brillo, checkout y barra fija en píldora, y controles de línea fina. Todo vive en un solo bloque, "BOTONES — diseño de producción" de [[style.css]], sin `!important`, y la presión va con la propiedad `scale`, no con `transform` ([[Rendimiento y PWA]]).
- **No rediseñar botones, formas ni tarjetas sin mostrarle antes una propuesta al dueño.** El 2026-11-10 rechazó dos rediseños de botones (liquid glass y placas con esquina cortada) y se volvió al aspecto de la versión publicada. Sí pidió conservar las animaciones: vuelo al carrito, paso de la tarjeta a la ficha, píldora del menú, logo que se inclina y el bloque INMERSIÓN.
- `font-display: swap` en todas las fuentes ([[Google Fonts]]).
- [[museo.html]] no carga [[style.css]]: [[museo.css]] repite en su propio `:root` los tokens que usa (colores, fuentes, vidrio) y sigue las mismas reglas (BEM, mobile-first, 44 px, reduced motion). Sus botones se rehicieron el 2026-11-10 a pedido del dueño: la barra superior `.museo-bar` y el dock `.museo-hud` son cápsulas de vidrio con `backdrop-filter` (igual que `.museo-ficha`, sobre el canvas) y botones fantasma con icono dentro; `.museo-btn--light` es una placa blanca plana con brillo al apuntar, como las de la tienda. Con el probador (2026-11-11) se sumaron `.museo-btn--line`, el botón de línea PROBAR / QUITAR junto a VER PIEZA, y `.museo-btn--icon`, el botón de solo ícono del dock ([[Rendimiento y PWA]]).

Convenciones del código desde la auditoría del 2026-10-17 (no están en [[CLAUDE]]):

- Sin `<script>` ni handlers inline (`onclick`, `onerror`, `onload`): la CSP no los permite. Usar un archivo `.js` y listeners (`data-fallback` en imágenes, delegación de eventos). Si un script inline es inevitable, correr `node scripts/csp-hashes.js` ([[csp-hashes.js]]) para que su hash entre en la CSP ([[Seguridad]]).
- `viewport-fit=cover` en el meta viewport de las páginas nuevas, y los márgenes de elementos fijos con `env(safe-area-inset-*)` en el bloque SAFE AREAS de [[style.css]].
- Páginas privadas con `<meta name="robots" content="noindex">`; las públicas con canonical, `og:*` y `twitter:card` ([[Despliegue]]).

Parte de: [[DSTAR]]
