---
tags: [codigo, frontend]
ruta: "dstar-store/js/cart-store.js"
lineas: 79
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# cart-store.js

`dstar-store/js/cart-store.js` · 79 líneas

Carrito en localStorage (dstar_cart) y sincronización del stock con /api/stock.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[stock.js]] (`/api/stock`)
- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`)

## Funciones y clases

- `catalog` (línea 4)
- `stockFor` (línea 8)
- `load` (línea 14)
- `save` (línea 42)
- `syncStock` (línea 49)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

