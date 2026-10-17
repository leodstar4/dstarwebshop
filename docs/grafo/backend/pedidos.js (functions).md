---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/pedidos.js"
lineas: 43
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# pedidos.js (functions)

`dstar-store/netlify/functions/pedidos.js` · 43 líneas

Función del panel de pedidos: solo GET con Authorization Bearer igual a PANEL_PASSWORD (503 si falta o tiene menos de 16 caracteres, 401 si no coincide); devuelve los pedidos de orders-store.js del más reciente al más viejo; límite de 30 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[orders-store.js]], [[rate-limit.js]]
- Usa: [[Netlify]]
- Lee la variable: [[PANEL_PASSWORD]]

## Funciones y clases

- `reply` (línea 15)
- `digest` (línea 16)
- `autorizado` (línea 18)
- `handler` (línea 25)

