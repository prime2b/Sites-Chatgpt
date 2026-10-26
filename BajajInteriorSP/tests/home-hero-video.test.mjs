import test from 'node:test';
import assert from 'node:assert/strict';
import {heroYouTube} from '../dist/home-hero-video.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const players=[],calls=[];
 const host={ownerDocument:{createElement:()=>({})},replaceChildren:()=>{}};
 const env={location:{origin:'https://example.com'},matchMedia:()=>({matches:false}),YT:{Player:function(mount,options){
  const frame={style:{},setAttribute(){}};
  const player={options,mute:()=>calls.push('mute'),pauseVideo:()=>calls.push('pause'),playVideo:()=>calls.push('play'),destroy:()=>calls.push('destroy'),getIframe:()=>frame};
  players.push(player);return player;
 }}};
 const control=heroYouTube({env,host,visual:{getBoundingClientRect:()=>({width:1440,height:900})},onPlaying:id=>calls.push('playing:'+id),onStopped:id=>calls.push('stopped:'+id),onError:id=>calls.push('error:'+id)});
 return {control,players,calls};
}
test('troca rápida invalida carregamento anterior e cria apenas o modelo selecionado',async()=>{
 const f=setup();f.control.update({id:'first',play:true});f.control.update({id:'second',play:true});await tick();
 assert.equal(f.players.length,1);assert.equal(f.players[0].options.videoId,'second');
 const p=f.players[0];p.options.events.onReady({target:p});assert.equal(f.calls.at(-1),'play');assert.ok(f.calls.includes('mute'));
 assert.equal(p.getIframe().tabIndex,-1);assert.equal(p.getIframe().style.width,'1600px');
 f.control.update({id:'',play:false});assert.ok(f.calls.includes('destroy'));
 p.options.events.onStateChange({data:1});assert.ok(!f.calls.includes('playing:second'));
});
test('fora da tela pausa, retoma o mesmo player e troca de modelo destrói o anterior',async()=>{
 const f=setup();f.control.update({id:'first',play:false});await tick();assert.equal(f.players.length,0);
 f.control.update({id:'first',play:true});await tick();const p=f.players[0];p.options.events.onReady({target:p});
 f.control.update({id:'first',play:false});assert.ok(f.calls.includes('pause'));
 f.control.update({id:'first',play:true});assert.equal(f.players.length,1);assert.equal(f.calls.at(-1),'play');
 f.control.update({id:'second',play:true});await tick();assert.equal(f.players.length,2);assert.ok(f.calls.includes('destroy'));
 p.options.events.onError({data:150});assert.ok(!f.calls.includes('error:first'));
});
test('bloqueio de autoplay e erro acionam fallback do modelo correspondente',async()=>{
 const f=setup();f.control.update({id:'first',play:true});await tick();const p=f.players[0];p.options.events.onReady({target:p});
 p.options.events.onAutoplayBlocked();assert.equal(f.calls.at(-1),'error:first');assert.ok(f.calls.includes('pause'));
});
