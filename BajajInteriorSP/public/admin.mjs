import {blogEditorMarkup,blogEditorialMarkup} from './blog-admin-form.mjs';
import {showContacts} from './contact-admin.mjs';
import {openCommerceEditor,openBannerEditor} from './commerce-admin.mjs';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kinds={ofertas:'Ofertas',seminovas:'Seminovas',blog:'Blog'};
const labels={overview:'Visão geral',...kinds,media:'Biblioteca de mídia',contacts:'Contatos',users:'Equipe e permissões',history:'Histórico',backup:'Recuperação',account:'Minha conta'};
const actionLabels={'content.demo_seed':'Cadastrou exemplo fictício','content.create':'Criou um rascunho','content.save':'Salvou alterações','content.publish':'Publicou um conteúdo','content.unpublish':'Retirou uma publicação','content.restore':'Restaurou uma versão','content.pause':'Pausou uma campanha','content.resume':'Retomou uma campanha','content.end':'Encerrou uma campanha','content.availability':'Alterou a disponibilidade','commerce.banner.save':'Salvou o banner de Ofertas','commerce.banner.publish':'Publicou o banner de Ofertas','commerce.banner.unpublish':'Retirou o banner de Ofertas','media.upload':'Enviou um arquivo'};
const state={view:'overview',user:null,capabilities:{},blogOptions:null,items:[],media:[],editor:null,dirty:false,filter:'all',search:''};
const date=value=>value?new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}):'—';
const size=value=>value<1024*1024?`${Math.ceil(value/1024)} KB`:`${(value/1024/1024).toFixed(1)} MB`;
let toastTimer;
function toast(message,error=false){const t=$('#toast');clearTimeout(toastTimer);t.textContent=message;t.classList.toggle('error',error);t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,error?10000:5500);}
async function api(path,{method='GET',body}={}){
 const options={method,credentials:'same-origin',headers:{}};
 if(body instanceof FormData)options.body=body;
 else if(body!==undefined){options.headers['Content-Type']='application/json';options.body=JSON.stringify(body);}
 let res;try{res=await fetch('/api/admin/'+path,options);}catch{throw new Error('Sem conexão. Suas alterações não foram confirmadas. Tente novamente.');}
 let data;try{data=await res.json();}catch{throw new Error('A sessão pode ter expirado. Entre novamente e tente salvar.');}
 if(!res.ok){if(res.status===401)throw new Error('Sua sessão expirou. Entre novamente com a conta autorizada.');throw new Error(data.error||'Não foi possível concluir a ação.');}
 return data;
}
const head=(eyebrow,title,description,action='')=>`<div class="page-head"><div><span class="eyebrow">${e(eyebrow)}</span><h1>${e(title)}</h1><p>${e(description)}</p><a class="academy-context-help" href="/admin/ajuda/?modulo=${e(({overview:'acesso',media:'midia',users:'equipe',history:'versoes',backup:'recuperacao',account:'acesso'}[state.view]||state.view))}">Ajuda deste módulo →</a></div>${action}</div>`;
const empty=(title,description,action='')=>`<section class="empty-state"><div class="empty-symbol" aria-hidden="true">＋</div><h2>${e(title)}</h2><p>${e(description)}</p>${action}</section>`;
const status=row=>`<span class="badge ${row.status==='published'?'published':'draft'}">${e(row.commerce_label||(row.status==='published'?'Publicado':'Rascunho'))}</span>${row.status==='published'&&row.has_unpublished_changes?'<span class="change-note">Alterações não publicadas</span>':''}`;
const createButton=kind=>`<button class="primary" data-new="${kind}" type="button">＋ ${kind==='ofertas'?'Nova campanha':kind==='seminovas'?'Novo cadastro':'Novo artigo'}</button>`;
const modal=$('#modal');
function closeModal(){modal.close();$('#modal-body').replaceChildren();}
function openModal(title,body){$('#modal-body').innerHTML=`<div class="modal-head"><h2>${e(title)}</h2><button class="close-button" type="button" data-close aria-label="Fechar janela">×</button></div><div class="modal-content">${body}</div>`;modal.showModal();$('[data-close]',modal).onclick=closeModal;}
function allowNavigation(){return !state.dirty||confirm('Há alterações não salvas. Deseja sair sem salvar?');}
function setDirty(value=true){state.dirty=value;const s=$('#save-status');if(s)s.textContent=value?'Alterações ainda não salvas.':'Todas as alterações foram salvas.';}
async function loadBase(){const [content,media,options]=await Promise.all([api('content'),api('media'),api('blog-options')]);state.items=content.items;state.media=media.items;state.blogOptions=options;}
function historyList(items,{restore=false}={}){
 return `<ul class="history-list">${items.map(r=>`<li><div><strong>${restore?'Versão '+r.version:e(actionLabels[r.action]||r.action)}</strong><small>${e(r.actor_name||'Equipe')} · ${e(date(r.created_at))}${restore?' · '+e(actionLabels[r.action]||r.action):''}</small></div>${restore?`<button type="button" class="secondary" data-restore="${e(r.id)}">Restaurar</button>`:''}</li>`).join('')}</ul>`;
}
async function overview(){
 await loadBase();const pub=state.items.filter(r=>r.kind==='blog'?r.status==='published':['active','available','reserved'].includes(r.commerce_state)).length;
 $('#workspace').innerHTML=head('PAINEL DE CONTEÚDO','Visão geral','Gerencie o que a equipe publica. Publique novidades e conteúdos com a identidade aprovada da InteriorSP.')+
 `<div class="stats"><div class="stat"><label>Conteúdos cadastrados</label><strong>${state.items.length}</strong><small>Ofertas, seminovas e blog</small></div><div class="stat"><label>Publicados</label><strong>${pub}</strong><small>Disponíveis no site</small></div><div class="stat"><label>Rascunhos</label><strong>${state.items.filter(r=>r.status==='draft').length}</strong><small>Visíveis apenas para a equipe</small></div><div class="stat"><label>Arquivos</label><strong>${state.media.length}</strong><small>Imagens e documentos</small></div></div><h2 class="section-title">Seu conteúdo, organizado</h2><div class="module-grid">${Object.entries(kinds).map(([kind,title],i)=>`<section class="module-card"><span class="module-no">0${i+1} / CONTEÚDO</span><h3>${title}</h3><p>${{ofertas:'Cadastre campanhas, alternativas, validade e unidades participantes.',seminovas:'Gerencie fotos reais, preço e disponibilidade de cada exemplar.',blog:'Salve textos, capas e arquivos para a publicação editorial.'}[kind]}</p><button type="button" class="text-button" data-go="${kind}">Gerenciar ${title.toLowerCase()} →</button></section>`).join('')}</div><div class="notice neutral">Campanhas seguem a validade em horário de São Paulo. Seminovas reservadas ficam sinalizadas; vendidas e retiradas saem da lista. Contatos ficam no acesso autorizado.</div><section class="panel"><h2>Últimas alterações</h2><div id="recent-activity">Carregando histórico…</div></section>`;
 const data=await api('audit');$('#recent-activity').innerHTML=data.items.length?historyList(data.items.slice(0,5)):'<p class="intro">O histórico começa assim que a equipe salva ou publica o primeiro conteúdo.</p>';
}
function contentRows(){
 const items=state.items.filter(r=>r.kind===state.view&&(state.filter==='all'||(r.commerce_state||r.status)===state.filter)&&r.draft.title.toLowerCase().includes(state.search.toLowerCase()));
 const container=$('#content-results');
 container.innerHTML=items.length?`<div class="table-wrap"><table><thead><tr><th>Conteúdo</th><th>Status</th><th>Atualizado em</th><th>Ação</th></tr></thead><tbody>${items.map(r=>`<tr><td><strong>${e(r.draft.title)}</strong><small>/${e(r.slug)}/</small></td><td>${status(r)}</td><td>${e(date(r.updated_at))}</td><td><button type="button" class="text-button" data-edit="${e(r.id)}">Editar →</button></td></tr>`).join('')}</tbody></table></div>`:empty(state.items.some(r=>r.kind===state.view)?'Nenhum resultado encontrado':'Seu primeiro conteúdo começa aqui',state.items.some(r=>r.kind===state.view)?'Ajuste os filtros ou o texto da busca.':'Crie um rascunho, confira a prévia e publique quando o material estiver aprovado.',state.items.some(r=>r.kind===state.view)?'':createButton(state.view));
}
async function contentList(){
 await loadBase();const commerce=state.view!=='blog';
 const filters=state.view==='ofertas'?[['all','Todas'],['draft','Rascunhos'],['active','Ativas'],['scheduled','Programadas'],['paused','Pausadas'],['expired','Vencidas'],['ended','Encerradas'],['incomplete','Completar cadastro']]:state.view==='seminovas'?[['all','Todas'],['draft','Rascunhos'],['available','Disponíveis'],['reserved','Reservadas'],['sold','Vendidas'],['withdrawn','Retiradas'],['incomplete','Completar cadastro']]:[['all','Todos'],['draft','Rascunhos'],['published','Publicados']];
 $('#workspace').innerHTML=head(commerce?'GESTÃO COMERCIAL':'GESTÃO DE CONTEÚDO',kinds[state.view],state.view==='ofertas'?'Campanhas reais, com validade, condições alternativas e unidades.':state.view==='seminovas'?'Estoque próprio Bajaj, com um cadastro para cada exemplar.':'Salve rascunhos privados e publique no template da InteriorSP.',`<div class="editor-actions">${state.view==='ofertas'?'<button type="button" class="secondary" id="commerce-banner">Banner da página</button>':''}${createButton(state.view)}</div>`)+`<div class="toolbar"><div class="filters" role="group" aria-label="Filtrar por status">${filters.map(([v,label])=>`<button type="button" class="filter ${state.filter===v?'active':''}" data-filter="${v}">${label}</button>`).join('')}</div><input type="search" id="search-content" placeholder="Buscar conteúdo" aria-label="Buscar por título" value="${e(state.search)}"></div><div id="content-results"></div>`;
 contentRows();$('#search-content').oninput=event=>{state.search=event.target.value;contentRows();};
 $('#commerce-banner')?.addEventListener('click',()=>openBannerEditor({state,workspace:$('#workspace'),api,head,toast,setDirty,upload:showUpload}).catch(error=>toast(error.message,true)));
}
async function openEditor(id,kind=state.view){
 if(!allowNavigation())return;
 await loadBase();state.editor=id?(await api('content/'+id)).item:{id:null,kind,slug:'',version:0,status:'draft',draft:{title:'',summary:'',body:'',cover_id:null,attachments:[]}};state.dirty=false;
 const row=state.editor,draft=row.draft;
 if(row.kind!=='blog'){await openCommerceEditor({row,state,workspace:$('#workspace'),api,head,toast,setDirty,reopen:openEditor,upload:showUpload,history:()=>showRevisions().catch(error=>toast(error.message,true))});return;}
 $('#breadcrumb-current').textContent=kinds[row.kind]+' / '+(row.id?'Editar conteúdo':'Novo conteúdo');
 $('#workspace').innerHTML=head(kinds[row.kind],row.id?'Editar conteúdo':'Novo conteúdo','Preencha o material, salve o rascunho e confira a prévia antes de publicar.',`<button type="button" class="secondary" data-back="${row.kind}">← Voltar</button>`)+
 blogEditorMarkup(row,state.media,{date,size,status});
 const form=$('#content-form');form.oninput=()=>setDirty();form.onchange=event=>{setDirty();if(event.target.name==='cover_asset'&&!$('[name=cover_id]').value){const img=$('#cover-preview');img.hidden=!event.target.value;if(event.target.value)img.src='/assets/'+event.target.value;}if(event.target.name==='cover_id'){const img=$('#cover-preview');img.hidden=!event.target.value;if(event.target.value)img.src='/api/admin/media/'+event.target.value+'/file';}};
 form.onsubmit=async event=>{event.preventDefault();await saveDraft();};
 $('#publish-button')?.addEventListener('click',publish);
 $('#unpublish-button')?.addEventListener('click',()=>changePublication('unpublish'));
 $('#revisions-button')?.addEventListener('click',()=>showRevisions().catch(error=>toast(error.message,true)));
 $('#editor-upload').onclick=()=>showUpload({editor:true});
 addEditorialFields(row);
}
function editorInput(){const data=new FormData($('#content-form'));const draft={...state.editor.draft,title:data.get('title'),summary:data.get('summary'),body:data.get('body'),cover_id:data.get('cover_id')||null,attachments:data.getAll('attachment')};
 if(state.editor.kind==='blog'){Object.assign(draft,{category:data.get('category'),author:data.get('author'),cover_asset:data.get('cover_asset')||null,cover_alt:data.get('cover_alt'),model_ids:data.getAll('model_id'),banner_offer:data.get('banner_offer')||null,related_offers:[1,2,3].map(n=>data.get('related_offer_'+n)).filter(Boolean)});}
 if(state.editor.kind==='ofertas'){Object.assign(draft,{offer_model:data.get('offer_model')||null,starts_at:data.get('starts_at')?new Date(data.get('starts_at')+':00-03:00').toISOString():null,valid_until:data.get('valid_until')?new Date(data.get('valid_until')+':00-03:00').toISOString():null});}
 return {slug:data.get('slug')||state.editor.slug,kind:state.editor.kind,version:state.editor.version,draft};}
