import {fail} from './cms-primitives.mjs';
import {COMMERCE_KINDS,commerceState,commercePublic,publishedDraft,validateBanner} from './commerce-domain.mjs';
export const q=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
export const one=(env,sql,...args)=>q(env,sql,...args).first();
export const all=async(env,sql,...args)=>(await q(env,sql,...args).all()).results;
export const commerceRows=env=>all(env,"SELECT * FROM cms_content WHERE kind IN ('ofertas','seminovas') ORDER BY published_at DESC,created_at DESC LIMIT 1000");
export async function pageBanner(env){return one(env,"SELECT * FROM commerce_page WHERE id='ofertas'");}
export async function publicMediaAllowed(env,id,time=Date.now()){
 const rows=await all(env,"SELECT kind,status,published_json FROM cms_content WHERE status='published' AND published_json IS NOT NULL AND (json_extract(published_json,'$.cover_id')=? OR EXISTS(SELECT 1 FROM json_each(json_extract(published_json,'$.attachments')) WHERE value=?) OR EXISTS(SELECT 1 FROM json_each(json_extract(published_json,'$.gallery_ids')) WHERE value=?))",id,id,id);
 if(rows.some(row=>row.kind==='blog'||COMMERCE_KINDS.includes(row.kind)&&commercePublic(row,time)))return true;
 const page=await pageBanner(env);if(!page?.published_json)return false;
 const draft=JSON.parse(page.published_json);if(![draft.desktop_id,draft.mobile_id].includes(id))return false;
 const campaign=await one(env,'SELECT * FROM cms_content WHERE id=?',draft.campaign_id);return commerceState(campaign,time)==='active';
}
export async function checkBannerMedia(env,draft,{publishing=false}={}){
 const ids=[...new Set([draft.desktop_id,draft.mobile_id].filter(Boolean))];
 if(publishing&&(!draft.campaign_id||ids.length<1||!draft.desktop_id||!draft.mobile_id||!draft.alt))fail(422,'Selecione a campanha, as imagens desktop/mobile e a descrição do banner.');
 if(draft.campaign_id){const campaign=await one(env,"SELECT id FROM cms_content WHERE id=? AND kind='ofertas'",draft.campaign_id);if(!campaign)fail(422,'Selecione uma campanha cadastrada.');}
 for(const id of ids){const media=await one(env,'SELECT * FROM cms_media WHERE id=?',id);if(!media?.mime.startsWith('image/'))fail(422,'O banner deve usar imagens da biblioteca.');if(publishing&&!await env.BUCKET.head(media.object_key))fail(422,'Uma imagem do banner não está disponível. Reenvie antes de publicar.');}
}
const response=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function bannerAdmin(request,env,actor,{json,action}={}){
 const row=await pageBanner(env);
 if(request.method==='GET')return response({item:row?{...row,draft:JSON.parse(row.draft_json)}:{id:'ofertas',version:0,draft:{campaign_id:null,desktop_id:null,mobile_id:null,alt:''},published_json:null},preview_url:'/admin/commerce-preview/ofertas/'});
 const input=await json(request),time=new Date().toISOString();
 if(!Number.isInteger(input.version)||input.version!==(row?.version||0))fail(409,'O banner mudou em outra sessão. Reabra antes de salvar.');
 let draft=row?JSON.parse(row.draft_json):validateBanner({}),published=row?.published_json||null;
 if(request.method==='PUT'&&!action){draft=validateBanner(input.draft||{});await checkBannerMedia(env,draft);}
 else if(request.method==='POST'&&action==='publish'){await checkBannerMedia(env,draft,{publishing:true});published=JSON.stringify(draft);}
 else if(request.method==='POST'&&action==='unpublish')published=null;
 else fail(405,'Ação não permitida.');
 const version=(row?.version||0)+1,auditId=crypto.randomUUID();
 const statement=row?q(env,"UPDATE commerce_page SET draft_json=?,published_json=?,version=?,updated_at=?,updated_by=? WHERE id='ofertas' AND version=?",JSON.stringify(draft),published,version,time,actor.id,row.version):q(env,"INSERT OR IGNORE INTO commerce_page(id,draft_json,published_json,version,updated_at,updated_by) VALUES('ofertas',?,?,?,?,?)",JSON.stringify(draft),published,version,time,actor.id);
 const results=await env.DB.batch([statement,q(env,"INSERT INTO cms_audit(id,actor_id,actor_name,action,target_id,created_at) SELECT ?,?,?,?,'ofertas-page',? FROM commerce_page WHERE id='ofertas' AND version=? AND updated_at=? AND changes()=1",auditId,actor.id,actor.name,'commerce.banner.'+(action||'save'),time,version,time)]);
 if(results[0].meta.changes!==1)fail(409,'Outra pessoa alterou o banner. Reabra a versão atual.');
 return response({item:{id:'ofertas',version,draft,published_json:published,updated_at:time},preview_url:'/admin/commerce-preview/ofertas/'});
}
export function lockCommerceDraft(current,draft,{restoring=false}={}){
 if(current.kind!=='seminovas')return draft;
 const d=publishedDraft(current);
 if(current.stock_code&&current.published_at){if(restoring)draft.stock_code=current.stock_code;else if(draft.stock_code!==current.stock_code)fail(422,'O código do estoque fica preservado após a primeira publicação.');}
 if(d&&!!draft.is_demo!==!!d.is_demo){if(restoring)draft.is_demo=!!d.is_demo;else fail(422,'Um cadastro de demonstração não pode ser convertido em anúncio real. Crie um novo cadastro para o exemplar real.');}
 if(d){if(restoring)draft.availability=d.availability;else if(draft.availability!==d.availability)fail(422,'Use as ações de disponibilidade para reservar, vender ou reativar o exemplar.');}
 return draft;
}
export function operationalChange(current,actor,action,input){
 const d=publishedDraft(current);if(!d)fail(422,'Publique este cadastro antes de alterar seu estado.');
 if(current.kind==='ofertas'){
  if(action==='pause'&&current.status==='published')return {...current,status:'paused'};
  if(action==='resume'&&current.status==='paused'){if(Date.parse(d.valid_until)<=Date.now())fail(422,'A campanha já venceu. Atualize a validade no rascunho e publique novamente.');return {...current,status:'published'};}
  if(action==='end'&&['published','paused'].includes(current.status))return {...current,status:'ended'};
 }else if(current.kind==='seminovas'&&action==='availability'){
  const allowed=['available','reserved','sold','withdrawn'];if(!allowed.includes(input.availability))fail(422,'Escolha uma disponibilidade válida.');
  if(current.status!=='published')fail(422,'A disponibilidade só pode ser alterada em um anúncio publicado.');
  if(['sold','withdrawn'].includes(d.availability)&&input.availability!==d.availability&&actor.role!=='admin')fail(403,'Peça ao administrador para reativar um exemplar vendido ou retirado.');
  const draft=JSON.parse(current.draft_json);return {...current,published_json:JSON.stringify({...d,availability:input.availability}),draft_json:JSON.stringify({...draft,availability:input.availability})};
 }
 fail(422,'Esta ação não está disponível no estado atual.');
}
