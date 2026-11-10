export function manualMatches(item,model='',year=''){
 return (!model||item.model===model)&&(!year||item.years.includes(year));
}
if(typeof document!=='undefined'){
 const filter=document.querySelector('[data-manual-filters]'),service=document.querySelector('[data-service-form]');
 if(filter){
  const model=filter.elements.modelo,year=filter.elements.ano,cards=[...document.querySelectorAll('[data-manual-model]')],count=document.querySelector('[data-manual-count]'),empty=document.querySelector('[data-manual-empty]');
  const params=new URLSearchParams(location.search);
  if([...model.options].some(o=>o.value===params.get('modelo')))model.value=params.get('modelo');
  if([...year.options].some(o=>o.value===params.get('ano')))year.value=params.get('ano');
  function update(){
   let visible=0;
   cards.forEach(card=>{card.hidden=!manualMatches({model:card.dataset.manualModel,years:card.dataset.manualYears.split(' ')},model.value,year.value);if(!card.hidden)visible++;});
   count.textContent=visible===1?'1 documento disponível':visible+' documentos disponíveis';empty.hidden=visible!==0;
  }
  filter.addEventListener('submit',event=>{event.preventDefault();update();});
  filter.addEventListener('change',update);filter.addEventListener('reset',()=>setTimeout(update,0));update();
  document.querySelector('[data-manual-help]')?.addEventListener('click',()=>{
   if(service){service.elements.model.value=model.value;service.elements.model_year.value=year.value;service.elements.intent.value='garantia';service.dispatchEvent(new Event('change',{bubbles:true}));}
  });
 }
 document.querySelectorAll('[data-service-choice]').forEach(link=>link.addEventListener('click',()=>{
  if(service){service.elements.intent.value=link.dataset.serviceChoice;service.dispatchEvent(new Event('change',{bubbles:true}));}
 }));
 if(service&&service.dataset.serviceForm==='pos-venda'){
  const date=service.elements.date;
  if(date){
   const row=date.closest('[data-service-date-row]');
   function syncDate(){const accepts=['revisao','manutencao'].includes(service.elements.intent.value);if(row)row.hidden=!accepts;date.disabled=!accepts;}
   service.addEventListener('change',syncDate);syncDate();
  }
 }
}
