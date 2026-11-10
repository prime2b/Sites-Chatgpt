import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/cms-fixture.mjs';
import {models} from '../lib/blog-catalog.mjs';
import {assertPublishable} from '../lib/cms-domain.mjs';
import {handleContact} from '../lib/contact-server.mjs';
import {NOTICE_VERSION} from '../lib/contact-domain.mjs';

test('catálogo original aparece somente em 0 km, preservando os seis preços, filtros e ações',async()=>{
 const f=fixture(),html=await (await f.request('/ofertas/',{actor:null})).text();
 const config=JSON.parse(html.match(/id="offers-data">(.*?)<\/script>/s)[1]);
 assert.equal(config.models.length,6);
 for(const model of models){assert.equal(config.models.find(m=>m.id===model.id).price,model.price);assert.match(html,new RegExp('/motos/'+model.id+'/'));assert.ok(html.includes('data-offer-bia="'+model.id+'"'));}
 assert.match(html,/Quanto você quer investir/);assert.match(html,/Filtrar modelos por linha/);assert.match(html,/Maior preço/);
 assert.ok(html.indexOf('data-offers-catalog')>html.indexOf('commerce-campaign-heading'));
 assert.equal((html.match(/data-offer-card=/g)||[]).length,6);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 const fragment=await (await f.request('/api/commerce/fragment',{actor:null})).json();assert.doesNotMatch(fragment.html,/data-offer-card/);
 const stock=await (await f.request('/ofertas/?aba=seminovas',{actor:null})).text();assert.doesNotMatch(stock,/data-offers-catalog|offers-budget/);
});

test('seis seminovas completas persistem no CMS com imagens e nunca são duplicadas ou recriadas após retirada',async()=>{
 const f=fixture({seedStockDemos:true});const response=await f.request('/ofertas/?aba=seminovas',{actor:null});assert.equal(response.status,200);
 const html=await response.text();assert.equal((html.match(/class="commerce-card stock-card is-demo"/g)||[]).length,6);assert.match(html,/Cadastros de demonstração/);
 let items=(await f.call('content?kind=seminovas')).data.items;assert.equal(items.length,6);assert.equal(new Set(items.map(r=>r.stock_code)).size,6);
 for(const row of items){assertPublishable(row.draft,'seminovas');assert.equal(row.draft.is_demo,true);assert.equal(row.draft.gallery_ids.length,4);assert.equal(row.status,'published');assert.ok(row.draft.stock_code.startsWith('DEMO-'));}
 assert.equal(f.objects.size,25);
 const row=items[0];assert.equal((await f.request('/midia/'+row.draft.cover_id,{actor:null})).status,200);
 const updated=await f.call('content/'+row.id,{method:'PUT',body:{version:row.version,draft:{...row.draft,title:'Exemplo revisado pela equipe'}}});assert.equal(updated.status,200);
 await f.call('content/'+row.id+'/unpublish',{method:'POST',body:{version:updated.data.item.version}});
 await f.request('/ofertas/?aba=seminovas',{actor:null});await f.request('/ofertas/',{actor:null});
 items=(await f.call('content?kind=seminovas')).data.items;assert.equal(items.length,6);assert.equal(items.find(r=>r.id===row.id).status,'draft');assert.equal(items.find(r=>r.id===row.id).draft.title,'Exemplo revisado pela equipe');assert.equal(f.objects.size,25);
 assert.equal(f.sqlite.prepare("SELECT COUNT(*) AS n FROM cms_audit WHERE action='content.demo_seed'").get().n,6);
});

test('exemplo tem página e galeria, indica valor fictício, não anuncia oferta real e não vira pedido de compra',async()=>{
 const f=fixture({seedStockDemos:true});const row=(await f.call('content?kind=seminovas')).data.items[0];
 const html=await (await f.request(row.public_url,{actor:null})).text();
 assert.match(html,/Cadastros de demonstração|Valor fictício/);assert.match(html,/Consultar estoque real/);assert.equal((html.match(/data-stock-photo=/g)||[]).length,4);
 assert.doesNotMatch(html,/data-inventory-id|schema.org\/InStock|"@type":"Offer"/);
 const request=new Request('https://bajaj.test/api/contact',{method:'POST',headers:{Origin:'https://bajaj.test','Content-Type':'application/json'},body:JSON.stringify({name:'Teste isolado',phone:'(17) 91234-5678',unit:row.draft.unit_id,model:row.draft.offer_model,intent:'vendas',source:row.public_url,placement:'site',requested_contact:true,notice_version:NOTICE_VERSION,idempotency_key:crypto.randomUUID(),inventory_id:row.id,content_revision:row.published_at})});
 const result=await handleContact(request,f.env);assert.equal(result.status,422);assert.match((await result.json()).error,/fictício/);assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,0);
 const changed=await f.call('content/'+row.id,{method:'PUT',body:{version:row.version,draft:{...row.draft,is_demo:false}}});assert.equal(changed.status,422);
});

test('falha de imagem não publica cadastro incompleto e nova tentativa conclui sem substituir conteúdo existente',async()=>{
 const f=fixture({seedStockDemos:true}),real=await f.create({title:'Rascunho da equipe'}),assets=f.env.ASSETS;
 let calls=0;f.env.ASSETS={async fetch(request){if(++calls===2)return new Response('Temporário',{status:503});return assets.fetch(request);}};
 assert.equal((await f.request('/ofertas/?aba=seminovas',{actor:null})).status,503);
 assert.equal(f.sqlite.prepare("SELECT COUNT(*) AS n FROM cms_content WHERE created_by='authorized-stock-demo-v1'").get().n,0);
 f.env.ASSETS=assets;
 assert.equal((await f.request('/ofertas/?aba=seminovas',{actor:null})).status,200);
 assert.equal(f.sqlite.prepare("SELECT COUNT(*) AS n FROM cms_content WHERE kind='seminovas'").get().n,7);
 assert.equal(f.sqlite.prepare('SELECT draft_json FROM cms_content WHERE id=?').get(real.id).draft_json,JSON.stringify(real.draft));
});
