import { renderBlogCard } from './blog-card.mjs';
const section=document.querySelector('.home-blog');
if(section){
 const grid=section.querySelector('[data-latest-articles]')||section.querySelector('.blog-grid'),status=section.querySelector('[data-blog-status]');
 async function refresh(){
  if(!grid)return;grid.setAttribute('aria-busy','true');
  try{
   const response=await fetch('/api/blog/latest',{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw new Error('indisponível');
   const data=await response.json();if(!Array.isArray(data.items))throw new Error('inválido');
   grid.innerHTML=data.items.slice(0,3).map(row=>renderBlogCard(row,{models:data.models||[],coverUrl:row.cover_url})).join('');
   if(status){status.textContent=data.items.length?'':'Novas histórias estão a caminho. Conheça os demais conteúdos no Blog.';status.hidden=!!data.items.length;}
  }catch{if(status){status.textContent='Não foi possível carregar os últimos artigos. Acesse o Blog pelo link acima.';status.hidden=false;}}
  finally{grid.setAttribute('aria-busy','false');}
 }
 refresh();
}
