import test from 'node:test';
import assert from 'node:assert/strict';
import {proxyBackend,config} from '../netlify/edge-functions/bajaj-backend.js';
import {acceptNetlifyGateway,gatewayHeaders,allowedNetlifyOrigin,BACKEND_ORIGIN} from '../lib/netlify-gateway.mjs';
import {handleCMS} from '../lib/cms-server.mjs';
import {digest} from '../lib/cms-auth.mjs';
import {fixture} from './helpers/cms-fixture.mjs';
const origin='https://bajaj-interiorsp.netlify.app',secret='isolated-gateway-test-secret-not-production';
const context={ip:'203.0.113.9'};
function request(path,{method='GET',body,cookie,headers={}}={}){return new Request(origin+path,{method,headers:{...(body?{Origin:origin,'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});}

test('contexto assinado preserva domínio, consulta e IP real sem autenticar pessoas',async()=>{
 const original=request('/admin/ajuda/?modulo=blog'),headers=await gatewayHeaders(original,{secret,origin,ip:context.ip});
 const upstream=new Request(BACKEND_ORIGIN+'/admin/ajuda/?modulo=blog',{headers:{...headers,'CF-Connecting-IP':'198.51.100.7'}});
 const restored=await acceptNetlifyGateway(upstream,secret);assert.ok(restored instanceof Request);assert.equal(restored.url,original.url);assert.equal(restored.headers.get('CF-Connecting-IP'),context.ip);
 assert.equal(restored.headers.get('X-Bajaj-Gateway-Signature'),null);
 const f=fixture(),unauthenticated=await handleCMS(restored,f.env);assert.match(await unauthenticated.text(),/Entrar no painel/);
 const direct=new Request(BACKEND_ORIGIN+'/admin/');assert.equal(await acceptNetlifyGateway(direct,undefined),direct);
 assert.ok(allowedNetlifyOrigin('https://deploy-preview-1--bajaj-interiorsp.netlify.app'));assert.equal(allowedNetlifyOrigin('https://bajaj-interiorsp.netlify.app.evil.test'),false);
});
test('assinaturas inválidas, expiradas, reutilizadas em outra rota ou sem segredo são recusadas',async()=>{
 const incoming=request('/api/admin/me'),stamp=Math.floor(Date.now()/1000),headers=await gatewayHeaders(incoming,{secret,origin,ip:context.ip,time:stamp});
 for(const [path,extra,expected] of [['/api/admin/users',{},403],['/api/admin/me',{'X-Bajaj-Gateway-IP':'203.0.113.10'},403],['/api/admin/me',{'X-Bajaj-Gateway-Origin':'https://evil.test'},403]]){
  const rejected=await acceptNetlifyGateway(new Request(BACKEND_ORIGIN+path,{headers:{...headers,...extra}}),secret);assert.equal(rejected.status,expected);
 }
 assert.equal((await acceptNetlifyGateway(new Request(BACKEND_ORIGIN+'/api/admin/me',{headers}),secret,{time:stamp+120})).status,403);
 assert.equal((await acceptNetlifyGateway(new Request(BACKEND_ORIGIN+'/api/admin/me',{headers}),undefined)).status,503);
});
test('gateway bloqueia outra origem antes de enviar e ignora IP ou identidade fornecidos pelo cliente',async()=>{
 let calls=0;const external=request('/api/auth/login',{method:'POST',body:{},headers:{Origin:'https://evil.test'}});
 assert.equal((await proxyBackend(external,context,{secret,fetcher:async()=>{calls++;return new Response('{}');}})).status,403);assert.equal(calls,0);
 const incoming=request('/api/admin/me',{headers:{'CF-Connecting-IP':'192.0.2.99','oai-authenticated-user-id':'owner','Authorization':'Bearer client-value',Cookie:'tracking=unrelated; __Host-interiorsp_session='+'a'.repeat(64)}});
 await proxyBackend(incoming,context,{secret,fetcher:async upstream=>{calls++;assert.equal(upstream.headers.get('Authorization'),null);assert.equal(upstream.headers.get('oai-authenticated-user-id'),null);assert.equal(upstream.headers.get('Cookie'),'__Host-interiorsp_session='+'a'.repeat(64));const restored=await acceptNetlifyGateway(upstream,secret);assert.equal(restored.headers.get('CF-Connecting-IP'),context.ip);return new Response('{}');}});assert.equal(calls,1);
});
test('login e sessão funcionam no Netlify com as credenciais existentes, mantendo permissões do CMS',async()=>{
 const f=fixture(),token='b'.repeat(64);f.env.CMS_OWNER_SETUP_HASH=await digest(token);f.env.CMS_OWNER_SETUP_EXPIRES=String(Math.floor(Date.now()/1000)+3600);
 const setup=await handleCMS(new Request(BACKEND_ORIGIN+'/api/auth/setup',{method:'POST',headers:{Origin:BACKEND_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({token,username:'owner-test',password:'Frase de teste isolada 2026'})}),f.env);assert.equal(setup.status,200);
 const fetcher=async upstream=>{const restored=await acceptNetlifyGateway(upstream,secret);return restored instanceof Response?restored:handleCMS(restored,f.env);};
 const login=await proxyBackend(request('/api/auth/login',{method:'POST',body:{username:'owner-test',password:'Frase de teste isolada 2026'}}),context,{secret,fetcher});assert.equal(login.status,200);
 const cookie=login.headers.get('Set-Cookie');assert.match(cookie,/__Host-interiorsp_session=.*HttpOnly.*Secure/);assert.doesNotMatch(cookie,/Domain=/);
 const authCookie=cookie.split(';')[0];const me=await proxyBackend(request('/api/admin/me',{cookie:authCookie}),context,{secret,fetcher});assert.equal(me.status,200);assert.equal((await me.json()).user.role,'admin');
 const central=await proxyBackend(request('/api/admin/academy/bootstrap',{cookie:authCookie}),context,{secret,fetcher});assert.equal(central.status,200);assert.ok((await central.json()).entries.length>=30);
 const logout=await proxyBackend(request('/api/auth/logout',{method:'POST',body:{},cookie:authCookie}),context,{secret,fetcher});assert.equal(logout.status,200);assert.match(logout.headers.get('Set-Cookie'),/Max-Age=0/);
 assert.equal((await proxyBackend(request('/api/admin/me',{cookie:authCookie}),context,{secret,fetcher})).status,401);
});
test('cookies externos não são copiados e redirecionamentos ficam no domínio público',async()=>{
 const response=await proxyBackend(request('/admin/entrar/'),context,{secret,fetcher:async()=>{const headers=new Headers({Location:BACKEND_ORIGIN+'/admin/'});headers.append('Set-Cookie','unrelated=value; Path=/; HttpOnly');headers.append('Set-Cookie','__Host-interiorsp_session='+'a'.repeat(64)+'; Path=/; Secure; HttpOnly; SameSite=Lax');return new Response(null,{status:303,headers});}});
 assert.equal(response.status,303);assert.equal(response.headers.get('Location'),origin+'/admin/');assert.doesNotMatch(response.headers.get('Set-Cookie'),/unrelated/);assert.match(response.headers.get('Cache-Control'),/no-store/);
});
test('upload maior que 6 MB atravessa como stream sem buffering na borda',async()=>{
 const size=12*1024*1024,bytes=new Uint8Array(size);bytes[0]=37;bytes[size-1]=70;
 const incoming=new Request(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,'Content-Type':'application/pdf'},body:new ReadableStream({start(controller){controller.enqueue(bytes);controller.close();}}),duplex:'half'});
 const response=await proxyBackend(incoming,context,{secret,fetcher:async upstream=>{assert.equal(upstream.bodyUsed,false);const restored=await acceptNetlifyGateway(upstream,secret);const received=new Uint8Array(await restored.arrayBuffer());assert.equal(received.length,size);assert.equal(received[0],37);assert.equal(received[size-1],70);return new Response('{}',{status:201});}});
 assert.equal(response.status,201);
});
test('rotas dinâmicas têm cobertura e falha de conexão não é anunciada como sucesso',async()=>{
 for(const path of ['/admin/*','/api/admin/*','/api/auth/*','/api/contact','/api/contact/*','/api/blog/*','/api/commerce/*','/blog/*','/ofertas/*','/seminovas/*','/midia/*'])assert.ok(config.path.includes(path));assert.equal(config.path.includes('/*'),false);
 assert.equal((await proxyBackend(request('/api/contact/config'),context,{secret,fetcher:async()=>{throw Error('offline');}})).status,502);
 assert.equal((await proxyBackend(request('/api/contact/config'),context,{})).status,503);
});
