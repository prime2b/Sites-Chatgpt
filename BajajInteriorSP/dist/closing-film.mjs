import {backgroundYouTube} from './dominar-youtube.mjs';

export function initClosingFilm(root,env=window) {
  const reduce=env.matchMedia('(prefers-reduced-motion:reduce)');
  const doc=root.ownerDocument;
  let visible=false,failed=false;
  const player=backgroundYouTube({
    env,hero:root,videoId:root.dataset.closingYoutube,target:'closing-youtube-player',
    title:root.dataset.closingTitle,
    onPlaying:()=>root.classList.add('is-playing'),
    onError:()=>{failed=true;root.classList.remove('is-playing');}
  });
  function sync(){
    const play=visible&&!doc.hidden&&!reduce.matches&&!env.navigator.connection?.saveData&&!failed;
    if(!play)root.classList.remove('is-playing');
    player.update(play);
  }
  if(env.IntersectionObserver)new env.IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.08}).observe(root);
  else{visible=true;sync();}
  doc.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',sync);
  env.navigator.connection?.addEventListener?.('change',sync);
}

if(typeof document!=='undefined')document.querySelectorAll('[data-closing-youtube]').forEach(root=>initClosingFilm(root));
