import {money,intents} from './core.mjs';
const labels={vendas:'Atendimento de vendas',simulacao:'Simulação de financiamento',test:'Test ride',consorcio:'Consórcio',revisao:'Revisão',manutencao:'Manutenção',pecas:'Peças',acessorios:'Acessórios',garantia:'Garantia'};
const fields=['intent','unit','model','placement'];
export function submissionId(cryptoAPI){
 if(typeof cryptoAPI?.randomUUID==='function')return cryptoAPI.randomUUID();
 if(typeof cryptoAPI?.getRandomValues!=='function')throw Error('Este navegador não consegue validar o envio. Atualize-o ou tente em outro navegador.');
 const bytes=cryptoAPI.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const h=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
export function contactEvent(env,event,context={}){
 const detail={event};for(const key of fields)if(typeof context[key]==='string'&&/^[a-z0-9_-]{1,50}$/.test(context[key]))detail[key]=context[key];
 env.dataLayer=env.dataLayer||[];env.dataLayer.push(detail);
}
export function createContactSubmission(env=window){
 let last=null;
 return {
  reset(){if(last?.pending)throw Error('Aguarde a confirmação do envio.');last=null;},
  async send(payload){
   const serialized=JSON.stringify(payload);
   if(last?.pending){if(last.serialized===serialized)return last.pending;throw Error('Aguarde a confirmação do envio atual.');}
   if(!last||last.serialized!==serialized)last={serialized,key:submissionId(env.crypto),result:null,pending:null};
   const attempt=last;
   if(attempt.result)return attempt.result;
   attempt.pending=(async()=>{
    const controller=new AbortController(),timer=env.setTimeout?.(()=>controller.abort(),15000);
    try{
     const response=await env.fetch('/api/contact',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,idempotency_key:attempt.key}),signal:controller.signal});
     let data;try{data=await response.json();}catch{throw Error('O registro não foi confirmado. Tente novamente com os mesmos dados.');}
     if(!response.ok||data.saved!==true)throw Error(data.error||'O registro não foi confirmado. Tente novamente.');
     if(!data.receipt?.id||!data.receipt?.token)throw Error('O registro não foi confirmado. Tente novamente.');
     if(data.handoff_url){const url=new URL(data.handoff_url);if(url.protocol!=='https:'||url.hostname!=='wa.me'||url.username||url.password||!/^\/55\d{10,11}$/.test(url.pathname))throw Error('Não foi possível confirmar o destino. Tente novamente.');}
     attempt.result=data;return data;
    }catch(error){if(error.name==='AbortError'||error instanceof TypeError)throw Error('Sem confirmação de conexão. Mantenha os dados e tente novamente; o reenvio não duplica a solicitação.');throw error;}
    finally{if(timer)env.clearTimeout?.(timer);attempt.pending=null;}
   })();
   return attempt.pending;
  }
 };
}
let current=null;
export function initContactCapture(data,{env=window,onOpen=()=>{}}={}){
 if(current){current.setOnOpen(onOpen);return current;}
 const doc=env.document,dialog=doc.querySelector('#contact-dialog');if(!dialog)return null;
 const q=s=>dialog.querySelector(s),qa=s=>[...dialog.querySelectorAll(s)],form=q('#contact-form'),result=q('#contact-next'),link=q('#contact-link'),error=q('#contact-error'),modelSelect=q('#contact-model'),fieldset=q('.capture-fields'),submission=createContactSubmission(env);
 let selected='',context=null,lastFocus=null,generation=0,receipt=null,onOpenCallback=onOpen;const announced=new Set();
 try{const saved=env.localStorage.getItem('interiorsp.unit.v1');if(data.units.some(u=>u.id===saved))selected=saved;}catch{}
 const routeReady=()=>['vendas','simulacao','test'].includes(context?.intent);
 function syncUnit(){qa('[data-choose-unit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chooseUnit===selected)));q('[data-contact-unit-error]').hidden=true;}
 function chooseUnit(id){if(!data.units.some(u=>u.id===id))return;selected=id;try{env.localStorage.setItem('interiorsp.unit.v1',id);}catch{}syncUnit();doc.dispatchEvent(new env.CustomEvent('interiorsp:unit-change',{detail:{unit:id}}));if(!context)dialog.close();}
 function open(options={},trigger=null){
  if(fieldset.disabled)return;
  generation++;onOpenCallback();lastFocus=trigger||doc.activeElement;context=options.intent===''?null:{intent:options.intent||'vendas',model:options.model||doc.body.dataset.model||'',unit:options.unit||selected,entry:options.entry??'',term:options.term??'',date:options.date||'',...(options.model_year?{model_year:options.model_year}:{}),...(options.mileage!==undefined?{mileage:options.mileage}:{}),detail:options.detail||'',campaign_id:options.campaign_id||'',inventory_id:options.inventory_id||'',placement:options.placement||'site',...(options.campaign_option?{campaign_option:options.campaign_option}:{}),...(options.content_revision?{content_revision:options.content_revision}:{})};
  if(context&&!Object.hasOwn(labels,context.intent))context.intent='vendas';
  if(options.unit&&data.units.some(u=>u.id===options.unit))selected=options.unit;
  const allowed=Array.isArray(options.unit_ids)&&options.unit_ids.length?options.unit_ids:data.units.map(u=>u.id);
  if(!allowed.includes(selected))selected=allowed.length===1?allowed[0]:'';
  form.reset();const phone=q('[data-contact-phone]');if(phone)phone.hidden=true;result.hidden=true;form.hidden=!context;q('[data-contact-preference]').hidden=false;receipt=null;link.hidden=true;link.removeAttribute('href');error.hidden=true;syncUnit();
  q('#contact-title').textContent=context?'Como podemos falar com você?':'Escolha sua unidade';
  q('.contact-units').closest('fieldset').hidden=false;
  // In unit-only mode the same chooser is shown without personal fields.
  qa('.capture-pair,[data-contact-model-row],.capture-routing,.capture-privacy,.capture-submit,.capture-submit-hint').forEach(n=>n.hidden=!context);
  form.hidden=false;
  qa('[data-choose-unit]').forEach(b=>b.hidden=!!context&&!allowed.includes(b.dataset.chooseUnit));
  q('[data-contact-preference]').textContent='Sua escolha de unidade fica salva somente neste navegador.';
  if(context){
   const model=data.models.find(m=>m.id===context.model),summary=[labels[context.intent],model?.name];
   if(options.condition_title)summary.push(options.condition_title);
   if(context.intent==='simulacao'){if(context.entry!=='')summary.push('Entrada desejada: '+money(Number(context.entry)));if(context.term!=='')summary.push('Prazo desejado: '+context.term+' meses');}
   if(context.date)summary.push('Data de preferência: '+context.date.split('-').reverse().join('/'));
   if(context.model_year)summary.push('Fabricação/modelo: '+context.model_year);
   if(context.mileage!==undefined)summary.push(Number(context.mileage).toLocaleString('pt-BR')+' km');
   q('#contact-context').textContent=summary.filter(Boolean).join(' · ');
   modelSelect.value=context.model;modelSelect.required=['test','simulacao'].includes(context.intent);q('[data-contact-model-row]').hidden=!modelSelect.required||!!model;
   q('[data-contact-routing]').textContent=routeReady()?'Após o registro, você poderá continuar com a BIA no WhatsApp da unidade.':'Sua solicitação ficará registrada para acompanhamento pela equipe da unidade.';
   q('#contact-submit').firstChild.textContent=routeReady()?'Salvar e continuar ':'Registrar solicitação ';
   q('#contact-submit').hidden=false;
   contactEvent(env,'contact_form_view',context);
  }else{q('#contact-context').textContent='Escolha onde deseja ser atendido. Nenhum dado de contato será enviado nesta escolha.';modelSelect.required=false;}
  if(!dialog.open)dialog.showModal();doc.body.classList.add('locked');
  (context?q('#contact-name'):q('[data-choose-unit]')).focus({preventScroll:true});
 }
 qa('[data-choose-unit]').forEach(button=>button.addEventListener('click',()=>chooseUnit(button.dataset.chooseUnit)));
 doc.addEventListener('interiorsp:unit-selected',event=>{selected=data.units.some(u=>u.id===event.detail?.unit)?event.detail.unit:'';syncUnit();});
 q('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{doc.body.classList.remove('locked');generation++;const target=lastFocus?.getClientRects().length?lastFocus:doc.querySelector('.unit-change');target?.focus();});
 form.addEventListener('input',()=>{error.hidden=true;});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!context||fieldset.disabled||!form.reportValidity())return;
  if(!selected){q('[data-contact-unit-error]').hidden=false;q('[data-choose-unit]').focus();return;}
  const values=Object.fromEntries(new FormData(form));
  const hash=/^#[a-zA-Z0-9_-]{1,80}$/.test(env.location.hash||'')?env.location.hash:'';
  const payload={...context,model:modelSelect.value||context.model,unit:selected,name:values.name,phone:values.phone,website:values.website,requested_contact:form.elements.requested_contact.checked,notice_version:form.dataset.noticeVersion,source:env.location.pathname+hash};
  const flow=generation;error.hidden=true;fieldset.disabled=true;q('#contact-submit').setAttribute('aria-busy','true');q('#contact-submit').firstChild.textContent='Registrando… ';
  try{
   const saved=await submission.send(payload);if(!announced.has(saved.receipt.id)){contactEvent(env,'contact_saved',payload);announced.add(saved.receipt.id);}
   if(flow!==generation||!dialog.open)return;
   receipt=saved.receipt;context={...context,unit:selected,model:payload.model};form.hidden=true;result.hidden=false;q('[data-contact-preference]').hidden=true;
   const afterSales=!routeReady()&&['revisao','manutencao','pecas','acessorios','garantia'].includes(context.intent);
   let phone=q('[data-contact-phone]');if(!phone){phone=doc.createElement('a');phone.dataset.contactPhone='';phone.className='button outline';result.append(phone);}
   phone.hidden=!(afterSales&&selected==='rio-preto');if(!phone.hidden){phone.href='tel:+551730420708';phone.textContent='Ligar para o pós-venda: (17) 3042-0708';}
   q('[data-contact-result-copy]').textContent=saved.handoff_url?'Seu pedido já está disponível para a equipe da unidade. Continue no WhatsApp para conversar com a BIA.':`Solicitação registrada no painel da unidade de ${selected==='rio-preto'?'Rio Preto':'Bauru'}. ${afterSales&&selected==='rio-preto'?'Você também pode ligar diretamente para o pós-venda.':'A equipe dará continuidade pelo contato informado.'} O agendamento ainda depende de confirmação.`;
   link.hidden=!saved.handoff_url;if(saved.handoff_url)link.href=saved.handoff_url;
   q('[data-contact-handoff-note]').textContent=saved.handoff_url?'Abrir o WhatsApp não envia a mensagem. Você precisa confirmá-la no aplicativo.':'O registro não confirma agendamento, disponibilidade ou aprovação. A equipe dará continuidade à sua solicitação.';
   q('#contact-saved-title').focus({preventScroll:true});
  }catch(cause){if(flow===generation&&dialog.open){error.textContent=cause.message;error.hidden=false;error.focus?.({preventScroll:true});}}
  finally{fieldset.disabled=false;q('#contact-submit').removeAttribute('aria-busy');q('#contact-submit').firstChild.textContent=routeReady()?'Salvar e continuar ':'Registrar solicitação ';}
 });
 link.addEventListener('click',()=>{
  if(!receipt||link.hidden)return;
  contactEvent(env,'contact_handoff_attempt',context);
  env.fetch('/api/contact/handoff',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(receipt),keepalive:true}).catch(()=>{});
 });
 q('[data-contact-new]').addEventListener('click',()=>{submission.reset();open(context,lastFocus);});
 function placement(trigger){for(const [selector,value] of [['.floating-chat','floating'],['.site-header','header'],['footer','footer'],['#inicio','hero'],['#vantagens','bia'],['.catalog-slider','catalog'],['[data-offers-catalog]','offers'],['.d4-page','product'],['.blog-detail','blog']])if(trigger.closest(selector))return value;return 'site';}
 doc.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-contact],[data-offer-bia],[data-d4-unit-link],.unit-change');if(!trigger)return;
  event.preventDefault();
  const options={intent:trigger.matches('.unit-change')?'':trigger.dataset.contact||(trigger.hasAttribute('data-d4-unit-link')?'test':'vendas'),model:trigger.dataset.model||trigger.dataset.offerBia||doc.body.dataset.model||'',unit:trigger.dataset.unit||trigger.dataset.d4UnitLink||'',campaign_id:trigger.dataset.campaignId||'',inventory_id:trigger.dataset.inventoryId||'',campaign_option:trigger.dataset.campaignOption||'',content_revision:trigger.dataset.contentRevision||'',unit_ids:(trigger.dataset.unitIds||'').split(' ').filter(id=>data.units.some(u=>u.id===id)),condition_title:trigger.closest('.campaign-detail-copy')?.querySelector('[data-campaign-option]:checked')?.nextElementSibling?.querySelector('strong')?.textContent||'',placement:placement(trigger)};
  if(options.intent)contactEvent(env,'contact_cta_click',options);open(options,trigger);
 });
 doc.addEventListener('interiorsp:contact-request',event=>open(event.detail,event.detail?.trigger));
 current={open,setOnOpen(callback){onOpenCallback=callback;}};return current;
}
export function requestContact(options,env=window){env.document.dispatchEvent(new env.CustomEvent('interiorsp:contact-request',{detail:options}));}
