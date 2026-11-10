---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/evento.js"
lineas: 20
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# evento.js

`dstar-store/netlify/handlers/evento.js` · 20 líneas

Función /api/evento: POST público de metricas.js que siempre responde 204; descarta robots por user-agent, orígenes ajenos y cuerpos de más de 1000 caracteres, valida con limpiar de lib/analytics.js y registra; límite de 300 eventos por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[analytics.js]], [[catalog-store.js]], [[rate-limit.js]], [[validate.js]]
- Usa: [[Netlify]], [[Lighthouse]]

## Funciones y clases

- `handler` (línea 7)

