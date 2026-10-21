---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Configuración

Netlify, package.json, manifest y otros archivos de configuración.

Parte de: [[DSTAR]]

## Contenido

- [[manifest.webmanifest]] — Manifest de la PWA (nombre, íconos, colores).
- [[netlify.toml (dstar-store)]] — Configuración de Netlify: functions, redirects (/api/* y rutas internas bloqueadas), headers de seguridad (CSP con hashes en script-src que escribe scripts/csp-hashes.js), no-store y X-Robots-Tag en /pedidos y /seguimiento (este también con Referrer-Policy no-referrer), reconcile-payments programada cada 10 min y caché.
- [[netlify.toml (raíz)]] — Netlify raíz: solo fija base = dstar-store.
- [[package.json (dstar-store)]] — Dependencias y scripts (dev, deploy, test y test:backend con node --test) del sitio.
- [[package.json (raíz)]] — Dependencias de la raíz del repo (sharp para optimizar imágenes).
- [[vite.config.mjs]] — Configuración de Vite heredada; el despliegue es estático y no compila.

