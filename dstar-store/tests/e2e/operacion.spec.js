import { test, expect } from '@playwright/test';
const id='dstar_11111111-1111-4111-8111-111111111111';
const token='a'.repeat(64);
const product={id:'test-new',name:'NUEVA PIEZA',drop:'DROP TEST',price:450,description:'Prenda de prueba',sizes:['S'],sizesStock:{S:2},stock:2,image:'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_blwlew.webp',gallery:[],active:true};
const order={id,paymentStatus:'approved',fulfillment:'ready',status:'done',stock:true,stockItems:[{id:product.id,size:'S',qty:1}],tracking:'TRACK1',guia:{carrier:'DHL'},pedido:{cliente:{nombre:'Cliente de prueba',email:'cliente@example.com',telefono:'5512345678',calle:'Calle 1',colonia:'Centro',cp:'06000',ciudad:'CDMX',estado:'CDMX'},items:[{title:'PIEZA / S',quantity:1,unit_price:450}],total:550},history:[]};
test('panel no ofrece reembolsos ni devoluciones; ajuste conserva ID al reintentar',async({page},info)=>{
  await page.route('**/.netlify/functions/pedidos',r=>r.fulfill({json:{pedidos:[order]}}));
  let count=0,operations=[];
  await page.route('**/api/admin-store',r=>{
    if(r.request().method()==='POST'){
      operations.push(r.request().postDataJSON());count++;
      return r.fulfill({status:count===1?503:200,json:count===1?{error:'Reintenta la misma operación'}:{ok:true}});
    }
    return r.fulfill({json:{products:[product],stock:{[product.id]:{S:2}},inventory:{movements:[]},settings:{},health:{payment:true,webhook:true,shipping:true,mail:false}}});
  });
  await page.goto('/pedidos.html');
  await page.fill('#panelPassword','test-password-long-enough');
  await page.getByRole('button',{name:'ENTRAR',exact:true}).click();
  await expect(page.locator('#panelData')).toBeVisible();
  await expect(page.getByRole('button',{name:/REEMBOLSAR|DEVOLUCIÓN|REPONER/})).toHaveCount(0);
  await page.getByText('INVENTARIO Y MOVIMIENTOS',{exact:true}).click();
  await page.getByRole('button',{name:'AJUSTAR',exact:true}).click();
  await page.getByLabel('Unidades a sumar (+) o restar (−)').fill('1');
  await page.getByLabel('Motivo del ajuste').fill('Conteo físico');
  await page.getByRole('button',{name:'CONFIRMAR',exact:true}).click();
  await expect(page.locator('#actionError')).toContainText('Reintenta');
  await page.getByRole('button',{name:'CONFIRMAR',exact:true}).click();
  await expect(page.locator('#orderDialog')).not.toBeVisible();
  expect(operations).toHaveLength(2);
  expect(operations[0].operationId).toBe(operations[1].operationId);
  expect(operations[0].action).toBe('stock');
  await page.screenshot({path:info.outputPath('panel.png'),fullPage:true});
});
test('seguimiento usa servidor y descuenta solo piezas compradas una vez',async({page})=>{
  const saved={id,token,items:[{id:'p1',size:'S',qty:1}]};
  await page.addInitScript(s=>{
    sessionStorage.setItem('dstar_last_order',JSON.stringify(s));
    localStorage.setItem('dstar_cart',JSON.stringify([{id:'p1',size:'S',qty:2},{id:'p2',size:'L',qty:1}]));
  },saved);
  let state='pending';
  await page.route('**/api/seguimiento',r=>{
    expect(r.request().postDataJSON()).toEqual({id,token});
    return r.fulfill({json:{id,paymentStatus:state,fulfillment:'pending',total:550,items:[]}});
  });
  await page.goto('/seguimiento.html?status=approved#'+id+'/'+token);
  await expect(page.locator('#trackingStatus')).toContainText('Esperando');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dstar_cart'))[0].qty)).toBe(2);
  state='approved';await page.getByRole('button',{name:'ACTUALIZAR ESTADO'}).click();
  await expect(page.locator('#trackingStatus')).toContainText('aprobado');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dstar_cart'))[0].qty)).toBe(1);
  await page.getByRole('button',{name:'ACTUALIZAR ESTADO'}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dstar_cart')).length)).toBe(2);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dstar_cart'))[0].qty)).toBe(1);
});
test('catálogo remoto puede mostrar una nueva pieza sin perder su carrito',async({page})=>{
  await page.route('**/api/catalogo',async r=>{await new Promise(resolve=>setTimeout(resolve,250));return r.fulfill({json:{products:[product]}});});
  await page.addInitScript(()=>localStorage.setItem('dstar_cart',JSON.stringify([{id:'test-new',size:'S',qty:1}])));
  await page.goto('/producto.html?id=test-new');
  await expect(page.locator('#pdName')).toHaveText('NUEVA PIEZA');
  await page.goto('/checkout.html');
  await expect(page.locator('#orderItems')).toContainText('NUEVA PIEZA');
  await expect(page.locator('#referencia')).toBeVisible();
});
test('privacidad muestra datos públicos desde configuración',async({page})=>{
  await page.route('**/api/datos-tienda',r=>r.fulfill({json:{legalName:'Proveedor de prueba',address:'Domicilio de prueba',phone:'5512345678',privacyEmail:'privacidad@example.com',contactEmail:'contacto@example.com'}}));
  await page.goto('/privacidad.html');
  await expect(page.locator('[data-legal="legalName"]')).toHaveText('Proveedor de prueba');
  await expect(page.locator('#legalPending')).toBeHidden();
});
