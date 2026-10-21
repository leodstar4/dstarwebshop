---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/reconcile-payments.js"
lineas: 7
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# reconcile-payments.js

`dstar-store/netlify/handlers/reconcile-payments.js` · 7 líneas

Función programada cada 10 min (netlify.toml): solo en producción encola el trabajo reconcile con dispatch() de lib/jobs.js, porque las programadas tienen 30 s.

Parte de: [[Backend]]

## Conexiones

- Importa: [[jobs.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 2)

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción

