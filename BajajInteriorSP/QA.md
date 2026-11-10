# Verificação da prévia

## Integração Netlify — 03/11/2026

- 148/148 testes aprovados, incluindo sete novos testes do gateway: assinatura e expiração, domínio e rota, origem de escrita, IP confiável, filtragem de cookies e identidade, login/sessão/logout com o CMS real em banco isolado, permissões e central, upload de 12 MB como stream, falha de conexão e cobertura das rotas dinâmicas.
- TypeScript aprovado. Nenhum teste cria contatos ou usuários na produção. Publicação e verificações públicas no Netlify serão registradas após a implantação.

## Central de Ajuda e Treinamento online — 03/11/2026

- Entrega: 35 conteúdos protegidos (17 manuais, 12 aulas, três guias e três referências técnicas), 32 perguntas, busca, progresso por conta/versão, avaliação corrigida no servidor, apresentação para multiplicadores, observações de prática e editor com rascunho/publicação/revisões.
- Testes automatizados: 141/141 aprovados. A nova suíte verifica ausência de gabaritos no bootstrap, públicos por permissão, origem das mutações, autoria do progresso, cálculo da nota e erro crítico, gabarito histórico, conflito de edição, restauração sem republicação, retirada sem recriação pelo seed e ausência de gravação comercial no treinamento.
- Navegador com dados locais fictícios: busca por “reservar”; etapa da aula do Blog; conclusão e prova de 100%; recarregamento e persistência; editor, salvamento e publicação de manual; observação por administrador e leitura na conta do aluno; menus de Editor sem Contatos/equipe/multiplicadores; apresentação do roteiro com avanço de etapa.
- Simulador: ordem de fotos e publicação de seminova, publicação de artigo pelo formulário compartilhado e pausa de campanha com ocultação do banner. Nenhum exercício chama as APIs comerciais de escrita. Sessões e pessoas de validação ficaram apenas no D1 local; o mecanismo temporário de UI e a página de dimensões foram removidos antes do pacote.
- Responsividade: quadros de 428, 1024 e 1920 px. Larguras úteis observadas de 413, 1009 e 1905 px, respectivamente, sem overflow horizontal do documento. Manual e aula mantiveram seus fluxos responsivos.
- Python e verificação estática: 17 páginas preservadas, com dimensões/alt/rótulos e destinos válidos. TypeScript e build Vinext aprovados antes da verificação visual; o pacote final é recompilado após os ajustes de navegação.
- A conferência visual ocorreu em ambiente local isolado. Não se acessaram credenciais ou contatos de produção. Piloto com pessoas da Bajaj e treinamento ao vivo dependem da disponibilidade da equipe.

## Executado
- Sintaxe dos módulos JavaScript e do gerador Python.
- Testes de construção dos links WhatsApp: 6 modelos × 2 unidades × todas as intenções. Números, contexto, preço e codificação conferidos.
- Simulação: entrada/prazo opcionais, preservados no texto; ausência de cálculo de parcelas e confirmação falsa. Unidade não é adivinhada.
- Preços e duas unidades conferidos contra os valores do briefing.
- Páginas geradas: home, Dominar 400 e informação de privacidade/preferência local.
- Todos os arquivos locais, links de páginas e âncoras existem; imagens possuem alt e dimensões; campos possuem labels; aria-controls aponta para IDs existentes.
- Logos e fotos inspecionados como arquivos; WebPs decodificados; cinco motos transparentes com espaço de proteção no canvas. Dominar 250 mantém a foto original sem crop.
- Fontes DIN Next LT Pro fornecidas, locais. Fotos e vídeo oficiais documentados em ASSETS.md.
- Vídeo Dominar 250 otimizado 22s/720p/2MB com poster. O vídeo editorial usa controles nativos e carga por interação; o background do hero tem pausa acessível e só inicia automaticamente quando visível e permitido pelas preferências de movimento/dados.
- Privacidade da prévia: noindex/nofollow e robots bloqueado. Sem identificadores de rastreamento.

## Não verificado no navegador
O ambiente Sites está gerenciado e não disponibilizou a habilidade control-browser. Conforme o fluxo suportado, não foi iniciado servidor nem usado navegador alternativo. Portanto NÃO estão certificados visualmente: ausência de overflow, recortes na página, interação por mouse/toque/teclado, carrossel, vídeo, persistência de unidade, pop-up do WhatsApp e posicionamento do menu.

Matriz de renderização pendente: 320, 375, 376, 428, 429, 767, 768, 1024, 1025, 1100, 1101, 1440, 1441, 1920, 1921, 2560px, mais alturas curtas e zoom. CSS é fluido e contém as faixas solicitadas, mas isso não equivale a teste de renderização.

## Pendências para lançamento público
- Validação visual da home e D400 pelo cliente, antes de expandir as outras 5 páginas.
- Horários e e-mail por unidade; fotos próprias, depoimentos autorizados e campanhas/termos, quando existirem.
- Confirmar validade comercial dos preços e estoque/ano de cada unidade.
- Aprovar política definitiva/canais de privacidade e eventuais preferências de consentimento.
- Receber IDs de mensuração. Conectar domínio/DNS após liberação, ainda não configurados.
- Vídeo D400 não consta no acervo; não foi substituído por vídeo de outro modelo nessa página.

## Revisão independente de fonte
Revisão limitada ao código identificou e corrigiu entrada/saída de foco do mega menu, deslocamento de âncoras conforme a altura real do header e ícones dos controles do carrossel. Verificação em navegador permanece pendente.

Os links Maps foram preservados exatamente do briefing. A tentativa de abrir seus redirecionamentos pela ferramenta de pesquisa foi bloqueada pelo serviço; o local final exibido no Google Maps não pôde ser confirmado nesta sessão.

## Hero — revisão 19/10/2026
Substituído o carrossel inicial por vídeo de fundo oficial Dominar 250, com subheadline, headline em caixa alta, descrição e CTA para #motos conforme print fornecido. Pausa/reprodução manual, poster, carregamento condicionado à preferência de movimento/dados e à visibilidade. Redes somente as reais da InteriorSP. No móvel, a faixa de vídeo preserva o quadro inteiro. Ainda sem certificação visual por navegador nesta sessão. A cena do filme difere da referência Marello, pois o acervo autorizado disponível é o filme Dominar 250. Os controles ficam no topo para evitar sobreposição com o WhatsApp fixo. D400 e demais seções da home não foram editadas nesta rodada.

CTA final — revisão 19/10/2026: adicionado após unidades e imediatamente antes do rodapé da home. Vídeo oficial Dominar 250 reutilizado por cache, carregado só quando visível e respeitando movimento reduzido/economia de dados, com controle próprio e capa. O mesmo comportamento atende ao hero por atributos de componente, sem alterar sua aparência. Chamada de vendas usa escolha de unidade existente. HTML Dominar400 preservado. Inspeção de renderização continua pendente.

Ajuste solicitado: controles visíveis de pausa/reprodução removidos do hero e CTA final, junto aos listeners correspondentes. Mantidas preferências de movimento/dados e pausa automática por visibilidade. Sem verificação de navegador nesta rodada.

Catálogo slider — 19/10/2026: grade substituída pela prévia aprovada, com seis fotos transparentes oficiais novas, campos catalogImage/catalogDescription centralizados. Código confere sincronismo por único índice, volta circular e navegação por indicadores/setas/vizinhos/swipe; ações D400/página e demais BIA. Preços e WhatsApps continuam cobertos pelos testes. Fotos/alfas e destinos locais conferidos. Matriz de renderização e interação real por navegador permanece pendente.

As imagens oficiais da N150 no ângulo padronizado têm fonte menor (535×357); as alternativas de maior resolução observadas mostram outro ângulo. Mantido o ângulo consistente sem reconstrução artificial. Nitidez da N150 pode ser inferior em telas amplas. Candidatos e resolução estão registrados em ASSETS.md.

UX do slider — print image(5).png: descrição saía do viewport acima das motos/controles. Corrigida estrutura para galeria e painel de dados/controles na mesma faixa do desktop e ordem compacta no móvel. Sticky usa altura real do header; palco usa altura útil. Após interação, retângulo do painel é comparado ao viewport para recuperar leitura com rolagem mínima. Quatro testes de geometria da recuperação passaram (acima do header, abaixo do viewport, já visível e movimento reduzido/tela curta). Sem certificação de renderização por navegador disponível nesta sessão.


## Jornada #vantagens — 19/10/2026
- Seção substituída por estrada, moto SVG genérica, quatro marcos, odômetro, abas e quatro painéis ilustrados. Sem imagens ou fontes externas novas.
- Oito testes novos de lógica com relógio/DOM simulados: início por visibilidade, intervalo e loop; parada fora da seção/com página oculta; pausa manual persistente e retomada; seleção/foco por teclado; cidade/CTA; limites do acelerador; contagem de serviços; movimento reduzido e placeholders. Não são testes reais de navegador.
- Nove testes existentes de preços, intenções, WhatsApps, financiamento e visibilidade do catálogo continuam passando. Validação estática inclui rótulos, IDs, referências ARIA, arquivos e os quatro links provisórios explicitamente autorizados.
- A comparação do HTML comprova que a home fora da seção e das duas inclusões de CSS/JS está igual. Dominar 400 e privacidade são byte a byte idênticas. Dados, estilos globais e app anterior não foram alterados.
- Links pendentes fornecidos pelo cliente: #contato, #test-ride, #oficina e #garantia. Mantidos como placeholders, sem inventar destinos nem afirmar envio/agendamento. Os outros contatos do site seguem funcionais como antes. A cidade local da jornada não muda a preferência global.
- Sem control-browser disponível neste ambiente Sites: renderização, overflow e interações reais por mouse/toque/teclado não foram certificados. Continua pendente a matriz 320, 375, 428, 767, 859/860, 1024, 1440, 1920 e acima de 1920px, incluindo transições. Regras CSS e leitura de código não substituem essa inspeção.


