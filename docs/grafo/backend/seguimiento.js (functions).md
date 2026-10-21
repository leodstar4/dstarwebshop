---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/seguimiento.js"
lineas: 17
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# seguimiento.js (functions)

`dstar-store/netlify/functions/seguimiento.js` · 17 líneas

Función /api/seguimiento: POST con id dstar_<uuid> y token de 64 hex comparado con timingSafeEqual; devuelve pago, preparación, total, rastreo y artículos, sin domicilio ni etiqueta; 404 si no coincide; límite de 60 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[orders-store.js]], [[http.js]], [[rate-limit.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 5)

