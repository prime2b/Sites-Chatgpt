export function createFreshness({load,apply,stale,failed,env=window}){
 let timer=null,serial=0,stopped=false;
 function schedule(delay){if(timer)env.clearTimeout(timer);if(!stopped)timer=env.setTimeout(refresh,Math.max(100,Math.min(60000,Number(delay)||30000)));}
 async function refresh(){
  const token=++serial;if(stopped)return;stale();const start=env.performance?.now()||0;
  try{const data=await load();if(stopped||token!==serial)return;const duration=Number(data.refresh_after_ms);if(!Number.isFinite(duration)||duration<=0)throw Error('Validade de atualização indisponível.');const remaining=duration-((env.performance?.now()||0)-start);if(remaining>0){apply(data);schedule(remaining);}else schedule(100);}
  catch(error){if(!stopped&&token===serial){failed(error);schedule(10000);}}
 }
 return {start:schedule,refresh,stop(){stopped=true;serial++;if(timer)env.clearTimeout(timer);},resume(){stopped=false;return refresh();}};
}
export function bindCommerceDetails(root,env=window){
 const doc=root.ownerDocument;
 root.querySelectorAll('[data-campaign-option]').forEach(input=>input.addEventListener('change',()=>{const button=root.querySelector('.commerce-condition-contact');if(button)button.dataset.campaignOption=input.value;}));
 const gallery=root.querySelector('[data-stock-gallery]');if(!gallery)return;
 const buttons=[...gallery.querySelectorAll('[data-stock-photo]')],main=gallery.querySelector('[data-stock-main]'),count=gallery.querySelector('[data-stock-count]'),dialog=root.querySelector('#stock-photo-dialog'),full=dialog?.querySelector('[data-stock-full]');let active=0,returnFocus=null;
 if(!main||!buttons.length||!dialog)return;
 function show(index,focus=false){active=(index+buttons.length)%buttons.length;const button=buttons[active];main.src=button.dataset.stockPhoto;main.alt=button.dataset.stockAlt;main.hidden=false;buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===active));b.tabIndex=i===active?0:-1;});count.textContent=`Foto ${active+1} de ${buttons.length}`;if(focus)button.focus();if(dialog.open){full.src=main.src;full.alt=main.alt;dialog.querySelector('[data-stock-full-count]').textContent=count.textContent;}}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>show(i)));
 gallery.querySelector('.stock-gallery-thumbs').addEventListener('keydown',event=>{const index=buttons.indexOf(event.target);if(index<0)return;const next=event.key==='ArrowRight'?index+1:event.key==='ArrowLeft'?index-1:event.key==='Home'?0:event.key==='End'?buttons.length-1:null;if(next!==null){event.preventDefault();show(next,true);}});
 main.addEventListener('error',()=>{main.hidden=true;count.textContent='Esta foto está indisponível. Selecione outra imagem.';});
 gallery.querySelector('[data-stock-zoom]').addEventListener('click',event=>{returnFocus=event.currentTarget;dialog.showModal();doc.body.classList.add('locked');show(active);});
 dialog.querySelector('[data-stock-close]').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-stock-prev]')?.addEventListener('click',()=>show(active-1));
 dialog.querySelector('[data-stock-next]')?.addEventListener('click',()=>show(active+1));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(active+(event.key==='ArrowLeft'?-1:1));}});
 dialog.addEventListener('close',()=>{doc.body.classList.remove('locked');returnFocus?.focus();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 show(0);
}
export function initCommerce(root,env=window){
 const doc=root.ownerDocument,live=root.querySelector('[data-commerce-live]');if(!live)return;
 bindCommerceDetails(live,env);if(doc.querySelector('.commerce-preview-bar'))return;
 const status=doc.createElement('p');status.className='commerce-refresh-status';status.setAttribute('role','status');status.hidden=true;root.prepend(status);
 let selection=null,revision=null,lastMarkup=null;
 const controller=createFreshness({env,
  async load(){const response=await env.fetch(root.dataset.commerceEndpoint,{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw Error('Não foi possível atualizar as condições.');return response.json();},
  stale(){selection=live.querySelector('[data-campaign-option]:checked')?.value;revision=live.querySelector('[data-content-revision]')?.dataset.contentRevision;status.classList.remove('is-error');live.hidden=false;if(live.querySelector('.stock-detail-grid')){live.classList.add('commerce-checking');live.querySelectorAll('[data-contact]').forEach(button=>button.disabled=true);}else{live.style.visibility='hidden';live.inert=true;}status.hidden=false;status.textContent='Atualizando disponibilidade e condições…';root.setAttribute('aria-busy','true');},
  apply(data){
   if(typeof data.html!=='string')throw Error('Resposta indisponível.');
   if(data.html!==lastMarkup){live.querySelector('dialog[open]')?.close();live.innerHTML=data.html;const button=live.querySelector('[data-content-revision]');if(selection&&revision===button?.dataset.contentRevision){const input=[...live.querySelectorAll('[data-campaign-option]')].find(i=>i.value===selection);if(input){input.checked=true;button.dataset.campaignOption=selection;}}bindCommerceDetails(live,env);lastMarkup=data.html;}
   live.classList.remove('commerce-checking');live.querySelectorAll('[data-contact]').forEach(button=>button.disabled=false);live.hidden=false;live.style.visibility='';live.inert=false;status.hidden=true;root.removeAttribute('aria-busy');
  },
  failed(){live.querySelector('dialog[open]')?.close();live.hidden=true;status.classList.add('is-error');status.hidden=false;status.textContent='As condições não foram confirmadas. ';const retry=doc.createElement('button');retry.type='button';retry.className='text-link';retry.textContent='Tentar atualizar';retry.addEventListener('click',()=>controller.refresh());status.append(retry);root.removeAttribute('aria-busy');},
 });
 // Server HTML is already verified. Keep it visible until its earliest expiry,
 // subtracting the whole navigation duration conservatively without using the civil clock.
 const initialFreshness=Number(root.dataset.commerceRefresh)-(env.performance?.now()||0);
 if(Number.isFinite(initialFreshness)&&initialFreshness>0)controller.start(initialFreshness);else controller.refresh();
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){controller.stop();live.querySelector('dialog[open]')?.close();live.style.visibility='hidden';}else controller.resume();});env.addEventListener('pagehide',()=>{controller.stop();live.querySelector('dialog[open]')?.close();live.style.visibility='hidden';});env.addEventListener('pageshow',event=>{if(event.persisted)controller.resume();});
 return controller;
}
if(typeof document!=='undefined')document.querySelectorAll('[data-commerce-refresh]').forEach(root=>initCommerce(root));
