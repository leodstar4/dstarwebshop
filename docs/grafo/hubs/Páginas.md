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
- [[checkout.html]] — Checkout (noindex): datos del cliente con referencia de entrega, cotización de envío y pago con Mercado Pago (solo pagos inmediatos, sin OXXO); enlaza terminos.html y privacidad.html junto a PAGAR; `viewport-fit=cover` con env(safe-area-inset-*) en el header y el toast de su `<style>` inline; toda la lógica está en js/checkout.js y carga js/metricas.js.
- [[como-cuidar-tu-ropa.html]] — Artículo del blog: cómo cuidar tu ropa.
- [[dstar-preview.html]] — Vista previa estática grande del sitio, en la raíz del repo.
- [[error-pago.html]] — Pantalla heredada de pago fallido (noindex); Mercado Pago ya regresa a seguimiento.html.
- [[gracias.html]] — Página de resultado heredada (noindex): Mercado Pago ya regresa a seguimiento.html; su script js/gracias.js redirige ahí si hay un pedido en la sesión y no vacía el carrito.
- [[index.html]] — Página principal ("DSTAR — Streetwear exclusivo hecho en México"): canonical, og:*, twitter:card y JSON-LD Organization con el Instagram; loader que maneja js/loader.js (video del logo, worker de logo-3d-worker.js y activación de mainCss y fontsCss); solo quedan dos scripts inline (speculationrules y css-pending) permitidos por hash en la CSP; dentro de `<main>`: hero con logo 3D, drops (grid de productos; el formulario #dropAlert del próximo drop se quitó temporalmente el 2026-11-10), lookbook, el bloque .museo-teaser que lleva a museo.html, about, blog, FAQ y contacto; enlace MUSEO en el header y el menú móvil; carga js/metricas.js.
- [[museo.html]] — Museo DSTAR (canonical, og:* y twitter:card; viewport-fit=cover): página aparte que no carga style.css ni app.js; canvas #museoCanvas del recorrido en 3D en tercera persona (se guía a un gato negro) con intro (#museoEntrar), barra superior .museo-bar (TIENDA y #museoModo) y dock inferior #museoHud en cápsulas de vidrio (anterior, contador, siguiente y botón de cámara #museoCamara, VER GATO / VER SALA), con iconos SVG en línea y textos en .museo-btn__label, ficha de la obra (#museoFicha) que enlaza a producto.html?id= y trae el botón PROBAR / QUITAR (#museoFichaProbar, con aria-pressed) del probador, botón de solo ícono #museoQuitar en el dock para quitarle toda la ropa al gato (oculto si no trae nada), región #museoVoz (role="status") que anuncia los cambios y la lista 2D #museoLista (botón #museoModo); carga css/museo.css, js/products-data.js, js/cart-store.js, js/metricas.js y el módulo js/museo.js, con modulepreload de js/vendor/three.module.min.js y de js/museo-ropa.js; sin scripts inline.
- [[offline.html]] — Página sin conexión de la PWA (noindex).
- [[pago-pendiente.html]] — Pantalla heredada de pago pendiente (noindex): dice que Mercado Pago procesa el pago y que llegará un correo al acreditarse; Mercado Pago ya regresa a seguimiento.html.
- [[pedidos.html]] — Panel de pedidos privado (noindex, no-store): formulario de contraseña, resumen, filtros TODOS / POR REVISAR / CON GUÍA, lista de pedidos, sección OPERACIÓN DE LA TIENDA (configuración, inventario, catálogo y datos legales), secciones ANALÍTICA (periodo de 7, 14, 30 o 90 días) y AVISOS Y LISTA DE DROPS, y el `<dialog>` de acciones; todo lo pinta js/pedidos.js.
- [[privacidad.html]] — Aviso de privacidad (canonical, og:* y twitter:card; clases .ops__* de css/operacion.css): datos que pide el checkout, sección "Avisos y medición de la tienda" (correos de aviso con baja y conteos diarios sin cookies, IP ni identificador, que respetan GPC y Do Not Track), servicios que intervienen y cómo ejercer derechos; los datos del responsable los llena js/legal.js desde /api/datos-tienda; carga js/metricas.js.
- [[producto.html]] — Detalle de producto: galería, selector de talla y botón de compra, con el formulario #pdAlert (avísame si vuelve una talla agotada, oculto si no hay tallas agotadas) bajo el botón y un solo `<dialog class="pd-lightbox">` (#pdLightbox) para móvil y desktop, que llena app.js; precarga desde el `<head>` la primera foto en AVIF con un script inline permitido por hash, carga js/metricas.js, y sus title, canonical y og:* genéricos los reescribe por prenda la edge function producto-meta.js.
- [[seguimiento.html]] — Seguimiento privado del pedido (noindex, no-store, no-referrer, viewport-fit=cover): back_url de Mercado Pago con #id/token en el hash; muestra pago, preparación y rastreo con js/seguimiento.js y estilos .ops__* de css/operacion.css; no carga metricas.js.
- [[streetwear-mexico-escena.html]] — Artículo del blog: la escena del streetwear en México.
- [[terminos.html]] — Términos, envíos y devoluciones: precios, pagos inmediatos sin OXXO, tiempos de envío, devolución en 5 días hábiles, defectos y quejas ante PROFECO; datos del proveedor que llena js/legal.js y enlace a privacidad.html; enlazada en los footers y junto al botón PAGAR.

