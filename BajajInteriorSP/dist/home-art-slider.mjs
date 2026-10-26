export function initArtGallery(root){
 const slides=[...root.querySelectorAll('[data-art-slide]')];
 if(slides.length<2)return;
 const count=root.querySelector('[data-art-count]'),status=root.querySelector('[data-art-status]');
 let selected=0,request=0,start,swiped=false;
 root.querySelector('[data-art-controls]').hidden=false;
 async function show(index){
  selected=(index+slides.length)%slides.length;
  const target=selected,version=++request,img=slides[target].querySelector('img');
  root.setAttribute('aria-busy','true');img.loading='eager';
  try{await img.decode();}
  catch{if(version===request){status.textContent='Não foi possível carregar esta arte. Tente navegar novamente.';root.removeAttribute('aria-busy');}return;}
  if(version!==request)return;
  slides.forEach((slide,i)=>{slide.hidden=i!==target;});
  count.textContent=`${String(target+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  status.textContent='';root.removeAttribute('aria-busy');
 }
 root.querySelector('[data-art-prev]').addEventListener('click',()=>show(selected-1));
 root.querySelector('[data-art-next]').addEventListener('click',()=>show(selected+1));
 root.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  show(event.key==='Home'?0:event.key==='End'?slides.length-1:selected+(event.key==='ArrowRight'?1:-1));
 });
 const stage=root.querySelector('.campaign-stage');
 stage.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0){swiped=false;start={x:event.clientX,y:event.clientY,id:event.pointerId};}});
 stage.addEventListener('pointercancel',()=>{start=null;});
 stage.addEventListener('click',event=>{if(swiped){event.preventDefault();event.stopPropagation();swiped=false;}},true);
 stage.addEventListener('pointerup',event=>{
  if(!start||event.pointerId!==start.id)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3){swiped=true;show(selected+(dx<0?1:-1));}
 });
}
if(typeof document!=='undefined')document.querySelectorAll('[data-art-gallery]').forEach(initArtGallery);
