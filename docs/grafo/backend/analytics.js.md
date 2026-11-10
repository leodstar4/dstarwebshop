---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/analytics.js"
lineas: 78
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# analytics.js

`dstar-store/netlify/lib/analytics.js` · 78 líneas

Analítica agregada en Netlify Blobs (store analitica) sobre storage.js: limpiar valida el evento (view, product, add, checkout, pay, alert; productos del catálogo), registrar suma el contador del día (zona America/Mexico_City) en uno de 4 shards con escritura condicional y resumen junta días, totales, productos, fuentes, dispositivos y páginas; sin IP ni identificadores.

Parte de: [[Backend]]

## Conexiones

- Importa: [[storage.js]]

## Funciones y clases

- `bump` (línea 7)
- `limpiar` (línea 11)
- `sumar` (línea 27)
- `registrar` (línea 47)
- `merge` (línea 50)
- `top` (línea 57)
- `resumen` (línea 58)

