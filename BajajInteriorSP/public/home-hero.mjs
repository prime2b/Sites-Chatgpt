import {heroYouTube} from './home-hero-video.mjs';
import {simulationPath} from './commercial-context.mjs';
/* Manual home carousel. Model content is generated from the shared data.json. */
export function heroSlide(models, index) {
  const position = ((index % models.length) + models.length) % models.length;
  const model = models[position];
  return {position, model, film:!!(model.media?.src || model.media?.youtube), page:true};
}
export function swipeDirection(dx, dy) {
  return Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.4 ? (dx < 0 ? 1 : -1) : 0;
}
export function filmAllowed({film, visible, hidden, reduced, saveData, failed}) {
  return film && visible && !hidden && !reduced && !saveData && !failed;
}
export function initHero(root, models, env = window) {
  const q = s => root.querySelector(s), thumbs = [...root.querySelectorAll('[data-hero-index]')];
  const stage = q('.showroom-stage'), video = q('[data-hero-video]'), film = q('[data-hero-film]');
  const product = q('[data-hero-product]'), contact = q('[data-hero-contact]'), page = q('[data-hero-link]');
  const simulation = q('[data-hero-simulation]'), units = root.dataset.heroUnitIds.split(' ').map(id=>({id}));
  let selectedUnit='';try{selectedUnit=env.localStorage.getItem('interiorsp.unit.v1')||'';}catch{}
  const reduced = env.matchMedia('(prefers-reduced-motion:reduce)');
  let current = heroSlide(models, Number(root.dataset.heroInitial)), visible = false, pointer, playbackRequest=0;
  let userPlay=false;
  const play=q('[data-hero-play]'),watch=q('[data-hero-watch]');
  const failed=new Set(), poster=q('[data-hero-poster]'), youtubeHost=q('[data-hero-youtube]');
  const youtube=heroYouTube({env,host:youtubeHost,visual:q('.showroom-visual'),
    onPlaying:id=>{if(id===current.model.media?.youtube)root.classList.add('is-playing');},
    onStopped:id=>{if(id===current.model.media?.youtube)root.classList.remove('is-playing');},
    onError:id=>{if(id===current.model.media?.youtube){failed.add(current.model.id);root.classList.remove('is-playing');}}
  });
  function syncFilm() {
    const request=++playbackRequest;
    const media=current.model.media||{};
    const allowed=filmAllowed({film:current.film,visible,hidden:root.ownerDocument.hidden,reduced:reduced.matches&&!userPlay,saveData:env.navigator.connection?.saveData&&!userPlay,failed:failed.has(current.model.id)});
    youtube.update({id:media.youtube||'',title:current.model.name,play:allowed});
    youtubeHost.hidden=!media.youtube;
    video.hidden=!media.src;
    if (!allowed || !media.src) {
      video.pause();
      if(!allowed)root.classList.remove('is-playing');
      return;
    }
    const source = video.querySelector('source');
    if (source.getAttribute('src')!==media.src) {source.src = media.src;delete source.dataset.src;video.load();}
    video.muted = true;
    video.play().catch(() => {if(request===playbackRequest)root.classList.remove('is-playing');});
  }
  function animate(element) {
    if (!reduced.matches) element.animate?.([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'ease-out'});
  }
  function show(index, manual = true) {
    root.classList.remove('is-playing');
    current = heroSlide(models, index);userPlay=false;
    const {model,position} = current;
    root.dataset.heroMode = current.film ? 'film' : 'photo';
    root.dataset.heroActive = String(position);
    stage.setAttribute('aria-label', `${model.name}, ${position + 1} de ${models.length}`);
    q('[data-hero-name]').textContent = model.name;
    q('[data-hero-benefit]').textContent = model.commercial.headline;
    q('[data-hero-description]').textContent = model.commercial.description;
    q('[data-hero-counter]').textContent = `${String(position+1).padStart(2,'0')} / ${String(models.length).padStart(2,'0')}`;
    q('[data-hero-credit]').textContent = `${current.film ? 'Filme' : 'Imagem'} oficial Bajaj · ${model.name}`;
    contact.dataset.model = model.id;
    contact.hidden = false;
    contact.setAttribute('aria-label',`Falar com a BIA sobre a ${model.name}`);
    page.hidden = false;
    page.href = `/motos/${model.id}/`;
    page.firstChild.textContent = 'Conhecer a moto ';
    page.setAttribute('aria-label',`Conhecer a ${model.name}`);
    simulation.dataset.simulateModel=model.id;
    simulation.href=simulationPath({models,units},model.id,selectedUnit);
    simulation.setAttribute('aria-label',`Simular minha ${model.name}`);
    film.hidden = !current.film;
    poster.src=model.media?.poster||`/assets/${model.catalogImage}`;
    video.poster=poster.src;
    root.dataset.heroVideoType=model.media?.youtube?'youtube':'native';
    play.hidden=!current.film;watch.hidden=!model.media?.source?.startsWith('https://');if(!watch.hidden)watch.href=model.media.source;
    product.hidden = true;
    if (!current.film) {
      product.dataset.model = model.id;
      product.width = model.catalogWidth;product.height = model.catalogHeight;
      product.src = `/assets/${model.catalogImage}`;
      if (product.complete && product.naturalWidth) product.hidden = false;
    }
    thumbs.forEach((button,i) => button.setAttribute('aria-pressed',String(i === position)));
    if (manual) {
      q('[data-hero-announcement]').textContent = `${model.name}. Destaque ${position + 1} de ${models.length}.`;
      animate(q('.showroom-content'));
    }
    // Reveal the selected thumbnail within its tray, including the initial mobile view.
    const tray = q('.showroom-models'), selected = thumbs[position];
    if (tray.scrollWidth > tray.clientWidth) {
      const x = selected.offsetLeft - (tray.clientWidth - selected.offsetWidth) / 2;
      tray.scrollTo({left:x,behavior:!manual || reduced.matches?'instant':'smooth'});
    }
    syncFilm();
  }
  product.addEventListener('load', () => {
    if (!current.film && product.dataset.model === current.model.id) {product.hidden = false;animate(product);}
  });
  video.addEventListener('playing', () => {
    if (current.model.media?.src && visible && !root.ownerDocument.hidden && (!reduced.matches||userPlay) && (!env.navigator.connection?.saveData||userPlay) && !failed.has(current.model.id)) root.classList.add('is-playing');
    else syncFilm();
  });
  video.addEventListener('pause', () => {if(current.model.media?.src)root.classList.remove('is-playing');});
  video.addEventListener('error', () => {if(current.model.media?.src){failed.add(current.model.id);root.classList.remove('is-playing');}});
  play?.addEventListener('click',()=>{userPlay=true;failed.delete(current.model.id);syncFilm();});
  q('[data-hero-previous]').addEventListener('click', () => show(current.position - 1));
  q('[data-hero-next]').addEventListener('click', () => show(current.position + 1));
  thumbs.forEach((button,i) => button.addEventListener('click', () => show(i)));
  root.addEventListener('keydown', event => {
    if (!event.target.closest('.showroom-controls,.showroom-models')) return;
    const next = event.key === 'ArrowRight' ? current.position + 1 : event.key === 'ArrowLeft' ? current.position - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? models.length - 1 : null;
    if (next === null) return;
    event.preventDefault();show(next);
    if (event.target.closest('.showroom-models')) thumbs[current.position].focus({preventScroll:true});
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.target.closest('a,button')) pointer={x:event.clientX,y:event.clientY,id:event.pointerId};
  });
  stage.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const delta=swipeDirection(event.clientX-pointer.x,event.clientY-pointer.y);pointer=null;
    if (delta) show(current.position+delta);
  });
  stage.addEventListener('pointercancel',()=>pointer=null);
  root.ownerDocument.addEventListener('visibilitychange',syncFilm);
  root.ownerDocument.addEventListener('interiorsp:unit-selected',event=>{selectedUnit=event.detail.unit;simulation.href=simulationPath({models,units},current.model.id,selectedUnit);});
  env.addEventListener?.('pageshow',syncFilm);
  env.addEventListener?.('pagehide',()=>{playbackRequest++;video.pause();youtube.update({id:current.model.media?.youtube||'',title:current.model.name,play:false});root.classList.remove('is-playing');});
  reduced.addEventListener('change',syncFilm);
  env.navigator.connection?.addEventListener?.('change',syncFilm);
  show(current.position,false);
  if ('IntersectionObserver' in env) {
    new env.IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncFilm();},{threshold:.08}).observe(stage);
  } else {visible=true;syncFilm();}
}
if (typeof document !== 'undefined') {
  const root=document.querySelector('.showroom-hero');
  if (root) initHero(root,JSON.parse(document.getElementById('hero-model-data').textContent));
}
