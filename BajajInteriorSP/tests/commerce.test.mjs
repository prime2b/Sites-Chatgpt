import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/cms-fixture.mjs';
import {validateCommerceDraft,saoPauloInstant,saoPauloLocal,commerceState,refreshAfter} from '../lib/commerce-domain.mjs';
import {handleBlog,publishedArticles} from '../lib/blog-server.mjs';
import {articleOffers} from '../lib/blog-view.mjs';
import {handleContact} from '../lib/contact-server.mjs';
import {NOTICE_VERSION} from '../lib/contact-domain.mjs';
import {createFreshness,initCommerce} from '../public/commerce.mjs';
import {commerceEditorMarkup} from '../public/commerce-admin.mjs';
import {models,units} from '../lib/blog-catalog.mjs';

const createCampaign=async(f,extra={})=>(await f.call('content',{method:'POST',body:{kind:'ofertas',draft:{title:'Campanha de teste isolado',summary:'Material de homologação, sem publicação real.',body:'Condições comerciais aprovadas apenas para o ambiente de teste isolado.',cover_id:f.mediaId,cover_alt:'Arte de homologação isolada',offer_model:'dominar-400',unit_ids:['rio-preto'],starts_at:'2020-01-01T03:00:00.000Z',valid_until:'2099-01-01T03:00:00.000Z',commercial_options:[{id:'1',title:'Opção A de teste',details:'Detalhes aprovados da primeira alternativa.',price:25000},{id:'3',title:'Opção C de teste',details:'Outra alternativa exclusiva, sem somar benefícios.',price:26000}],...extra}}})).data.item;
const publish=async(f,row)=>(await f.call('content/'+row.id+'/publish',{method:'POST',body:{version:row.version}})).data.item;
const change=async(f,row,action,extra={})=>f.call('content/'+row.id+'/'+action,{method:'POST',body:{version:row.version,...extra}});
const raw=(f,id)=>f.sqlite.prepare('SELECT * FROM cms_content WHERE id=?').get(id);
const send=async(f,extra={})=>{
 const data={name:'Pessoa de homologação',phone:'(17) 91234-5678',unit:'rio-preto',model:'dominar-400',intent:'vendas',source:'/ofertas/',placement:'commercial',requested_contact:true,notice_version:NOTICE_VERSION,idempotency_key:crypto.randomUUID(),...extra};
 const r=await handleContact(new Request('https://bajaj.test/api/contact',{method:'POST',headers:{Origin:'https://bajaj.test','Content-Type':'application/json'},body:JSON.stringify(data)}),f.env);return {status:r.status,data:await r.json(),input:data};
};

test('horário comercial usa São Paulo, valida calendário e mantém IDs das três alternativas',()=>{
 assert.equal(saoPauloInstant('2026-10-30T09:30'),'2026-10-30T12:30:00.000Z');
 assert.equal(saoPauloLocal('2026-10-30T12:30:00.000Z'),'2026-10-30T09:30');
 for(const value of ['2026-02-30T09:30','2026-10-30T25:00','2026-10-30','2026-10-30T09:30-03:00'])assert.throws(()=>saoPauloInstant(value));
 const d=validateCommerceDraft({starts_at_local:'2026-10-30T09:30',valid_until_local:'2026-11-02T18:00',commercial_options:[{id:'1',title:'',details:'',price:''},{id:'3',title:'Alternativa',details:'Regras aprovadas.',price:'12345.67'}]},'ofertas');
 assert.equal(d.starts_at,'2026-10-30T12:30:00.000Z');assert.deepEqual(d.commercial_options.map(o=>o.id),['3']);
 assert.equal(validateCommerceDraft(d,'ofertas').commercial_options[0].id,'3');
 assert.throws(()=>validateCommerceDraft({commercial_options:Array(4).fill({title:'teste'})},'ofertas'));
 assert.throws(()=>validateCommerceDraft({commercial_options:[{id:'1',title:'primeira'},{id:'1',title:'preenchida'}]},'ofertas'));
 assert.throws(()=>validateCommerceDraft({price:'-1'},'seminovas'));
 assert.throws(()=>validateCommerceDraft({unit_ids:['inventada']},'ofertas'));
});

