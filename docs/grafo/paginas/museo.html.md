---
tags: [codigo, pagina]
ruta: "dstar-store/museo.html"
lineas: 99
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# museo.html

`dstar-store/museo.html` · 99 líneas

Museo DSTAR (canonical, og:* y twitter:card; viewport-fit=cover): página aparte que no carga style.css ni app.js; canvas #museoCanvas del recorrido en 3D en tercera persona (se guía a un gato negro) con intro (#museoEntrar), barra superior .museo-bar (TIENDA y #museoModo) y dock inferior #museoHud en cápsulas de vidrio (anterior, contador, siguiente y botón de cámara #museoCamara, VER GATO / VER SALA), con iconos SVG en línea y textos en .museo-btn__label, ficha de la obra (#museoFicha) que enlaza a producto.html?id= y trae el botón PROBAR / QUITAR (#museoFichaProbar, con aria-pressed) del probador, botón de solo ícono #museoQuitar en el dock para quitarle toda la ropa al gato (oculto si no trae nada), región #museoVoz (role="status") que anuncia los cambios y la lista 2D #museoLista (botón #museoModo); carga css/museo.css, js/products-data.js, js/cart-store.js, js/metricas.js y el módulo js/museo.js, con modulepreload de js/vendor/three.module.min.js y de js/museo-ropa.js; sin scripts inline.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[products-data.js]], [[cart-store.js]], [[metricas.js]], [[museo.js]]
- Carga estilos: [[museo.css]]
- Carga manifest: [[manifest.webmanifest]], [[museo-ropa.js]]
- Enlaza a: [[index.html]]
- Usa: [[Cloudinary]], [[Three.js]], [[Google Fonts]]

## Últimos cambios

- 2026-11-11 · `4469385` · Museo 3D con probador, ajustes de botones y animaciones, sitemap y documentación al día

