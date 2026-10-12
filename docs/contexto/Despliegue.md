---
tags: [contexto]
---
# Despliegue

- Hosting en [[Netlify]]. La raíz tiene [[netlify.toml (raíz)]] solo para fijar la base en `dstar-store`; el resto está en [[netlify.toml (dstar-store)]].
- Sitio estático: no hay paso de build, aunque exista [[vite.config.mjs]].
- Node 22 para las funciones.
- Local: `npm run dev` dentro de `dstar-store` ([[Netlify CLI]] en el puerto 8888); producción: se despliega solo con `git push` a `main` (Netlify construye desde GitHub).
- Variables de entorno: [[Variables de entorno]].

Parte de: [[DSTAR]]
