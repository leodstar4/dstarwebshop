---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/operacion.spec.js"
lineas: 70
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# operacion.spec.js

`dstar-store/tests/e2e/operacion.spec.js` · 70 líneas

Pruebas E2E de la operación: el panel no ofrece reembolsos ni devoluciones y el ajuste conserva su ID al reintentar, seguimiento consultado al servidor que descuenta del carrito una sola vez, catálogo remoto con pieza nueva y datos legales en privacidad.html.

Parte de: [[Pruebas]]

## Conexiones

- Llama a la API: [[pedidos.js (handlers)]] (`/api/pedidos`), [[admin-store.js]] (`/api/admin-store`), [[seguimiento.js (handlers)]] (`/api/seguimiento`), [[catalogo.js]] (`/api/catalogo`), [[datos-tienda.js]] (`/api/datos-tienda`)
- Visita: [[pedidos.html]], [[seguimiento.html]], [[producto.html]], [[checkout.html]], [[privacidad.html]]
- Usa: [[Playwright]], [[Netlify]], [[Cloudinary]]

## Casos de prueba

- panel no ofrece reembolsos ni devoluciones; ajuste conserva ID al reintentar
- seguimiento usa servidor y descuenta solo piezas compradas una vez
- catálogo remoto puede mostrar una nueva pieza sin perder su carrito
- privacidad muestra datos públicos desde configuración

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

