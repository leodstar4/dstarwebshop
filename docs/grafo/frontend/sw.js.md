---
tags: [codigo, frontend]
ruta: "dstar-store/sw.js"
lineas: 83
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# sw.js

`dstar-store/sw.js` · 83 líneas

Service worker de la PWA: precache del shell, network-first para páginas, caché de imágenes; nunca cachea /api ni el checkout.

Parte de: [[Frontend]]

## Conexiones

- Referencia a: [[index.html]], [[offline.html]], [[style.css]], [[products-data.js]], [[cart-store.js]], [[app.js]], [[gsap-animations.js]], [[blog-transitions.js]]
- Usa: [[Cloudinary]], [[GSAP]]

## Funciones y clases

- `networkFirst` (línea 36)
- `trim` (línea 50)
- `imageCache` (línea 56)

## Últimos cambios

- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-10 · `be7be88` · Restaura fondo y cards flotantes, logo 3D nuevo y hero en svh para evitar tirones
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

