import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {wrapFrame,frameForColor,loadSequence,initSpin} from '../public/product-spin.mjs';

function fixture(){
  class Element{
    constructor(){this.events={};this.attrs={};this.dataset={};this.hidden=false;this.value='0';}
    addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
    setAttribute(name,value){this.attrs[name]=String(value);}
    dispatch(type,extra={}){const event={preventDefault(){},...extra};for(const fn of this.events[type]??[])fn(event);}
    getBoundingClientRect(){return {width:600};}
  }
  const selectors=['stage','image','prev','next','range','activate','status','angle','controls'];
  const elements=Object.fromEntries(selectors.map(key=>[`[data-spin-${key}]`,new Element()]));
  const buttons=[new Element(),new Element()];const root=new Element();
  root.querySelector=selector=>elements[selector];root.querySelectorAll=()=>buttons;
  const waiting=[];
  class Image{
    set src(src){this._src=src;waiting.push({src,image:this});}
    get src(){return this._src;}
  }
  const config={name:'Dominar',colors:[
    {label:'Preta',frames:['black0','black1','black2','black3'],width:1000,height:700},
    {label:'Branca',frames:['white0','white1','white2'],width:1000,height:700},
  ]};
  const viewer=initSpin(root,config,{Image,setTimeout,clearTimeout});
  const flush=async(prefix,fail=false)=>{
    const requests=waiting.filter(item=>item.src.startsWith(prefix));
    for(const {image} of requests){if(fail)image.onerror?.();else image.onload?.();}
    await Promise.resolve();await Promise.resolve();await Promise.resolve();
  };
  return {viewer,elements,buttons,root,waiting,flush};
}

test('o giro fecha o ciclo em ambas as direções e preserva o ângulo ao trocar sequências de tamanhos diferentes',()=>{
  assert.equal(wrapFrame(-1,16),15);assert.equal(wrapFrame(16,16),0);
  assert.equal(frameForColor(8,16,15),8);assert.equal(frameForColor(15,16,16),15);
});

test('carregamento mantém ordem e limita o número de imagens simultâneas',async()=>{
  let active=0,peak=0;
  const actual=await loadSequence(Array.from({length:20},(_,i)=>i),async value=>{
    active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,1));active--;return value*2;
  },{concurrency:3});
  assert.equal(peak,3);assert.deepEqual(actual,Array.from({length:20},(_,i)=>i*2));
});

test('falha em qualquer quadro impede aceitar uma sequência parcial',async()=>{
  await assert.rejects(loadSequence(['ok','missing'],async src=>{
    if(src==='missing')throw new Error('404');return src;
  }),/404/);
});

test('não baixa o giro antes da interação; teclas, toque horizontal e barra selecionam quadros completos',async()=>{
  const f=fixture();assert.equal(f.waiting.length,0);assert.equal(f.elements['[data-spin-range]'].disabled,true);
  const loading=f.viewer.selectColor(0);await f.flush('black');assert.equal(await loading,true);
  const stage=f.elements['[data-spin-stage]'];stage.dispatch('keydown',{key:'ArrowLeft'});
  assert.equal(f.viewer.getState().frame,3);
  stage.dispatch('pointerdown',{pointerId:1,clientX:400,clientY:200,button:0});
  stage.dispatch('pointermove',{pointerId:1,clientX:100,clientY:202});
  assert.equal(f.viewer.getState().frame,1);
  f.elements['[data-spin-range]'].value='2';f.elements['[data-spin-range]'].dispatch('input');
  assert.equal(f.elements['[data-spin-image]'].src,'black2');
});

test('uma cor com imagem quebrada mantém a moto anterior e permite tentar novamente',async()=>{
  const f=fixture();let loading=f.viewer.selectColor(0);await f.flush('black');await loading;
  f.viewer.step(1);loading=f.viewer.selectColor(1);await f.flush('white',true);
  assert.equal(await loading,false);assert.equal(f.elements['[data-spin-image]'].src,'black1');
  assert.equal(f.buttons[0].attrs['aria-pressed'],'true');assert.equal(f.viewer.getState().loading,false);
  assert.equal(f.elements['[data-spin-activate]'].hidden,false);
  assert.match(f.elements['[data-spin-status]'].textContent,/imagem anterior/);
});

test('a última cor escolhida vence cargas atrasadas sem duplicar requisições da mesma cor',async()=>{
  const f=fixture();const first=f.viewer.selectColor(0),same=f.viewer.selectColor(0),last=f.viewer.selectColor(1);
  assert.equal(f.waiting.filter(x=>x.src.startsWith('black')).length,4);
  await f.flush('white');assert.equal(await last,true);
  await f.flush('black');await Promise.all([first,same]);
  assert.equal(f.viewer.getState().colorIndex,1);assert.equal(f.elements['[data-spin-image]'].src,'white0');
});

test('as seis páginas usam material local próprio, preservam o catálogo e mostram recursos antes da galeria',()=>{
  const catalog=JSON.parse(readFileSync(new URL('../data.json',import.meta.url)));
  const manifest=JSON.parse(readFileSync(new URL('../product-360.json',import.meta.url)));
  for(const model of catalog.models){
    const page=readFileSync(new URL(`../public/motos/${model.id}/index.html`,import.meta.url),'utf8');
    const cfg=JSON.parse(page.match(/data-spin-config>(.*?)<\/script>/s)[1]);
    assert.deepEqual(cfg,manifest[model.id]);assert.equal(cfg.name,model.name);
    assert.ok(page.indexOf('id="recursos"')<page.indexOf('id="visualizador-360"'));
    assert.ok(page.indexOf('id="visualizador-360"')<page.indexOf('id="galeria"'));
    assert.ok(page.includes('src="/product-spin.mjs"'));assert.ok(page.includes('<noscript>'));
    for(const color of cfg.colors){
      assert.ok(color.static?color.frames.length===1:color.frames.length>=15&&color.frames.length<=16);
      for(const src of color.frames){assert.ok(color.static?src.startsWith(`/assets/${model.id}-`):src.startsWith(`/assets/spin/${model.id}/`));assert.ok(existsSync(new URL('../public'+src,import.meta.url)));}
    }
  }
  assert.equal(manifest['pulsar-n125'],undefined);
  assert.deepEqual(manifest['dominar-400'].colors.map(c=>c.label),['Charcoal Black','Canyon Red','Savanna Green','Indigo Blue','Pearl Metallic White']);
  assert.deepEqual(manifest['dominar-250'].colors.map(c=>c.label),['Sparkling Black','Racing Red']);
});
