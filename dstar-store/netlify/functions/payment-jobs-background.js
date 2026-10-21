const { authorized } = require('../lib/jobs');
exports.handler = async event => {
  if(event.httpMethod!=='POST' || !authorized(event))return {statusCode:401};
  const job=JSON.parse(event.body||'{}');
  if(job.type==='reconcile') {
    const result=await require('../lib/reconcile').reconcile(event);
    if(result.errors.length)throw new Error('Conciliación incompleta; reintentar');
  }
  else if(job.type==='payment' && /^\d{1,20}$/.test(String(job.id||''))) await require('../lib/payment-service').syncPayment(event,String(job.id));
  return {statusCode:200};
};
