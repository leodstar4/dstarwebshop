---
tags: [codigo, pagina]
ruta: "dstar-store/index.html"
lineas: 384
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# index.html

`dstar-store/index.html` · 384 líneas

Página principal: loader cuyo script inline cambia el póster por un `<video>` (logo-3d-loader.mp4, sin alfa, con mix-blend-mode: lighten), crea temprano el worker de logo-3d-worker.js y solo en la primera visita de la sesión (sessionStorage dstar-intro) espera a que gire y a que el logo del hero esté listo; hero con logo 3D, drops (grid de productos), lookbook, about, blog, FAQ y contacto.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[logo-3d.js]], [[products-data.js]], [[cart-store.js]], [[app.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Carga estilos: [[style.css]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[agradecimientos.html]], [[terminos.html]]
- Referencia a: [[producto.html]], [[logo-3d-worker.js]]
- Usa: [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Últimos cambios

- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro

