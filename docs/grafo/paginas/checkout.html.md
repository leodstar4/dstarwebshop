---
tags: [codigo, pagina]
ruta: "dstar-store/checkout.html"
lineas: 721
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# checkout.html

`dstar-store/checkout.html` · 721 líneas

Checkout (noindex): datos del cliente con referencia de entrega, cotización de envío y pago con Mercado Pago (solo pagos inmediatos, sin OXXO); enlaza terminos.html y privacidad.html junto a PAGAR; `viewport-fit=cover` con env(safe-area-inset-*) en el header y el toast de su `<style>` inline; toda la lógica está en js/checkout.js y carga js/metricas.js.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[products-data.js]], [[metricas.js]], [[cart-store.js]], [[checkout.js]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[index.html]], [[terminos.html]], [[privacidad.html]]
- Usa: [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Últimos cambios

- 2026-11-10 · `4d7afee` · Avisos de drop y talla, analítica propia, botones liquid glass y carrito accesible
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

