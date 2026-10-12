---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/stock-store.js"
lineas: 92
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# stock-store.js

`dstar-store/netlify/lib/stock-store.js` · 92 líneas

Stock = base del catálogo menos piezas vendidas, guardado en Netlify Blobs con reintentos.

Parte de: [[Backend]]

## Conexiones

- Importa: [[products-data.js]]
- Usa: [[Netlify Blobs]], [[Netlify]]

## Funciones y clases

- `stockBase` (línea 10)
- `vendidas` (línea 15)
- `calcular` (línea 20)
- `abrir` (línea 31)
- `leerStock` (línea 61)
- `descontar` (línea 68)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

