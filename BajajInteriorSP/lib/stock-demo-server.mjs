import {stockDemos} from './stock-demo-catalog.mjs';
import {validateDraft,assertPublishable,fail} from './cms-domain.mjs';

const q=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const actor='authorized-stock-demo-v1';
const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');

// One authorized seed, outside migrations. Existing records (including withdrawn
// examples and private edits) are never recreated or overwritten by this routine.
export async function ensureStockDemos(env,request){
 if(env.CMS_SKIP_STOCK_DEMOS==='1')return;
 if(!env.DB||!env.BUCKET)fail(503,'Não foi possível preparar os cadastros de demonstração.');
 const present=(await q(env,`SELECT id FROM cms_content WHERE id IN (${stockDemos.map(()=>'?').join(',')})`,...stockDemos.map(r=>r.id)).all()).results;
 if(present.length===stockDemos.length)return;
 if(!env.ASSETS)fail(503,'As imagens de demonstração estão temporariamente indisponíveis.');
 const existing=new Set(present.map(r=>r.id));
 for(const sample of stockDemos){
  if(existing.has(sample.id))continue;
  const time=new Date().toISOString();
  for(const photo of sample.photos){
   const key='stock-demonstration/v1/'+photo.file;
   const record=await q(env,'SELECT id FROM cms_media WHERE id=?',photo.id).first();
   if(record&&await env.BUCKET.head(key))continue;
   const response=await env.ASSETS.fetch(new Request(new URL('/assets/'+photo.file,request.url)));
   if(!response.ok)fail(503,'Uma imagem ilustrativa não está disponível. Tente novamente.');
   const bytes=await response.arrayBuffer();
   if(!bytes.byteLength||bytes.byteLength>10*1024*1024)fail(503,'Não foi possível preparar uma imagem ilustrativa.');
   await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'image/webp'}});
   await q(env,'INSERT OR IGNORE INTO cms_media(id,object_key,name,mime,size,sha256,alt,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)',photo.id,key,'Demonstração · '+photo.file,'image/webp',bytes.byteLength,await digest(bytes),photo.alt,actor,time).run();
  }
  const draft=validateDraft(sample.draft,{kind:'seminovas'});assertPublishable(draft,'seminovas');
  const text=JSON.stringify(draft),row={id:sample.id,kind:'seminovas',slug:sample.slug,status:'published',draft_json:text,published_json:text,stock_code:draft.stock_code,version:1,created_by:actor,updated_by:actor,created_at:time,updated_at:time,published_at:time};
  await env.DB.batch([
   q(env,"INSERT OR IGNORE INTO cms_content(id,kind,slug,status,draft_json,published_json,stock_code,version,created_by,updated_by,created_at,updated_at,published_at) VALUES(?,'seminovas',?,'published',?,?,?,1,?,?,?,?,?)",row.id,row.slug,text,text,row.stock_code,actor,actor,time,time,time),
   q(env,"INSERT OR IGNORE INTO cms_revisions(id,content_id,version,action,snapshot_json,actor_id,created_at) SELECT ?,id,1,'content.demo_seed',?,?,? FROM cms_content WHERE id=? AND created_by=?",row.id+'-initial',JSON.stringify(row),actor,time,row.id,actor),
   q(env,"INSERT OR IGNORE INTO cms_audit(id,actor_id,actor_name,action,target_id,created_at) SELECT ?,?,'Demonstração autorizada','content.demo_seed',id,? FROM cms_content WHERE id=? AND created_by=?",row.id+'-audit',actor,time,row.id,actor),
  ]);
 }
}
