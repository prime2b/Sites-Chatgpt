import {ensureStockDemos} from './stock-demo-server.mjs';
import {CmsError,fail} from './cms-primitives.mjs';
import {getPasswordActor} from './cms-auth.mjs';
import {commerceRows,pageBanner,one} from './commerce-data.mjs';
import {COMMERCE_KINDS,commerceState,refreshAfter} from './commerce-domain.mjs';
import {listingPage,listingFragment,readFilters,detailPage,detailFragment,commercePath,unavailablePage} from './commerce-view.mjs';
const headers={'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex,nofollow','Referrer-Policy':'strict-origin-when-cross-origin'};
const html=(body,status=200,method='GET')=>new Response(method==='HEAD'?null:body,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8'}});
const canEdit=actor=>actor?.active&&['editor','admin'].includes(actor.role);
export async function handleCommerce(request,env){
 const url=new URL(request.url),path=url.pathname;
 const publicPath=/^\/(?:ofertas|seminovas)(?:\/|$)/.test(path),apiPath=path.startsWith('/api/commerce/'),previewPage=path==='/admin/commerce-preview/ofertas/',preview=path.startsWith('/admin/preview/'),legacy=/^\/conteudos\/(ofertas|seminovas)\//.test(path);
 if(!publicPath&&!apiPath&&!preview&&!previewPage&&!legacy)return null;
 try{
  if(!['GET','HEAD'].includes(request.method))return json({error:'Método não permitido.'},405);
  if(!env.DB)fail(503,'As condições estão temporariamente indisponíveis. Tente novamente.');
  let time=Date.now();const options={origin:url.origin,time,preview:preview||previewPage};
  if(preview||previewPage){
   const actor=await getPasswordActor(request,env);if(!canEdit(actor))return null;
   if(previewPage){const [rows,page]=await Promise.all([commerceRows(env),pageBanner(env)]);return html(listingPage(rows,page,readFilters(url),options),200,request.method);}
   const row=await one(env,'SELECT * FROM cms_content WHERE id=?',path.split('/')[3]);if(!COMMERCE_KINDS.includes(row?.kind))return null;
   return html(detailPage(row,options),200,request.method);
  }
  await ensureStockDemos(env,request);
  if(path==='/seminovas'||path==='/seminovas/')return new Response(null,{status:302,headers:{...headers,Location:'/ofertas/?aba=seminovas'}});
  if(path==='/ofertas'||path==='/ofertas/'||path==='/ofertas/index.html'||path==='/api/commerce/fragment'){
   const [rows,page]=await Promise.all([commerceRows(env),pageBanner(env)]),filters=readFilters(url);time=Date.now();options.time=time;
   return apiPath?json({html:listingFragment(rows,page,filters,options),refresh_after_ms:refreshAfter(rows,time)}):html(listingPage(rows,page,filters,options),200,request.method);
  }
  const match=apiPath?path.match(/^\/api\/commerce\/detail\/(ofertas|seminovas)\/([a-z0-9-]+)\/?$/):legacy?path.match(/^\/conteudos\/(ofertas|seminovas)\/([a-z0-9-]+)\/?$/):path.match(/^\/(ofertas|seminovas)\/([a-z0-9-]+)\/?$/);
  if(!match)return html(unavailablePage('Este endereço não está disponível.',url.origin),404,request.method);
  const row=await one(env,'SELECT * FROM cms_content WHERE kind=? AND slug=?',match[1],match[2]);
  // A never-published draft reveals no title, image or business fields.
  if(!row?.published_at||!row.published_json){if(apiPath)return json({error:'Anúncio indisponível.'},404);return html(unavailablePage('Este anúncio não está disponível.',url.origin),404,request.method);}
  if(legacy)return new Response(null,{status:301,headers:{...headers,Location:commercePath(row)}});
  time=Date.now();options.time=time;const state=commerceState(row,time),available=['active','available','reserved'].includes(state),status=available?200:['expired','ended','sold','withdrawn'].includes(state)?410:404;
  if(apiPath)return json({html:detailFragment(row,options),refresh_after_ms:row.kind==='seminovas'?30000:refreshAfter([row],time),active:available});
  return html(detailPage(row,options),status,request.method);
 }catch(error){return apiPath?json({error:error instanceof CmsError?error.message:'Não foi possível atualizar as condições.'},error instanceof CmsError?error.status:503):html(unavailablePage(error instanceof CmsError?error.message:'Tente novamente em instantes.',url.origin),error instanceof CmsError?error.status:503,request.method);}
}
