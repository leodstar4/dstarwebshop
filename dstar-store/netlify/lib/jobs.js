const crypto = require('crypto');
function signature(ts, body) {
  if (!process.env.MP_WEBHOOK_SECRET) throw new Error('MP_WEBHOOK_SECRET requerido');
  return crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update('dstar-internal-job:' + ts + ':' + body).digest('hex');
}
function authorized(event) {
  const ts=event.headers?.['x-job-time'], sig=event.headers?.['x-job-signature'];
  if(!/^\d+$/.test(ts||'') || Math.abs(Date.now()-Number(ts))>300000 || !/^[a-f0-9]{64}$/.test(sig||'')) return false;
  return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(signature(ts,event.body||'')));
}
async function dispatch(job) {
  const site=(process.env.URL_SITIO||process.env.URL||'').replace(/\/$/,'');
  if(!/^https:\/\//.test(site))throw new Error('URL_SITIO requerido');
  const body=JSON.stringify(job),ts=String(Date.now());
  const r=await fetch(site+'/.netlify/functions/payment-jobs-background',{method:'POST',headers:{'Content-Type':'application/json','x-job-time':ts,'x-job-signature':signature(ts,body)},body,signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error('No se pudo encolar conciliación');
}
module.exports={authorized,dispatch};
