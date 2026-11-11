---
tags: [codigo, frontend]
ruta: "dstar-store/js/cart-store.js"
lineas: 114
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# cart-store.js

`dstar-store/js/cart-store.js` · 114 líneas

Carrito en localStorage (dstar_cart) y catálogo: arranca con la copia de localStorage dstar_catalog o con products-data.js, pide /api/catalogo, guarda la respuesta en dstar_catalog y, si cambió, reemplaza DSTAR_PRODUCTS y dispara dstar:catalog; DSTAR_CATALOG_READY se resuelve a más tardar a los 5 s, haya o no AbortController (iOS 15); mientras el catálogo no se confirma, save() conserva las piezas que no conoce; sincroniza el stock con /api/stock.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[catalogo.js]] (`/api/catalogo`), [[stock.js]] (`/api/stock`)

## Funciones y clases

- `validCatalog` (línea 5)
- `replaceCatalog` (línea 6)
- `catalog` (línea 31)
- `stockFor` (línea 35)
- `load` (línea 41)
- `save` (línea 69)
- `syncStock` (línea 84)

## Últimos cambios

- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

