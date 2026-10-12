---
tags: [codigo, pagina]
ruta: "dstar-store/index.html"
lineas: 346
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# index.html

`dstar-store/index.html` · 346 líneas

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

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `89f5597` · Logo 3D: video directo otra vez (la CSP bloqueaba blob: y forzaba el decodificador lento), loader espera al respaldo en 
- 2026-10-11 · `9948892` · Logo 3D en modo de ahorro: arranca en el loader, ritmo parejo a 30 fps, una sola descarga y un solo canvas activo
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `461aa1d` · Ícono de la PWA con fondo blanco y logo a color

