import { initialArticles,coverAssets,models,units } from './blog-catalog.mjs';
import { validateDraft,permission } from './cms-domain.mjs';
import { blogIndex,articlePage,renderHomeBlog,coverSource,articleOffers } from './blog-view.mjs';
import { getPasswordActor } from './cms-auth.mjs';
const q=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const rows=async(env,sql,...args)=>(await q(env,sql,...args).all()).results;
const secure={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Robots-Tag':'noindex,nofollow'};
export async function ensureBlogSeed(env){
 const count=await q(env,"SELECT COUNT(*) AS n FROM cms_content WHERE id IN (?,?,?)",...initialArticles.map(a=>a.id)).first();if(count?.n===initialArticles.length)return;
 // Authorized editorial seed is outside schema migrations and never overwrites edits.
 for(const article of initialArticles){
  const draft=JSON.stringify(validateDraft(article.draft)),time=article.published_at;
  const snapshot={id:article.id,kind:'blog',slug:article.slug,status:'published',draft_json:draft,published_json:draft,version:1,created_by:'editorial-seed',updated_by:'editorial-seed',created_at:time,updated_at:time,published_at:time};
  await env.DB.batch([
   q(env,"INSERT OR IGNORE INTO cms_content(id,kind,slug,status,draft_json,published_json,version,created_by,updated_by,created_at,updated_at,published_at) VALUES(?,'blog',?,'published',?,?,1,'editorial-seed','editorial-seed',?,?,?)",article.id,article.slug,draft,draft,time,time,time),
   q(env,"INSERT OR IGNORE INTO cms_revisions(id,content_id,version,action,snapshot_json,actor_id,created_at) SELECT ?,id,1,'content.publish',?,'editorial-seed',? FROM cms_content WHERE id=? AND created_by='editorial-seed'",article.id+'-initial',JSON.stringify(snapshot),time,article.id),
  ]);
 }
}
export async function publishedArticles(env){await ensureBlogSeed(env);return rows(env,"SELECT * FROM cms_content WHERE kind='blog' AND status='published' AND published_json IS NOT NULL ORDER BY published_at DESC,id ASC LIMIT 200");}
export async function replaceHomeBlog(html,env){return html.replace(/<!-- BLOG_LATEST_START -->[\s\S]*?<!-- BLOG_LATEST_END -->/,'<!-- BLOG_LATEST_START -->'+renderHomeBlog(await publishedArticles(env))+'<!-- BLOG_LATEST_END -->');}
export async function blogOptions(env){return {models,units,cover_assets:coverAssets,campaigns:await rows(env,"SELECT id,slug,published_json FROM cms_content WHERE kind='ofertas' AND status='published' AND published_json IS NOT NULL ORDER BY published_at DESC LIMIT 200")};}
export async function handleBlog(request,env){
 const url=new URL(request.url),path=url.pathname;
 const publicRoute=path==='/blog'||path.startsWith('/blog/')||path==='/api/blog/latest'||path.startsWith('/api/blog/offers/');
 const preview=path.startsWith('/admin/preview/');if(!publicRoute&&!preview)return null;
 if(!['GET','HEAD'].includes(request.method))return new Response('Método não permitido',{status:405,headers:secure});
 if(!env.DB)return new Response('Conteúdo temporariamente indisponível',{status:503,headers:secure});
 let selected=null;
 if(preview){const actor=await getPasswordActor(request,env);if(!permission(actor,'content'))return null;selected=await q(env,'SELECT * FROM cms_content WHERE id=?',path.split('/')[3]).first();if(selected?.kind!=='blog')return null;}
 const articles=await publishedArticles(env);
 if(path==='/api/blog/latest')return new Response(JSON.stringify({models:models.map(m=>({id:m.id,name:m.name})),items:articles.slice(0,3).map(r=>{const d=JSON.parse(r.published_json);return {id:r.id,slug:r.slug,published_at:r.published_at,cover_url:coverSource(d),draft:{title:d.title,summary:d.summary,category:d.category,cover_alt:d.cover_alt,model_ids:d.model_ids}};})}),{headers:{...secure,'Content-Type':'application/json; charset=utf-8'}});
 const campaigns=await rows(env,"SELECT * FROM cms_content WHERE kind='ofertas' AND status='published' AND published_json IS NOT NULL");
 if(path.startsWith('/api/blog/offers/')){
  const slug=path.slice('/api/blog/offers/'.length).replace(/\/$/,'');const article=articles.find(r=>r.slug===slug);
  return new Response(JSON.stringify(article?articleOffers(JSON.parse(article.published_json),campaigns):{error:'Artigo não encontrado.'}),{status:article?200:404,headers:{...secure,'Content-Type':'application/json; charset=utf-8'}});
 }
 if(preview)return new Response(articlePage(selected,{origin:url.origin,preview:true,campaigns,related:articles}),{headers:secure});
 const slug=path.replace(/^\/blog\/?/,'').replace(/\/index\.html$/,'').replace(/^index\.html$/,'').replace(/\/$/,'');
 if(!slug)return new Response(blogIndex(articles,{origin:url.origin,model:url.searchParams.get('modelo')}),{headers:secure});
 const article=articles.find(r=>r.slug===slug);
 if(!article)return new Response(blogIndex([],{origin:url.origin}),{status:404,headers:secure});
 return new Response(articlePage(article,{origin:url.origin,campaigns,related:articles.filter(r=>r.id!==article.id)}),{headers:secure});
}
