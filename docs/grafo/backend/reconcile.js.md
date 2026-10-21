---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/reconcile.js"
lineas: 63
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# reconcile.js

`dstar-store/netlify/lib/reconcile.js` · 63 líneas

Conciliación: reconcile revisa hasta 20 pedidos activos por lote rotando el cursor (store operacion) con tope de 5 min; reconcileOrder sincroniza el pago conocido, busca otros intentos del mismo checkout por external_reference, vence apartados sin pago y despacha aprobados; ignora legacy, vencidos, entregados, reembolsados, cancelados, contracargos y enviados de más de 30 días salvo sincronización manual.

Parte de: [[Backend]]

## Conexiones

- Importa: [[orders-store.js]], [[payment-service.js]], [[stock-store.js]], [[storage.js]], [[http.js]]

## Funciones y clases

- `active` (línea 8)
- `reconcileOrder` (línea 14)
- `unpaid` (línea 34)
- `reconcile` (línea 46)

