---
name: Bajaj InteriorSP
description: Identidade Bajaj aplicada à concessionária do interior paulista.
colors:
  blue: "#0052a1"
  blue-hover: "#003f7e"
  navy: "#071d36"
  ink: "#152435"
  muted: "#4f6072"
  pale: "#f3f5f7"
  white: "#ffffff"
  line: "#d6dce3"
  field-border: "#9eabb9"
  focus: "#d47a13"
  error: "#a5291d"
typography:
  display:
    fontFamily: "DIN, Helvetica, Arial, sans-serif"
    fontSize: "clamp(42px, 5vw, 96px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-.025em"
  headline:
    fontFamily: "DIN, Helvetica, Arial, sans-serif"
    fontSize: "clamp(34px, 3.4vw, 68px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-.025em"
  title:
    fontFamily: "DIN, Helvetica, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "DIN, Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DIN, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 500
  fine:
    fontFamily: "DIN, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  square: "0px"
spacing:
  gutter: "clamp(20px, 5vw, 160px)"
  section: "clamp(56px, 6vw, 140px)"
  action-gap: "20px 28px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
    textColor: "{colors.white}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 12px"
  catalog-card:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
---

# Design System: Bajaj InteriorSP

## Overview

**Creative North Star: "Identidade Bajaj"**

A identidade é a Bajaj fornecida pelo cliente, aplicada à concessionária local. Azul de marca, branco, navy e fotografias oficiais de produto sustentam uma apresentação direta. Não se trata de uma nova identidade: as escolhas registradas aqui descrevem a implementação atual.

A composição combina faixas amplas, tipografia DIN e imagens de motos inteiras. Os logotipos mantêm proporção e área de proteção em superfície branca. Esta documentação foi extraída do código; a inspeção visual no navegador permanece pendente conforme `QA.md`.

**Key Characteristics:**
- Identidade Bajaj e acervo oficial fornecido.
- DIN local, preços legíveis e hierarquia direta.
- Faixas fluidas e produtos sem recorte.
- Controles retos com estados explícitos.

## Colors

O azul de marca conduz ações e faixas comerciais; navy, branco e neutros organizam conteúdo e contraste. Os valores normativos estão no frontmatter.

### Primary
- **Azul Bajaj digital** (`blue`): ações, links, seleção e faixas comerciais. Foi amostrado do logo fornecido; não representa uma conversão oficial Pantone.
- **Azul de interação** (`blue-hover`): hover do botão principal e atendimento flutuante.

### Neutral
- **Navy** (`navy`): base das sobreposições e fundos escuros de produto; o hero cinematográfico da home usa sua variação específica (`#071426`).
- **Branco** (`white`): fundo principal, navegação, campos e proteção dos logos.
- **Neutro claro** (`pale`): alternância de faixas e superfícies de catálogo.
- **Texto principal** (`ink`) e **texto secundário** (`muted`): leitura e informação de apoio.
- **Divisória** (`line`) e **borda de campo** (`field-border`): separação de blocos e limites de formulário.

O âmbar `focus` identifica foco de teclado; `error` identifica mensagens de validação. São cores funcionais, não novas cores de marca.

**The Official Asset Rule.** Preserve a cor e a integridade dos logotipos fornecidos; use-os em branco com área de proteção.

## Typography

**Display Font:** DIN Next LT Pro local, declarada como `DIN` no CSS; Helvetica, Arial e sans-serif como fallback.
**Body Font:** a mesma família local. O acervo contém pesos 300, 400, 500 e 700; os quatro estão declarados com `font-display: swap`.

A hierarquia usa títulos fortes, texto regular e valores monetários de peso médio com números tabulares. O frontmatter registra os padrões de base; hero, produto, cartões e faixas têm variações responsivas no stylesheet.

