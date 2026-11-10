---
tags: [codigo, pagina]
ruta: "dstar-store/producto.html"
lineas: 256
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# producto.html

`dstar-store/producto.html` · 256 líneas

Detalle de producto: galería, selector de talla y botón de compra, con el formulario #pdAlert (avísame si vuelve una talla agotada, oculto si no hay tallas agotadas) bajo el botón y un solo `<dialog class="pd-lightbox">` (#pdLightbox) para móvil y desktop, que llena app.js; precarga desde el `<head>` la primera foto en AVIF con un script inline permitido por hash, carga js/metricas.js, y sus title, canonical y og:* genéricos los reescribe por prenda la edge function producto-meta.js.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[products-data.js]], [[metricas.js]], [[cart-store.js]], [[app.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Carga estilos: [[style.css]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[index.html]], [[privacidad.html]], [[terminos.html]]
- Usa la global: [[cart-store.js]] (`DSTAR_PRODUCTS`)
- Usa: [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Últimos cambios

- 2026-10-20 · `6169aeb` · Dominio dstar4.party en canonical, Open Graph, JSON-LD, sitemap y robots
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-17 · `836ac92` · Galería de producto: lightbox premium en desktop y móvil, placeholders borrosos y fotos que ya no quedan rotas en caché
- 2026-10-13 · `37812a9` · Logo girando en la pantalla de carga y entrada de "TODO CON AMOR" fluida

