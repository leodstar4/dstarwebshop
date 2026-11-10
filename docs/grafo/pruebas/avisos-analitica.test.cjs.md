---
tags: [codigo, prueba]
ruta: "dstar-store/tests/backend/avisos-analitica.test.cjs"
lineas: 91
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# avisos-analitica.test.cjs

`dstar-store/tests/backend/avisos-analitica.test.cjs` · 91 líneas

Pruebas de backend con node --test: analítica agregada sin datos personales, robots, eventos desconocidos y productos inexistentes ignorados, contraseña en /api/analitica, validación de avisos (correo, consentimiento, talla) y aviso de talla enviado una sola vez, solo con stock y con baja que funciona.

Parte de: [[Pruebas]]

## Conexiones

- Importa: [[storage.js]], [[stock-store.js]], [[evento.js]], [[analitica.js]], [[avisame.js]], [[avisos.js (handlers)]], [[avisos.js (lib)]], [[products-data.js]]
- Referencia a: [[producto.html]]
- Usa: [[Resend]]
- Lee la variable: [[DSTAR_MEMORY_STORE]], [[PANEL_PASSWORD]], [[URL_SITIO]], [[RESEND_API_KEY]], [[MAIL_FROM]]

## Funciones y clases

- `ev` (línea 22)
- `adminGet` (línea 23)
- `adminPost` (línea 24)
- `pedir` (línea 25)

## Casos de prueba

- analítica agrega visitas, productos y fuentes sin datos personales
- analítica ignora robots, eventos desconocidos y productos inexistentes
- analítica del panel exige contraseña
- aviso exige correo válido, consentimiento y talla existente
- aviso de talla se envía una vez, solo con stock, y la baja funciona

