---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/stock-y-animaciones.spec.js"
lineas: 167
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# stock-y-animaciones.spec.js

`dstar-store/tests/e2e/stock-y-animaciones.spec.js` · 167 líneas

Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue.

Parte de: [[Pruebas]]

## Conexiones

- Visita: [[index.html]], [[como-cuidar-tu-ropa.html]], [[checkout.html]], [[terminos.html]]
- Usa: [[Playwright]], [[Mercado Pago]], [[Skydropx]], [[Gmail SMTP]], [[GSAP]]
- Lee la variable: [[GMAIL_USER]], [[GMAIL_APP_PASSWORD]]

## Funciones y clases

- `webhookEvent` (línea 8)
- `pagoAprobado` (línea 21)
- `stubRed` (línea 24)
- `conRed` (línea 41)
- `leerStock` (línea 59)
- `webhook` (línea 61)

## Casos de prueba

- Stock vivo y alertas (handler directo, sin red)
- un pago aprobado descuenta la talla y ya no se puede volver a comprar
- si Skydropx falla se avisa una vez y el reintento no descuenta dos veces
- dos pagos por la última pieza generan alerta de sobreventa
- un monto distinto avisa a la tienda y no descuenta stock
- Contenido visible y animaciones
- sin GSAP los drops, el lookbook y el blog se ven
- con animaciones todo termina visible después de recorrer la página
- sin GSAP, ir del inicio a un artículo no deja la pantalla en negro
- términos enlazados en el footer y junto al botón PAGAR

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

