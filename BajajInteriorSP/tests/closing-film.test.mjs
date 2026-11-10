import test from 'node:test';
import assert from 'node:assert/strict';
import {initClosingFilm} from '../public/closing-film.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('filme do fechamento só carrega visível, pausa fora da tela e respeita movimento e dados',async()=>{
 const calls=[],classes=new Set(),docEvents={},reduce={matches:false,addEventListener:(n,fn)=>reduce.change=fn};
 const doc={hidden:false,addEventListener:(n,fn)=>docEvents[n]=fn};
 const root={dataset:{closingYoutube:'institutional',closingTitle:'Bajaj institucional'},ownerDocument:doc,classList:{add:n=>classes.add(n),remove:n=>classes.delete(n)},getBoundingClientRect:()=>({width:428,height:460})};
 const frame={style:{},setAttribute(){}},player={mute:()=>calls.push('mute'),playVideo:()=>calls.push('play'),pauseVideo:()=>calls.push('pause'),getIframe:()=>frame};
 let options,observe;
 const connection={saveData:false,addEventListener:(n,fn)=>connection.change=fn};
 const env={matchMedia:()=>reduce,navigator:{connection},location:{origin:'https://example.com'},YT:{Player:function(target,config){assert.equal(target,'closing-youtube-player');options=config;return player;}},IntersectionObserver:class{constructor(fn){observe=fn;}observe(){}}};
 initClosingFilm(root,env);await tick();assert.equal(options,undefined);
 observe([{isIntersecting:true}]);await tick();assert.equal(options.videoId,'institutional');options.events.onReady({target:player});assert.equal(calls.at(-1),'play');assert.equal(frame.title,'Vídeo de fundo · Bajaj institucional');assert.equal(frame.style.width,'818px');
 options.events.onStateChange({data:1});assert.ok(classes.has('is-playing'));
 observe([{isIntersecting:false}]);assert.equal(calls.at(-1),'pause');assert.equal(classes.has('is-playing'),false);
 observe([{isIntersecting:true}]);connection.saveData=true;connection.change();assert.equal(calls.at(-1),'pause');
 connection.saveData=false;reduce.matches=true;reduce.change();assert.equal(calls.at(-1),'pause');
 reduce.matches=false;doc.hidden=true;docEvents.visibilitychange();assert.equal(calls.at(-1),'pause');
 doc.hidden=false;docEvents.visibilitychange();assert.equal(calls.at(-1),'play');
 options.events.onError({data:150});assert.equal(classes.has('is-playing'),false);docEvents.visibilitychange();assert.equal(calls.at(-1),'pause');
});
