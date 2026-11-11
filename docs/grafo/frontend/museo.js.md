---
tags: [codigo, frontend]
ruta: "dstar-store/js/museo.js"
lineas: 1178
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# museo.js

`dstar-store/js/museo.js` · 1178 líneas

Módulo ES del museo: importa Three.js de js/vendor/three.module.min.js, lee window.DSTAR_PRODUCTS (activos con foto) y se reconstruye con dstar:catalog de cart-store.js; arma un pasillo con una sala por drop, cada foto de Cloudinary enmarcada (AVIF con f_auto de respaldo, 900 px o 600 en táctil) con su placa; recorrido en tercera persona: createCat modela por código un gato negro (cabeza extruida, cara en textura de canvas, cuerpo de cápsulas, cola y sombra) que camina en dos patas con animación procedural, y la cámara lo sigue, se orbita arrastrando y se queda donde se deja (no vuelve sola); el botón #museoCamara (VER GATO / VER SALA) la pone de frente o detrás del gato y al ir a una obra vuelve detrás (los textos de #museoCamara y #museoModo se escriben en su .museo-btn__label para no borrar el icono); W/S o flechas arriba/abajo caminan, A/D o izquierda/derecha giran, la rueda avanza, tocar el piso lo manda a ese punto y tocar una obra o Anterior/Siguiente lo lleva a ella; al entrar saluda de frente y la cámara gira hasta quedar detrás; ficha con precio, tallas y enlace a producto.html?id=; probador: importa ROPA y fotoRopa de js/museo-ropa.js y viste al gato con buildGarment según el molde (MOLDES: longsleeve, camisa o jort), con mitades de cascarón (halfShell) en el torso o la cadera y medios tubos (halfTube) sujetos a brazos o piernas, que se mueven al caminar; las texturas se arman en canvas (panelTexture: recorte de la zona de la foto sobre el color de la tela, con bordes difuminados) y se liberan con disposeGarment; dos ranuras, arriba y abajo, para combinar una prenda superior con el jort; #museoFichaProbar pone o quita la prenda de la obra actual, #museoQuitar quita todo y #museoVoz lo anuncia; al probar el gato celebra (celebrate) y la cámara se acerca 4.5 s, igual que con VER GATO, y en pantallas verticales con la ficha abierta sube al gato en el encuadre (CAMERA.tall); con el recorrido activo dibuja de forma continua (unos 30 fps en reposo) y antes de ENTRAR solo cuando algo cambia (wake/dirty); con prefers-reduced-motion no hay animación del gato ni bucle continuo; sin WebGL o si se pierde el contexto queda la lista 2D, y con prefers-reduced-motion abre en la lista.

Parte de: [[Frontend]]

## Conexiones

- Usa la global: [[cart-store.js]] (`DSTAR_PRODUCTS`)
- Referencia a: [[producto.html]], [[museo-ropa.js]]
- Usa: [[Cloudinary]], [[Three.js]]

## Funciones y clases

- `catalog` (línea 29)
- `signature` (línea 30)
- `cdn` (línea 31)
- `formatPrice` (línea 32)
- `soldOut` (línea 33)
- `sizesLeft` (línea 34)
- `productUrl` (línea 35)
- `pad` (línea 36)
- `clamp` (línea 37)
- `renderList` (línea 39)
- `setMode` (línea 78)
- `canvasTexture` (línea 92)
- `fitText` (línea 102)
- `concreteTexture` (línea 110)
- `glowTexture` (línea 145)
- `boardTexture` (línea 156)
- `plaqueTexture` (línea 167)
- `titleTexture` (línea 187)
- `starPath` (línea 200)
- `catFaceTexture` (línea 212)
- `X` (línea 215)
- `Y` (línea 216)
- `shadowTexture` (línea 248)
- `createCat` (línea 259)
- `limb` (línea 296)
- `animate` (línea 339)
- `loadImage` (línea 385)
- `loadPhoto` (línea 396)
- `cropZone` (línea 398)
- `fabricColor` (línea 423)
- `panelTexture` (línea 442)
- `clothMesh` (línea 472)
- `halfShell` (línea 476)
- `halfTube` (línea 486)
- `buildGarment` (línea 493)
- `disposeGarment` (línea 519)
- `createGallery` (línea 528)
- `concreteMaterial` (línea 584)
- `box` (línea 591)
- `plane` (línea 599)
- y 27 más

## Últimos cambios

- 2026-11-11 · `4469385` · Museo 3D con probador, ajustes de botones y animaciones, sitemap y documentación al día

