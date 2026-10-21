const { open } = require('../lib/storage');
const { reply, failure } = require('../lib/http');
exports.handler = async event => {
  if(event.httpMethod !== 'GET') return reply(405,{error:'Método no permitido'});
  try {
    const s=(await open('catalogo',event).read('settings'))?.data || {};
    return reply(200,Object.fromEntries(['legalName','address','phone','privacyEmail','contactEmail'].map(k=>[k,s[k]||''])));
  } catch(e){return failure(e);}
};
