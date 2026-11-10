export const MIN_BUDGET=16500,MAX_BUDGET=27490;
export const offerMoney=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value).replace(/\u00a0/g,' ');

export function filterOffers(models,{line='all',budget=MAX_BUDGET,order='asc'}={}){
 return models.filter(model=>(line==='all'||model.line===line)&&model.price<=budget).sort((a,b)=>order==='desc'?b.price-a.price:a.price-b.price);
}

export function offerContactURL(models,units,modelId,unitId){
 const model=models.find(item=>item.id===modelId),unit=units.find(item=>item.id===unitId);
 if(!model)throw Error('Modelo indisponível.');
 if(!unit||!['5517992606039','5514996448094'].includes(unit.phone))throw Error('Escolha Rio Preto ou Bauru.');
 const message=`Olá! Quero consultar disponibilidade e condições da ${model.name} (${offerMoney(model.price)}).`;
 return `https://wa.me/${unit.phone}?text=${encodeURIComponent(message)}`;
}

export function initOffers(root,config){
 const {models,units}=config,q=selector=>root.querySelector(selector),all=selector=>[...root.querySelectorAll(selector)];
 const cards=new Map(all('[data-offer-card]').map(card=>[card.dataset.offerCard,card]));
 const nodes=new Map(all('[data-offer-node]').map(node=>[node.dataset.offerNode,node]));
 const range=q('#offers-budget'),grid=q('#offers-grid'),empty=q('[data-offers-empty]');
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 let state={line:'all',budget:MAX_BUDGET,order:'asc'},renderedLine='all',renderedOrder='asc',selectedUnit='';
 try{const stored=localStorage.getItem('interiorsp.unit.v1');if(units.some(unit=>unit.id===stored))selectedUnit=stored;}catch{}

 function syncRadio(group,attribute,value){
  group.querySelectorAll('[role="radio"]').forEach(button=>{const selected=button.dataset[attribute]===value;button.setAttribute('aria-checked',String(selected));button.tabIndex=selected?0:-1;});
 }
 function render(animate=true){
  const visible=filterOffers(models,state),visibleIds=new Set(visible.map(model=>model.id));
  const orderChanged=state.order!==renderedOrder,selectionChanged=state.line!==renderedLine;
  if(orderChanged){const ordered=[...models].sort((a,b)=>state.order==='desc'?b.price-a.price:a.price-b.price);grid.append(...ordered.map(model=>cards.get(model.id)));}
  for(const model of models){
   const card=cards.get(model.id),wasHidden=card.hidden;
   card.hidden=!visibleIds.has(model.id);
   if(card.hidden)card.getAnimations?.().forEach(animation=>animation.cancel());
   if(animate&&!card.hidden&&(wasHidden||orderChanged||selectionChanged)&&!reduced()&&card.animate){card.getAnimations?.().forEach(animation=>animation.cancel());card.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});}
   nodes.get(model.id).classList.toggle('is-over-budget',model.price>state.budget);
  }
  grid.hidden=visible.length===0;empty.hidden=visible.length!==0;
  range.value=String(state.budget);range.setAttribute('aria-valuetext',offerMoney(state.budget));
  root.style.setProperty('--offer-budget-progress',`${(state.budget-MIN_BUDGET)/(MAX_BUDGET-MIN_BUDGET)*100}%`);
  q('[data-offer-budget-value]').textContent=offerMoney(state.budget);
  q('[data-offer-count]').textContent=`${visible.length} ${visible.length===1?'modelo':'modelos'}`;
  syncRadio(q('.offers-lines'),'offerLine',state.line);syncRadio(q('.offers-sort-options'),'offerOrder',state.order);
  renderedLine=state.line;renderedOrder=state.order;
 }
 for(const button of all('[data-offer-line]'))button.addEventListener('click',()=>{state.line=button.dataset.offerLine;render();});
 for(const button of all('[data-offer-order]'))button.addEventListener('click',()=>{state.order=button.dataset.offerOrder;render();});
 for(const group of all('[role="radiogroup"]'))group.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  const buttons=[...group.querySelectorAll('[role="radio"]')],current=buttons.indexOf(event.target);if(current<0)return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+buttons.length)%buttons.length;
  buttons[next].click();buttons[next].focus();
 });
 range.addEventListener('input',()=>{state.budget=Number(range.value);render();});
 q('[data-offers-reset]').addEventListener('click',()=>{state={...state,line:'all',budget:MAX_BUDGET};render();q('[data-offer-line="all"]').focus();});

 function highlight(id,on){cards.get(id)?.classList.toggle('is-highlighted',on);nodes.get(id)?.classList.toggle('is-highlighted',on);}
 for(const [id,element] of [...cards,...nodes]){
  element.addEventListener('pointerenter',()=>highlight(id,true));element.addEventListener('pointerleave',()=>highlight(id,false));
  element.addEventListener('focusin',()=>highlight(id,true));element.addEventListener('focusout',event=>{if(!element.contains(event.relatedTarget))highlight(id,false);});
 }
 for(const [id,node] of nodes)node.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const model=models.find(item=>item.id===id);
  if(model.price>state.budget||(state.line!=='all'&&state.line!==model.line)){
   state={...state,line:state.line==='all'||state.line===model.line?state.line:'all',budget:Math.max(state.budget,model.price)};render();
  }
 });

 // All purchase links use the shared capture; no direct WhatsApp bypass.
 document.addEventListener('interiorsp:unit-selected',event=>{
  if(!units.some(unit=>unit.id===event.detail?.unit))return;
  selectedUnit=event.detail.unit;
 });
 window.addEventListener('storage',event=>{
  if(event.key!=='interiorsp.unit.v1')return;
  selectedUnit=units.some(unit=>unit.id===event.newValue)?event.newValue:'';
 });
 render(false);
 return {getState:()=>({...state}),getUnit:()=>selectedUnit};
}

if(typeof document!=='undefined'){
 const root=document.querySelector('[data-offers-catalog]'),config=document.querySelector('#offers-data');
 if(root&&config)initOffers(root,JSON.parse(config.textContent));
}
