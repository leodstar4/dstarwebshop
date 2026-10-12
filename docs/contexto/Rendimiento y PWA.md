---
tags: [contexto]
---
# Rendimiento y PWA

- PWA: [[sw.js]], [[manifest.webmanifest]] y [[offline.html]]. Al cambiar archivos del shell se sube `VERSION` en [[sw.js]] y el `?v=` de CSS/JS en los HTML.
- Logo 3D: [[logo-3d.js]] reproduce video con alfa compuesto en WebGL y mantiene el mismo aspecto en modo de ahorro de batería. Limita el `devicePixelRatio` a 2, dibuja a unos 30 fps y pausa el video (`park`) cuando ninguna vista del logo es visible.
- Loader de [[index.html]]: solo en la primera visita de la sesión (sessionStorage `dstar-intro`). En visitas repetidas se oculta sin transición en cuanto carga el CSS y pierde `data-logo-3d`, así que no se crea un segundo contexto WebGL.
- Hero: `100svh`. En desktop (≥769px) reserva arriba el alto del header fijo y abajo el del indicador de scroll (`--hero-top`/`--hero-bottom` en [[style.css]]), con `min-height: 560px`; el logo calcula su alto con el espacio disponible para no chocar con el header en laptops bajas.
- Animaciones: los reveals de [[gsap-animations.js]] no usan tweens de GSAP por cuadro. `reveal()` pone la clase `.rv` (oculto) y un IntersectionObserver (rootMargin de 6 % hacia abajo) la cambia por `.rv-run`, que solo trae la transición CSS de `opacity` y `transform` ([[style.css]]); modificadores `.rv--zoom`, `.rv--line` y `.rv--stamp`, y el escalonado va en `--rv-d`. Solo corre si `window.gsap` existe y no hay `prefers-reduced-motion`, así que si GSAP falla todo sigue visible. GSAP queda para el contador de Nosotros (`initCounters`), el cursor y los botones magnéticos. El hero usa solo sus animaciones CSS y espera a que se vaya el loader (clase `is-loaded`); el index ya no carga SplitText. Nada de `clip-path` ni `backface-visibility`, y sin `will-change` en tarjetas ni paneles del lookbook; el cursor crece con `scale` en vez de cambiar `width`/`height`. Las animaciones de los artículos viven en [[blog-transitions.js]].
- Scroll: [[app.js]] pone `is-scrolled` en `<html>` pasados 100 px, lo que pausa la marquesina del anuncio y el pulso del indicador de scroll. El pulso de escasez de las tarjetas corre 3 veces y solo después del reveal.
- Navegación entre páginas: View Transition nativa entre documentos (`@view-transition { navigation: auto; }` en [[style.css]], 0.22 s, solo con `prefers-reduced-motion: no-preference`). Ya no hay velo negro ni transición por JS. [[index.html]] prerenderiza `producto.html` con speculation rules y [[app.js]] precalienta la imagen y hace `prefetch` del detalle cuando el puntero se queda 150 ms sobre una tarjeta, o al instante con `pointerdown`/`touchstart`. El sitio respeta bfcache.
- Imágenes: tarjetas de producto con `srcset` 400/600/900 y `sizes` ([[app.js]]). [[optimize-images.js (dstar-store)]] y [[optimize-images.js (scripts)]] con [[sharp]], servidas por [[Cloudinary]].
- Medición: [[diagnostico.js]] y [[Lighthouse]].

Parte de: [[DSTAR]]
