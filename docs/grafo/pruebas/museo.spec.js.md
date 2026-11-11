---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/museo.spec.js"
lineas: 149
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# museo.spec.js

`dstar-store/tests/e2e/museo.spec.js` · 149 líneas

Pruebas E2E del museo: la lista muestra todas las piezas activas con enlace a producto.html?id= y sin desborde horizontal, sin WebGL cae a la lista con aviso, con movimiento reducido abre en lista, recorrido 3D (ENTRAR, Anterior/Siguiente, ficha, botones de 44 px y salto a la ficha del producto; se omite sin WebGL), probador (PROBAR, combinar dos prendas, QUITAR y #museoQuitar, con Cloudinary sustituido por una imagen local con CORS; se omite sin WebGL) y entradas desde el home (.museo-teaser, header y menú móvil) con regreso a la tienda.

Parte de: [[Pruebas]]

## Conexiones

- Usa la global: [[cart-store.js]] (`DSTAR_PRODUCTS`)
- Visita: [[museo.html]], [[index.html]]
- Referencia a: [[producto.html]]
- Usa: [[Playwright]], [[Cloudinary]]

## Funciones y clases

- `activos` (línea 5)
- `abrirMuseo` (línea 7)

## Casos de prueba

- Museo — vista de lista
- muestra todas las piezas con link a su producto
- sin WebGL cae a la lista y avisa
- con movimiento reducido abre en lista
- Museo — recorrido 3D
- entrar, pasar de obra en obra y abrir la pieza
- Museo — probador
- el gato se prueba prendas, las combina y se las quita
- Museo — entradas desde la tienda
- el home tiene el bloque y el menú enlaza al museo
- el museo regresa a la tienda

