import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/cms-fixture.mjs';
import {handleContact} from '../lib/contact-server.mjs';
import {NOTICE_VERSION,INTENT_LABELS,knownRoute,normalizePhone} from '../lib/contact-domain.mjs';
import {models,units} from '../lib/blog-catalog.mjs';
import {createContactSubmission,contactEvent,submissionId} from '../public/contact-capture.mjs';
import {contactsMarkup,contactDetailMarkup} from '../public/contact-admin.mjs';
const payload=extra=>({name:'Pessoa de Homologação',phone:'(17) 91234-5678',unit:'rio-preto',model:'dominar-400',intent:'vendas',source:'/motos/dominar-400/',placement:'product',requested_contact:true,notice_version:NOTICE_VERSION,idempotency_key:crypto.randomUUID(),...extra});
const send=async(f,data,path='/api/contact',extra={})=>{const response=await handleContact(new Request('https://bajaj.test'+path,{method:'POST',headers:{Origin:'https://bajaj.test','Content-Type':'application/json',...extra},body:JSON.stringify(data)}),f.env);return {status:response.status,data:await response.json()};};
const count=f=>f.sqlite.prepare('SELECT COUNT(*) AS n FROM contacts').get().n;
test('contato persiste e pode ser consultado sem enviar mensagem; público não consulta os dados',async()=>{
 const f=fixture(),input=payload(),saved=await send(f,input);assert.equal(saved.status,201);assert.equal(saved.data.saved,true);assert.equal(count(f),1);
 const row=(await f.call('contacts')).data.items[0];assert.equal(row.name,input.name);assert.equal(row.phone,'5517912345678');assert.equal(row.context.source,input.source);assert.equal(row.handoff_attempted_at,null);assert.equal(row.status,'new');
 assert.equal((await f.call('contacts',{actor:null})).status,401);
 const publicResponse=await handleContact(new Request('https://bajaj.test/api/contact/'+row.id),f.env);assert.equal(publicResponse.status,405);assert.doesNotMatch(await publicResponse.text(),/Pessoa|91234/);
 assert.equal(saved.data.name,undefined);assert.equal(saved.data.phone,undefined);assert.match(saved.data.handoff_url,/^https:\/\/wa.me\/5517992606039/);
});
test('mesma chave é idempotente inclusive em concorrência e não permite trocar os dados já recebidos',async()=>{
 const f=fixture(),input=payload();const [a,b]=await Promise.all([send(f,input),send(f,input)]);assert.equal(a.data.receipt.id,b.data.receipt.id);assert.equal(a.data.receipt.token,b.data.receipt.token);assert.equal(count(f),1);
 assert.equal((await send(f,{...input,phone:'(14) 91234-5678'})).status,409);assert.equal(count(f),1);
 const third=await send(f,input);assert.equal(third.status,200);assert.equal(third.data.receipt.id,a.data.receipt.id);
});
test('falha de confirmação após gravar permite recuperar o mesmo registro no reenvio',async()=>{
 const f=fixture(),original=f.env.DB.prepare;let reads=0;
 f.env.DB.prepare=sql=>{const statement=original(sql);return {...statement,bind(...values){const bound=statement.bind(...values);if(sql==='SELECT * FROM contacts WHERE idempotency_key=?'){const first=bound.first;bound.first=async()=>{if(++reads===2)throw Error('Falha simulada após persistência');return first();};}return bound;}};};
 const input=payload(),failed=await send(f,input);assert.equal(failed.status,503);assert.equal(failed.data.saved,false);assert.equal(count(f),1);
 const retry=await send(f,input);assert.equal(retry.status,200);assert.equal(count(f),1);assert.ok(retry.data.receipt.id);
});
test('validação rejeita dados inválidos, injeção, honeypot, origem externa e alterações do aviso',async()=>{
 const f=fixture();for(const changes of [{name:'A'},{name:'<script>alert(1)</script>'},{phone:'12345'},{phone:'(17) 99999-9999'},{unit:'outra'},{model:'moto-inventada'},{intent:'__proto__'},{intent:'constructor'},{requested_contact:false},{notice_version:'old'},{idempotency_key:'123'},{source:'https://evil.test/'},{website:'spam'},{intent:'simulacao',entry:-1},{intent:'simulacao',entry:80000},{intent:'simulacao',term:1.5},{intent:'test',date:'2026-02-30'},{detail:'x'.repeat(501)}])assert.equal((await send(f,payload(changes))).status,changes.idempotency_key?400:422,JSON.stringify(changes));
 assert.equal((await send(f,payload(),'/api/contact',{Origin:'https://evil.test'})).status,403);assert.equal(count(f),0);
 assert.equal(normalizePhone('+55 (14) 91234-5678'),'5514912345678');
});
test('os seis modelos e as duas unidades preservam preços, entrada e prazo; canais não confirmados não usam vendas',async()=>{
 const f=fixture();for(const unit of units)for(const model of models)for(const intent of Object.keys(INTENT_LABELS)){
  const saved=await send(f,payload({unit:unit.id,model:model.id,intent,entry:0,term:36,date:'2026-12-10',detail:'Pedido de homologação'}));assert.equal(saved.status,201);
  const row=f.sqlite.prepare('SELECT * FROM contacts WHERE id=?').get(saved.data.receipt.id),context=JSON.parse(row.context_json);assert.equal(context.model_name,model.name);assert.equal(context.catalog_price,model.price);assert.equal(context.unit_name,unit.name);
  if(knownRoute(intent)){const url=new URL(saved.data.handoff_url);assert.equal(url.pathname,'/'+unit.phone);const message=url.searchParams.get('text');assert.ok(message.includes(model.name));if(intent==='simulacao'){assert.match(message,/Entrada desejada: R\$\s0,00/);assert.match(message,/Prazo desejado: 36 meses/);}else assert.doesNotMatch(message,/Entrada desejada|Prazo desejado/);if(intent==='test')assert.match(message,/10\/12\/2026/);}
  else{assert.equal(saved.data.handoff_url,null);assert.equal(context.route_status,'pending_channel');}
 }
});
test('falhas do destino persistente não anunciam sucesso nem revelam erro de banco',async()=>{
 const f=fixture();f.env.DB.prepare=()=>{throw Error('SQL com informação privada');};const result=await send(f,payload());assert.equal(result.status,503);assert.equal(result.data.saved,false);assert.doesNotMatch(JSON.stringify(result),/SQL|privada/);
});
test('antiabuso limita novas solicitações sem bloquear o reenvio idempotente',async()=>{
 const f=fixture(),ip={'CF-Connecting-IP':'192.0.2.1'},first=payload();assert.equal((await send(f,first,'/api/contact',ip)).status,201);
 for(let i=1;i<15;i++)assert.equal((await send(f,payload(),'/api/contact',ip)).status,201);
 assert.equal((await send(f,payload(),'/api/contact',ip)).status,429);assert.equal((await send(f,first,'/api/contact',ip)).status,200);assert.equal(count(f),15);
 const keys=f.sqlite.prepare("SELECT key FROM cms_auth_limits WHERE key LIKE 'contact:%'").all();assert.ok(keys.every(r=>!r.key.includes('192.0.2.1')));
});
test('tentativa de abertura exige recibo secreto e não confirma conversa ou muda o acompanhamento',async()=>{
 const f=fixture(),saved=await send(f,payload()),receipt=saved.data.receipt;
 assert.equal((await send(f,{...receipt,token:'0'.repeat(64)},'/api/contact/handoff')).status,404);
 assert.equal(f.sqlite.prepare('SELECT handoff_attempted_at FROM contacts WHERE id=?').get(receipt.id).handoff_attempted_at,null);
 assert.equal((await send(f,receipt,'/api/contact/handoff')).status,200);
 const row=(await f.call('contacts/'+receipt.id)).data.item;assert.ok(row.handoff_attempted_at);assert.equal(row.status,'new');assert.equal(row.receipt_hash,undefined);assert.equal(row.request_hash,undefined);assert.equal(row.idempotency_key,undefined);
});
test('contatos têm permissão independente, filtros e atualização concorrente protegida',async()=>{
 const f=fixture();await f.call('users',{method:'POST',body:{name:'Pessoa editora',email:'editor@example.test',role:'editor',can_contacts:false,active:true}});
 const a=await send(f,payload()),b=await send(f,payload({unit:'bauru',intent:'pecas'}));assert.equal((await f.call('contacts',{actor:'editor'})).status,403);assert.equal((await f.call('contacts/'+a.data.receipt.id,{actor:'editor'})).status,403);
 const page=await f.call('contacts?unit=bauru&intent=pecas&status=new');assert.equal(page.data.items.length,1);assert.equal(page.data.items[0].id,b.data.receipt.id);
 const changed=await f.call('contacts/'+a.data.receipt.id,{method:'PUT',body:{version:1,status:'in_progress'}});assert.equal(changed.status,200);assert.equal(changed.data.item.version,2);
 assert.equal((await f.call('contacts/'+a.data.receipt.id,{method:'PUT',body:{version:1,status:'completed'}})).status,409);
 assert.equal((await f.call('contacts/'+a.data.receipt.id,{method:'PUT',body:{version:2,status:'constructor'}})).status,422);
 assert.equal((await f.call('contacts/'+a.data.receipt.id,{method:'PUT',body:{version:2,status:'completed'},origin:'https://evil.test'})).status,403);
 assert.equal((await f.call('backup')).data.contacts,undefined);
});
test('campanhas precisam estar publicadas e vigentes e o exemplar fica identificado no contato',async()=>{
 const f=fixture(),draft={title:'Campanha de homologação',summary:'Condições usadas apenas no teste local.',body:'Texto de homologação para testar o contexto do pedido com dados de catálogo.',cover_id:f.mediaId,cover_alt:'Imagem aprovada de teste',unit_ids:['rio-preto'],commercial_options:[{title:'Alternativa de teste',details:'Condições exclusivas deste teste isolado.',price:26000}],offer_model:'dominar-400',starts_at:'2026-01-01T00:00:00Z',valid_until:'2030-01-01T00:00:00Z'};
 const offer=(await f.call('content',{method:'POST',body:{kind:'ofertas',draft}})).data.item;
 assert.equal((await send(f,payload({campaign_id:offer.id}))).status,409);
 const published=(await f.call('content/'+offer.id+'/publish',{method:'POST',body:{version:offer.version}})).data.item;
 const saved=await send(f,payload({campaign_id:offer.id,campaign_option:'1',content_revision:published.published_at}));assert.equal(saved.status,201);const row=(await f.call('contacts/'+saved.data.receipt.id)).data.item;assert.equal(row.context.campaign_title,draft.title);
 assert.equal((await send(f,payload({campaign_id:offer.id,model:'pulsar-n150'}))).status,409);
 for(const dates of [{starts_at:'2099-01-01T00:00:00Z',valid_until:'2099-12-01T00:00:00Z'},{starts_at:'2000-01-01T00:00:00Z',valid_until:'2000-12-01T00:00:00Z'}]){f.sqlite.prepare('UPDATE cms_content SET published_json=? WHERE id=?').run(JSON.stringify({...draft,...dates}),offer.id);assert.equal((await send(f,payload({campaign_id:offer.id}))).status,409);}
 const record=await f.create();await f.call('content/'+record.id+'/publish',{method:'POST',body:{version:1}});
 const stock=await send(f,payload({inventory_id:record.id,content_revision:(await f.call('content/'+record.id)).data.item.published_at}));assert.equal(stock.status,201);assert.equal((await f.call('contacts/'+stock.data.receipt.id)).data.item.context.inventory_id,record.id);
 await f.call('content/'+record.id+'/unpublish',{method:'POST',body:{version:2}});assert.equal((await send(f,payload({inventory_id:record.id}))).status,409);
});
test('fila de contatos pagina sem expor recibos e mantém filtros de unidade e situação',async()=>{
 const f=fixture(),context={unit:'bauru',unit_name:'Bauru',intent:'vendas',intent_label:'Vendas',route_status:'ready'};
 const insert=f.sqlite.prepare('INSERT INTO contacts(id,name,phone,context_json,status,idempotency_key,created_at) VALUES(?,?,?,?,?,?,?)');for(let i=0;i<53;i++)insert.run('contact-'+String(i).padStart(3,'0'),'Pessoa Teste','5514912345678',JSON.stringify(context),'new','key-'+i,'2026-10-30T18:00:00Z');
 const a=(await f.call('contacts?unit=bauru&status=new')).data,b=(await f.call('contacts?unit=bauru&status=new&offset=50')).data;assert.equal(a.items.length,50);assert.equal(a.has_more,true);assert.equal(b.items.length,3);assert.equal(b.has_more,false);assert.equal(new Set([...a.items,...b.items].map(i=>i.id)).size,53);assert.equal((await f.call('contacts?unit=rio-preto')).data.items.length,0);assert.equal(a.items[0].receipt_hash,undefined);
});
test('formulário reutiliza chave após queda de rede e só libera resultado com confirmação válida',async()=>{
 const calls=[],queue=[];const env={crypto,fetch:async(url,options)=>{calls.push(JSON.parse(options.body));return queue.shift()();}};
 const client=createContactSubmission(env),input=payload();delete input.idempotency_key;
 queue.push(()=>{throw new TypeError('Network failure');});await assert.rejects(client.send(input),/Sem confirmação/);
 const result={saved:true,receipt:{id:crypto.randomUUID(),token:'a'.repeat(64)},handoff_url:'https://wa.me/5517992606039?text=Teste'};
 queue.push(()=>new Response(JSON.stringify(result)));assert.deepEqual(await client.send(input),result);assert.equal(calls[0].idempotency_key,calls[1].idempotency_key);
 await client.send(input);assert.equal(calls.length,2);client.reset();queue.push(()=>new Response(JSON.stringify(result)));await client.send(input);assert.notEqual(calls[2].idempotency_key,calls[1].idempotency_key);
});
test('duplo envio aguarda a mesma confirmação e resposta de erro não vira recibo',async()=>{
 let resolve,countCalls=0;const env={crypto,fetch:()=>{countCalls++;return new Promise(done=>resolve=done);}};
 const client=createContactSubmission(env),input=payload(),a=client.send(input),b=client.send(input);assert.equal(countCalls,1);
 resolve(new Response(JSON.stringify({saved:false,error:'Não foi salvo'}),{status:503}));await assert.rejects(a,/Não foi salvo/);await assert.rejects(b,/Não foi salvo/);
});
test('eventos excluem campos pessoais e o painel escapa as informações apresentadas',()=>{
 const env={},context={intent:'vendas',unit:'bauru',model:'dominar-400',placement:'product',name:'Pessoa',phone:'5517912345678',detail:'Descrição',entry:8000,term:36};contactEvent(env,'contact_saved',context);assert.deepEqual(env.dataLayer,[{event:'contact_saved',intent:'vendas',unit:'bauru',model:'dominar-400',placement:'product'}]);
 const item={id:'test',name:'<script>nome</script>',phone:'5517912345678',status:'new',created_at:'2026-10-30T12:00:00Z',version:1,context:{unit_name:'Bauru',intent_label:'Vendas',detail:'<img src=x onerror=alert(1)>',source:'/',route_status:'ready'}};
 const detail=contactDetailMarkup(item),list=contactsMarkup({items:[item],statuses:{new:'Novo'},units:[],intents:{},offset:0,has_more:false});assert.doesNotMatch(detail+list,/<script>|<img src=x/);assert.match(detail,/&lt;img/);
});
test('chave de reenvio permanece aleatória quando randomUUID não está disponível na prévia HTTP',()=>{
 const api={getRandomValues:crypto.getRandomValues.bind(crypto)},a=submissionId(api),b=submissionId(api);assert.match(a,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);assert.notEqual(a,b);assert.throws(()=>submissionId({}),/navegador/);
});
