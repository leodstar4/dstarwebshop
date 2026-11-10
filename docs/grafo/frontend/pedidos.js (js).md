---
tags: [codigo, frontend]
ruta: "dstar-store/js/pedidos.js"
lineas: 355
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# pedidos.js (js)

`dstar-store/js/pedidos.js` · 355 líneas

Panel de pedidos: guarda la contraseña en sessionStorage (dstar_panel), pide la lista a /.netlify/functions/pedidos con Bearer y muestra pago, preparación, cliente, prendas y guía; acciones en un `<dialog>` (sincronizar, nota, preparación, reenviar correo, cancelar pendiente, reintentar o registrar guía, corregir dirección); con /api/admin-store, configuración, inventario con ajustes, catálogo y datos legales; con /api/analitica, embudo, productos, fuentes, dispositivos y páginas del periodo; con /api/avisos, la lista del próximo drop (EXPORTAR CSV), las tallas pedidas con AVISAR si hay stock y QUITAR por correo.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[pedidos.js (handlers)]] (`/api/pedidos`)
- Usa: [[Netlify]], [[Skydropx]], [[Cloudinary]]

## Funciones y clases

- `mxn` (línea 14)
- `fecha` (línea 15)
- `seguro` (línea 16)
- `leerClave` (línea 18)
- `guardarClave` (línea 21)
- `estadoTexto` (línea 26)
- `estado` (línea 27)
- `el` (línea 36)
- `bloque` (línea 47)
- `tarjeta` (línea 51)
- `pintar` (línea 95)
- `mostrar` (línea 107)
- `cargar` (línea 113)
- `button` (línea 176)
- `api` (línea 177)
- `field` (línea 181)
- `dialog` (línea 182)
- `orderActions` (línea 207)
- `act` (línea 209)
- `loadManagement` (línea 225)
- `pct` (línea 252)
- `nombre` (línea 253)
- `tabla` (línea 254)
- `barra` (línea 259)
- `loadAnalytics` (línea 265)
- `csv` (línea 298)
- `cell` (línea 299)
- `loadAvisos` (línea 308)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores
- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