- **Display:** títulos principais; os títulos do hero e da D400 têm escalas próprias.
- **Headline:** títulos de seção, com ajuste em telas pequenas e muito largas.
- **Title:** subtítulos de base; títulos do catálogo e de serviços variam conforme o componente.
- **Body:** leitura com medida máxima usual de 68ch; reduz para 17px abaixo de 768px e sobe para 20px a partir de 1441px.
- **Label:** campos e ações, com peso médio.
- **Fine:** termos e apoio; peças específicas usam 12–15px conforme seu contexto.

## Layout

Faixas ocupam a largura disponível. Não existe max-width global no desktop; a medida é limitada no texto, não na página. Gutter e respiro de seção usam os tokens do frontmatter; acima de 1920px passam a 5vw e 6vw. Abaixo de 768px, o gutter é 24px e a seção 56px; abaixo de 429px, 20px e 48px.

A navegação muda para menu compacto até 1100px. O mega menu apresenta seis motos em seis colunas no desktop, três no menu compacto e duas abaixo de 429px. O catálogo usa três colunas, duas abaixo de 768px e uma abaixo de 429px. As composições editoriais de duas colunas se empilham no mobile. O CSS contém limites em 375/428/767/1100px e entradas em 1441/1921px; a matriz completa de renderização está em `QA.md`.

**The Whole Product Rule.** Fotos de moto e detalhes de produto usam `object-fit: contain`; preserve a moto inteira e a proporção do acervo.

## Elevation & Depth

A maior parte das superfícies é plana, separada por cor, espaço e divisórias finas. Sombras ficam no mega menu, atendimento flutuante e diálogos; sobreposições navy identificam contexto modal. Não há blur sobre o logo. Os valores de sombra, foco e movimento estão na sidecar.

## Shapes

Botões, campos, cartões e diálogos mantêm cantos retos. Botões principais usam borda de 2px. Exceções observadas são o símbolo circular de reprodução e o atendimento flutuante, que tem 2px de raio no desktop e se torna circular abaixo de 429px. Não generalizar essas exceções para os demais componentes.

## Components

### Buttons

Ações sólidas e diretas: botão principal azul com texto branco, variante clara para fundos escuros e variante de contorno azul. A base tem altura mínima de 52px, borda de 2px e preenchimento do frontmatter. As variantes mudam cor de fundo no hover em 0,2s. Links de ação têm sublinhado de borda e altura mínima de 44px; ícones têm área de 44px. Ajustes móveis específicos existem no hero e na D400.

### Chips

Os filtros de catálogo são retangulares, brancos, com borda fina, altura mínima de 44px e padding de 10px 24px. `aria-pressed=true` usa azul e texto branco.

### Cards / Containers

Cartões do catálogo têm fundo neutro claro, borda inferior de 2px e imagem contida. O corpo base usa padding de 24px 26px 28px, com ajustes responsivos. Cartões de unidade são blocos abertos com borda superior azul. Não adicionar sombras de cartão como padrão.

### Inputs / Fields

Campos brancos, retos e com borda fina; altura mínima de 50px. Labels são visíveis. O foco global usa contorno âmbar de 3px com afastamento de 5px. O campo monetário composto recebe o foco no conjunto, com afastamento de 3px. Erros são texto vermelho. Não há envio automático de valores.

### Navigation

Cabeçalho branco fixado durante a rolagem, com faixa neutra de unidade e divisória inferior. O logo horizontal preserva proporção 800:95; o logo vertical no rodapé preserva 100:125. O painel de modelos é branco, amplo e rolável quando necessário. Acionadores usam `aria-expanded`; hover e expansão destacam o azul.

### Unit selection and media

A unidade escolhida usa borda azul de 2px e fundo azul muito claro (`#f1f6fc`) no diálogo. A seleção é explícita e persistida no navegador. O vídeo institucional mantém reprodução sob demanda e controles nativos. Galeria abre imagem contida em diálogo. A preferência por movimento reduzido desativa transições e rolagem suave.

### Home hero

