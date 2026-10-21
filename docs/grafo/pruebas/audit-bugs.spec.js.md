---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/audit-bugs.spec.js"
lineas: 336
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# audit-bugs.spec.js

`dstar-store/tests/e2e/audit-bugs.spec.js` · 336 líneas

Pruebas de regresión de la auditoría: stock por talla, localStorage corrupto, código postal del checkout, firma del webhook y origen.

Parte de: [[Pruebas]]

## Conexiones

- Llama a la API: [[cotizar-envio.js]] (`/api/cotizar-envio`), [[mp-preference.js]] (`/api/mp-preference`)
- Usa la global: [[correcciones.test.cjs]] (`DSTAR_MEMORY_STORE`)
- Visita: [[index.html]], [[checkout.html]]
- Referencia a: [[producto.html]], [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]], [[agradecimientos.html]], [[terminos.html]], [[seguimiento.html]], [[storage.js]], [[born-to-shine-detras-del-drop.html]], [[como-cuidar-tu-ropa.html]], [[streetwear-mexico-escena.html]]
- Usa: [[Playwright]], [[Netlify]], [[Mercado Pago]], [[Skydropx]], [[Cloudinary]], [[Gmail SMTP]]
- Lee la variable: [[DSTAR_MEMORY_STORE]], [[MP_ACCESS_TOKEN]], [[SKYDROPX_CLIENT_ID]], [[SKYDROPX_CLIENT_SECRET]], [[GMAIL_USER]], [[GMAIL_APP_PASSWORD]], [[MP_WEBHOOK_SECRET]], [[URL_SITIO]]

## Funciones y clases

- `webhookEvent` (línea 11)
- `seed` (línea 29)
- `fillCheckout` (línea 38)

## Casos de prueba

- AUDIT — storage corrupto
- home con dstar_cart=${label} sigue funcionando
- checkout con dstar_cart=${label} sigue funcionando
- AUDIT — stock por talla
- no se puede agregar más piezas que sizesStock (S = 1)
- AUDIT — checkout
- respuesta tardía de cotización (CP viejo) pisa la del CP nuevo
- cambiar CP a uno inválido deja la tarifa anterior seleccionada
- etiqueta de días: 1 día debe decir "1 DÍA"
- volver desde Mercado Pago (bfcache) deja el botón PAGAR usable
- AUDIT — errores JS por página
- sin pageerror en ${url}
- AUDIT — Netlify Functions (handler directo, fetch stub, sin red)
- mp-preference rechaza precios manipulados desde el cliente
- mp-webhook es idempotente: el mismo pago aprobado no crea 2 guías
- mp-preference cobra precio de catálogo + envío de Skydropx
- mp-webhook no genera guía si el monto pagado es menor al esperado
- mp-webhook rechaza notificaciones sin firma o con firma falsa
- cotizar-envio y mp-preference rechazan peticiones de otros sitios

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción
- 2026-10-20 · `6169aeb` · Dominio dstar4.party en canonical, Open Graph, JSON-LD, sitemap y robots
- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo

