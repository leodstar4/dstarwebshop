---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/orders-store.js"
lineas: 23
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# orders-store.js

`dstar-store/netlify/lib/orders-store.js` · 23 líneas

Pedidos en Netlify Blobs (store pedidos) sobre storage.js: get, set, update, list y claim/release, el lock con vencimiento que usan mp-preference.js y payment-service.js.

Parte de: [[Backend]]

## Conexiones

- Importa: [[storage.js]]

## Funciones y clases

- `openStore` (línea 2)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

