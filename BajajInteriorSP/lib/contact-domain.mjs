import {CmsError,fail} from './cms-domain.mjs';
import {models,units} from './blog-catalog.mjs';
import {intents,money} from '../public/core.mjs';

export const NOTICE_VERSION='contact-2026-10-30-v1';
export const CONTACT_NOTICE='Seu nome, WhatsApp e os dados desta solicitação serão usados para o atendimento da Bajaj InteriorSP na unidade escolhida. O registro fica disponível à equipe autorizada, mesmo que você não envie a mensagem no WhatsApp.';
export const CONTACT_STATUSES={new:'Novo',in_progress:'Em acompanhamento',completed:'Concluído',archived:'Arquivado'};
export const INTENT_LABELS={vendas:'Atendimento de vendas',simulacao:'Simulação de financiamento',test:'Test ride',consorcio:'Consórcio',revisao:'Revisão',manutencao:'Manutenção',pecas:'Peças',acessorios:'Acessórios',garantia:'Garantia'};
export const knownRoute=intent=>['vendas','simulacao','test'].includes(intent);
const clean=value=>typeof value==='string'?value.trim().replace(/\s+/g,' '):'';
export function normalizePhone(value){
 let digits=clean(value).replace(/[+() .-]/g,'');
 if(!/^\d+$/.test(digits))fail(422,'Informe um WhatsApp brasileiro com DDD.');
 if((digits.length===12||digits.length===13)&&digits.startsWith('55'))digits=digits.slice(2);
 const ddd=Number(digits.slice(0,2));
 const validDDD=[11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99].includes(ddd);
 if(!validDDD||!/^\d{2}(?:[2-5]\d{7}|9\d{8})$/.test(digits)||/^(\d)\1+$/.test(digits.slice(2)))fail(422,'Confira o WhatsApp, incluindo o DDD.');
 return '55'+digits;
}
export function validateContact(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'Solicitação inválida.');
 if(input.website)fail(422,'Não foi possível validar a solicitação.');
 const name=clean(input.name);
 if(name.length<2||name.length>100||!/^\p{L}[\p{L}\p{M} .’'-]+$/u.test(name))fail(422,'Informe seu nome, com 2 a 100 caracteres.');
 const phone=normalizePhone(input.phone);
 const intent=clean(input.intent),unit=units.find(u=>u.id===input.unit),model=input.model?models.find(m=>m.id===input.model):null;
 if(!Object.hasOwn(INTENT_LABELS,intent))fail(422,'Escolha um atendimento válido.');
 if(!unit)fail(422,'Escolha Rio Preto ou Bauru.');
 if(input.model&&!model)fail(422,'Confira o modelo escolhido.');
 if(['simulacao','test'].includes(intent)&&!model)fail(422,'Escolha o modelo para continuar.');
 if(input.requested_contact!==true||input.notice_version!==NOTICE_VERSION)fail(422,'Confirme a solicitação de atendimento. Se necessário, atualize a página.');
 const idempotency_key=clean(input.idempotency_key);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotency_key))fail(400,'Atualize o formulário e tente novamente.');
 let source=clean(input.source).split('?')[0];
 if(!/^\/(?!\/)[a-zA-Z0-9_\-\/#]*$/.test(source)||source.length>250||source.includes('..'))fail(422,'Página de origem inválida.');
 const placement=clean(input.placement)||'site';if(!/^[a-z0-9_-]{1,50}$/.test(placement))fail(422,'Origem do atendimento inválida.');
 const related={};
 for(const field of ['campaign_id','inventory_id']){
  if(input[field]&&!/^[a-zA-Z0-9_-]{1,80}$/.test(input[field]))fail(422,'Conteúdo relacionado inválido.');
  related[field]=input[field]||null;
 }
 if(related.campaign_id&&related.inventory_id)fail(422,'Selecione uma única oferta ou seminova.');
 const extra={};if(input.campaign_option){if(!['1','2','3'].includes(input.campaign_option))fail(422,'Selecione uma condição válida.');extra.campaign_option=input.campaign_option;}
 if(input.content_revision){if(typeof input.content_revision!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input.content_revision))fail(422,'Atualize o anúncio para consultar as condições vigentes.');extra.content_revision=input.content_revision;}
 let entry=null,term=null;
 if(intent==='simulacao'){
  if(input.entry!==''&&input.entry!==null&&input.entry!==undefined){entry=Number(input.entry);if(!/^\d{1,6}(?:\.\d{1,2})?$/.test(String(input.entry))||!Number.isFinite(entry)||entry<0||entry>(model?.price||1000000))fail(422,'Confira a entrada desejada.');}
  if(input.term!==''&&input.term!==null&&input.term!==undefined){term=Number(input.term);if(!Number.isSafeInteger(term)||term<1)fail(422,'Informe o prazo desejado em meses inteiros.');}
 }
 const date=['test','revisao','manutencao'].includes(intent)?clean(input.date):'';
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))fail(422,'Confira a data de preferência.');
 const detail=clean(input.detail);
 if(detail.length>500||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(detail))fail(422,'Use até 500 caracteres, sem documentos ou dados sensíveis.');
 const owner={};
 if(['revisao','manutencao','pecas','acessorios','garantia'].includes(intent)){
  const year=clean(input.model_year);
  if(year){const parts=/^(\d{4})\/(\d{4})$/.exec(year);if(!parts||Number(parts[1])<1980||Number(parts[2])<Number(parts[1])||Number(parts[2])>Number(parts[1])+1||Number(parts[2])>new Date().getFullYear()+2)fail(422,'Confira o ano de fabricação/modelo, como 2026/2027.');owner.model_year=year;}
  if(input.mileage!==undefined&&input.mileage!==null&&input.mileage!==''){if(!/^\d{1,6}$/.test(String(input.mileage)))fail(422,'Informe a quilometragem em km inteiros, de 0 a 999999.');owner.mileage=Number(input.mileage);}
 }
 return {name,phone,idempotency_key,intent,unit:unit.id,model:model?.id||null,entry,term,date:date||null,detail:detail||null,source,placement,...related,requested_contact:true,notice_version:NOTICE_VERSION,...extra,...owner};
}
export function makeHandoff(context){
 if(!context.route_phone)return null;
 const parts=['Olá, BIA! Vim pelo site da Bajaj InteriorSP.'];
 if(context.model_name&&!context.inventory_id)parts.push(`Tenho interesse na ${context.model_name}, com preço de catálogo de ${money(context.catalog_price)}.`);
 parts.push(intents[context.intent]);
 if(context.campaign_title)parts.push(`Campanha: ${context.campaign_title}.`);
 if(context.campaign_option_title)parts.push(`Condição escolhida: opção ${context.campaign_option_id} — ${context.campaign_option_title}. ${context.campaign_option_details}`);
 if(context.campaign_price!==null&&context.campaign_price!==undefined)parts.push(`Preço à vista da condição escolhida: ${money(context.campaign_price)}.`);
 if(context.inventory_title)parts.push(`Seminova: ${context.inventory_title}. Referência: ${context.inventory_code||context.inventory_id}.`);
 if(context.inventory_id&&context.inventory_price!==null&&context.inventory_price!==undefined)parts.push(`Preço anunciado do exemplar: ${money(context.inventory_price)}.`);
 if(context.entry!==null)parts.push(`Entrada desejada: ${money(context.entry)}.`);
 if(context.term!==null)parts.push(`Prazo desejado: ${context.term} meses.`);
 if(context.date){const [y,m,d]=context.date.split('-');parts.push(`Data de preferência: ${d}/${m}/${y}. Aguardo confirmação da equipe.`);}
 if(context.model_year)parts.push(`Ano fabricação/modelo: ${context.model_year}.`);
 if(context.mileage!==undefined&&context.mileage!==null)parts.push(`Quilometragem: ${context.mileage} km.`);
 if(context.detail)parts.push(`Minha necessidade: ${context.detail}`);
 parts.push(`Unidade: ${context.unit_name}.`);
 return `https://wa.me/${context.route_phone}?text=${encodeURIComponent(parts.join(' '))}`;
}
export {CmsError};
