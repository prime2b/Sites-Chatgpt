import {fail,permission} from './cms-domain.mjs';

export const MODULES={acesso:'Primeiro acesso',midia:'Biblioteca de mídia',blog:'Blog',ofertas:'Ofertas 0 km',seminovas:'Seminovas',contatos:'Contatos',versoes:'Publicação e versões',equipe:'Equipe e permissões',recuperacao:'Recuperação',tecnico:'Referência técnica',multiplicadores:'Multiplicadores',avaliacao:'Avaliação',central:'A central online'};
export const TRACKS={editorial:'Operação editorial',comercial:'Operação comercial',admin:'Administração',multiplicadores:'Formação de multiplicadores'};
export const TYPES={manual:'Manual',lesson:'Aula',guide:'Guia do multiplicador',technical:'Referência técnica'};
export const PRACTICES=['blog','ofertas','seminovas','contatos','versoes','equipe'];
export function canReadAcademy(actor,entry){
 if(!permission(actor,'content'))return false;
 if(entry.audience==='admin'||entry.type==='technical'||entry.track==='admin')return permission(actor,'admin');
 if(entry.audience==='contacts')return permission(actor,'contacts');
 if(entry.audience==='trainer'||entry.type==='guide'||entry.track==='multiplicadores')return permission(actor,'training_manage')||permission(actor,'training_edit');
 return true;
}
export function validateEntry(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'Confira o conteúdo da central.');
 const text=(value,max,label,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&value.trim().length<3))fail(400,`Confira ${label}.`);return value.trim();};
 const array=(key,max)=>{if(!Array.isArray(input[key])||input[key].length>max)fail(400,`Confira ${key}.`);return input[key];};
 if(!Object.hasOwn(MODULES,input.module)||!Object.hasOwn(TYPES,input.type))fail(400,'Módulo ou tipo inválido.');
 if(!['all','contacts','admin','trainer'].includes(input.audience))fail(400,'Público inválido.');
 if(input.track&&!Object.hasOwn(TRACKS,input.track))fail(400,'Trilha inválida.');
 if(!Number.isInteger(input.order)||input.order<0||input.order>999||!Number.isInteger(input.minutes)||input.minutes<0||input.minutes>180)fail(400,'Confira a ordem e a duração.');
 if(input.figure&&!Object.hasOwn(MODULES,input.figure))fail(400,'Tela ilustrativa inválida.');
 if(input.practice&&!PRACTICES.includes(input.practice))fail(400,'Exercício inválido.');
 const quiz=array('quiz',15).map(q=>{
  if(!q||!Array.isArray(q.choices)||q.choices.length<2||q.choices.length>5||!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.choices.length)fail(400,'Confira as alternativas e a resposta correta.');
  return {question:text(q.question,500,'a pergunta',true),choices:q.choices.map(c=>text(c,300,'a alternativa',true)),correct:q.correct,explanation:text(q.explanation,1000,'a explicação',true),critical:!!q.critical};
 });
 if(input.type==='lesson'&&!quiz.length)fail(400,'Inclua ao menos uma pergunta de revisão na aula.');
 return {title:text(input.title,160,'o título',true),summary:text(input.summary,400,'o resumo',true),body:text(input.body,30000,'o texto',true),type:input.type,module:input.module,audience:input.audience,track:input.track||'',order:input.order,minutes:input.minutes,figure:input.figure||'',practice:input.practice||'',steps:array('steps',20).map(s=>({title:text(s.title,160,'o título da etapa',true),body:text(s.body,4000,'a orientação da etapa',true)})),checklist:array('checklist',25).map(c=>text(c,500,'o checklist',true)),quiz,requires_retraining:!!input.requires_retraining};
}
export function studentEntry(row){
 const data=JSON.parse(row.published_json);
 return {id:row.id,...data,quiz:data.quiz.map(({correct,explanation,...q})=>q),published_version:row.published_version,published_at:row.published_at};
}
export function gradeQuiz(entry,answers){
 if(!Array.isArray(answers)||answers.length!==entry.quiz.length||!entry.quiz.length||answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=entry.quiz[i].choices.length))fail(400,'Responda todas as perguntas com uma alternativa válida.');
 const feedback=entry.quiz.map((q,i)=>({...q,selected:answers[i],ok:answers[i]===q.correct}));
 const score=Math.round(feedback.filter(q=>q.ok).length/feedback.length*100);
 return {score,passed:score>=80&&feedback.every(q=>!q.critical||q.ok),feedback};
}
