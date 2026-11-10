import {money} from './core.mjs';
import {financeContext,simulationPath} from './commercial-context.mjs';
import {initContactCapture,requestContact,contactEvent} from './contact-capture.mjs';
const data=await fetch('/data.json').then(r=>{if(!r.ok)throw Error('Dados indisponíveis');return r.json()});
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const storageKey='interiorsp.unit.v1';let selectedUnit='';try{const stored=localStorage.getItem(storageKey);if(data.units.some(u=>u.id===stored))selectedUnit=stored;}catch{}
const initialFinance=financeContext(data,window.location.search,selectedUnit);
if($('#finance-form'))selectedUnit=initialFinance.unit;
const modelContext=document.body.dataset.model||'';
function track(event,extra={}){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...extra});}
function applyUnit(id,record=true){
 selectedUnit=data.units.some(x=>x.id===id)?id:'';try{if(selectedUnit)localStorage.setItem(storageKey,selectedUnit);else localStorage.removeItem(storageKey);}catch{}
 const unit=data.units.find(x=>x.id===selectedUnit);$$('[data-unit-label]').forEach(e=>e.textContent=unit?unit.short:'Escolha sua unidade');
 const select=$('#finance-unit');if(select)select.value=selectedUnit;
 $$('[data-simulate-model]').forEach(link=>link.href=simulationPath(data,link.dataset.simulateModel,selectedUnit));
 if(record&&unit)track('unit_selected',{unit:unit.id});
 document.dispatchEvent(new CustomEvent('interiorsp:unit-selected',{detail:{unit:selectedUnit}}));
}
applyUnit(selectedUnit,false);
document.addEventListener('interiorsp:unit-change',event=>{if(data.units.some(u=>u.id===event.detail?.unit))applyUnit(event.detail.unit);});
// Menus work through clicks, pointer hover and the standard keyboard button behavior.
const headerResize=new ResizeObserver(entries=>{for(const entry of entries)document.documentElement.style.setProperty('--header-height',`${entry.target.offsetHeight}px`)});headerResize.observe($('.site-header'));
const nav=$('#navigation'),menuToggle=$('.menu-toggle'),backdrop=$('.nav-backdrop');let panel='',hoverTimer;
function closePanel(restore=false){
 const trigger=$(`[data-panel="${panel}"]`);$$('.nav-panel').forEach(e=>e.hidden=true);$$('.nav-trigger').forEach(e=>e.setAttribute('aria-expanded','false'));panel='';backdrop.hidden=!nav.classList.contains('open');if(restore)trigger?.focus();
}
function closeNavigation(){closePanel();nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menu');backdrop.hidden=true;}
function openPanel(id,focusFirst=false){closePanel();panel=id;const trigger=$(`[data-panel="${id}"]`);trigger.setAttribute('aria-expanded','true');$(`#panel-${id}`).hidden=false;backdrop.hidden=false;if(focusFirst)$(`#panel-${id}`).querySelector('a,button:not(.panel-close)')?.focus();}
$$('.nav-trigger').forEach(t=>{
 t.addEventListener('click',()=>{clearTimeout(hoverTimer);if(panel===t.dataset.panel)closePanel();else openPanel(t.dataset.panel,true)});
 t.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openPanel(t.dataset.panel,true);}});
 t.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover) and (min-width:1101px)').matches){clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>openPanel(t.dataset.panel),140)}});
});
$('.site-header').addEventListener('pointerleave',()=>{if(matchMedia('(hover:hover) and (min-width:1101px)').matches)hoverTimer=setTimeout(()=>closePanel(),250)});
$('.site-header').addEventListener('pointerenter',()=>clearTimeout(hoverTimer));
$$('.panel-close').forEach(b=>b.addEventListener('click',()=>closePanel(true)));
menuToggle.addEventListener('click',()=>{if(nav.classList.contains('open')||panel)closeNavigation();else{nav.classList.add('open');menuToggle.setAttribute('aria-expanded','true');menuToggle.setAttribute('aria-label','Fechar menu');backdrop.hidden=false;}});
backdrop.addEventListener('click',closeNavigation);
nav.addEventListener('focusin',()=>{if(panel)closePanel();});
$('.site-header').addEventListener('focusout',()=>setTimeout(()=>{if(!$('.site-header').contains(document.activeElement))closeNavigation()},0));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('dialog[open]')){if(panel)closePanel(true);else if(nav.classList.contains('open')){closeNavigation();menuToggle.focus();}}});
$$('.site-header a').forEach(a=>a.addEventListener('click',closeNavigation));
matchMedia('(min-width:1101px)').addEventListener('change',closeNavigation);
// Explicit local branch choice; no geographic guessing.
initContactCapture(data,{onOpen:closeNavigation});
let lastFocus=null;
$$('dialog').filter(d=>d.id!=='contact-dialog').forEach(d=>{
 $$('.dialog-close',d).forEach(b=>b.addEventListener('click',()=>d.close()));
 d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 d.addEventListener('close',()=>{document.body.classList.remove('locked');lastFocus?.focus();});
});
// A simulation is a request only. No rates, instalments or credit data are handled here.
const finance=$('#finance-form');if(finance){
 const modelSelect=$('#finance-model');if(initialFinance.model)modelSelect.value=initialFinance.model;
 const syncFinanceModel=()=>$$('.finance [data-contact]').forEach(button=>button.dataset.model=modelSelect.value);
 modelSelect.addEventListener('change',syncFinanceModel);syncFinanceModel();
 finance.addEventListener('submit',e=>{
  e.preventDefault();if(!finance.reportValidity())return;
  const f=new FormData(finance),unit=String(f.get('unit')||''),model=String(f.get('model')||'');
  const entry=String(f.get('entry')||''),term=String(f.get('term')||'');
  const error=$('#finance-error');error.hidden=true;
  if(!data.models.some(m=>m.id===model)||!data.units.some(u=>u.id===unit)){error.textContent='Escolha um modelo e uma unidade para continuar.';error.hidden=false;return;}
  if((entry&&(!Number.isFinite(Number(entry))||Number(entry)<0))||(term&&(!Number.isInteger(Number(term))||Number(term)<1))){error.textContent='Confira a entrada e informe o prazo em meses inteiros.';error.hidden=false;return;}
  applyUnit(unit);const context={unit,model,intent:'simulacao',entry,term,placement:'finance',trigger:$('[type=submit]',finance)};
  contactEvent(window,'contact_cta_click',context);requestContact(context);
 });
 $('#finance-unit').addEventListener('change',e=>{if(e.target.value)applyUnit(e.target.value);});
}
const clear=$('#clear-preference');if(clear)clear.addEventListener('click',()=>{applyUnit('');$('#preference-status').textContent='A preferência de unidade foi apagada deste navegador.'});
// Decorative background films: automatic and static for reduced motion/data saving.
$$('[data-background-film]').forEach(cinema=>{
 const video=$('[data-background-video]',cinema),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let wantsMotion=!reduce.matches&&!navigator.connection?.saveData,visible=false;
 function mediaState(playing){cinema.classList.toggle('is-playing',playing);}
 function syncFilm(){
  if(!wantsMotion||!visible||document.hidden){video.pause();return;}
  video.muted=true;loadVideo(video);video.play().catch(()=>{mediaState(false)});
 }
 video.addEventListener('playing',()=>mediaState(true));video.addEventListener('pause',()=>mediaState(false));video.addEventListener('error',()=>{wantsMotion=false;mediaState(false)});
 document.addEventListener('visibilitychange',syncFilm);
 reduce.addEventListener('change',e=>{if(e.matches){wantsMotion=false;syncFilm()}});
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncFilm()},{threshold:.08}).observe(cinema)}else{visible=true;syncFilm()}
});
function loadVideo(video){const s=$('source[data-src]',video);if(s){s.src=s.dataset.src;delete s.dataset.src;video.load();}}
// BIA owns its lazy source and viewport playback; reloading it here interrupts play().
$$('video:not([data-bia-video])').forEach(v=>{v.addEventListener('pointerdown',()=>loadVideo(v),{once:true});v.addEventListener('keydown',()=>loadVideo(v),{once:true});v.addEventListener('play',()=>loadVideo(v),{once:true});});
$$('.film-play').forEach(b=>b.addEventListener('click',()=>{const v=$('video',b.parentElement);loadVideo(v);v.play().then(()=>{b.hidden=true}).catch(()=>{b.hidden=true});}));
// Approved product slider. Photo, name, description, price and action share one model state.
const catalog=$('.catalog-slider');
if(catalog){
 const q=s=>$(s,catalog),models=data.models;let active=4,pointerX=null,pointerY=null,suppressClickUntil=0;
 const main=q('[data-slider-image]'),action=q('[data-slider-action]');
 function keepModelDetailsVisible(){
  const panel=q('.slider-details'),rect=panel.getBoundingClientRect(),headerBottom=$('.site-header').getBoundingClientRect().bottom;
  const safeTop=headerBottom+16,safeBottom=window.innerHeight-16;
  if(rect.height<=safeBottom-safeTop){
   const delta=rect.top<safeTop?rect.top-safeTop:rect.bottom>safeBottom?rect.bottom-safeBottom:0;
   if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  }else{
   const title=q('[data-slider-name]').getBoundingClientRect();
   if(title.top<safeTop||title.bottom>safeBottom)q('[data-slider-name]').scrollIntoView({block:'nearest',behavior:'instant'});
  }
 }
 function showModel(index,animate=true){
  active=(index+models.length)%models.length;
  const m=models[active],prev=models[(active+models.length-1)%models.length],next=models[(active+1)%models.length];
  q('[data-slider-name]').textContent=m.name;q('[data-slider-description]').textContent=m.catalogDescription;q('[data-slider-price]').textContent=money(m.price);
  main.src=`/assets/${m.catalogImage}`;main.srcset=m.catalogSmallWidth<m.catalogWidth?`/assets/${m.catalogImage.replace('.webp','-small.webp')} ${m.catalogSmallWidth}w, /assets/${m.catalogImage} ${m.catalogWidth}w`:`/assets/${m.catalogImage} ${m.catalogWidth}w`;main.width=m.catalogWidth;main.height=m.catalogHeight;main.alt=`${m.name} — vista completa`;
  for(const [key,item] of [['previous',prev],['next',next]]){
   const image=q(`[data-slider-${key}-image]`);image.src=`/assets/${item.catalogImage.replace('.webp','-small.webp')}`;image.alt=item.name;
   q(`[data-slider-${key}-name]`).textContent=item.name;q(`[data-slider-${key}-bike]`).setAttribute('aria-label',`Ver ${item.name}`);
  }
  $$('[data-model-index]',catalog).forEach((b,i)=>b.setAttribute('aria-current',String(i===active)));
  q('[data-slider-counter]').textContent=`${String(active+1).padStart(2,'0')} / ${String(models.length).padStart(2,'0')}`;
  action.href=`/motos/${m.id}/`;action.firstChild.textContent='Conhecer a moto ';
  const simulation=q('[data-slider-simulation]');simulation.dataset.simulateModel=m.id;simulation.href=simulationPath(data,m.id,selectedUnit);
  q('[data-slider-contact]').dataset.model=m.id;
  if(animate){
   requestAnimationFrame(keepModelDetailsVisible);
   track('model_view',{model:m.id,placement:'home_slider'});q('[data-slider-announcement]').textContent=`${m.name}. ${money(m.price)}. ${m.catalogDescription}`;
   if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&main.animate){main.getAnimations().forEach(a=>a.cancel());main.animate([{opacity:.4,transform:'translateX(22px)'},{opacity:1,transform:'translateX(0)'}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'});}
  }
 }
 q('[data-slider-previous]').addEventListener('click',()=>showModel(active-1));q('[data-slider-next]').addEventListener('click',()=>showModel(active+1));
 for(const [key,delta] of [['previous',-1],['next',1]])q(`[data-slider-${key}-bike]`).addEventListener('click',()=>{if(Date.now()>suppressClickUntil)showModel(active+delta)});
 $$('[data-model-index]',catalog).forEach(b=>b.addEventListener('click',()=>showModel(Number(b.dataset.modelIndex))));
 catalog.addEventListener('keydown',e=>{if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&e.target.closest('.slider-navigation,.slider-stage')){e.preventDefault();showModel(active+(e.key==='ArrowRight'?1:-1))}});
 const stage=q('[data-slider-stage]');
 stage.addEventListener('pointerdown',e=>{pointerX=e.clientX;pointerY=e.clientY});
 stage.addEventListener('pointerup',e=>{if(pointerX===null)return;const dx=e.clientX-pointerX,dy=e.clientY-pointerY;pointerX=null;pointerY=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){suppressClickUntil=Date.now()+500;showModel(active+(dx<0?1:-1))}});
 for(const name of ['pointercancel','pointerleave'])stage.addEventListener(name,()=>{pointerX=null;pointerY=null});
 showModel(active,false);
}
// Gallery uses supplied full photos, never a fabricated 360 view.
const gal=$('#gallery-dialog'),photos=$$('[data-gallery]');let galleryIndex=0;
function showPhoto(i){galleryIndex=(i+photos.length)%photos.length;const img=$('img',photos[galleryIndex]);$('#gallery-full').src=photos[galleryIndex].dataset.full||img.src;$('#gallery-full').alt=img.alt;$('#gallery-position').textContent=`${galleryIndex+1} / ${photos.length}`;}
photos.forEach((b,i)=>b.addEventListener('click',()=>{lastFocus=b;showPhoto(i);gal.showModal();document.body.classList.add('locked')}));
$('[data-gallery-prev]')?.addEventListener('click',()=>showPhoto(galleryIndex-1));$('[data-gallery-next]')?.addEventListener('click',()=>showPhoto(galleryIndex+1));
gal.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(galleryIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(galleryIndex-1)}});
if(modelContext)track('model_view',{model:modelContext});
