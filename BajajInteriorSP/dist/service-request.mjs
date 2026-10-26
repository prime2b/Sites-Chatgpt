import {whatsappURL} from './core.mjs';
export function requestURL(data,{kind,model='',unit,intent,date='',detail=''}) {
 const type=kind==='test-ride'?'test':['revisao','manutencao','pecas','acessorios','garantia'].includes(intent)?intent:'revisao';
 if(model&&!data.models.some(m=>m.id===model))throw new Error('Confira o modelo escolhido.');
 const url=new URL(whatsappURL(data,{unit,model,intent:type}));
 const extra=[];
 if(kind==='test-ride'&&date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Confira a data de preferência.');const [y,m,d]=date.split('-');extra.push(`Data de preferência: ${d}/${m}/${y}. Aguardo confirmação da equipe.`);}
 const note=String(detail).trim().slice(0,500);if(note)extra.push(`Minha necessidade: ${note}`);
 url.searchParams.set('text',[url.searchParams.get('text'),...extra].join(' '));return url.href;
}
if(typeof document!=='undefined'){
 const form=document.querySelector('[data-service-form]');
 if(form){
  const data=await fetch('/data.json').then(r=>r.json()),unit=form.elements.unit,error=form.querySelector('[data-service-error]'),fallback=form.querySelector('[data-service-fallback]'),link=form.querySelector('[data-service-link]');
  try{const saved=localStorage.getItem('interiorsp.unit.v1');if(data.units.some(u=>u.id===saved))unit.value=saved;}catch{}
  document.addEventListener('interiorsp:unit-selected',event=>{unit.value=event.detail.unit;fallback.hidden=true;});
  form.addEventListener('input',()=>{fallback.hidden=true;error.hidden=true;});
  unit.addEventListener('change',()=>{if(data.units.some(u=>u.id===unit.value)){try{localStorage.setItem('interiorsp.unit.v1',unit.value);}catch{}document.dispatchEvent(new CustomEvent('interiorsp:unit-change',{detail:{unit:unit.value}}));}});
  form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;
   const values=Object.fromEntries(new FormData(form));
   try{const url=requestURL(data,{...values,kind:form.dataset.serviceForm});link.href=url;fallback.hidden=false;error.hidden=true;window.open(url,'_blank','noopener');window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'whatsapp_click',intent:form.dataset.serviceForm==='test-ride'?'test':values.intent,model:values.model,unit:values.unit});}
   catch(e){error.textContent=e.message;error.hidden=false;}
  });
 }
}
