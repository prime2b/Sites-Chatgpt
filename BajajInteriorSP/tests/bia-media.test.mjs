import test from 'node:test';
import assert from 'node:assert/strict';
import { initBIAMedia } from '../public/bia-media.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
class Node{
 constructor(){this.events={};this.attrs={};this.dataset={};this.hidden=false;this.disabled=false;this.paused=true;this.complete=false;this.naturalWidth=0;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 dispatch(name,event={}){for(const fn of this.events[name]??[])fn(event);}
 setAttribute(name,value){this.attrs[name]=value;}
 getAttribute(name){return this.attrs[name]??null;}
 focus(){this.ownerDocument.activeElement=this;}
 replaceChildren(...items){this.children=items;}
}
function fixture(mode='video',options={}){
 const doc=new Node(),root=new Node(),env=new Node(),nodes={},frames=[],calls=[];doc.hidden=false;root.ownerDocument=doc;env.location={origin:'https://example.test'};
 const add=selector=>{const n=new Node();n.ownerDocument=doc;nodes[selector]=n;return n;};
 const brand=add('[data-bia-brand]'),status=add('[data-bia-status]');brand.hidden=true;status.hidden=true;root.dataset.biaAutoplay=String(!!options.autoplay);
 const reduced=new Node(),connection=new Node();reduced.matches=!!options.reduced;connection.saveData=!!options.saveData;env.matchMedia=()=>reduced;env.navigator={connection};
 let video,source,button,poster,image,youtube,observer;
 if(mode==='image'){image=add('[data-bia-image]');}
 if(mode==='video'||mode==='youtube'){
  poster=add('[data-bia-poster]');poster.complete=true;poster.naturalWidth=800;
  button=add('[data-bia-play]');
  if(mode==='video'){
   add('.bia-stage');const sound=add('[data-bia-sound]');sound.hidden=true;add('[data-bia-sound-label]');
   video=add('[data-bia-video]');video.hidden=true;video.muted=true;video.volume=1;video.ended=false;video.currentTime=0;source=new Node();source.dataset.src='/assets/approved-bia.mp4';video.querySelector=()=>source;video.load=()=>calls.push('load');video.pause=()=>{const playing=!video.paused;video.paused=true;calls.push('pause');if(playing)video.dispatch('pause');};video.play=()=>{video.paused=false;video.ended=false;video.dispatch('play');calls.push('play');return Promise.resolve();};
  }else{youtube=add('[data-bia-youtube]');youtube.dataset.biaYoutube='SLigfKY0ZFI';youtube.hidden=true;}
 }
 root.querySelector=selector=>nodes[selector]||null;
 env.IntersectionObserver=class{constructor(callback){observer=callback;}observe(){}};
 doc.createElement=tag=>{const frame=new Node();frame.tagName=tag;frame.ownerDocument=doc;frame.contentWindow={postMessage:(...args)=>calls.push(args)};frames.push(frame);return frame;};
 initBIAMedia(root,env);
 return {root,doc,env,brand,status,video,source,button,poster,image,youtube,frames,calls,reduced,connection,sound:nodes['[data-bia-sound]'],soundLabel:nodes['[data-bia-sound-label]'],visibility:(value,ratio=value?1:0)=>observer([{isIntersecting:value,intersectionRatio:ratio}])};
}
test('vídeo da BIA não transfere a fonte antes do clique e usa controles após iniciar',async()=>{
 const f=fixture();assert.equal(f.source.getAttribute('src'),null);assert.deepEqual(f.calls,[]);
 f.button.dispatch('click');await tick();assert.equal(f.source.getAttribute('src'),'/assets/approved-bia.mp4');assert.deepEqual(f.calls,['load','play']);assert.equal(f.button.hidden,true);assert.equal(f.poster.hidden,true);assert.equal(f.video.hidden,false);
});
test('falha mantém a imagem, informa o problema e uma nova tentativa recarrega o vídeo',async()=>{
 const f=fixture();f.video.play=()=>Promise.reject(Error('autoplay indisponível'));f.button.dispatch('click');await tick();
 assert.equal(f.poster.hidden,false);assert.equal(f.video.hidden,true);assert.equal(f.button.hidden,false);assert.equal(f.button.disabled,false);assert.equal(f.status.hidden,false);assert.match(f.status.textContent,/Não foi possível/);
 f.video.play=()=>{f.video.paused=false;return Promise.resolve();};f.button.dispatch('click');await tick();assert.equal(f.calls.filter(x=>x==='load').length,2);assert.equal(f.status.hidden,true);assert.equal(f.button.hidden,true);
});
test('sair da tela pausa e uma resolução atrasada não reproduz fora de vista',async()=>{
 const f=fixture();let resolve;f.video.play=()=>new Promise(r=>resolve=r);f.button.dispatch('click');f.visibility(false);f.video.paused=false;f.video.dispatch('playing');assert.equal(f.video.paused,true);resolve();await tick();assert.equal(f.video.paused,true);
 const before=f.calls.length;f.visibility(true);assert.equal(f.calls.length,before);f.doc.hidden=true;f.doc.dispatch('visibilitychange');assert.equal(f.video.paused,true);
});
test('uma imagem indisponível recupera a composição BIA; o modo tipográfico não cria player',()=>{
 const f=fixture('image');f.image.dispatch('error');assert.equal(f.brand.hidden,false);assert.equal(f.image.hidden,true);assert.equal(f.status.hidden,false);
 const brand=fixture('brand');assert.deepEqual(brand.calls,[]);assert.equal(brand.frames.length,0);
});
test('YouTube é criado somente por clique, com controles, e recebe pausa ao ocultar a página',()=>{
 const f=fixture('youtube');assert.equal(f.frames.length,0);f.button.dispatch('click');assert.equal(f.frames.length,1);const frame=f.frames[0];assert.match(frame.src,/youtube-nocookie\.com\/embed\/SLigfKY0ZFI/);assert.equal(new URL(frame.src).searchParams.get('controls'),'1');assert.equal(f.youtube.hidden,false);assert.equal(f.button.hidden,true);
 f.doc.hidden=true;f.doc.dispatch('visibilitychange');assert.equal(JSON.parse(f.calls.at(-1)[0]).func,'pauseVideo');assert.equal(f.calls.at(-1)[1],'https://www.youtube-nocookie.com');
});

test('entrada do player na tela inicia sem som, sem antecipar o download nem tirar o foco',async()=>{
 const f=fixture('video',{autoplay:true});const focused=new Node();f.doc.activeElement=focused;
 assert.equal(f.source.getAttribute('src'),null);assert.deepEqual(f.calls,[]);
 f.visibility(true,.2);await tick();assert.equal(f.source.getAttribute('src'),null);
 f.visibility(true,.6);await tick();assert.deepEqual(f.calls,['load','play']);assert.equal(f.video.muted,true);assert.equal(f.video.paused,false);assert.equal(f.doc.activeElement,focused);assert.equal(f.sound.hidden,false);assert.equal(f.button.hidden,true);
 f.visibility(true,.8);await tick();assert.equal(f.calls.filter(x=>x==='play').length,1);
 f.visibility(false);assert.equal(f.video.paused,true);
 f.visibility(true,.7);await tick();assert.equal(f.video.paused,false);assert.equal(f.calls.filter(x=>x==='load').length,1);
});

test('autoplay pausa ao trocar de aba e respeita uma pausa manual até a próxima visita à seção',async()=>{
 const f=fixture('video',{autoplay:true});f.visibility(true);await tick();
 f.doc.hidden=true;f.doc.dispatch('visibilitychange');assert.equal(f.video.paused,true);
 f.doc.hidden=false;f.doc.dispatch('visibilitychange');await tick();assert.equal(f.video.paused,false);
 f.video.pause();const count=f.calls.filter(x=>x==='play').length;f.visibility(true);f.doc.dispatch('visibilitychange');await tick();assert.equal(f.calls.filter(x=>x==='play').length,count);
 f.visibility(false);f.visibility(true);await tick();assert.equal(f.video.paused,false);
});

test('o fim não cria um loop; voltar à seção permite uma nova reprodução desde o início',async()=>{
 const f=fixture('video',{autoplay:true});f.visibility(true);await tick();
 f.video.currentTime=10;f.video.ended=true;f.video.paused=true;f.video.dispatch('ended');const count=f.calls.filter(x=>x==='play').length;
 f.visibility(true);f.doc.dispatch('visibilitychange');await tick();assert.equal(f.calls.filter(x=>x==='play').length,count);
 f.visibility(false);f.visibility(true);await tick();assert.equal(f.calls.filter(x=>x==='play').length,count+1);assert.equal(f.video.currentTime,0);
});

test('bloqueio de autoplay oferece reprodução por clique com som, sem erro de rede ou download repetido',async()=>{
 const f=fixture('video',{autoplay:true});const play=f.video.play;f.video.play=()=>Promise.reject(Object.assign(new Error('Autoplay bloqueado'),{name:'NotAllowedError'}));
 f.visibility(true);await tick();assert.equal(f.video.hidden,true);assert.equal(f.poster.hidden,false);assert.equal(f.button.hidden,false);assert.match(f.status.textContent,/Toque em assistir/);
 f.video.play=play;f.button.dispatch('click');await tick();assert.equal(f.video.paused,false);assert.equal(f.video.muted,false);assert.equal(f.button.hidden,true);assert.equal(f.doc.activeElement,f.video);assert.equal(f.calls.filter(x=>x==='load').length,1);
});

test('movimento reduzido e economia de dados mantêm o clique disponível sem reprodução automática',async()=>{
 for(const preference of ['reduced','saveData']){
  const f=fixture('video',{autoplay:true,[preference]:true});f.visibility(true);await tick();assert.equal(f.source.getAttribute('src'),null);
  f.button.dispatch('click');await tick();assert.equal(f.video.paused,false);assert.equal(f.video.muted,false);
 }
});

test('o controle de som acompanha o volume nativo e restaura volume zero ao ativar',async()=>{
 const f=fixture('video',{autoplay:true});f.visibility(true);await tick();assert.equal(f.soundLabel.textContent,'Ativar som');
 f.sound.dispatch('click');assert.equal(f.video.muted,false);assert.equal(f.soundLabel.textContent,'Silenciar');assert.equal(f.sound.getAttribute('aria-pressed'),'true');
 f.video.volume=0;f.video.dispatch('volumechange');assert.equal(f.soundLabel.textContent,'Ativar som');f.sound.dispatch('click');assert.equal(f.video.volume,1);assert.equal(f.video.muted,false);
 f.sound.dispatch('click');assert.equal(f.video.muted,true);assert.equal(f.sound.getAttribute('aria-pressed'),'false');
 f.video.ended=true;f.video.paused=true;f.video.currentTime=10;f.video.dispatch('ended');f.sound.dispatch('click');await tick();assert.equal(f.video.currentTime,0);assert.equal(f.video.muted,false);assert.equal(f.video.paused,false);
});

test('uma reprodução automática que resolve após sair da tela continua pausada',async()=>{
 const f=fixture('video',{autoplay:true});let resolve;f.video.play=()=>new Promise(r=>resolve=r);
 f.visibility(true);f.visibility(false);f.video.paused=false;f.video.dispatch('playing');assert.equal(f.video.paused,true);resolve();await tick();assert.equal(f.video.paused,true);
});
