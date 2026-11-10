import {money} from './core.mjs';
import {backgroundYouTube,initDetailVideo} from './dominar-youtube.mjs';
import {requestContact,contactEvent} from './contact-capture.mjs';
export function entryValues(price) {
  const values=[];for(let n=0;n<price;n+=500) values.push(n);values.push(price);return values;
}
export function entryState(price,index) {
  const values=entryValues(price),position=Math.max(0,Math.min(values.length-1,Math.round(index)));
  return {position,entry:values[position],balance:price-values[position],percent:values[position]/price*100};
}
export function simulationURL(config,unitId,entry,term) {
  const unit=config.units.find(u=>u.id===unitId);
  if(!unit)throw new Error('Escolha Rio Preto ou Bauru.');
  if(!entryValues(config.price).includes(entry)||![12,24,36,48].includes(term))throw new Error('Confira entrada e prazo.');
  const message=`Olá! Quero simular a ${config.name} (${money(config.price)}). Entrada: ${money(entry)}. Prazo: ${term} meses. Unidade: ${unit.short}.`;
  return `https://wa.me/${unit.phone}?text=${encodeURIComponent(message)}`;
}
export function initDominar(root,config,env=window) {
  const doc=root.ownerDocument,q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
  const reduce=env.matchMedia('(prefers-reduced-motion:reduce)');
  const hero=q('[data-d4-hero]'),video=q('[data-d4-video]'),toggle=q('[data-d4-motion]');
  const storageKey='interiorsp.unit.v1';let city='',term=config.initialTerm,motion=!reduce.matches,heroVisible=false,failed=false;
  try {const saved=env.localStorage.getItem(storageKey);if(config.units.some(u=>u.id===saved))city=saved;}catch{}
  const input=q('#d4-entry'),values=entryValues(config.price);input.max=String(values.length-1);input.value=String(values.indexOf(config.initialEntry));
  let youtube=null;
  if(config.heroYoutube)youtube=backgroundYouTube({env,hero,videoId:config.heroYoutube,title:config.name,onPlaying:()=>hero.classList.add('d4-has-video'),onError:()=>hero.classList.remove('d4-has-video')});
  function syncMotion() {
    const play=motion&&heroVisible&&!doc.hidden&&!reduce.matches;
    hero.dataset.motionActive=String(play);
    const hasSource=!!(config.heroVideo||config.heroYoutube)&&!failed;
    toggle.textContent=hasSource?(motion?'Pausar vídeo':'Reproduzir vídeo'):(motion?'Pausar efeitos':'Reproduzir efeitos');
    toggle.setAttribute('aria-pressed',String(!motion));
    const eligible=play&&!env.navigator.connection?.saveData;
    youtube?.update(eligible);
    if(config.heroYoutube&&!eligible)hero.classList.remove('d4-has-video');
    if(config.heroVideo&&hasSource&&eligible) {
      if(!video.src){video.src=config.heroVideo;video.autoplay=true;video.hidden=false;video.muted=true;video.load();}
      video.play().catch(()=>hero.classList.remove('d4-has-video'));
    }else video.pause();
  }
  toggle.addEventListener('click',()=>{motion=!motion;syncMotion();});
  video.addEventListener('playing',()=>hero.classList.add('d4-has-video'));
  video.addEventListener('error',()=>{failed=true;video.hidden=true;hero.classList.remove('d4-has-video');syncMotion();});
  doc.addEventListener('visibilitychange',syncMotion);
  env.navigator.connection?.addEventListener?.('change',syncMotion);
  reduce.addEventListener('change',()=>{if(reduce.matches){motion=false;root.classList.remove('d4-motion');qa('.d4-reveal').forEach(x=>x.classList.add('is-visible'));q('[data-d4-summary]').classList.add('is-counted');}syncMotion();});
  if(!reduce.matches)root.classList.add('d4-motion');
  if('IntersectionObserver' in env) {
    new env.IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncMotion();},{threshold:.05}).observe(hero);
    const reveal=new env.IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}}),{threshold:.1});
    qa('.d4-reveal').forEach(x=>reveal.observe(x));
    const summary=q('[data-d4-summary]'),counter=new env.IntersectionObserver(entries=>{if(entries[0].isIntersecting){summary.classList.add('is-counted');counter.disconnect();}},{threshold:.25});counter.observe(summary);
  }else {heroVisible=true;qa('.d4-reveal').forEach(x=>x.classList.add('is-visible'));q('[data-d4-summary]').classList.add('is-counted');}
  syncMotion();
  hero.addEventListener('pointermove',event=>{
    if(reduce.matches||!motion||event.pointerType==='touch')return;
    const rect=hero.getBoundingClientRect(),x=Math.max(25,Math.min(75,(event.clientX-rect.left)/rect.width*100));
    hero.style.setProperty('--d4-light-x',`${x}%`);
  });
  function radioGroup(selector,attribute,onSelect) {
    const group=q(selector),buttons=[...group.querySelectorAll('[role=radio]')];
    function apply(button,notify=true){buttons.forEach(x=>{const yes=x===button;x.setAttribute('aria-checked',String(yes));x.tabIndex=yes?0:-1;});if(notify)onSelect(button.dataset[attribute]);}
    buttons.forEach(button=>button.addEventListener('click',()=>apply(button)));
    group.addEventListener('keydown',event=>{
      const i=buttons.indexOf(event.target);if(i<0)return;
      const next=['ArrowRight','ArrowDown'].includes(event.key)?(i+1)%buttons.length:['ArrowLeft','ArrowUp'].includes(event.key)?(i+buttons.length-1)%buttons.length:event.key==='Home'?0:event.key==='End'?buttons.length-1:null;
      if(next===null)return;event.preventDefault();apply(buttons[next]);buttons[next].focus({preventScroll:true});
    });
    return value=>{const button=buttons.find(b=>b.dataset[attribute]===String(value));if(button)apply(button,false);};
  }
  if(config.modes.length)radioGroup('.d4-modes','d4Mode',mode=>{q('[data-d4-mode-copy]').textContent=config.modes.find(x=>x.id===mode).description;});
  radioGroup('.d4-terms','d4Term',value=>{term=Number(value);q('[data-d4-fallback]').hidden=true;});
  function selectCity(id,persist=true) {
    city=config.units.some(u=>u.id===id)?id:'';
    if(city){renderCity(city);q('[data-d4-error]').hidden=true;}
    else qa('[data-d4-city]').forEach((button,i)=>{button.setAttribute('aria-checked','false');button.tabIndex=i===0?0:-1;});
    q('[data-d4-fallback]').hidden=true;
    if(persist&&city){try{env.localStorage.setItem(storageKey,city);}catch{}doc.dispatchEvent(new env.CustomEvent('interiorsp:unit-change',{detail:{unit:city}}));}
  }
  const renderCity=radioGroup('.d4-cities','d4City',id=>selectCity(id));
  doc.addEventListener('interiorsp:unit-selected',event=>selectCity(event.detail.unit,false));
  selectCity(city,false);
  function renderEntry(){
    const state=entryState(config.price,Number(input.value));input.value=String(state.position);input.setAttribute('aria-valuetext',money(state.entry));
    q('[data-d4-entry-value]').textContent=money(state.entry);q('[data-d4-entry-label]').textContent=money(state.entry);q('[data-d4-balance]').textContent=money(state.balance);
    q('.d4-finance-bar').style.setProperty('--entry-percent',`${state.percent}%`);q('[data-d4-fallback]').hidden=true;
  }
  input.addEventListener('input',renderEntry);renderEntry();
  q('#d4-finance').addEventListener('submit',event=>{
    event.preventDefault();if(!city){q('[data-d4-error]').hidden=false;qa('[data-d4-city]')[0].focus();return;}
    const {entry}=entryState(config.price,Number(input.value)),context={intent:'simulacao',unit:city,model:config.model,entry,term,placement:'product_finance',trigger:q('#d4-finance [type=submit]')};
    contactEvent(env,'contact_cta_click',context);requestContact(context,env);
  });
  qa('[data-d4-unit-link]').forEach(link=>link.addEventListener('click',()=>selectCity(link.dataset.d4UnitLink)));
  const tabs=qa('[data-d4-spec]'),panels=qa('.d4-spec-panels>[role=tabpanel]');
  function spec(index){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});}
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>spec(i)));
  q('.d4-spec-tabs').addEventListener('keydown',event=>{
    const i=tabs.indexOf(event.target);if(i<0)return;const next=event.key==='ArrowRight'?(i+1)%tabs.length:event.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
    if(next===null)return;event.preventDefault();spec(next);tabs[next].focus({preventScroll:true});
  });
  const lightbox=doc.getElementById('gallery-dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('role','dialog');
}
if(typeof document!=='undefined'){
 const root=document.querySelector('.d4-page');if(root){initDominar(root,JSON.parse(document.getElementById('d4-data').textContent));initDetailVideo(root);}
}
