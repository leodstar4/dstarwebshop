---
tags: [codigo, frontend]
ruta: "dstar-store/js/museo.js"
lineas: 1107
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# museo.js

`dstar-store/js/museo.js` · 1107 líneas

Galería Three.js que se reconstruye con el catálogo de cart-store.js. Cada drop tiene una sala con fotos enmarcadas y fichas de producto. W y S hacen caminar al gato, A y D lo giran, y las flechas o el arrastre orbitan la cámara centrada en él. La rueda, más, menos y los botones de zoom ajustan el encuadre. VER GATO y VER SALA seleccionan las vistas de frente y detrás. Tocar el piso, una obra o Anterior/Siguiente mueve al personaje. El probador de dos ranuras usa las fotos de museo-ropa.js, deforma la ropa con los huesos de museo-gato.js y libera las texturas al quitar una prenda. La lista 2D está disponible con movimiento reducido y al faltar WebGL.

Parte de: [[Frontend]]

## Conexiones

- Usa la global: [[cart-store.js]] (`DSTAR_PRODUCTS`)
- Referencia a: [[producto.html]], [[museo-ropa.js]], [[museo-gato.js]]
- Usa: [[Cloudinary]], [[Three.js]]

## Funciones y clases

- `catalog` (línea 34)
- `signature` (línea 35)
- `cdn` (línea 36)
- `formatPrice` (línea 37)
- `soldOut` (línea 38)
- `sizesLeft` (línea 39)
- `productUrl` (línea 40)
- `pad` (línea 41)
- `clamp` (línea 42)
- `renderList` (línea 44)
- `setMode` (línea 83)
- `canvasTexture` (línea 97)
- `fitText` (línea 107)
- `concreteTexture` (línea 115)
- `glowTexture` (línea 150)
- `boardTexture` (línea 161)
- `plaqueTexture` (línea 172)
- `titleTexture` (línea 192)
- `shadowTexture` (línea 205)
- `loadImage` (línea 242)
- `loadPhoto` (línea 253)
- `cropZone` (línea 255)
- `fabricColor` (línea 286)
- `panelTexture` (línea 301)
- `clothMaterial` (línea 332)
- `buildGarment` (línea 340)
- `mean` (línea 349)
- `disposeGarment` (línea 368)
- `createGallery` (línea 377)
- `concreteMaterial` (línea 438)
- `box` (línea 445)
- `plane` (línea 453)
- `disposeExhibit` (línea 462)
- `placePlaque` (línea 472)
- `loadArtwork` (línea 476)
- `apply` (línea 477)
- `failed` (línea 496)
- `build` (línea 505)
- `showFicha` (línea 609)
- `hideFicha` (línea 628)
- y 23 más

## Últimos cambios

- 2026-11-11 · `4469385` · Museo 3D con probador, ajustes de botones y animaciones, sitemap y documentación al día

