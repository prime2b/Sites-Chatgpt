import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../public/app.mjs',import.meta.url),'utf8');
const helper=source.slice(source.indexOf(' function keepModelDetailsVisible(){'),source.indexOf(' function showModel(index,animate=true){'));
function check({rect,viewport=900,header=144,reduced=false,title={top:0,bottom:30}}){
 const calls=[];const context={q:selector=>selector==='.slider-details'?{getBoundingClientRect:()=>rect}:{getBoundingClientRect:()=>title,scrollIntoView:options=>calls.push({kind:'title',...options})},$:()=>({getBoundingClientRect:()=>({bottom:header})}),window:{innerHeight:viewport,scrollBy:options=>calls.push({kind:'scroll',...options})},matchMedia:()=>({matches:reduced})};
 vm.runInNewContext(helper+';keepModelDetailsVisible()',context);return calls;
}
test('restaura dados que ficaram acima do cabeçalho ao trocar a moto',()=>{const calls=check({rect:{top:-120,bottom:280,height:400}});assert.equal(calls.length,1);assert.equal(calls[0].top,-280);assert.equal(calls[0].behavior,'smooth');});
test('expõe a parte inferior do painel sem salto desnecessário',()=>{const calls=check({rect:{top:600,bottom:960,height:360}});assert.equal(calls[0].top,76);});
test('não desloca a página quando os dados já estão visíveis',()=>{assert.equal(check({rect:{top:180,bottom:580,height:400}}).length,0);});
test('respeita movimento reduzido e preserva acesso ao nome em telas curtas',()=>{assert.equal(check({rect:{top:100,bottom:500,height:400},reduced:true})[0].behavior,'instant');assert.equal(check({rect:{top:-200,bottom:1000,height:1200},title:{top:-200,bottom:-170}})[0].kind,'title');});
