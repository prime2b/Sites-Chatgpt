import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initJourney, workshopLabel} from '../dist/journey.mjs';

// Minimal DOM/clock doubles test behavior only; they do not certify browser rendering.
function fixture(reducedMotion = false) {
  class Element {
    constructor(dataset = {}, attrs = {}) {
      this.dataset = dataset; this.attrs = attrs; this.events = {}; this.textContent = '';
      this.firstChild = {textContent:''}; this.hidden = false; this.value = 35;
      this.style = {setProperty:(name,value) => this.style[name] = value};
      const classes = new Set();
      this.classList = {toggle:(name,on) => on ? classes.add(name) : classes.delete(name), contains:name=>classes.has(name)};
    }
    setAttribute(name,value) { this.attrs[name] = String(value); }
    addEventListener(name,fn) { (this.events[name] ??= []).push(fn); }
    closest(selector) { return selector === '[data-journey-toggle]' ? this === toggle ? this : null : this; }
    focus() { this.focused = true; }
    dispatch(type,extras = {}) {
      const event = {target:this,preventDefault(){this.prevented=true;},...extras};
      for (const fn of this.events[type] ?? []) fn(event);
      if (this !== root && ['keydown','click','pointerdown','focusin'].includes(type)) {
        if (tabs.includes(this)) for (const fn of selectors['.j-tabs'].events[type] ?? []) fn(event);
        if (cities.includes(this)) for (const fn of selectors['.j-cities'].events[type] ?? []) fn(event);
        for (const fn of root.events[type] ?? []) fn(event);
      }
      return event;
    }
  }
  const root = new Element(), toggle = new Element();
  const tabs = Array.from({length:4}, (_,i) => new Element({journeyTab:String(i)}));
  const posts = Array.from({length:4}, (_,i) => new Element({milepost:String(i)}));
  const panels = Array.from({length:4}, (_,i) => {const x=new Element();x.hidden=i!==0;return x;});
  const cities = ['rio-preto','bauru'].map(journeyCity=>new Element({journeyCity}));
  const pins = ['rio-preto','bauru'].map(cityPin=>new Element({cityPin}));
  const serviceButtons = ['Manutenção','Revisão','Consulta de peças genuínas'].map(journeyService=>new Element({journeyService}));
  const selectors = Object.fromEntries([
    '[data-toggle-label]','[data-toggle-icon]','[data-odometer-label]','.j-tabs','.j-cities',
    '[data-chat-city]','[data-chat-bubble]','[data-local-cta]','[data-workshop-cta]',
  ].map(key=>[key,new Element()]));
  selectors['[data-journey-toggle]'] = toggle;
  selectors['[data-local-cta]'].attrs.href = '#contato';
  selectors['[data-workshop-cta]'].attrs.href = '#oficina';
  const lists = {'[data-journey-tab]':tabs,'[data-milepost]':posts,'.j-panel':panels,'[data-journey-city]':cities,'[data-city-pin]':pins,'[data-journey-service]':serviceButtons};
  root.querySelector = selector => {assert.ok(selectors[selector],selector);return selectors[selector];};
  root.querySelectorAll = selector => {assert.ok(lists[selector],selector);return lists[selector];};
  const document = new Element(); document.hidden=false;root.ownerDocument=document;
  const media = new Element();media.matches=reducedMotion;
  let time=0,id=0,callback; const timers=new Map();
  const env = {
    matchMedia:()=>media,
    setTimeout(fn,delay) {timers.set(++id,{fn,at:time+delay});return id;},
    clearTimeout(id) {timers.delete(id);},
    IntersectionObserver:class {constructor(fn,options){callback=fn;assert.deepEqual(options.threshold,[0,.08]);}observe(el){assert.equal(el,root);}},
  };
  function tick(ms) {
    const end=time+ms;
    while (true) {
      const due=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
      if (!due) break;
      time=due[1].at;timers.delete(due[0]);due[1].fn();
    }
    time=end;
  }
  initJourney(root,env);
  return {root,tabs,posts,panels,cities,pins,serviceButtons,selectors,toggle,document,media,tick,
    visible:on=>callback([{isIntersecting:on,intersectionRatio:on?.5:0}])};
}