test('Ofertas combina catálogo 0 km com campanhas dinâmicas, separado da aba Seminovas',async()=>{
 const f=fixture();
 for(const path of ['/ofertas/','/ofertas/?aba=seminovas','/ofertas/?modelo=dominar-400&unidade=bauru']){
  const r=await f.request(path,{actor:null});assert.equal(r.status,200);assert.match(r.headers.get('Cache-Control'),/no-store/);
  const html=await r.text();assert.match(html,/Ofertas 0 km/);assert.match(html,/Seminovas/);assert.match(html,/Não há (?:campanhas|seminovas) publicadas/);if(path.includes('aba=seminovas'))assert.doesNotMatch(html,/data-offer-card|R\$/);else{assert.equal((html.match(/data-offer-card=/g)||[]).length,6);assert.match(html,/offers-ladder/);}
 }
 const alias=await f.request('/seminovas/',{actor:null});assert.equal(alias.status,302);assert.equal(alias.headers.get('Location'),'/ofertas/?aba=seminovas');
 assert.equal((await f.request('/ofertas/',{actor:null,method:'HEAD'})).body,null);
});

test('cadastros incompletos ficam privados e recusam publicação sem imagens e condições reais',async()=>{
 const f=fixture();const c=await createCampaign(f,{cover_id:null});
 assert.equal((await change(f,c,'publish')).status,422);assert.equal((await f.request(c.public_url,{actor:null})).status,404);
 const privatePreview=await f.request(c.preview_url);assert.equal(privatePreview.status,200);assert.match(await privatePreview.text(),/Prévia privada/);
 const noOptions=await createCampaign(f,{title:'Sem condições',commercial_options:[]});assert.equal((await change(f,noOptions,'publish')).status,422);
 const s=await f.create({photos_reviewed:false});assert.equal((await change(f,s,'publish')).status,422);
 const wrong=await f.create({title:'Fotos faltantes',stock_code:'TEST-WRONG',gallery_ids:[]});assert.equal((await change(f,wrong,'publish')).status,422);
 const unauth=await f.request('/admin/commerce-preview/ofertas/',{actor:null});assert.doesNotMatch(await unauth.text(),/Campanha de teste isolado/);
});

test('campanha programa, inicia e vence por tempo do servidor e falha fechada em dados antigos',async()=>{
 const f=fixture();const c=await publish(f,await createCampaign(f));assert.ok(c);
 const row=raw(f,c.id),d=JSON.parse(row.published_json),start=Date.parse(d.starts_at),end=Date.parse(d.valid_until);
 assert.equal(commerceState(row,start-1),'scheduled');assert.equal(commerceState(row,start),'active');assert.equal(commerceState(row,end),'expired');
 assert.equal(refreshAfter([row],end-2200),2200);assert.equal(refreshAfter([row],end),60000);
 for(const patch of [{starts_at:'inválida'},{valid_until:null},{commerce_version:undefined}])assert.equal(commerceState({...row,published_json:JSON.stringify({...d,...patch})}),'incomplete');
 f.sqlite.prepare('UPDATE cms_content SET published_json=? WHERE id=?').run(JSON.stringify({...d,starts_at:'2000-01-01T00:00:00.000Z',valid_until:'2000-01-02T00:00:00.000Z'}),c.id);
 const expired=await f.request(c.public_url,{actor:null});assert.equal(expired.status,410);assert.doesNotMatch(await expired.text(),/Opção A de teste|25\.000|Arte de homologação/);
 assert.equal((await f.request('/midia/'+f.mediaId,{actor:null})).status,404);
});

