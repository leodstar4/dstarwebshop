---
tags: [codigo, backend]
ruta: "dstar-store/netlify/edge-functions/sitemap.js"
lineas: 30
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# sitemap.js

`dstar-store/netlify/edge-functions/sitemap.js` · 30 líneas

Edge function /sitemap.xml: lista las páginas públicas (incluida privacidad.html) y cada producto activo de /api/catalogo, con products-data.js de respaldo.

Parte de: [[Backend]]

## Conexiones

- Llama a la API: [[catalogo.js]] (`/api/catalogo`)
- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`)
- Referencia a: [[terminos.html]], [[privacidad.html]], [[agradecimientos.html]], [[producto.html]], [[born-to-shine-detras-del-drop.html]], [[como-cuidar-tu-ropa.html]], [[streetwear-mexico-escena.html]]

## Funciones y clases

- `esc` (línea 14)

## Últimos cambios

- 2026-10-20 · `6169aeb` · Dominio dstar4.party en canonical, Open Graph, JSON-LD, sitemap y robots
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

