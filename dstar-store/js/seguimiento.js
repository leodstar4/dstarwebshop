(() => {
  const status = document.getElementById('trackingStatus'), detail = document.getElementById('trackingDetail'), button = document.getElementById('trackingRefresh');
  const parts = location.hash.slice(1).split('?')[0].split('/');
  let saved; try { saved = JSON.parse(sessionStorage.getItem('dstar_last_order')); } catch {}
  const id = parts[0] || saved?.id, token = parts[1] || saved?.token;
  const names = { approved: 'Pago aprobado', pending: 'Esperando confirmación del pago', in_process: 'Pago en proceso', rejected: 'Pago rechazado', cancelled: 'Pago cancelado', refunded: 'Pago reembolsado', charged_back: 'Contracargo', in_mediation: 'Pago en revisión', expired: 'Intento de pago vencido', ready: 'Guía creada; pendiente de despacho', packed: 'Preparado', shipped: 'Enviado', delivered: 'Entregado', returned: 'Devuelto' };
  const money = n => new Intl.NumberFormat('es-MX', {style:'currency',currency:'MXN'}).format(n);
  const row = (dl,k,v) => { const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd); };
  async function refresh() {
    button.disabled=true;
    try {
      if (!id || !token) throw new Error('Abre el enlace privado que recibiste al realizar tu compra.');
      const r=await fetch('/api/seguimiento',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,token}),cache:'no-store'});
      const p=await r.json(); if(!r.ok) throw new Error(p.error || 'No pudimos consultar el pedido.');
      status.textContent=names[p.paymentStatus] || 'Estado en revisión';
      detail.hidden=false; const dl=document.createElement('dl');
      row(dl,'Pedido',p.id); row(dl,'Total',money(p.total)); row(dl,'Preparación',names[p.fulfillment] || 'Pendiente');
      if(p.refundedAmount) row(dl,'Reembolsado',money(p.refundedAmount));
      if(p.tracking) row(dl,'Rastreo',p.carrier+' '+p.tracking);
      detail.replaceChildren(dl);
      if(/^https:\/\//.test(p.tracking_url)){const a=document.createElement('a');a.href=p.tracking_url;a.textContent='RASTREAR PAQUETE';a.target='_blank';a.rel='noopener noreferrer';detail.append(a);}
      if(p.review){const msg=document.createElement('p');msg.textContent='Nuestro equipo está revisando una incidencia de este pedido.';detail.append(msg);}
      // Only remove purchased quantities, once, after server confirmation.
      if(p.paymentStatus==='approved' && saved?.id===id && !saved.cleared){
        try {
          const cart=JSON.parse(localStorage.getItem('dstar_cart') || '[]');
          for(const i of saved.items || []) { const line=cart.find(x=>x.id===i.id&&x.size===i.size);if(line)line.qty=Math.max(0,line.qty-i.qty); }
          localStorage.setItem('dstar_cart',JSON.stringify(cart.filter(i=>i.qty>0)));
          saved.cleared=true;sessionStorage.setItem('dstar_last_order',JSON.stringify(saved));
        } catch {}
      }
    } catch(e){status.textContent=e.message;} finally{button.disabled=false;}
  }
  button.addEventListener('click',refresh);refresh();
})();
