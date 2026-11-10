---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/avisos.js"
lineas: 29
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# avisos.js (handlers)

`dstar-store/netlify/handlers/avisos.js` · 29 líneas

Función /api/avisos del panel (admin() de lib/http.js con PANEL_PASSWORD): GET lista los avisos activos sin token; POST notify llama a notificarTalla solo si leerStock da existencias en esa talla (si no, 409) y remove da de baja un aviso; límite de 120 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[avisos.js (lib)]], [[catalog-store.js]], [[stock-store.js]], [[http.js]], [[rate-limit.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 6)