A revisão da home segue a composição Marello indicada pelo cliente, sem substituir a identidade Bajaj. O hero cinematográfico substitui o carrossel inicial: filme oficial Dominar 250 em background, subheadline “A experiência que vai além de pilotar”, headline branca em caixa alta sobre placa azul translúcida, descrição, CTA azul “Quero conhecer os modelos” para o catálogo e ícones SVG reais de Facebook, Instagram e YouTube ligados aos perfis da InteriorSP.

No desktop, o filme preenche o fundo com `object-fit: cover`, sob película escura; o texto fica alinhado à esquerda. Entre 1025px e 1920px a headline usa `clamp(44px, 3.4vw, 65px)` e medida máxima de 30ch. Abaixo de 768px, a mídia entra no fluxo normal (`position: relative`) em quadro 16:9, com filme integral em `object-fit: contain`; o conteúdo vem abaixo sobre navy, com padding de `30px var(--gutter) 56px`. Legenda e botão de reprodução ficam no topo da faixa para evitar o atendimento flutuante. As redes circulares são uma exceção específica deste hero.

O filme é silencioso, em loop, com autoplay condicionado às preferências de movimento e economia de dados. Não exibe controles de pausa/reprodução, conforme pedido do cliente. Mantém poster para fallback ou autoplay bloqueado e pausa ao sair da área visível ou ocultar a página. A transição de opacidade dura 0,45s e é desativada com movimento reduzido. O hero não é um componente de carrossel. Essa alteração foi conferida no código; a renderização em navegador continua não verificada.

### Closing contact band

A faixa final da home, imediatamente antes do rodapé, segue a referência fornecida pelo cliente (`image(3).png`). É uma faixa fluida de largura total com filme oficial Dominar 250 em background e gradiente azul escuro, conteúdo centralizado, título branco em caixa alta “Pronto para sair de moto nova?”, descrição e botão branco com texto azul “Quero falar agora”. O botão reaproveita o atendimento de vendas e a seleção explícita de unidade existentes.

A altura mínima base é `clamp(430px, 30vw, 650px)`, com padding de `90px var(--gutter) 100px`; acima de 1920px passa a 30vw com padding vertical de 6vw. Até 767px, usa mínimo de 460px e padding de `100px var(--gutter) 76px`. O título usa `clamp(32px, 2.6vw, 56px)` na base, 34px no mobile e 30px até 375px. Medidas máximas de texto não criam um container global. O vídeo é `object-fit: cover`; a legenda fica no topo da faixa, sem controles de pausa/reprodução.

Hero e faixa final compartilham o comportamento de `[data-background-film]`: `preload="none"`, carregamento e reprodução automáticos somente quando visíveis e quando movimento reduzido/economia de dados permitem, loop silencioso, sem controles visíveis, pausa com página oculta e poster de fallback. Quando a reprodução automática não é permitida, permanece a capa estática. A entrada do filme usa opacidade em 0,45s, desativada para movimento reduzido. A inspeção desta faixa foi de código; não houve validação visual no navegador.

## Do's and Don'ts

### Do:
- **Do** preservar os logotipos, fontes locais e imagens oficiais fornecidos.
- **Do** manter a moto inteira, preços em HTML e o próximo passo legível.
- **Do** manter faixas fluidas, limitando a medida de texto quando necessário.
- **Do** preservar foco visível e estados de seleção por atributos acessíveis.

### Don't:
- **Don't** inventar uma nova identidade, converter o azul amostrado em alegação Pantone ou aplicar efeitos ao logo.
- **Don't** introduzir um container global estreito no desktop.
- **Don't** transformar a solicitação de atendimento em aprovação ou cálculo de crédito.
- **Don't** declarar aprovação de renderização antes de executar a inspeção visual pendente.

