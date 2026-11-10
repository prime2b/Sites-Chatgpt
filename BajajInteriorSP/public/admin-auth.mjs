const form=document.querySelector('#auth-form'),error=document.querySelector('#auth-error'),setup=document.body.dataset.authMode==='setup';
const params=new URLSearchParams(location.hash.slice(1)),token=params.get('token')||'';
if(token)history.replaceState(null,'',location.pathname);
document.querySelector('.show-password')?.addEventListener('click',event=>{const button=event.currentTarget,input=form.elements.password;input.type=input.type==='password'?'text':'password';button.setAttribute('aria-label',input.type==='password'?'Mostrar senha':'Ocultar senha');button.setAttribute('aria-pressed',String(input.type==='text'));});
const recovery=document.querySelector('#recovery-dialog');
document.querySelector('#forgot-password')?.addEventListener('click',()=>recovery.showModal());
recovery?.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>recovery.close()));
function showError(message){error.replaceChildren();const p=document.createElement('p');p.className='form-error';p.textContent=message;error.append(p);}
form?.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const username=form.elements.username.value,password=form.elements.password.value;
 if(setup&&password!==form.elements.confirm_password.value){showError('As senhas não conferem. Digite novamente.');return;}
 if(setup&&!token){showError('Abra o link completo de ativação enviado pelo administrador.');return;}
 const button=form.querySelector('[type=submit]'),label=button.innerHTML;button.disabled=true;button.textContent=setup?'Ativando seu acesso…':'Entrando…';error.replaceChildren();
 try{
  const res=await fetch('/api/auth/'+(setup?'setup':'login'),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,...(setup?{token}:{})})});
  const data=await res.json();if(!res.ok)throw new Error(data.error||'Não foi possível entrar. Tente novamente.');
  location.assign(data.redirect||'/admin/');
 }catch(err){showError(err.message||'Sem conexão. Tente novamente.');button.disabled=false;button.innerHTML=label;}
});
