const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.NODE_ENV='test';process.env.DSTAR_MEMORY_STORE='true';
process.env.MP_ACCESS_TOKEN='TEST';process.env.MP_WEBHOOK_SECRET='TEST';
process.env.PANEL_PASSWORD='test-password-long-enough';process.env.URL_SITIO='https://example.test';
const storage=require('../../netlify/lib/storage');
const stock=require('../../netlify/lib/stock-store');
const {openStore}=require('../../netlify/lib/orders-store');
const {syncPayment}=require('../../netlify/lib/payment-service');
const quotes=require('../../netlify/lib/quotes');
const product=require('../../js/products-data')[0];
const item={id:product.id,size:product.sizes.find(s=>product.sizesStock[s]>0),qty:1};
const client={nombre:'Test User',email:'test@example.com',telefono:'5512345678',calle:'Calle 1',colonia:'Centro',cp:'06000',ciudad:'CDMX',estado:'CDMX'};
const realFetch=global.fetch;
beforeEach(()=>{for(const key of ['RESEND_API_KEY','SMTP_USER','SMTP_PASSWORD','GMAIL_USER','GMAIL_APP_PASSWORD'])delete process.env[key];storage.resetForTests();global.fetch=async()=>{throw new Error('Unexpected network');};});
afterEach(()=>{global.fetch=realFetch;});
const post=b=>({httpMethod:'POST',headers:{authorization:'Bearer '+process.env.PANEL_PASSWORD},body:JSON.stringify(b)});
const payment=(status='approved')=>({status,currency_id:'MXN',transaction_amount:450,metadata:{cliente:client,expected_total:450,stock_items:[item],order_items:[]}});
test('migración conserva ventas al cambiar el stock base',()=>{
  const old={[product.id]:{[item.size]:{base:4,sold:3}}};
  assert.equal(stock.migrate(old,[{...product,sizesStock:{[item.size]:25}}]).units[item.id+'|'+item.size],1);
});
test('solo una reserva concurrente obtiene la última pieza',async()=>{
  const r=await Promise.allSettled([stock.reservar({},'a',[item],Date.now()+100000),stock.reservar({},'b',[item],Date.now()+100000)]);
  assert.equal(r.filter(x=>x.status==='fulfilled').length,1);
  assert.equal((await stock.leerStock({}))[item.id][item.size],0);
});
test('reserva vencida se libera y pago descuenta una sola vez',async()=>{
  await stock.reservar({},'a',[item],Date.now()-1);
  assert.equal((await stock.leerStock({}))[item.id][item.size],1);
  await stock.descontar({},[item],'10','a');await stock.descontar({},[item],'10','a');
  assert.equal((await stock.leerStock({}))[item.id][item.size],0);
});
test('ajuste no pisa ventas ni duplica un reintento',async()=>{
  await stock.descontar({},[item],'10');
  const delta={...item,delta:2};await stock.ajustar({},delta,'adjust','Conteo físico');await stock.ajustar({},delta,'adjust','Conteo físico');
  assert.equal((await stock.leerStock({}))[item.id][item.size],2);
});
test('ajuste no consume piezas reservadas',async()=>{
  await stock.reservar({},'a',[item],Date.now()+100000);
  await assert.rejects(stock.ajustar({},{...item,delta:-1},'adjust','Conteo'),/reservadas/);
});
test('cotización vincula destino, talla, cantidad y caducidad',async()=>{
  const q={quotation_id:'q',rates:[{rate_id:'r',price:100,currency:'MXN'}]};
  await quotes.saveQuote({},q,client,[item],{weight:0.5});
  await quotes.verifyQuote({},'q','r',client,[item]);
  await assert.rejects(quotes.verifyQuote({},'q','r',{...client,cp:'99999'},[item]));
  await assert.rejects(quotes.verifyQuote({},'q','r',client,[{...item,qty:2}]));
  await storage.update(storage.open('cotizaciones',{}),'q',v=>({...v,expires:0}));
  await assert.rejects(quotes.verifyQuote({},'q','r',client,[item]));
});
test('paquete deriva del catálogo, no del peso del cliente',()=>{
  assert.deepEqual(quotes.parcel([{...item,weight:0.01}],[{...product,weight:1,length:40,width:30,height:4}]),{weight:1.1,length:40,width:30,height:6});
});
test('fallo de almacenamiento no activa inventario en memoria fuera de test',()=>{
  process.env.DSTAR_MEMORY_STORE='false';
  assert.throws(()=>storage.open('stock',{}));
  process.env.DSTAR_MEMORY_STORE='true';
});
test('límite concurrente no permite más solicitudes de las configuradas',async()=>{
  const {limitar}=require('../../netlify/lib/rate-limit');
  const results=await Promise.all(Array.from({length:20},()=>limitar({headers:{'x-nf-client-connection-ip':'test-ip'}},'test',5,600)));
  assert.equal(results.filter(x=>x===0).length,5);
});
for(const status of ['refunded','charged_back','cancelled','in_mediation']){
  test('estado '+status+' no repone stock ni compra guía',async()=>{
    await stock.descontar({},[item],'11');
    await openStore({}).set('11',{stock:true,paymentStatus:'approved',pedido:{cliente:client,total:450,items:[]},stockItems:[item]});
    global.fetch=async url=>{assert.match(String(url),/api.mercadopago.com\/v1\/payments\/11/);return Response.json(payment(status));};
    await syncPayment({},'11');
    assert.equal((await openStore({}).get('11')).paymentStatus,status);
    assert.equal((await stock.leerStock({}))[item.id][item.size],0);
  });
}
test('servidor rechaza refund y return: funciones excluidas',async()=>{
  await openStore({}).set('11',{pedido:{cliente:client,total:450},paymentStatus:'approved',stock:true});
  const handler=require('../../netlify/functions/pedidos').handler;
  for(const action of ['refund','return'])assert.equal((await handler(post({id:'11',action,confirmed:true,confirm:true,amount:1,items:[item],note:'test',operationId:crypto.randomUUID()}))).statusCode,400);
  assert.equal(stock.reponer,undefined);
});
test('seguimiento exige token y no expone domicilio ni etiqueta',async()=>{
  const id='dstar_'+crypto.randomUUID(),token=crypto.randomBytes(32).toString('hex');
  await openStore({}).set(id,{trackingToken:token,pedido:{cliente:client,total:450,items:[]},paymentStatus:'approved',guia:{label_url:'https://private.test/label'}});
  const handler=require('../../netlify/functions/seguimiento').handler;
  assert.equal((await handler(post({id,token:'0'.repeat(64)}))).statusCode,404);
  const result=await handler(post({id,token}));assert.equal(result.statusCode,200);
  assert.ok(!result.body.includes(client.calle));assert.ok(!result.body.includes('label'));
});
test('intento rechazado no bloquea otro pago aprobado del mismo checkout',async()=>{
  const id='dstar_'+crypto.randomUUID();
  await openStore({}).set(id,{paymentId:'10',paymentStatus:'rejected',cancelRequested:true,pedido:{cliente:client,total:450,items:[]},stockItems:[item]});
  global.fetch=async()=>Response.json({...payment(),external_reference:id});
  await syncPayment({},'11');
  const p=await openStore({}).get(id);assert.equal(p.paymentId,'11');assert.equal(p.stock,true);assert.equal(p.issue,'cancel_requested');
});
test('validación no vuelve al stock base si falta stock vivo',()=>{
  const {construirPedido}=require('../../netlify/lib/validate');
  assert.match(construirPedido([item],null).error,/inventario/);
});

