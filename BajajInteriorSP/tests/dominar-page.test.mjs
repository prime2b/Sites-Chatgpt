import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {entryValues,entryState,simulationURL,initDominar} from '../dist/dominar-400.mjs';
const html=readFileSync(new URL('../dist/motos/dominar-400/index.html',import.meta.url),'utf8');
const config=JSON.parse(html.match(/<script type="application\/json" id="d4-data">(.*?)<\/script>/s)[1]);
const sourceData=JSON.parse(readFileSync(new URL('../data.json',import.meta.url)));
const normalize=s=>s.replace(/\s/g,' ');
function fixture(pageConfig=config) {
 class El {
  constructor(dataset={}){this.dataset=dataset;this.attrs={};this.events={};this.hidden=false;this.value='16';this.textContent='';this.style={setProperty:(n,v)=>this.style[n]=v};const classes=new Set();this.classList={add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n)};}
  setAttribute(n,v){this.attrs[n]=String(v);}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  focus(){this.focused=true;}
  dispatch(type,extras={}){const e={type,target:this,preventDefault(){this.prevented=true;},...extras};for(const fn of this.events[type]??[])fn(e);return e;}
 }
 const root=new El(),doc=new El(),dialog=new El();doc.hidden=false;root.ownerDocument=doc;doc.getElementById=id=>{assert.equal(id,'gallery-dialog');return dialog;};
 const keys=['[data-d4-hero]','[data-d4-video]','[data-d4-motion]','#d4-entry','[data-d4-summary]',
  '.d4-modes','[data-d4-mode-copy]','.d4-terms','.d4-cities','[data-d4-error]','[data-d4-fallback]',
  '[data-d4-entry-value]','[data-d4-entry-label]','[data-d4-balance]','.d4-finance-bar','#d4-finance','[data-d4-fallback-link]','.d4-spec-tabs'];
 const map=Object.fromEntries(keys.map(k=>[k,new El()]));
 const modes=pageConfig.modes.map(m=>new El({d4Mode:m.id}));
 const terms=[12,24,36,48].map(x=>new El({d4Term:String(x)}));
 const cities=pageConfig.units.map(u=>new El({d4City:u.id}));
 const specs=Array.from({length:5},(_,i)=>new El({d4Spec:String(i)}));
 const panels=specs.map(()=>new El());
 const links=pageConfig.units.map(u=>new El({d4UnitLink:u.id}));
 map['.d4-modes'].querySelectorAll=()=>modes;map['.d4-terms'].querySelectorAll=()=>terms;map['.d4-cities'].querySelectorAll=()=>cities;
 root.querySelector=s=>{assert.ok(map[s],s);return map[s];};
 root.querySelectorAll=s=>{const lists={'.d4-reveal':[],'[data-d4-city]':cities,'[data-d4-unit-link]':links,'[data-d4-spec]':specs,'.d4-spec-panels>[role=tabpanel]':panels};assert.ok(lists[s],s);return lists[s];};
 map['[data-d4-video]'].pause=()=>{};map['[data-d4-video]'].load=()=>{};map['[data-d4-video]'].play=()=>Promise.resolve();
 const storage=new Map(),opened=[],dispatched=[];
 class CustomEvent {constructor(type,{detail}){this.type=type;this.detail=detail;}}
 doc.dispatchEvent=e=>{dispatched.push(e);for(const fn of doc.events[e.type]??[])fn(e);};
 const media=new El();media.matches=false;
 const env={matchMedia:()=>media,navigator:{},CustomEvent,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},open:(...args)=>opened.push(args),dataLayer:[]};
 initDominar(root,{...pageConfig,heroYoutube:null},env);
 return {root,doc,dialog,map,modes,terms,cities,specs,panels,links,storage,opened,dispatched,env,CustomEvent};
}
test('entrada percorre intervalos de R$500 e alcança exatamente o preço, com saldo zero',()=>{
 const values=entryValues(config.price);assert.equal(values[0],0);assert.equal(values.at(-1),27490);assert.equal(values.at(-2),27000);
 assert.ok(values.slice(1,-1).every((x,i)=>x-values[i]===500));
 assert.deepEqual(entryState(27490,16),{position:16,entry:8000,balance:19490,percent:8000/27490*100});
 assert.equal(entryState(27490,999).balance,0);assert.equal(entryState(27490,-5).entry,0);
});
test('simulação usa somente os dois WhatsApps e preserva entrada, prazo e unidade em todos os extremos',()=>{
 for(const u of config.units)for(const entry of [0,8000,27490])for(const term of [12,24,36,48]){
  const url=new URL(simulationURL(config,u.id,entry,term));assert.equal(url.pathname,'/'+u.phone);
  const text=normalize(url.searchParams.get('text'));assert.match(text,/Olá! Quero simular a Dominar 400 \(R\$ 27\.490,00\)/);
  assert.ok(text.includes(`Prazo: ${term} meses.`));assert.ok(text.includes(`Unidade: ${u.short}.`));
  assert.equal(/aprovad|enviado|parcela|CPF/i.test(text),false);
 }
 assert.throws(()=>simulationURL(config,'',8000,36),/Escolha/);assert.throws(()=>simulationURL(config,'bauru',9001,36),/Confira/);
});
test('formulário exige unidade e só prepara a abertura do WhatsApp após escolha',()=>{
 const f=fixture();f.map['#d4-finance'].dispatch('submit');assert.equal(f.opened.length,0);assert.equal(f.map['[data-d4-error]'].hidden,false);assert.equal(f.cities[0].focused,true);
 f.cities[1].dispatch('click');f.terms[1].dispatch('click');f.map['#d4-entry'].value='55';f.map['#d4-entry'].dispatch('input');
 assert.equal(normalize(f.map['[data-d4-balance]'].textContent),'R$ 0,00');
 f.map['#d4-finance'].dispatch('submit');assert.equal(f.opened.length,1);assert.equal(f.opened[0][1],'_blank');assert.equal(f.opened[0][2],'noopener');
 const url=new URL(f.opened[0][0]);assert.equal(url.pathname,'/5514996448094');assert.match(url.searchParams.get('text'),/Prazo: 24 meses/);
 assert.equal(f.map['[data-d4-fallback-link]'].href,f.opened[0][0]);assert.equal(f.map['[data-d4-fallback]'].hidden,false);
 assert.ok(f.env.dataLayer.every(event=>!('entry'in event)&&!('term'in event)));
});
test('seleção de unidade persiste, emite evento global e acompanha mudanças vindas do header',()=>{
 const f=fixture();f.cities[1].dispatch('click');assert.equal(f.storage.get('interiorsp.unit.v1'),'bauru');
 assert.equal(f.dispatched.at(-1).type,'interiorsp:unit-change');assert.equal(f.dispatched.at(-1).detail.unit,'bauru');
 f.doc.dispatchEvent(new f.CustomEvent('interiorsp:unit-selected',{detail:{unit:'rio-preto'}}));
 assert.equal(f.cities[0].attrs['aria-checked'],'true');assert.equal(f.cities[1].attrs['aria-checked'],'false');
 f.map['#d4-finance'].dispatch('submit');assert.equal(new URL(f.opened[0][0]).pathname,'/5517992606039');
});
test('modos e ficha técnica respondem a clique e teclado, mantendo uma única seleção',()=>{
 const f=fixture();f.modes[3].dispatch('click');assert.equal(f.map['[data-d4-mode-copy]'].textContent,config.modes[3].description);
 const e=f.map['.d4-modes'].dispatch('keydown',{target:f.modes[3],key:'ArrowRight'});assert.equal(e.prevented,true);assert.equal(f.modes[0].attrs['aria-checked'],'true');assert.equal(f.modes[0].focused,true);
 f.specs[3].dispatch('click');assert.deepEqual(f.panels.map(x=>x.hidden),[true,true,true,false,true]);
 f.map['.d4-spec-tabs'].dispatch('keydown',{target:f.specs[3],key:'End'});assert.equal(f.specs[4].attrs['aria-selected'],'true');assert.equal(f.specs[4].focused,true);
});
test('pausa de efeitos e estado do lightbox têm semântica acessível',()=>{
 const f=fixture();assert.equal(f.map['[data-d4-hero]'].dataset.motionActive,'true');f.map['[data-d4-motion]'].dispatch('click');
 assert.equal(f.map['[data-d4-hero]'].dataset.motionActive,'false');assert.equal(f.map['[data-d4-motion]'].textContent,'Reproduzir efeitos');
 assert.equal(f.dialog.attrs['aria-modal'],'true');assert.equal(f.dialog.attrs.role,'dialog');
});
test('galeria compartilhada abre o arquivo de maior resolução, mantém alt e faz loop',()=>{
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');const code=app.slice(app.indexOf('function showPhoto('),app.indexOf('photos.forEach('));
 const photos=[...html.matchAll(/data-gallery="(\d+)" data-full="([^"]+)"/g)].map((m,i)=>({dataset:{full:m[2]},image:{src:'small-'+i,alt:'Foto '+i}}));
 assert.equal(photos.length,6);const image={},position={};const context={photos,galleryIndex:0,$:(s,p)=>p?p.image:s==='#gallery-full'?image:position};
 vm.runInNewContext(code+';showPhoto(-1)',context);assert.equal(image.src,photos[5].dataset.full);assert.equal(image.alt,'Foto 5');assert.equal(position.textContent,'6 / 6');
 vm.runInNewContext('showPhoto(6)',context);assert.equal(image.src,photos[0].dataset.full);
 for(const photo of photos)assert.ok(existsSync(new URL('../dist'+photo.dataset.full,import.meta.url)));
});
test('página mantém preço, ficha oficial, duas lojas, Maps e não introduz vídeo de outro modelo',()=>{
 assert.equal(config.price,sourceData.models.find(m=>m.id==='dominar-400').price);assert.equal(config.heroVideo,null);
 const filmSources=JSON.parse(readFileSync(new URL('../media-video-sources.json',import.meta.url)));
 const heroFilm=filmSources.find(f=>f.youtube===config.heroYoutube);assert.ok(heroFilm);assert.match(heroFilm.title,/Dominar 400/i);assert.doesNotMatch(heroFilm.title,/NS400Z/i);
 assert.deepEqual(config.units,sourceData.units);for(const u of sourceData.units){assert.ok(html.includes(u.maps));assert.ok(html.includes(u.address));assert.ok(html.includes(u.cnpj));}
 for(const value of ['12V 8Ah VRLA','13 litros','192 kg','2.156 × 863 × 1.243 mm','110/70 R17 TL 54H','150/60 R17 TL 66H'])assert.ok(html.includes(value),value);
 assert.equal(html.includes('brand-film.mp4'),false);assert.equal(html.includes('dominar-250-poster'),false);
 assert.equal((html.match(/class="d4-feature d4-section/g)||[]).length,6);
 assert.equal((html.match(/data-d4-spec="/g)||[]).length,5);
 const ride=[...html.matchAll(/href="(https:\/\/wa.me\/[^\"]+)"[^>]+data-d4-unit-link="([^\"]+)"/g)];assert.equal(ride.length,2);
 for(const [,link,id] of ride){const u=config.units.find(x=>x.id===id),url=new URL(link);assert.equal(url.pathname,'/'+u.phone);assert.ok(url.searchParams.get('text').includes(u.short));}
});

test('formulário inicializa os seis modelos, com ou sem modos, e mantém unidade e valores corretos',()=>{
 for(const m of sourceData.models){
  const page=readFileSync(new URL(`../dist/motos/${m.id}/index.html`,import.meta.url),'utf8');const cfg=JSON.parse(page.match(/id="d4-data">(.*?)<\/script>/s)[1]);const f=fixture(cfg);
  assert.equal(f.modes.length,cfg.modes.length);assert.equal(f.map['#d4-entry'].max,String(entryValues(cfg.price).length-1));
  f.cities[0].dispatch('click');f.map['#d4-finance'].dispatch('submit');const url=new URL(f.opened[0][0]);assert.ok(url.searchParams.get('text').includes(cfg.name));assert.equal(url.pathname,'/5517992606039');
 }
});
