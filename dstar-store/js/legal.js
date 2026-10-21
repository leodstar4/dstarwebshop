fetch('/api/datos-tienda',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(s=>{
  document.querySelectorAll('[data-legal]').forEach(el=>{
    const value=s[el.dataset.legal];
    el.textContent=value || 'Pendiente de completar por DSTAR';
    if(el.tagName==='A' && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))el.href='mailto:'+value;
  });
  const warning=document.getElementById('legalPending');
  if(warning)warning.hidden=Boolean(s.legalName&&s.address&&s.phone&&s.privacyEmail&&s.contactEmail);
}).catch(()=>{const el=document.getElementById('legalPending');if(el)el.textContent='No se pudieron cargar los datos del proveedor. Solicítalos a DSTAR antes de comprar.';});
