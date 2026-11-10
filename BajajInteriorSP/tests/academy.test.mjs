import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture} from './helpers/cms-fixture.mjs';
import {ACADEMY_SEED} from '../lib/academy-seed.mjs';
import {validateEntry} from '../lib/academy-domain.mjs';
const boot=async(f,actor='owner')=>f.call('academy/bootstrap',{actor});
const call=(f,path,body,actor='owner')=>f.call('academy/'+path,{method:'POST',body,actor});
async function editor(f,extra={}){return (await f.call('users',{method:'POST',body:{name:'Pessoa editora',email:'editor@example.test',role:'editor',active:true,can_contacts:false,...extra}})).data.user;}
const answers=id=>ACADEMY_SEED.find(e=>e.id===id).quiz.map(q=>q.correct);

test('primeira abertura carrega todos os materiais com orçamento limitado de consultas',async()=>{
 const f=fixture(),prepare=f.env.DB.prepare;let queries=0;
 f.env.DB.prepare=sql=>{queries++;return prepare(sql);};
 const result=await boot(f);assert.equal(result.status,200);assert.equal(result.data.entries.length,ACADEMY_SEED.length);
 assert.ok(queries<=15,'A carga inicial deve evitar uma consulta por material: '+queries);
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM academy_revisions').get().n,ACADEMY_SEED.length);
});

