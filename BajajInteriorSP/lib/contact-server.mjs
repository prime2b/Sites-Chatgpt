import {fail,permission,guardMutation} from './cms-domain.mjs';
import {models,units} from './blog-catalog.mjs';
import {commerceState,publishedDraft} from './commerce-domain.mjs';
import {NOTICE_VERSION,CONTACT_NOTICE,CONTACT_STATUSES,INTENT_LABELS,knownRoute,validateContact,makeHandoff,CmsError} from './contact-domain.mjs';

const q=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const one=(env,sql,...args)=>q(env,sql,...args).first();
const all=async(env,sql,...args)=>(await q(env,sql,...args).all()).results;
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Robots-Tag':'noindex,nofollow'};
const reply=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...headers,...extra}});
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
const digest=async text=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
async function signed(env,text){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.CMS_AUTH_PEPPER),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(text)));
}
async function inputJSON(request){
 if(Number(request.headers.get('Content-Length')||0)>12000)fail(413,'Solicitação muito grande.');
 const reader=request.body?.getReader();if(!reader)fail(400,'Solicitação inválida.');
 let length=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>12000){await reader.cancel();fail(413,'Solicitação muito grande.');}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{fail(400,'Solicitação inválida. Confira o formulário.');}
}
async function limit(request,env,{scope='submit',max=15}={}){
 const raw=request.headers.get('CF-Connecting-IP');
 if(!raw)return; // Local previews have no trustworthy client-IP header.
 const time=Math.floor(Date.now()/1000),key='contact:'+scope+':'+await signed(env,raw);
 await q(env,'INSERT INTO cms_auth_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN expires_at<=? THEN 1 ELSE hits+1 END,expires_at=CASE WHEN expires_at<=? THEN ? ELSE expires_at END',key,time+600,time,time,time+600).run();
 const row=await one(env,'SELECT hits FROM cms_auth_limits WHERE key=?',key);
 if(row.hits>max)fail(429,'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.');
 await q(env,'DELETE FROM cms_auth_limits WHERE expires_at<?',time-3600).run();
}
async function contextFor(env,data){
 const unit=units.find(u=>u.id===data.unit),model=models.find(m=>m.id===data.model);
 const context={intent:data.intent,intent_label:INTENT_LABELS[data.intent],unit:data.unit,unit_name:unit.name,model:data.model,model_name:model?.name||null,catalog_price:model?.price||null,entry:data.entry,term:data.term,date:data.date,detail:data.detail,source:data.source,placement:data.placement,campaign_id:data.campaign_id,inventory_id:data.inventory_id,notice_version:NOTICE_VERSION,requested_contact:true,route_phone:knownRoute(data.intent)?unit.phone:null,route_status:knownRoute(data.intent)?'ready':'pending_channel'};
 let entity=null;
 if(data.campaign_id){
  const row=await one(env,"SELECT * FROM cms_content WHERE id=? AND kind='ofertas' AND status='published' AND published_json IS NOT NULL",data.campaign_id);
  if(commerceState(row)!=='active')fail(409,'Esta campanha não está mais disponível. Atualize a página e consulte as condições vigentes.');
  const draft=publishedDraft(row),offerModel=models.find(m=>m.id===draft.offer_model),option=draft.commercial_options.find(o=>o.id===data.campaign_option);
  if(data.content_revision!==row.published_at)fail(409,'As condições foram atualizadas. Feche o formulário e atualize o anúncio antes de continuar.');
  if(!option||model&&offerModel.id!==model.id||!draft.unit_ids.includes(data.unit))fail(422,'Confira a condição, o modelo e a unidade desta campanha.');
  context.campaign_title=draft.title;context.campaign_option_id=option.id;context.campaign_option_title=option.title;context.campaign_option_details=option.details;context.campaign_price=option.price??draft.offer_price;context.content_revision=row.published_at;
  context.model=offerModel.id;context.model_name=offerModel.name;context.catalog_price=offerModel.price;entity=row;
 }
 if(data.inventory_id){
  const row=await one(env,"SELECT * FROM cms_content WHERE id=? AND kind='seminovas' AND status='published' AND published_json IS NOT NULL",data.inventory_id);
  if(commerceState(row)!=='available')fail(409,'Esta seminova não está mais disponível. Consulte a unidade.');
  const draft=JSON.parse(row.published_json);if(draft.is_demo)fail(422,'Este exemplar é fictício e não está à venda. Consulte o estoque real com a equipe.');
  if(data.content_revision!==row.published_at)fail(409,'O anúncio foi atualizado. Feche o formulário e atualize a página antes de continuar.');
  if(draft.unit_id!==data.unit)fail(422,'Selecione a unidade deste exemplar.');
  const stockModel=models.find(m=>m.id===(draft.model_id||draft.offer_model));
  if(stockModel){if(model&&stockModel.id!==model.id)fail(409,'Confira o modelo deste exemplar.');context.model=stockModel.id;context.model_name=stockModel.name;context.catalog_price=stockModel.price;}
  context.inventory_title=draft.title;context.inventory_price=Number.isFinite(draft.price)?draft.price:null;context.inventory_code=draft.stock_code;context.content_revision=row.published_at;entity=row;
 }
 if(data.model_year)context.model_year=data.model_year;
 if(data.mileage!==undefined)context.mileage=data.mileage;
 return {context,entity};
}
async function receipt(env,row){
 const token=await signed(env,'contact-receipt:'+row.id+':'+row.idempotency_key);
 return {saved:true,receipt:{id:row.id,token},handoff_url:makeHandoff(JSON.parse(row.context_json)),route_status:JSON.parse(row.context_json).route_status};
}
async function capture(request,env){
 guardMutation(request);const data=validateContact(await inputJSON(request));
 const requestHash=await signed(env,JSON.stringify(data));
 const existing=await one(env,'SELECT * FROM contacts WHERE idempotency_key=?',data.idempotency_key);
 if(existing){if(existing.request_hash!==requestHash)fail(409,'O formulário mudou após o envio. Abra uma nova solicitação para alterar os dados.');return reply(await receipt(env,existing));}
 await limit(request,env);
 const {context,entity}=await contextFor(env,data),id=crypto.randomUUID(),time=new Date().toISOString();
 const token=await signed(env,'contact-receipt:'+id+':'+data.idempotency_key);
 const condition=entity?" WHERE EXISTS(SELECT 1 FROM cms_content WHERE id=? AND status='published' AND published_at=? AND published_json=? AND (kind='seminovas' AND json_extract(published_json,'$.availability')='available' OR kind='ofertas' AND julianday(json_extract(published_json,'$.starts_at'))<=julianday('now') AND julianday(json_extract(published_json,'$.valid_until'))>julianday('now')))":'';
 await q(env,"INSERT OR IGNORE INTO contacts(id,name,phone,context_json,status,idempotency_key,created_at,request_hash,receipt_hash,updated_at,version) SELECT ?,?,?,?,'new',?,?,?,?,?,1"+condition,id,data.name,data.phone,JSON.stringify(context),data.idempotency_key,time,requestHash,await digest(token),time,...(entity?[entity.id,entity.published_at,entity.published_json]:[])).run();
 const row=await one(env,'SELECT * FROM contacts WHERE idempotency_key=?',data.idempotency_key);
 if(!row)fail(entity?409:503,entity?'A disponibilidade ou as condições mudaram. Atualize o anúncio antes de tentar novamente.':'O registro não foi confirmado. Tente novamente.');
 if(row.request_hash!==requestHash)fail(409,'Esta solicitação já foi enviada com outros dados. Abra o formulário novamente.');
 return reply(await receipt(env,row),row.id===id?201:200);
}
async function attempted(request,env){
 guardMutation(request);const input=await inputJSON(request);
 if(!/^[0-9a-f-]{36}$/i.test(input.id||'')||!/^[0-9a-f]{64}$/i.test(input.token||''))fail(404,'Solicitação não encontrada.');
 await limit(request,env,{scope:'handoff',max:60});
 const row=await one(env,'SELECT id,receipt_hash,context_json FROM contacts WHERE id=?',input.id);
 if(!row||!row.receipt_hash||await digest(input.token)!==row.receipt_hash)fail(404,'Solicitação não encontrada.');
 if(!JSON.parse(row.context_json).route_phone)fail(409,'Esta solicitação aguarda atendimento pela equipe.');
 await q(env,'UPDATE contacts SET handoff_attempted_at=COALESCE(handoff_attempted_at,?) WHERE id=?',new Date().toISOString(),row.id).run();
 return reply({recorded:true});
}
export async function handleContact(request,env){
 const path=new URL(request.url).pathname;if(!/^\/api\/contact(?:\/|$)/.test(path))return null;
 try{
  if(!env.DB||!env.CMS_AUTH_PEPPER)fail(503,'O atendimento pelo site está temporariamente indisponível. Tente novamente.');
  if(path==='/api/contact/config'&&request.method==='GET')return reply({enabled:true,notice:CONTACT_NOTICE,notice_version:NOTICE_VERSION,channels:Object.fromEntries(Object.keys(INTENT_LABELS).map(i=>[i,knownRoute(i)]))});
  if(path==='/api/contact'&&request.method==='POST')return await capture(request,env);
  if(path==='/api/contact/handoff'&&request.method==='POST')return await attempted(request,env);
  fail(405,'Método não permitido.');
 }catch(error){
  const status=error instanceof CmsError?error.status:503;
  // Never include database errors, submitted fields or request bodies in logs/responses.
  return reply({saved:false,error:error instanceof CmsError?error.message:'Não foi possível confirmar o registro. Seus dados continuam no formulário; tente novamente.'},status,status===429?{'Retry-After':'600'}:{});
 }
}
const mapRow=row=>{if(!row)return null;const {context_json,idempotency_key,request_hash,receipt_hash,...record}=row;return {...record,context:JSON.parse(context_json)};};
export async function contactsAdmin(request,env,actor,id){
 if(!permission(actor,'contacts'))fail(403,'Sua conta não tem permissão para consultar contatos.');
 const url=new URL(request.url);
 if(request.method==='GET'&&!id){
  const filters=[],args=[];
  for(const [key,allowed,column] of [['status',Object.keys(CONTACT_STATUSES),'status'],['unit',units.map(u=>u.id),"json_extract(context_json,'$.unit')"],['intent',Object.keys(INTENT_LABELS),"json_extract(context_json,'$.intent')"]]){
   const value=url.searchParams.get(key);if(value){if(!allowed.includes(value))fail(400,'Filtro inválido.');filters.push(column+'=?');args.push(value);}
  }
  const offset=Number(url.searchParams.get('offset')||0);if(!Number.isInteger(offset)||offset<0||offset>1000000)fail(400,'Página inválida.');
  const where=filters.length?' WHERE '+filters.join(' AND '):'';
  const rows=await all(env,'SELECT * FROM contacts'+where+' ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?',...args,offset);
  return reply({items:rows.slice(0,50).map(mapRow),has_more:rows.length>50,offset,capture_enabled:true,statuses:CONTACT_STATUSES,intents:INTENT_LABELS,units:units.map(u=>({id:u.id,name:u.short})),pending_channels:['consorcio','revisao','manutencao','pecas','acessorios','garantia']});
 }
 const current=await one(env,'SELECT * FROM contacts WHERE id=?',id||'');if(!current)fail(404,'Contato não encontrado.');
 if(request.method==='GET')return reply({item:mapRow(current)});
 if(request.method==='PUT'){
  guardMutation(request);const input=await inputJSON(request);
  if(!Object.hasOwn(CONTACT_STATUSES,input.status))fail(422,'Status inválido.');
  if(!Number.isInteger(input.version)||input.version!==current.version)fail(409,'Este contato foi atualizado. Reabra o registro antes de salvar.');
  const time=new Date().toISOString(),auditId=crypto.randomUUID();
  const changes=await env.DB.batch([
   q(env,'UPDATE contacts SET status=?,updated_at=?,version=version+1 WHERE id=? AND version=?',input.status,time,id,input.version),
   q(env,"INSERT INTO cms_audit(id,actor_id,actor_name,action,target_id,created_at) SELECT ?,?,?,'contact.status',?,? FROM contacts WHERE id=? AND version=?",auditId,actor.id,actor.name,id,time,id,input.version+1),
  ]);
  if(changes[0].meta.changes!==1)fail(409,'Outra pessoa atualizou este contato. Reabra o registro.');
  return reply({item:mapRow(await one(env,'SELECT * FROM contacts WHERE id=?',id))});
 }
 fail(405,'Método não permitido.');
}
