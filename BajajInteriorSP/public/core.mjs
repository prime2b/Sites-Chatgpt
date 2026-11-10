export const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
export const intents = {vendas:'Gostaria de conversar sobre a compra da minha Bajaj.',simulacao:'Gostaria de solicitar uma simulação de financiamento.',test:'Gostaria de solicitar um test ride. Aguardo a confirmação de disponibilidade e horário.',consorcio:'Gostaria de informações sobre o Consórcio Nacional Bajaj.',revisao:'Gostaria de solicitar uma revisão. Aguardo a confirmação de disponibilidade e horário.',manutencao:'Gostaria de atendimento para manutenção da minha moto.',pecas:'Gostaria de consultar peças genuínas Bajaj.',acessorios:'Gostaria de consultar acessórios Bajaj.',garantia:'Gostaria de informações sobre a garantia Bajaj.'};
export function whatsappURL(data,{unit,model,intent='vendas',entry='',term=''}={}){
 const u=data.units.find(x=>x.id===unit);if(!u)throw new Error('Escolha Rio Preto ou Bauru.');
 const m=data.models.find(x=>x.id===model);
 const parts=['Olá, BIA! Vim pelo site da Bajaj InteriorSP.'];
 if(m)parts.push(`Tenho interesse na ${m.name}, com preço anunciado de ${money(m.price)}.`);
 parts.push(intents[intent]||intents.vendas);
 if(intent==='simulacao'){
  if(String(entry).trim())parts.push(`Entrada desejada: ${entry}.`);
  if(String(term).trim())parts.push(`Prazo desejado: ${term} meses.`);
 }
 parts.push(`Unidade: ${u.name}.`);
 return `https://wa.me/${u.phone}?text=${encodeURIComponent(parts.join(' '))}`;
}
