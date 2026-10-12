---
tags: [codigo, frontend]
ruta: "dstar-store/js/blog-transitions.js"
lineas: 169
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# blog-transitions.js

`dstar-store/js/blog-transitions.js` · 169 líneas

Animaciones de los artículos del blog: entrada del encabezado, título palabra por palabra con SplitText, reveal del contenido con IntersectionObserver y barra de progreso de lectura con ScrollTrigger cuando el navegador no soporta animation-timeline.

Parte de: [[Frontend]]

## Conexiones

- Usa: [[GSAP]]

## Funciones y clases

- `initArticleAnimations` (línea 20)
- `initScrollProgress` (línea 123)
- `initBlogGridReveal` (línea 141)
- `init` (línea 154)

## Últimos cambios

- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-04-27 · `527d513` · Mobile UX: fix diagonal scroll, product card navigation, sticky CTA + agradecimientos updates