## Catálogo interativo aprovado
A seção #motos usa o slider aprovado na prévia: título acima e, no desktop, foto e painel de informações lado a lado, com modelos vizinhos menores e atenuados. Navegação circular por setas, seis indicadores, fotos laterais e gesto horizontal em dispositivos de toque; nenhuma rotação automática. Um único índice atualiza foto, nome, descrição, preço e destino comercial. O teclado usa setas apenas quando o foco está nos controles do slider. A animação de 380ms respeita movimento reduzido.
As seis fotos transparentes vêm do catálogo do site oficial Bajaj, registradas em ASSETS.md, com padronização de margens sem alterar o produto. A interface mantém DIN local, branco e azul institucional. A seção é fluida, sem container global; no móvel a informação vem logo após a foto, com preço, CTA e controles no mesmo painel. Texto/ações de todos os modelos também ficam disponíveis em lista expansível.
O CTA principal abre a página da Dominar 400; para os outros modelos, ainda sem página, informa “Consultar com a BIA” e preserva contexto de modelo/preço e escolha de unidade. Preços e descrições ficam em data.json. Imagens da página D400 e do mega menu permanecem as do acervo original; catalogImage é específico desta seção. A inspeção visual em navegador permanece não verificada.

### Correção de visibilidade do catálogo
O print do cliente mostrou a descrição acima da área das motos e dos controles, fora do viewport. A seção foi reorganizada em .slider-experience: galeria à esquerda e .slider-details à direita. O painel usa sticky relativo à altura real do header e contém nome, descrição, preço, ação e navegação juntos. O ancestral não usa overflow:hidden para não quebrar sticky; somente o palco das imagens limita overflow. Altura da foto acompanha a altura útil do viewport. No móvel, foto e dados seguem em fluxo compacto. A troca manual verifica os limites reais do painel e faz apenas a rolagem mínima para expor os dados quando necessário, respeitando movimento reduzido. Sem rotação automática ou mudança de foco.


## Jornada de atendimento — Em cada quilômetro
Apenas a seção #vantagens foi substituída por uma estrada ilustrada própria. Quatro marcos e abas sincronizam a moto, o progresso, o odômetro e o painel de atendimento. SVGs inline genéricos, sem modelos reais ou imagens externas. A seção segue a especificação recebida: DIN já instalada; navy #13233A, azul #0E5FB4, amarelo #F2B705 e fundo #F3F5F8; largura fluida com as mesmas margens laterais do site (--gutter), sem limite interno fixo; painel com cantos de 24px. O restante da home e as páginas de produto e privacidade foram preservados.
O percurso avança a cada cinco segundos somente com a seção visível e a página ativa. Qualquer interação ou foco em conteúdo pausa a troca de etapas até retomada explícita. A preferência de movimento reduzido desativa todas as animações/transições e inicia sem rotação automática. Ilustrações em loop só animam enquanto visíveis. Abas oferecem setas, Home e End; cidades oferecem setas e seleção por rádio. Foco de 3px azul, alvos mínimos de 44px. Abaixo de 860px, fases/bandeira são ocultadas, abas têm duas colunas e painel empilha. Em telas muito estreitas o título pode quebrar além das duas linhas para manter 40px e leitura sem compressão.
Cidade inicial Rio Preto, acelerador 35, Manutenção marcada. A escolha de cidade é local à jornada e não grava nem altera a preferência global da unidade. O balão e o CTA acompanham a cidade. O acelerador é ilustrativo, sem alegação de velocidade. Serviços atualizam contagem e contexto local, sem transmissão. Os quatro links provisórios foram mantidos literalmente por instrução: #contato, #test-ride, #oficina e #garantia. Eles ainda não iniciam atendimento.


### Alinhamento da jornada ao viewport — correção do print image(6)
Removido o max-width de 1320px da .j-container. A seção agora reutiliza --gutter, inclusive suas regras para móvel e telas acima de 1920px. Título, estrada, abas e painéis ocupam a mesma largura útil das demais seções e alinham com o header. A altura, as ilustrações, os textos e os comportamentos foram preservados. A atualização do pedido do cliente substitui o limite local fixo da especificação anterior.


