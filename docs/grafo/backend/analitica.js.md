---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/analitica.js"
lineas: 14
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# analitica.js

`dstar-store/netlify/handlers/analitica.js` · 14 líneas

Función /api/analitica del panel (admin() de lib/http.js con PANEL_PASSWORD): GET con ?dias= (1 a 90, 14 por defecto) devuelve resumen de lib/analytics.js; límite de 120 peticiones por IP cada 10 min, compartido con pedidos.js y avisos.js.

Parte de: [[Backend]]

## Conexiones

- Importa: [[analytics.js]], [[http.js]], [[rate-limit.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 4)

