import {adminShell} from './cms-view.mjs';
import {MODULES} from './academy-domain.mjs';
import {escapeHtml as e} from './cms-domain.mjs';
import {trainingRow,trainingFormMarkup,auxiliaryMarkup} from '../public/academy-forms.mjs';

export function academyShell(actor){return adminShell(actor).replace('src="/admin.mjs"','src="/academy.mjs"').replace('<title>Painel de conteúdo |','<title>Ajuda e Treinamento |');}
export function academyFigure(module){
 const screen=['blog','ofertas','seminovas'].includes(module)?trainingFormMarkup(trainingRow(module),{role:'admin'}):auxiliaryMarkup(module);
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Tela demonstrativa · ${e(MODULES[module])}</title><link rel="stylesheet" href="/admin.css"><link rel="stylesheet" href="/commerce-admin.css"><link rel="stylesheet" href="/academy.css"></head><body class="academy-figure"><main><div class="academy-demo-label">TELA DEMONSTRATIVA · DADOS FICTÍCIOS</div><h1>${e(MODULES[module])}</h1><p class="intro">Referência da interface. Para executar ações, abra o simulador na central.</p><fieldset class="academy-figure-fieldset" disabled inert>${screen}</fieldset></main></body></html>`;
}
export function academyPhoto(id){
 const n=Number(id);const color=['#0052a1','#263b50','#a12c3b'][Number.isInteger(n)?Math.abs(n-1)%3:0];
 return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#edf3f9"/><path d="M0 310h640" stroke="#c9d8e8"/><g stroke="#13233a" stroke-width="14" fill="none"><circle cx="185" cy="265" r="60"/><circle cx="465" cy="265" r="60"/><path d="m185 265 85-120 85 120H185m85-120 110 15 85 105M355 265l38-133 44-7" stroke-linejoin="round"/></g><path d="m250 145 58-36 79 28-24 55-100-15Z" fill="${color}"/><path d="m225 125-47-6-10 17 78 13m137-12 17-45h35" fill="none" stroke="#13233a" stroke-width="13" stroke-linecap="round"/><text x="320" y="370" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#52677f">ILUSTRAÇÃO FICTÍCIA · SOMENTE TREINAMENTO</text></svg>`;
}
