---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/seguimiento.js"
lineas: 17
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# seguimiento.js (handlers)

`dstar-store/netlify/handlers/seguimiento.js` · 17 líneas

Función /api/seguimiento: POST con id dstar_<uuid> y token de 64 hex comparado con timingSafeEqual; devuelve pago, preparación, total, rastreo y artículos, sin domicilio ni etiqueta; 404 si no coincide; límite de 60 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[orders-store.js]], [[http.js]], [[rate-limit.js]]
- Usa: [[Netlify]]

## Funciones y clases

- `handler` (línea 5)

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción

