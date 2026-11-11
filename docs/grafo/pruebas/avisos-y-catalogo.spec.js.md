---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/avisos-y-catalogo.spec.js"
lineas: 74
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# avisos-y-catalogo.spec.js

`dstar-store/tests/e2e/avisos-y-catalogo.spec.js` · 74 líneas

Pruebas E2E: la tienda pinta sin esperar al catálogo remoto, el catálogo remoto actualiza las tarjetas y queda en caché para la siguiente visita, formulario del próximo drop con consentimiento (en test.skip mientras el formulario no esté en index.html), aviso solo para las tallas agotadas en la ficha y panel con embudo y avisos.

Parte de: [[Pruebas]]

## Conexiones

- Llama a la API: [[catalogo.js]] (`/api/catalogo`), [[avisame.js]] (`/api/avisame`), [[stock.js]] (`/api/stock`), [[pedidos.js (handlers)]] (`/api/pedidos`), [[admin-store.js]] (`/api/admin-store`), [[avisos.js (handlers)]] (`/api/avisos`)
- Visita: [[index.html]], [[producto.html]], [[pedidos.html]]
- Usa: [[Playwright]], [[Netlify]], [[Cloudinary]]

## Casos de prueba

- la tienda pinta los productos sin esperar al catálogo remoto
- el catálogo remoto actualiza las tarjetas y queda en caché para la siguiente visita
- ficha ofrece aviso solo para las tallas agotadas
- panel muestra embudo y avisos pendientes

## Últimos cambios

- 2026-11-11 · `4469385` · Museo 3D con probador, ajustes de botones y animaciones, sitemap y documentación al día
- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible

