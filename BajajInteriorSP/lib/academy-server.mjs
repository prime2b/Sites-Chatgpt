import {CmsError,fail,permission,guardMutation} from './cms-domain.mjs';
import {ACADEMY_SEED} from './academy-seed.mjs';
import {canReadAcademy,validateEntry,studentEntry,gradeQuiz,MODULES,TRACKS,TYPES} from './academy-domain.mjs';
import {academyShell,academyFigure,academyPhoto} from './academy-view.mjs';

const s=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const one=(env,sql,...args)=>s(env,sql,...args).first();
const all=async(env,sql,...args)=>(await s(env,sql,...args).all()).results;
const now=()=>new Date().toISOString();
const uid=()=>crypto.randomUUID();
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'same-origin'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8'}});
const html=body=>new Response(body,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com"}});
const need=(actor,capability='content')=>{if(!actor)fail(401,'Entre no painel para acessar a central.');if(!permission(actor,capability))fail(403,'Sua conta não tem permissão para esta área da central.');};
async function input(request){const raw=await request.text();if(raw.length>160000)fail(413,'Conteúdo da central muito grande.');try{const result=JSON.parse(raw);if(!result||typeof result!=='object'||Array.isArray(result))throw 0;return result;}catch{fail(400,'Confira os dados enviados.');}}
async function seed(env){
 const existing=new Set((await all(env,'SELECT id FROM academy_entries')).map(r=>r.id));
 const missing=ACADEMY_SEED.filter(r=>!existing.has(r.id));if(!missing.length)return;
 const t=now(),statements=[];
 // Limita parâmetros por comando e evita uma ida ao banco por material.
 // A carga inicial inteira é atômica; edições existentes nunca são sobrescritas.
 for(let i=0;i<missing.length;i+=10){
  const chunk=missing.slice(i,i+10),args=[];
  for(const {id,...raw} of chunk){const value=JSON.stringify(validateEntry(raw));args.push(id,value,value,t,t);}
  statements.push(s(env,`INSERT OR IGNORE INTO academy_entries(id,draft_json,published_json,version,published_version,updated_at,updated_by,published_at) VALUES ${chunk.map(()=>"(?,?,?,1,1,?,'system',?)").join(',')}`,...args));
 }
 for(let i=0;i<missing.length;i+=50){const ids=missing.slice(i,i+50).map(r=>r.id);statements.push(s(env,`INSERT OR IGNORE INTO academy_revisions(id,entry_id,version,snapshot_json,action,actor_id,created_at) SELECT 'seed-'||id,id,1,draft_json,'seed','system',? FROM academy_entries WHERE version=1 AND id IN (${ids.map(()=>'?').join(',')})`,t,...ids));}
 await env.DB.batch(statements);
}

const readable=(actor,row)=>row?.published_json&&canReadAcademy(actor,JSON.parse(row.published_json));
const requireReadable=(actor,row)=>{if(!readable(actor,row))fail(404,'Orientação indisponível para este acesso.');};
const editorRow=row=>({...row,draft:JSON.parse(row.draft_json),published:row.published_json?JSON.parse(row.published_json):null});
const hasEdit=(actor,row)=>permission(actor,'training_edit')&&canReadAcademy(actor,JSON.parse(row.draft_json))&&(!row.published_json||canReadAcademy(actor,JSON.parse(row.published_json)));
async function rowsFor(env,actor){return (await all(env,'SELECT * FROM academy_entries WHERE published_json IS NOT NULL')).filter(r=>readable(actor,r));}
function forEntries(list,rows){const ids=new Set(rows.map(r=>r.id));return list.filter(r=>ids.has(r.entry_id));}
async function recordsFor(env,userId,rows){
 const [progress,attempts,observations]=await Promise.all([
  all(env,'SELECT * FROM academy_progress WHERE user_id=? ORDER BY updated_at DESC',userId),
  all(env,'SELECT id,user_id,entry_id,lesson_version,score,passed,created_at FROM academy_attempts WHERE user_id=? ORDER BY created_at DESC LIMIT 300',userId),
  all(env,'SELECT o.*,u.name AS instructor_name FROM academy_observations o LEFT JOIN cms_users u ON u.id=o.instructor_id WHERE o.user_id=? ORDER BY o.created_at DESC LIMIT 100',userId)
 ]);
 return {progress:forEntries(progress,rows),attempts:forEntries(attempts,rows),observations:forEntries(observations,rows)};
}
async function revise(env,actor,row,draft,action,version,{published}={}){
 if(!Number.isInteger(version)||version!==row.version)fail(409,'Esta orientação mudou. Reabra a versão atual antes de salvar.');
 const serialized=JSON.stringify(draft),nextVersion=row.version+1,t=now(),revision=uid();
 const publicJson=published===true?serialized:published===false?null:row.published_json;
 const publicVersion=published===true?nextVersion:row.published_version;
 const result=await env.DB.batch([
  s(env,'INSERT INTO academy_revisions(id,entry_id,version,snapshot_json,action,actor_id,created_at) SELECT ?,id,version+1,?,?,?,? FROM academy_entries WHERE id=? AND version=?',revision,serialized,action,actor.id,t,row.id,version),
  s(env,'UPDATE academy_entries SET draft_json=?,published_json=?,version=?,published_version=?,updated_at=?,updated_by=?,published_at=? WHERE id=? AND version=?',serialized,publicJson,nextVersion,publicVersion,t,actor.id,published===true?t:row.published_at,row.id,version),
  s(env,'INSERT INTO cms_audit(id,actor_id,actor_name,action,target_id,created_at) SELECT ?,?,?,?,?,? FROM academy_revisions WHERE id=?',uid(),actor.id,actor.name,'academy.'+action,row.id,t,revision)
 ]);
 if(result[1].meta.changes!==1)fail(409,'Outra sessão atualizou esta orientação. Reabra antes de salvar.');
 return editorRow(await one(env,'SELECT * FROM academy_entries WHERE id=?',row.id));
}
async function api(request,env,actor,parts){
 need(actor);guardMutation(request);await seed(env);
 const [area,id,action]=parts,method=request.method;
 if(area==='bootstrap'&&method==='GET'){
  const rows=await rowsFor(env,actor);
  return json({user:{id:actor.id,name:actor.name,role:actor.role},capabilities:{admin:permission(actor,'admin'),contacts:permission(actor,'contacts'),training_manage:permission(actor,'training_manage'),training_edit:permission(actor,'training_edit')},modules:MODULES,tracks:TRACKS,types:TYPES,entries:rows.map(studentEntry),...await recordsFor(env,actor.id,rows)});
 }
 if(area==='photo'&&method==='GET')return new Response(academyPhoto(id),{headers:{...headers,'Content-Type':'image/svg+xml','Content-Security-Policy':"default-src 'none'; sandbox"}});
 if(area==='progress'&&method==='POST'){
  const row=await one(env,'SELECT * FROM academy_entries WHERE id=?',id||'');requireReadable(actor,row);const entry=JSON.parse(row.published_json),data=await input(request);
  if(entry.type!=='lesson')fail(400,'O progresso é registrado nas aulas.');
  if(data.version!==row.published_version)fail(409,'Esta aula foi atualizada. Reabra antes de continuar.');
  if(!Number.isInteger(data.step)||data.step<0||data.step>Math.max(0,entry.steps.length-1)||typeof data.completed!=='boolean')fail(400,'Etapa inválida.');
  await s(env,'INSERT INTO academy_progress(user_id,entry_id,lesson_version,step,completed,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,entry_id,lesson_version) DO UPDATE SET step=excluded.step,completed=MAX(academy_progress.completed,excluded.completed),updated_at=excluded.updated_at',actor.id,id,row.published_version,data.step,data.completed?1:0,now()).run();
  return json({saved:true,progress:await one(env,'SELECT * FROM academy_progress WHERE user_id=? AND entry_id=? AND lesson_version=?',actor.id,id,row.published_version)});
 }
 if(area==='quiz'&&method==='POST'){
  const row=await one(env,'SELECT * FROM academy_entries WHERE id=?',id||'');requireReadable(actor,row);const entry=JSON.parse(row.published_json),data=await input(request);
  if(entry.type!=='lesson')fail(400,'Avaliação indisponível.');
  if(data.version!==row.published_version)fail(409,'A avaliação foi atualizada. Reabra para responder a versão atual.');
  const result=gradeQuiz(entry,data.answers),attemptId=uid(),t=now();
  await s(env,'INSERT INTO academy_attempts(id,user_id,entry_id,lesson_version,snapshot_json,answers_json,score,passed,created_at) VALUES(?,?,?,?,?,?,?,?,?)',attemptId,actor.id,id,row.published_version,JSON.stringify({title:entry.title,quiz:entry.quiz}),JSON.stringify(data.answers),result.score,result.passed?1:0,t).run();
  return json({id:attemptId,entry_id:id,lesson_version:row.published_version,created_at:t,...result},201);
 }
 if(area==='attempt'&&method==='GET'){
  const attempt=await one(env,'SELECT * FROM academy_attempts WHERE id=?',id||'');
  if(!attempt||(attempt.user_id!==actor.id&&!permission(actor,'training_manage')))fail(404,'Avaliação indisponível.');
  const row=await one(env,'SELECT * FROM academy_entries WHERE id=?',attempt.entry_id);requireReadable(actor,row);
  const snapshot=JSON.parse(attempt.snapshot_json);return json({...attempt,snapshot_json:undefined,answers_json:undefined,title:snapshot.title,...gradeQuiz({quiz:snapshot.quiz},JSON.parse(attempt.answers_json))});
 }
 if(area==='editor'&&method==='GET'){
  need(actor,'training_edit');return json({items:(await all(env,'SELECT * FROM academy_entries ORDER BY updated_at DESC')).filter(r=>hasEdit(actor,r)).map(editorRow)});
 }
 if(area==='entries'){
  need(actor,'training_edit');
  if(method==='POST'&&!id){
   const data=await input(request),draft=validateEntry(data.draft);if(!canReadAcademy(actor,draft))fail(403,'Você não pode manter conteúdos deste público.');
   if(typeof data.id!=='string'||!/^[a-z0-9][a-z0-9-]{2,79}$/.test(data.id))fail(400,'Use um identificador com letras minúsculas, números e hífens.');
   const value=JSON.stringify(draft),t=now();await env.DB.batch([
    s(env,'INSERT INTO academy_entries(id,draft_json,version,published_version,updated_at,updated_by) VALUES(?,?,1,0,?,?)',data.id,value,t,actor.id),
    s(env,'INSERT INTO academy_revisions(id,entry_id,version,snapshot_json,action,actor_id,created_at) VALUES(?,?,1,?,?,?,?)',uid(),data.id,value,'create',actor.id,t)
   ]);return json({item:editorRow(await one(env,'SELECT * FROM academy_entries WHERE id=?',data.id))},201);
  }
  const row=await one(env,'SELECT * FROM academy_entries WHERE id=?',id||'');if(!row||!hasEdit(actor,row))fail(404,'Orientação indisponível para edição.');
  if(method==='GET'&&action==='revisions')return json({items:await all(env,'SELECT r.id,r.version,r.action,r.created_at,u.name AS actor_name FROM academy_revisions r LEFT JOIN cms_users u ON u.id=r.actor_id WHERE r.entry_id=? ORDER BY r.version DESC LIMIT 100',id)});
  if(method==='GET'&&!action)return json({item:editorRow(row)});
  if(method==='PUT'&&!action){const data=await input(request),draft=validateEntry(data.draft);if(!canReadAcademy(actor,draft))fail(403,'Você não pode manter conteúdos deste público.');return json({item:await revise(env,actor,row,draft,'save',data.version)});}
  if(method==='POST'&&['publish','unpublish','restore'].includes(action)){
   const data=await input(request);let draft=validateEntry(JSON.parse(row.draft_json));
   if(action==='restore'){const revision=await one(env,'SELECT * FROM academy_revisions WHERE id=? AND entry_id=?',String(data.revision_id||''),id);if(!revision)fail(404,'Revisão não encontrada.');draft=validateEntry(JSON.parse(revision.snapshot_json));if(!canReadAcademy(actor,draft))fail(403,'Você não pode restaurar esse público.');}
   return json({item:await revise(env,actor,row,draft,action,data.version,{published:action==='publish'?true:action==='unpublish'?false:undefined})});
  }
 }
 if(area==='instructor'){
  need(actor,'training_manage');const rows=await rowsFor(env,actor),lessons=rows.filter(r=>JSON.parse(r.published_json).type==='lesson');
  if(method==='GET'&&id){const user=await one(env,'SELECT * FROM cms_users WHERE id=?',id);if(!user)fail(404,'Participante não encontrado.');const applicable=rows.filter(r=>canReadAcademy({...user,active:1},JSON.parse(r.published_json)));return json({user:{id:user.id,name:user.name,role:user.role,active:user.active},entries:applicable.filter(r=>JSON.parse(r.published_json).type==='lesson').map(studentEntry),...await recordsFor(env,id,applicable)});}
  if(method==='GET'){
   const page=Number(new URL(request.url).searchParams.get('page')||0);if(!Number.isInteger(page)||page<0||page>10000)fail(400,'Página inválida.');
   const users=await all(env,'SELECT id,name,role,active,can_contacts,can_training_manage,can_training_edit FROM cms_users ORDER BY name,id LIMIT 51 OFFSET ?',page*50),has_more=users.length>50;
   const participants=users.slice(0,50),ids=participants.map(u=>u.id),placeholders=ids.map(()=>'?').join(',');
   const [allProgress,allFinals]=ids.length?await Promise.all([all(env,`SELECT * FROM academy_progress WHERE user_id IN (${placeholders}) ORDER BY updated_at DESC`,...ids),all(env,`SELECT id,user_id,entry_id,lesson_version,score,passed,created_at FROM academy_attempts WHERE user_id IN (${placeholders}) AND entry_id='avaliacao-final' ORDER BY created_at DESC`,...ids)]):[[],[]];
   const items=[];for(const user of participants){
    const applicable=lessons.filter(r=>canReadAcademy({...user,active:1},JSON.parse(r.published_json))),records={progress:forEntries(allProgress.filter(p=>p.user_id===user.id),applicable),attempts:forEntries(allFinals.filter(p=>p.user_id===user.id),applicable)};
    const completed=applicable.filter(r=>records.progress.some(p=>p.entry_id===r.id&&p.completed&&(p.lesson_version===r.published_version||!JSON.parse(r.published_json).requires_retraining))).length;
    const final=records.attempts.find(a=>a.entry_id==='avaliacao-final');
    items.push({id:user.id,name:user.name,role:user.role,active:user.active,total:applicable.length,completed,final:final||null});
   }return json({items,page,has_more});
  }
 }
 if(area==='observations'&&method==='POST'){
  need(actor,'training_manage');const data=await input(request),row=await one(env,'SELECT * FROM academy_entries WHERE id=?',String(data.entry_id||''));requireReadable(actor,row);
  const entry=JSON.parse(row.published_json);if(!entry.practice||entry.type!=='lesson')fail(400,'Selecione uma aula com exercício.');
  const student=await one(env,'SELECT * FROM cms_users WHERE id=?',String(data.user_id||''));if(!student||!student.active||!canReadAcademy(student,entry))fail(400,'Participante não autorizado a esta aula.');
  if(student.id===actor.id)fail(400,'A prática deve ser observada por outro multiplicador.');
  if(!['observed','reinforce'].includes(data.status)||typeof data.note!=='string'||data.note.trim().length<5||data.note.length>1500)fail(400,'Informe o resultado e uma observação de 5 a 1500 caracteres, sem dados de clientes.');
  await s(env,'INSERT INTO academy_observations(id,user_id,entry_id,instructor_id,status,note,created_at) VALUES(?,?,?,?,?,?,?)',uid(),student.id,row.id,actor.id,data.status,data.note.trim(),now()).run();return json({saved:true},201);
 }
 fail(404,'Ação da central não encontrada.');
}
export async function handleAcademy(request,env,actor){
 const path=new URL(request.url).pathname,isApi=/^\/api\/admin\/academy(?:\/|$)/.test(path),isPage=/^\/admin\/(?:ajuda|treinamento)(?:\/|$)/.test(path);
 if(!isApi&&!isPage)return null;
 if(isApi){try{return await api(request,env,actor,path.replace(/^\/api\/admin\/academy\/?/,'').split('/').filter(Boolean));}catch(error){if(error instanceof CmsError)return json({error:error.message},error.status);if(String(error?.message).includes('UNIQUE constraint'))return json({error:'Este identificador ou esta versão já existe. Reabra o conteúdo atual antes de tentar novamente.'},409);throw error;}}
 need(actor);if(request.method!=='GET')fail(405,'Método não permitido.');
 if(path.includes('/ilustracao/')){
  const module=path.split('/ilustracao/')[1]?.split('/')[0];if(!Object.hasOwn(MODULES,module))fail(404,'Tela indisponível.');
  if(['equipe','recuperacao','tecnico'].includes(module))need(actor,'admin');if(module==='contatos')need(actor,'contacts');if(module==='multiplicadores')need(actor,'training_manage');
  return html(academyFigure(module));
 }
 if(path.includes('/multiplicador'))need(actor,'training_manage');
 if(path.includes('/editor'))need(actor,'training_edit');
 return html(academyShell(actor));
}
