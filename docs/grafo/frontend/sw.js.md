---
tags: [codigo, frontend]
ruta: "dstar-store/sw.js"
lineas: 89
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# sw.js

`dstar-store/sw.js` · 89 líneas

Service worker de la PWA: precache del shell (incluye js/loader.js), network-first para los archivos del sitio e imágenes de Cloudinary cache-first (hasta 80, pedidas en modo CORS y guardadas solo si responden ok); no intercepta /api, el checkout, las páginas de resultado del pago, /pedidos, /seguimiento, los .mp4 ni las peticiones con Range.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[index.html]], [[offline.html]], [[style.css]], [[products-data.js]], [[cart-store.js]], [[app.js]], [[loader.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Usa: [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `networkFirst` (línea 37)
- `trim` (línea 51)
- `cacheFirst` (línea 57)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla

