---
tags: [codigo, prueba]
ruta: "dstar-store/tests/backend/operacion.test.cjs"
lineas: 172
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# operacion.test.cjs

`dstar-store/tests/backend/operacion.test.cjs` · 172 líneas

Pruebas de backend con node --test y almacén en memoria: migración de inventario, reservas concurrentes, ajustes, cotización ligada, paquete, límite de peticiones, estados que no despachan, refund/return rechazados, seguimiento con token, conciliación de otro intento, firma de trabajos y checkout sin OXXO.

Parte de: [[Pruebas]]

## Conexiones

- Importa: [[storage.js]], [[stock-store.js]], [[orders-store.js]], [[payment-service.js]], [[quotes.js]], [[products-data.js]], [[rate-limit.js]], [[pedidos.js (handlers)]], [[seguimiento.js (handlers)]], [[validate.js]], [[reconcile.js]], [[jobs.js]], [[mp-webhook.js]], [[mp-preference.js]]
- Usa la global: [[correcciones.test.cjs]] (`DSTAR_MEMORY_STORE`)
- Usa: [[Netlify]], [[Mercado Pago]], [[Skydropx]], [[Gmail SMTP]], [[Resend]]
- Lee la variable: [[DSTAR_MEMORY_STORE]], [[MP_ACCESS_TOKEN]], [[MP_WEBHOOK_SECRET]], [[PANEL_PASSWORD]], [[URL_SITIO]]

## Funciones y clases

- `post` (línea 18)
- `payment` (línea 19)

## Casos de prueba

- migración conserva ventas al cambiar el stock base
- solo una reserva concurrente obtiene la última pieza
- reserva vencida se libera y pago descuenta una sola vez
- ajuste no pisa ventas ni duplica un reintento
- ajuste no consume piezas reservadas
- cotización vincula destino, talla, cantidad y caducidad
- paquete deriva del catálogo, no del peso del cliente
- fallo de almacenamiento no activa inventario en memoria fuera de test
- límite concurrente no permite más solicitudes de las configuradas
- estado 
- servidor rechaza refund y return: funciones excluidas
- seguimiento exige token y no expone domicilio ni etiqueta
- intento rechazado no bloquea otro pago aprobado del mismo checkout
- validación no vuelve al stock base si falta stock vivo
- conciliación recupera otro intento aprobado cuando se pierde su webhook
- trabajo interno exige firma íntegra y reciente
- reintento de ajuste con datos distintos se rechaza
- webhook de producción encola trabajo firmado sin ejecutar envíos en la petición
- checkout excluye OXXO, reserva stock y reutiliza una sola preferencia
- checkout rechaza CP cambiado sin contactar Mercado Pago

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

