export function initArtGallery(root,env=window){
 const slides=[...root.querySelectorAll('[data-art-slide]')];
 if(slides.length<2)return;
 const count=root.querySelector('[data-art-count]'),status=root.querySelector('[data-art-status]'),toggle=root.querySelector('[data-art-toggle]');
 const doc=root.ownerDocument,reduced=env.matchMedia?.('(prefers-reduced-motion: reduce)');
 let selected=0,request=0,start,swiped=false,timer=null,paused=!!reduced?.matches,hovered=false,focused=false,interacting=false;
 let visible=typeof env.IntersectionObserver!=='function';
 root.querySelector('[data-art-controls]').hidden=false;
 function clearTimer(){if(timer!==null){env.clearTimeout(timer);timer=null;}}
 function schedule(){
  clearTimer();
  if(paused||hovered||focused||interacting||!visible||doc.hidden)return;
  timer=env.setTimeout(()=>{timer=null;show(selected+1,true);},5000);
 }
 function updateToggle(){
  if(!toggle)return;
  toggle.setAttribute('aria-label',paused?'Retomar troca automática dos banners':'Pausar troca automática dos banners');
  toggle.querySelector('[data-art-pause]').hidden=paused;
  toggle.querySelector('[data-art-play]').hidden=!paused;
 }
 async function show(index,automatic=false){
  clearTimer();
  selected=(index+slides.length)%slides.length;
  const target=selected,version=++request,img=slides[target].querySelector('img');
  root.setAttribute('aria-busy','true');img.loading='eager';
  try{await img.decode();}
  catch{if(version===request){status.textContent='Não foi possível carregar esta arte. Tente navegar novamente.';root.removeAttribute('aria-busy');schedule();}return;}
  if(version!==request)return;
  slides.forEach((slide,i)=>{slide.hidden=i!==target;});
  count.setAttribute('aria-live',automatic?'off':'polite');
  count.textContent=`${String(target+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  status.textContent='';root.removeAttribute('aria-busy');
  schedule();
 }
 root.querySelector('[data-art-prev]').addEventListener('click',()=>show(selected-1));
 root.querySelector('[data-art-next]').addEventListener('click',()=>show(selected+1));
 root.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  show(event.key==='Home'?0:event.key==='End'?slides.length-1:selected+(event.key==='ArrowRight'?1:-1));
 });
 const stage=root.querySelector('.campaign-stage');
 stage.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0){interacting=true;schedule();swiped=false;start={x:event.clientX,y:event.clientY,id:event.pointerId};}});
 stage.addEventListener('pointercancel',()=>{interacting=false;start=null;schedule();});
 stage.addEventListener('click',event=>{if(swiped){event.preventDefault();event.stopPropagation();swiped=false;}},true);
 stage.addEventListener('pointerup',event=>{
  if(!start||event.pointerId!==start.id)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;interacting=false;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3){swiped=true;show(selected+(dx<0?1:-1));}
  else schedule();
 });
 root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;schedule();}});
 root.addEventListener('pointerleave',()=>{hovered=false;interacting=false;start=null;schedule();});
 root.addEventListener('focusin',event=>{focused=event.target!==toggle;schedule();});
 root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget)){focused=false;schedule();}});
 toggle?.addEventListener('click',()=>{paused=!paused;updateToggle();schedule();});
 doc.addEventListener('visibilitychange',schedule);
 env.addEventListener?.('pagehide',clearTimer);
 env.addEventListener?.('pageshow',schedule);
 reduced?.addEventListener?.('change',()=>{if(reduced.matches){paused=true;updateToggle();}schedule();});
 if(typeof env.IntersectionObserver==='function')new env.IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(root);
 updateToggle();schedule();
}
if(typeof document!=='undefined')document.querySelectorAll('[data-art-gallery]').forEach(root=>initArtGallery(root));
