const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.NODE_ENV='test';process.env.DSTAR_MEMORY_STORE='true';
process.env.MP_ACCESS_TOKEN='TEST';process.env.MP_WEBHOOK_SECRET='TEST';
process.env.PANEL_PASSWORD='test-password-long-enough';process.env.URL_SITIO='https://example.test';
const storage=require('../../netlify/lib/storage');
const stock=require('../../netlify/lib/stock-store');
const {openStore}=require('../../netlify/lib/orders-store');
const {syncPayment,fulfill}=require('../../netlify/lib/payment-service');
const {reconcile,reconcileOrder}=require('../../netlify/lib/reconcile');
const quotes=require('../../netlify/lib/quotes');
const product=require('../../js/products-data')[0];
const item={id:product.id,size:product.sizes.find(s=>product.sizesStock[s]>0),qty:1};
const client={nombre:'Test User',email:'test@example.com',telefono:'5512345678',calle:'Calle 1',colonia:'Centro',cp:'06000',ciudad:'CDMX',estado:'CDMX'};
const realFetch=global.fetch;
beforeEach(()=>{for(const key of ['RESEND_API_KEY','SMTP_USER','SMTP_PASSWORD','GMAIL_USER','GMAIL_APP_PASSWORD','SKYDROPX_CLIENT_ID','SKYDROPX_CLIENT_SECRET'])delete process.env[key];storage.resetForTests();global.fetch=async()=>{throw new Error('Unexpected network');};});
afterEach(()=>{global.fetch=realFetch;});
const post=b=>({httpMethod:'POST',headers:{authorization:'Bearer '+process.env.PANEL_PASSWORD},body:JSON.stringify(b)});
const payment=(status='approved',extra={})=>({status,currency_id:'MXN',transaction_amount:450,metadata:{cliente:client,expected_total:450,stock_items:[item],order_items:[],rate_id:'R'},...extra});
const mpOnly=body=>async url=>{assert.match(String(url),/api\.mercadopago\.com\/v1\/payments\//);return Response.json(body);};
const units=async()=>(await stock.leerStock({}))[item.id][item.size];

test('pedido del webhook anterior no compra guía, no descuenta stock ni reenvía correos',async()=>{
  process.env.RESEND_API_KEY='x';process.env.MAIL_FROM='DSTAR <a@example.test>';
  await openStore({}).set('900',{status:'failed',stock:true,at:1,pedido:{cliente:client,total:450,items:[]}});
  global.fetch=mpOnly(payment());
  await syncPayment({},'900');
  const p=await openStore({}).get('900');
  assert.equal(p.legacy,true);assert.equal(p.guia,undefined);assert.equal(p.mail,undefined);
  assert.equal(await units(),1);
  await fulfill({},'900');
  assert.equal((await openStore({}).get('900')).shippingState,undefined);
});
test('pedido anterior con monto distinto no se despacha',async()=>{
  await openStore({}).set('901',{status:'done',revisar:true,at:1,pedido:{total:300}});
  global.fetch=mpOnly(payment('approved',{transaction_amount:300}));
  await syncPayment({},'901');
  const p=await openStore({}).get('901');
  assert.notEqual(p.stock,true);assert.equal(p.revisar,true);assert.equal(await units(),1);
});
test('pedido anterior registra un contracargo posterior',async()=>{
  await openStore({}).set('902',{status:'done',at:1,tracking:'T',pedido:{cliente:client,total:450,items:[]}});
  global.fetch=mpOnly(payment('charged_back'));
  await syncPayment({},'902');
  const p=await openStore({}).get('902');
  assert.equal(p.paymentStatus,'charged_back');assert.equal(p.revisar,true);
});
test('conciliación ignora pedidos anteriores y terminados',async()=>{
  const s=openStore({});
  await s.set('903',{status:'done',at:1,pedido:{cliente:client,total:450}});
  await s.set('dstar_'+crypto.randomUUID(),{fingerprint:'f',status:'expired',paymentStatus:'expired',pedido:{total:450}});
  await s.set('dstar_'+crypto.randomUUID(),{fingerprint:'f',paymentStatus:'approved',fulfillment:'delivered',pedido:{total:450}});
  await s.set('dstar_'+crypto.randomUUID(),{fingerprint:'f',paymentStatus:'refunded',pedido:{total:450}});
  assert.deepEqual(await reconcile({}),{checked:0,errors:[]});
});
test('tarjeta rechazada conserva el apartado y no alerta a la tienda',async()=>{
  process.env.RESEND_API_KEY='x';process.env.MAIL_FROM='DSTAR <a@example.test>';process.env.EMAIL_ORIGEN='tienda@example.test';
  const id='dstar_'+crypto.randomUUID();
  await stock.reservar({},id,[item],Date.now()+100000);
  await openStore({}).set(id,{fingerprint:'f',paymentStatus:'pending',reservedUntil:Date.now()+100000,pedido:{cliente:client,total:450,items:[]},stockItems:[item]});
  global.fetch=mpOnly(payment('rejected',{external_reference:id}));
  await syncPayment({},'20');
  const p=await openStore({}).get(id);
  assert.equal(p.paymentStatus,'rejected');assert.ok(!p.revisar);assert.equal(p.alerts,undefined);
  assert.equal(await units(),0);
});
test('apartado de un pago rechazado vence en la conciliación',async()=>{
  const id='dstar_'+crypto.randomUUID();
  await stock.reservar({},id,[item],Date.now()+100000);
  await openStore({}).set(id,{fingerprint:'f',paymentId:'20',paymentStatus:'rejected',reservedUntil:Date.now()-1,pedido:{cliente:client,total:450,items:[]},stockItems:[item]});
  global.fetch=async url=>{
    const path=new URL(url).pathname;
    if(path==='/v1/payments/search')return Response.json({paging:{total:1},results:[{id:20,external_reference:id}]});
    return Response.json(payment('rejected',{external_reference:id}));
  };
  await reconcileOrder({},id);
  const p=await openStore({}).get(id);
  assert.equal(p.status,'expired');assert.equal(p.paymentStatus,'rejected');
  assert.equal(await units(),1);
});
test('sin credenciales de Skydropx la guía queda como fallida y se puede reintentar',async()=>{
  const id='dstar_'+crypto.randomUUID();
  await openStore({}).set(id,{fingerprint:'f',paymentStatus:'approved',stock:true,pedido:{cliente:client,total:450,items:[]},shipping:{rate_id:'R'}});
  await fulfill({},id);
  const p=await openStore({}).get(id);
  assert.equal(p.shippingState,'failed');assert.equal(p.issue,'shipping_failed');
});
test('reintento tras falla de Mercado Pago crea la preferencia sin quedar bloqueado',async()=>{
  Object.assign(process.env,{SKYDROPX_CLIENT_ID:'test',SKYDROPX_CLIENT_SECRET:'test'});
  await quotes.saveQuote({},{quotation_id:'Q',rates:[{rate_id:'R',price:100,currency:'MXN',carrier:'DHL'}]},client,[item],{weight:0.5});
  let calls=0;
  global.fetch=async url=>{
    if(String(url).includes('/oauth/token'))return Response.json({access_token:'test',expires_in:7200});
    if(String(url).includes('/quotations/Q'))return Response.json({rates:[{id:'R',total:'100',currency_code:'MXN'}]});
    if(String(url).includes('/checkout/preferences')){calls++;return calls===1?new Response('{}',{status:502}):Response.json({id:'pref',init_point:'https://www.mercadopago.com.mx/checkout/test'});}
    throw new Error('Unexpected URL');
  };
  const handler=require('../../netlify/handlers/mp-preference').handler;
  const data={checkout_id:crypto.randomUUID(),cliente:client,items:[item],quotation_id:'Q',rate_id:'R'};
  assert.equal((await handler(post(data))).statusCode,503);
  const first=await openStore({}).get('dstar_'+data.checkout_id);
  assert.ok(!first.revisar);
  const retry=await handler(post(data));
  assert.equal(retry.statusCode,200,retry.body);
  assert.equal(JSON.parse(retry.body).tracking_token,first.trackingToken);
  assert.equal(await units(),0);
});
test('preferencia vencida pide reiniciar el pago',async()=>{
  const id=crypto.randomUUID();
  await openStore({}).set('dstar_'+id,{preferenceState:'ready',preference:{init_point:'https://www.mercadopago.com.mx/x'},expiresAt:Date.now()-1,pedido:{total:450}});
  const result=await require('../../netlify/handlers/mp-preference').handler(post({checkout_id:id,cliente:client,items:[item],quotation_id:'Q',rate_id:'R'}));
  assert.equal(result.statusCode,409);assert.equal(JSON.parse(result.body).restart,true);
});
test('quien pierde la última pieza no deja un pedido para revisar',async()=>{
  Object.assign(process.env,{SKYDROPX_CLIENT_ID:'test',SKYDROPX_CLIENT_SECRET:'test'});
  await quotes.saveQuote({},{quotation_id:'Q',rates:[{rate_id:'R',price:100,currency:'MXN',carrier:'DHL'}]},client,[item],{weight:0.5});
  global.fetch=async url=>{
    if(String(url).includes('/oauth/token'))return Response.json({access_token:'test',expires_in:7200});
    if(String(url).includes('/quotations/Q')){await stock.reservar({},'otro',[item],Date.now()+100000);return Response.json({rates:[{id:'R',total:'100',currency_code:'MXN'}]});}
    throw new Error('Unexpected URL');
  };
  const id=crypto.randomUUID();
  const result=await require('../../netlify/handlers/mp-preference').handler(post({checkout_id:id,cliente:client,items:[item],quotation_id:'Q',rate_id:'R'}));
  assert.equal(result.statusCode,409,result.body);
  const p=await openStore({}).get('dstar_'+id);
  assert.ok(!p?.pedido);assert.ok(!p?.revisar);
});
test('el inventario poda apartados vencidos y movimientos antiguos',()=>{
  const s={version:2,units:{},reservations:{viejo:{items:[],until:Date.now()-2*86400000},nuevo:{items:[],until:Date.now()+1000}},sales:{a:{at:Date.now()-300*86400000},b:{at:Date.now()},c:{}},movements:[{type:'migration'},...Array.from({length:2500},(_,i)=>({type:'sale',id:String(i)}))]};
  const r=stock.prune(s);
  assert.deepEqual(Object.keys(r.reservations),['nuevo']);
  assert.deepEqual(Object.keys(r.sales),['b','c']);
  assert.equal(r.movements.length,2000);assert.equal(r.movements[0].type,'migration');assert.equal(r.movements.at(-1).id,'2499');
});