## Alinhamento da jornada ao viewport — print image(6), 19/10/2026
O print mostra a seção recuada em relação ao header e catálogo: no viewport de aproximadamente 1920px, o limite de 1320px deslocava as bordas para perto de 300px. Corrigidas somente duas regras de journey.css: padding horizontal usa --gutter do site e o conteúdo usa 100% da largura útil, sem max-width fixo. Em 1920px, a largura útil calculada é 1728px, com margens de 96px, alinhada às demais faixas. Acima de 1920px continua em 90% da largura real conforme --gutter:5vw do site. Abaixo de 768px usa 24px; até 428px usa 20px, conforme as mesmas regras globais.
Verificação de código, cálculo de larguras nas faixas e regressões existentes; não equivale a renderização real. Screenshot recebido foi inspecionado. Browser QA continua indisponível porque control-browser não está disponível. HTML, scripts, estilos globais e página da Dominar 400 permanecem intactos.


## Hero showroom — referência image(7), 19/10/2026
- Hero redesenhado com composição inferior esquerda, setas circulares e bandeja branca sobreposta com os seis modelos oficiais. Vídeo Dominar 250 mantido no estado inicial; demais modelos têm sua própria foto, sem atribuir o filme D250 a outro produto. Slider manual.
- Seis novos testes verificam o payload gerado dos dados centrais, imagens locais, loop, correspondência exclusiva de vídeo/D250 e página/D400, distinção de swipe horizontal/vertical, condições de reprodução e marcação de miniaturas/CTAs. Total: 23 testes de lógica e marcação passaram, incluindo os 17 anteriores. Sintaxe JS e verificações estáticas de arquivos/IDs/ARIA/links passaram. Isso não certifica interação real em navegador.
- Comparação de bytes confirmou: restante da home fora do hero e das inclusões específicas de CSS/JS, página D400, privacidade, dados comerciais, app.mjs, styles.css e jornada permanecem idênticos. Nenhum contato ou integração foi substituído.
- O print foi inspecionado; ativos existentes foram reutilizados. O filme disponível mostra detalhes estáticos da D250, e as demais imagens são fotos de produto transparentes. Não há fotografia de rodagem equivalente à referência BMW para cada moto. Limite de nitidez da N150 em exibição grande permanece o da fonte oficial já documentada em ASSETS.md.
- Control-browser não está disponível neste ambiente Sites gerenciado. Sem servidor/navegador alternativo. Continuam pendentes renderização, overflow, vídeo e interações reais nos viewports 320, 375, 428, 767, 1024, 1440, 1920 e superiores, além das transições 428/429, 767/768 e 1024/1025. CSS prevê as faixas; inspeção de código não equivale a validação visual.


## Altura ampliada do hero — image(8), 19/10/2026
Ajuste limitado às alturas mínimas do hero em home-hero.css e remoção da variável de bandeja que não é mais necessária. Em desktop, min-height:max(720px,calc(100svh - var(--header-height))); entre 768 e 1024px, mínimo 640px com a mesma referência à altura útil. Abaixo de 768px, regra de altura natural preservada. Bandeja, margens, tipografia, imagens, vídeo, slider, CTAs e demais seções não mudaram. Print inspecionado e cálculo de crescimento conferido; renderização real nos viewports continua pendente por indisponibilidade de control-browser no ambiente gerenciado. Verificação estática e testes existentes pertinentes do hero passaram.


## Dominar 400 recriada — Texto colado.txt, 19/10/2026
- Novo conteúdo da página: hero em showroom, foto e reflexo, resumo técnico com números rolantes, preço, introdução, seis fotos em lightbox, seis recursos, quatro modos informativos, cinco abas, simulação solicitada via WhatsApp e cards de Rio Preto/Bauru. Mantidos dados oficiais 2026/2027 existentes e preço R$27.490,00.
- Oito testes novos cobrem pontos da entrada (incluindo máximo e saldo zero), 24 combinações de entrada/prazo nos dois números, rejeição de unidade ausente, submissão sem envio confirmado, contexto da mensagem, sincronização de unidade e armazenamento, seleção por clique/teclado em DOM simulado, pausa de efeitos, semântica do lightbox, arquivo nativo e loop da galeria, preservação de dados e ausência de filme D250. Com os 23 anteriores: 31 testes passaram. Testes de DOM são simulados e não certificam navegador.
- Validação estática passou para IDs, âncoras, rótulos, arquivos, imagens/alt/dimensões, fontes, SEO e links. HTML balanceado. Todos os srcsets têm arquivos locais e larguras declaradas correspondentes à imagem real. Três ângulos completos têm 80px de espaço de proteção e nenhuma reconstrução. O título a 34px mede aproximadamente240px incluindo a tarja, dentro dos 280px disponíveis no viewport320.
- Home, privacidade, data.json, styles.css, hero da home e jornada permaneceram byte a byte iguais. HTML do cabeçalho/rodapé da D400 também está igual; apenas links de CSS/JS exclusivos foram adicionados ao head. Ajustes delimitados em app.mjs: eventos para sincronizar preferência de unidade e galeria aceita data-full com contador em formato 1 / 6. Os fluxos anteriores passaram nas regressões.
- Fluxo de entrada não calcula taxas nem parcelas; a barra é apenas preço menos entrada. Maior entrada R$27.490 exige último intervalo R$490, pois o preço não é múltiplo de500. Escolha de loja obrigatória quando não há preferência. Mensagem pronta e fallback só indicam abertura/preparação; envio deve ser feito pelo visitante no WhatsApp.
- Pendências reais: URL MP4 da D400 e URL YouTube oficial não constam no texto/acervo disponível. Hero tem fallback de showroom com pausa de efeitos; seção de vídeo mostra link pendente e contato funcional. Não há play fingindo reproduzir conteúdo inexistente. As vistas oficiais disponíveis são três quartos, não perfis laterais puros. Dados originais preservados sem espelhar.
- Sem control-browser no ambiente Sites gerenciado. Não foram executados preview ou navegador alternativo. Continuam não certificados renderização, overflow, cliques/toque/teclado reais, pop-ups e vídeo nos viewports320,375,428,767,1024,1440,1920 e superiores, inclusive transições428/429,767/768,1024/1025. Código e testes não substituem essa validação.


## Viewport da Dominar400 — print image(9), 19/10/2026
Print inspecionado: o container fixo de1240px criava margens de335px na tela de1910px, em vez dos95,5px do header. Removido o limite geral e os limites de layout da ficha e vídeo; margens agora vêm de --gutter, iguais às da home. A largura útil calculada passa a1719px nesse viewport; em1920px é1728px e em2560px é2304px. Corrigido também o alinhamento do rótulo Especificações técnicas, cujo max-width de parágrafo o deixava deslocado. As medidas máximas de leitura e a imagem principal foram preservadas.
Srcsets foram atualizados para as colunas fluidas, com variantes nativas e larguras únicas conferidas nos arquivos. Validação estática e oito testes existentes da página passaram. Home, privacidade, dados, scripts e estilos globais permanecem byte a byte iguais; HTML D400 mudou somente nos atributos responsivos das imagens. Renderização real/overflow continuam não certificados, por indisponibilidade de control-browser no ambiente gerenciado. As pendências de URLs de vídeo permanecem as mesmas.

## Vídeos Dominar 400 — links recebidos em 19/10/2026
- NmF7uXA2Zms: fundo do hero via API oficial YouTube, mudo, em loop, apenas em desktop visível, sem economia de dados nem movimento reduzido; pausa por botão, página oculta ou saída do hero. Foto local e showroom continuam como fallback. Sem baixar/reutilizar arquivos de mídia ou simular MP4.
- Hmo9eyBJm2Y: seção de detalhes, iframe youtube-nocookie criado após clique, com som, controles nativos, fullscreen e link direto de alternativa. v0epzoJpspk: link complementar. IDs e destinos centralizados em d400-settings.json, sem parâmetros de compartilhamento.
- Os três URLs foram consultados, mas o serviço de busca retornou bloqueio/throttling e nenhum metadado; não foi possível confirmar conteúdo, duração, permissão de incorporação, autoplay ou reprodução. Links são os indicados pelo cliente, sem afirmação adicional sobre o conteúdo. API implementada conforme documentação oficial developers.google.com/youtube/iframe_api_reference.
- Verificação estática e 12 testes pertinentes passaram: inclui quatro testes novos de carregamento condicional, pause/retomada, cancelamento antes da API ficar pronta, erro de incorporação, dimensionamento geométrico do iframe, clique de detalhes e três destinos. Testes usam mocks, não reproduzem vídeos reais.
- Home e outras páginas preservadas. Sem control-browser disponível: renderização, reprodução real, disponibilidade dos vídeos, bloqueios externos/autoplay e matriz de viewports permanecem pendentes de teste em navegador. Nenhum servidor de preview ou caminho alternativo de browser foi usado.

## Remoção dos adereços — print image(10), 19/10/2026
Print inspecionado: marca vermelha sobre o símbolo de três faixas, anterior ao rótulo Simulação. Removidos os 11 SVGs desse mesmo adereço em todas as seções da D400 pelo helper eyebrow; rótulos preservados e regra CSS exclusiva do SVG removida. Comparação automática comprovou que o HTML gerado difere somente pela remoção desses SVGs; home, privacidade, dados, vídeos e scripts permanecem idênticos. Verificação estática passou. Inspeção visual em navegador continua indisponível no ambiente gerenciado sem control-browser.

