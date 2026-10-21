---
tags: [codigo, frontend]
ruta: "dstar-store/js/pedidos.js"
lineas: 254
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# pedidos.js (js)

`dstar-store/js/pedidos.js` · 254 líneas

Panel de pedidos: guarda la contraseña en sessionStorage (dstar_panel), pide la lista a /.netlify/functions/pedidos con Bearer y muestra pago, preparación, cliente, prendas y guía; acciones en un `<dialog>` (sincronizar, nota, preparación, reenviar correo, cancelar pendiente, reintentar o registrar guía, corregir dirección) y, con /api/admin-store, configuración, inventario con ajustes, catálogo y datos legales.

Parte de: [[Frontend]]

## Conexiones

- Llama a la API: [[pedidos.js (functions)]] (`/api/pedidos`)
- Usa: [[Netlify]], [[Skydropx]], [[Cloudinary]]

## Funciones y clases

- `mxn` (línea 12)
- `fecha` (línea 13)
- `seguro` (línea 14)
- `leerClave` (línea 16)
- `guardarClave` (línea 19)
- `estadoTexto` (línea 24)
- `estado` (línea 25)
- `el` (línea 34)
- `bloque` (línea 45)
- `tarjeta` (línea 49)
- `pintar` (línea 93)
- `mostrar` (línea 105)
- `cargar` (línea 111)
- `button` (línea 170)
- `api` (línea 171)
- `field` (línea 175)
- `dialog` (línea 176)
- `orderActions` (línea 201)
- `act` (línea 203)
- `loadManagement` (línea 219)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

