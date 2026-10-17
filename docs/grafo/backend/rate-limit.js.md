---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/rate-limit.js"
lineas: 56
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# rate-limit.js

`dstar-store/netlify/lib/rate-limit.js` · 56 líneas

Límite de peticiones por IP (guardada como hash) con ventana fija en Netlify Blobs (store limites) o en memoria; sin IP no limita y si falla deja pasar; demasiadas() arma el 429 con Retry-After.

Parte de: [[Backend]]

## Conexiones

- Usa: [[Netlify Blobs]]

## Funciones y clases

- `abrir` (línea 7)
- `ipDe` (línea 24)
- `limitar` (línea 30)
- `demasiadas` (línea 47)

