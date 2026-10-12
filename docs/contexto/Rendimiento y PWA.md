---
tags: [contexto]
---
# Rendimiento y PWA

- PWA: [[sw.js]], [[manifest.webmanifest]] y [[offline.html]]. Al cambiar archivos del shell se sube `VERSION` en [[sw.js]] y el `?v=` de CSS/JS en los HTML.
- Logo 3D: [[logo-3d.js]] reproduce video con alfa compuesto en WebGL y mantiene el mismo aspecto en modo de ahorro de batería.
- Loader de [[index.html]]: solo en la primera visita de la sesión (sessionStorage `dstar-intro`). En visitas repetidas se oculta sin transición en cuanto carga el CSS.
- Hero: `100svh`. En desktop (≥769px) reserva arriba el alto del header fijo y abajo el del indicador de scroll (`--hero-top`/`--hero-bottom` en [[style.css]]), con `min-height: 560px`; el logo calcula su alto con el espacio disponible para no chocar con el header en laptops bajas.
- Animaciones: [[gsap-animations.js]] usa IntersectionObserver para los reveals (sin ScrollTrigger) y CSS scroll-driven donde se puede. Solo animan `transform` y `opacity` (nada de `clip-path`, que repinta cada cuadro). El CSS nunca oculta contenido: el JS lo oculta justo antes de animarlo, así que si GSAP falla todo sigue visible. El hero espera a que se vaya el loader (clase `is-loaded`). Las animaciones de los artículos viven en [[blog-transitions.js]].
- Navegación entre páginas: View Transition nativa entre documentos (`@view-transition { navigation: auto; }` en [[style.css]], 0.22 s, solo con `prefers-reduced-motion: no-preference`). Ya no hay velo negro ni transición por JS. [[index.html]] prerenderiza `producto.html` con speculation rules y [[app.js]] precalienta la imagen y hace `prefetch` del detalle al tocar una tarjeta. El sitio respeta bfcache.
- Imágenes: tarjetas de producto con `srcset` 400/600/900 y `sizes` ([[app.js]]). [[optimize-images.js (dstar-store)]] y [[optimize-images.js (scripts)]] con [[sharp]], servidas por [[Cloudinary]].
- Medición: [[diagnostico.js]] y [[Lighthouse]].

Parte de: [[DSTAR]]
