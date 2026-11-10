import '@netlify/blobs';
import 'nodemailer';
import mod from '../handlers/evento.js';
import adapt from '../lib/v2.js';

export default adapt(mod.handler);
