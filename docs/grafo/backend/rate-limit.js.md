---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/rate-limit.js"
lineas: 21
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# rate-limit.js

`dstar-store/netlify/lib/rate-limit.js` · 21 líneas

Límite de peticiones por IP (guardada como hash) con ventana fija y escritura condicional en Netlify Blobs (store limites); sin IP no limita y si el almacén falla rechaza 60 s; demasiadas() arma el 429 con Retry-After.

Parte de: [[Backend]]

## Conexiones

- Importa: [[storage.js]]

## Funciones y clases

- `limitar` (línea 3)
- `demasiadas` (línea 19)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

