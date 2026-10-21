---
tags: [entorno]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# MAIL_FROM

Remitente de los correos (Resend o SMTP); requiere dominio con SPF/DKIM.

Solo el nombre: el valor vive en `.env` (local, fuera de git) y en Netlify → Environment variables.

Parte de: [[Variables de entorno]]
Relacionada con: [[Resend]]

## Leída en

- [[admin-store.js]]
- [[mail.js]]
- [[correcciones.test.cjs]]