## Hero showroom — referência image(7), 19/10/2026
Esta revisão substitui o hero cinematográfico anterior. Composição: mídia em toda a faixa no desktop, título branco em caixa alta na região inferior esquerda, descrição, CTA azul retangular, duas setas circulares e crédito vertical à direita. A faixa branca dos seis modelos fica sobreposta à base do hero. Conteúdo e bandeja reutilizam --gutter para alinhar com o site inteiro, sem container global fixo. Fontes DIN locais e ativos oficiais existentes.
O primeiro estado é Dominar250, com o filme de fundo, capa e carregamento por visibilidade. Os outros cinco slides mostram sua própria imagem oficial em composição de estúdio navy, mantendo o produto integral em contain. O vídeo não é apresentado como filmagem de outra moto. A referência BMW define o layout; sua fotografia não foi reutilizada. O desenho específico das mídias difere porque o acervo Bajaj tem vídeo de detalhes e fotos transparentes, sem foto de rodagem equivalente autorizada para todos os modelos.
Slider manual circular por setas, miniaturas, teclado (setas, Home e End) e swipe horizontal. Nome, descrição, imagem, crédito e ação usam um único estado. D400 segue à página existente; demais modelos abrem a BIA com contexto no fluxo de escolha de unidade já implementado. Textos e dados derivam de data.json, sem preços ou especificações novos.
No móvel, a mídia ocupa um quadro próprio acima do conteúdo, mantendo o vídeo e as motos sem recortes. A bandeja usa rolagem horizontal interna, sem alargar a página, e mantém a miniatura selecionada visível desde a entrada. O hero não usa alturas fixas que recortem texto; telas curtas podem exigir rolagem vertical natural. Desktop dimensiona a faixa considerando header e bandeja. Acima de 1920px adapta à largura real. Foco visível e alvos de 44px; animações respeitam movimento reduzido. Vídeo pausa fora da tela, em aba oculta ou em outro slide; economiza dados e não possui controle de pausa visível, conforme pedido anterior. A faixa final permanece com seu comportamento anterior.


### Altura ampliada do hero — print image(8)
A mídia principal agora ocupa pelo menos a altura útil da janela após o header, com mínimo de 720px no desktop (inclusive acima de 1920px) e 640px em 768–1024px. A bandeja de modelos deixa de ser descontada da altura da mídia e aparece abaixo, mantendo a sobreposição original. No viewport do print (aproximadamente 1910×950, header de 143px), a altura calculada cresce de cerca de 630 para 807px. Sem altura máxima fixa: janelas altas continuam fluidas. Fotos permanecem em contain e o conteúdo segue no fluxo normal. Composição móvel até 767px permanece em mídia + texto, com altura natural, sem área vazia imposta.


## Dominar 400 — página recriada a partir de Texto colado.txt
Nova página de produto, mantendo os templates globais de cabeçalho/rodapé e toda a home. Após a correção do print image(9), o conteúdo desta página também usa a largura útil e as margens --gutter do site, sem limite de container fixo. DIN local, títulos 800 em caixa alta, interface preta #0A0B0D, branca, cinza #F2F4F7 e azul #0052A1/#3D8BFF. Verde aparece somente na foto oficial da moto, sem acento verde, amarelo ou laranja na interface.
Hero em iluminação de showroom, feixes, cinco rastros, DOMINAR em contorno, foco horizontal por mouse, imagem oficial de grande resolução e reflexo decorativo. Controle pausa os efeitos; o rótulo muda para vídeo somente quando houver um MP4 configurado. Valores técnicos usam odômetros visuais com texto equivalente acessível e valores finais como fallback sem JavaScript. Preço continua vindo de data.json, R$27.490,00. Animações e reprodução respeitam movimento reduzido e visibilidade.
A página inclui introdução, galeria de seis imagens com lightbox nativo em tela cheia, bloco editorial de vídeo, seis recursos alternando claro/escuro, seletor informativo Rain/Road/Off-Road/Sport, cinco abas técnicas, solicitação de financiamento e cards das duas unidades. Fotografias de motos completas usam contain; miniaturas têm margem para o zoom. Os detalhes de roda/freio e garfo são recortes explícitos da fotografia oficial, não reconstituições.
Simulação: entrada inicial R$8.000, prazo inicial 36 meses, unidade herdada da preferência existente ou seleção obrigatória. O range representa pontos monetários de 500 em 500 até R$27.000 e um último ponto em R$27.490 (intervalo final R$490). Não há cálculo de parcelas. A barra só representa entrada e diferença para o preço. Alterar unidade sincroniza a preferência comum via eventos de seleção, sem integração nova. O WhatsApp abre com o texto do anexo; nunca há confirmação de envio/agendamento. Maps, telefones, endereços e CNPJs vêm dos dados existentes.
Dados de produto/preço/especificações/unidades ficam em data.json; recursos, modos e URLs de mídia em d400-settings.json; dimensões/variantes em d400-assets.json; template em product_page.py. O MP4 e o YouTube continuam nulos por ausência de URLs. O hero funciona com iluminação; o card editorial informa o link pendente e oferece contato com a BIA. Não se reutiliza vídeo D250. As vistas oficiais fornecidas são em três quartos direito/esquerdo, usadas sem espelhar ou fabricar perfis laterais. Inspeção visual de navegador continua pendente.