function addEditorialFields(row){
 const d=row.draft,options=state.blogOptions||{models:[],cover_assets:[],campaigns:[]},aside=$('.editor-side');
 if(row.kind==='blog'){
    const section=document.createElement('section');section.className='panel';section.innerHTML=blogEditorialMarkup(d,options);aside.append(section);
  const cover=$('#cover-preview');if(!d.cover_id&&d.cover_asset){cover.src='/assets/'+d.cover_asset;cover.hidden=false;}
 }
 if(row.kind==='ofertas'){
  const section=document.createElement('section');section.className='panel';const local=value=>value?new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value)).replace(' ','T'):'';
  section.innerHTML=`<h2>Vínculo com o Blog</h2><label class="field"><span>Moto da campanha</span><select name="offer_model"><option value="">Selecione o modelo</option>${options.models.map(m=>`<option value="${m.id}" ${d.offer_model===m.id?'selected':''}>${e(m.name)}</option>`).join('')}</select></label><label class="field"><span>Início da exibição</span><input name="starts_at" type="datetime-local" value="${local(d.starts_at)}"></label><label class="field"><span>Fim da exibição</span><input name="valid_until" type="datetime-local" value="${local(d.valid_until)}"><small>Datas e horários de São Paulo. A validade é verificada no servidor.</small></label>`;aside.append(section);
 }
}
function showActivation(data){
 openModal('Link privado de acesso',`<p class="intro">Envie este link individualmente à pessoa autorizada. Ela escolhe o usuário e a senha. O link pode ser usado uma única vez e vence em 24 horas.</p><label class="field"><span>Link de ativação</span><input id="activation-link" readonly value="${e(data.activation_url)}"></label><p class="help">Nenhuma mensagem foi enviada automaticamente.</p><div class="modal-actions"><button class="primary" type="button" id="copy-activation">Copiar link</button></div>`);
 $('#copy-activation').onclick=async()=>{try{await navigator.clipboard.writeText(data.activation_url);toast('Link copiado.');}catch{$('#activation-link').select();toast('Selecione e copie o link do campo.');}};
}
function accountView(){
 $('#workspace').innerHTML=head('ACESSO PESSOAL','Minha conta','Altere sua senha sem compartilhar suas credenciais.')+`<section class="panel"><p class="intro">Usuário: <strong>@${e(state.user.username||'')}</strong></p><form id="password-form"><label class="field"><span>Senha atual</span><input name="current_password" type="password" autocomplete="current-password" required maxlength="128"></label><label class="field"><span>Nova senha</span><input name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="128"><small>Use pelo menos 12 caracteres.</small></label><label class="field"><span>Confirmar nova senha</span><input name="confirm_password" type="password" autocomplete="new-password" required minlength="12" maxlength="128"></label><div id="password-error" role="alert"></div><button class="primary" type="submit">Alterar senha</button></form></section>`;
 $('#password-form').onsubmit=async event=>{event.preventDefault();const f=event.target,button=$('[type=submit]',f),data=new FormData(f);if(data.get('password')!==data.get('confirm_password')){toast('As senhas não conferem.',true);return;}button.disabled=true;try{const res=await fetch('/api/auth/password',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({current_password:data.get('current_password'),password:data.get('password')})});const result=await res.json();if(!res.ok)throw new Error(result.error);f.reset();toast('Senha alterada. As sessões anteriores foram encerradas.');}catch(error){$('#password-error').innerHTML=`<div class="form-error">${e(error.message)}</div>`;}finally{button.disabled=false;}};
}
function editorError(error){const node=$('#editor-error');if(node)node.innerHTML=`<div class="form-error">${e(error.message)}</div>`;toast(error.message,true);}
async function saveDraft({rerender=true}={}){
 if(!$('#content-form').reportValidity())return false;
 const button=$('#save-button');button.disabled=true;button.textContent='Salvando…';
 try{
  const row=state.editor,data=await api('content'+(row.id?'/'+row.id:''),{method:row.id?'PUT':'POST',body:editorInput()});
  state.editor=data.item;setDirty(false);if(rerender)await openEditor(data.item.id,data.item.kind);toast('Rascunho salvo.');return true;
 }catch(error){editorError(error);return false;}finally{if(button.isConnected){button.disabled=false;button.textContent='Salvar rascunho';}}
}
async function publish(){
 if(!confirm('Publicar a versão atual no endereço deste conteúdo?'))return;
 if(state.dirty&&!(await saveDraft()))return;
 await changePublication('publish');
}
async function changePublication(action){
 if(action==='unpublish'&&!confirm('Retirar este conteúdo do site? O rascunho e o histórico serão preservados.'))return;
 if(action==='unpublish'&&state.dirty&&!(await saveDraft()))return;
 const button=$(action==='publish'?'#publish-button':'#unpublish-button');if(button){button.disabled=true;button.textContent=action==='publish'?'Publicando…':'Retirando…';}
 try{const data=await api('content/'+state.editor.id+'/'+action,{method:'POST',body:{version:state.editor.version}});state.editor=data.item;setDirty(false);await openEditor(data.item.id,data.item.kind);toast(action==='publish'?'Conteúdo publicado.':'Publicação retirada; rascunho preservado.');}catch(error){editorError(error);if(button){button.disabled=false;button.textContent=action==='publish'?'Tentar publicar novamente':'Retirar do site';}}
}
async function showRevisions(){
 const data=await api('content/'+state.editor.id+'/revisions');openModal('Versões do conteúdo','<p class="intro">A restauração volta para o rascunho. Publique depois de conferir. Os contatos recebidos permanecem preservados.</p>'+historyList(data.items,{restore:true}));
 $$('[data-restore]',modal).forEach(button=>button.onclick=async()=>{
  if(!confirm('Restaurar esta versão no rascunho? Alterações não salvas serão descartadas.'))return;
  button.disabled=true;
  try{const data=await api('content/'+state.editor.id+'/restore',{method:'POST',body:{version:state.editor.version,revision_id:button.dataset.restore}});closeModal();setDirty(false);await openEditor(data.item.id,data.item.kind);toast('Versão restaurada no rascunho. Confira antes de publicar.');}catch(error){toast(error.message,true);button.disabled=false;}
 });
}
async function mediaView(){const data=await api('media');state.media=data.items;$('#workspace').innerHTML=head('ARQUIVOS','Biblioteca de mídia','Imagens e PDFs ficam protegidos até serem vinculados a um conteúdo publicado.','<button type="button" class="primary" id="upload-button">＋ Enviar arquivo</button>')+`<div class="notice neutral">JPG, PNG e WebP até 10 MB. PDFs até 20 MB. Os arquivos das versões anteriores são preservados para recuperação.</div>`+(data.items.length?`<div class="media-grid">${data.items.map(m=>`<article class="media-card"><div class="media-thumb">${m.mime.startsWith('image/')?`<img loading="lazy" src="/api/admin/media/${m.id}/file" alt="${e(m.alt)}">`:'PDF'}</div><div class="media-info"><strong>${e(m.name)}</strong><p>${e(m.mime)} · ${size(m.size)}</p><a href="/api/admin/media/${m.id}/file" download>Baixar original ↗</a></div></article>`).join('')}</div>`:empty('Sua biblioteca está pronta','Envie o primeiro material aprovado para usar nos conteúdos.'));$('#upload-button').onclick=()=>showUpload();}
function showUpload({editor=false,onComplete=null,imagesOnly=false}={}){
 openModal('Enviar arquivo',`<form id="upload-form"><label class="field"><span>Arquivo</span><input type="file" name="file" accept="${imagesOnly?'image/jpeg,image/png,image/webp':'image/jpeg,image/png,image/webp,application/pdf'}" required><small>${imagesOnly?'Até 10 MB por imagem.':'10 MB por imagem ou 20 MB por PDF.'}</small></label><label class="field"><span>Descrição da imagem</span><input name="alt" maxlength="250" placeholder="Descreva o que aparece na imagem"><small>A descrição ajuda quem usa leitor de tela.</small></label><div id="upload-error" role="alert"></div><div class="modal-actions"><button type="button" class="secondary" data-cancel>Cancelar</button><button type="submit" class="primary">Enviar arquivo</button></div></form>`);
 $('[data-cancel]',modal).onclick=closeModal;
 $('#upload-form').onsubmit=async event=>{
  event.preventDefault();const form=event.target,button=$('[type=submit]',form);button.disabled=true;button.textContent='Enviando…';
  try{
   const file=form.elements.file.files[0];if(imagesOnly&&!['image/jpeg','image/png','image/webp'].includes(file?.type))throw new Error('Selecione uma imagem JPG, PNG ou WebP.');
   const data=await api('media',{method:'POST',body:new FormData(form)});closeModal();toast('Arquivo enviado e protegido.');
   if(onComplete){state.media.unshift(data.media);await onComplete(data.media);return;}
   if(editor){
    state.media.unshift(data.media);const m=data.media;
    if(m.mime.startsWith('image/')){const option=document.createElement('option');option.value=m.id;option.textContent=m.name;$('[name=cover_id]').append(option);$('[name=cover_id]').value=m.id;const img=$('#cover-preview');img.src='/api/admin/media/'+m.id+'/file';img.hidden=false;}
    const panel=$('#editor-upload').parentElement;let checks=$('.checks',panel);if(!checks){checks=document.createElement('div');checks.className='checks';panel.append(checks);}
    const label=document.createElement('label');label.className='check';label.innerHTML=`<input type="checkbox" name="attachment" value="${m.id}"><span>${e(m.name)}</span>`;checks.prepend(label);setDirty();
   }else await mediaView();
  }catch(error){const node=$('#upload-error');if(node)node.innerHTML=`<div class="form-error">${e(error.message)}</div>`;button.disabled=false;button.textContent='Tentar novamente';}
 };
}
async function usersView(){const data=await api('users');$('#workspace').innerHTML=head('ACESSO RESTRITO','Equipe e permissões','Controle quem publica e quem pode consultar contatos.','<button type="button" class="primary" id="add-user">＋ Adicionar pessoa</button>')+`<div class="notice">Cada pessoa entra com usuário e senha próprios. Ao cadastrar, você recebe um link privado para ela definir seu acesso. Não é necessário ter conta ou assinatura do ChatGPT.</div><div class="table-wrap"><table><thead><tr><th>Pessoa</th><th>Perfil</th><th>Contatos</th><th>Acesso</th><th>Ação</th></tr></thead><tbody>${data.items.map(u=>`<tr><td><strong>${e(u.name)}</strong><small>${e(u.email)}${u.username?' · @'+e(u.username):''}</small></td><td>${u.role==='admin'?'Administrador':'Editor'}</td><td>${u.can_contacts?'Autorizado':'Sem acesso'}</td><td><span class="badge ${u.active?'active':'inactive'}">${u.active?(u.username?'Ativo':'Aguardando ativação'):'Suspenso'}</span></td><td>${u.id==='owner'?'<span class="help">Responsável</span>':`<button type="button" class="text-button" data-user="${u.id}">Editar →</button><button type="button" class="text-button" data-reset-user="${u.id}">Gerar link de acesso</button>`}</td></tr>`).join('')}</tbody></table></div>`;
 $('#add-user').onclick=()=>userForm();$$('[data-user]').forEach(button=>button.onclick=()=>userForm(data.items.find(u=>u.id===button.dataset.user)));$$('[data-reset-user]').forEach(button=>button.onclick=async()=>{try{showActivation(await api('users/'+button.dataset.resetUser+'/reset',{method:'POST',body:{}}));}catch(error){toast(error.message,true);}});
}
function userForm(user={}){
 openModal(user.id?'Editar acesso':'Adicionar pessoa',`<form id="user-form"><label class="field"><span>Nome</span><input name="name" required minlength="2" maxlength="100" value="${e(user.name)}"></label><label class="field"><span>E-mail de contato</span><input name="email" type="email" required maxlength="254" value="${e(user.email)}" ></label><label class="field"><span>Perfil</span><select name="role"><option value="editor" ${user.role!=='admin'?'selected':''}>Editor — conteúdos e mídia</option><option value="admin" ${user.role==='admin'?'selected':''}>Administrador — equipe e recuperação</option></select></label><label class="check"><input type="checkbox" name="can_contacts" ${user.can_contacts?'checked':''}><span>Autorizar consulta e acompanhamento de contatos comerciais</span></label><p class="help">Editar e publicar conteúdo não concede acesso automático aos contatos.</p><label class="check"><input type="checkbox" name="can_training_manage" ${user.can_training_manage?'checked':''}><span>Acompanhar treinamentos — multiplicador, resultados e prática observada</span></label><label class="check"><input type="checkbox" name="can_training_edit" ${user.can_training_edit?'checked':''}><span>Manter documentação e aulas — edição e publicação na central</span></label><label class="check"><input type="checkbox" name="active" ${user.active!==0?'checked':''}><span>Acesso ativo</span></label><div id="user-error" role="alert"></div><div class="modal-actions"><button type="button" class="secondary" data-cancel>Cancelar</button><button type="submit" class="primary">Salvar acesso</button></div></form>`);
 $('[data-cancel]',modal).onclick=closeModal;$('#user-form').onsubmit=async event=>{
  event.preventDefault();const form=event.target,data=new FormData(form),button=$('[type=submit]',form);button.disabled=true;
  try{const result=await api('users'+(user.id?'/'+user.id:''),{method:user.id?'PUT':'POST',body:{name:data.get('name'),email:data.get('email'),role:data.get('role'),active:data.has('active'),can_contacts:data.has('can_contacts'),can_training_manage:data.has('can_training_manage'),can_training_edit:data.has('can_training_edit')}});closeModal();await usersView();toast('Permissões salvas.');if(result.activation_url)showActivation(result);}catch(error){$('#user-error').innerHTML=`<div class="form-error">${e(error.message)}</div>`;button.disabled=false;}
 };
}
async function contactsView(){await showContacts({workspace:$('#workspace'),api,head,toast,openModal,closeModal});}
async function historyView(){const data=await api('audit');$('#workspace').innerHTML=head('RASTREABILIDADE','Histórico de alterações','Acompanhe os salvamentos, publicações e arquivos enviados pela equipe.')+(data.items.length?`<section class="panel">${historyList(data.items)}</section>`:empty('Tudo começa com a primeira alteração','As ações da equipe ficam registradas com responsável, data e horário.'));}
function backupView(){
 $('#workspace').innerHTML=head('CONTINUIDADE','Recuperação','Volte a uma versão de conteúdo e mantenha uma cópia dos materiais.')+`<div class="two-column"><section class="panel"><h2>Recuperar uma versão</h2><ol class="steps"><li>Abra o conteúdo que precisa recuperar.</li><li>Clique em “Ver versões e restaurar”.</li><li>Escolha a versão. Ela volta como rascunho.</li><li>Confira a prévia e publique quando estiver pronta.</li></ol><div class="notice neutral">Restaurar um rascunho não altera a versão publicada até você confirmar a publicação.</div></section><section class="panel"><h2>Exportar dados e arquivos</h2><p class="intro">Baixe o registro dos conteúdos, versões e referências de arquivos. Para uma cópia completa, baixe também os originais na biblioteca de mídia.</p><div class="editor-actions"><a class="button primary" href="/api/admin/backup" download>Baixar dados de conteúdo ↓</a><button type="button" class="secondary" data-go="media">Abrir arquivos</button></div><p class="help">A exportação não inclui contatos comerciais nem credenciais. Os originais permanecem preservados no histórico.</p></section></div><section class="panel"><h2>Recuperar acesso da equipe</h2><p class="intro">Reative a pessoa em Equipe e permissões. Para redefinir a senha de uma pessoa, gere um novo link em Equipe e permissões. O acesso do administrador responsável fica preservado.</p><button type="button" class="text-button" data-go="users">Abrir equipe e permissões →</button></section><div class="notice">O histórico de código do site e os dados administrativos são independentes. Voltar uma versão do código não executa restauração ou exclusão dos contatos recebidos.</div>`;
}
async function navigate(view,{force=false}={}){
 if(!force&&!allowNavigation())return;
 state.view=view;state.editor=null;state.dirty=false;state.filter='all';state.search='';
 $('#breadcrumb-current').textContent=labels[view]||'Painel';$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('#admin-sidebar').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');
 $('#workspace').innerHTML='<div class="loading-state" role="status">Carregando…</div>';
 try{if(kinds[view])await contentList();else await ({overview,media:mediaView,users:usersView,contacts:contactsView,history:historyView,backup:backupView,account:accountView}[view]||overview)();}catch(error){$('#workspace').innerHTML=head('PAINEL','Não foi possível carregar',error.message,'<button type="button" class="secondary" id="retry-view">Tentar novamente</button>');$('#retry-view').onclick=()=>navigate(view,{force:true});toast(error.message,true);}
}
document.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button)return;
 try{
  if(button.dataset.view)await navigate(button.dataset.view);
  if(button.dataset.go)await navigate(button.dataset.go);
  if(button.dataset.new)await openEditor(null,button.dataset.new);
  if(button.dataset.edit)await openEditor(button.dataset.edit);
  if(button.dataset.back)await navigate(button.dataset.back);
  if(button.dataset.filter){state.filter=button.dataset.filter;$$('[data-filter]').forEach(b=>b.classList.toggle('active',b===button));contentRows();}
 }catch(error){toast(error.message,true);}
});
$('#menu-button').onclick=()=>{const open=$('#admin-sidebar').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',String(open));};
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#admin-sidebar').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');}});
window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
async function init(){try{const data=await api('me');state.user=data.user;state.capabilities=data.capabilities;const requested=new URLSearchParams(location.hash.slice(1)).get('view');await navigate(Object.hasOwn(labels,requested)?requested:'overview',{force:true});}catch(error){$('#workspace').innerHTML=head('ACESSO RESTRITO','Sua sessão precisa de atenção',error.message,'<a class="button primary" href="/admin/entrar/">Entrar novamente →</a>');}}
$('#logout-button')?.addEventListener('click',async()=>{if(!allowNavigation())return;try{await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',credentials:'same-origin'});location.assign('/admin/entrar/');}catch{toast('Não foi possível sair. Tente novamente.',true);}});
init();
