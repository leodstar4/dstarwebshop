const nodemailer = require('nodemailer');
const { request } = require('./http');
async function send({ to, subject, html, text, key }) {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    return request('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, html, ...(text ? { text } : {}) })
    });
  }
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('Correo no configurado');
  const transporter = nodemailer.createTransport(process.env.SMTP_HOST
    ? { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user, pass }, connectionTimeout: 10000, socketTimeout: 15000 }
    : { service: 'gmail', auth: { user, pass }, connectionTimeout: 10000, socketTimeout: 15000 });
  return transporter.sendMail({ from: process.env.MAIL_FROM || user, to, subject, html, text, messageId: '<' + key.replace(/[^a-zA-Z0-9-]/g, '') + '@dstar.local>' });
}
module.exports = { send };
