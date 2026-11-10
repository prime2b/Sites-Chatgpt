import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {initialState,validateTable,isCurrent,parseTableText,discover} from '../lib/maintenance-domain.mjs';
import {syncMaintenance,readState,handleMaintenance} from '../lib/maintenance-server.mjs';
import {tablesMarkup} from '../lib/maintenance-view.mjs';import {syncHeaders,verifySync} from '../lib/maintenance-service-auth.mjs';
const time=Date.parse('2026-11-10T12:00:00Z');
const officialText=readFileSync(new URL('./fixtures/maintenance-text.txt',import.meta.url),'utf8');
const html=()=>initialState().tables.map(t=>`<a href="${t.source_url}">REVISÃO PREÇO FIXO ${t.model}${t.version?' - '+t.version:''}</a>`).join('');
function bucket(){let revision=0;const map=new Map();return {map,async put(key,value,options={}){const old=map.get(key);if(options.onlyIf?.etagMatches&&old?.etag!==options.onlyIf.etagMatches||options.onlyIf?.etagDoesNotMatch==='*'&&old)return null;const bytes=typeof value==='string'?new TextEncoder().encode(value):value;const entry={bytes,etag:String(++revision)};map.set(key,entry);return entry;},async head(key){return map.get(key)||null;},async get(key){const entry=map.get(key);return entry?{etag:entry.etag,body:entry.bytes,text:async()=>new TextDecoder().decode(entry.bytes),json:async()=>JSON.parse(new TextDecoder().decode(entry.bytes))}:null;}};}
test('49 valores e somas são válidos; prazo conflitante aparece para conferência, preços vencidos somem',()=>{
 const state=initialState();assert.equal(state.tables.length,7);for(const table of state.tables)validateTable(table,{time});
 const markup=tablesMarkup(state,{time});assert.equal((markup.match(/<caption>/g)||[]).length,7);assert.equal((markup.match(/Confirmar prazo/g)||[]).length,2);
 const expired=tablesMarkup(state,{time:Date.parse('2027-01-01T04:00:00Z')});assert.doesNotMatch(expired,/R\$|<table>/);assert.match(expired,/vigência desta referência terminou/);
 const bad=structuredClone(state.tables[0]);bad.rows[1].total_cents++;assert.throws(()=>validateTable(bad,{time}),/somas/);bad.valid_until='2026-02-30';assert.throws(()=>validateTable(bad,{time}),/Data/);assert.equal(isCurrent(state.tables[0],time),true);
});
test('mudança de PDF só publica se modelo, sete linhas, vigência, somas e prazo de condições concordarem',()=>{
 const old=initialState().tables.find(t=>t.id==='dominar-400-3-velas');assert.throws(()=>parseTableText(officialText,old,'a'.repeat(64),old.source_url,{time}),/conflitante/);
 const corrected=officialText.replace(/1\.000km ou 1\s+meses/,'1.000km ou 3 meses');const next=parseTableText(corrected,old,'a'.repeat(64),old.source_url,{time});assert.equal(next.rows[6].total_cents,134215);assert.equal(next.publication_status,'verified');
 assert.throws(()=>parseTableText(corrected.replace('R$ 478,52','R$ 478,53'),old,'a'.repeat(64),old.source_url,{time}),/somas/);
 assert.throws(()=>parseTableText('',old,'a'.repeat(64),old.source_url,{time}),/escaneado/);
});
test('descoberta fecha em sete versões e recusa fonte fora do domínio ou duplicada',()=>{
 assert.equal(discover(html()).size,7);assert.throws(()=>discover(html().replace('https://bajaj.com.br','https://example.com')),/fora/);assert.throws(()=>discover(html()+html()),/duplicada/);assert.throws(()=>discover(''),/sete/);
});
test('falha de fonte mantém última versão; documento alterado ilegível vai a revisão sem substituir dados',async()=>{
 const env={BUCKET:bucket()};let state=await syncMaintenance(env,{time,force:true,fetcher:async()=>new Response('Unavailable',{status:503})});assert.equal(state.status,'failed');assert.deepEqual(state.tables,initialState().tables);
 const fetcher=async url=>new Response(url.endsWith('/')?html():'%PDF-1.7\nmodified scan');state=await syncMaintenance(env,{time:time+300000,force:true,fetcher});assert.equal(state.status,'review_required');assert.equal(state.pending.length,7);assert.equal(state.tables[0].source_sha256,initialState().tables[0].source_sha256);assert.equal((await readState(env)).state.revision,2);
});
test('rotina exige assinatura dedicada, caminho e timestamp; CMS público não consegue consultar nem atualizar',async()=>{
 const secret='x'.repeat(48),headers=await syncHeaders(secret);const request=new Request('https://bajaj.test/api/maintenance/sync',{method:'POST',headers});assert.equal(await verifySync(request,secret),true);assert.equal(await verifySync(new Request('https://bajaj.test/api/maintenance/sync',{method:'POST'}),secret),false);assert.equal(await verifySync(request,secret,1),false);
 const denied=await handleMaintenance(new Request('https://bajaj.test/api/maintenance/sync',{method:'POST'}),{BUCKET:bucket()});assert.equal(denied.status,403);
});
