import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture} from './helpers/cms-fixture.mjs';
import {handleContact} from '../lib/contact-server.mjs';
import {NOTICE_VERSION} from '../lib/contact-domain.mjs';
import {serviceContext} from '../public/service-request.mjs';
import {manualMatches} from '../public/owner-pages.mjs';
import {contactDetailMarkup} from '../public/contact-admin.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(read('data.json')),resources=JSON.parse(read('owner-resources.json'));
const payload=extra=>({name:'Pessoa de Homologação',phone:'(17) 91234-5678',intent:'revisao',unit:'bauru',model:'dominar-250',model_year:'2026/2027',mileage:0,date:'2026-11-20',detail:'Consulta da revisão.',source:'/pos-venda/revisoes/',placement:'service_form',requested_contact:true,notice_version:NOTICE_VERSION,idempotency_key:crypto.randomUUID(),...extra});
async function send(f,input){const response=await handleContact(new Request('https://bajaj.test/api/contact',{method:'POST',headers:{Origin:'https://bajaj.test','Content-Type':'application/json'},body:JSON.stringify(input)}),f.env);return {status:response.status,data:await response.json()};}

test('manuais não trocam versão por ano aproximado e a nova D250 mantém seu PDF próprio',()=>{
 assert.equal(resources.manuals.length,9);assert.equal(resources.manuals.reduce((n,i)=>n+i.years.length,0),23);
 for(const m of data.models){const matching=resources.manuals.filter(i=>manualMatches(i,m.id,m.year));assert.equal(matching.length,1,m.id+' '+m.year);assert.equal(new URL(matching[0].url).hostname,'bajaj.com.br');assert.ok(matching[0].url.endsWith('.pdf'));}
 const d250=resources.manuals.filter(i=>manualMatches(i,'dominar-250','2026/2027'));assert.match(d250[0].url,/manual_nova_dominar_250\.pdf$/);assert.ok(!manualMatches(d250[0],'dominar-250','2026/2026'));
 assert.equal(resources.manuals.filter(i=>manualMatches(i,'dominar-ns160','2026/2027')).length,0);
 assert.equal(resources.manuals.filter(i=>manualMatches(i,'inventado','')).length,0);
});

test('formulários distinguem consórcio, revisão e peças antes da captação, sem presumir WhatsApp',()=>{
 for(const unit of data.units){
  const base={model:'dominar-400',unit:unit.id,date:'2026-11-20',model_year:'2026/2027',mileage:'12600',detail:'Orientação da equipe.'};
  const c=serviceContext(data,base,'consorcio');assert.equal(c.intent,'consorcio');assert.equal(c.placement,'consortium_form');assert.equal(c.date,undefined);assert.equal(c.model_year,undefined);
  const revision=serviceContext(data,{...base,intent:'revisao'},'pos-venda');assert.equal(revision.mileage,12600);assert.equal(revision.model_year,'2026/2027');assert.equal(revision.date,base.date);assert.equal(revision.unit,unit.id);
  const parts=serviceContext(data,{...base,intent:'pecas'},'pos-venda');assert.equal(parts.date,undefined);assert.equal(parts.intent,'pecas');
 }
 assert.throws(()=>serviceContext(data,{unit:'inexistente'},'consorcio'),/Escolha/);
 assert.throws(()=>serviceContext(data,{unit:'bauru',intent:'revisao',date:'2026-02-30'},'pos-venda'),/data/);
 assert.throws(()=>serviceContext(data,{unit:'bauru',intent:'revisao',model_year:'2026/2028'},'pos-venda'),/ano/);
});

test('pós-venda persiste ano, km e preferência; consórcio e serviços permanecem sem canal direto presumido',async()=>{
 const f=fixture();
 for(const unit of data.units)for(const intent of ['consorcio','revisao','manutencao','pecas','acessorios','garantia']){
  const input=payload({unit:unit.id,intent,source:intent==='consorcio'?'/consorcio/':'/pos-venda/'}),saved=await send(f,input);assert.equal(saved.status,201);assert.equal(saved.data.handoff_url,null);assert.equal(saved.data.route_status,'pending_channel');
  assert.equal((await send(f,input)).data.receipt.id,saved.data.receipt.id);
  const row=(await f.call('contacts/'+saved.data.receipt.id)).data.item;
  assert.equal(row.context.intent,intent);assert.equal(row.context.unit,unit.id);assert.equal(row.context.route_phone,null);
  if(intent==='consorcio'){assert.equal(row.context.model_year,undefined);assert.equal(row.context.mileage,undefined);}else{assert.equal(row.context.model_year,'2026/2027');assert.equal(row.context.mileage,0);assert.match(contactDetailMarkup(row),/2026\/2027/);assert.match(contactDetailMarkup(row),/0 km/);}
  assert.equal(row.context.date,['revisao','manutencao'].includes(intent)?input.date:null);
 }
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,12);
 assert.equal((await f.call('contacts',{actor:null})).status,401);
});

test('servidor recusa ano e quilometragem inválidos sem criar contato',async()=>{
 const f=fixture();
 for(const extra of [{model_year:'2026/2029'},{model_year:'2027/2026'},{model_year:'ano inventado'},{model_year:'<script>'},{mileage:-1},{mileage:1.5},{mileage:1000000},{mileage:true},{date:'2026-02-30'}])assert.equal((await send(f,payload(extra))).status,422,JSON.stringify(extra));
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,0);
});

test('áreas novas têm URLs, navegação e documentos públicos sem anunciar tabela vencida como oferta',()=>{
 const paths=['consorcio','pos-venda','pos-venda/garantia','pos-venda/manuais','pos-venda/revisoes'];
 for(const path of paths){const html=read('public/'+path+'/index.html');assert.match(html,/owner-pages\.mjs/);assert.match(html,/service-request\.mjs/);assert.match(html,/name="unit" required/);assert.match(html,/noindex,nofollow/);assert.ok(read('public/sitemap.xml').includes('/'+path+'/'));}
 const revision=read('public/pos-venda/revisoes/index.html').split('<main id="conteudo">')[1].split('</main>')[0];assert.match(revision,/31\/12\/2026/);assert.match(revision,/data-maintenance-select/);assert.equal((revision.match(/<caption>/g)||[]).length,7);assert.match(revision,/Confirmar prazo/);assert.doesNotMatch(revision,/Offer|InStock/);
 const consortium=read('public/consorcio/index.html').split('<main id="conteudo">')[1].split('</main>')[0];assert.match(consortium,/name="intent" value="consorcio"/);assert.doesNotMatch(consortium,/R\$|\d+x|sem taxa|contemplação garantida/i);
 const manuals=read('public/pos-venda/manuais/index.html');for(const item of resources.manuals)assert.ok(manuals.includes(item.url));
});
