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

Parte de: [[DSTAR]]
