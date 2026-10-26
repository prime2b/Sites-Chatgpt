import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {whatsappURL,money,intents} from '../dist/core.mjs';
const data=JSON.parse(readFileSync(new URL('../data.json',import.meta.url)));
test('cada modelo e intenção segue para os dois números corretos com contexto',()=>{
 for(const unit of data.units)for(const model of data.models)for(const intent of Object.keys(intents)){
  const u=new URL(whatsappURL(data,{unit:unit.id,model:model.id,intent}));
  assert.equal(u.hostname,'wa.me');assert.equal(u.pathname,'/'+unit.phone);
  const msg=u.searchParams.get('text');assert.ok(msg.includes(model.name));assert.ok(msg.includes(money(model.price)));assert.ok(msg.includes(unit.name));assert.ok(msg.includes(intents[intent]));
 }
});
test('simulação preserva entrada e prazo, sem cálculo ou confirmação',()=>{
 const url=new URL(whatsappURL(data,{unit:'bauru',model:'dominar-400',intent:'simulacao',entry:money(8000),term:'36'}));
 const msg=url.searchParams.get('text');assert.match(msg,/Entrada desejada: R\$\s8\.000,00/);assert.match(msg,/Prazo desejado: 36 meses/);assert.match(msg,/27\.490,00/);assert.doesNotMatch(msg,/aprovad|confirmad|parcela de/i);
});
test('entrada e prazo omitidos não geram dados inventados',()=>{
 const msg=new URL(whatsappURL(data,{unit:'rio-preto',model:'pulsar-n150',intent:'simulacao'})).searchParams.get('text');assert.doesNotMatch(msg,/Entrada desejada|Prazo desejado/);
});
test('unidade é obrigatória e jamais adivinhada',()=>{assert.throws(()=>whatsappURL(data,{model:'dominar-400'}));assert.throws(()=>whatsappURL(data,{unit:'outra'}));});
test('preços e unidades correspondem exatamente ao briefing',()=>{
 assert.deepEqual(data.models.map(m=>m.price),[16500,19500,22500,23800,27490,26990]);assert.deepEqual(data.units.map(u=>u.phone),['5517992606039','5514996448094']);assert.equal(data.units.length,2);
});
