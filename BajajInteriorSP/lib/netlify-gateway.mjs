// Contexto autenticado do gateway Netlify. A assinatura não autentica pessoas:
// as sessões e permissões do CMS continuam obrigatórias no backend existente.
export const GATEWAY_KEY='BAJAJ_NETLIFY_GATEWAY_SECRET';
export const BACKEND_ORIGIN='https://bajaj-interiorsp.fredborrasca.chatgpt.site';
const encoder=new TextEncoder();
const fields={signature:'X-Bajaj-Gateway-Signature',time:'X-Bajaj-Gateway-Time',origin:'X-Bajaj-Gateway-Origin',ip:'X-Bajaj-Gateway-IP'};
const hex=data=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
let cachedSecret,cachedKey;
async function key(secret){if(cachedSecret!==secret){cachedKey=crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);cachedSecret=secret;}return cachedKey;}
export function allowedNetlifyOrigin(value){
 try{const u=new URL(value);return value===u.origin&&u.protocol==='https:'&&(u.hostname==='bajaj-interiorsp.netlify.app'||/^[a-z0-9-]+--bajaj-interiorsp\.netlify\.app$/.test(u.hostname));}catch{return false;}
}
const message=(request,time,origin,ip)=>{const u=new URL(request.url);return ['bajaj-netlify-v1',time,request.method,u.pathname+u.search,origin,ip].join('\n');};
const unavailable=(status=503)=>new Response(JSON.stringify({error:'A conexão com o sistema está temporariamente indisponível. Tente novamente.'}),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function gatewayHeaders(request,{secret,origin,ip,time=Math.floor(Date.now()/1000)}){
 if(typeof secret!=='string'||secret.length<32||!allowedNetlifyOrigin(origin)||!/^[a-f0-9:.]{3,64}$/i.test(ip))throw Error('Gateway configuration unavailable.');
 const stamp=String(time),signature=hex(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(message(request,stamp,origin,ip))));
 return {[fields.signature]:signature,[fields.time]:stamp,[fields.origin]:origin,[fields.ip]:ip};
}
export async function acceptNetlifyGateway(request,secret,{time=Math.floor(Date.now()/1000)}={}){
 const supplied=Object.values(fields).some(name=>request.headers.has(name));if(!supplied)return request;
 const signature=request.headers.get(fields.signature)||'',stamp=request.headers.get(fields.time)||'',origin=request.headers.get(fields.origin)||'',ip=request.headers.get(fields.ip)||'';
 if(typeof secret!=='string'||secret.length<32)return unavailable();
 if(!/^[a-f0-9]{64}$/.test(signature)||!/^\d{10,12}$/.test(stamp)||Math.abs(time-Number(stamp))>60||!allowedNetlifyOrigin(origin)||!/^[a-f0-9:.]{3,64}$/i.test(ip))return unavailable(403);
 const bytes=Uint8Array.from(signature.match(/../g),v=>Number.parseInt(v,16));
 if(!await crypto.subtle.verify('HMAC',await key(secret),bytes,encoder.encode(message(request,stamp,origin,ip))))return unavailable(403);
 const url=new URL(request.url),publicUrl=new URL(origin);url.protocol=publicUrl.protocol;url.host=publicUrl.host;
 const headers=new Headers(request.headers);for(const name of Object.values(fields))headers.delete(name);
 headers.delete('Host');headers.set('CF-Connecting-IP',ip);
 return new Request(url,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,duplex:'half',redirect:'manual',signal:request.signal});
}
export {unavailable as gatewayUnavailable};
