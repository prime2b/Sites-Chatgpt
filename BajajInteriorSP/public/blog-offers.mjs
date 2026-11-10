import {createFreshness} from './commerce.mjs';
export function initBlogOffers(root,env=window){
 const doc=root.ownerDocument,banner=root.querySelector('[data-blog-banner]'),related=root.querySelector('[data-blog-related]');
 const hide=()=>{banner.hidden=true;related.hidden=true;};
 const controller=createFreshness({env,
  async load(){const response=await env.fetch('/api/blog/offers/'+encodeURIComponent(root.dataset.blogOffers),{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw Error('Ofertas indisponíveis.');return response.json();},
  stale:hide,failed:hide,
  apply(data){if(typeof data.banner_html!=='string'||typeof data.related_html!=='string')throw Error('Ofertas indisponíveis.');banner.innerHTML=data.banner_html;related.innerHTML=data.related_html;banner.hidden=false;related.hidden=false;},
 });
 controller.refresh();
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){controller.stop();hide();}else controller.resume();});
 env.addEventListener('pagehide',()=>{controller.stop();hide();});env.addEventListener('pageshow',event=>{if(event.persisted)controller.resume();});return controller;
}
if(typeof document!=='undefined')document.querySelectorAll('[data-blog-offers]').forEach(root=>initBlogOffers(root));
