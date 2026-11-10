export const wrapFrame=(frame,count)=>((Math.round(frame)%count)+count)%count;
export const frameForColor=(frame,oldCount,newCount)=>wrapFrame(frame/oldCount*newCount,newCount);

// Keep network/decode pressure bounded, and switch colors only when complete.
export async function loadSequence(sources,load,{concurrency=4}={}){
  const frames=Array(sources.length);let next=0;
  await Promise.all(Array.from({length:Math.min(concurrency,sources.length)},async()=>{
    while(next<sources.length){const index=next++;frames[index]=await load(sources[index]);}
  }));
  return frames;
}

export function initSpin(root,config,env=globalThis){
  const q=s=>root.querySelector(s);
  const stage=q('[data-spin-stage]'),picture=q('[data-spin-image]');
  const previous=q('[data-spin-prev]'),next=q('[data-spin-next]'),range=q('[data-spin-range]');
  const activate=q('[data-spin-activate]'),status=q('[data-spin-status]'),angle=q('[data-spin-angle]');
  const buttons=[...root.querySelectorAll('[data-spin-color]')];
  let colorIndex=0,frame=0,ready=false,generation=0,loading=false,pendingIndex=0,drag=null;
  const cache=new Map(),inFlight=new Map();
  const load=src=>new Promise((resolve,reject)=>{
    const image=new env.Image();let settled=false;
    const timer=env.setTimeout(()=>finish(new Error('timeout')),20000);
    const finish=error=>{
      if(settled)return;settled=true;env.clearTimeout(timer);
      image.onload=null;image.onerror=null;
      error?reject(error):resolve(image);
    };
    image.onload=()=>finish();image.onerror=()=>finish(new Error('image'));
    image.src=src;
  });
  const controls=()=>{
    const still=config.colors[colorIndex].frames.length===1;
    previous.disabled=next.disabled=range.disabled=!ready||loading||still;
    q('[data-spin-controls]').hidden=still;
    activate.disabled=loading;
    stage.dataset.spinReady=String(ready&&!loading);
    root.setAttribute('aria-busy',String(loading));
  };
  const render=()=>{
    const color=config.colors[colorIndex];frame=wrapFrame(frame,color.frames.length);
    picture.src=color.frames[frame];picture.width=color.width;picture.height=color.height;
    picture.alt=`${config.name} · ${color.label} · vista de produto`;
    const degrees=Math.round(frame/color.frames.length*360);
    angle.textContent=color.frames.length===1?'Foto oficial':`${degrees}°`;range.max=String(color.frames.length-1);range.value=String(frame);
    range.setAttribute('aria-valuetext',`${degrees} graus`);
    buttons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===colorIndex)));
  };
  async function selectColor(index){
    if(index<0||index>=config.colors.length)return false;
    if(ready&&!loading&&index===colorIndex)return true;
    const request=++generation;pendingIndex=index;loading=true;drag=null;controls();
    status.textContent='Carregando os ângulos da moto…';activate.textContent='Carregando giro…';
    const selected=config.colors[index];
    try{
      if(!cache.has(index)){
        if(!inFlight.has(index))inFlight.set(index,
          loadSequence(selected.frames,load).then(images=>cache.set(index,images)).finally(()=>inFlight.delete(index)));
        await inFlight.get(index);
      }
      if(request!==generation)return false;
      const oldCount=config.colors[colorIndex].frames.length;
      frame=frameForColor(frame,oldCount,selected.frames.length);colorIndex=index;ready=true;render();
      status.textContent=selected.frames.length===1?`${selected.label}. Foto oficial desta cor; giro 360° indisponível para esta seleção.`:`${selected.label}. Giro pronto. Arraste a moto ou use as setas.`;
      activate.hidden=true;
      return true;
    }catch{
      if(request!==generation)return false;
      // Keep the previous complete sequence or the original static image.
      status.textContent='Não foi possível carregar o giro. A imagem anterior continua disponível. Tente novamente.';
      activate.textContent='Tentar carregar novamente';activate.hidden=false;
      return false;
    }finally{
      if(request===generation){loading=false;controls();}
    }
  }
  const step=delta=>{if(ready&&!loading){frame+=delta;render();}};
  activate.hidden=false;q('[data-spin-controls]').hidden=false;
  buttons.forEach((button,index)=>{button.disabled=false;button.addEventListener('click',()=>selectColor(index));});
  activate.addEventListener('click',()=>selectColor(pendingIndex));
  previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  range.addEventListener('input',()=>{if(ready&&!loading){frame=Number(range.value);render();}});
  stage.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key))return;
    event.preventDefault();
    if(!ready){if(!loading)selectColor(colorIndex);return;}
    if(loading)return;
    if(event.key==='ArrowLeft')step(-1);
    if(event.key==='ArrowRight')step(1);
    if(event.key==='Home'){frame=0;render();}
    if(event.key==='End'){frame=config.colors[colorIndex].frames.length-1;render();}
  });
  stage.addEventListener('pointerdown',event=>{
    if(event.isPrimary===false||(event.button!==undefined&&event.button!==0))return;
    if(!ready){if(!loading)selectColor(colorIndex);return;}
    if(loading)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,frame};
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId||loading)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(Math.abs(dx)<6||Math.abs(dx)<Math.abs(dy))return;
    event.preventDefault();
    const width=stage.getBoundingClientRect().width;
    frame=drag.frame-Math.round(dx/Math.max(10,width/config.colors[colorIndex].frames.length));render();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,()=>{drag=null;});
  controls();
  return {selectColor,step,getState:()=>({colorIndex,frame,ready,loading})};
}

if(typeof document!=='undefined')for(const root of document.querySelectorAll('[data-product-spin]')){
  try{initSpin(root,JSON.parse(root.querySelector('[data-spin-config]').textContent));}catch{/* The static product image remains usable. */}
}
