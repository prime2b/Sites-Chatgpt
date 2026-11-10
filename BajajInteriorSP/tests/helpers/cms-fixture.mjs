import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync,readdirSync } from 'node:fs';
import { handleCMS } from '../../lib/cms-server.mjs';
export function fixture({seedStockDemos=false}={}){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync(new URL('../../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../../drizzle/'+file,import.meta.url),'utf8'));
 const prepared=(sql,args=[])=>({bind(...values){return prepared(sql,values);},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){const result=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(result.changes)}};}});
 const objects=new Map();
 const env={CMS_SKIP_STOCK_DEMOS:seedStockDemos?'0':'1',CMS_OWNER_EMAIL:'owner@example.test',CMS_AUTH_PEPPER:'test-pepper-only',DB:{prepare:sql=>prepared(sql),async batch(statements){sqlite.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}}},BUCKET:{async put(key,data){objects.set(key,new Uint8Array(data));},async head(key){return objects.has(key)?{size:objects.get(key).length}:null;},async get(key){return objects.has(key)?{body:objects.get(key)}:null;},async delete(key){objects.delete(key);}}};
 if(seedStockDemos)env.ASSETS={async fetch(request){const url=new URL(request.url);if(url.origin!=='https://bajaj.test')return new Response('Wrong asset origin',{status:403});const path=url.pathname;try{return new Response(readFileSync(new URL('../../public'+path,import.meta.url)),{headers:{'Content-Type':'image/webp'}});}catch{return new Response('Missing',{status:404});}}};
 sqlite.prepare("INSERT INTO cms_users(id,user_id,email,name,role,active,can_contacts,created_at,updated_at) VALUES('owner',NULL,'owner@example.test','Fred Borrasca','admin',1,1,?,?)").run(new Date().toISOString(),new Date().toISOString());
 const actors={owner:['owner-id','owner@example.test'],editor:['editor-id','editor@example.test'],stranger:['unknown-id','unknown@example.test']};
 const request=async(path,{actor='owner',method='GET',body,origin='https://bajaj.test'}={})=>{
  const headers={};if(actor){const user=sqlite.prepare('SELECT * FROM cms_users WHERE email=?').get(actors[actor][1]);if(user){const token=createHash('sha256').update(actor+'-test-session').digest('hex'),hash=createHash('sha256').update(token).digest('hex');sqlite.prepare('INSERT OR IGNORE INTO cms_credentials VALUES(?,?,?,?,?,?)').run(user.id,actor,'test-password-hash','test-salt',100000,new Date().toISOString());sqlite.prepare('INSERT OR IGNORE INTO cms_sessions VALUES(?,?,?,?)').run(hash,user.id,0,4000000000);headers.Cookie='__Host-interiorsp_session='+token;}}
  if(body!==undefined){headers.Origin=origin;if(!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body);}}
  return handleCMS(new Request('https://bajaj.test'+path,{method,headers,body}),env);
 };
 const call=async(path,options)=>{const response=await request('/api/admin/'+path,options);return {status:response.status,data:await response.json()};};
 const mediaId='test-real-photo';
 const raw=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a14kAAAAASUVORK5CYII=','base64'));
 sqlite.prepare('INSERT INTO cms_media(id,object_key,name,mime,size,sha256,alt,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(mediaId,'test/real-photo.png','Foto de homologação.png','image/png',raw.length,'test','Foto isolada de homologação','owner',new Date().toISOString());objects.set('test/real-photo.png',raw);
 let sequence=0;
 const create=async(draft={})=>(await call('content',{method:'POST',body:{kind:'seminovas',draft:{title:'Artigo de homologação',summary:'Resumo de homologação privado.',body:'Este texto serve apenas para testar a publicação sem inventar condições comerciais.',cover_id:mediaId,cover_alt:'Foto real de teste isolado',attachments:[],offer_model:'dominar-400',stock_code:'TEST-'+(++sequence),unit_id:'rio-preto',year_manufacture:2025,year_model:2026,mileage:1000,color:'Preta',price:24000,gallery_ids:[draft.cover_id||mediaId],availability:'available',photos_reviewed:true,...draft}}})).data.item;

 return {sqlite,env,objects,request,call,create,mediaId};
}
