import {ensureStockDemos} from './stock-demo-server.mjs';
import { KINDS,CmsError,fail,permission,guardMutation,validateDraft,assertPublishable,mediaIds,inspectUpload,contentUrl,renderContent,escapeHtml,slugify } from './cms-domain.mjs';
import { adminShell,accessPage } from './cms-view.mjs';
import { getPasswordActor,handleAuth,issuePasswordLink } from './cms-auth.mjs';
import { loginPage } from './auth-view.mjs';
import { blogOptions,ensureBlogSeed } from './blog-server.mjs';
import { contactsAdmin } from './contact-server.mjs';
import {COMMERCE_KINDS,commerceState,STATES} from './commerce-domain.mjs';
import {publicMediaAllowed,bannerAdmin,lockCommerceDraft,operationalChange} from './commerce-data.mjs';
import {handleCommerce} from './commerce-server.mjs';
import {handleAcademy} from './academy-server.mjs';

const now=()=>new Date().toISOString();
const publicationStamp=row=>new Date(Math.max(Date.now(),(Date.parse(row.published_at)||0)+1)).toISOString();
const uid=()=>crypto.randomUUID();
const stmt=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const one=(env,sql,...args)=>stmt(env,sql,...args).first();
const all=async(env,sql,...args)=>(await stmt(env,sql,...args).all()).results;
const secure={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Robots-Tag':'noindex, nofollow'};
function response(data,status=200,extra={}) {return new Response(JSON.stringify(data),{status,headers:{...secure,'Content-Type':'application/json; charset=utf-8',...extra}});}
function html(body,status=200) {return new Response(body,{status,headers:{...secure,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com"}});}
async function json(request) {
  if(Number(request.headers.get('Content-Length')||0)>100000) fail(413,'Conteúdo muito grande.');
  const text=await request.text();if(text.length>100000)fail(413,'Conteúdo muito grande.');
  try{return JSON.parse(text);}catch{fail(400,'Envio inválido. Atualize a página e tente novamente.');}
}
export const getActor=getPasswordActor;
const requirePermission=(actor,capability='content')=>{if(!actor)fail(401,'Entre com a conta autorizada para continuar.');if(!permission(actor,capability))fail(403,'Sua conta não tem permissão para esta área.');};
function audit(env,actor,action,target,t=now()) {return stmt(env,'INSERT INTO cms_audit(id,actor_id,actor_name,action,target_id,created_at) VALUES(?,?,?,?,?,?)',uid(),actor.id,actor.name,action,target,t);}
const mapContent=row=>row?{...row,draft:JSON.parse(row.draft_json),has_unpublished_changes:row.draft_json!==row.published_json,public_url:contentUrl(row),preview_url:`/admin/preview/${row.id}/`,...(COMMERCE_KINDS.includes(row.kind)?{commerce_state:commerceState(row),commerce_label:(JSON.parse(row.draft_json).is_demo?'Demonstração · ':'')+STATES[commerceState(row)]}:{} )}:null;
async function validateMedia(env,draft,{published=false}={}) {
  const ids=mediaIds(draft);if(!ids.length)return [];
  const rows=await all(env,`SELECT * FROM cms_media WHERE id IN (${ids.map(()=>'?').join(',')})`,...ids);
  if(rows.length!==ids.length)fail(422,'Um arquivo deste conteúdo não está mais disponível. Selecione novamente.');
  if(draft.cover_id&&!rows.find(r=>r.id===draft.cover_id)?.mime.startsWith('image/'))fail(422,'A capa precisa ser uma imagem.');
  if((draft.gallery_ids||[]).some(id=>!rows.find(r=>r.id===id)?.mime.startsWith('image/')))fail(422,'A galeria da seminova aceita somente imagens.');
  if(published){
    const heads=await Promise.all(rows.map(m=>env.BUCKET.head(m.object_key)));
    if(heads.some(h=>!h))fail(422,'Um arquivo não foi encontrado. Reenvie o material antes de publicar.');
  }
  return rows;
}
async function revise(env,actor,current,next,action,expectedVersion) {
  if(!Number.isInteger(expectedVersion)||expectedVersion!==current.version)fail(409,'Este conteúdo mudou em outra sessão. Reabra a versão mais recente antes de salvar.');
  const t=now(), revisionId=uid(), version=current.version+1;
  const snapshot={...next,version,updated_at:t,updated_by:actor.id};
  const result=await env.DB.batch([
    stmt(env,'INSERT INTO cms_revisions(id,content_id,version,action,snapshot_json,actor_id,created_at) SELECT ?,id,version+1,?,?,?,? FROM cms_content WHERE id = ? AND version = ?',revisionId,action,JSON.stringify(snapshot),actor.id,t,current.id,expectedVersion),
    stmt(env,'UPDATE cms_content SET slug=?,status=?,draft_json=?,published_json=?,published_at=?,stock_code=?,version=?,updated_by=?,updated_at=? WHERE id=? AND version=?',next.slug,next.status,next.draft_json,next.published_json,next.published_at,next.stock_code||null,version,actor.id,t,current.id,expectedVersion),
    stmt(env,'INSERT INTO cms_audit(id,actor_id,actor_name,action,target_id,created_at) SELECT ?,?,?,?,?,? FROM cms_revisions WHERE id=?',uid(),actor.id,actor.name,action,current.id,t,revisionId),
  ]);
  if(result[1].meta.changes!==1)fail(409,'Outra sessão alterou este conteúdo. Reabra antes de tentar novamente.');
  return mapContent(await one(env,'SELECT * FROM cms_content WHERE id = ?',current.id));
}
async function serveMedia(request,env,id,{privateFile=false,actor=null}={}) {
  if(privateFile)requirePermission(actor);
  const media=await one(env,'SELECT * FROM cms_media WHERE id=?',id);if(!media)fail(404,'Arquivo não encontrado.');
  if(!privateFile){
    const linked=await publicMediaAllowed(env,id);
    if(!linked)fail(404,'Arquivo não encontrado.');
  }
  const object=await env.BUCKET.get(media.object_key);if(!object)fail(404,'Arquivo não encontrado.');
  const filename=encodeURIComponent(media.name);
  const headers={...secure,'Content-Type':media.mime,'Content-Length':String(media.size),'Content-Disposition':`${media.mime==='application/pdf'?'attachment':'inline'}; filename*=UTF-8''${filename}`,'Content-Security-Policy':"default-src 'none'; sandbox",'Cache-Control':privateFile?'private, no-store':'public, max-age=0, must-revalidate'};
  return new Response(request.method==='HEAD'?null:object.body,{headers});
}
async function upload(request,env,actor) {
  if(Number(request.headers.get('Content-Length')||0)>21*1024*1024)fail(413,'Limite: 10 MB por imagem ou 20 MB por PDF.');
  const form=await request.formData(),file=form.get('file');
  if(!file||typeof file.arrayBuffer!=='function')fail(400,'Selecione um arquivo.');
  if(file.size>20*1024*1024)fail(413,'Arquivo maior que 20 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer()),mime=inspectUpload(bytes,file.type);
  const id=uid(),object_key=`cms/${id}`,t=now();
  const name=String(file.name||'arquivo').split(/[\\/]/).pop().replace(/[\x00-\x1f\x7f]/g,'').slice(0,160)||'arquivo';
  const alt=String(form.get('alt')||name).trim().slice(0,250);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
  await env.BUCKET.put(object_key,bytes,{httpMetadata:{contentType:mime}});
  try{await env.DB.batch([
    stmt(env,'INSERT INTO cms_media(id,object_key,name,mime,size,sha256,alt,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)',id,object_key,name,mime,bytes.length,hash,alt,actor.id,t),audit(env,actor,'media.upload',id,t),
  ]);}catch(error){await env.BUCKET.delete(object_key);throw error;}
  return response({media:await one(env,'SELECT id,name,mime,size,alt,created_at FROM cms_media WHERE id=?',id)},201);
}
async function userAction(request,env,actor,id) {
  requirePermission(actor,'admin');const creating=!id;const input=await json(request), t=now();
  const email=String(input.email||'').trim().toLowerCase(),name=String(input.name||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||name.length<2||name.length>100)fail(400,'Informe nome e e-mail válidos.');
  if(!['admin','editor'].includes(input.role))fail(400,'Perfil inválido.');
  const active=input.active===false||input.active===0?0:1,canContacts=input.can_contacts===true||input.can_contacts===1?1:0;
  let canTrainingManage=input.can_training_manage===true||input.can_training_manage===1?1:0,canTrainingEdit=input.can_training_edit===true||input.can_training_edit===1?1:0;
  if(id){
    const old=await one(env,'SELECT * FROM cms_users WHERE id=?',id);if(!old)fail(404,'Pessoa não encontrada.');
    if(old.id==='owner')fail(403,'O administrador responsável é preservado.');
    if(old.id===actor.id&&(!active||input.role!=='admin'))fail(422,'Peça a outro administrador para alterar seu próprio acesso.');

    if(input.can_training_manage===undefined)canTrainingManage=old.can_training_manage;
    if(input.can_training_edit===undefined)canTrainingEdit=old.can_training_edit;
    await env.DB.batch([stmt(env,'UPDATE cms_users SET email=?,name=?,role=?,active=?,can_contacts=?,can_training_manage=?,can_training_edit=?,updated_at=? WHERE id=?',email,name,input.role,active,canContacts,canTrainingManage,canTrainingEdit,t,id),audit(env,actor,active?'user.update':'user.suspend',id,t)]);
  }else{
    id=uid();await env.DB.batch([stmt(env,'INSERT INTO cms_users(id,user_id,email,name,role,active,can_contacts,can_training_manage,can_training_edit,created_at,updated_at) VALUES(?,NULL,?,?,?,?,?,?,?,?,?)',id,email,name,input.role,active,canContacts,canTrainingManage,canTrainingEdit,t,t),audit(env,actor,'user.create',id,t)]);
  }
  return response({user:await one(env,'SELECT u.id,u.name,u.email,u.role,u.active,u.can_contacts,u.can_training_manage,u.can_training_edit,u.created_at,c.username FROM cms_users u LEFT JOIN cms_credentials c ON c.user_id=u.id WHERE u.id=?',id),...(creating?await issuePasswordLink(request,env,id):{})});
}
async function api(request,env,actor,parts) {
  requirePermission(actor);guardMutation(request);
  const [area,id,action]=parts,method=request.method;
  if(area==='commerce-page')return bannerAdmin(request,env,actor,{json,action:id});
  if(area==='blog-options'&&method==='GET')return response(await blogOptions(env));
  if(area==='me'&&method==='GET')return response({user:{id:actor.id,name:actor.name,email:actor.email,username:actor.username,role:actor.role,can_contacts:!!actor.can_contacts,can_training_manage:!!actor.can_training_manage,can_training_edit:!!actor.can_training_edit},capabilities:{admin:permission(actor,'admin'),contacts:permission(actor,'contacts'),training_manage:permission(actor,'training_manage'),training_edit:permission(actor,'training_edit')}});
  if(area==='content'){
    if(method==='GET'&&!id){
      await ensureBlogSeed(env);await ensureStockDemos(env,request);
      const kind=new URL(request.url).searchParams.get('kind');
      if(kind&&!Object.hasOwn(KINDS,kind))fail(400,'Área inválida.');
      const rows=kind?await all(env,'SELECT * FROM cms_content WHERE kind=? ORDER BY updated_at DESC LIMIT 300',kind):await all(env,'SELECT * FROM cms_content ORDER BY updated_at DESC LIMIT 300');
      return response({items:rows.map(mapContent)});
    }
    if(method==='POST'&&!id){
      const input=await json(request);if(!Object.hasOwn(KINDS,input.kind))fail(400,'Área inválida.');
      const draft=validateDraft(input.draft,{kind:input.kind}),slug=slugify(input.slug||draft.title);if(!slug)fail(400,'Informe um endereço válido.');
      await validateMedia(env,draft);
      const row={id:uid(),kind:input.kind,slug,status:'draft',draft_json:JSON.stringify(draft),published_json:null,published_at:null,stock_code:input.kind==='seminovas'?draft.stock_code||null:null,version:1,created_by:actor.id,updated_by:actor.id,created_at:now(),updated_at:now()};
      await env.DB.batch([
        stmt(env,'INSERT INTO cms_content(id,kind,slug,status,draft_json,published_json,version,created_by,updated_by,created_at,updated_at,published_at,stock_code) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',row.id,row.kind,row.slug,row.status,row.draft_json,null,1,actor.id,actor.id,row.created_at,row.updated_at,null,row.stock_code),
        stmt(env,'INSERT INTO cms_revisions(id,content_id,version,action,snapshot_json,actor_id,created_at) VALUES(?,?,?,?,?,?,?)',uid(),row.id,1,'content.create',JSON.stringify(row),actor.id,row.created_at),audit(env,actor,'content.create',row.id,row.created_at),
      ]);
      return response({item:mapContent(row)},201);
    }
    const current=await one(env,'SELECT * FROM cms_content WHERE id=?',id||'');if(!current)fail(404,'Conteúdo não encontrado.');
    if(method==='GET'&&!action)return response({item:mapContent(current)});
    if(method==='GET'&&action==='revisions')return response({items:await all(env,'SELECT r.id,r.version,r.action,r.created_at,u.name AS actor_name FROM cms_revisions r LEFT JOIN cms_users u ON r.actor_id=u.id WHERE content_id=? ORDER BY version DESC LIMIT 100',id)});
    if(method==='PUT'&&!action){
      const input=await json(request),draft=lockCommerceDraft(current,validateDraft(input.draft,{kind:current.kind}));await validateMedia(env,draft);
      let slug=slugify(input.slug||current.slug);if(!slug)fail(400,'Informe um endereço válido.');
      if(current.published_at&&slug!==current.slug)fail(422,'O endereço fica preservado após a primeira publicação.');
      return response({item:await revise(env,actor,current,{...current,slug,stock_code:current.kind==='seminovas'?draft.stock_code||null:null,draft_json:JSON.stringify(draft)},'content.save',input.version)});
    }
    if(method==='POST'&&['pause','resume','end','availability'].includes(action)){
      const input=await json(request),next=operationalChange(current,actor,action,input);
      next.published_at=publicationStamp(current);
      return response({item:await revise(env,actor,current,next,'content.'+action,input.version)});
    }
    if(method==='POST'&&['publish','unpublish','restore'].includes(action)){
      const input=await json(request);let next={...current};
      if(action==='publish'){
        const draft=lockCommerceDraft(current,validateDraft(JSON.parse(current.draft_json),{kind:current.kind}));assertPublishable(draft,current.kind);await validateMedia(env,draft,{published:true});
        next={...next,status:'published',published_json:JSON.stringify(draft),published_at:publicationStamp(current)};
      }else if(action==='unpublish')next={...next,status:'draft',published_json:COMMERCE_KINDS.includes(current.kind)?current.published_json:null};
      else{
        const revision=await one(env,'SELECT * FROM cms_revisions WHERE id=? AND content_id=?',String(input.revision_id||''),id);
        if(!revision)fail(404,'Versão não encontrada.');
        const snapshot=JSON.parse(revision.snapshot_json),draft=lockCommerceDraft(current,validateDraft(JSON.parse(snapshot.draft_json),{kind:current.kind}),{restoring:true});await validateMedia(env,draft);
        next={...next,stock_code:current.kind==='seminovas'?draft.stock_code||null:null,draft_json:JSON.stringify(draft)};
      }
      return response({item:await revise(env,actor,current,next,`content.${action}`,input.version)});
    }
  }
  if(area==='media'){
    if(method==='GET'&&id&&action==='file')return serveMedia(request,env,id,{privateFile:true,actor});
    if(method==='GET'&&!id)return response({items:await all(env,'SELECT id,name,mime,size,alt,created_at FROM cms_media ORDER BY created_at DESC LIMIT 500')});
    if(method==='POST'&&!id)return upload(request,env,actor);
  }
  if(area==='users'){
    requirePermission(actor,'admin');
    if(method==='GET'&&!id)return response({items:await all(env,'SELECT u.id,u.name,u.email,u.role,u.active,u.can_contacts,u.can_training_manage,u.can_training_edit,u.created_at,c.username FROM cms_users u LEFT JOIN cms_credentials c ON c.user_id=u.id ORDER BY u.created_at')});
    if(method==='POST'&&id&&action==='reset'){const user=await one(env,'SELECT id,active FROM cms_users WHERE id=?',id);if(!user||!user.active)fail(404,'Acesso não encontrado ou suspenso.');if(id==='owner'&&actor.id!=='owner')fail(403,'O acesso responsável só pode ser redefinido pelo próprio administrador.');return response(await issuePasswordLink(request,env,id));}
    if((method==='POST'&&!id)||(method==='PUT'&&id))return userAction(request,env,actor,id);
  }
  if(area==='contacts')return contactsAdmin(request,env,actor,id);
  if(area==='audit'&&method==='GET')return response({items:await all(env,"SELECT a.id,a.actor_name,a.action,a.target_id,a.created_at FROM cms_audit a WHERE a.action LIKE 'content.%' OR a.action='media.upload' OR a.action LIKE 'commerce.banner.%' ORDER BY a.created_at DESC LIMIT 150")});
  if(area==='backup'&&method==='GET'){
    requirePermission(actor,'admin');
    const [content,revisions,media,commerce_page]=await Promise.all([all(env,'SELECT * FROM cms_content'),all(env,'SELECT * FROM cms_revisions'),all(env,'SELECT * FROM cms_media'),all(env,'SELECT * FROM commerce_page')]);
    await audit(env,actor,'backup.export','content').run();
    return response({format:'interiorsp-content-backup',version:2,created_at:now(),content,revisions,commerce_page,media:media.map(m=>({...m,download_url:`/api/admin/media/${m.id}/file`}))},200,{'Content-Disposition':`attachment; filename="interiorsp-conteudos-${now().slice(0,10)}.json"`});
  }
  fail(404,'Ação não encontrada.');
}
export async function handleCMS(request,env) {
  const commerce=await handleCommerce(request,env);if(commerce)return commerce;
  const url=new URL(request.url),path=url.pathname;
  if(path!=='/admin'&&!path.startsWith('/admin/')&&path!=='/api/admin'&&!path.startsWith('/api/admin/')&&!path.startsWith('/api/auth/')&&!path.startsWith('/midia/')&&!path.startsWith('/conteudos/'))return null;
  const adminPath=path==='/admin'||path.startsWith('/admin/');
  try{
    if(!env.DB||!env.BUCKET)fail(503,'O painel está temporariamente indisponível. Tente novamente em instantes.');
    const auth=await handleAuth(request,env);if(auth)return auth;
    if(path.startsWith('/midia/')){
      if(!['GET','HEAD'].includes(request.method))fail(405,'Método não permitido.');
      return await serveMedia(request,env,path.split('/')[2]);
    }
    if(path.startsWith('/conteudos/')){
      if(!['GET','HEAD'].includes(request.method))fail(405,'Método não permitido.');
      const [,kind,slug]=path.split('/').filter(Boolean);
      const row=await one(env,"SELECT * FROM cms_content WHERE kind=? AND slug=? AND status='published' AND published_json IS NOT NULL",kind||'',slug||'');
      if(!row)return html(accessPage({title:'Conteúdo indisponível',message:'Este conteúdo não está publicado. Você pode continuar navegando pelo site.',showLogin:false}),404);
      if(kind==='blog')return new Response(null,{status:301,headers:{Location:'/blog/'+row.slug+'/'}});
      const draft=JSON.parse(row.published_json),media=await validateMedia(env,draft);
      return html(renderContent(draft,{kind:row.kind,slug:row.slug,origin:url.origin,publishedAt:row.published_at,media,contentId:row.id}));
    }
    const actor=await getActor(request,env);
    if(actor||!adminPath){const academy=await handleAcademy(request,env,actor);if(academy)return academy;}
    if(adminPath){
      if(request.method!=='GET')fail(405,'Método não permitido.');
      if(path==='/admin/ativar/'||path==='/admin/ativar')return html(loginPage({setup:true}));
      if(!actor)return html(loginPage());
      if(path==='/admin/entrar/'||path==='/admin/entrar')return new Response(null,{status:303,headers:{Location:'/admin/'}});
      if(!permission(actor,'content'))return html(accessPage({title:'Acesso restrito',message:'Esta conta não tem acesso ao painel ou foi suspensa. Solicite a liberação ao administrador responsável.',showLogin:true,denied:true}),403);
      if(path.startsWith('/admin/preview/')){
        const row=await one(env,'SELECT * FROM cms_content WHERE id=?',path.split('/')[3]);if(!row)fail(404,'Conteúdo não encontrado.');
        const draft=JSON.parse(row.draft_json),media=await validateMedia(env,draft);
        return html(renderContent(draft,{preview:true,kind:row.kind,slug:row.slug,origin:url.origin,media}));
      }
      return html(adminShell(actor));
    }
    return await api(request,env,actor,path.replace(/^\/api\/admin\/?/,'').split('/').filter(Boolean));
  }catch(error){
    let status=error instanceof CmsError?error.status:500, message=error instanceof CmsError?error.message:'Não foi possível concluir a ação. Tente novamente; suas alterações não foram confirmadas.';
    if(String(error?.message).includes('UNIQUE constraint')){status=409;message=String(error.message).includes('stock_code')?'Já existe um exemplar com este código de estoque. Use um código próprio.':'Já existe um cadastro com este e-mail ou endereço. Use outro valor.';}
    if(!(error instanceof CmsError))console.error('CMS operation failed',{path,status,error:String(error?.message).slice(0,250)});
    return adminPath?html(accessPage({title:'Não foi possível abrir esta área',message,showLogin:status===401}),status):response({error:message},status);
  }
}
