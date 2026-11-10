// YouTube loads only for eligible background playback or an explicit play click.
let apiPromise;
export function loadYouTube(env=window) {
  if(env.YT?.Player)return Promise.resolve(env.YT);
  if(!apiPromise)apiPromise=new Promise((resolve,reject)=>{
    const previous=env.onYouTubeIframeAPIReady;
    const timeout=env.setTimeout(()=>reject(new Error('YouTube indisponível')),15000);
    env.onYouTubeIframeAPIReady=()=>{env.clearTimeout(timeout);previous?.();resolve(env.YT);};
    const script=env.document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
    script.onerror=()=>{env.clearTimeout(timeout);reject(new Error('YouTube indisponível'));};env.document.head.append(script);
  });
  return apiPromise.catch(error=>{apiPromise=undefined;throw error;});
}
export function backgroundYouTube({env,hero,videoId,target='d4-youtube-hero',title='Dominar 400',onPlaying,onError}) {
  let player,ready=false,loading=false,failed=false,wanted=false;
  const fit=()=>{
    if(!player?.getIframe)return;
    const frame=player.getIframe(),rect=hero.getBoundingClientRect();
    const width=Math.max(rect.width,rect.height*16/9),height=width*9/16;
    frame.style.width=`${Math.ceil(width)}px`;frame.style.height=`${Math.ceil(height)}px`;
  };
  function sync(){if(!ready)return;if(wanted){player.mute();player.playVideo();}else player.pauseVideo();}
  function fail(){failed=true;wanted=false;if(ready)player.pauseVideo();onError();}
  async function create(){
    loading=true;
    try{
      const YT=await loadYouTube(env);
      // Eligibility may have changed while the API was loading.
      if(!wanted){loading=false;return;}
      player=new YT.Player(target,{
        host:'https://www.youtube-nocookie.com',videoId,width:640,height:360,
        playerVars:{autoplay:0,mute:1,controls:0,disablekb:1,playsinline:1,loop:1,playlist:videoId,rel:0,origin:env.location.origin},
        events:{
          onReady:event=>{player=event.target;ready=true;const frame=player.getIframe();frame.tabIndex=-1;frame.title='Vídeo de fundo · '+title;frame.setAttribute('aria-hidden','true');fit();sync();},
          onStateChange:event=>{if(event.data===1){if(wanted)onPlaying();else player.pauseVideo();}},
          onAutoplayBlocked:()=>{player.pauseVideo();onError();},onError:fail
        }
      });
    }catch{fail();}
  }
  if(env.ResizeObserver)new env.ResizeObserver(fit).observe(hero);
  env.addEventListener?.('resize',fit);
  return {update(play){wanted=!!play&&!failed;if(!player&&!loading&&wanted)create();else sync();}};
}
export function initDetailVideo(root,env=window) {
  const link=root.querySelector('[data-d4-watch]');if(!link)return;
  link.addEventListener('click',event=>{
    // Preserve modified clicks and the original href as a native fallback.
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    const frame=root.ownerDocument.createElement('iframe');
    frame.src=`https://www.youtube-nocookie.com/embed/${link.dataset.d4Watch}?autoplay=1&playsinline=1&rel=0`;
    frame.title='Detalhes da '+(link.dataset.d4VideoTitle||'Dominar 400');frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
    frame.referrerPolicy='strict-origin-when-cross-origin';frame.className='d4-detail-player';
    root.querySelector('.d4-video-card').replaceChildren(frame);frame.focus();
  });
}
