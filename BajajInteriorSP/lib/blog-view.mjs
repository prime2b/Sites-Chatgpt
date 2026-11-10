import { escapeHtml as e } from './cms-domain.mjs';
import {commerceState,refreshAfter,publishedDraft} from './commerce-domain.mjs';
import { models,coverAssets } from './blog-catalog.mjs';
import { siteHeader,siteFooter } from './site-fragments.mjs';
import { renderBlogCard } from './blog-card.mjs';
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const day=value=>new Date(value).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'});
const dateTime=value=>new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});
const arrow='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 12h10m-4-4 4 4-4 4"/></svg>';
const tag='<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M2 3h9l11 11-8 8L2 10V3Zm5 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>';
export function coverSource(draft,{preview=false}={}){
 if(draft.cover_id)return preview?`/api/admin/media/${draft.cover_id}/file`:`/midia/${draft.cover_id}`;
 if(coverAssets.some(a=>a.file===draft.cover_asset))return '/assets/'+draft.cover_asset;
 return '/assets/campaign-client-01.webp';
}
function inline(raw){
 let result=e(raw).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
 result=result.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(match,label,href)=>{
  if(!/^(?:https:\/\/[^\s"<>]+|\/(?!\/)[a-zA-Z0-9/_?#=.&%-]*)$/.test(href))return label;
  return `<a href="${href}"${href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`;
 });return result;
}
export function renderBody(body){
 const chunks=String(body||'').replace(/\r\n/g,'\n').split(/\n{2,}/);
 return chunks.filter(Boolean).map(chunk=>{
  const lines=chunk.trim().split('\n');
  if(lines.every(l=>/^[-*] /.test(l)))return '<ul>'+lines.map(l=>'<li>'+inline(l.slice(2))+'</li>').join('')+'</ul>';
  if(/^###? /.test(chunk)&&lines.length===1){const level=chunk.startsWith('### ')?3:2;return `<h${level}>${inline(chunk.replace(/^###? /,''))}</h${level}>`;}
  return '<p>'+lines.map(inline).join('<br>')+'</p>';
 }).join('');
}
export function catalogOffer(id){const model=models.find(m=>m.id===id);return model?{key:'catalog:'+id,model,title:model.name,summary:'Consulte disponibilidade e condições.',href:`/motos/${id}/#simulacao`,image:'/assets/'+(model.catalogImage||model.image),price:model.price,catalog:true}:null;}
export function resolveOffer(key,campaigns=[],time=Date.now()){
 if(!key)return null;
 if(key.startsWith('catalog:'))return catalogOffer(key.slice(8));
 if(!key.startsWith('campaign:'))return null;
 const row=campaigns.find(c=>c.id===key.slice(9)&&c.kind==='ofertas');
 if(commerceState(row,time)!=='active')return null;const draft=publishedDraft(row);
 const model=models.find(m=>m.id===draft.offer_model);if(!model)return null;
 return {key,model,title:draft.title,summary:draft.summary,href:`/ofertas/${row.slug}/`,image:'/midia/'+draft.cover_id,catalog:false};
}
export function articleOffers(d,campaigns=[],time=Date.now()){
 const offers=(d.related_offers||[]).map(key=>resolveOffer(key,campaigns,time)).filter(Boolean).slice(0,3),banner=resolveOffer(d.banner_offer,campaigns,time);
 const banner_html=banner?`<a class="blog-offer-banner" href="${banner.href}" aria-label="${e(banner.title)} — consultar condições"><span class="blog-banner-kicker">SUA PRÓXIMA BAJAJ</span><strong>${e(banner.model.name)}</strong><span class="blog-banner-bottom"><span>${banner.catalog?`<small>A partir de</small><b>${money(banner.price)}</b><small>Preço de catálogo à vista</small>`:`<b>${e(banner.title)}</b><small>Consulte as condições da campanha</small>`}</span><img src="${banner.image}" width="180" height="125" alt="${e(banner.model.name)}"></span><span class="blog-banner-cta">Conheça as condições →</span></a>`:'';
 const related_html=offers.length?`<section class="blog-related-offers"><h2>Ofertas relacionadas:</h2>${offers.map(o=>`<a class="blog-related-offer" href="${o.href}"><img src="${o.image}" width="110" height="83" alt="${e(o.model.name)}"><span><strong>${e(o.model.name)}</strong>${o.catalog?`<small>A partir de</small><b>${money(o.price)}</b><small>Consulte condições</small>`:`<b>${e(o.title)}</b><small>${e(o.summary)}</small>`}</span></a>`).join('')}<p class="blog-offer-note">Consulte disponibilidade e condições na unidade.</p></section>`:'';
 return {banner_html,related_html,refresh_after_ms:refreshAfter(campaigns,time)};
}
function modelTags(draft){return (draft.model_ids||[]).map(id=>models.find(m=>m.id===id)).filter(Boolean).map(m=>`<a href="/blog/?modelo=${m.id}">${e(m.name)}</a>`).join('');}
export function articleCard(row){const d=row.draft||JSON.parse(row.published_json);return renderBlogCard(row,{models,coverUrl:coverSource(d)});}
export function renderHomeBlog(rows){return `<section class="section home-blog" id="novidades" aria-labelledby="home-blog-title"><div class="section-head"><div><span class="blog-eyebrow">UNIVERSO BAJAJ</span><h2 id="home-blog-title">Notícias, histórias.<br>Seu próximo caminho.</h2></div><a class="text-link" href="/blog/">Ver todos os artigos ${arrow}</a></div>${rows.length?'<div class="blog-grid">'+rows.slice(0,3).map(articleCard).join('')+'</div>':'<p class="blog-empty">As novidades da InteriorSP estarão aqui. Enquanto isso, conheça os modelos da linha Bajaj.</p>'}</section>`;}
function document({title,summary,body,path,origin='',image=null,article=null,preview=false}){
 const schema=article?{'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description:article.summary,datePublished:article.published_at,dateModified:article.updated_at,author:{'@type':'Organization',name:article.author||'Equipe InteriorSP'},publisher:{'@type':'Organization',name:'Bajaj InteriorSP'},...(image?{image:origin+image}:{}),mainEntityOfPage:origin+path}:null;
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)} | Bajaj InteriorSP</title><meta name="description" content="${e(summary)}"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0052a1"><link rel="canonical" href="${e(origin+path)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(summary)}"><meta property="og:type" content="${article?'article':'website'}">${image?`<meta property="og:image" content="${e(origin+image)}">`:''}<link rel="icon" href="/assets/favicon.png"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/blog.css"><link rel="stylesheet" href="/contact-capture.css"><script type="module" src="/app.mjs"></script><script type="module" src="/blog-offers.mjs"></script>${schema?'<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>':''}</head><body data-page="blog">${preview?'<div class="blog-preview">Prévia privada · Salve e publique para atualizar o site. <a href="/admin/">Voltar ao painel</a></div>':''}${siteHeader}<main id="conteudo">${body}</main>${siteFooter}</body></html>`;
}
export function blogIndex(rows,{origin='',model=null}={}){
 const filtered=model?rows.filter(row=>(JSON.parse(row.published_json).model_ids||[]).includes(model)):rows;
 const active=models.find(m=>m.id===model);
 const body=`<section class="blog-index"><nav class="blog-breadcrumb" aria-label="Localização"><a href="/">Home</a><span>/</span><span>Blog</span></nav><div class="blog-index-heading"><div><span class="blog-eyebrow">UNIVERSO BAJAJ</span><h1>Notícias Bajaj</h1><p>Modelos, histórias e novidades para o seu próximo caminho.</p></div><span class="blog-index-count">${filtered.length} ${filtered.length===1?'artigo':'artigos'}</span></div><nav class="blog-model-filter" aria-label="Artigos por modelo"><a href="/blog/" ${!active?'aria-current="page"':''}>Todos</a>${models.map(m=>`<a href="/blog/?modelo=${m.id}" ${active?.id===m.id?'aria-current="page"':''}>${e(m.name)}</a>`).join('')}</nav>${filtered.length?'<div class="blog-grid">'+filtered.map(articleCard).join('')+'</div>':'<div class="blog-no-results"><h2>Novas histórias estão a caminho.</h2><p>Explore os demais artigos ou conheça os modelos da linha.</p><a class="text-link" href="/blog/">Ver todos os artigos →</a></div>'}</section>`;
 return document({title:'Notícias Bajaj',summary:'Conheça a linha Bajaj, seus modelos e novidades no Blog da InteriorSP, em Rio Preto e Bauru.',body,path:'/blog/',origin});
}
export function articlePage(row,{origin='',preview=false,campaigns=[],related=[]}={}){
 const d=preview?JSON.parse(row.draft_json):JSON.parse(row.published_json),modelList=(d.model_ids||[]).map(id=>models.find(m=>m.id===id)).filter(Boolean);
 const commerce=articleOffers(d,campaigns);
 const body=`<div class="blog-detail"><nav class="blog-breadcrumb" aria-label="Localização"><a href="/">Home</a><span>/</span><a href="/blog/">Notícias</a><span>/</span><span>${e(d.title)}</span></nav><div class="blog-detail-grid"><article class="blog-article"><header class="blog-article-heading"><h1>${e(d.title)}</h1><div class="blog-article-tags">${tag}<span>Categorias:</span><a href="/blog/">Bajaj</a>${modelTags(d)}</div></header><div class="blog-article-paper"><img class="blog-article-cover" src="${coverSource(d,{preview})}" width="1600" height="900" alt="${e(d.cover_alt||d.title)}" fetchpriority="high"><div class="blog-prose">${renderBody(d.body)}</div><div class="blog-article-date">Criado em ${dateTime(row.published_at||row.created_at)} · Atualizado em ${dateTime(row.updated_at)}</div></div></article><aside class="blog-sidebar" aria-label="Modelos e ofertas relacionados" ${preview?'':`data-blog-offers="${e(row.slug)}" data-blog-refresh="${commerce.refresh_after_ms}"`}><div class="blog-author"><span class="blog-circle"><img src="/assets/favicon.png" width="42" height="42" alt="Bajaj"></span><div><strong>${e(d.author||'Equipe InteriorSP')}</strong><small>${dateTime(row.published_at||row.created_at)}</small><small>Atualizado em ${dateTime(row.updated_at)}</small></div></div>${modelList.length?`<nav class="blog-cited-models" aria-label="Motos citadas no artigo">${modelList.map(m=>`<a class="blog-cited-model" href="/motos/${m.id}/"><img src="/assets/${m.catalogImage||m.image}" width="110" height="75" alt="${e(m.name)}"><span><strong>Bajaj ${e(m.name)}</strong><small>Conheça mais sobre o modelo…</small></span></a>`).join('')}</nav>`:''}<div data-blog-banner>${commerce.banner_html}</div><a class="blog-store-shortcut" href="/unidades/"><span class="blog-circle"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span><strong>Nossas lojas</strong><small>Encontre sua Bajaj na InteriorSP</small><span>Rio Preto · Bauru ↗</span></span></a><div data-blog-related>${commerce.related_html}</div></aside></div>${related.length?`<section class="blog-read-more"><h2>Leia também</h2><div class="blog-grid">${related.filter(r=>r.id!==row.id).slice(0,3).map(articleCard).join('')}</div></section>`:''}</div>`;
 return document({title:d.title,summary:d.summary,body,path:'/blog/'+row.slug+'/',origin,image:coverSource(d,{preview}),article:{...d,published_at:row.published_at||row.created_at,updated_at:row.updated_at},preview});
}
