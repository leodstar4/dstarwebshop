---
tags: [codigo, pagina]
ruta: "dstar-store/index.html"
lineas: 347
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# index.html

`dstar-store/index.html` · 347 líneas

Página principal: loader (solo en la primera visita de la sesión, sessionStorage dstar-intro), hero con logo 3D, drops (grid de productos), lookbook, about, blog, FAQ y contacto.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[logo-3d.js]], [[products-data.js]], [[cart-store.js]], [[app.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Carga estilos: [[style.css]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[agradecimientos.html]], [[terminos.html]]
- Referencia a: [[producto.html]]
- Usa: [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Últimos cambios

- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `89f5597` · Logo 3D: video directo otra vez (la CSP bloqueaba blob: y forzaba el decodificador lento), loader espera al respaldo en 
- 2026-10-11 · `9948892` · Logo 3D en modo de ahorro: arranca en el loader, ritmo parejo a 30 fps, una sola descarga y un solo canvas activo

