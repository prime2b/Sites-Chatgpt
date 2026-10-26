export function initUnitPhotos(root) {
  const photos=JSON.parse(root.querySelector('[data-unit-photo-data]').textContent);
  const q=s=>root.querySelector(s);
  const image=q('[data-unit-photo-main]'),stage=q('.unit-photo-stage');
  let active=0,pointer;
  function show(index){
    active=((index%photos.length)+photos.length)%photos.length;
    const photo=photos[active],large=photo.variants.large,small=photo.variants.small;
    image.width=large.width;image.height=large.height;image.alt=photo.alt;
    image.srcset=`/assets/${small.file} ${small.width}w, /assets/${large.file} ${large.width}w`;
    image.src=`/assets/${large.file}`;
    const title=`${photo.city} · ${photo.title}`;
    q('[data-unit-photo-count]').textContent=`${String(active+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    stage.setAttribute('aria-label',`${title}, ${active+1} de ${photos.length}`);
  }
  q('[data-unit-photo-prev]').addEventListener('click',()=>show(active-1));
  q('[data-unit-photo-next]').addEventListener('click',()=>show(active+1));
  root.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||!event.target.closest('button'))return;
    const next=event.key==='ArrowLeft'?active-1:event.key==='ArrowRight'?active+1:event.key==='Home'?0:event.key==='End'?photos.length-1:null;
    if(next===null)return;event.preventDefault();show(next);
  });
  stage.addEventListener('pointerdown',event=>pointer={id:event.pointerId,x:event.clientX,y:event.clientY});
  stage.addEventListener('pointerup',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;pointer=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)show(active+(dx<0?1:-1));
  });
  stage.addEventListener('pointercancel',()=>pointer=null);
}
if(typeof document!=='undefined')document.querySelectorAll('[data-units-gallery]').forEach(initUnitPhotos);
