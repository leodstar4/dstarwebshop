---
tags: [codigo, frontend]
ruta: "dstar-store/css/museo.css"
lineas: 378
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# museo.css

`dstar-store/css/museo.css` · 378 líneas

Estilos de museo.html: BEM (.museo-bar, .museo-sala, .museo-hud, .museo-ficha, .museo-intro, .museo-lista, .museo-pieza, .museo-btn) con sus propias custom properties en :root porque la página no carga style.css; safe areas con env(safe-area-inset-*), botones de 44 px o más (.museo-btn--dark es un botón fantasma con icono .museo-btn__icon y realce de píldora al apuntar o con aria-pressed; .museo-btn--light es una placa blanca plana que pasa a gris claro y brilla al apuntar, como las de la tienda; .museo-btn--line es el botón de línea PROBAR / QUITAR de .museo-ficha__actions, con estados aria-pressed y aria-busy; .museo-btn--icon es el botón de solo ícono del dock; presión con la propiedad scale), backdrop-filter en las cápsulas .museo-bar y .museo-hud y en .museo-ficha con respaldo opaco (@supports y prefers-reduced-transparency) y prefers-reduced-motion.

Parte de: [[Frontend]]

## Bloques BEM

`.museo`, `.museo-sr`, `.museo-btn`, `.museo-ficha`, `.museo-sala`, `.museo-pieza`, `.museo-bar`, `.museo-hud`, `.museo-intro`, `.museo-lista`, `.museo-noscript`

## Variables CSS

`--black`, `--dark`, `--concrete`, `--concrete-light`, `--concrete-dark`, `--white`, `--red`, `--font-display`, `--font-heading`, `--font-mono`, `--ease`, `--ease-out`, `--ease-spring`, `--dur-fast`, `--dur-base`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--z-hud`, `--z-ficha`, `--z-bar`, `--z-intro`, `--glass-tint`, `--glass-fallback`, `--glass-sheen`, `--glass-shadow`, `--glass-blur`, `--glass-edge`, `--glass-edge-hover`, `--pill`, `--pill-shadow`, `--btn-dark-hover`, `--scrim`, `--card`, `--line`

## Últimos cambios

- 2026-11-11 · `4469385` · Museo 3D con probador, ajustes de botones y animaciones, sitemap y documentación al día

