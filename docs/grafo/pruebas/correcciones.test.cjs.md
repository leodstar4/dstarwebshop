---
tags: [codigo, prueba]
ruta: "dstar-store/tests/backend/correcciones.test.cjs"
lineas: 136
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# correcciones.test.cjs

`dstar-store/tests/backend/correcciones.test.cjs` · 136 líneas

Pruebas de backend de las correcciones: pedidos legacy sin guía, stock ni correos, conciliación que ignora terminados, tarjeta rechazada que conserva el apartado, Skydropx sin credenciales como failed, reintento tras falla de Mercado Pago, preferencia vencida con restart y poda del inventario.

Parte de: [[Pruebas]]

## Conexiones

- Importa: [[storage.js]], [[stock-store.js]], [[orders-store.js]], [[payment-service.js]], [[reconcile.js]], [[quotes.js]], [[products-data.js]], [[mp-preference.js]]
- Usa: [[Mercado Pago]], [[Skydropx]], [[Gmail SMTP]], [[Resend]]
- Lee la variable: [[DSTAR_MEMORY_STORE]], [[MP_ACCESS_TOKEN]], [[MP_WEBHOOK_SECRET]], [[PANEL_PASSWORD]], [[URL_SITIO]], [[RESEND_API_KEY]], [[MAIL_FROM]], [[EMAIL_ORIGEN]]

## Funciones y clases

- `post` (línea 19)
- `payment` (línea 20)
- `mpOnly` (línea 21)
- `units` (línea 22)

## Casos de prueba

- pedido del webhook anterior no compra guía, no descuenta stock ni reenvía correos
- pedido anterior con monto distinto no se despacha
- pedido anterior registra un contracargo posterior
- conciliación ignora pedidos anteriores y terminados
- tarjeta rechazada conserva el apartado y no alerta a la tienda
- apartado de un pago rechazado vence en la conciliación
- sin credenciales de Skydropx la guía queda como fallida y se puede reintentar
- reintento tras falla de Mercado Pago crea la preferencia sin quedar bloqueado
- preferencia vencida pide reiniciar el pago
- quien pierde la última pieza no deja un pedido para revisar
- el inventario poda apartados vencidos y movimientos antiguos

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

