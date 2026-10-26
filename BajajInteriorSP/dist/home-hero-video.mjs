import {loadYouTube} from './dominar-youtube.mjs';

// One player at a time. A selection change invalidates pending API callbacks.
export function heroYouTube({env,host,visual,onPlaying,onStopped,onError}) {
  let id='',title='',player,ready=false,wanted=false,loading=false,generation=0;
  const fit=()=>{
    if(!player?.getIframe)return;
    const r=visual.getBoundingClientRect();
    const width=env.matchMedia('(max-width:767px)').matches?r.width:Math.max(r.width,r.height*16/9);
    Object.assign(player.getIframe().style,{width:`${Math.ceil(width)}px`,height:`${Math.ceil(width*9/16)}px`});
  };
  function stop(){if(ready)player.pauseVideo();onStopped(id);}
  function clear(){generation++;ready=false;loading=false;player?.destroy();player=undefined;host.replaceChildren();}
  async function create(){
    loading=true;const token=generation,selected=id;
    try{
      const YT=await loadYouTube(env);
      if(token!==generation)return;
      if(!wanted){loading=false;return;}
      const mount=host.ownerDocument.createElement('div');host.replaceChildren(mount);
      player=new YT.Player(mount,{
        host:'https://www.youtube-nocookie.com',videoId:selected,width:640,height:360,
        playerVars:{autoplay:0,mute:1,controls:0,disablekb:1,playsinline:1,loop:1,playlist:selected,rel:0,origin:env.location.origin},
        events:{
          onReady:event=>{
            if(token!==generation){event.target.destroy();return;}
            player=event.target;ready=true;
            const frame=player.getIframe();frame.tabIndex=-1;frame.title=`Vídeo de fundo · ${title}`;
            frame.setAttribute('aria-hidden','true');frame.setAttribute('allow','autoplay; encrypted-media');fit();sync();
          },
          onStateChange:event=>{
            if(token!==generation)return;
            if(event.data===1){if(wanted)onPlaying(selected);else stop();}
            else onStopped(selected);
          },
          onAutoplayBlocked:()=>fail(),onError:()=>fail()
        }
      });
      function fail(){if(token!==generation)return;wanted=false;stop();onError(selected);}
    }catch{if(token===generation){loading=false;wanted=false;onError(selected);}}
  }
  function sync(){if(ready){if(wanted){player.mute();player.playVideo();}else stop();}}
  if(env.ResizeObserver)new env.ResizeObserver(fit).observe(visual);
  env.addEventListener?.('resize',fit);
  return {update(next){
    if(next.id!==id){clear();id=next.id||'';title=next.title||'';onStopped(id);}
    wanted=!!id&&!!next.play;
    if(!id)return;
    if(!player&&!loading&&wanted)create();else sync();
  }};
}
