import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterOffers,offerContactURL,MAX_BUDGET} from '../public/offers.mjs';

const {models:catalog,units}=JSON.parse(readFileSync(new URL('../data.json',import.meta.url),'utf8'));
const models=catalog.map(m=>({...m,line:m.id.startsWith('pulsar')?'Pulsar':m.id.includes('-ns')?'Linha NS':'Linha Dominar'}));

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
