---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/stock-store.js"
lineas: 94
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# stock-store.js

`dstar-store/netlify/lib/stock-store.js` · 94 líneas

Libro de inventario versión 2 en un solo blob (stock/vendidas): unidades, apartados, ventas y movimientos con escritura condicional; migra el formato anterior conservándolo, reservar/liberar apartados, descontar una vez por pago, ajustar con motivo sin invadir apartados, y prune poda apartados vencidos hace más de un día, ventas de más de 200 días y deja 2000 movimientos más el de migración.

Parte de: [[Backend]]

## Conexiones

- Importa: [[products-data.js]], [[storage.js]]

## Funciones y clases

- `stockBase` (línea 4)
- `key` (línea 5)
- `migrate` (línea 6)
- `held` (línea 16)
- `prune` (línea 20)
- `ledger` (línea 30)
- `leerStock` (línea 33)
- `reservar` (línea 41)
- `liberar` (línea 54)
- `descontar` (línea 57)
- `ajustar` (línea 77)
- `historial` (línea 92)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

