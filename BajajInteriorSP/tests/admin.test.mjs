import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './helpers/cms-fixture.mjs';
import { inspectUpload,permission,renderContent } from '../lib/cms-domain.mjs';

test('identidade e permissão são exigidas no servidor; token de serviço não vira usuário',async()=>{
 const f=fixture();
 assert.equal((await f.call('content',{actor:null})).status,401);
 assert.equal((await f.call('content',{actor:'stranger'})).status,401);
 assert.equal((await f.request('/admin/',{actor:null})).status,200);
 assert.match(await (await f.request('/admin/',{actor:null})).text(),/Entrar no painel/);
 assert.equal((await f.request('/admin/',{actor:'stranger'})).status,200);
 const me=await f.call('me');assert.equal(me.data.user.role,'admin');assert.equal(me.data.user.can_contacts,true);
 assert.equal((await f.request('/admin.css',{actor:null})),null);
});
test('editores publicam mas não acessam contatos ou gestão de pessoas; suspensão revoga acesso',async()=>{
 const f=fixture();await f.call('me');
 const created=await f.call('users',{method:'POST',body:{name:'Pessoa editora',email:'editor@example.test',role:'editor',can_contacts:false,active:true}});
 assert.equal(created.status,200);
 assert.equal((await f.call('content',{actor:'editor'})).status,200);
 assert.equal((await f.call('contacts',{actor:'editor'})).status,403);
 assert.equal((await f.call('users',{actor:'editor'})).status,403);
 assert.equal((await f.call('backup',{actor:'editor'})).status,403);
 const user=created.data.user;
 assert.equal((await f.call('users/'+user.id,{method:'PUT',body:{...user,can_contacts:true,active:true}})).status,200);
 assert.equal((await f.call('contacts',{actor:'editor'})).status,200);
 assert.equal((await f.call('users/'+user.id,{method:'PUT',body:{...user,active:false}})).status,200);
 assert.equal((await f.call('content',{actor:'editor'})).status,401);
 assert.equal(permission({role:'admin',active:1,can_contacts:0},'contacts'),false);
});
test('protege mutações contra requisições de outra origem e mantém dono protegido',async()=>{
 const f=fixture();await f.call('me');
 const denied=await f.call('content',{method:'POST',body:{},origin:'https://outro.test'});assert.equal(denied.status,403);
 assert.equal((await f.call('users/owner',{method:'PUT',body:{name:'Dono',email:'owner@example.test',role:'editor',active:false}})).status,403);
 assert.equal((await f.call('users',{method:'POST',body:{name:'Bad',email:'editor@example.test',role:'superadmin'}})).status,400);
});
test('rascunho não vaza; publicar serve HTML e edição continua privada até republicação',async()=>{
 const f=fixture(),item=await f.create();
 assert.equal((await f.request(item.public_url,{actor:null})).status,404);
 assert.equal((await f.request(item.preview_url,{actor:null})).status,200);
 assert.doesNotMatch(await (await f.request(item.preview_url,{actor:null})).text(),/Artigo de homologação/);
 assert.match(await (await f.request(item.preview_url)).text(),/Prévia privada/);
 const published=(await f.call('content/'+item.id+'/publish',{method:'POST',body:{version:item.version}})).data.item;
 assert.equal(published.status,'published');
 const publicRes=await f.request(published.public_url,{actor:null});assert.equal(publicRes.status,200);assert.match(await publicRes.text(),/Artigo de homologação/);
 const edited=await f.call('content/'+item.id,{method:'PUT',body:{version:published.version,draft:{...item.draft,title:'Rascunho ainda não publicado'}}});assert.equal(edited.status,200);
 assert.doesNotMatch(await (await f.request(item.public_url,{actor:null})).text(),/Rascunho ainda não publicado/);
 assert.equal(edited.data.item.has_unpublished_changes,true);
});
test('upload é validado; arquivo de rascunho é privado e perde acesso público na retirada',async()=>{
 const f=fixture();await f.call('me');
 const raw=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a14kAAAAASUVORK5CYII=','base64'));
 const form=new FormData();form.set('file',new File([raw],'capa.png',{type:'image/png'}));form.set('alt','Capa de teste');
 const uploaded=await f.call('media',{method:'POST',body:form});assert.equal(uploaded.status,201);const media=uploaded.data.media;
 assert.equal((await f.request('/midia/'+media.id,{actor:null})).status,404);
 assert.equal((await f.request('/api/admin/media/'+media.id+'/file',{actor:null})).status,401);
 assert.equal((await f.request('/api/admin/media/'+media.id+'/file')).status,200);
 let item=await f.create({title:'Imagem em publicação',summary:'Resumo aprovado para homologação.',body:'Um conteúdo de homologação para testar o vínculo com a imagem e sua proteção.',cover_id:media.id,attachments:[]});
 item=(await f.call('content/'+item.id+'/publish',{method:'POST',body:{version:item.version}})).data.item;
 assert.equal((await f.request('/midia/'+media.id,{actor:null})).status,200);
 await f.call('content/'+item.id+'/unpublish',{method:'POST',body:{version:item.version}});
 assert.equal((await f.request('/midia/'+media.id,{actor:null})).status,404);
 const bad=new FormData();bad.set('file',new File(['<svg><script>alert(1)</script></svg>'],'foto.png',{type:'image/png'}));
 assert.equal((await f.call('media',{method:'POST',body:bad})).status,415);
});
test('conflito de edição não sobrescreve versão e recuperação preserva contatos',async()=>{
 const f=fixture();let item=await f.create();const first=item;
 f.sqlite.prepare('INSERT INTO contacts(id,name,phone,context_json,status,idempotency_key,created_at) VALUES(?,?,?,?,?,?,?)').run('contact','Pessoa','5517000000000','{}','new','contact-test','2026-10-30T00:00:00Z');
 item=(await f.call('content/'+item.id,{method:'PUT',body:{version:item.version,draft:{...item.draft,title:'Uma nova versão de rascunho'}}})).data.item;
 const conflict=await f.call('content/'+item.id,{method:'PUT',body:{version:first.version,draft:{...item.draft,title:'Versão antiga'}}});assert.equal(conflict.status,409);
 const revisions=(await f.call('content/'+item.id+'/revisions')).data.items;
 const restored=await f.call('content/'+item.id+'/restore',{method:'POST',body:{version:item.version,revision_id:revisions.find(r=>r.version===1).id}});
 assert.equal(restored.data.item.draft.title,first.draft.title);assert.equal(restored.data.item.version,3);
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM contacts').get().n,1);
 assert.equal((await f.call('content/'+item.id+'/revisions')).data.items.length,3);
});
test('falha de material ou publicação incompleta não anuncia sucesso; exportação contém versões sem contatos',async()=>{
 const f=fixture();const item=await f.create({title:'Texto incompleto',summary:'curto',body:'rascunho',attachments:[]});
 const failed=await f.call('content/'+item.id+'/publish',{method:'POST',body:{version:1}});assert.equal(failed.status,422);
 assert.equal((await f.request(item.public_url,{actor:null})).status,404);
 const missing=await f.call('content/'+item.id,{method:'PUT',body:{version:1,draft:{...item.draft,cover_id:'arquivo-inexistente'}}});assert.equal(missing.status,422);
 const backup=await f.call('backup');assert.equal(backup.status,200);assert.equal(backup.data.content.length,1);assert.equal(backup.data.revisions.length,1);assert.equal(backup.data.contacts,undefined);
});
test('template escapa texto e metadados; rejeita SVG e arquivo com MIME divergente',()=>{
 const page=renderContent({title:'<script>alert(1)</script>',summary:'" onload="alert(1)',body:'<iframe src="https://bad.test"></iframe>',cover_id:null,attachments:[]});
 assert.doesNotMatch(page,/<script>alert|<iframe|onload="alert/);assert.match(page,/&lt;script&gt;/);
 assert.throws(()=>inspectUpload(new TextEncoder().encode('<svg></svg>'),'image/png'));
 assert.throws(()=>inspectUpload(new Uint8Array([255,216,255,0,0,0,0,0,0,0,0,0]),'image/webp'));
});
test('as três áreas persistem separadamente e não há sucesso se o arquivo sumir antes da publicação',async()=>{
 const f=fixture();await f.call('me');
 for(const kind of ['ofertas','seminovas','blog']){
  const result=await f.call('content',{method:'POST',body:{kind,draft:{title:'Conteúdo de '+kind,summary:'Resumo para teste isolado.',body:'Este conteúdo é apenas uma verificação técnica da base editorial.'}}});
  assert.equal(result.status,201);assert.equal(result.data.item.kind,kind);
  assert.equal((await f.call('content?kind='+kind)).data.items.length,kind==='blog'?4:1);
 }
 const raw=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a14kAAAAASUVORK5CYII=','base64'));
 const form=new FormData();form.set('file',new File([raw],'capa.png',{type:'image/png'}));
 const media=(await f.call('media',{method:'POST',body:form})).data.media;
 const item=await f.create({title:'Arquivo removido antes de publicar',summary:'Resumo para teste de indisponibilidade.',body:'O arquivo deixou de existir e a publicação deve ser interrompida pelo servidor.',cover_id:media.id,attachments:[]});
 f.objects.clear();
 assert.equal((await f.call('content/'+item.id+'/publish',{method:'POST',body:{version:item.version}})).status,422);
 assert.equal((await f.call('content/'+item.id)).data.item.status,'draft');
 assert.equal((await f.request(item.public_url,{actor:null})).status,404);
});
