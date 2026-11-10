import {extractText} from 'unpdf';
import {SOURCE,discover,digest,initialState,parseTableText,sourceUrl,validateTable} from './maintenance-domain.mjs';
import {tablesMarkup,maintenanceAdmin} from './maintenance-view.mjs';
import {getPasswordActor} from './cms-auth.mjs';
import {guardMutation,permission} from './cms-domain.mjs';
import {verifySync} from './maintenance-service-auth.mjs';
import {GATEWAY_KEY} from './netlify-gateway.mjs';
const STATE='maintenance/state-v1.json';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'};
const json=(value,status=200)=>Response.json(value,{status,headers});
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
export async function readState(env){const object=await env.BUCKET.get(STATE);return {state:object?await object.json():initialState(),etag:object?.etag};}
async function writeState(env,state,etag){const prior=await env.BUCKET.get(STATE);await env.BUCKET.put(`maintenance/versions/${state.revision}-${Date.now()}.json`,prior?await prior.text():JSON.stringify(initialState()),{httpMetadata:{contentType:'application/json'}});state.revision++;const result=await env.BUCKET.put(STATE,JSON.stringify(state),{httpMetadata:{contentType:'application/json'},onlyIf:etag?{etagMatches:etag}:{etagDoesNotMatch:'*'}});if(!result)fail(409,'Outra consulta terminou agora. Recarregue o painel.');return state;}
async function download(url,{page=false,fetcher=fetch}={}){
 const target=sourceUrl(url,{page});const res=await fetcher(target,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{Accept:page?'text/html':'application/pdf'}});
 if(!res.ok)throw Error(`Fonte indisponível (HTTP ${res.status}).`);
 const limit=page?2_000_000:8_000_000;if(Number(res.headers.get('Content-Length')||0)>limit)throw Error('Documento excede o limite de leitura.');
 const reader=res.body.getReader(),chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw Error('Documento excede o limite.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}if(!page&&!new TextDecoder().decode(bytes.slice(0,5)).startsWith('%PDF-'))throw Error('A fonte não retornou um PDF íntegro.');return bytes;
}
export async function syncMaintenance(env,{fetcher=fetch,time=Date.now(),force=false}={}){
 const {state,etag}=await readState(env);if(!force&&time-Date.parse(state.last_checked)<120_000&&state.revision>0)return state;
 const stamp=new Date(time).toISOString();state.last_checked=stamp;
 try{
  const page=await download(SOURCE,{page:true,fetcher});const pageHash=await digest(page);const links=discover(new TextDecoder().decode(page));
  await env.BUCKET.put(`maintenance/sources/${pageHash}.html`,page,{httpMetadata:{contentType:'text/html'}});
  const problems=[];let cursor=0;
  await Promise.all(Array.from({length:2},async()=>{while(cursor<state.tables.length){const index=cursor++,old=state.tables[index],url=links.get(old.id);try{
   const bytes=await download(url,{fetcher}),hash=await digest(bytes);const key=`maintenance/documents/${hash}.pdf`;
   if(!await env.BUCKET.head(key))await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'application/pdf'}});
   if(hash===old.source_sha256){state.tables[index]={...old,source_url:url};state.pending=state.pending.filter(x=>x.id!==old.id);continue;}
   let candidate=null,reason='Documento alterado: aguarda extração e validação.';
   try{const {text,totalPages}=await extractText(bytes,{mergePages:true});if(totalPages!==1)throw Error('Número de páginas mudou.');candidate=parseTableText(text,old,hash,url,{time});}
   catch(error){reason=error.message;}
   if(candidate){state.tables[index]=candidate;state.pending=state.pending.filter(x=>x.id!==old.id);}
   else{const pending={id:old.id,hash,url,at:stamp,reason,candidate:{...old,source_sha256:hash,source_url:url,confirmed_interval_note:undefined}};state.pending=[...state.pending.filter(x=>x.id!==old.id),pending];}
  }catch(error){problems.push(`${old.model}${old.version?' '+old.version:''}: ${error.message}`);}}}));
  state.source_page_sha256=pageHash;
  state.status=problems.length?'failed':state.pending.length?'review_required':'current';
  if(!problems.length)state.last_success=stamp;
  state.message=problems.length?problems.join(' '):state.pending.length?`${state.pending.length} documento(s) alterado(s) aguardam conferência no CMS.`:'Sete documentos oficiais conferidos. Versões validadas mantidas ou atualizadas.';
 }catch(error){state.status='failed';state.message=error.message;}
 state.history=[...state.history,{at:stamp,status:state.status,message:state.message}].slice(-60);
 return writeState(env,state,etag);
}
export async function replaceMaintenance(html,env){const {state}=await readState(env);return html.replace(/<!--maintenance:start-->[\s\S]*?<!--maintenance:end-->/,`<!--maintenance:start-->${tablesMarkup(state)}<!--maintenance:end-->`);}
export async function handleMaintenance(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/api/maintenance/sync'){
  if(!await verifySync(request,env[GATEWAY_KEY]))return json({error:'Acesso da rotina não autorizado.'},403);
  try{const state=await syncMaintenance(env);return json({status:state.status,last_checked:state.last_checked,pending_count:state.pending.length},state.status==='failed'?502:200);}catch(error){return json({error:error.message},error.status||500);}
 }
 if(!path.startsWith('/api/admin/maintenance')&&!/^\/admin\/revisoes\/?$/.test(path))return null;
 try{
  const actor=await getPasswordActor(request,env);if(!actor)return /^\/admin\//.test(path)?Response.redirect(new URL('/admin/entrar/',request.url),302):json({error:'Entre no CMS.'},401);
  if(!permission(actor,'content'))return json({error:'Conta sem permissão.'},403);
  if(/^\/admin\/revisoes\/?$/.test(path)&&request.method==='GET'){const {state}=await readState(env);return new Response(maintenanceAdmin(state),{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com"}});}
  const match=path.match(/^\/api\/admin\/maintenance\/document\/([a-f0-9]{64})$/);
  if(match&&request.method==='GET'){const {state}=await readState(env);if(!state.pending.some(p=>p.hash===match[1])&&!state.tables.some(t=>t.source_sha256===match[1]))return json({error:'Documento não encontrado.'},404);const file=await env.BUCKET.get(`maintenance/documents/${match[1]}.pdf`);if(!file)return json({error:'Documento não encontrado.'},404);return new Response(file.body,{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="tabela-bajaj.pdf"','Content-Security-Policy':"default-src 'none'; sandbox"}});}
  if(path==='/api/admin/maintenance'&&request.method==='GET')return json((await readState(env)).state);
  guardMutation(request);
  if(path==='/api/admin/maintenance/refresh'&&request.method==='POST'){const state=await syncMaintenance(env);return json({status:state.status,message:state.message},state.status==='failed'?502:200);}
  if(path==='/api/admin/maintenance/approve'&&request.method==='POST'){
   if(actor.role!=='admin')fail(403,'A aprovação de preços requer administrador.');
   const raw=await request.text();if(raw.length>30000)fail(413,'Dados excedem o limite.');let data;try{data=JSON.parse(raw);}catch{fail(400,'Dados inválidos.');}
   if(data.confirmed!==true||typeof data.note!=='string'||data.note.trim().length<20||data.note.length>1000)fail(422,'Confirme a conferência e descreva a orientação validada.');
   const {state,etag}=await readState(env),index=state.tables.findIndex(t=>t.id===data.id);if(index<0)fail(422,'Modelo inválido.');const old=state.tables[index],pending=state.pending.find(p=>p.id===data.id),table=validateTable(data.table);
   if(table.id!==old.id||table.source_sha256!==(pending?.hash||old.source_sha256)||table.source_url!==(pending?.url||old.source_url))fail(409,'O documento mudou. Reabra a versão atual.');
   // Only the price rows and validity are editable; identity and source are fixed.
   state.tables[index]={...old,rows:table.rows,valid_until:table.valid_until,source_url:table.source_url,source_sha256:table.source_sha256,confirmed_interval_note:data.note.trim(),approved_by:actor.id,approved_at:new Date().toISOString(),publication_status:'unit_reviewed',conflicts:[]};state.pending=state.pending.filter(p=>p.id!==data.id);
   state.history=[...state.history,{at:new Date().toISOString(),status:'approved',message:`${old.model}${old.version?' '+old.version:''}: versão conferida pelo administrador.`}].slice(-60);await writeState(env,state,etag);return json({saved:true});
  }
  return json({error:'Rota indisponível.'},404);
 }catch(error){return json({error:error.message},error.status||422);}
}
