---
tags: [codigo, frontend]
ruta: "dstar-store/js/cart-store.js"
lineas: 86
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# cart-store.js

`dstar-store/js/cart-store.js` · 86 líneas

Carrito en localStorage (dstar_cart): pide /api/catalogo (DSTAR_CATALOG_READY, corta a los 5 s con AbortController si existe, si no espera sin señal, para iOS 15) y reemplaza DSTAR_PRODUCTS; sincroniza el stock con /api/stock.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[catalogo.js]] (`/api/catalogo`), [[stock.js]] (`/api/stock`)
- Usa la global: [[products-data.js]] (`DSTAR_PRODUCTS`)

## Funciones y clases

- `catalog` (línea 11)
- `stockFor` (línea 15)
- `load` (línea 21)
- `save` (línea 49)
- `syncStock` (línea 56)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

