---
tags: [contexto]
---
# Rendimiento y PWA

- PWA: [[sw.js]], [[manifest.webmanifest]] y [[offline.html]].
- Logo 3D: [[logo-3d.js]] reproduce video con alfa compuesto en WebGL y mantiene el mismo aspecto en modo de ahorro de batería.
- Animaciones: [[gsap-animations.js]] usa IntersectionObserver para los reveals (sin ScrollTrigger) y CSS scroll-driven donde se puede. El CSS nunca oculta contenido: el JS lo oculta justo antes de animarlo, así que si GSAP falla todo sigue visible. El hero espera a que se vaya el loader (clase `is-loaded`).
- Navegación: [[blog-transitions.js]] y precarga de páginas; el sitio respeta bfcache.
- Imágenes: [[optimize-images.js (dstar-store)]] y [[optimize-images.js (scripts)]] con [[sharp]], servidas por [[Cloudinary]].
- Medición: [[diagnostico.js]] y [[Lighthouse]].

Parte de: [[DSTAR]]