### Dominar 400 — correção de viewport, image(9)
Removidos os limites de1240px do container geral,1000px da ficha técnica e1100px do card editorial. Hero, resumo, divisórias, ficha, recursos, galeria, simulação e unidades agora ocupam a largura útil do site, usando --gutter e suas regras móveis/ultrawide. O título do resumo técnico também foi centralizado em toda a faixa. Medidas máximas de texto preservam leitura; a foto central mantém seu tamanho de apresentação e não é esticada. Imagens responsivas passaram a considerar as novas colunas fluidas e incluem a variante nativa disponível, sem gerar novos ativos. Nenhum texto, preço, link comercial ou comportamento foi modificado.

Vídeos D400 recebidos: principal NmF7uXA2Zms no fundo do hero desktop, silencioso, com pausa e fallback de showroom; detalhes Hmo9eyBJm2Y em player nativo após clique; complementar v0epzoJpspk por link. Fundo não inicia em mobile, movimento reduzido ou economia de dados. Mídias reais dependem de disponibilidade/incorporação do YouTube, ainda não verificadas em navegador. Home preservada.

Revisão image(10): removido o símbolo decorativo de três faixas de todos os rótulos da D400 (11 ocorrências). Rótulos de texto e alinhamentos permanecem; nenhum ícone funcional ou ativo da marca foi alterado.

Jornada KM02/03/04: ilustrações substituídas por imagens institucionais de aparência fotográfica, geradas por IA e explicitamente legendadas. Profissionais com uniforme navy Bajaj, cenas de test ride/oficina/suporte. Imagem integral em proporção3:2, sem recortar pessoas, mãos, capacete ou manual. KM01 e mapa preservados. Acelerador virtual removido junto ao velocímetro; controles do percurso, abas, serviços e CTAs preservados.

Revisão do enquadramento dos KMs02/03/04: sem legenda de geração por IA na interface. Imagens de borda a borda na metade esquerda, com proporção3:2 como referência de altura, sem faixa de rodapé ou faixas laterais de contain. Painéis fotográficos empilham abaixo de1280px para preservar enquadramento. Procedência das imagens continua documentada em ASSETS.md e journey-photo-prompts.md; não são apresentadas como registros reais das lojas.

