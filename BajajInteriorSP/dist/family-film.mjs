import {loadYouTube} from './dominar-youtube.mjs';

// Only the home institutional film; other video players keep their existing behavior.
export function initFamilyFilm(root,env=window,load=loadYouTube) {
  const button=root.querySelector('[data-film-toggle]');
  if(!button)return;
  const play=root.querySelector('[data-film-play]'),pause=root.querySelector('[data-film-pause]');
  const label=root.querySelector('[data-film-label]'),status=root.querySelector('[data-film-status]');
  let player,ready=false,intent=null;
  function render(playing){
    play.toggleAttribute('hidden',playing);pause.toggleAttribute('hidden',!playing);
    label.textContent=playing?'Pause':'Play';
    button.setAttribute('aria-label',playing?'Pausar vídeo':'Reproduzir vídeo');
  }
  function fail(){
    intent=false;
    if(ready)player.pauseVideo();
    button.hidden=true;
    status.textContent='Não foi possível carregar o player. Use o link Assistir no YouTube.';
    status.hidden=false;
  }
  button.addEventListener('click',()=>{
    intent=!(intent??false);
    render(intent);
    if(ready){if(intent)player.playVideo();else player.pauseVideo();}
  });
  async function start(){
    button.hidden=false;
    try {
      const YT=await load(env);
      player=new YT.Player(root.querySelector('.family-dominar-video'),{
        host:'https://www.youtube-nocookie.com',
        events:{
          onReady:event=>{
            player=event.target;ready=true;
            if(intent===true)player.playVideo();
            else if(intent===false)player.pauseVideo();
          },
          onStateChange:event=>{
            if(event.data===1){intent=true;render(true);}
            else if(event.data===0||event.data===2){intent=false;render(false);}
          },
          onAutoplayBlocked:()=>{intent=false;render(false);},
          onError:fail
        }
      });
    }catch{fail();}
  }
  if(env.IntersectionObserver){
    const observer=new env.IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();start();}
    },{rootMargin:'250px'});
    observer.observe(root);
  }else start();
}
if(typeof document!=='undefined'){
  const root=document.querySelector('.brand-film');
  if(root)initFamilyFilm(root);
}