test('conciliación recupera otro intento aprobado cuando se pierde su webhook',async()=>{
  const id='dstar_'+crypto.randomUUID();
  await openStore({}).set(id,{paymentId:'10',paymentStatus:'rejected',cancelRequested:true,pedido:{cliente:client,total:450,items:[]},stockItems:[item]});
  let searches=0;
  global.fetch=async url=>{
    const path=new URL(url).pathname;
    if(path==='/v1/payments/search'){
      searches++;
      return Response.json({paging:{total:2},results:[{id:10,external_reference:id},{id:11,external_reference:id}]});
    }
    assert.match(path,/\/v1\/payments\/(10|11)$/);
    return Response.json({...payment(path.endsWith('/10')?'rejected':'approved'),external_reference:id});
  };
  await require('../../netlify/lib/reconcile').reconcileOrder({},id);
  const p=await openStore({}).get(id);
  assert.equal(searches,1);assert.equal(p.paymentId,'11');assert.equal(p.paymentStatus,'approved');
  assert.equal(p.stock,true);assert.equal(p.issue,'cancel_requested');
  assert.equal((await stock.leerStock({}))[item.id][item.size],0);
});

test('trabajo interno exige firma íntegra y reciente',async()=>{
  const {dispatch,authorized}=require('../../netlify/lib/jobs');
  let event;
  global.fetch=async(url,options)=>{event={headers:options.headers,body:options.body};return new Response('',{status:202});};
  await dispatch({type:'payment',id:'11'});
  assert.equal(authorized(event),true);
  assert.equal(authorized({...event,body:'{}'}),false);
  assert.equal(authorized({headers:{},body:event.body}),false);
});
test('reintento de ajuste con datos distintos se rechaza',async()=>{
  await stock.ajustar({},{...item,delta:1},'op','Conteo');
  await assert.rejects(stock.ajustar({},{...item,delta:2},'op','Conteo'),/No cambies/);
});
test('webhook de producción encola trabajo firmado sin ejecutar envíos en la petición',async()=>{
  const prev=process.env.CONTEXT;
  process.env.CONTEXT='production';
  let count=0;
  global.fetch=async(url,options)=>{assert.match(String(url),/payment-jobs-background$/);assert.equal(JSON.parse(options.body).id,'12');count++;return new Response('',{status:202});};
  const ts=String(Date.now()),v1=crypto.createHmac('sha256',process.env.MP_WEBHOOK_SECRET).update('id:12;request-id:req;ts:'+ts+';').digest('hex');
  try {
    const r=await require('../../netlify/functions/mp-webhook').handler({httpMethod:'POST',headers:{'x-request-id':'req','x-signature':'ts='+ts+',v1='+v1},body:JSON.stringify({type:'payment',data:{id:'12'}})});
    assert.equal(r.statusCode,200);assert.equal(count,1);
  } finally {if(prev===undefined)delete process.env.CONTEXT;else process.env.CONTEXT=prev;}
});