test('pausar, retomar e encerrar atualizam detalhes, lista, mídias e vínculos do Blog',async()=>{
 const f=fixture();let c=await publish(f,await createCampaign(f));
 assert.equal((await f.request(c.public_url,{actor:null})).status,200);
 const publishedHtml=await (await f.request(c.public_url,{actor:null})).text();assert.match(publishedHtml,/não são cumulativas/);assert.equal((publishedHtml.match(/name="campaign-option"/g)||[]).length,2);assert.match(publishedHtml,/value="3"/);
 c=(await change(f,c,'pause')).data.item;assert.equal(c.commerce_state,'paused');assert.equal((await f.request(c.public_url,{actor:null})).status,404);
 assert.equal(articleOffers({banner_offer:'campaign:'+c.id},[raw(f,c.id)]).banner_html,'');
 c=(await change(f,c,'resume')).data.item;assert.equal(c.commerce_state,'active');assert.ok(articleOffers({banner_offer:'campaign:'+c.id},[raw(f,c.id)]).banner_html.includes(c.public_url));
 c=(await change(f,c,'end')).data.item;assert.equal(c.commerce_state,'ended');assert.equal((await f.request(c.public_url,{actor:null})).status,410);assert.equal((await change(f,c,'resume')).status,422);
 const history=(await f.call('content/'+c.id+'/revisions')).data.items;assert.ok(history.some(r=>r.action==='content.pause'));assert.ok(history.some(r=>r.action==='content.end'));
});

test('banner tem rascunho separado, preview privado e só aparece com campanha ativa',async()=>{
 const f=fixture();let c=await createCampaign(f);
 assert.equal((await f.call('commerce-page/publish',{method:'POST',body:{version:0}})).status,422);
 const draft={campaign_id:c.id,desktop_id:f.mediaId,mobile_id:f.mediaId,alt:'Banner de homologação isolado'};
 let result=await f.call('commerce-page',{method:'PUT',body:{version:0,draft}});assert.equal(result.status,200);let item=result.data.item;
 assert.doesNotMatch(await (await f.request('/ofertas/',{actor:null})).text(),/Banner de homologação isolado/);
 assert.match(await (await f.request('/admin/commerce-preview/ofertas/')).text(),/Banner de homologação isolado/);
 item=(await f.call('commerce-page/publish',{method:'POST',body:{version:item.version}})).data.item;
 assert.doesNotMatch(await (await f.request('/ofertas/',{actor:null})).text(),/Banner de homologação isolado/);
 c=await publish(f,c);assert.match(await (await f.request('/ofertas/',{actor:null})).text(),/Banner de homologação isolado/);
 const before=(await f.call('audit')).data.items.length;
 assert.equal((await f.call('commerce-page',{method:'PUT',body:{version:1,draft:{...draft,alt:'Não salvar'}}})).status,409);
 assert.equal((await f.call('audit')).data.items.length,before);
 c=(await change(f,c,'pause')).data.item;assert.doesNotMatch(await (await f.request('/ofertas/',{actor:null})).text(),/Banner de homologação isolado/);
 assert.equal((await f.call('commerce-page',{actor:null})).status,401);
 const backup=(await f.call('backup')).data;assert.equal(backup.version,2);assert.equal(backup.commerce_page.length,1);
});