test('central exige sessão; busca e telas não expõem públicos restritos ou gabaritos',async()=>{
 const f=fixture();assert.equal((await boot(f,null)).status,401);
 const login=await f.request('/admin/ajuda/',{actor:null});assert.match(await login.text(),/Entrar no painel/);
 assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM academy_entries').get().n,0);
 await editor(f);const data=(await boot(f,'editor')).data;
 assert.ok(data.entries.some(e=>e.id==='criar-artigo-blog'));assert.ok(!data.entries.some(e=>e.audience==='admin'||e.audience==='trainer'||e.audience==='contacts'));
 assert.ok(!JSON.stringify(data.entries).includes('"correct":'));assert.ok(!JSON.stringify(data.entries).includes('"explanation":'));
 assert.equal((await f.call('academy/editor',{actor:'editor'})).status,403);
 assert.equal((await f.call('academy/instructor',{actor:'editor'})).status,403);
 assert.equal((await f.request('/admin/ajuda/ilustracao/equipe/',{actor:'editor'})).status,403);
 assert.equal((await f.request('/api/admin/academy/photo/1',{actor:null})).status,401);
 const screen=await f.request('/admin/ajuda/ilustracao/ofertas/',{actor:'editor'});assert.equal(screen.status,200);assert.match(await screen.text(),/TELA DEMONSTRATIVA/);assert.match(screen.headers.get('Cache-Control'),/no-store/);
 assert.equal(new Set(ACADEMY_SEED.map(e=>e.id)).size,ACADEMY_SEED.length);for(const e of ACADEMY_SEED)assert.ok(validateEntry(e));
});
test('progresso é pessoal, versionado e protegido contra origem externa',async()=>{
 const f=fixture();await editor(f);await boot(f,'editor');
 assert.equal((await f.call('academy/progress/aula-blog',{actor:'editor',method:'POST',origin:'https://externo.test',body:{version:1,step:0,completed:true}})).status,403);
 assert.equal((await call(f,'progress/aula-blog',{version:999,step:0,completed:true},'editor')).status,409);
 assert.equal((await call(f,'progress/aula-blog',{version:1,step:999,completed:true},'editor')).status,400);
 assert.equal((await call(f,'progress/aula-blog',{user_id:'owner',version:1,step:2,completed:true},'editor')).status,200);
 assert.equal((await boot(f,'editor')).data.progress[0].step,2);assert.equal((await boot(f)).data.progress.length,0);
 const row=f.sqlite.prepare('SELECT * FROM academy_entries WHERE id=?').get('aula-blog');const draft={...JSON.parse(row.draft_json),title:'Aula revisada',requires_retraining:true};
 let updated=await f.call('academy/entries/aula-blog',{method:'PUT',body:{version:row.version,draft}});assert.equal(updated.status,200);
 const published=await call(f,'entries/aula-blog/publish',{version:updated.data.item.version});assert.equal(published.status,200);
 assert.equal((await call(f,'progress/aula-blog',{version:published.data.item.published_version,step:0,completed:false},'editor')).status,200);
 const progress=(await boot(f,'editor')).data.progress;assert.equal(progress.length,2);assert.ok(progress.some(p=>p.lesson_version===1&&p.completed===1));
});
test('nota é calculada no servidor; erro crítico reprova mesmo com 90%; histórico mantém o gabarito da versão',async()=>{
 const f=fixture();await editor(f);await boot(f,'editor');const correct=answers('avaliacao-final');
 const wrong=[...correct];wrong[0]=wrong[0]===0?1:0;
 const graded=await call(f,'quiz/avaliacao-final',{version:1,answers:wrong,score:100,passed:true,user_id:'owner'},'editor');assert.equal(graded.status,201);assert.equal(graded.data.score,90);assert.equal(graded.data.passed,false);
 assert.equal((await call(f,'quiz/avaliacao-final',{version:1,answers:[999]},'editor')).status,400);
 const result=await call(f,'quiz/avaliacao-final',{version:1,answers:correct},'editor');assert.equal(result.data.score,100);assert.equal(result.data.passed,true);
 assert.equal((await f.call('academy/attempt/'+result.data.id,{actor:'owner'})).status,200);
 const draft=JSON.parse(f.sqlite.prepare('SELECT draft_json FROM academy_entries WHERE id=?').get('avaliacao-final').draft_json);draft.quiz[0].correct=0;
 const saved=await f.call('academy/entries/avaliacao-final',{method:'PUT',body:{version:1,draft}});await call(f,'entries/avaliacao-final/publish',{version:saved.data.item.version});
 const previous=(await f.call('academy/attempt/'+result.data.id,{actor:'editor'})).data;assert.equal(previous.feedback[0].correct,1);assert.equal(previous.lesson_version,1);
 assert.equal((await boot(f)).data.attempts.length,0);
});
test('edição e publicação da documentação têm conflito e revisão; seed não desfaz trabalho',async()=>{
 const f=fixture();await boot(f);let row=(await f.call('academy/entries/criar-artigo-blog')).data.item;const original=row.draft.title;
 const saved=await f.call('academy/entries/'+row.id,{method:'PUT',body:{version:row.version,draft:{...row.draft,title:'Título revisto pela equipe'}}});assert.equal(saved.status,200);
 const conflict=await f.call('academy/entries/'+row.id,{method:'PUT',body:{version:row.version,draft:row.draft}});assert.equal(conflict.status,409);
 assert.equal((await boot(f)).data.entries.find(e=>e.id===row.id).title,original);
 const pub=await call(f,'entries/'+row.id+'/publish',{version:saved.data.item.version});row=pub.data.item;assert.equal((await boot(f)).data.entries.find(e=>e.id===row.id).title,'Título revisto pela equipe');
 const versions=(await f.call('academy/entries/'+row.id+'/revisions')).data.items;
 const restored=await call(f,'entries/'+row.id+'/restore',{version:row.version,revision_id:versions.at(-1).id});assert.equal(restored.data.item.draft.title,original);assert.equal(restored.data.item.published.title,'Título revisto pela equipe');
 await call(f,'entries/'+row.id+'/unpublish',{version:restored.data.item.version});assert.ok(!(await boot(f)).data.entries.some(e=>e.id===row.id));assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM academy_entries WHERE id=?').get(row.id).n,1);
});
test('multiplicador e mantenedor não ganham acesso a Contatos, equipe ou referência administrativa',async()=>{
 const f=fixture();const user=await editor(f,{can_training_manage:true});await boot(f,'editor');
 assert.equal((await f.call('academy/instructor',{actor:'editor'})).status,200);
 assert.equal((await f.call('contacts',{actor:'editor'})).status,403);assert.equal((await f.call('users',{actor:'editor'})).status,403);
 assert.equal((await f.call('academy/editor',{actor:'editor'})).status,403);
 const ownerAttempt=await call(f,'quiz/aula-blog',{version:1,answers:answers('aula-blog')});assert.equal((await f.call('academy/attempt/'+ownerAttempt.data.id,{actor:'editor'})).status,200);
 const observation=await call(f,'observations',{user_id:user.id,entry_id:'aula-blog',status:'observed',note:'Conferiu prévia e explicou a publicação.'});assert.equal(observation.status,201);
 assert.equal((await boot(f,'editor')).data.observations[0].status,'observed');
 assert.equal((await call(f,'observations',{user_id:user.id,entry_id:'aula-blog',status:'observed',note:'Avaliação própria.'},'editor')).status,400);
 assert.equal((await call(f,'observations',{user_id:'owner',entry_id:'aula-equipe',status:'observed',note:'Prática administrativa.'},'editor')).status,404);
 const denied=await f.call('users/'+user.id,{method:'PUT',body:{...user,can_training_manage:false,can_training_edit:true}});assert.equal(denied.status,200);
 const editable=(await f.call('academy/editor',{actor:'editor'})).data.items;assert.ok(editable.every(r=>r.draft.audience!=='admin'&&r.draft.audience!=='contacts'));
 const source=editable.find(r=>r.id==='primeiro-acesso');assert.equal((await f.call('academy/entries/'+source.id,{actor:'editor',method:'PUT',body:{version:source.version,draft:{...source.draft,audience:'admin'}}})).status,403);
 assert.equal((await f.call('academy/instructor',{actor:'editor'})).status,403);
 await f.call('users/'+user.id,{method:'PUT',body:{...user,active:false}});assert.equal((await boot(f,'editor')).status,401);
});
test('aluno não pode consultar provas de outra pessoa nem observar práticas',async()=>{
 const f=fixture();await editor(f);await boot(f);const result=await call(f,'quiz/aula-blog',{version:1,answers:answers('aula-blog')});
 assert.equal((await f.call('academy/attempt/'+result.data.id,{actor:'editor'})).status,404);
 assert.equal((await call(f,'observations',{user_id:'owner',entry_id:'aula-blog',status:'observed',note:'Sem autorização.'},'editor')).status,403);
});
test('treinamento não grava conteúdo comercial e simulador não chama APIs de produção',async()=>{
 const f=fixture();await boot(f);await call(f,'progress/aula-blog',{version:1,step:0,completed:true});await call(f,'quiz/aula-blog',{version:1,answers:answers('aula-blog')});
 for(const table of ['cms_content','contacts','commerce_page'])assert.equal(f.sqlite.prepare('SELECT COUNT(*) AS n FROM '+table).get().n,0);
 const source=readFileSync(new URL('../public/academy-simulator.mjs',import.meta.url),'utf8');assert.doesNotMatch(source,/fetch\s*\(|ctx\.api\s*\(|\/api\/admin\/(?:content|contacts|users)|wa\.me/);
 const schema=readFileSync(new URL('../drizzle/0004_majestic_captain_stacy.sql',import.meta.url),'utf8');assert.doesNotMatch(schema,/DELETE FROM|DROP TABLE|INSERT INTO/i);
});
