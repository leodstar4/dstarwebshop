---
tags: [codigo, pagina]
ruta: "dstar-store/checkout.html"
lineas: 720
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# checkout.html

`dstar-store/checkout.html` · 720 líneas

Checkout (noindex): datos del cliente con referencia de entrega, cotización de envío y pago con Mercado Pago (solo pagos inmediatos, sin OXXO); enlaza terminos.html y privacidad.html junto a PAGAR; toda la lógica está en js/checkout.js.

Parte de: [[Páginas]]

## Conexiones

- Carga script: [[products-data.js]], [[cart-store.js]], [[checkout.js]]
- Carga manifest: [[manifest.webmanifest]]
- Enlaza a: [[index.html]], [[terminos.html]], [[privacidad.html]]
- Usa: [[Cloudinary]], [[GSAP]], [[Google Fonts]]

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-12 · `cded92a` · Fluidez y proporciones: logo 3D en Web Worker, imágenes AVIF, hero y tarjetas a la medida de cada pantalla
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `461aa1d` · Ícono de la PWA con fondo blanco y logo a color

