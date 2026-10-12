---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Tecnologías

Servicios externos, librerías y herramientas que usa el proyecto.

Parte de: [[DSTAR]]

## Contenido

- [[Cloudinary]] — servicio. CDN de imágenes: f_auto, q_auto, dpr_auto y ancho responsive.
- [[Gmail SMTP]] — servicio. Correo transaccional con nodemailer: confirmación al cliente y aviso a la tienda.
- [[Google Fonts]] — servicio. Tipografías (fonts.googleapis.com y fonts.gstatic.com) con font-display: swap.
- [[GSAP]] — librería. Animación del sitio (hero, contador, cursor, botones magnéticos; SplitText en el index, el blog y páginas sueltas). Se sirve desde js/vendor del propio sitio.
- [[http-server]] — herramienta. Servidor estático que usa netlify dev como target en local.
- [[Lighthouse]] — herramienta. Auditoría de rendimiento, accesibilidad y SEO (Lighthouse CI).
- [[Mercado Pago]] — servicio. Pasarela de pago: preferencias de checkout, webhooks de pago y firma de notificaciones.
- [[Netlify]] — servicio. Hosting, CDN y Netlify Functions del sitio. Headers y redirects viven en netlify.toml.
- [[Netlify Blobs]] — servicio. Almacén clave-valor de Netlify: piezas vendidas (stock) y registro de pedidos.
- [[Netlify CLI]] — herramienta. netlify dev (puerto 8888) y deploy a producción.
- [[node-fetch]] — librería. fetch para Node (las funciones usan el fetch global de Node 22).
- [[Playwright]] — herramienta. Pruebas E2E y mediciones de rendimiento en desktop, tablet y móvil.
- [[sharp]] — herramienta. Redimensiona y comprime imágenes antes de subirlas.
- [[Skydropx]] — servicio. Paquetería: cotización de envíos y creación de guías (Skydropx Pro, API v1 con OAuth2).
- [[Vite]] — herramienta. Configuración heredada; el despliegue actual no compila nada.

