---
tags: [codigo, frontend]
ruta: "dstar-store/js/metricas.js"
lineas: 57
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# metricas.js

`dstar-store/js/metricas.js` · 57 líneas

Analítica sin cookies en el navegador: manda view (ruta, visita nueva, fuente por utm_source o referrer y dispositivo) a /api/evento con sendBeacon (fetch keepalive de respaldo) y expone window.DSTAR_TRACK para product, add, checkout (una vez por sesión), pay y alert; no envía nada con navigator.webdriver, Global Privacy Control o Do Not Track y espera a que termine el prerender; la cargan index, producto, checkout, términos, privacidad, agradecimientos y el blog.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[evento.js]] (`/api/evento`)

## Funciones y clases

- `send` (línea 5)
- `source` (línea 22)
- `device` (línea 33)
- `pageView` (línea 38)

