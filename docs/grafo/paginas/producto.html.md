---
tags: [codigo, pagina]
ruta: "dstar-store/producto.html"
lineas: 239
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# producto.html

`dstar-store/producto.html` · 239 líneas

Detalle de producto: galería, selector de talla y botón de compra, con un solo `<dialog class="pd-lightbox">` (#pdLightbox) para móvil y desktop que llena app.js; precarga desde el `<head>` la primera foto en AVIF con un script inline permitido por hash, y sus title, canonical y og:* genéricos los reescribe por prenda la edge function producto-meta.js.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[products-data.js]], [[cart-store.js]], [[app.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Carga estilos: [[style.css]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[index.html]], [[terminos.html]]
- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`)
- Usa: [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Últimos cambios

- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop

