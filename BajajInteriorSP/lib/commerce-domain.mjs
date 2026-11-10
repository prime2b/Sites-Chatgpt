import {fail} from './cms-primitives.mjs';
import {models,units} from './blog-catalog.mjs';
export const COMMERCE_KINDS=['ofertas','seminovas'];
export const AVAILABILITY={available:'Disponível',reserved:'Reservada',sold:'Vendida',withdrawn:'Retirada'};
export const STATES={draft:'Rascunho',incomplete:'Completar cadastro',scheduled:'Programada',active:'Ativa',paused:'Pausada',expired:'Vencida',ended:'Encerrada',available:'Disponível',reserved:'Reservada',sold:'Vendida',withdrawn:'Retirada'};
const text=(value,max,label)=>{const s=typeof value==='string'?value.trim():'';if(s.length>max)fail(422,`${label}: use até ${max} caracteres.`);return s;};
const identifier=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value)?value:null;
const amount=(value,label)=>{if(value===''||value===null||value===undefined)return null;const s=String(value),n=Number(s);if(!/^\d{1,8}(?:\.\d{1,2})?$/.test(s)||!Number.isFinite(n)||n<=0)fail(422,`Confira ${label}. Use valor positivo com até duas casas decimais.`);return n;};
const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function saoPauloLocal(iso){if(!iso)return '';const parts=Object.fromEntries(formatter.formatToParts(new Date(iso)).map(p=>[p.type,p.value]));return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;}
export function saoPauloInstant(value){
 if(!value)return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))fail(422,'Informe data e hora no formato de São Paulo.');
 const [year,month,day,hour,minute]=value.match(/\d+/g).map(Number),target=Date.UTC(year,month-1,day,hour,minute);let ms=target;
 for(let i=0;i<3;i++){const parts=Object.fromEntries(formatter.formatToParts(new Date(ms)).map(p=>[p.type,p.value]));ms+=target-Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute);}
 if(!Number.isFinite(ms)||saoPauloLocal(new Date(ms).toISOString())!==value)fail(422,'Confira a data e a hora informadas.');return new Date(ms).toISOString();
}
function date(input,key){if(Object.hasOwn(input,key+'_local'))return saoPauloInstant(input[key+'_local']);if(!input[key])return null;const ms=Date.parse(input[key]);if(!Number.isFinite(ms))fail(422,'Confira a validade da campanha.');return new Date(ms).toISOString();}
export function validateCommerceDraft(input,kind){
 const unit_ids=Array.isArray(input.unit_ids)?[...new Set(input.unit_ids)]:[];
 if(unit_ids.some(id=>!units.some(u=>u.id===id)))fail(422,'Selecione unidades válidas.');
 const ids=Array.isArray(input.gallery_ids)?[...new Set(input.gallery_ids)]:[];
 if(ids.length>12||ids.some(id=>!identifier(id)))fail(422,'Use até 12 imagens válidas na galeria.');
 const options=Array.isArray(input.commercial_options)?input.commercial_options:[];
 if(options.length>3)fail(422,'Use até três condições alternativas.');
 const commercial_options=options.map((option,index)=>{
  if(!option||typeof option!=='object')fail(422,'Condição comercial inválida.');
  const id=option.id===undefined?String(index+1):String(option.id);if(!['1','2','3'].includes(id))fail(422,'Identificador de condição inválido.');
  return {id,title:text(option.title,100,'Título da condição'),details:text(option.details,3000,'Condições'),price:amount(option.price,'o preço da condição')};
 }).filter(o=>o.title||o.details||o.price!==null);
 if(new Set(commercial_options.map(o=>o.id)).size!==commercial_options.length)fail(422,'Cada condição deve ter um identificador próprio.');
 const starts_at=date(input,'starts_at'),valid_until=date(input,'valid_until');
 if(starts_at&&valid_until&&starts_at>=valid_until)fail(422,'O fim da campanha precisa ocorrer depois do início.');
 const number=(key,label)=>{if(input[key]===''||input[key]===null||input[key]===undefined)return null;const n=Number(input[key]);if(!Number.isSafeInteger(n)||n<0)fail(422,`Confira ${label}.`);return n;};
 const stock_code=text(input.stock_code,40,'Código do estoque').toUpperCase();if(stock_code&&!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(stock_code))fail(422,'Use um código de estoque com 2 a 40 letras, números, hífen ou sublinhado.');
 const availability=input.availability||'available';if(!Object.hasOwn(AVAILABILITY,availability))fail(422,'Disponibilidade inválida.');
 return {commerce_version:1,is_demo:kind==='seminovas'&&input.is_demo===true,offer_model:models.some(m=>m.id===input.offer_model)?input.offer_model:null,offer_year:text(input.offer_year,9,'Ano/modelo'),unit_ids,starts_at,valid_until,commercial_options,offer_price:amount(input.offer_price,'o preço da campanha'),stock_code,year_manufacture:number('year_manufacture','o ano de fabricação'),year_model:number('year_model','o ano do modelo'),mileage:number('mileage','a quilometragem'),color:text(input.color,60,'Cor'),price:amount(input.price,'o preço do exemplar'),unit_id:units.some(u=>u.id===input.unit_id)?input.unit_id:null,gallery_ids:ids,availability,photos_reviewed:input.photos_reviewed===true};
}
export function assertCommercePublishable(draft,kind,time=Date.now()){
 if(!draft.offer_model)fail(422,'Selecione um modelo Bajaj.');
 if(!draft.cover_id)fail(422,kind==='seminovas'?'Selecione uma foto real de capa do exemplar.':'Selecione uma imagem aprovada para a campanha.');
 if(!draft.cover_alt?.trim())fail(422,'Descreva a imagem de capa para quem usa leitor de tela.');
 if(kind==='ofertas'){
  if(!draft.unit_ids?.length)fail(422,'Selecione pelo menos uma unidade para a campanha.');
  if(!draft.starts_at||!draft.valid_until)fail(422,'Defina início e fim da validade, em horário de São Paulo.');
  if(Date.parse(draft.valid_until)<=time)fail(422,'A validade já terminou. Confira as datas antes de publicar.');
  if(draft.offer_year&&!/^\d{4}\/\d{4}$/.test(draft.offer_year))fail(422,'Informe ano/modelo no formato 2026/2027 ou deixe vazio.');
  if(!draft.commercial_options?.length||draft.commercial_options.some(o=>o.title.length<3||o.details.length<10))fail(422,'Preencha título e condições de pelo menos uma alternativa. Cada condição precisa ter pelo menos 10 caracteres.');
 }else{
  if(!draft.stock_code||!draft.unit_id||draft.price===null||draft.mileage===null||!draft.color)fail(422,'Preencha código, unidade, preço, quilometragem e cor do exemplar.');
  const year=Number(new Intl.DateTimeFormat('en',{timeZone:'America/Sao_Paulo',year:'numeric'}).format(new Date(time)));
  for(const key of ['year_manufacture','year_model'])if(!Number.isInteger(draft[key])||draft[key]<1950||draft[key]>year+2)fail(422,'Confira os anos de fabricação e modelo.');
  if(draft.year_model<draft.year_manufacture)fail(422,'O ano do modelo não pode ser anterior ao de fabricação.');
  if(!draft.gallery_ids?.length)fail(422,'Inclua pelo menos uma foto real na galeria.');
  if(!draft.photos_reviewed)fail(422,draft.is_demo?'Confirme a revisão das imagens ilustrativas deste cadastro fictício.':'Revise as fotos do exemplar e confirme que não há dados pessoais desnecessários.');
 }
}
export function publishedDraft(row){try{return row?.published_json?JSON.parse(row.published_json):null;}catch{return null;}}
export function commerceState(row,time=Date.now()){
 if(!row)return 'draft';if(row.status!=='published')return ['paused','ended'].includes(row.status)?row.status:'draft';
 const d=publishedDraft(row);if(!d||d.commerce_version!==1)return 'incomplete';
 if(row.kind==='ofertas'){
  const start=Date.parse(d.starts_at),end=Date.parse(d.valid_until);
  if(!models.some(m=>m.id===d.offer_model)||!d.cover_id||!d.cover_alt||!Array.isArray(d.unit_ids)||!d.unit_ids.length||d.unit_ids.some(id=>!units.some(u=>u.id===id))||!Array.isArray(d.commercial_options)||!d.commercial_options.length||d.commercial_options.length>3||d.commercial_options.some(o=>!o||!['1','2','3'].includes(o.id)||typeof o.title!=='string'||o.title.length<3||typeof o.details!=='string'||o.details.length<10)||!Number.isFinite(start)||!Number.isFinite(end)||start>=end)return 'incomplete';
  if(Date.parse(d.valid_until)<=time)return 'expired';if(Date.parse(d.starts_at)>time)return 'scheduled';return 'active';
 }
 if(row.kind!=='seminovas'||!d.stock_code||!units.some(u=>u.id===d.unit_id)||!models.some(m=>m.id===d.offer_model)||!d.cover_id||!d.cover_alt||!d.gallery_ids?.length||!d.photos_reviewed||!Number.isFinite(d.price)||d.price<=0||!Number.isSafeInteger(d.mileage)||d.mileage<0||!d.color||!Number.isInteger(d.year_manufacture)||!Number.isInteger(d.year_model))return 'incomplete';return Object.hasOwn(AVAILABILITY,d.availability)?d.availability:'incomplete';
}
export function commercePublic(row,time=Date.now()){return ['active','available','reserved'].includes(commerceState(row,time));}
export function refreshAfter(rows,time=Date.now()){
 const times=rows.filter(r=>r.kind==='ofertas'&&r.status==='published').flatMap(r=>{const d=publishedDraft(r);return [d?.starts_at,d?.valid_until].map(Date.parse).filter(ms=>ms>time);});
 return Math.max(100,Math.min(60000,...times.map(ms=>ms-time)));
}
export function validateBanner(input){
 const draft={campaign_id:identifier(input.campaign_id),desktop_id:identifier(input.desktop_id),mobile_id:identifier(input.mobile_id),alt:text(input.alt,250,'Descrição do banner')};
 for(const k of ['campaign_id','desktop_id','mobile_id'])if(input[k]&&!draft[k])fail(422,'Selecione uma campanha e imagens válidas para o banner.');return draft;
}
export const commerceMediaIds=d=>[d?.cover_id,...(d?.attachments||[]),...(d?.gallery_ids||[])].filter(Boolean);
