---
tags: [codigo, frontend]
ruta: "dstar-store/js/blog-transitions.js"
lineas: 279
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# blog-transitions.js

`dstar-store/js/blog-transitions.js` · 279 líneas

Transiciones entre páginas (blog y producto) con bandera en sessionStorage; si GSAP no carga, quita la capa negra para no dejar la pantalla en negro.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[index.html]]
- Usa: [[GSAP]]

## Funciones y clases

- `animatePageEnter` (línea 30)
- `animatePageExit` (línea 43)
- `initLinkInterception` (línea 71)
- `initArticleAnimations` (línea 116)
- `initScrollProgress` (línea 219)
- `initBlogGridReveal` (línea 237)
- `init` (línea 257)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-04-27 · `527d513` · Mobile UX: fix diagonal scroll, product card navigation, sticky CTA + agradecimientos updates
- 2026-04-17 · `06dfe43` · Producto: galería 3/4 contain, lightbox premium, animaciones glow en todos los botones

