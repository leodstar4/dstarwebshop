---
tags: [contexto]
---
# Reglas de estilo

Resumen de [[CLAUDE]]; los estilos viven en [[style.css]].

- Vanilla HTML, CSS y JS; sin frameworks ni TypeScript.
- Sin comentarios en el código salvo que sean estrictamente necesarios.
- CSS en BEM (`.bloque__elemento--modificador`), mobile-first y con las custom properties de `:root`.
- Imágenes siempre desde [[Cloudinary]] con `f_auto,q_auto,dpr_auto` y `w_` responsive, con `loading="lazy"` y `decoding="async"`.
- Animaciones respetan `prefers-reduced-motion` ([[gsap-animations.js]]).
- Targets táctiles de 44x44px mínimo y `aria-*` en todo elemento interactivo.
- `100svh` en hero y secciones a pantalla completa, `100dvh` solo en overlays fijos; nunca `100vh`.
- `backdrop-filter` solo en elementos chicos y fijos de navegación.
- `font-display: swap` en todas las fuentes ([[Google Fonts]]).

Parte de: [[DSTAR]]
