import { fail,guardMutation } from './cms-domain.mjs';

const ITERATIONS=100000,SESSION_SECONDS=8*60*60;
const encoder=new TextEncoder();
const s=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const one=(env,sql,...args)=>s(env,sql,...args).first();
const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
export const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const iso=()=>new Date().toISOString();
const timestamp=()=>Math.floor(Date.now()/1000);
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...headers}});
function cookieConfig(request){
 const url=new URL(request.url),dev=url.protocol==='http:'&&['localhost','127.0.0.1','terminal.local'].includes(url.hostname);
 return {name:dev?'interiorsp_session_dev':'__Host-interiorsp_session',secure:dev?'':'; Secure'};
}
function sessionCookie(request,token,maxAge=SESSION_SECONDS){const c=cookieConfig(request);return `${c.name}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${c.secure}`;}
function readCookie(request){const name=cookieConfig(request).name;return (request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||'';}
export function validateUsername(value){const username=String(value||'').trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username))fail(400,'Use um usuário com 3 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.');return username;}
export function validatePassword(value){if(typeof value!=='string'||value.length<12||value.length>128)fail(400,'Escolha uma senha com 12 a 128 caracteres. Você pode usar uma frase fácil de lembrar.');return value;}
export async function passwordHash(password,salt,pepper,iterations=ITERATIONS){
 if(!pepper)fail(503,'A autenticação está temporariamente indisponível.');
 const key=await crypto.subtle.importKey('raw',encoder.encode(password+'\0'+pepper),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations,hash:'SHA-256'},key,256));
}
const constantEquals=(a,b)=>{let difference=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)difference|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return difference===0;};
export async function getPasswordActor(request,env){
 const token=readCookie(request);if(!/^[a-f0-9]{64}$/.test(token))return null;
 return one(env,'SELECT u.*,c.username FROM cms_sessions s JOIN cms_users u ON u.id=s.user_id JOIN cms_credentials c ON c.user_id=u.id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1',await digest(token),timestamp());
}
async function createSession(request,env,userId){
 const token=random(),time=timestamp();
 await s(env,'INSERT INTO cms_sessions(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)',await digest(token),userId,time,time+SESSION_SECONDS).run();
 return sessionCookie(request,token);
}
async function body(request){
 if(Number(request.headers.get('Content-Length')||0)>4096)fail(413,'Envio muito grande.');
 const raw=await request.text();if(raw.length>4096)fail(413,'Envio muito grande.');
 try{const result=JSON.parse(raw);if(!result||Array.isArray(result)||typeof result!=='object')throw 0;return result;}catch{fail(400,'Dados inválidos.');}
}
async function limitLogin(env,request,username){
 const ip=request.headers.get('CF-Connecting-IP')||'shared';const time=timestamp();
 const keys=[['ip:'+ip,60],['user:'+username,10]];
 for(const [raw,limit]of keys){
  const key=await digest(raw);await s(env,'INSERT INTO cms_auth_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN expires_at<? THEN 1 ELSE hits+1 END, expires_at=CASE WHEN expires_at<? THEN ? ELSE expires_at END',key,time+900,time,time,time+900).run();
  const row=await one(env,'SELECT hits,expires_at FROM cms_auth_limits WHERE key=?',key);if(row.hits>limit)fail(429,'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
 }
}
export async function issuePasswordLink(request,env,userId){
 const token=random(),hash=await digest(token),expiry=timestamp()+86400;
 // A new reset link cancels older, unused links for this person.
 await env.DB.batch([s(env,'DELETE FROM cms_password_tokens WHERE user_id=? AND used_at IS NULL',userId),s(env,'INSERT INTO cms_password_tokens(token_hash,user_id,expires_at,used_at,created_at) VALUES(?,?,?,NULL,?)',hash,userId,expiry,iso())]);
 return {activation_url:new URL('/admin/ativar/',request.url).origin+'/admin/ativar/#token='+token,expires_at:new Date(expiry*1000).toISOString()};
}
async function activate(request,env,input){
 const username=validateUsername(input.username),password=validatePassword(input.password),token=String(input.token||'');
 if(!/^[a-f0-9]{64}$/.test(token))fail(400,'Link de ativação inválido ou expirado. Solicite outro ao administrador.');
 const hash=await digest(token),time=timestamp();
 // Bootstrap/recovery is available only to the holder of a separately delivered,
 // single-use token. No public first-user registration or default password.
 if(env.CMS_OWNER_SETUP_HASH&&constantEquals(hash,env.CMS_OWNER_SETUP_HASH)&&Number(env.CMS_OWNER_SETUP_EXPIRES)>time){
  if(!env.CMS_OWNER_EMAIL)fail(503,'O acesso responsável ainda não está configurado.');
  const t=iso();
  await env.DB.batch([
   s(env,"INSERT OR IGNORE INTO cms_users(id,user_id,email,name,role,active,can_contacts,created_at,updated_at) VALUES('owner',NULL,?,'Fred Borrasca','admin',1,1,?,?)",env.CMS_OWNER_EMAIL,t,t),
   s(env,"INSERT OR IGNORE INTO cms_password_tokens(token_hash,user_id,expires_at,used_at,created_at) VALUES(?,'owner',?,NULL,?)",hash,Number(env.CMS_OWNER_SETUP_EXPIRES),t),
  ]);
 }
 const row=await one(env,'SELECT t.*,u.active FROM cms_password_tokens t JOIN cms_users u ON u.id=t.user_id WHERE token_hash=?',hash);
 if(!row||row.used_at||row.expires_at<=time||!row.active)fail(400,'Link de ativação inválido ou expirado. Solicite outro ao administrador.');
 const taken=await one(env,'SELECT user_id FROM cms_credentials WHERE username=? AND user_id<>?',username,row.user_id);if(taken)fail(409,'Este usuário está indisponível. Escolha outro.');
 const salt=random(),hashed=await passwordHash(password,salt,env.CMS_AUTH_PEPPER),mark=crypto.randomUUID(),t=iso();
 const changes=await env.DB.batch([
  s(env,'UPDATE cms_password_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>?',mark,hash,time),
  s(env,'INSERT INTO cms_credentials(user_id,username,password_hash,salt,iterations,updated_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM cms_password_tokens WHERE token_hash=? AND used_at=?) ON CONFLICT(user_id) DO UPDATE SET username=excluded.username,password_hash=excluded.password_hash,salt=excluded.salt,iterations=excluded.iterations,updated_at=excluded.updated_at',row.user_id,username,hashed,salt,ITERATIONS,t,hash,mark),
  s(env,'DELETE FROM cms_sessions WHERE user_id=? AND EXISTS(SELECT 1 FROM cms_password_tokens WHERE token_hash=? AND used_at=?)',row.user_id,hash,mark),
 ]);
 if(changes[0].meta.changes!==1||changes[1].meta.changes!==1)fail(400,'Este link já foi utilizado. Solicite uma nova ativação.');
 return json({ok:true,redirect:'/admin/'},200,{'Set-Cookie':await createSession(request,env,row.user_id)});
}
export async function handleAuth(request,env){
 const path=new URL(request.url).pathname;if(!path.startsWith('/api/auth/'))return null;
 if(request.method!=='POST')fail(405,'Método não permitido.');guardMutation(request);
 if(!env.CMS_AUTH_PEPPER)fail(503,'A autenticação está temporariamente indisponível.');
 const action=path.split('/')[3],input=await body(request);
 if(action==='setup')return activate(request,env,input);
 if(action==='logout'){
  const token=readCookie(request);if(token)await s(env,'DELETE FROM cms_sessions WHERE token_hash=?',await digest(token)).run();
  return json({ok:true,redirect:'/admin/entrar/'},200,{'Set-Cookie':sessionCookie(request,'',0)});
 }
 if(action==='login'){
  const username=String(input.username||'').trim().toLowerCase().slice(0,254),password=String(input.password||'').slice(0,128);
  await limitLogin(env,request,username);
  const credential=await one(env,'SELECT c.*,u.active FROM cms_credentials c JOIN cms_users u ON u.id=c.user_id WHERE c.username=?',username);
  const computed=await passwordHash(password,credential?.salt||'00000000000000000000000000000000',env.CMS_AUTH_PEPPER,credential?.iterations||ITERATIONS);
  if(!credential||!credential.active||!constantEquals(computed,credential.password_hash))fail(401,'Usuário ou senha inválidos.');
  await s(env,'DELETE FROM cms_auth_limits WHERE key=?',await digest('user:'+username)).run();
  return json({ok:true,redirect:'/admin/'},200,{'Set-Cookie':await createSession(request,env,credential.user_id)});
 }
 if(action==='password'){
  const actor=await getPasswordActor(request,env);if(!actor)fail(401,'Entre novamente para alterar sua senha.');
  const password=validatePassword(input.password),credential=await one(env,'SELECT * FROM cms_credentials WHERE user_id=?',actor.id);
  if(!constantEquals(await passwordHash(String(input.current_password||''),credential.salt,env.CMS_AUTH_PEPPER,credential.iterations),credential.password_hash))fail(401,'A senha atual não confere.');
  const salt=random(),hash=await passwordHash(password,salt,env.CMS_AUTH_PEPPER);
  await env.DB.batch([s(env,'UPDATE cms_credentials SET password_hash=?,salt=?,iterations=?,updated_at=? WHERE user_id=?',hash,salt,ITERATIONS,iso(),actor.id),s(env,'DELETE FROM cms_sessions WHERE user_id=?',actor.id)]);
  return json({ok:true},200,{'Set-Cookie':await createSession(request,env,actor.id)});
 }
 fail(404,'Ação não encontrada.');
}