test('checkout excluye OXXO, reserva stock y reutiliza una sola preferencia',async()=>{
  Object.assign(process.env,{SKYDROPX_CLIENT_ID:'test',SKYDROPX_CLIENT_SECRET:'test'});
  await quotes.saveQuote({},{quotation_id:'Q',rates:[{rate_id:'R',price:100,currency:'MXN',carrier:'DHL'}]},client,[item],{weight:0.5});
  let sent,count=0;
  global.fetch=async(url,options)=>{
    if(String(url).includes('/oauth/token'))return Response.json({access_token:'test',expires_in:7200});
    if(String(url).includes('/quotations/Q'))return Response.json({rates:[{id:'R',total:'100',currency_code:'MXN'}]});
    if(String(url).includes('/checkout/preferences')){sent=JSON.parse(options.body);count++;return Response.json({id:'pref',init_point:'https://www.mercadopago.com.mx/checkout/test'});}
    throw new Error('Unexpected URL');
  };
  const handler=require('../../netlify/functions/mp-preference').handler;
  const data={checkout_id:crypto.randomUUID(),cliente:client,items:[item],quotation_id:'Q',rate_id:'R'};
  const first=await handler(post(data)),second=await handler(post(data));
  assert.equal(first.statusCode,200,first.body);assert.equal(second.statusCode,200,second.body);
  assert.equal(count,1);assert.equal(JSON.parse(first.body).tracking_token,JSON.parse(second.body).tracking_token);
  assert.ok(sent.payment_methods.excluded_payment_types.some(t=>t.id==='ticket'));
  assert.equal(sent.binary_mode,true);assert.equal(sent.expires,true);
  assert.equal((await stock.leerStock({}))[item.id][item.size],0);
});
test('checkout rechaza CP cambiado sin contactar Mercado Pago',async()=>{
  await quotes.saveQuote({},{quotation_id:'Q',rates:[{rate_id:'R',price:100,currency:'MXN'}]},client,[item],{weight:0.5});
  const result=await require('../../netlify/functions/mp-preference').handler(post({checkout_id:crypto.randomUUID(),cliente:{...client,cp:'99999'},items:[item],quotation_id:'Q',rate_id:'R'}));
  assert.equal(result.statusCode,400,result.body);
  assert.equal((await stock.leerStock({}))[item.id][item.size],1);
});
