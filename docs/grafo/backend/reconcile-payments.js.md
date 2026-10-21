---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/reconcile-payments.js"
lineas: 7
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# reconcile-payments.js

`dstar-store/netlify/functions/reconcile-payments.js` · 7 líneas

Función programada cada 10 min (netlify.toml): solo en producción encola el trabajo reconcile con dispatch() de lib/jobs.js, porque las programadas tienen 30 s.

Parte de: [[Backend]]

## Conexiones

- Importa: [[jobs.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 2)

