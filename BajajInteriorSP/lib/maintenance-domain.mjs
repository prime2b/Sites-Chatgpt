import seed from './maintenance-seed.mjs';
export const SOURCE='https://bajaj.com.br/manutencao-periodica/';
export const ids=seed.tables.map(t=>t.id);
export const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
const clean=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
export function sourceUrl(url,{page=false}={}){const u=new URL(url,SOURCE);if(u.protocol!=='https:'||u.hostname!=='bajaj.com.br'||u.username||u.password||u.search||u.hash||(!page&&!/^\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/[^/]+\.pdf$/i.test(u.pathname)))throw Error('Endereço fora da fonte oficial permitida.');return u.href;}
export function discover(html){
 const links=new Map();
 for(const a of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  if(!/\.pdf$/i.test(a[1]))continue;const label=clean(a[2].replace(/<[^>]+>/g,' '));if(!label.includes('revisao preco fixo'))continue;
  const id=/ns400z/.test(label)?'dominar-ns400z':/ns160/.test(label)?'dominar-ns160':/ns200/.test(label)?'dominar-ns200':/n150/.test(label)?'pulsar-n150':/250/.test(label)?'dominar-250':/400.*1 vela/.test(label)?'dominar-400-1-vela':/400.*3 velas/.test(label)?'dominar-400-3-velas':null;
  if(!id||links.has(id))throw Error('Modelo ou versão duplicada/desconhecida na fonte.');links.set(id,sourceUrl(a[1]));
 }
 if(links.size!==7||ids.some(id=>!links.has(id)))throw Error('A fonte não contém as sete tabelas esperadas. Revisão necessária.');return links;
}
export function validateTable(table,{time=Date.now(),allowExpired=false}={}){
 if(!ids.includes(table?.id)||table.currency!=='BRL'||table.amount_unit!=='centavos'||!/^\d{4}-\d{2}-\d{2}$/.test(table.valid_until))throw Error('Modelo, moeda ou vigência inválidos.');
 if(!Number.isFinite(Date.parse(table.valid_until+'T23:59:59-03:00'))||new Date(table.valid_until+'T12:00:00Z').toISOString().slice(0,10)!==table.valid_until)throw Error('Data inválida.');
 sourceUrl(table.source_url);if(!/^[a-f0-9]{64}$/.test(table.source_sha256))throw Error('Documento sem identificação íntegra.');
 if(!allowExpired&&new Date(table.valid_until+'T23:59:59-03:00').getTime()<time)throw Error('Tabela vencida.');
 if(!Array.isArray(table.rows)||table.rows.length!==7)throw Error('São necessárias sete revisões.');
 const kms=[1000,5000,10000,15000,20000,25000,30000],months=[3,6,12,18,24,30,36];
 table.rows.forEach((r,i)=>{if(r.km!==kms[i]||r.months!==months[i]||['parts_cents','labor_cents','total_cents'].some(k=>!Number.isSafeInteger(r[k])||r[k]<0||r[k]>2000000)||r.parts_cents+r.labor_cents!==r.total_cents)throw Error('Intervalos, valores ou somas inconsistentes.');});
 return table;
}
export function isCurrent(table,time=Date.now()){return new Date(table.valid_until+'T23:59:59-03:00').getTime()>=time;}
const amounts=line=>[...line.matchAll(/R\$\s*([\d.]+,\d{2})|Gratuita/gi)].map(m=>m[1]?Number(m[1].replace(/\./g,'').replace(',','')):0);
export function parseTableText(text,previous,source_hash,source_url,{time=Date.now()}={}){
 const lines=text.split(/\r?\n/).map(x=>x.trim()),full=clean(text);
 const linesFor=prefix=>lines.filter(l=>clean(l).startsWith(prefix));
 const header=lines[0]||'',pairs=[...header.matchAll(/([\d.]+)\s*km\s*\/\s*(\d+)\s*meses/gi)];
 const title=clean(header);const expected=clean(previous.model);
 if(!title.startsWith(expected)||pairs.length!==7)throw Error('PDF escaneado, modelo divergente ou cabeçalho não reconhecido.');
 if(previous.id.includes('dominar-400-')&&!/dominar 400/.test(title))throw Error('Versão não reconhecida.');
 const read=label=>{const row=linesFor(label);if(row.length!==1)throw Error('Estrutura da tabela mudou.');const result=amounts(row[0]);if(result.length!==7)throw Error('Linha incompleta.');return result;};
 const parts=read('preco de pecas'),labor=read('valor da mao de obra'),total=read('valor total da manutencao periodica');
 const dates=[...full.matchAll(/validos para revisoes efetuadas ate\s*(\d{2})\/(\d{2})\/(\d{4})/g)];if(dates.length!==1)throw Error('Vigência não reconhecida.');
 const note=full.match(/realizadas com 1\.000\s*km ou\s*(\d+)\s*mes/);if(!note||Number(note[1])!==Number(pairs[0][2]))throw Error('Prazo conflitante entre cabeçalho e condições do PDF.');
 const [,dd,mm,yyyy]=dates[0];const table={...previous,source_url,source_sha256:source_hash,valid_until:`${yyyy}-${mm}-${dd}`,source_has_text_layer:true,extraction_method:'validated_pdf_text',publication_status:'verified',confirmed_interval_note:undefined,approved_at:undefined,approved_by:undefined,conflicts:[],rows:pairs.map((m,i)=>({km:Number(m[1].replace(/\./g,'')),months:Number(m[2]),parts_cents:parts[i],labor_cents:labor[i],total_cents:total[i],labor_free:labor[i]===0,interval_status:'verified_from_header_and_conditions'}))};
 return validateTable(table,{time});
}
export const initialState=()=>({schema_version:1,revision:0,last_checked:seed.retrieved_at,last_success:seed.retrieved_at,status:'seed_verified',message:'Referências oficiais conferidas. Confirme a aplicação na unidade antes do serviço.',tables:structuredClone(seed.tables),pending:[],history:[]});