test('só inicia ao entrar na tela, avança a cada 5s e retorna ao KM 01',()=>{
  const f=fixture();f.tick(30000);assert.equal(f.root.dataset.step,undefined);
  f.visible(true);f.tick(4999);assert.equal(f.root.dataset.step,undefined);
  f.tick(1);assert.equal(f.root.dataset.step,'1');assert.equal(f.root.style['--journey-position'],'37.5%');
  f.tick(15000);assert.equal(f.root.dataset.step,'0');
  f.visible(false);f.tick(20000);assert.equal(f.root.dataset.step,'0');
  f.visible(true);f.document.hidden=true;f.document.dispatch('visibilitychange');f.tick(10000);assert.equal(f.root.dataset.step,'0');
});
test('marco sincroniza seleção e painel e pausa até retomada explícita',()=>{
  const f=fixture();f.visible(true);f.posts[2].dispatch('click');
  assert.equal(f.root.dataset.step,'2');assert.equal(f.root.dataset.paused,'true');
  assert.deepEqual(f.panels.map(x=>x.hidden),[true,true,false,true]);
  assert.deepEqual(f.tabs.map(x=>x.attrs['aria-selected']),['false','false','true','false']);
  assert.equal(f.posts[1].classList.contains('is-passed'),true);
  assert.equal(f.selectors['[data-odometer-label]'].textContent,'Parada 03 de 04');
  f.tick(20000);f.visible(false);f.visible(true);f.tick(20000);assert.equal(f.root.dataset.step,'2');
  f.toggle.dispatch('click');assert.equal(f.root.dataset.paused,'false');f.tick(5000);assert.equal(f.root.dataset.step,'3');
});
test('setas e Home/End mantêm foco e uma única aba selecionada',()=>{
  const f=fixture();const event=f.tabs[0].dispatch('keydown',{key:'ArrowLeft'});
  assert.equal(event.prevented,true);assert.equal(f.root.dataset.step,'3');assert.equal(f.tabs[3].focused,true);
  f.tabs[3].dispatch('keydown',{key:'Home'});assert.equal(f.root.dataset.step,'0');assert.equal(f.tabs[0].tabIndex,0);
  assert.equal(f.root.dataset.paused,'true');
});
test('cidade atualiza pino, balão e CTA mantendo o destino provisório',()=>{
  const f=fixture();f.cities[1].dispatch('click');
  assert.equal(f.cities[1].attrs['aria-checked'],'true');assert.equal(f.cities[0].attrs['aria-checked'],'false');
  assert.equal(f.pins[1].classList.contains('is-selected'),true);
  assert.equal(f.selectors['[data-chat-city]'].textContent,'Bauru.');
  assert.match(f.selectors['[data-local-cta]'].firstChild.textContent,/Bauru/);
  assert.equal(f.selectors['[data-local-cta]'].attrs.href,'#contato');
  f.cities[1].dispatch('keydown',{key:'ArrowLeft'});assert.equal(f.selectors['[data-local-cta]'].dataset.city,'rio-preto');
});
test('oficina conta serviços, permite nenhum e preserva placeholder',()=>{
  const f=fixture(), link=f.selectors['[data-workshop-cta]'];
  f.serviceButtons[0].dispatch('click');assert.equal(link.firstChild.textContent,'Falar com a oficina ');
  f.serviceButtons[1].dispatch('click');f.serviceButtons[2].dispatch('click');
  assert.equal(link.firstChild.textContent,'Enviar para a oficina (2) ');
  assert.deepEqual(JSON.parse(link.dataset.services),['Revisão','Consulta de peças genuínas']);
  assert.equal(link.attrs.href,'#oficina');assert.equal(workshopLabel(3),'Enviar para a oficina (3)');
});
test('foco pausa e movimento reduzido começa sem percurso automático',()=>{
  const f=fixture(true);f.visible(true);f.tick(20000);assert.equal(f.root.dataset.paused,'true');assert.equal(f.root.dataset.motionActive,'false');
  const g=fixture();g.visible(true);g.cities[0].dispatch('focusin');g.tick(10000);assert.equal(g.root.dataset.paused,'true');
});
test('a home mantém os quatro placeholders e usa três imagens ilustrativas locais',()=>{
  const html=readFileSync(new URL('../sections/journey.html',import.meta.url),'utf8');
  assert.deepEqual([...html.matchAll(/data-journey-placeholder href="([^"]+)"/g)].map(x=>x[1]),['#contato','#test-ride','#oficina','#garantia']);
  assert.equal(/<video|https?:|@import/.test(html),false);
  assert.equal((html.match(/class="j-art j-photo-art"/g)||[]).length,3);
  assert.equal(/<figcaption>|gerada por IA/.test(html),false);
  assert.equal(/journey-throttle|j-gauge-fill|j-gear-large|j-shield-check/.test(html),false);
  assert.equal((html.match(/role="tabpanel"/g)||[]).length,4);
  assert.equal((html.match(/role="tab"/g)||[]).length,4);
});
