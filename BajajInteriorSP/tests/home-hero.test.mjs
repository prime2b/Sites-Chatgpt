import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {heroSlide,swipeDirection,filmAllowed} from '../public/home-hero.mjs';
const data=JSON.parse(readFileSync(new URL('../data.json',import.meta.url)));
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const models=JSON.parse(html.match(/<script type="application\/json" id="hero-model-data">(.*?)<\/script>/s)[1]);

test('seis slides usam somente nomes, descrições e imagens dos dados centralizados',()=>{
 assert.equal(models.length,6);
 models.forEach((m,i)=>{
  const original=data.models.find(x=>x.id===m.id);assert.ok(original);
  assert.equal(m.name,original.name);assert.equal(m.tag,original.tag);assert.equal(m.catalogDescription,original.catalogDescription);assert.equal(m.catalogImage,original.catalogImage);
  assert.ok(existsSync(new URL('../public/assets/'+heroSlide(models,i).model.catalogImage,import.meta.url)));
 });
});
test('volta circular permite anterior no primeiro e próximo no último',()=>{
 assert.equal(heroSlide(models,-1).position,5);assert.equal(heroSlide(models,6).position,0);assert.equal(heroSlide(models,14).position,2);
});
test('os seis modelos têm vídeo próprio e página de produto',()=>{
 assert.deepEqual(models.filter((m,i)=>heroSlide(models,i).film).map(x=>x.id),data.models.map(x=>x.id));
 assert.equal(new Set(models.map(m=>m.media.youtube||m.media.src)).size,6);
 for(const m of models)assert.ok(existsSync(new URL('../public'+m.media.poster,import.meta.url)));
 assert.deepEqual(models.filter((m,i)=>heroSlide(models,i).page).map(x=>x.id),data.models.map(x=>x.id));
 assert.equal(heroSlide(models,3).model.id,'dominar-250');
});
test('swipe horizontal muda o slide sem capturar arrasto vertical nem pequenos toques',()=>{
 assert.equal(swipeDirection(-80,20),1);assert.equal(swipeDirection(80,20),-1);
 assert.equal(swipeDirection(20,80),0);assert.equal(swipeDirection(25,0),0);assert.equal(swipeDirection(80,100),0);
});
test('vídeo exige slide correspondente visível, página ativa e permissão de movimento/dados',()=>{
 const state={film:true,visible:true,hidden:false,reduced:false,saveData:false,failed:false};
 assert.equal(filmAllowed(state),true);
 for(const [key,value] of Object.entries({film:false,visible:false,hidden:true,reduced:true,saveData:true,failed:true})) assert.equal(filmAllowed({...state,[key]:value}),false,key);
});
test('miniaturas e controles reais mantêm seleção inicial e navegação identificada',()=>{
 const section=html.match(/<section class="showroom-hero".*?<\/section>/s)[0];
 assert.equal((section.match(/class="showroom-model"/g)||[]).length,6);
 assert.equal((section.match(/aria-pressed="true"/g)||[]).length,1);
 assert.match(section,/data-hero-index="0" aria-pressed="true"/);
 assert.match(section,/data-hero-previous aria-label="Mostrar modelo anterior"/);
 assert.match(section,/data-hero-next aria-label="Mostrar próximo modelo"/);
 assert.match(section,/data-contact="vendas" data-model="pulsar-n150"/);
 assert.match(section,/data-hero-link href="\/motos\/pulsar-n150\/"/);
 assert.match(section,/data-hero-announcement aria-live="polite"/);
 assert.equal(section.includes('data-background-film'),false);
});
