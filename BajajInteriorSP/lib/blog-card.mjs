const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 12h10m-4-4 4 4-4 4"/></svg>';
const tag='<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M2 3h9l11 11-8 8L2 10V3Zm5 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>';
export function renderBlogCard(row,{models=[],coverUrl='/assets/campaign-client-01.webp'}={}){
 const e=escape,d=row.draft||JSON.parse(row.published_json),date=new Date(row.published_at).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'});
 const tags=(d.model_ids||[]).map(id=>models.find(m=>m.id===id)).filter(Boolean).map(m=>`<a href="/blog/?modelo=${e(m.id)}">${e(m.name)}</a>`).join('');
 const image=typeof coverUrl==='string'&&/^\/(?:assets\/[a-zA-Z0-9._-]+|midia\/[a-zA-Z0-9_-]+)$/.test(coverUrl)?coverUrl:'/assets/campaign-client-01.webp';
 return `<article class="blog-card"><a class="blog-card-image" href="/blog/${e(row.slug)}/"><img src="${e(image)}" alt="${e(d.cover_alt||d.title)}" width="1600" height="900" loading="lazy"></a><div class="blog-card-content"><span class="blog-card-date">${e(d.category||'Universo Bajaj')} · ${e(date)}</span><h3><a href="/blog/${e(row.slug)}/">${e(d.title)}</a></h3><p>${e(d.summary)}</p><div class="blog-card-bottom"><div class="blog-tags">${tag}${tags}</div><a href="/blog/${e(row.slug)}/" class="blog-read" aria-label="Ler ${e(d.title)}">${arrow}</a></div></div></article>`;
}
