---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/avisame.js"
lineas: 35
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# avisame.js

`dstar-store/netlify/handlers/avisame.js` · 35 líneas

Función /api/avisame: POST JSON de initAlertForm de app.js para suscribirse (honeypot website, validar y suscribir de lib/avisos.js); el enlace de baja (GET ?baja&t) muestra una página noindex de confirmación con css/operacion.css y su POST form-urlencoded da de baja; rechaza otros orígenes; límite de 10 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[avisos.js (lib)]], [[catalog-store.js]], [[http.js]], [[validate.js]], [[rate-limit.js]]
- Referencia a: [[operacion.css]]
- Usa: [[Netlify]]

## Funciones y clases

- `esc` (línea 6)
- `pagina` (línea 7)
- `handler` (línea 12)

## Últimos cambios

- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible

