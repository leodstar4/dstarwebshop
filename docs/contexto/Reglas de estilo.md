---
tags: [contexto]
---
# Reglas de estilo

Resumen de [[CLAUDE]]; los estilos viven en [[style.css]].

- Vanilla HTML, CSS y JS; sin frameworks ni TypeScript.
- Sin comentarios en el código salvo que sean estrictamente necesarios.
- CSS en BEM (`.bloque__elemento--modificador`), mobile-first y con las custom properties de `:root`.
- Imágenes siempre desde [[Cloudinary]] en AVIF con `<picture>`: `<source type="image/avif">` con `f_avif,q_auto,dpr_auto` y un `<img>` de respaldo con `f_auto,q_auto,dpr_auto`, ambos con `w_` responsive, `loading="lazy"` y `decoding="async"`. En JS se usa `cdnPicture()` de [[app.js]]; en CSS, `image-set()` con `type('image/avif')`. Nunca `f_auto` solo: entrega JPEG XL, que pesa más y decodifica más lento (regla de [[CLAUDE]] actualizada el 2026-10-12).
- Animaciones respetan `prefers-reduced-motion` ([[gsap-animations.js]]) y los revelados de scroll solo animan `opacity` y `transform` (WAAPI con `element.animate()`); el JS oculta cada elemento justo antes de animarlo, así que sin JS nada queda oculto; sin `will-change` permanente en tarjetas, paneles del lookbook ni `.hero__content`.
- Targets táctiles de 44x44px mínimo y `aria-*` en todo elemento interactivo.
- `100svh` en hero y secciones a pantalla completa, `100dvh` solo en overlays fijos; nunca `100vh`.
- `backdrop-filter` solo en elementos chicos y fijos de navegación.
- `font-display: swap` en todas las fuentes ([[Google Fonts]]).

Convenciones del código desde la auditoría del 2026-10-17 (no están en [[CLAUDE]]):

- Sin `<script>` ni handlers inline (`onclick`, `onerror`, `onload`): la CSP no los permite. Usar un archivo `.js` y listeners (`data-fallback` en imágenes, delegación de eventos). Si un script inline es inevitable, correr `node scripts/csp-hashes.js` ([[csp-hashes.js]]) para que su hash entre en la CSP ([[Seguridad]]).
- `viewport-fit=cover` en el meta viewport de las páginas nuevas, y los márgenes de elementos fijos con `env(safe-area-inset-*)` en el bloque SAFE AREAS de [[style.css]].
- Páginas privadas con `<meta name="robots" content="noindex">`; las públicas con canonical, `og:*` y `twitter:card` ([[Despliegue]]).

Parte de: [[DSTAR]]