## Fotografias ilustrativas da jornada — 19/10/2026
Print recebido inspecionado; apenas os painéis KM02/03/04 passam a imagens geradas, identificadas no site. Acelerador e código associado ao velocímetro retirados, pois não controlariam mais um gráfico. Sete testes de jornada passaram: temporização/visibilidade/loop, pausa, marcos e abas, teclado, cidade do mapa, serviços e placeholders. Teste antigo do acelerador removido junto da funcionalidade; validação de markup agora aceita exatamente três imagens locais. As quatro âncoras provisórias autorizadas pelo usuário permanecem deliberadamente sem integração. Não foi ativado contato/agenda novo. Browser QA permanece indisponível no ambiente Sites sem control-browser; ausência de overflow e interação real nos viewports ainda não certificadas.

Ativos finais conferidos: 1536×1024 e768×512, WebP entre34KB e151KB por arquivo; lazy-loading e srcset. Comparação de bytes confirmou home fora da jornada, KM01/estrada/abas, D400, privacidade, dados e scripts/estilos compartilhados intactos. No desktop, imagem em contain posicionada dentro da altura do painel para não impor altura nova à rotação; no móvel, proporção natural3:2 e legenda no fluxo. Sem cortes intencionais de pessoas/objetos.

## Preenchimento dos cards — print image(20261020-000530), 19/10/2026
Legenda de geração por IA removida conforme pedido; alt mantém descrição como cena ilustrativa, sem atribuir locais/equipe reais. Procedência original permanece no registro de ativos. Fotos agora ocupam a mídia sem as faixas laterais ou a faixa inferior de legenda. Proporção3:2 impõe altura natural mínima ao painel; object-fit:cover apenas quando a coluna acompanha altura maior do texto. Abaixo de1280px, somente os três painéis fotográficos empilham, mantendo imagem natural integral acima do texto; entre1280/1599px, espaçamento e título compactos evitam coluna de texto excessivamente alta. Srcset ajustado ao novo breakpoint. Verificação estática e sete testes da jornada passaram. Comparação confirma restante da home, D400, scripts e dados preservados. Sem navegador disponível para certificar renderização/corte em todos os viewports; não houve nova edição dos pixels nem geração de imagens.

## Expansão do site após aprovação — 19/10/2026
Escopo: cinco páginas de produto (PulsarN150, NS160, NS200, D250, NS400Z), mais ofertas/preços, financiamento, test ride, pós-venda, unidades e apresentação InteriorSP. Total14páginas com a home, D400 e privacidade. Header, menu, catálogo e slider do hero levam às seis rotas reais de moto; as demais novas páginas têm função comercial específica. Contatos de consórcio, acessórios e avaliação continuam com intenção explícita na BIA, sem campanhas, eventos ou programas inventados.

Fonte comercial: seis preços originais do briefing e apenas duas unidades; comparação automática confirmou nomes, números, endereços, Maps e CNPJs originais. Fonte técnica: documentos entregues no Drive, salvos em source-model-specs.json; N150/NS160/NS200/NS400Z2026/2026, D2502026/2027. Conteúdo aprovado D400 preservado por comparação do main normalizado; dados originais D400, mídias e configuração próprios preservados. Home mantém conteúdo/composição aprovados; só ações de navegação foram conectadas às rotas reais. D400 recebe novas opções de menu, sem reformulação do conteúdo.

Verificação: HTML de todas as páginas, IDs, rótulos, ARIA, alt/dimensões, âncoras, arquivos, canonical/schema e ausência de CPF/documentos/scripts de mensuração externa. Variantes dos35grupos iniciais de imagens conferidas com dimensões reais, sem reconstrução; quadro adicional da família NS tem1280×720. Imagens de produto e galeria em contain, com srcset e lazy-loading; hero prioritário. Verificada largura tipográfica do título NS400Z no mínimo320px; ajuste específico a32px abaixo360px. Cálculo de larguras mantém gutter20px até428,24px até767 e5vw em telas maiores, inclusive acima1920; isso é conferência de regras, não renderização.

Seis testes de regressão novos cobrem: HTML/schema/modelo/preço/galerias e unidades próprios dos seis produtos;144combinações de modelo/unidade/entrada/prazo; separação de versões, ABS e modos; navegação e sitemap;24combinações de test ride/pós-venda nos dois WhatsApps; inicialização dos seis formulários, com ou sem seletor de modos, troca de unidade e envio contextual em DOM simulado. Contatos sem unidade são rejeitados e nenhuma mensagem afirma envio/agendamento/aprovação. Campos livres/datas/entrada/prazo não são enviados ao dataLayer. Vinte e quatro combinações de serviços/modelos/unidades verificadas sem falsa confirmação.

Vídeos: D250 local com controles e capa, N150 eNS400Z players oficiais sob demanda; NS160/NS200 player oficial da família NS claramente identificado, com capa do acervo. O MP4 original da família NS apresentou erros NAL e seu derivado foi descartado. Reprodução real, autoplay, permissão de incorporação e pop-ups não foram certificados. Sem control-browser disponível: não foi iniciado preview nem navegador alternativo. Continuam pendentes testes visuais/interações reais em320,375,428,767,1024,1440,1920 e telas superiores, incluindo transições428/429,767/768,1024/1025 e grades de ofertas.