test('código do exemplar é único, fotos precisam existir e endereço fica preservado',async()=>{
 const f=fixture();let s=await f.create();
 const duplicate=await f.call('content',{method:'POST',body:{kind:'seminovas',draft:{...s.draft,title:'Código duplicado'}}});assert.equal(duplicate.status,409);assert.match(duplicate.data.error,/código/i);
 s=await publish(f,s);assert.ok(s);
 assert.equal((await f.call('content/'+s.id,{method:'PUT',body:{version:s.version,slug:'outro-link',draft:s.draft}})).status,422);
 assert.equal((await f.call('content/'+s.id,{method:'PUT',body:{version:s.version,draft:{...s.draft,stock_code:'OUTRO'}}})).status,422);
 const html=await (await f.request(s.public_url,{actor:null})).text();assert.match(html,/data-stock-gallery/);assert.match(html,/data-stock-zoom/);assert.match(html,/24\.000/);assert.match(html,/'?sku"?:"TEST-1/);assert.doesNotMatch(html,/27\.490/);
 const missing=await f.create({title:'Arquivo faltante',stock_code:'OUTRA',gallery_ids:[f.mediaId]});f.objects.clear();assert.equal((await change(f,missing,'publish')).status,422);
});

test('reserva sinaliza o anúncio e venda retira da lista com aviso no link antigo',async()=>{
 const f=fixture();let s=await publish(f,await f.create());
 s=(await change(f,s,'availability',{availability:'reserved'})).data.item;assert.equal(s.commerce_state,'reserved');
 const reserved=await (await f.request(s.public_url,{actor:null})).text();assert.match(reserved,/Exemplar reservado/);assert.doesNotMatch(reserved,/data-inventory-id|InStock/);
 assert.match(await (await f.request('/ofertas/?aba=seminovas',{actor:null})).text(),/Reservada/);
 s=(await change(f,s,'availability',{availability:'sold'})).data.item;
 const tombstone=await f.request(s.public_url,{actor:null});assert.equal(tombstone.status,410);assert.match(await tombstone.text(),/Este exemplar foi vendido/);
 const detail=(await f.request('/api/commerce/detail/seminovas/'+s.slug,{actor:null}));assert.equal((await detail.json()).active,false);
 assert.doesNotMatch(await (await f.request('/ofertas/?aba=seminovas',{actor:null})).text(),/Artigo de homologação|24\.000/);
 assert.equal((await f.request('/midia/'+f.mediaId,{actor:null})).status,404);
});

test('editor não reativa venda por disponibilidade, rascunho, retirada ou restauração',async()=>{
 const f=fixture();await f.call('users',{method:'POST',body:{name:'Pessoa editora',email:'editor@example.test',role:'editor',active:true}});
 let s=await publish(f,await f.create());const initial=(await f.call('content/'+s.id+'/revisions')).data.items.at(-1);
 s=(await change(f,s,'availability',{availability:'sold'})).data.item;
 assert.equal((await f.call('content/'+s.id+'/availability',{actor:'editor',method:'POST',body:{version:s.version,availability:'available'}})).status,403);
 s=(await f.call('content/'+s.id+'/restore',{actor:'editor',method:'POST',body:{version:s.version,revision_id:initial.id}})).data.item;assert.equal(s.draft.availability,'sold');
 s=(await f.call('content/'+s.id+'/unpublish',{actor:'editor',method:'POST',body:{version:s.version}})).data.item;
 assert.equal((await f.call('content/'+s.id,{actor:'editor',method:'PUT',body:{version:s.version,draft:{...s.draft,availability:'available'}}})).status,422);
 s=(await f.call('content/'+s.id+'/publish',{actor:'editor',method:'POST',body:{version:s.version}})).data.item;assert.equal(s.commerce_state,'sold');
 s=(await change(f,s,'availability',{availability:'available'})).data.item;assert.equal(s.commerce_state,'available');
});

test('lista filtra estoque por modelo/unidade, ordena preço e pagina sem misturar catálogo',async()=>{
 const f=fixture();
 for(let i=0;i<14;i++)await publish(f,await f.create({title:'Seminova de teste '+String(i).padStart(2,'0'),price:10000+i*100,unit_id:i===13?'bauru':'rio-preto',offer_model:i===12?'pulsar-n150':'dominar-400'}));
 let data=await (await f.request('/api/commerce/fragment?aba=seminovas&ordem=price_desc',{actor:null})).json();assert.equal((data.html.match(/<article class="commerce-card/g)||[]).length,12);assert.ok(data.html.indexOf('Seminova de teste 13')<data.html.indexOf('Seminova de teste 11'));assert.match(data.html,/Próximas/);
 data=await (await f.request('/api/commerce/fragment?aba=seminovas&unidade=bauru',{actor:null})).json();assert.equal((data.html.match(/<article class="commerce-card/g)||[]).length,1);assert.match(data.html,/Seminova de teste 13/);
 data=await (await f.request('/api/commerce/fragment?aba=seminovas&modelo=pulsar-n150',{actor:null})).json();assert.match(data.html,/Seminova de teste 12/);assert.doesNotMatch(data.html,/Seminova de teste 13/);
 for(const [title,offer_price] of [['Sem preço declarado',null],['Preço menor',23000],['Preço maior',26000]])await publish(f,await createCampaign(f,{title,offer_price}));
 data=await (await f.request('/api/commerce/fragment?ordem=price_desc',{actor:null})).json();assert.ok(data.html.indexOf('Preço maior')<data.html.indexOf('Preço menor'));assert.ok(data.html.indexOf('Preço menor')<data.html.indexOf('Sem preço declarado'));
});

test('contato preserva só a condição escolhida e rejeita versão, unidade ou opção desatualizada',async()=>{
 const f=fixture();let c=await publish(f,await createCampaign(f));
 const saved=await send(f,{campaign_id:c.id,campaign_option:'3',content_revision:c.published_at,campaign_price:1});assert.equal(saved.status,201);
 const context=(await f.call('contacts/'+saved.data.receipt.id)).data.item.context;assert.equal(context.campaign_option_id,'3');assert.equal(context.campaign_price,26000);assert.equal(context.campaign_option_title,'Opção C de teste');assert.equal(context.catalog_price,27490);
 const message=new URL(saved.data.handoff_url).searchParams.get('text');assert.match(message,/26\.000/);assert.doesNotMatch(message,/Opção A de teste/);
 assert.equal((await send(f,{campaign_id:c.id,campaign_option:'3'})).status,409);
 assert.equal((await send(f,{campaign_id:c.id,campaign_option:'2',content_revision:c.published_at})).status,422);
 assert.equal((await send(f,{campaign_id:c.id,campaign_option:'3',content_revision:c.published_at,unit:'bauru'})).status,422);
 // A private save does not invalidate a customer's current, still-published condition.
 c=(await f.call('content/'+c.id,{method:'PUT',body:{version:c.version,draft:{...c.draft,title:'Rascunho separado'}}})).data.item;
 assert.equal((await send(f,{campaign_id:c.id,campaign_option:'1',content_revision:c.published_at})).status,201);
 const oldStamp=c.published_at;c=await publish(f,c);assert.notEqual(c.published_at,oldStamp);
 assert.equal((await send(f,{campaign_id:c.id,campaign_option:'1',content_revision:oldStamp})).status,409);
 assert.equal((await send(f,saved.input)).status,200);
});

test('contato de seminova usa seu preço/código e disponibilidade é conferida na gravação',async()=>{
 const f=fixture();let s=await publish(f,await f.create({price:23123,stock_code:'RP-UNICO'}));
 const saved=await send(f,{inventory_id:s.id,content_revision:s.published_at,inventory_price:1});assert.equal(saved.status,201);
 const context=(await f.call('contacts/'+saved.data.receipt.id)).data.item.context;assert.equal(context.inventory_price,23123);assert.equal(context.inventory_code,'RP-UNICO');assert.match(new URL(saved.data.handoff_url).searchParams.get('text'),/RP-UNICO/);
 const original=f.env.DB.prepare;
 f.env.DB.prepare=sql=>{if(sql.startsWith('INSERT OR IGNORE INTO contacts'))f.sqlite.prepare("UPDATE cms_content SET published_json=json_set(published_json,'$.availability','sold') WHERE id=?").run(s.id);return original(sql);};
 const raced=await send(f,{inventory_id:s.id,content_revision:s.published_at});assert.equal(raced.status,409);assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,1);
});

test('Blog atualiza somente relações comerciais e não retorna campanhas vencidas, pausadas ou futuras',async()=>{
 const f=fixture();let c=await publish(f,await createCampaign(f));const [a]=await publishedArticles(f.env),d=JSON.parse(a.published_json);
 f.sqlite.prepare('UPDATE cms_content SET published_json=? WHERE id=?').run(JSON.stringify({...d,banner_offer:'campaign:'+c.id,related_offers:['campaign:'+c.id,'catalog:pulsar-n150']}),a.id);
 const endpoint='/api/blog/offers/'+a.slug;
 const load=async()=>{const r=await handleBlog(new Request('https://bajaj.test'+endpoint),f.env);assert.match(r.headers.get('Cache-Control'),/no-store/);return r.json();};
 let data=await load();assert.match(data.banner_html,new RegExp(c.public_url));assert.match(data.related_html,/Pulsar N150/);assert.ok(data.refresh_after_ms<=60000);
 c=(await change(f,c,'pause')).data.item;data=await load();assert.equal(data.banner_html,'');assert.doesNotMatch(data.related_html,/Campanha de teste isolado/);assert.match(data.related_html,/Pulsar N150/);
 const article=await handleBlog(new Request('https://bajaj.test/blog/'+a.slug+'/'),f.env);assert.match(await article.text(),/data-blog-offers/);
});

test('campos comerciais escapam HTML no site e no painel e nunca renderizam código incorporado',async()=>{
 const f=fixture(),title='Moto <script>alert(1)</script>';let s=await publish(f,await f.create({title,color:'<img src=x onerror=alert(1)>'}));
 const html=await (await f.request(s.public_url,{actor:null})).text();assert.doesNotMatch(html,/<script>alert|<img src=x/);assert.match(html,/&lt;script&gt;/);
 const editor=commerceEditorMarkup(s,{media:[],models,units,user:{role:'admin'}});assert.doesNotMatch(editor,/<script>alert|<img src=x/);assert.match(editor,/&lt;script&gt;/);
});

function clock(){let now=0,id=0;const timers=new Map();return {timers,performance:{now:()=>now},advance(ms){now+=ms;},setTimeout(fn,delay){timers.set(++id,{fn,delay});return id;},clearTimeout(key){timers.delete(key);}};}
function initialPage(refresh,elapsed=0){
 const env=clock();env.advance(elapsed);let requests=0;
 env.fetch=()=>{requests++;return new Promise(()=>{});};env.addEventListener=()=>{};
 const live={hidden:false,inert:false,style:{},querySelector:()=>null,querySelectorAll:()=>[]};
 const doc={querySelector:()=>null,addEventListener:()=>{},createElement:()=>({hidden:true,classList:{add(){},remove(){}},setAttribute(){}})};
 const root={ownerDocument:doc,dataset:{commerceRefresh:refresh,commerceEndpoint:'/api/commerce/fragment'},querySelector:()=>live,prepend(){},setAttribute(){},removeAttribute(){}};
 return {env,root,live,requests:()=>requests};
}
test('abertura preserva campanhas confirmadas pelo servidor até vencer a validade restante',()=>{
 const page=initialPage('60000',1250),controller=initCommerce(page.root,page.env);
 assert.equal(page.requests(),0);assert.equal(page.live.hidden,false);assert.equal(page.live.style.visibility,undefined);
 const timer=[...page.env.timers.values()][0];assert.equal(timer.delay,58750);
 timer.fn();assert.equal(page.requests(),1);assert.equal(page.live.style.visibility,'hidden');assert.equal(page.live.inert,true);controller.stop();
});
test('HTML sem validade restante exige confirmação imediata na abertura',()=>{
 for(const refresh of ['1000','inválido',undefined]){
  const page=initialPage(refresh,1500),controller=initCommerce(page.root,page.env);
  assert.equal(page.requests(),1);assert.equal(page.live.style.visibility,'hidden');controller.stop();
 }
});
test('atualização comercial oculta conteúdo antes de consultar e desconta tempo de rede sem relógio civil',async()=>{
 const env=clock(),events=[];const c=createFreshness({env,stale:()=>events.push('stale'),apply:()=>events.push('apply'),failed:()=>events.push('failed'),load:async()=>{env.advance(350);return {refresh_after_ms:1000};}});
 await c.refresh();assert.deepEqual(events,['stale','apply']);assert.equal([...env.timers.values()][0].delay,650);c.stop();assert.equal(env.timers.size,0);
});
test('resposta atrasada, erro e suspensão não reapresentam campanha sem confirmação',async()=>{
 const env=clock(),pending=[],events=[];const c=createFreshness({env,stale:()=>events.push('stale'),apply:d=>events.push(d.id),failed:()=>events.push('failed'),load:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))});
 const first=c.refresh(),second=c.refresh();pending[1].resolve({id:'atual',refresh_after_ms:1000});await second;pending[0].resolve({id:'antiga',refresh_after_ms:1000});await first;assert.deepEqual(events,['stale','stale','atual']);
 const error=c.refresh();pending[2].reject(Error('rede'));await error;assert.equal(events.at(-1),'failed');
 const stopped=c.refresh();c.stop();pending[3].resolve({id:'suspensa',refresh_after_ms:1000});await stopped;assert.ok(!events.includes('suspensa'));
 const expired=c.resume();env.advance(1100);pending[4].resolve({id:'vencida-em-transito',refresh_after_ms:1000});await expired;assert.ok(!events.includes('vencida-em-transito'));assert.equal([...env.timers.values()][0].delay,100);
});
