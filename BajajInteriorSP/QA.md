# Verificação da prévia

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