Pendências herdadas preservadas: os quatro links temporários da jornada (#contato,#test-ride,#oficina,#garantia) seguem exatamente a instrução de mantê-los até receber os definitivos. Não foram silenciosamente redirecionados. Acesso privado, noindex/nofollow e robots disallow preservados. Nenhum DNS, analyticsID, admin, CRM, banco ou novaIA foi configurado. Lançamento público e política de privacidade definitiva continuam separados desta validação.

## Fotos das unidades — 19/10/2026
Pesquisadas fontes públicas, incluindo fabricante, matérias de divulgação e imagens. Rio Preto confirmado pela legenda MOTOO e comparado ao banner oficial da unidade; Bauru veio do comunicado da própria Bajaj. Foto da Marello em comunicado que também cita Rio Preto foi identificada e rejeitada, evitando atribuição errada. Inspeção dos arquivos confirma duas fachadas InteriorSP distintas. Sem IA ou alteração visual, apenas redução/compressão WebP proporcional. srcset e dimensões conferidos; imagens em largura fluida e altura natural, sem crop; grade empilha até1024px e mantém gutter global.
Verificação estática passou nas 14 páginas (IDs, ARIA, assets, alt/dimensões, links). Comparação de bytes confirmou13páginas restantes e data.json intactos; nenhum WhatsApp, Maps, endereço ou CNPJ foi alterado. Testes de lógica não foram repetidos, pois scripts/fluxos não mudaram. Navegador control-browser continua indisponível; renderização real, overflow e links externos nos viewports320,375,428,767,1024,1440,1920 e superiores permanecem sem certificação.
Pendência factual encontrada na pesquisa: Bajaj publica a loja de Bauru na Rua Araújo Leite1203, também grafada12-03 em publicação local, enquanto o dado aprovado em data.json está123. Instrução vigente exige preservar os dados registrados no briefing; não houve correção silenciosa. Divergência deve ser confirmada com o cliente antes de atualizar. Fontes: comunicado Bajaj de09/09/2026 e cadastro nacional da fabricante. Contatos de vendas e Maps do briefing permanecem intactos.

### Ícones dos serviços da home — 20/10/2026
- Moto, moeda com setas e chave inglesa em SVG inline decorativo, acima dos títulos e alinhados à esquerda. CSS limitado à seção de serviços.
- Build e verificação estática das 14 páginas passaram; outras 13 páginas byte a byte preservadas. Conferência visual em navegador indisponível nesta sessão.

### Hero com seis vídeos — 22/10/2026
- Build e validação estática das 14 páginas aprovados. Outras 13 páginas HTML preservadas byte a byte.
- Nove testes focados em navegação, correspondência de modelo/mídia, preferências de movimento/dados e ciclo de vida do player passaram. Incluem troca durante carregamento da API, callbacks antigos, remoção do iframe e fallback por erro/autoplay bloqueado.
- Prévia via Sites preview e CUA: seis seleções, textos/CTA e iframe do modelo conferidos; um iframe por vez; vídeo local pausado nos outros modelos. Sem overflow na largura disponível de 1353px. Dominar 250 reproduziu com readyState 4, mudo e is-playing.
- YouTube: API e iframes com títulos corretos carregaram; o vídeo N150 ficou em readyState 0/currentTime 0 no navegador remoto, com a capa preservada. Reprodução efetiva dos cinco streams externos não certificada. Não há API de redimensionamento disponível neste navegador; demais viewports não foram certificados nesta rodada.
- Pendência pré-existente identificada: vídeos de NS400Z estão associados à página de detalhes aprovada da Dominar 400; esta entrega modifica somente o hero da home.

### Galeria das unidades na home — 22/10/2026
- Build, verificação estática das 14 páginas e sintaxe do módulo passaram. Outras 13 páginas HTML preservadas byte a byte.
- CUA na prévia: setas, seleção por miniatura, End e ArrowRight testados, inclusive retorno da última para a primeira. Contador, rótulo da foto, link de origem e seleção única conferidos.
- Sem overflow horizontal na largura disponível de 1353px; imagens usam object-fit:contain. Outros viewports não certificados nesta rodada (redimensionamento não disponível na API do navegador).
- Foto interna Rio Preto ainda depende de acesso ao histórico do Instagram, cuja autenticação foi rejeitada pela revisão automática sem autorização específica. Galeria publicada com fachadas de ambas e três interiores de Bauru, corretamente identificados.

### Simplificação da galeria — 22/10/2026
Build, verificação estática de 14 páginas e sintaxe do módulo aprovados. No navegador: navegação por setas, End e retorno circular com ArrowRight conferidos; ausência de thumbs e legendas visuais; sem overflow na largura disponível de 1353px. Demais tamanhos não certificados nesta rodada. Texto centralizado em relação à fotografia, descontando 62px da faixa de navegação no desktop.

### Vídeo da seção A estrada chama — 22/10/2026
Build e verificação estática das 14 páginas passaram. Comparação confirma alteração somente no bloco brand-film da home e CSS do novo player; hero, CTA final e outras 13 páginas HTML intactos. CUA confirmou título/autor do YouTube e player 16:9 (615×346px) com loading lazy. Clique em Assistir vídeo foi aceito, mas streaming permaneceu readyState 0/currentTime 0 no navegador remoto; reprodução efetiva não certificada.

### Play/pause do filme institucional — 22/10/2026
Três testes do controlador passaram: alternância e sincronização por eventos, cancelamento durante carregamento e fallback em erro. Build e verificação estática das 14 páginas aprovados; outras 13 páginas byte a byte intactas, home alterada só no bloco brand-film e importação do módulo. No navegador a 1353px: clique em Play e Enter em Pause, rótulos/ícones corretos, ícone do YouTube e destino externo verificados, um único botão próprio, sem overflow horizontal. Stream externo não iniciou imagem nesta sessão, portanto reprodução real não certificada; tamanhos adicionais não revalidados nesta alteração. Evidência: qa/family-film-play-pause.jpg.

### Remoção de destaque Dominar 400 da home — 22/10/2026
Removida somente a seção azul "Dominar 400. O próximo passo é seu.", identificada pelo anexo. Build e verificação estática das 14 páginas aprovados, sem âncoras quebradas. Comparação do HTML confirma exclusão exata desse bloco na home e outras 13 páginas byte a byte intactas. Sem nova validação visual nesta alteração de remoção.

## Slider fullscreen de artes — 22/10/2026
Build, verificação estática das 14 páginas e sintaxe do módulo aprovados. Comparação do HTML confirma adição apenas após catalog_slider() e antes da jornada, mais imports específicos na home; outras 13 páginas byte a byte intactas. CUA na home a 1353px: primeira arte carregada em 2560px, setas, End até a sexta e retorno circular à primeira verificados. Fixture temporária com o mesmo HTML/CSS, em iframes de viewports reais de 320,375,428,767,768,1023,1024,1440,1920,2560px: largura da seção igual ao viewport, sem overflow horizontal, texto dentro da largura, troca correta de fonte horizontal/vertical e object-fit:contain. Validação dos tamanhos isolou somente a nova seção, não revalidou a home inteira nessas larguras. Fixture removida antes de empacotar. Screenshot desktop qa/home-art-slider-desktop.jpg; captura adicional mobile falhou por timeout da API, sem comprometer as medidas DOM verificadas. Swipe implementado com bloqueio do clique após arrasto; não foi possível certificar gesto touch físico no navegador disponível.

## Troca das imagens da galeria institucional — 22/10/2026
14 itens confirmados: fachada Rio Preto original mais 13 anexos, sem manter nenhum outro item anterior. Os arquivos grandes têm conteúdo binário idêntico aos uploads, todos 1448×1086, e derivados pequenos mantêm 4:3 sem recorte. Build e validação estática das 14 páginas passaram. Comparação exata do HTML comprova que somente o bloco unit-photo-gallery foi alterado na home; outras 13 páginas intactas e CSS/JS sem mudanças. CUA a 1353px: 01/14, próxima para nova foto, End para 14/14, retorno circular à fachada original e carregamento de anexo verificados; object-fit:contain, sem overflow horizontal. Sem nova validação dos demais tamanhos, pois o layout aprovado foi preservado.

### Degradê azul da seção de simulação — 22/10/2026
Verificação estática das 14 páginas aprovada; todos os HTML e fluxo do formulário byte a byte preservados. Somente CSS visual e documentação alterados. CUA a 1353px confirmou degradê, textos claros, formulário branco com texto navy e ausência de overflow horizontal. Contrastes mínimos calculados no azul mais claro: branco 7,72:1, secundário 6,27:1; texto do formulário 15,72:1. Demais viewports não revalidados nesta alteração de cor, sem mudanças geométricas. Evidência qa/home-finance-blue-gradient.jpg.

### Centralização do texto da simulação — 22/10/2026
CSS restrito ao bloco de texto de #simulacao na home, a partir de 768px: align-self:center. Mobile empilhado preservado pela media query. Validação estática das 14 páginas aprovada e HTML de todas preservado byte a byte. No navegador a 1353px, centros verticais do texto e formulário coincidem exatamente (diferença 0px); sem overflow horizontal. Demais larguras não revalidadas nesta rodada. Evidência qa/home-finance-centered.jpg.


## 2026-10-23 — Google Maps em todas as chamadas Como chegar

- Atualizado o projeto existente Bajaj InteriorSP, preservando identidade e acesso.
- 22 chamadas em 11 páginas: ícone oficial do Google Maps, nome da unidade no rótulo acessível e abertura em nova aba.
- Links originais do briefing resolvidos com sucesso nesta sessão: Rio Preto aponta para -20.808297,-49.3809974; Bauru aponta para -22.321852,-49.068954. Os botões usam Maps URLs /maps/dir/?api=1 com esses destinos; os links originais permanecem no cadastro e nos dados estruturados.
- Ícone SVG local, sem dependência de carregamento externo.
- Validação: geração das 14 páginas, verificação estática, 46 testes existentes e inspeção das 22 chamadas por unidade aprovados. Navegador: ícones carregados em 24 × 24 px e layouts de unidades e produto conferidos.
- A interface externa de navegação do Google Maps não foi testada no navegador; as coordenadas dos destinos foram confirmadas pelos redirecionamentos dos links fornecidos.


## 2026-10-23 — Corpo da página Ofertas

- Alterado exclusivamente o corpo da página Ofertas. Comparação exata com a revisão anterior confirma o mesmo HTML do header, hero e rodapé; nenhum outro HTML publicado foi modificado. CSS e JavaScript da nova interface carregam somente em /ofertas/.
- Filtros Todos/Pulsar/Linha NS/Linha Dominar, ordenação crescente/decrescente e orçamento de R$ 16.500 a R$ 27.490 combinam-se em tempo real. Escada usa a distância real entre os preços, rótulos alternados e links para os seis cards.
- Grade com três/duas/uma colunas; palco integral em PNG, frases e preços aprovados, cartões de mesma altura, hover e destaque cruzado por ponteiro e foco. Na alteração contínua do orçamento, somente os novos cards animam, preservando a leitura dos que já estavam visíveis. Movimento reduzido respeitado.
- BIA: conferidos os seis links para cada unidade e suas mensagens exatas. Sem unidade definida, o contato solicita escolha pelo seletor existente. Nenhuma mensagem foi enviada no WhatsApp durante os testes.
- Navegador: filtros combinados, ordenação, teclado, estado vazio, reset, links da escada para modelos fora do filtro, as duas unidades e destaques cruzados conferidos. Viewports CSS de 375, 428, 1024, 1440 e 1920 px inspecionados por iframe de QA; nenhuma rolagem horizontal do documento, somente a escada de preços no celular. Iframe de QA removido antes da publicação.
- Verificação estática das 14 páginas e 49 testes Node aprovados. Os 28 PNGs nativos/responsivos foram verificados e decodificados com dimensões e alpha reais; um PNG nativo incompleto foi regenerado e conferido novamente.
- A especificação recebida encerra em “3. AJUDA”, sem conteúdo desse item; nenhuma seção de ajuda foi presumida.

A primeira sincronização do código excedeu o limite de tamanho do envio. Os PNGs nativos receberam compressão otimizada e limpeza apenas de RGB totalmente invisível, com verificação pixel a pixel: alpha, resolução e cores visíveis preservados. O commit local ainda não publicado foi atualizado para não carregar as versões maiores no envio.

O limite adicional por objeto do repositório foi atendido preservando os PNGs nativos em partes verificáveis no código-fonte. A reconstrução dos cinco arquivos foi testada após remover somente as saídas geradas, confirmando igualdade byte a byte por SHA-256. Os PNGs publicados permanecem integrais.

A hospedagem rejeitou o PNG nativo da N150 por superar 25 MiB. A versão publicada é 5900 × 5459 px, com 25744741 bytes, em PNG transparente. O nativo integral permanece no código-fonte. Todas as demais imagens conservaram suas dimensões; nenhum arquivo do pacote final excede 25 MiB.

## Revisão de mídias — 23/10/2026
- 14 páginas validadas; 52 testes aprovados. Originais de apresentação/galeria/recursos e posters conferidos por ID de origem; versões de resolução não são consideradas novos conteúdos.
- 40 verificações no navegador em 375/428/1024/1440/1920 px nas 8 páginas com mídias editoriais alteradas, sem overflow horizontal nem imagem quebrada visível. Harness temporário removido antes de publicar.
- Comparação exata confirma header/rodapé preservados nas 14 páginas e HTML de Ofertas integralmente preservado.
- Player N150 exibiu título oficial e duração 1:54 após acionamento. VídeosYouTube têm autor/título verificados por oEmbed, mas reprodução integral de todos os filmes externos não foi certificada.
- Detalhes das substituições e reutilizações funcionais em MEDIA-AUDIT.md.

## Carrossel de campanhas com cinco artes — 23/10/2026

Build, validação estática de 14 páginas e 52 testes aprovados. Comparação de HTML confirmou que só a seção indicada da Home mudou; as outras 13 páginas e o restante da Home permaneceram idênticos. Cinco originais publicados iguais byte a byte aos anexos.

No navegador, a navegação percorreu as cinco artes e retornou à primeira. Frames de 375/428/1024/1440/1920 px confirmaram largura/altura da imagem iguais às da seção, object-fit:cover, imagem carregada, nenhum texto comercial sobreposto, contador visual oculto e ausência de overflow horizontal. As versões pequenas foram selecionadas nos dois menores tamanhos. Fixture temporária removida antes de publicar.


## Fotos das páginas de modelos — preenchimento, 23/10/2026
- Ajuste restrito ao CSS compartilhado das seis páginas: apresentação, galeria e recursos agora usam imagem sem padding, posicionada até as quatro bordas do bloco e object-fit:cover, com proporção preservada e recorte central. Removidos o recuo e a linha decorativa do antigo palco da apresentação.
- Conferência no navegador: seis modelos × 375, 428, 1024, 1440 e 1920px; os 72 blocos de imagem coincidem com os respectivos contêineres, sem padding e sem overflow horizontal nas 30 combinações. Revisão visual da galeria e dos recursos da Dominar 250 no desktop e recurso em 375px; galeria Dominar 400 também inspecionada.
- Verificação estática de 14 páginas e 52 testes existentes aprovados. Os 14 HTMLs permanecem byte a byte iguais; hero, lightbox de ampliação, cabeçalho, rodapé e demais páginas mantêm seus estilos.

## Entrada das seções da Home — 25/10/2026
- Fade de 0,8s e subida de 20px, seguindo a referência das páginas de motos. A barra de atalhos e as dez seções seguintes entram uma vez ao aparecer na rolagem. O catálogo usa apenas fade para preservar seus detalhes com posição sticky.
- No navegador: os 11 blocos iniciaram pendentes abaixo da primeira tela, apareceram ao rolar e ficaram visíveis ao retornar; o catálogo permaneceu sem transform. Hero, cabeçalho e rodapé não recebem o efeito.
- Movimento reduzido, impressão, foco de teclado e ausência de IntersectionObserver mantêm o conteúdo acessível. Verificação de inicialização confirmou que movimento reduzido e navegador sem suporte não modificam os blocos.
- Sintaxe JavaScript, verificação estática de 14 páginas e os 52 testes existentes aprovados. Comparação de HTML confirmou apenas as duas novas inclusões de CSS/JS na Home; conteúdo da Home e as outras 13 páginas permanecem idênticos.

## 30/10/2026 — Giro 360° oficial

- Importação: seis modelos, 16 sequências, 255 quadros; imagens decodificadas e integridade/procedência registradas. Sem ativos N125 ou cor inventada.
- Build: 14 páginas geradas. Checagem estática aprovada; 59 testes Node aprovados, incluindo carregamento parcial/falha, limite de simultaneidade, troca atrasada de cor, navegação circular e preservação de modelo/arquivos.
- Navegador de prévia: seis giros ativados e girados; 16 combinações verificadas, incluindo o último quadro das cores adicionais de NS160/NS200/NS400Z. Troca N150 branca/preta, teclado e arrasto real conferidos. Imagens carregadas, sem overflow horizontal no viewport disponível de 1363 × 936.
- Limite: não foi feita emulação dos cinco viewports acordados nem ensaio em aparelho móvel real nesta execução. O CSS inclui a composição em coluna abaixo de 767 px e o gesto mantém `touch-action: pan-y`; esses comportamentos ainda exigem homologação nos aparelhos-alvo.
- Os quatro links provisórios da jornada da Home já existentes permanecem conforme a base anterior. A frente Home/BIA e os módulos novos do plano ainda não foram implementados.

## 30/10/2026 — Etapa 1: Home comercial, BIA e navegação

- Autorização: Fred solicitou executar somente a etapa 1 do roteiro. Os demais módulos continuam fora deste lote.
- Home: seis mensagens por necessidade, três CTAs no hero e no catálogo, contador visível e setas de 50px. A seleção inicial permanece na Dominar 250. A apresentação da BIA substitui a seção KMs, sem avatar ou vídeo novo; /#bia e o antigo /#vantagens têm destino válido. A avaliação genérica de moto usada foi retirada.
- Navegação: Comprar reúne financiamento, consórcio pelo fluxo existente e test ride; Pós-venda mantém o nome. Blog entrará junto da página funcional da etapa 5, sem link vazio nesta entrega.
- Fluxos reais no navegador: seis seleções do hero conferidas com nome, poster carregado, contador, produto, contato e URL de simulação correspondentes. NS400Z/Bauru e N150/Rio Preto produziram os números comerciais e mensagens corretos no modal, sem enviar mensagem. Pelo catálogo, NS200/Rio Preto chegou ao formulário com modelo/unidade preenchidos. A preferência da unidade acompanha a navegação.
- Teclado: Home, End e ArrowRight fizeram a seleção circular; Escape fechou o menu Comprar e devolveu o foco ao gatilho. Em quadro de 428px, arrasto real do mouse de 250px para a esquerda trocou D250 por D400; arrasto vertical preservou D400. Não houve ensaio em aparelho móvel físico.
- Responsividade: página real dentro de iframe com larguras de 375, 428, 1024, 1440 e 1920px; larguras úteis de 365, 418, 1014, 1430 e 1910px por causa da barra de rolagem. Sem overflow horizontal; os três CTAs, os blocos BIA e as ações do catálogo permaneceram dentro da largura útil. Inspeção visual do hero e BIA em desktop e dos arranjos em coluna de 375/428px. Página temporária de QA removida antes do pacote.
- Vídeos: vídeo local da D250 reproduziu (readyState 4, avanço observado até 18,12s) e ficou pausado ao sair do hero. Testes cobrem retorno à página/visibilidade, movimento reduzido, economia de dados, troca rápida, erro e rejeição atrasada de play. A rejeição de um pedido anterior não remove o vídeo novo em reprodução.
- Limite de verificação: na amostra YouTube N150, iframe e identificação estavam corretos, mudo e sem pausa solicitada, mas a mídia permaneceu em readyState 0 e currentTime 0. A reprodução contínua dos filmes YouTube não ficou confirmada neste navegador; o poster correspondente e os CTAs funcionaram. Não houve evidência suficiente para atribuir a causa à internet do cliente, ao site ou a bloqueio anti-bot.
- Build das 14 páginas; 64 testes Node aprovados (59 anteriores e cinco dos novos fluxos), checagem estática sem exceção de placeholders e git diff --check aprovados. Os testes do componente KMs preservado em arquivo são legado, não evidência de uma seção ainda presente na Home.
- Comparação com a base 01bc48e: data.json, corpos das seis páginas de produto, CSS/JS dos heroes de produto, componente 360° e manifesto permanecem byte a byte iguais. As páginas recebem somente o header compartilhado revisado. Não houve reimportação de mídia ou alteração de preços/fichas.
- A entrega usa a prévia existente do Sites. Netlify e o repositório externo não são atualizados por este lote. Captação persistente, painel, Blog, Seminovas e novas páginas de Consórcio/Pós-venda não são declarados concluídos.


## Etapa 2 — Base funcional e painel restrito — 30/10/2026

- 73 testes aprovados: os 64 existentes e 9 cenários administrativos com SQLite real em memória, R2 em memória e o mesmo handler do Worker.
- A suíte cobre identidade ausente e não cadastrada, editor, administrador, autorização independente de contatos, suspensão, proteção do responsável, CSRF, privacidade do rascunho e arquivos, publicação HTML, alteração privada de uma publicação, retirada, conflito de versão, restauração com preservação de contatos, três áreas separadas, upload de conteúdo incompatível, arquivo ausente e exportação.
- Checagem estática das 14 páginas e TypeScript sem erros. Build com bindings DB, BUCKET e ASSETS. Migração local inicial aplicada.
- Comparação SHA-256: 679 arquivos da publicação anterior preservados integralmente em public, sem arquivos faltantes ou diferenças de conteúdo. Inclui Home da etapa 1, seis heroes restaurados e giros aprovados.
- Navegador na prévia gerenciada: página de entrada e Home renderizadas no viewport disponível de 1363 × 936. Autenticação simulada é desativada nesse ambiente; os cenários autenticados foram exercitados no handler por testes, aguardando conferência na hospedagem. Não afirmar homologação móvel completa ou dos cinco viewports.
- Não houve atualização do Netlify ou repositório GitHub externo. Publicação pelo fluxo Sites no mesmo projeto/audiência, sem novo serviço pago contratado. Não existe campanha, estoque, artigo ou contato de teste na base hospedada.


## Login independente e Blog — 30/10/2026

- 82 testes aprovados: regressões e cenários de autenticação própria/Blog. Ativação de uso único, hash de senha, atributos de cookie, login sem identidade ChatGPT, rejeição da credencial anterior, limitação de tentativas, CSRF, saída, redefinição, revogação de sessões, permissões de editor e contatos, três artigos persistentes, não sobrescrita de edição, retirada de Home/Blog, vínculos, campanhas futuras/vencidas e renderização segura.
- Migração adicional somente de esquema, mantendo a primeira imutável. Carga editorial por rotina idempotente separada.
- Navegador: Home, Blog, artigo e login conferidos em iframes de 375, 428, 1024, 1440 e 1920 px; sem transbordamento horizontal. Home e Blog exibem três cards; artigo tem três ofertas relacionadas. Fotos carregadas sem falha.
- Composição da página do artigo: título e categorias, foto e texto, autor/data na lateral, motos citadas, banner, lojas, três ofertas; Leia também ao final. Identidade, header e rodapé Bajaj mantidos. Login possui arte decorativa editada com ImageGen a partir da imagem selecionada; artigos usam acervo aprovado.
- Não foi digitada uma senha de usuário no navegador da automação. Credenciais e permissões foram exercitadas em testes do handler com SQLite e R2 de homologação. Primeiro acesso de produção será definido pelo responsável por ativação privada.
- Manter noindex na prévia. A liberação da barreira ChatGPT atende ao pedido de login independente e não libera dados administrativos. Não atualizar Netlify/GitHub externos sem fluxo próprio.

- Checagem na hospedagem identificou entrega direta do HTML estático da Home antes do Worker. A seção foi ligada também a `/api/blog/latest` com renderizador compartilhado de cards; assim, os últimos posts são atualizados no navegador mesmo nesse caminho de entrega. Não há cópia fixa de artigo retirado como fallback. Os artigos individuais continuam entregues em HTML pelo servidor.

## Redesenho Conheça a BIA — 30/10/2026

- Aplicado o plano v1 aprovado: fundo gelo, composição de mídia à esquerda no desktop, textos em primeira pessoa e um CTA. No móvel a ordem é título, mídia e apresentação/botão. O material publicado é tipográfico, pois não há foto/avatar/vídeo aprovado da personagem.
- 87 testes Node aprovados: 82 regressões e cinco cenários do controlador de mídia (carga por clique, erro/repetição, pausa fora da área inclusive com play atrasado, imagem quebrada e YouTube criado somente ao interagir). Não houve nova importação de mídia.
- Navegador com a Home real em iframes de 375, 428, 1024, 1440 e 1920px (larguras úteis 365, 418, 1014, 1430 e 1910px): sem overflow horizontal, área de mídia 4:5 preservada e ordem correta dos três blocos. Inspeção visual da composição desktop e do texto/CTA móvel. Acessibilidade: Enter abre o seletor, Escape fecha e devolve o foco ao botão; destinos Rio Preto e Bauru conferidos sem enviar mensagens. Textos auxiliares da seção têm contraste mínimo calculado de 4,55:1.
- Comparação SHA-256 dos 689 arquivos públicos anteriores: somente index.html e o CSS legado da Home alterados; os outros 687 permanecem idênticos. O HTML da Home fora da BIA e das duas novas importações é idêntico, incluindo o formulário de financiamento. CSS do novo componente isolado.
- Limite: a BIA publicada não tem player nem solicita mídia externa. Comportamentos dos modos futuros são cobertos por testes, mas reprodução real, capa, legendas e enquadramento da personagem dependem de receber material aprovado. Não houve ensaio em aparelho móvel físico. Página temporária de QA removida antes do pacote final.


## Etapa 3 — Captação e acompanhamento — 30/10/2026

- 102 testes Node aprovados: 87 regressões e 15 cenários da captação. Incluem persistência sem WhatsApp, idempotência concorrente, falha de confirmação após gravar seguida de reenvio, validação/origem/honeypot, indisponibilidade de D1, rate limit, recibo secreto, permissões independentes, filtros/paginação, conflito de atualização, campanha futura/vencida/retirada, exemplar retirado, privacidade dos eventos e escape da apresentação. As combinações dos seis modelos, duas unidades e nove intenções são conferidas com dados comerciais do servidor.
- TypeScript, geração/checagem estática das 14 páginas e git diff --check aprovados. Migração local 0002 aplicada uma vez, após conferir o esquema. Migrações e snapshots anteriores preservados. Sem dados de exemplo em migração.
- Auditoria de HTML: 234 chamadas de atendimento nas 14 páginas. Nenhum link direto ao WhatsApp fora da contingência sem JavaScript, que informa que o site não registrará o contato. A API só libera o destino depois da confirmação de persistência.
- Navegador na prévia gerenciada: telefone inválido recebeu erro sem registro; test ride NS400Z/Bauru e simulação NS200/Rio Preto foram registrados sem abrir o WhatsApp. A simulação conservou entrada de R$ 8.000 e prazo de 36 meses. Consórcio/Rio Preto e peças NS400Z/Bauru foram registrados sem link de vendas presumido; a descrição de peças foi preservada. Quatro registros exclusivamente na base local, todos com handoff_attempted_at vazio. Não houve mensagem enviada ou contato de teste criado na base publicada.
- Ofertas/NS200 abriu a captação compartilhada. O seletor de unidade do cabeçalho permaneceu sem campos pessoais e não gravou contato. Enter/teclado, Escape e retorno do foco ao acionador conferidos; conclusão foca a confirmação, falha tem alerta acessível. Testes verificam que eventos não incluem nome, telefone, entrada, prazo ou descrição.
- Formulário real em iframes de 375, 428, 1024, 1440 e 1920px: sem overflow horizontal, inputs dentro da janela e rolagem interna em altura curta/móvel. No teste de 900px de altura, o formulário cabe no desktop e o móvel mantém o acesso ao botão por rolagem. Corrigidos o min-height herdado da caixa de confirmação e a criação de UUID na prévia HTTP.
- Lista e detalhe de Contatos conferidos visualmente em amostra local com os mesmos renderizadores e CSS do painel nas cinco larguras, sem overflow horizontal. Esta inspeção visual não usou uma sessão administrativa de produção. Consulta, permissão, paginação e mudanças de situação foram exercitadas pelo handler real em SQLite de testes. Não houve ensaio em aparelho móvel físico. Fixture removida antes do pacote.
- Comparação SHA-256: dos 691 arquivos públicos anteriores, 672 permanecem iguais. Alterados somente os HTML das 14 páginas e cinco módulos de interação; cinco módulos/estilos novos são específicos da captação e da fila. Apresentação BIA e heroes dos seis produtos byte a byte preservados. Preços, dados, fontes, fotos, vídeos e componente/arquivos 360° preservados.
- Limites: sem integração direta com CRM/Syonet e sem canal de consórcio/pós-venda inventado. Esses registros ficam disponíveis para acompanhamento autorizado. A operação deve definir responsável pela fila e política de retenção; não há exclusão automática sem essa definição. Arquivar não apaga dados. A atualização contempla o Sites, sem declarar Netlify/GitHub externos atualizados.


## Etapa 4 — Campanhas e seminovas — 30/10/2026

- 117 testes Node aprovados. Os testes anteriores foram adaptados à substituição da escada de catálogo por rotas dinâmicas; 16 cenários novos cobrem São Paulo/calendário, até três alternativas e IDs preservados, publicação incompleta, rascunho/preview privados, programação/expiração, pausa/retomada/encerramento, banner separado, mídia privada, estoque único, galeria, reserva/venda, tombstone, reativação restrita, restauração sem reviver estoque, filtros/ordenação/paginação, escape e atualização do Blog.
- Captação conferida com o handler real, SQLite e objetos em memória. Condição escolhida, preço/código e unidade vêm da publicação. Rejeita versão pública antiga, opção/unidade incompatível, estoque indisponível e mudança entre resolução e gravação. INSERT condicional confere a publicação exata e a validade no instante da execução SQL. Reenvio de um contato já confirmado continua idempotente mesmo após mudança do anúncio. Rascunho privado não invalida a versão comercial que ainda está publicada.
- Controlador de atualização testado para respostas fora de ordem, falha, suspensão e validade consumida em trânsito. O relógio civil do navegador não decide promoção; tempo monotônico só desconta a duração da consulta. Em erro, condições não confirmadas são ocultadas. HTML, fragmentos e mídia de campanhas não usam cache público. Conteúdo idêntico não recria a galeria nem troca a escolha do cliente.
- Migração 0003 de esquema gerada e aplicada localmente após inspeção. Só acrescenta commerce_page e código de estoque único/nullable. SQL, snapshots e journal das migrações 0000–0002 preservados. Sem campanhas, seminovas, fotos fictícias ou usuários de teste em migração.
- TypeScript sem erros; 13 páginas estáticas passaram por arquivos, âncoras, imagens, SEO e destinos. Ofertas e Blog são rotas dinâmicas verificadas pelos handlers. Build Vinext com os mesmos bindings DB/BUCKET/ASSETS. Arquivo estático public/ofertas/index.html removido para impedir que a hospedagem desvie a listagem do servidor.
- Navegador na prévia gerenciada: campanhas, detalhes de campanha e detalhes de seminova em iframes de 360, 390, 768, 1366 e 1920 px, sem overflow horizontal nas 15 combinações. Larguras úteis descontam a barra de rolagem. Layout em uma coluna no móvel e duas no desktop para detalhes; foto inteira preservada. Galeria, seleção de foto, ampliação, seleção da alternativa C e abertura da captação conferidas. Ajustado alinhamento dos filtros e preservação da foto nas consultas de disponibilidade sem mudança do anúncio.
- Uma solicitação fictícia de campanha foi registrada somente no D1 local, identificando Dominar 250, alternativa 3, preço de R$ 24.000 e Bauru. A mensagem pronta continha a condição correta; não houve abertura do WhatsApp ou envio de mensagem. Esses valores existem só no teste local e não são dados comerciais publicados.
- O editor completo foi inspecionado com o admin.mjs, renderizadores e CSS reais em fixture local, com API simulada no navegador e sem gravação em servidor. Salvamento, seleção de imagens, banner desktop/mobile e reordenação da galeria conferidos; mudar fotos/ordem desmarca a confirmação de revisão. Editor de estoque nas cinco larguras sem overflow, somando cinco combinações às 15 públicas. A inspeção do painel não usou sessão/credenciais de produção; autenticação, permissões e mutações persistentes foram verificadas pelos testes do handler.
- Comparação SHA-256 dos 696 arquivos públicos anteriores: 691 preservados, quatro alterados (admin.mjs, contact-admin.mjs, contact-capture.mjs e rótulo de navegação em a-interiorsp/index.html) e um removido (Ofertas estática). Home, Conheça a BIA, seis produtos, preços, fichas, fontes, fotos, vídeos e 360° mantêm os mesmos bytes. Novos módulos/CSS são específicos do comércio e da atualização dos vínculos comerciais do Blog.
- Fixtures, SQL de seed, estado local, credenciais de homologação e arquivos temporários ficam fora do pacote. A publicação não contém anúncios fictícios. Falta receber uma campanha real e uma seminova real para homologar arte, enquadramento das fotos e operação comercial com a equipe. Não houve teste em aparelho físico, remoção automática de placas/EXIF, documento pessoal, sincronização com banners da Home ou atualização de Netlify/GitHub externos.


## Catálogo 0 km restaurado e seis seminovas fictícias — 30/10/2026

- Solicitação explícita posterior à etapa 4: restaurar o catálogo anterior na aba 0 km e cadastrar seis seminovas fictícias completas. O catálogo mantém os seis preços aprovados, filtros por linha/investimento, escada, ordenação, links de produto e captação compartilhada. Campanhas permanecem separadas abaixo; a atualização de validade não reinicializa os filtros do catálogo.
- Seis registros persistentes, um por modelo, com código único DEMO, ano de fabricação/modelo, km, cor, preço de exemplo, unidade, descrição e quatro imagens oficiais ilustrativas por cadastro. Cópias integrais das 24 imagens no R2 e metadados/revisões em D1; sem imagens geradas ou novas condições reais. Carga autorizada fora das migrações, idempotente, sem sobrescrever edições/retiradas nem criar usuário/senha. Migrações existentes intactas.
- Marcador is_demo preservado no servidor. Cards, detalhes e painel identificam os exemplos; preço tem rótulo de valor fictício. A página não emite schema de oferta real e o contato não leva ID/preço do exemplar fictício. A API também bloqueia tentativa de compra por esse ID. Para estoque real, criar cadastro separado com dados/fotos reais.
- 121 testes Node aprovados, incluindo os quatro cenários novos: catálogo original e preços/ações, carga completa/persistência/retirada sem recriação, demonstração sem oferta real/captação de compra e recuperação de imagem indisponível sem publicação incompleta. O mock de ASSETS exige a origem do próprio Site, cobrindo o ajuste observado na prévia. TypeScript e checagem estática completam a validação antes da publicação.
- Navegador: catálogo 0 km, lista de seminovas e detalhe em 375, 428, 1024, 1440 e 1920 px, sem overflow nas 15 combinações. Seis fotos principais carregadas. Filtro Linha NS, preço descendente, limite mínimo sem resultados e reset para todos conferidos. Contato do catálogo abriu com Dominar 250 e escolha de unidade; nenhum formulário foi enviado.
- Galeria do exemplo NS160 percorreu quatro fotos e, na ampliação, próxima após foto 4 voltou à foto 1. Contato de estoque real abriu com o modelo, sem código ou valor fictício. Detalhe D400 inspecionado visualmente no móvel, com aviso, imagem inteira, quatro miniaturas, ficha e valor identificado. Não houve ensaio em aparelho físico ou sessão administrativa de produção; persistência/permissões/edição são cobertas pelos handlers de teste.
- O clone exigiu restauração do perfil de execução local antes de retomar a prévia. A leitura das imagens passou a usar a URL da própria requisição ao binding ASSETS, conferida no navegador. Harness temporário removido antes do pacote. Home, BIA, seis produtos e seus recursos/mídias permanecem fora desta alteração. A entrega usa o Sites existente, sem alterar audiência ou publicar no Netlify/GitHub externos.

## 30/10/2026 — Etapa 6: Consórcio e Pós-venda

- Escopo recuperado do Roteiro de implementação de 30/10/2026: Consórcio próprio e ampliação de Pós-venda, preservando a decisão de não inventar condições nem canais. Não se confunde com os giros 360° já aprovados.
- Criadas quatro páginas e reconstruída a central: Consórcio, Garantia, Manuais e Revisões. Menu Comprar/Pós-venda, rodapé, sitemap e rotas do Worker atualizados, com noindex/nofollow e domínio/canonical existentes preservados.
- Curadoria manual das fontes oficiais Bajaj e Âncora. O catálogo oficial vincula oito PDFs a 23 pares de modelo/ano. Downloads completos dos oito arquivos verificados (assinatura PDF, leitura, páginas e SHA-256); capas renderizadas e inspecionadas, inclusive o manual próprio da nova D250 2026/2027. Documentos permanecem nos links oficiais, sem copiar PDFs para a publicação nem introduzir importação automática.
- Garantia contém apresentação e link aos termos oficiais, sem substituir o contrato do exemplar. Revisões mostram condições sob consulta: a página nacional informa vigência encerrada em 30/09/2026 e nenhum desses valores foi publicado como atual. Consórcio não contém taxas, parcelas, prazos de contemplação ou aprovação inventados.
- Captação preserva modelo, ano, km, data aplicável, unidade e origem. Cinco testes novos verificam correspondência exata de manuais, contexto dos formulários, gravação/idempotência, restrição de acesso e rejeição de campos inválidos. Os canais pendentes continuam sem WhatsApp direto; nenhuma chamada real foi enviada no navegador.
- Navegador gerenciado: Consórcio D250/Bauru; filtros D250 2026/2027 e combinação ausente NS160 2026/2027; ajuda de manual com ano/km; revisão D400/Rio Preto com 0 km e data; abertura da captação com contexto correto. Não foi preenchido nome/telefone nem confirmado contato no site publicado. Gravação de ponta a ponta validada somente no banco isolado de testes.
- Medição responsiva em iframe de mesma origem: cinco páginas × 375, 428, 1024, 1440 e 1920 px, 25 combinações após carregamento dos estilos, sem overflow horizontal ou controles/textos fora da largura. Menu móvel de Pós-venda e seus destinos conferidos a 375 px. Não houve teste em dispositivo físico. Página temporária de QA retirada antes do pacote final.
- Suíte Node: 126 testes aprovados. Checagem estática das 17 páginas, TypeScript e build gerenciado aprovados. Comparação do conteúdo principal confirma alteração apenas em Pós-venda e Privacidade entre as páginas antigas; outras páginas receberam somente navegação/rodapé compartilhados.
- Pendências operacionais reais: condições de Consórcio aprovadas; preços de revisão vigentes e condições locais; canais específicos e responsável da fila por unidade; responsável por manter documentos e valores. A implementação não declara essas dependências resolvidas nem integração CRM/Syonet ativa. Publicação somente no Sites; Netlify/GitHub externos não atualizados.

## 30/10/2026 — Ilustração das páginas da etapa 6

Solicitação de Fred: aplicar as imagens correspondentes das referências oficiais de Garantia, Manuais e Serviços. Cinco páginas receberam banners oficiais; Garantia ganhou imagem de diagnóstico, a central de Pós-venda ganhou cartões e fotografia de Serviços e os oito manuais receberam suas capas reais. A imagem oficial de Consórcio veio da própria seção de Consórcio da fabricante. Fotos e composições mobile conferidas visualmente antes da aplicação; procedência, originais e variantes documentados em `owner-media.json` e `ASSETS.md`.

Todas as imagens servidas localmente, com dimensões, alt e srcset; hero prioritário e imagens internas com carregamento sob demanda. As composições oficiais de celular são selecionadas por picture. Nenhuma moto, pessoa ou capa foi reconstruída ou recortada; texto permanece em HTML e as imagens conservam sua proporção. Conteúdo comercial, PDFs, filtros, URLs, formulário e encaminhamento não foram alterados.

Browser gerenciado: Garantia conferida em desktop e 375 px; Manuais em desktop, com filtro D250 2026/2027 confirmando capa, ano e URL do documento correto. Medição em iframe de mesma origem: cinco páginas × 375/428/1024/1440/1920 px, 25 combinações sem overflow horizontal nem textos/controles fora da largura. Não houve teste em aparelho físico nem envio de contato. Página temporária de QA excluída antes do pacote.

## Ajuste solicitado — padrão dos heroes internos

- Removidos os heroes fotográficos das cinco páginas da etapa 6. Todos usam o mesmo `service-hero` das demais internas, sem img/picture ou estilos exclusivos para imagem no hero.
- Imagens oficiais aplicadas nos blocos de conteúdo: Consórcio na introdução, Manuais na apresentação da biblioteca e Revisões junto às orientações e condições. Fotos de diagnóstico/Serviços, cartões da central e capas dos PDFs mantidos.
- Verificação estrutural dos cinco heroes: navegação, título e descrição presentes; nenhuma foto no hero. Os dez testes relevantes de páginas e serviços passaram; checagem estática das 17 páginas, TypeScript e whitespace aprovados. Nenhum teste novo para a alteração visual.
- Browser gerenciado: Manuais em desktop, Consórcio em 375 px; cinco páginas × 375/428/1024/1440/1920 px medidas em iframe de mesma origem, 25 combinações sem overflow horizontal nem textos/controles fora da largura. Não houve teste em aparelho físico ou envio de contato. Página temporária de QA excluída antes do pacote final.


## 31/10/2026 — Vídeo comercial na seção Conheça a BIA

- Vídeo fornecido pelo cliente integrado à configuração existente; poster extraído do próprio MP4. Autoplay silencioso ao entrar na tela, inclusive por atalhos e acesso direto às âncoras. Fonte adiada até a visibilidade; sem atributo autoplay que antecipe reprodução fora da seção.
- Controles nativos e botão Ativar som/Silenciar, com estado acessível sincronizado com volume e mute. Ativar som após o fim repete a apresentação com áudio. Pausa fora da tela e em aba oculta; retorno retoma ou reinicia após o fim, sem loop contínuo. Pausa manual respeitada na visita atual. Movimento reduzido, economia de dados e bloqueio do navegador oferecem reprodução por clique.
- QA real na prévia gerenciada identificou que o carregador genérico de app.mjs voltava a chamar load() no evento play, interrompendo a BIA. Exclusão pontual de data-bia-video corrigiu o conflito sem alterar os demais players.
- Navegador Chrome: acesso direto a /#bia e clique em Conheça a BIA iniciaram com paused=false e muted=true; rolagem normal iniciou e avançou a 8,17 s; sair da seção pausou a 3,88 s, antes do fim. Ativação do áudio alterou muted para false. Não foram enviados contatos.
- Layout medido em iframe de mesma origem com larguras 375, 428, 1024 e 1920 px: sem overflow horizontal nem textos, botões ou player fora da largura; enquadramento 16:9 preservado e controle de som com 44 px. Conferência visual em desktop e celular. Harness temporário removido. Sem teste em dispositivo físico ou Safari/iOS.
- 26 testes Node dos componentes de mídia e jornadas comerciais aprovados, incluindo sete cenários novos de autoplay/visibilidade/retorno/pausa manual/bloqueio/preferências/áudio. Checagem estática das 17 páginas, TypeScript, sintaxe dos módulos e git diff --check aprovados. MP4 faststart conferido. Build e pacote seguem o helper Sites do projeto existente.


## 31/10/2026 — Rotação automática dos banners publicitários

- Galeria Universo Bajaj da Home passa a avançar a cada 5 segundos, com retorno ao primeiro banner depois do último. Setas anterior/próxima, teclado, swipe, imagens e ordem preservados. A troca espera a imagem decodificar e reinicia o intervalo após navegação manual.
- Controle de pausar/retomar no padrão visual das setas. Temporizador suspenso quando a galeria está fora da tela, a aba está oculta, há hover do mouse, foco nos controles ou gesto de toque em andamento. Movimento reduzido começa com rotação pausada; a pessoa pode retomá-la pelo controle. Contador anuncia apenas trocas manuais.
- Prévia gerenciada em Chrome: avanço automático observado de 01/05 para 03/05 sem clicar nas setas. Com a rotação pausada, próxima avançou 04→05 e anterior retornou 05→04; controle passou a Retomar troca automática dos banners. Layout desktop e preservação dos anúncios conferidos visualmente. Sem teste em aparelho físico e sem envio de contatos.
- Sete testes existentes de mídia/jornadas comerciais passaram; checagem estática das 17 páginas, sintaxe do módulo e git diff --check aprovados. Nenhum teste novo para a mudança de interação reversível. Apenas a galeria publicitária foi alterada; vídeo da BIA e demais carrosséis continuam com seus próprios controladores.


## 03/11/2026 — Revisão dos heroes das motos

- Quatro heroes estavam com heroYoutube nulo. Foram vinculados filmes oficiais do modelo/família correspondentes, com autor/título confirmados pelo oEmbed e fontes registradas. Os vídeos de D250 e D400 foram preservados. Retirada a exclusão por largura móvel; continuam visibilidade, aba ativa, pausa manual, movimento reduzido e economia de dados.
- Hero compartilhado compactado, sem o bloco extra de reflexão. As seis fotos agora ficam em quadro 8:5 com limites ópticos normalizados; pose frontal em três quartos, frente à direita, referência D250 preservada. Preço e ações passam a compartilhar a faixa inferior no desktop; no celular, especificações ocupam duas linhas e ações continuam acessíveis.
- Navegador gerenciado: seis modelos × 428×926, 1024×1366 e 1920×1080, 18 combinações. Todos apresentaram a mesma altura e posição do quadro em cada categoria, vídeo com display block e opacidade 0,30, sem overflow horizontal nem textos/controles fora da largura. Alturas dos heroes: aproximadamente 908 px no celular, 948 px no tablet e 917 px no desktop. NS400Z também conferida em 375×812, com hero de 885 px e sem overflow. A referência D250 a 1363 px passou de 1655 para 912 px, redução de aproximadamente 45%.
- Confirmada a criação dos seis players no celular e seus seis IDs corretos. Os streams do YouTube permaneceram com readyState=0 e tempo 0 nesta sessão, inclusive no D250 anteriormente publicado; a reprodução real não é certificada neste ambiente. Metadados e players são válidos, com movimento automático solicitado sem áudio. Sem teste em dispositivo físico ou Safari/iOS.
- Vinte testes existentes de produtos, formulários, vídeo e auditoria de mídia aprovados; a contagem passou de 16 para 20 contextos distintos devido aos quatro fundos novos. Checagem estática das 17 páginas, sintaxe e git diff --check aprovados. Nenhum teste novo para ajustes visuais reversíveis. Comparação byte a byte confirmou preservação integral do conteúdo após o hero e antes da configuração de runtime nas seis páginas. Harness responsivo temporário retirado da origem e do pacote final, com verificação explícita após o build.

A conferência da publicação identificou textos do player visíveis antes do início do stream. O cenário alternativo voltou a cobrir a interface durante o carregamento, sendo ocultado apenas no evento playing; a camada do vídeo permanece com opacidade 0,30 quando reproduz.


## 03/11/2026 — Ajuste pontual de opacidade e tamanho

- Somente três declarações no CSS dos heroes alteradas: opacidade compartilhada de 0,30 para 0,25; largura máxima da foto de 640 para 800 px (25% maior em desktop/tablet); no celular, quadro ampliado até a largura útil da tela, mantendo a proporção, o ângulo e o alinhamento anteriores. Textos, fontes, espaçamentos verticais, vídeos, fotos e demais componentes não foram modificados.
- Conferência no navegador em larguras de iframe 375, 428, 1024 e 1920 px: opacidade computada 0,25, quadro de 800×500 em tablet/desktop e largura útil inteira no celular; sem overflow horizontal. Comparação da origem confirmou apenas os três ajustes de estilo no produto. Nenhum teste novo para a alteração visual reversível. Harness temporário removido e exclusão conferida antes do pacote.

## Ajustes aprovados em 09/11/2026 — execução 10/11

- Home inicia em Pulsar N150, com setas ao lado do nome e contexto consistente em miniaturas/contador/CTAs. Textos editoriais aprovados preservados. YouTube solicita autoplay silenciado; comando manual e filme oficial ficam disponíveis como fallback. O navegador de nuvem retornou vídeo YouTube sem dados de reprodução (readyState 0); MP4 da D250 reproduziu. No Chrome conectado do usuário, com viewport 390×844, a N150 reproduziu automaticamente (is-playing) e não houve overflow. Safari em iPhone físico não está disponível neste ambiente.
- N150 e D250 vermelhas e D400 vermelha/verde/azul/branca usam seis fotografias oficiais brasileiras 2026/27, sem recoloração. Sequências oficiais não variam pela cor; as novas seleções identificam foto estática e indisponibilidade do giro.
- Rain/Road/Off-Road nas NS160/NS200 e D250; quatro modos em NS400Z/D400. Fontes por versão em riding-modes-sources.json. Manual da nova D400 separado dos anos anteriores.
- Sete tabelas/49 linhas de revisão, somas em centavos conferidas, validade 31/12/2026. D400 três velas e NS400Z sinalizam divergência 1/3 meses na primeira revisão; não se presume um prazo.
- Atualização autenticada diária Netlify às 10:00 UTC/7h São Paulo. Fonte descoberta por rótulo modelo/versão, PDFs capturados e identificados por SHA256, armazenamento R2, versões e histórico. Publicação automática apenas para texto completo reconhecido, somas/prazos/vigência consistentes. PDFs escaneados alterados ou ambíguos exigem revisão; versão anterior mantida somente enquanto vigente. Aprovação requer administrador, sessão, origem correta e conferência documentada.
- Rio Preto pós-venda tel:+551730420708; telefones das lojas separados da BIA. Bauru segue acompanhamento no CMS até definição do canal específico. Registro de solicitação não confirma agendamento.
- Foto de Bauru enviada pelo cliente preservada em 515×510, nas unidades e galeria da Home.
- Campanhas precedem catálogo no HTML entregue pelo servidor. Regras de vigência, filtros, detalhes e aba Seminovas preservadas.
- 153 testes automatizados passaram; build Vinext/Worker concluído. Nenhuma alteração de domínios ou privacidade (itens 7/8 adiados).

Na conferência publicada foi removida a consulta redundante imediata de Ofertas: o HTML validado no servidor permanece visível até a primeira expiração. A contagem desconta o tempo total da navegação e as regras de ocultação por expiração/suspensão continuam ativas.

## Fechamento de implantação — 10/11/2026

- 155 testes aprovados, incluindo duas regressões de abertura das campanhas: HTML confirmado permanece visível pelo prazo restante; HTML vencido ou sem validade exige nova confirmação.
- Gerador Python, verificação estática das 17 páginas, TypeScript e build Vinext/Worker aprovados.
- Removida uma cópia temporária de imagem sem referências no site; os arquivos de trabalho de imagem foram incluídos nas exclusões de controle de versão.
