---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Páginas

Todas las páginas HTML del sitio y cómo se enlazan entre sí.

Parte de: [[DSTAR]]

## Contenido

- [[404.html]] — Página 404 de la marca (noindex): logo 3D girando entre dos 4 con el video logo-3d-loader.mp4 (póster con prefers-reduced-motion) y botones VOLVER AL INICIO y VER DROPS; estilos inline, sin scripts.
- [[agradecimientos.html]] — Página de agradecimientos, con canonical y og:*.
- [[born-to-shine-detras-del-drop.html]] — Artículo del blog: detrás del drop Born to Shine.
- [[checkout.html]] — Checkout (noindex): datos del cliente con referencia de entrega, cotización de envío y pago con Mercado Pago (solo pagos inmediatos, sin OXXO); enlaza terminos.html y privacidad.html junto a PAGAR; toda la lógica está en js/checkout.js.
- [[como-cuidar-tu-ropa.html]] — Artículo del blog: cómo cuidar tu ropa.
- [[dstar-preview.html]] — Vista previa estática grande del sitio, en la raíz del repo.
- [[error-pago.html]] — Pantalla heredada de pago fallido (noindex); Mercado Pago ya regresa a seguimiento.html.
- [[gracias.html]] — Página de resultado heredada (noindex): Mercado Pago ya regresa a seguimiento.html; su script js/gracias.js redirige ahí si hay un pedido en la sesión y no vacía el carrito.
- [[index.html]] — Página principal ("DSTAR — Streetwear exclusivo hecho en México"): canonical, og:*, twitter:card y JSON-LD Organization con el Instagram; loader que maneja js/loader.js (video del logo, worker de logo-3d-worker.js y activación de mainCss y fontsCss); solo quedan dos scripts inline (speculationrules y css-pending) permitidos por hash en la CSP; dentro de `<main>`: hero con logo 3D, drops (grid de productos), lookbook, about, blog, FAQ y contacto.
- [[offline.html]] — Página sin conexión de la PWA (noindex).
- [[pago-pendiente.html]] — Pantalla heredada de pago pendiente (noindex); Mercado Pago ya regresa a seguimiento.html y su texto todavía menciona OXXO y SPEI.
- [[pedidos.html]] — Panel de pedidos privado (noindex, no-store): formulario de contraseña, resumen, filtros TODOS / POR REVISAR / CON GUÍA, lista de pedidos, sección OPERACIÓN DE LA TIENDA (configuración, inventario, catálogo y datos legales) y el `<dialog>` de acciones; todo lo pinta js/pedidos.js.
- [[privacidad.html]] — Aviso de privacidad: datos que pide el checkout, servicios que intervienen y cómo ejercer derechos; los datos del responsable los llena js/legal.js desde /api/datos-tienda.
- [[producto.html]] — Detalle de producto: galería, selector de talla y botón de compra, con un solo `<dialog class="pd-lightbox">` (#pdLightbox) para móvil y desktop que llena app.js; precarga desde el `<head>` la primera foto en AVIF con un script inline permitido por hash, y sus title, canonical y og:* genéricos los reescribe por prenda la edge function producto-meta.js.
- [[seguimiento.html]] — Seguimiento privado del pedido (noindex, no-store, no-referrer): back_url de Mercado Pago con #id/token en el hash; muestra pago, preparación y rastreo con js/seguimiento.js y estilos de css/operacion.css.
- [[streetwear-mexico-escena.html]] — Artículo del blog: la escena del streetwear en México.
- [[terminos.html]] — Términos, envíos y devoluciones: precios, pagos inmediatos sin OXXO, tiempos de envío, devolución en 5 días hábiles, defectos y quejas ante PROFECO; datos del proveedor que llena js/legal.js y enlace a privacidad.html; enlazada en los footers y junto al botón PAGAR.

