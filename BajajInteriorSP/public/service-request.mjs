import {whatsappURL} from './core.mjs';
import {requestContact,contactEvent} from './contact-capture.mjs';
export function serviceContext(data,values,kind){
 const {model='',unit,intent='',date='',detail='',model_year='',mileage=''}=values;
 if(!data.units.some(u=>u.id===unit))throw new Error('Escolha Rio Preto ou Bauru.');
 if(model&&!data.models.some(m=>m.id===model))throw new Error('Confira o modelo escolhido.');
 const aftersales=['revisao','manutencao','pecas','acessorios','garantia'];
 const type=kind==='test-ride'?'test':kind==='consorcio'?'consorcio':aftersales.includes(intent)?intent:'revisao';
 const context={intent:type,unit,model,detail:String(detail).trim(),placement:kind==='test-ride'?'test_ride_form':kind==='consorcio'?'consortium_form':'service_form'};
 if(context.detail.length>500)throw new Error('Use até 500 caracteres na descrição.');
 if(date&&['test','revisao','manutencao'].includes(type)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new Error('Confira a data de preferência.');context.date=date;
 }
 if(aftersales.includes(type)){
  if(model_year){const parts=/^(\d{4})\/(\d{4})$/.exec(model_year);if(!parts||Number(parts[1])<1980||Number(parts[2])<Number(parts[1])||Number(parts[2])>Number(parts[1])+1||Number(parts[2])>new Date().getFullYear()+2)throw new Error('Confira o ano de fabricação/modelo, como 2026/2027.');context.model_year=model_year;}
  if(mileage!==''){if(!/^\d{1,6}$/.test(String(mileage)))throw new Error('Informe a quilometragem em km inteiros, de 0 a 999999.');context.mileage=Number(mileage);}
 }
 return context;
}
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
  const data=await fetch('/data.json').then(r=>r.json()),unit=form.elements.unit,error=form.querySelector('[data-service-error]'),fallback=form.querySelector('[data-service-fallback]');
  try{const saved=localStorage.getItem('interiorsp.unit.v1');if(data.units.some(u=>u.id===saved))unit.value=saved;}catch{}
  document.addEventListener('interiorsp:unit-selected',event=>{unit.value=event.detail.unit;if(fallback)fallback.hidden=true;});
  form.addEventListener('input',()=>{if(fallback)fallback.hidden=true;error.hidden=true;});
  unit.addEventListener('change',()=>{if(data.units.some(u=>u.id===unit.value)){try{localStorage.setItem('interiorsp.unit.v1',unit.value);}catch{}document.dispatchEvent(new CustomEvent('interiorsp:unit-change',{detail:{unit:unit.value}}));}});
  form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;
   const values=Object.fromEntries(new FormData(form));
   try{const context={...serviceContext(data,values,form.dataset.serviceForm),trigger:form.querySelector('[type=submit]')};error.hidden=true;contactEvent(window,'contact_cta_click',context);requestContact(context);}
   catch(e){error.textContent=e.message;error.hidden=false;}
  });
 }
}
