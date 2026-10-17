---
tags: [codigo, frontend]
ruta: "dstar-store/sw.js"
lineas: 88
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# sw.js

`dstar-store/sw.js` · 88 líneas

Service worker de la PWA: precache del shell, network-first para los archivos del sitio e imágenes de Cloudinary cache-first (hasta 80, pedidas en modo CORS y guardadas solo si responden ok); no intercepta /api, el checkout, las páginas de resultado del pago, los .mp4 ni las peticiones con Range.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[index.html]], [[offline.html]], [[style.css]], [[products-data.js]], [[cart-store.js]], [[app.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Usa: [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `networkFirst` (línea 36)
- `trim` (línea 50)
- `cacheFirst` (línea 56)

## Últimos cambios

- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida
- 2026-10-13 · `3ae33e4` · Logo 3D más fluido y nítido en celulares y botón VER DROPS que aparece antes
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro

