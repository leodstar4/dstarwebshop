---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/seguridad-y-seo.spec.js"
lineas: 197
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# seguridad-y-seo.spec.js

`dstar-store/tests/e2e/seguridad-y-seo.spec.js` · 197 líneas

Pruebas de la auditoría del 2026-10-17: CSP real sin violaciones por página, metadatos de SEO y noindex, 404, enlaces a Instagram, edge functions producto-meta y sitemap, 429 de cotizar-envio y panel de pedidos.

Parte de: [[Pruebas]]

## Conexiones

- Llama a la API: [[pedidos.js (handlers)]] (`/api/pedidos`)
- Usa la global: [[correcciones.test.cjs]] (`DSTAR_MEMORY_STORE`), [[products-data.js]] (`DSTAR_PRODUCTS`)
- Visita: [[index.html]], [[pedidos.html]]
- Referencia a: [[producto.html]], [[terminos.html]], [[agradecimientos.html]], [[checkout.html]], [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]], [[offline.html]], [[storage.js]], [[born-to-shine-detras-del-drop.html]], [[como-cuidar-tu-ropa.html]], [[streetwear-mexico-escena.html]], [[csp-hashes.js]], [[cotizar-envio.js]]
- Usa: [[Playwright]], [[Netlify]], [[Cloudinary]]
- Lee la variable: [[DSTAR_MEMORY_STORE]], [[PANEL_PASSWORD]]

## Funciones y clases

- `cargarEdge` (línea 95)
- `ev` (línea 185)

## Casos de prueba

- Seguridad — CSP sin unsafe-inline
- script-src no permite inline y los hashes están al día
- sin bloqueos de la CSP en ${url}
- SEO — metadatos para buscadores y redes
- ${url} tiene canonical e imagen para compartir
- ${url} no se indexa
- una ruta que no existe muestra la página 404 de la marca
- las redes enlazan a Instagram real y no quedan links vacíos
- Edge functions y límites (sin red)
- producto-meta pone nombre, precio, foto y canonical de la prenda
- sitemap incluye cada producto y las páginas públicas
- cotizar-envio responde 429 cuando una misma IP abusa
- Panel de pedidos
- pide contraseña, muestra los pedidos y escapa los datos del cliente
- la función exige PANEL_PASSWORD y la contraseña correcta

## Últimos cambios

- 2026-10-20 · `6169aeb` · Dominio dstar4.party en canonical, Open Graph, JSON-LD, sitemap y robots
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

