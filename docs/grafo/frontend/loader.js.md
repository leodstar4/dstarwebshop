---
tags: [codigo, frontend]
ruta: "dstar-store/js/loader.js"
lineas: 93
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# loader.js

`dstar-store/js/loader.js` · 93 líneas

Loader de index.html (antes script inline): activa mainCss y fontsCss (media print → all), cambia el póster por el `<video>` logo-3d-loader.mp4, crea temprano el worker de logo-3d-worker.js y oculta el loader disparando dstar:loaded; en la primera visita de la sesión (sessionStorage dstar-intro) espera a que gire y a que el logo del hero esté listo.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[logo-3d-worker.js]]

