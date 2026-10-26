import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backgroundYouTube,initDetailVideo} from '../dist/dominar-youtube.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(){
 const events={},calls=[],frame={style:{},setAttribute:(...args)=>calls.push(args)};
 let options;
 const player={mute:()=>calls.push('mute'),playVideo:()=>calls.push('play'),pauseVideo:()=>calls.push('pause'),getIframe:()=>frame};
 const env={location:{origin:'https://example.com'},YT:{Player:function(id,config){options=config;calls.push(['create',id]);return player;}},addEventListener:(n,fn)=>events[n]=fn};
 const hero={getBoundingClientRect:()=>({width:1440,height:1100})};
 const control=backgroundYouTube({env,hero,videoId:'NmF7uXA2Zms',onPlaying:()=>calls.push('visible'),onError:()=>calls.push('fallback')});
 return {env,frame,player,control,calls,get options(){return options;}};
}
test('fundo não carrega antes de elegibilidade; roda mudo, cobre o hero e pausa quando solicitado',async()=>{
 const f=fixture();f.control.update(false);await tick();assert.equal(f.options,undefined);
 f.control.update(true);await tick();assert.equal(f.options.videoId,'NmF7uXA2Zms');assert.equal(f.options.playerVars.playlist,'NmF7uXA2Zms');assert.equal(f.options.playerVars.loop,1);
 f.options.events.onReady({target:f.player});assert.equal(f.frame.tabIndex,-1);assert.equal(f.frame.style.width,'1956px');assert.ok(f.calls.includes('mute'));assert.equal(f.calls.at(-1),'play');
 f.options.events.onStateChange({data:1});assert.equal(f.calls.at(-1),'visible');
 f.control.update(false);assert.equal(f.calls.at(-1),'pause');f.options.events.onStateChange({data:1});assert.equal(f.calls.at(-1),'pause');
});
test('pausa durante carregamento evita criação; erro de incorporação restaura fallback e impede retomada',async()=>{
 const f=fixture();f.control.update(true);f.control.update(false);await tick();assert.equal(f.options,undefined);
 f.control.update(true);await tick();f.options.events.onReady({target:f.player});f.options.events.onError({data:150});assert.equal(f.calls.at(-1),'fallback');
 f.control.update(true);assert.equal(f.calls.at(-1),'pause');
});
test('vídeo de detalhes só incorpora por clique, mantém modificadores e oferece controles nativos',()=>{
 let click,frame,inserted;
 const link={dataset:{d4Watch:'Hmo9eyBJm2Y'},addEventListener:(name,fn)=>{click=fn;}};
 const root={querySelector:s=>s==='[data-d4-watch]'?link:{replaceChildren:el=>inserted=el},ownerDocument:{createElement:()=>frame={focus(){this.focused=true;}}}};
 initDetailVideo(root,{});assert.equal(frame,undefined);
 click({ctrlKey:true,preventDefault(){throw new Error('native link must remain');}});assert.equal(frame,undefined);
 let prevented=false;click({preventDefault(){prevented=true;}});assert.ok(prevented);assert.equal(inserted,frame);assert.equal(frame.focused,true);
 const url=new URL(frame.src);assert.equal(url.hostname,'www.youtube-nocookie.com');assert.equal(url.pathname,'/embed/Hmo9eyBJm2Y');assert.equal(url.searchParams.get('controls'),null);assert.equal(url.searchParams.get('autoplay'),'1');
 assert.equal(frame.allowFullscreen,true);assert.match(frame.allow,/picture-in-picture/);
});
test('os vídeos da Dominar 400 pertencem ao modelo correto e preservam movimento e dados',()=>{
 const cfg=JSON.parse(readFileSync(new URL('../d400-settings.json',import.meta.url)));
 const sources=JSON.parse(readFileSync(new URL('../media-video-sources.json',import.meta.url)));
 for(const id of [cfg.heroYoutube,new URL(cfg.youtubeUrl).searchParams.get('v'),new URL(cfg.additionalVideoUrl).searchParams.get('v')]){
  const source=sources.find(s=>s.youtube===id);assert.ok(source);assert.equal(source.author,'Bajaj do Brasil');assert.match(source.title,/Dominar 400/i);assert.doesNotMatch(source.title,/NS400Z/i);
 }
 const html=readFileSync(new URL('../dist/motos/dominar-400/index.html',import.meta.url),'utf8');assert.equal(html.includes('link pendente'),false);
 for(const url of [cfg.heroYoutube,cfg.youtubeUrl,cfg.additionalVideoUrl])assert.ok(html.includes(url));
 const src=readFileSync(new URL('../dist/dominar-400.mjs',import.meta.url),'utf8');assert.match(src,/play&&!mobile.matches&&!env.navigator.connection\?\.saveData/);assert.match(src,/motion&&heroVisible&&!doc.hidden&&!reduce.matches/);
});
