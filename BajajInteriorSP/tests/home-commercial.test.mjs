import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {financeContext,simulationPath} from '../public/commercial-context.mjs';
import {initHero} from '../public/home-hero.mjs';

const data=JSON.parse(readFileSync(new URL('../data.json',import.meta.url)));
const copy=JSON.parse(readFileSync(new URL('../home-commercial.json',import.meta.url)));
const media=JSON.parse(readFileSync(new URL('../home-hero-media.json',import.meta.url)));
const models=data.models.map(model=>({...model,commercial:copy[model.id],media:media[model.id]}));
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('os seis caminhos de simulação recuperam modelo e unidade, incluindo preferência salva',()=>{
  for(const model of data.models)for(const unit of data.units){
    const url=new URL(simulationPath(data,model.id,unit.id),'https://example.com');
    assert.equal(url.pathname,'/financiamento/');assert.equal(url.hash,'#simulacao');
    assert.deepEqual(financeContext(data,url.search),{model:model.id,unit:unit.id});
    assert.deepEqual(financeContext(data,'?modelo='+model.id,unit.id),{model:model.id,unit:unit.id});
  }
});
test('contextos inválidos não escolhem modelo ou unidade e preservam uma preferência válida',()=>{
  assert.deepEqual(financeContext(data,'?modelo=inventado&unidade=externa'),{model:'',unit:''});
  assert.deepEqual(financeContext(data,'?modelo=inventado&unidade=externa','bauru'),{model:'',unit:'bauru'});
  assert.deepEqual(financeContext(data,'?unidade=rio-preto','bauru'),{model:'',unit:'rio-preto'});
  assert.equal(simulationPath(data,'<script>','inexistente'),'/financiamento/#simulacao');
});

class Element {
  constructor(){this.dataset={};this.events={};this.attrs={};this.classes=new Set();this.hidden=false;this.firstChild={textContent:''};this.style={};this.scrollWidth=100;this.clientWidth=100;this.paused=true;}
  addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
  dispatch(name,event={}){for(const fn of this.events[name]??[])fn(event);}
  setAttribute(name,value){this.attrs[name]=value;}
  getAttribute(name){return this.attrs[name]??null;}
  get classList(){return {add:name=>this.classes.add(name),remove:name=>this.classes.delete(name),contains:name=>this.classes.has(name)};}
  replaceChildren(){}
  getBoundingClientRect(){return {width:1440,height:900};}
}
function fixture(){
  const root=new Element(),doc=new Element(),nodes=new Map(),players=[],calls=[],pending=[];
  doc.hidden=false;doc.createElement=()=>new Element();root.ownerDocument=doc;
  root.dataset={heroInitial:'3',heroUnitIds:data.units.map(u=>u.id).join(' ')};
  root.querySelector=selector=>{if(!nodes.has(selector)){const node=new Element();node.ownerDocument=doc;nodes.set(selector,node);}return nodes.get(selector);};
  const thumbs=models.map(()=>new Element());root.querySelectorAll=()=>thumbs;
  const video=root.querySelector('[data-hero-video]'),source=new Element();
  video.querySelector=()=>source;
  Object.defineProperty(source,'src',{set:value=>source.attrs.src=value,get:()=>source.attrs.src});
  video.load=()=>calls.push('load');
  video.pause=()=>{video.paused=true;calls.push('pause');};
  video.play=()=>{video.paused=false;calls.push('play');return new Promise((resolve,reject)=>pending.push({resolve,reject}));};
  const reduce=new Element();reduce.matches=false;
  const connection=new Element();connection.saveData=false;
  const env=new Element();Object.assign(env,{matchMedia:()=>reduce,navigator:{connection},location:{origin:'https://example.com'},localStorage:{getItem:()=> 'bauru'},YT:{Player:function(_mount,options){
    const frame=new Element();const player={options,getIframe:()=>frame,mute(){},playVideo(){},pauseVideo(){},destroy(){}};players.push(player);return player;
  }}});
  initHero(root,models,env);
  return {root,doc,nodes,players,calls,pending,video,reduce,connection,env};
}
test('troca de modelo e unidade atualiza em conjunto os três CTAs e o contador',()=>{
  const f=fixture();f.nodes.get('[data-hero-next]').dispatch('click');
  assert.equal(f.nodes.get('[data-hero-name]').textContent,'Dominar 400');
  assert.equal(f.nodes.get('[data-hero-link]').href,'/motos/dominar-400/');
  assert.equal(f.nodes.get('[data-hero-contact]').dataset.model,'dominar-400');
  assert.equal(f.nodes.get('[data-hero-contact]').hidden,false);
  assert.equal(f.nodes.get('[data-hero-counter]').textContent,'05 / 06');
  assert.equal(f.nodes.get('[data-hero-benefit]').textContent,copy['dominar-400'].headline);
  let url=new URL(f.nodes.get('[data-hero-simulation]').href,'https://example.com');
  assert.deepEqual(financeContext(data,url.search),{model:'dominar-400',unit:'bauru'});
  f.doc.dispatch('interiorsp:unit-selected',{detail:{unit:'rio-preto'}});
  url=new URL(f.nodes.get('[data-hero-simulation]').href,'https://example.com');
  assert.deepEqual(financeContext(data,url.search),{model:'dominar-400',unit:'rio-preto'});
});
test('rejeição atrasada do vídeo anterior não oculta o novo vídeo em reprodução',async()=>{
  const f=fixture();const earlier=f.pending[0];f.nodes.get('[data-hero-next]').dispatch('click');await tick();
  const player=f.players[0];player.options.events.onReady({target:player});player.options.events.onStateChange({data:1});
  assert.equal(f.root.classList.contains('is-playing'),true);
  earlier.reject(Error('play interrompido pela troca de modelo'));await tick();
  assert.equal(f.root.classList.contains('is-playing'),true);
});
test('retorno à página retoma o vídeo elegível, enquanto preferências e falha mantêm a imagem de reserva',()=>{
  const f=fixture();f.env.dispatch('pagehide');assert.equal(f.video.paused,true);
  f.env.dispatch('pageshow');assert.equal(f.video.paused,false);
  f.doc.hidden=true;f.doc.dispatch('visibilitychange');assert.equal(f.video.paused,true);
  f.doc.hidden=false;f.doc.dispatch('visibilitychange');assert.equal(f.video.paused,false);
  f.connection.saveData=true;f.connection.dispatch('change');f.video.dispatch('playing');
  assert.equal(f.root.classList.contains('is-playing'),false);assert.equal(f.video.paused,true);
  f.connection.saveData=false;f.connection.dispatch('change');f.video.dispatch('error');
  assert.equal(f.root.classList.contains('is-playing'),false);
  assert.equal(f.nodes.get('[data-hero-poster]').src,media['dominar-250'].poster);
  assert.equal(f.nodes.get('[data-hero-link]').hidden,false);
});
