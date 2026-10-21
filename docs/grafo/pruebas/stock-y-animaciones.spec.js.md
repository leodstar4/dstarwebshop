---
tags: [codigo, prueba]
ruta: "dstar-store/tests/e2e/stock-y-animaciones.spec.js"
lineas: 161
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# stock-y-animaciones.spec.js

`dstar-store/tests/e2e/stock-y-animaciones.spec.js` · 161 líneas

Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue y ningún elemento renderizado (incluidos los .split-char) se quede con opacidad menor a 0.05.

Parte de: [[Pruebas]]

## Conexiones

- Usa la global: [[correcciones.test.cjs]] (`DSTAR_MEMORY_STORE`)
- Visita: [[index.html]], [[checkout.html]], [[terminos.html]]
- Referencia a: [[storage.js]]
- Usa: [[Playwright]], [[Mercado Pago]], [[Skydropx]], [[Gmail SMTP]], [[GSAP]]
- Lee la variable: [[DSTAR_MEMORY_STORE]], [[GMAIL_USER]], [[GMAIL_APP_PASSWORD]]

## Funciones y clases

- `webhookEvent` (línea 11)
- `pagoAprobado` (línea 24)
- `stubRed` (línea 27)
- `conRed` (línea 44)
- `leerStock` (línea 62)
- `webhook` (línea 64)

## Casos de prueba

- Stock vivo y alertas (handler directo, sin red)
- un pago aprobado descuenta la talla y ya no se puede volver a comprar
- si Skydropx responde 500 no se repite una compra de guía incierta
- dos pagos por la última pieza generan alerta de sobreventa
- un monto distinto avisa a la tienda y no descuenta stock
- Contenido visible y animaciones
- sin GSAP los drops, el lookbook y el blog se ven
- con animaciones todo termina visible después de recorrer la página
- términos enlazados en el footer y junto al botón PAGAR

## Últimos cambios

- 2026-10-12 · `88d021f` · Animaciones ricas de vuelta (en el compositor), logo 3D a 60 fps y más grande en desktop
- 2026-10-12 · `eef15b5` · Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- 2026-10-12 · `d231e35` · Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

