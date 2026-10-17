---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/stock.js"
lineas: 21
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# stock.js

`dstar-store/netlify/functions/stock.js` · 21 líneas

Función /api/stock: devuelve el stock disponible por producto y talla; límite de 120 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[stock-store.js]], [[rate-limit.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 4)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

