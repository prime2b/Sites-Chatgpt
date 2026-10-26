import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterOffers,offerContactURL,MAX_BUDGET} from '../dist/offers.mjs';

const html=readFileSync(new URL('../dist/ofertas/index.html',import.meta.url),'utf8');
const {models,units}=JSON.parse(html.match(/id="offers-data">(.*?)<\/script>/s)[1]);

test('linha, teto de investimento e ordenação combinam sem alterar o catálogo',()=>{
 const original=structuredClone(models);
 assert.deepEqual(filterOffers(models).map(m=>m.price),[16500,19500,22500,23800,26990,27490]);
 assert.deepEqual(filterOffers(models,{line:'Linha NS',budget:26980,order:'desc'}).map(m=>m.id),['dominar-ns200','dominar-ns160']);
 assert.deepEqual(filterOffers(models,{line:'Linha NS',budget:26990,order:'desc'}).map(m=>m.id),['dominar-ns400z','dominar-ns200','dominar-ns160']);
 assert.equal(filterOffers(models,{line:'Linha Dominar',budget:23800}).length,1);
 assert.equal(filterOffers(models,{line:'Linha Dominar',budget:23790}).length,0);
 assert.equal(filterOffers(models,{line:'Pulsar',budget:16500})[0].id,'pulsar-n150');
 assert.equal(filterOffers(models,{line:'all',budget:MAX_BUDGET}).length,6);
 assert.deepEqual(models,original);
});

test('BIA usa a unidade escolhida e a mensagem comercial exata de cada modelo',()=>{
 for(const model of models)for(const unit of units){
  const url=new URL(offerContactURL(models,units,model.id,unit.id));
  assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/'+unit.phone);
  const price=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(model.price).replace(/\u00a0/g,' ');
  assert.equal(url.searchParams.get('text'),`Olá! Quero consultar disponibilidade e condições da ${model.name} (${price}).`);
 }
 assert.throws(()=>offerContactURL(models,units,models[0].id,''),/Escolha/);
 assert.throws(()=>offerContactURL(models,units,'outro','bauru'),/Modelo/);
 assert.throws(()=>offerContactURL(models,[{id:'bauru',phone:'123'}],models[0].id,'bauru'),/Escolha/);
});

test('escada mantém cada preço na sua posição real e alterna os rótulos próximos',()=>{
 const nodes=[...html.matchAll(/class="offers-ladder-node (is-above|is-below)" href="#([^"]+)"[^>]+--offer-position:([\d.]+)%/g)];
 assert.equal(nodes.length,6);
 nodes.forEach((node,index)=>{
  const model=models.find(m=>m.id===node[2]);
  assert.equal(node[1],index%2===0?'is-above':'is-below');
  assert.ok(Math.abs(Number(node[3])-(model.price-16500)/(27490-16500)*100)<0.000001);
  assert.ok(html.includes(`id="${model.id}" data-offer-card`));
 });
});
