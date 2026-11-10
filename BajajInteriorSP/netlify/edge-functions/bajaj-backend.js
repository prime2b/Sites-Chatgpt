import {BACKEND_ORIGIN,GATEWAY_KEY,allowedNetlifyOrigin,gatewayHeaders,gatewayUnavailable} from '../../lib/netlify-gateway.mjs';

export const config={
 path:['/admin','/admin/*','/api/admin','/api/admin/*','/api/auth/*','/api/contact','/api/contact/*','/api/blog/*','/api/commerce/*','/pos-venda/revisoes','/pos-venda/revisoes/','/blog','/blog/*','/ofertas','/ofertas/*','/seminovas','/seminovas/*','/conteudos/*','/midia/*'],
 onError:'fail'
};
const isWrite=method=>!['GET','HEAD','OPTIONS'].includes(method);
export async function proxyBackend(request,context,{secret,fetcher=fetch}={}){
 const publicUrl=new URL(request.url);
 if(!allowedNetlifyOrigin(publicUrl.origin)||!secret)return gatewayUnavailable();
 // Valida no domínio público antes de encaminhar. O backend fará a mesma
 // conferência após verificar a assinatura do contexto Netlify.
 if(isWrite(request.method)&&request.headers.get('Origin')!==publicUrl.origin)return new Response(JSON.stringify({error:'Origem não autorizada. Atualize a página e tente novamente.'}),{status:403,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store'}});
 const target=new URL(BACKEND_ORIGIN);target.pathname=publicUrl.pathname;target.search=publicUrl.search;
 const headers=new Headers();
 for(const name of ['Accept','Accept-Language','Content-Type','Content-Length','User-Agent','Origin','Referer','Range','If-Range']){const value=request.headers.get(name);if(value!==null)headers.set(name,value);}
 const cookie=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).filter(x=>/^__Host-interiorsp_session=[a-f0-9]{64}$/.test(x)).join('; ');if(cookie)headers.set('Cookie',cookie);
 headers.set('Accept-Encoding','identity');
 try{
  const signed=await gatewayHeaders(request,{secret,origin:publicUrl.origin,ip:context.ip||'0.0.0.0'});for(const [name,value]of Object.entries(signed))headers.set(name,value);
  // Encaminha o stream, sem carregar imagens/PDFs inteiros na memória da borda.
  const upstream=await fetcher(new Request(target,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,duplex:'half',redirect:'manual',signal:request.signal}));
  const outgoing=new Headers(upstream.headers);outgoing.delete('Content-Encoding');outgoing.delete('Content-Length');outgoing.delete('Set-Cookie');outgoing.set('Cache-Control','private, no-store');
  const cookies=typeof upstream.headers.getSetCookie==='function'?upstream.headers.getSetCookie():[(upstream.headers.get('Set-Cookie')||'')];
  for(const raw of cookies){for(const match of raw.matchAll(/(?:^|,\s*)(__Host-interiorsp_session=[^,]*)/g))outgoing.append('Set-Cookie',match[1]);}
  const location=outgoing.get('Location');if(location){const redirect=new URL(location,BACKEND_ORIGIN);if(redirect.origin===BACKEND_ORIGIN)outgoing.set('Location',publicUrl.origin+redirect.pathname+redirect.search+redirect.hash);}
  return new Response(request.method==='HEAD'||[204,205,304].includes(upstream.status)?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:outgoing});
 }catch{return gatewayUnavailable(502);}
}
export default (request,context)=>proxyBackend(request,context,{secret:Netlify.env.get(GATEWAY_KEY)});
