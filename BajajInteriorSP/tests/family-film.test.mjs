import test from 'node:test';
import assert from 'node:assert/strict';
import {initFamilyFilm} from '../dist/family-film.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(load){
 const elements=Object.fromEntries(['toggle','play','pause','label','status'].map(key=>[key,{hidden:key==='pause',attrs:{},setAttribute(k,v){this.attrs[k]=v;},toggleAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this[k]=fn;}}]));
 const frame={},calls=[];let options;
 const player={playVideo:()=>calls.push('play'),pauseVideo:()=>calls.push('pause')};
 const root={querySelector:s=>s==='.family-dominar-video'?frame:elements[s.match(/data-film-(\w+)/)[1]]};
 const env={YT:{Player:function(target,config){assert.equal(target,frame);options=config;return player;}}};
 initFamilyFilm(root,env,load??(async()=>env.YT));
 return {elements,calls,player,get options(){return options;}};
}
test('play/pause and keyboard-native button remain synchronized with actual player events',async()=>{
 const f=fixture();await tick();f.options.events.onReady({target:f.player});assert.deepEqual(f.calls,[]);
 f.elements.toggle.click();assert.equal(f.calls.at(-1),'play');assert.equal(f.elements.toggle.attrs['aria-label'],'Pausar vídeo');
 f.options.events.onStateChange({data:1});assert.equal(f.elements.play.attrs.hidden,true);assert.equal(f.elements.pause.attrs.hidden,false);
 f.elements.toggle.click();assert.equal(f.calls.at(-1),'pause');assert.equal(f.elements.toggle.attrs['aria-label'],'Reproduzir vídeo');
 f.options.events.onStateChange({data:0});assert.equal(f.elements.label.textContent,'Play');
});
test('a second click cancels a play request while YouTube is still loading',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r);const f=fixture(()=>pending);
 f.elements.toggle.click();f.elements.toggle.click();
 resolve({Player:function(target,config){f.pendingOptions=config;return f.player;}});await tick();
 f.pendingOptions.events.onReady({target:f.player});assert.deepEqual(f.calls,['pause']);
});
test('player failure exposes the direct YouTube fallback rather than an unusable control',async()=>{
 const f=fixture(async()=>{throw new Error('offline');});await tick();
 assert.equal(f.elements.toggle.hidden,true);assert.equal(f.elements.status.hidden,false);assert.match(f.elements.status.textContent,/Assistir no YouTube/);
});
