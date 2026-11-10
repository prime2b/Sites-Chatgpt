import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './helpers/cms-fixture.mjs';
import { digest } from '../lib/cms-auth.mjs';
import { handleCMS } from '../lib/cms-server.mjs';
import { handleBlog,publishedArticles,replaceHomeBlog } from '../lib/blog-server.mjs';
import { resolveOffer,renderBody,articlePage } from '../lib/blog-view.mjs';

async function auth(f,action,body,{cookie=null,origin='https://bajaj.test'}={}){
 const headers={'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})};
 const response=await handleCMS(new Request('https://bajaj.test/api/auth/'+action,{method:'POST',headers,body:JSON.stringify(body)}),f.env);
 return {response,status:response.status,data:await response.json(),cookie:response.headers.get('Set-Cookie')?.split(';')[0]};
}
async function setup(f,username='fred'){
 const token='a'.repeat(64);f.env.CMS_OWNER_SETUP_HASH=await digest(token);f.env.CMS_OWNER_SETUP_EXPIRES=String(Math.floor(Date.now()/1000)+3600);
 return auth(f,'setup',{token,username,password:'Uma frase secreta de teste 2026'});
}
test('ativação privada cria senha com hash, sessão HttpOnly e token de uso único',async()=>{
 const f=fixture(),result=await setup(f);assert.equal(result.status,200);assert.match(result.response.headers.get('Set-Cookie'),/__Host-.*HttpOnly.*SameSite=Lax.*Secure/);
 const credential=f.sqlite.prepare('SELECT * FROM cms_credentials').get();assert.equal(credential.username,'fred');assert.notEqual(credential.password_hash,'Uma frase secreta de teste 2026');assert.equal(credential.password_hash.length,64);
 const replay=await auth(f,'setup',{token:'a'.repeat(64),username:'invasor',password:'Outro acesso indevido 2026'});assert.equal(replay.status,400);
 const me=await handleCMS(new Request('https://bajaj.test/api/admin/me',{headers:{Cookie:result.cookie}}),f.env);assert.equal(me.status,200);assert.equal((await me.json()).user.role,'admin');
});
test('login funciona sem identidade ChatGPT e não aceita cabeçalhos da sessão antiga',async()=>{
 const f=fixture();await setup(f);
 const login=await auth(f,'login',{username:'fred',password:'Uma frase secreta de teste 2026'});assert.equal(login.status,200);
 const forged=await handleCMS(new Request('https://bajaj.test/api/admin/me',{headers:{'oai-authenticated-user-id':'owner-id','oai-authenticated-user-email':'owner@example.test'}}),f.env);assert.equal(forged.status,401);
 assert.equal((await auth(f,'login',{username:'fred',password:'senha incorreta'})).status,401);
 assert.equal((await auth(f,'login',{username:'pessoa-inexistente',password:'senha incorreta'})).data.error,'Usuário ou senha inválidos.');
});
test('limita tentativas, bloqueia outra origem e encerra sessão ao sair ou expirar',async()=>{
 const f=fixture();const setupResult=await setup(f);
 assert.equal((await auth(f,'login',{username:'fred',password:'Uma frase secreta de teste 2026'},{origin:'https://outra.test'})).status,403);
 for(let i=0;i<10;i++)assert.equal((await auth(f,'login',{username:'fred',password:'incorreta'})).status,401);
 assert.equal((await auth(f,'login',{username:'fred',password:'incorreta'})).status,429);
 await auth(f,'logout',{}, {cookie:setupResult.cookie});
 assert.equal((await handleCMS(new Request('https://bajaj.test/api/admin/me',{headers:{Cookie:setupResult.cookie}}),f.env)).status,401);
});
test('redefinição individual revoga sessões e senha antiga; mudança exige a senha atual',async()=>{
 const f=fixture();const initial=await setup(f);
 const changed=await auth(f,'password',{current_password:'Uma frase secreta de teste 2026',password:'Uma nova frase pessoal 2026'},{cookie:initial.cookie});assert.equal(changed.status,200);
 assert.equal((await handleCMS(new Request('https://bajaj.test/api/admin/me',{headers:{Cookie:initial.cookie}}),f.env)).status,401);
 assert.equal((await auth(f,'login',{username:'fred',password:'Uma frase secreta de teste 2026'})).status,401);
 assert.equal((await auth(f,'login',{username:'fred',password:'Uma nova frase pessoal 2026'})).status,200);
 assert.equal((await auth(f,'password',{current_password:'errada',password:'Outra frase pessoal segura'},{cookie:changed.cookie})).status,401);
 const create=await handleCMS(new Request('https://bajaj.test/api/admin/users',{method:'POST',headers:{Cookie:changed.cookie,Origin:'https://bajaj.test','Content-Type':'application/json'},body:JSON.stringify({name:'Pessoa editora',email:'editora@example.test',role:'editor',active:true,can_contacts:false})}),f.env);
 const user=await create.json();assert.equal(create.status,200);assert.match(user.activation_url,/\/admin\/ativar\/#token=/);
 const token=user.activation_url.split('token=')[1];const activation=await auth(f,'setup',{token,username:'editora',password:'Senha pessoal da editora 2026'});assert.equal(activation.status,200);
 const contact=await handleCMS(new Request('https://bajaj.test/api/admin/contacts',{headers:{Cookie:activation.cookie}}),f.env);assert.equal(contact.status,403);
 const people=await handleCMS(new Request('https://bajaj.test/api/admin/users',{headers:{Cookie:activation.cookie}}),f.env);assert.equal(people.status,403);
});
test('cadastro inicial não é público, links expiram e senhas curtas são recusadas',async()=>{
 const f=fixture();assert.equal((await auth(f,'setup',{token:'b'.repeat(64),username:'fred',password:'Frase longa de teste'})).status,400);
 const token='a'.repeat(64);f.env.CMS_OWNER_SETUP_HASH=await digest(token);f.env.CMS_OWNER_SETUP_EXPIRES='1';
 assert.equal((await auth(f,'setup',{token,username:'fred',password:'Frase longa de teste'})).status,400);
 assert.equal((await auth(f,'setup',{token,username:'fred',password:'curta'})).status,400);
});
test('três artigos são persistidos sem sobrescrever edição, com listagem e detalhes em HTML',async()=>{
 const f=fixture(),articles=await publishedArticles(f.env);assert.equal(articles.length,3);
 const first=articles[0];const draft=JSON.parse(first.published_json);assert.ok(draft.model_ids.length);assert.equal(draft.related_offers.length,3);
 const index=await handleBlog(new Request('https://bajaj.test/blog/'),f.env);assert.equal(index.status,200);assert.equal((await index.text()).match(/class="blog-card"/g).length,3);
 const page=await handleBlog(new Request('https://bajaj.test/blog/'+first.slug+'/'),f.env);const html=await page.text();assert.equal(page.status,200);assert.match(html,/Motos citadas no artigo/);assert.match(html,/Ofertas relacionadas:/);assert.equal(html.match(/class="blog-related-offer"/g).length,3);assert.match(html,/class="blog-offer-banner"/);assert.match(html,/Nossas lojas/);assert.match(html,/application\/ld\+json/);
 f.sqlite.prepare('UPDATE cms_content SET draft_json=? WHERE id=?').run(JSON.stringify({...draft,title:'Uma alteração editorial preservada'}),first.id);
 await publishedArticles(f.env);assert.match(f.sqlite.prepare('SELECT draft_json FROM cms_content WHERE id=?').get(first.id).draft_json,/Uma alteração editorial preservada/);
});
test('retirada remove artigo da Home, da listagem e do endereço público sem perder o registro',async()=>{
 const f=fixture();const articles=await publishedArticles(f.env);const first=articles[0];
 f.sqlite.prepare("UPDATE cms_content SET status='draft',published_json=NULL WHERE id=?").run(first.id);
 const root=await replaceHomeBlog('before<!-- BLOG_LATEST_START -->antigo<!-- BLOG_LATEST_END -->after',f.env);assert.doesNotMatch(root,new RegExp(first.slug));assert.equal((root.match(/class="blog-card"/g)||[]).length,2);
 assert.equal((await handleBlog(new Request('https://bajaj.test/blog/'+first.slug+'/'),f.env)).status,404);
 assert.equal((await publishedArticles(f.env)).length,2);assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM cms_content').get().n,3);
});
test('vínculos respeitam ordem editorial e campanhas vencidas, futuras ou retiradas não aparecem',async()=>{
 const model='dominar-ns400z',draft={commerce_version:1,cover_id:'test-image',cover_alt:'Imagem de homologação',unit_ids:['rio-preto'],commercial_options:[{id:'1',title:'Teste',details:'Uma condição de homologação'}],title:'Campanha aprovada',summary:'Consulte a unidade',offer_model:model,starts_at:'2026-10-01T00:00:00Z',valid_until:'2026-11-01T00:00:00Z'};
 const row={id:'campaign-1',kind:'ofertas',slug:'campanha',status:'published',published_json:JSON.stringify(draft)};
 assert.ok(resolveOffer('campaign:campaign-1',[row],Date.parse('2026-10-30T00:00:00Z')));
 assert.equal(resolveOffer('campaign:campaign-1',[row],Date.parse('2026-11-02T00:00:00Z')),null);
 assert.equal(resolveOffer('campaign:campaign-1',[row],Date.parse('2026-09-01T00:00:00Z')),null);
 assert.equal(resolveOffer('campaign:campaign-1',[{...row,status:'draft'}]),null);
 assert.equal(resolveOffer('catalog:'+model).price,26990);
});
test('artigos escapam HTML e links inseguros; template mantém a estrutura da referência',async()=>{
 const body=renderBody('## Título seguro\n\n**Negrito** e <script>alert(1)</script>\n\n- item um\n- item dois\n\n[ruim](javascript:alert)');
 assert.match(body,/<h2>Título seguro<\/h2>/);assert.match(body,/<strong>Negrito/);assert.doesNotMatch(body,/<script>|href="javascript/);assert.match(body,/<ul>/);
 const f=fixture(),[row]=await publishedArticles(f.env),html=articlePage(row,{related:[]});
 assert.ok(html.indexOf('blog-author')<html.indexOf('blog-cited-models'));assert.ok(html.indexOf('blog-cited-models')<html.indexOf('blog-offer-banner'));assert.ok(html.indexOf('blog-offer-banner')<html.indexOf('blog-store-shortcut'));assert.ok(html.indexOf('blog-store-shortcut')<html.indexOf('blog-related-offers'));
});
