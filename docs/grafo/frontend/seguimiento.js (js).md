---
tags: [codigo, frontend]
ruta: "dstar-store/js/seguimiento.js"
lineas: 36
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# seguimiento.js (js)

`dstar-store/js/seguimiento.js` · 36 líneas

Script de seguimiento.html: toma id y token del hash (o de dstar_last_order en sessionStorage), consulta /api/seguimiento y muestra pago, preparación y rastreo; con pago aprobado resta una sola vez del carrito solo las piezas compradas.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[seguimiento.js (functions)]] (`/api/seguimiento`)

## Funciones y clases

- `money` (línea 7)
- `row` (línea 8)
- `refresh` (línea 9)