## Expansão aprovada — seis produtos e páginas comerciais
A aprovação da home e D400 autoriza expansão do padrão para N150, NS160, NS200, D250 e NS400Z. Template product_page.py generalizado por configuração, com aparência D400 preservada: hero com produto integral, DIN, preço, apresentação, galeria, vídeo disponível, recursos alternados, ficha em cinco abas, simulação por WhatsApp e duas unidades. Dados e mídias são próprios de cada moto; N150 possui ABS apenas dianteiro e freio traseiro a tambor; modos aparecem somente onde constam na ficha entregue. CSS adicional é restrito a componentes novos (vídeo local, modos em fundo claro e título NS400Z a320px). Conteúdo principal aprovado da D400 permaneceu igual em comparação de tokens HTML.
Páginas funcionais criadas para ofertas/modelos e preços, financiamento, test ride, pós-venda, unidades e apresentação da concessionária. Menus apontam para essas rotas; consórcio/acessórios/avaliação mantêm atendimento real por intenção. Não existem páginas fictícias de eventos ou programas. Hero e catálogo mantêm composição aprovada, mas o CTA agora visita a página de cada um dos seis modelos. Cabeçalho/rodapé mantêm identidade e dimensões; diálogos de galeria adotam o nome do modelo aberto.
Todas as faixas usam --gutter do site, sem container desktop global. Grade de preços passa3→2→1; formulários e conteúdo empilham no mobile. Prévia permanece privada e noindex, sem DNS final ou identificadores de mensuração novos.

Nossas unidades: fotos reais das fachadas em duas faixas alternadas, com imagem integral e dados/contato ao lado. Desktop usa colunas1.1fr/1fr sem container global fixo; abaixo de1024px, imagem acima dos dados em ambas as unidades. Logotipos e enquadramento da fonte preservados. Crédito DivulgaçãoBajaj, ano do registro e fonte externa em cada foto. Atendimento BIA, WhatsApps, Maps, dados legais e endereços continuam vindo de data.json. Alteração restrita a essa página; demais seções de unidades do site permanecem como aprovadas.

### Mídia individual no hero
Cada miniatura seleciona o filme do próprio modelo. Apenas o player ativo pode reproduzir; ao trocar, destruir o iframe anterior e invalidar operações pendentes. Fundo mudo e sem controles, capa local até a reprodução iniciar, respeitando economia de dados e movimento reduzido. Altura, tipografia, overlay, CTAs e bandeja aprovados preservados.

### Slider de fotos da concessionária
A imagem de produto da introdução #interiorsp deu lugar a uma galeria manual com cinco fotos reais, legenda da unidade, créditos e fonte. Imagem inteira em palco 4:3, navegação por setas de 44px, miniaturas com cidade/assunto, swipe e teclado. Sem avanço automático. No mobile, texto primeiro e fotos em seguida, mantendo as margens globais.

### Galeria simplificada — 22/10/2026
Removidos miniaturas, etiquetas, títulos, créditos e link de origem visíveis, conforme print. Permanecem imagem integral, setas e contador. Texto institucional centralizado em relação à foto; espaço da navegação compensado somente no desktop. Procedência mantida em home-units-gallery.json e ASSETS.md.

### Controles do filme institucional — 22/10/2026
Apenas play/pause em botão de 48px sobre o player. Controles nativos, tela cheia e atalhos adicionais desativados no embed. Ícone SVG do YouTube junto ao link externo, sem mudanças no hero, CTA final ou páginas de modelos. Identidade e eventuais overlays próprios do YouTube continuam sob controle da plataforma.

## Slider de artes após o catálogo — 22/10/2026
Seção de largura total e altura disponível da tela descontando o header. Artes horizontais e verticais oficiais com object-fit:contain para preservar enquadramento, sem container global. Tipografia DIN, navegação manual por setas, contador, teclado e swipe. Sem autoplay. Links locais para cada modelo. Fontes e conteúdo centralizados em home-art-slider.json. Imagens locais WebP, carregamento lazy, troca após decode e descarte de carregamentos obsoletos. Demais módulos preservados.

### Fundo da simulação na home — 22/10/2026
#simulacao usa degradê 115deg entre os tokens navy #071D36 e azul institucional #0052A1 já presentes no site. Título, descrição e contato direto claros; texto secundário #DCE9F8. Formulário branco com texto #152435 preservado. Seletores restritos a body[data-page="home"], sem alterar páginas de financiamento ou produto.
