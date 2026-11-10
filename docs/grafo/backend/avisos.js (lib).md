---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/avisos.js"
lineas: 62
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# avisos.js (lib)

`dstar-store/netlify/lib/avisos.js` · 62 líneas

Avisos por correo en Netlify Blobs (store avisos): validar (correo, consentimiento, drop o talla existente), suscribir con clave por hash y token de baja, baja con token (timingSafeEqual), quitar desde el panel, activos y notificarTalla, que manda por mail.js hasta 10 correos por envío con enlace de baja a /api/avisame y marca notifiedAt.

Parte de: [[Backend]]

## Conexiones

- Importa: [[storage.js]], [[mail.js]]
- Llama a la API: [[avisame.js]] (`/api/avisame`)
- Referencia a: [[producto.html]]
- Lee la variable: [[URL_SITIO]]

## Funciones y clases

- `esc` (línea 5)
- `sitio` (línea 6)
- `store` (línea 7)
- `validar` (línea 8)
- `clave` (línea 19)
- `suscribir` (línea 20)
- `baja` (línea 25)
- `quitar` (línea 35)
- `activos` (línea 39)
- `linkBaja` (línea 40)
- `notificarTalla` (línea 41)

