import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {simulationURL,entryValues} from '../dist/dominar-400.mjs';
import {requestURL} from '../dist/service-request.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(read('data.json')),settings=JSON.parse(read('model-settings.json'));
const configFor=model=>JSON.parse(read(`dist/motos/${model.id}/index.html`).match(/id="d4-data">(.*?)<\/script>/s)[1]);
test('os seis produtos têm conteúdo, schema, preço, modelo e unidades próprios',()=>{
 for(const m of data.models){
  const html=read(`dist/motos/${m.id}/index.html`),cfg=configFor(m);
  assert.match(html,new RegExp(`<h1><span>${m.name}</span></h1>`));assert.equal(cfg.model,m.id);assert.equal(cfg.name,m.name);assert.equal(cfg.price,m.price);assert.deepEqual(cfg.units,data.units);
  const graph=JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];const product=graph.find(x=>x['@type']==='Product');
  assert.equal(product.name,'Bajaj '+m.name);assert.equal(product.model,m.year);assert.equal(Number(product.offers.price),m.price);assert.equal(new URL(product.offers.url).pathname,`/motos/${m.id}/`);
  assert.ok(html.includes(`canonical" href="https://bajajinteriorsp.com.br/motos/${m.id}/"`));
  for(const u of data.units){assert.ok(html.includes(u.maps));assert.ok(html.includes(u.address));assert.ok(html.includes(u.cnpj));}
  assert.equal((html.match(/class="d4-gallery-card"/g)||[]).length,6);assert.equal((html.match(/data-d4-spec="/g)||[]).length,5);
  assert.ok(html.includes(`id="gallery-title">${m.name} em detalhes`));assert.equal(/data-d4-watch=""|link pendente/.test(html),false);
 }
});
test('simulação dos seis modelos preserva mensagem, preço e extremos para as duas unidades',()=>{
 for(const m of data.models)for(const u of data.units)for(const entry of [0,configFor(m).initialEntry,m.price])for(const term of [12,24,36,48]){
  const cfg=configFor(m);assert.ok(entryValues(m.price).includes(entry));const url=new URL(simulationURL(cfg,u.id,entry,term));assert.equal(url.pathname,'/'+u.phone);
  const msg=url.searchParams.get('text');assert.ok(msg.includes(m.name));assert.ok(msg.includes(`Prazo: ${term} meses.`));assert.ok(msg.includes(u.short));assert.equal(/aprovad|agendado|enviado|CPF/.test(msg),false);
 }
});
test('versões e características não são herdadas da D400 nem misturadas às atualizações nacionais',()=>{
 const by=id=>data.models.find(x=>x.id===id),motor=id=>Object.fromEntries(by(id).specs.Motor);
 assert.equal(by('pulsar-n150').year,'2026/2026');assert.equal(by('dominar-250').year,'2026/2027');assert.equal(by('dominar-ns200').year,'2026/2026');
 assert.equal(motor('dominar-ns200')['Torque máximo'],'1,896 kgf.m @ 8.000 rpm');assert.match(motor('dominar-ns200').Tipo,/refrigerado a líquido/);
 assert.equal(settings['pulsar-n150'].modes.length,0);assert.equal(settings['dominar-ns160'].modes.length,0);assert.equal(settings['dominar-ns200'].modes.length,0);assert.equal(settings['dominar-250'].modes.length,3);assert.equal(settings['dominar-ns400z'].modes.length,4);
 const n=read('dist/motos/pulsar-n150/index.html');assert.ok(n.includes('Na roda dianteira'));assert.ok(n.includes('A tambor / Ø130 mm'));
 for(const m of data.models.filter(x=>x.id!=='dominar-400')){
  const html=read(`dist/motos/${m.id}/index.html`);const body=html.match(/<main id="conteudo">(.*?)<\/main>/s)[1];assert.equal(/d4-(?:right|left|front|panel|headlight)-/.test(body),false);
  const d400=JSON.parse(read('d400-settings.json'));for(const id of [d400.heroYoutube,new URL(d400.youtubeUrl).searchParams.get('v')])assert.equal(body.includes(id),false);
  for(const g of settings[m.id].gallery){const manifest=JSON.parse(read('model-assets.json'))[g.asset];for(const v of Object.values(manifest))assert.ok(existsSync(new URL('../dist/assets/'+v.file,import.meta.url)));}
 }
});
test('navegação e mapa de URLs incluem modelos e páginas funcionais',()=>{
 const home=read('dist/index.html');const sitemap=read('dist/sitemap.xml');
 for(const m of data.models){assert.ok(home.includes(`href="/motos/${m.id}/"`));assert.ok(sitemap.includes(`/motos/${m.id}/`));}
 for(const path of ['ofertas','financiamento','test-ride','pos-venda','unidades','a-interiorsp']){const html=read(`dist/${path}/index.html`);assert.ok(html.includes('noindex,nofollow'));assert.ok(sitemap.includes(`/${path}/`));}
 assert.equal(/if\(m.id!=='dominar-400'\)/.test(read('dist/app.mjs')),false);
});
test('test ride e pós-venda preparam intenção explícita, sem confirmar envio ou agendamento',()=>{
 for(const kind of ['test-ride','pos-venda'])for(const u of data.units)for(const m of data.models){
  const url=new URL(requestURL(data,{kind,model:m.id,unit:u.id,intent:'pecas',date:'2026-11-05',detail:'Quero confirmar a disponibilidade.'}));
  assert.equal(url.pathname,'/'+u.phone);const text=url.searchParams.get('text');assert.ok(text.includes(m.name));assert.ok(text.includes(u.name));assert.ok(text.includes('Quero confirmar a disponibilidade.'));
  assert.ok(text.includes(kind==='test-ride'?'Data de preferência: 05/11/2026':'peças genuínas'));assert.equal(/agendado|pedido enviado|aprovação confirmada/i.test(text),false);
 }
 assert.throws(()=>requestURL(data,{kind:'test-ride',unit:''}),/Escolha/);assert.throws(()=>requestURL(data,{kind:'test-ride',unit:'bauru',model:'inventado'}),/modelo/);
 const direct=new URL(requestURL(data,{kind:'pos-venda',unit:'bauru',intent:'garantia'}));assert.ok(direct.searchParams.get('text').includes('garantia'));assert.equal(direct.searchParams.get('text').includes('Data de preferência'),false);
});
