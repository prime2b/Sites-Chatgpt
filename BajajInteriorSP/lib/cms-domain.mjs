import {contactDialogHTML} from './site-fragments.mjs';
import {CmsError,fail,escapeHtml,slugify} from './cms-primitives.mjs';
import {COMMERCE_KINDS,validateCommerceDraft,assertCommercePublishable,commerceMediaIds} from './commerce-domain.mjs';
export {CmsError,fail,escapeHtml,slugify};
export const KINDS = { ofertas:'Ofertas', seminovas:'Seminovas', blog:'Blog' };
export function permission(actor, capability) {
  if (!actor || !actor.active) return false;
  if (capability==='contacts') return !!actor.can_contacts;
  if (capability==='admin') return actor.role==='admin';
  if (capability==='training_manage') return actor.role==='admin'||!!actor.can_training_manage;
  if (capability==='training_edit') return actor.role==='admin'||!!actor.can_training_edit;
  return ['admin','editor'].includes(actor.role);
}
export function guardMutation(request) {
  if (['GET','HEAD','OPTIONS'].includes(request.method)) return;
  if (request.headers.get('Origin')!==new URL(request.url).origin) fail(403,'Atualize a página e tente novamente. Origem não autorizada.');
  const type=request.headers.get('Content-Type')||'';
  if (!type.startsWith('application/json')&&!type.startsWith('multipart/form-data')) fail(415,'Formato de envio não permitido.');
}
export function validateDraft(input,{kind='blog'}={}) {
  if (!input || typeof input!=='object' || Array.isArray(input)) fail(400,'Conteúdo inválido.');
  const str=(key,max,required=false)=>{
    const value=typeof input[key]==='string'?input[key].trim():'';
    if ((required&&value.length<3)||value.length>max) fail(400,`Confira o campo ${key==='title'?'título':key==='summary'?'resumo':'texto'} e seu tamanho.`);
    return value;
  };
  const title=str('title',160,true), summary=str('summary',320), body=str('body',30000);
  const id=value=> typeof value==='string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value)?value:null;
  if (input.cover_id&&!id(input.cover_id)) fail(400,'Imagem de capa inválida.');
  const attachments=Array.isArray(input.attachments)?[...new Set(input.attachments.map(id))]:[];
  if (attachments.includes(null)||attachments.length>12) fail(400,'Selecione até 12 arquivos válidos.');
  const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
  const modelIds=['pulsar-n150','dominar-ns160','dominar-ns200','dominar-250','dominar-400','dominar-ns400z'];
  const models=Array.isArray(input.model_ids)?[...new Set(input.model_ids)]:[];
  if(models.length>6||models.some(m=>!modelIds.includes(m)))fail(400,'Selecione modelos válidos do catálogo.');
  const offer=value=>typeof value==='string'&&/^(?:catalog:[a-z0-9-]+|campaign:[a-zA-Z0-9_-]{1,80})$/.test(value)?value:null;
  const related=Array.isArray(input.related_offers)?[...new Set(input.related_offers)]:[];
  if(related.length>3||related.some(o=>!offer(o)))fail(400,'Selecione até três ofertas válidas.');
  if(input.banner_offer&&!offer(input.banner_offer))fail(400,'Selecione uma oferta válida para o banner.');
  const asset=text(input.cover_asset,150);
  if(asset&&!/^[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(asset))fail(400,'Imagem do catálogo inválida.');
  const validDate=value=>{if(!value)return null;const t=Date.parse(value);if(!Number.isFinite(t))fail(400,'Confira as datas da campanha.');return new Date(t).toISOString();};
  const starts_at=validDate(input.starts_at),valid_until=validDate(input.valid_until);
  if(starts_at&&valid_until&&starts_at>=valid_until)fail(400,'O encerramento da campanha deve ocorrer após o início.');
  return {title,summary,body,cover_id:id(input.cover_id),attachments,category:text(input.category,60)||'Universo Bajaj',author:text(input.author,100)||'Equipe InteriorSP',cover_asset:asset||null,cover_alt:text(input.cover_alt,250),model_ids:models,banner_offer:offer(input.banner_offer),related_offers:related,offer_model:modelIds.includes(input.offer_model)?input.offer_model:null,starts_at,valid_until,...(COMMERCE_KINDS.includes(kind)?validateCommerceDraft(input,kind):{})};
}
export function assertPublishable(draft,kind='blog') {
  if (draft.title.length<3 || draft.summary.length<10 || draft.body.length<30) fail(422,'Preencha o título, um resumo de pelo menos 10 caracteres e um texto de pelo menos 30 caracteres antes de publicar.');
  if(COMMERCE_KINDS.includes(kind))assertCommercePublishable(draft,kind);
}
export function mediaIds(draft) {return [...new Set(commerceMediaIds(draft))];}
export function inspectUpload(bytes,reportedType) {
  const ascii=(start,n)=>String.fromCharCode(...bytes.slice(start,start+n));
  let type=null;
  if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff) type='image/jpeg';
  if(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)&&ascii(12,4)==='IHDR') type='image/png';
  if(ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP') type='image/webp';
  if(ascii(0,5)==='%PDF-'&&ascii(Math.max(0,bytes.length-1024),1024).includes('%%EOF')) type='application/pdf';
  if(!type || type!==reportedType) fail(415,'Envie uma imagem JPG, PNG ou WebP, ou um PDF válido. O formato real deve corresponder ao arquivo.');
  const limit=type==='application/pdf'?20*1024*1024:10*1024*1024;
  if(bytes.length>limit||bytes.length<12) fail(413,'Limite: 10 MB por imagem ou 20 MB por PDF.');
  return type;
}
export function contentUrl(row) {return row.kind==='blog'?`/blog/${row.slug}/`:row.kind==='seminovas'?`/seminovas/${row.slug}/`:row.kind==='ofertas'?`/ofertas/${row.slug}/`:`/conteudos/${row.kind}/${row.slug}/`;}
export function renderContent(draft,{preview=false,kind='blog',publishedAt=null,origin='',slug='',media=[],contentId=null}={}) {
  const e=escapeHtml, path=`/conteudos/${kind}/${slug}/`;
  const image=id=>preview?`/api/admin/media/${id}/file`:`/midia/${id}`;
  const description=e(draft.summary);
  const paragraphs=draft.body.split(/\n{2,}/).filter(Boolean).map(p=>`<p>${e(p).replace(/\n/g,'<br>')}</p>`).join('');
  const files=(draft.attachments||[]).filter(id=>id!==draft.cover_id).map(id=>{
    const m=media.find(m=>m.id===id);return `<a class="file-link" href="${image(id)}" target="_blank" rel="noopener">${e(m?.name||'Abrir arquivo')} ↗</a>`;
  }).join('');
  const capture=!preview&&contentId&&['ofertas','seminovas'].includes(kind);
  const action=capture?`<section class="content-contact"><h2>Quer saber mais?</h2><p>Registre seu interesse e fale com a unidade sobre este ${kind==='ofertas'?'conteúdo':'exemplar'}.</p><button type="button" class="file-link" data-contact="vendas" data-model="${e(draft.offer_model||'')}" ${kind==='ofertas'?'data-campaign-id':'data-inventory-id'}="${e(contentId)}">Consultar com a equipe →</button></section>`:'';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(draft.title)} | Bajaj InteriorSP</title><meta name="description" content="${description}"><meta name="robots" content="noindex,nofollow"><meta property="og:title" content="${e(draft.title)}"><meta property="og:description" content="${description}"><meta property="og:type" content="${kind==='blog'?'article':'website'}">${!preview?`<link rel="canonical" href="${e(origin+path)}">`:''}${draft.cover_id?`<meta property="og:image" content="${e(origin+image(draft.cover_id))}">`:''}<link rel="stylesheet" href="/admin-content.css">${capture?'<link rel="stylesheet" href="/contact-capture.css"><script type="module" src="/contact-entry.mjs"></script>':''}<link rel="icon" href="/assets/favicon.png"></head><body>${preview?'<aside class="preview-bar">Prévia privada · Alterações só aparecem no endereço público depois de publicar. <a href="/admin/">Voltar ao painel</a></aside>':''}<header><a href="/"><img src="/assets/logo-header.png" width="270" height="33" alt="InteriorSP Bajaj"></a><a href="/">Voltar ao site ↗</a></header><main><div class="eyebrow">${e(KINDS[kind])} · InteriorSP</div><h1>${e(draft.title)}</h1><p class="summary">${description}</p>${publishedAt?`<p class="date">Publicado em ${e(new Date(publishedAt).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</p>`:''}${draft.cover_id?`<img class="cover" src="${image(draft.cover_id)}" alt="${e(media.find(m=>m.id===draft.cover_id)?.alt||draft.title)}">`:''}<article>${paragraphs}</article>${files?`<section class="files"><h2>Arquivos relacionados</h2>${files}</section>`:''}${action}</main><footer>Bajaj InteriorSP · Rio Preto e Bauru</footer>${capture?contactDialogHTML:''}</body></html>`;
}
