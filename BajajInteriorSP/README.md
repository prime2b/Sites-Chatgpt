# Bajaj InteriorSP

## Central online de documentação e treinamento — 03/11/2026

Disponível pelo painel em `/admin/ajuda/` e `/admin/treinamento/`, com login próprio existente, busca, documentação operacional, 12 aulas, 32 perguntas, progresso por pessoa/versão, correção no servidor e apresentação no navegador. O espaço do multiplicador tem roteiro, gabaritos e observações de prática. Permissões de acompanhamento e manutenção da central são independentes de Contatos. A referência técnica permanece administrativa.

`lib/academy-domain.mjs`, `academy-server.mjs`, `academy-seed.mjs` e `academy-view.mjs` mantêm os contratos, proteção, carga inicial e telas. `public/academy*.mjs`/`academy.css` implementam a experiência. O formulário do Blog foi extraído para `public/blog-admin-form.mjs`, preservando os campos reais e permitindo seu uso no simulador; o formulário comercial já é compartilhado. Exercícios operam em memória sem APIs comerciais de escrita. Progresso e avaliações usam as novas tabelas `academy_*` no D1. Ver detalhes em `ADMIN.md`.
Site com Home, seis páginas de modelos, Ofertas 0 km/Seminovas, Blog, Consórcio, Pós-venda e páginas institucionais. A prévia existente do Sites mantém acesso público e administração protegida por usuário e senha; o domínio final não foi alterado nesta etapa. São 17 páginas estáticas e rotas comerciais/editoriais servidas pelo Worker.

## Atualização pela Prime2B
- `data.json`: preços, nomes, fichas técnicas e unidades. Os seis preços do briefing são a fonte comercial única.
- `model-settings.json`: textos, imagens, destaques, modos e vídeos dos cinco modelos expandidos. D400 preserva `d400-settings.json` e `d400-assets.json`.
- `product_page.py`: padrão reutilizável dos seis produtos, com galerias, recursos, ficha em abas e solicitação de simulação.
- `support_pages.py`: páginas comerciais e institucionais; `lib/cms-server.mjs` e `public/admin.mjs`: painel administrativo e publicação persistente.
- `lib/commerce-*.mjs`, `public/commerce*.mjs` e `public/commerce*.css`: campanhas e estoque persistentes, listagens, detalhes, validade, disponibilidade, banner e editores específicos. `public/ofertas/index.html` não é gerado: a rota precisa passar pelo servidor. `offers_page.py` gera o fragmento do catálogo original, ativo somente na aba 0 km com `offers.mjs`/`offers.css`.
- `build.py`: `python build.py` gera HTML, JSON e sitemap em `public/`; o helper Sites compila o servidor e os ativos em `dist/`. Python padrão; otimização de novos ativos exige Pillow.
- `model-assets.json`: dimensões e variantes de fotos. `source-model-photos.json` registra os arquivos do Drive fornecido. `source-model-specs.json` preserva as fichas recebidas, sem publicar links internos dos documentos.
- `scripts/prepare_model_assets.py CAMINHO_DOS_ORIGINAIS`: otimiza as fotos sem corte ou reconstrução. Variantes800/1600/2400 no maior lado, sem ampliar. Fotos integrais em contain; hero reutiliza ativo completo existente.

## Verificação e publicação
`python tests/static_check.py` e `node --test tests/*.test.mjs`. Scripts públicos em `public/` são módulos nativos; o servidor administrativo usa o runtime Vinext. Publicar pelo fluxo Sites preservando `.openai/hosting.json` e o acesso atual. `QA.md` registra verificações e limites de navegador.

## Fluxos comerciais
A unidade é salva somente neste navegador em `interiorsp.unit.v1` e pode ser alterada pelo topo ou formulários. WhatsApp por unidade, com modelo, preço e intenção contextualizados. Simulação solicita entrada e prazo, sem taxas, parcelas calculadas ou aprovação. Test ride e pós-venda preparam mensagens, com data de preferência opcional para test ride. Sem CPF, documentos, CRM, bancos ou nova IA. A BIA existente continua o atendimento; abrir WhatsApp não confirma envio ou agendamento.

Sem identificadores externos de mensuração ativados. Eventos locais não incluem valores de entrada, prazos, datas ou descrição livre. Preview noindex/nofollow e robots disallow; liberar indexação somente na publicação final autorizada. A apresentação da BIA substitui a antiga seção de KMs, com acesso em /#bia; /#vantagens continua válido. Não há mais os quatro links provisórios da jornada na Home.

## Auditoria de mídias
`MEDIA-AUDIT.md` registra a revisão completa de 23/10/2026. `media-photo-sources.json` guarda a origem de cada posição revisada, e `media-video-sources.json` guarda a conferência dos filmes oficiais. `home-closing-media.json` centraliza o filme institucional e o poster da CTA final. O novo player de fundo respeita visibilidade, movimento reduzido e economia de dados. `scripts/prepare_media_refresh.py` recebe os planos revisados de produtos, posters da Home e poster de fechamento, nesta ordem, para otimizar os originais sem corte.


## Hospedagem externa

O projeto Netlify existente está identificado em `netlify-project.json`. `python3 build.py` gera os arquivos de `public/`; `netlify/edge-functions/bajaj-backend.js` encaminha apenas as rotas dinâmicas ao backend Sites existente. Blog, Ofertas, Seminovas, contatos, painel e central online compartilham o mesmo D1/R2 e os mesmos usuários. Não há cópia de dados nem sincronização entre bancos.

`BAJAJ_NETLIFY_GATEWAY_SECRET` deve ter o mesmo valor secreto nos dois provedores, no escopo Functions do Netlify e nos contextos de publicação usados. `lib/netlify-gateway.mjs` assina domínio público, método, rota/consulta, horário e IP da borda; o backend valida a assinatura e mantém as verificações próprias de origem, sessão e permissões. Somente o cookie da sessão do CMS atravessa o gateway. Requisições, respostas e uploads usam streams; a falha da conexão é exibida como erro, sem confirmar gravação.

Publicação manual no projeto existente: gerar `public/`, executar `netlify deploy --site 337fc8fa-6dcf-4c41-af1e-49721fde8257 --dir public --no-build` para conferir uma prévia e repetir com `--prod` após a validação. O pacote precisa conter a Edge Function, além dos arquivos estáticos; upload estático isolado não atende às rotas dinâmicas. O repositório GitHub externo não é sincronizado automaticamente. Domínios personalizados precisam ser incluídos explicitamente na validação de origem antes de serem usados.

## Visualizador 360° oficial — 30/10/2026

As seis páginas de motos incluem o giro fotográfico com ativos oficiais importados manualmente, servidos em `/assets/spin/`. São 16 combinações de modelo/cor e 255 quadros (17,38 MB no conjunto); o navegador carrega a sequência escolhida somente ao interagir. `product-360.json` contém os arquivos publicados, `official-360-sources.json` guarda procedência e hashes, `spin_viewer.py` gera a seção e `dist/product-spin.mjs` controla arrasto, teclado, cores e recuperação de erro.

`python scripts/import_official_360.py` refaz a importação com Pillow. Não roda em build nem como sincronização automática. Revisar manualmente a fonte e a compatibilidade com o catálogo brasileiro antes de reimportar. A N125 é apenas a referência enviada, sem nova página/modelo. NS160/NS200 usam a variante DC USD. D250 usa Sparkling Black; D400 usa Charcoal Black, sem renomear Aurora Green para Savanna Green. N150 Racing Red e D250 Racing Red ficam sem giro até existir sequência correspondente revisada.

Recursos passam a anteceder o 360° e a galeria. Preços, fichas, atendimento e catálogo continuam em sua fonte existente. Esta frente não implementa captação persistente, painel, campanhas mensais, seminovas, Blog ou as demais mudanças do plano aprovado.

## Etapa 1 — Home comercial, BIA e navegação — 30/10/2026

`home-commercial.json` concentra a redação comercial da Home; `home_commercial.py` gera o hero e a apresentação da BIA, sem alterar os dados comerciais dos produtos. A apresentação da assistente usa sua configuração própria em `bia-presentation.json`. Hero e catálogo oferecem conhecer a moto, simular e conversar com a BIA com o modelo correspondente. `dist/commercial-context.mjs` valida modelo/unidade nos links e no preenchimento da simulação; a unidade explícita válida no link tem precedência sobre a preferência local. Somente identificadores de modelo/unidade entram nessa URL.

O menu Comprar reúne financiamento, consórcio pelo atendimento existente e test ride. Pós-venda mantém sua nomenclatura. O Blog será incluído na navegação junto da página funcional da etapa 5; não há link temporário sem destino. A chamada de avaliação de usada foi retirada. Os CTAs continuam no fluxo existente de WhatsApp; captação persistente e painel ficam para as etapas correspondentes.

O hero da Home mantém seus filmes, posters e seleção inicial da Dominar 250, com mensagens por necessidade, contador e setas mais evidentes. Promessas atrasadas de reprodução não podem ocultar o vídeo do modelo selecionado depois. Visibilidade, retorno à página, movimento reduzido e economia de dados controlam o movimento. O corpo das seis páginas de motos, seus heroes restaurados e os giros 360° aprovados permanecem iguais à base anterior.

## Etapa 2 — Administração persistente — 30/10/2026

Acesso em `/admin/`, com usuário e senha próprios, ativação privada do responsável e acessos individuais para a equipe. Permissões de contatos são independentes. D1 guarda conteúdos, revisões, membros, histórico e a estrutura de contatos; R2 guarda originais protegidos. Rascunho, prévia privada, publicação síncrona, retirada e restauração de versões funcionam sem deploy manual. Arquivos só são entregues ao público quando ligados a uma publicação. As 14 páginas e os 679 arquivos anteriores mantêm os mesmos bytes.

Veja `ADMIN.md` para operação, recuperação, limites e manutenção. A coleta de contatos permanece desligada até a etapa 3. Campos e regras comerciais de Ofertas/Seminovas são etapa 4; o editor completo e relações do Blog são etapa 5. Nenhuma condição comercial fictícia foi publicada.

## Blog e autenticação independente — 30/10/2026

O login não usa contas ou assinaturas do ChatGPT. `lib/cms-auth.mjs` mantém hashes PBKDF2 com salt individual e segredo do servidor, sessões HttpOnly e tokens de ativação/redefinição de uso único. O responsável define o primeiro usuário/senha por um link privado; não há senha padrão ou cadastro público. `CMS_AUTH_PEPPER`, `CMS_OWNER_SETUP_HASH` e `CMS_OWNER_SETUP_EXPIRES` ficam somente no ambiente do servidor, junto de `CMS_OWNER_EMAIL`. Não registrar tokens, cookies ou senhas em logs.

Blog em `/blog/` e `/blog/<slug>/`. `lib/blog-server.mjs` faz leitura persistente e a carga editorial inicial idempotente dos três artigos autorizados, fora de migrações e sem sobrescrever alterações. A Home recebe os três posts publicados mais recentes no servidor, sem deploy editorial. O painel permite vincular modelos citados, um banner e três ofertas relacionadas, escolher a capa, autor/categoria e formatar subtítulos/listas/negrito. Campanhas futuras, vencidas ou retiradas são filtradas no servidor; vínculos de catálogo usam o preço central aprovado.

A página de leitura preserva o header/rodapé do site, com composição principal/lateral inspirada na referência fornecida e adaptação ao design Bajaj. Não copia o texto editorial da Carrera nem suas condições promocionais. As fotos dos artigos e miniaturas vêm do acervo aprovado. Somente o fundo decorativo do login foi editado por imagem a partir da referência selecionada.

Migração adicional: `drizzle/0001_optimal_mysterio.sql`, apenas esquema. A abertura do site sem a barreira ChatGPT atende ao pedido de acesso independente; APIs, rascunhos, mídia privada e contatos continuam protegidos por sessão/permissão no servidor. A prévia permanece noindex. Netlify e GitHub externos não são atualizados automaticamente por esse fluxo.

A Home usa também `public/home-blog.mjs` e `/api/blog/latest` quando o provedor entrega o HTML estático diretamente. O renderizador seguro de cards em `lib/blog-card.mjs` é compartilhado com o servidor e copiado pelo build. A listagem e os artigos do Blog mantêm renderização em HTML; a atualização dos cards da Home depende de JavaScript, com link de acesso ao Blog como alternativa.

## Redesenho Conheça a BIA — 30/10/2026

Seção clara com mídia à esquerda e apresentação em primeira pessoa à direita; no celular, título, mídia e texto/botão seguem essa ordem. `bia-presentation.json` centraliza textos e mídia; `public/bia-presentation.css` e `public/bia-media.mjs` ficam restritos ao componente. Os destinos `/#bia` e `/#vantagens` e o seletor de atendimento das duas unidades continuam válidos.

O modo publicado é `media.mode: "video"`, com o MP4 fornecido pelo cliente em 31/10/2026, poster extraído do próprio filme e dimensões reais de 1920 × 1080. O quadro horizontal é preservado integralmente. Os modos `brand`, `image` e `youtube` permanecem disponíveis; legendas VTT podem ser vinculadas em `captions` quando fornecidas. A configuração é feita no código, seguida de build/publicação; não foi acrescentado editor de mídia da BIA ao painel.

`media.autoplay: true` inicia o vídeo nativo sem som quando ao menos 45% do player entra na área útil da tela, tanto por rolagem como pelos atalhos e acesso direto a `/#bia` ou `/#vantagens`. A fonte só é carregada nesse momento. O botão Ativar som e os controles nativos permitem áudio, pausa e nova reprodução. Sair da tela ou ocultar a aba pausa o vídeo; uma pausa manual é respeitada durante a visita atual e o fim não gera loop. Ao voltar à seção, o vídeo retoma ou reinicia se já terminou. Movimento reduzido, economia de dados e bloqueio de autoplay mantêm a opção de assistir por clique. Imagem de capa e composição tipográfica oferecem alternativa em falha. O carregador genérico de vídeos em `public/app.mjs` exclui a BIA para evitar uma segunda chamada a `load()` durante `play()`.


## Etapa 3 — Captação e acompanhamento — 30/10/2026

Nome e WhatsApp são solicitados somente ao pedir atendimento. Os CTAs e formulários das 14 páginas compartilham `public/contact-capture.mjs`; `contact_components.py` gera a interface e o aviso de privacidade. A API `/api/contact` valida, normaliza e salva em D1 antes de liberar o link do WhatsApp. Não há coleta ao digitar, armazenamento local de dados pessoais, e-mail ou CPF. Modelo, unidade, intenção, página, campanha/exemplar e dados de simulação/serviço são preservados. Preços e canais são resolvidos no servidor.

Reenvios técnicos mantêm uma chave aleatória por tentativa, conferida com assinatura dos dados; o índice único impede duplicação concorrente. Falhas não anunciam sucesso nem abrem o canal. Nome, telefone e detalhes não entram nos eventos; clique, formulário, registro e tentativa de encaminhamento são eventos distintos. A tentativa de abrir o WhatsApp não confirma mensagem/conversa/venda.

O painel protegido oferece filtros, paginação, detalhe e status manual, com permissão independente para Contatos e conferência de versão ao atualizar. `drizzle/0002_tan_black_tom.sql` só acrescenta colunas/índices. Recibos e chaves não são expostos na consulta administrativa. Restauração de conteúdo e rollback de código não apagam registros.

Vendas, financiamento e test ride usam os números comerciais aprovados. Consórcio e pós-venda registram o pedido para acompanhamento e aguardam canais oficiais próprios para encaminhamento direto. Não foi contratada integração de CRM ou Syonet. Confirmar responsável pela fila e política de retenção com o cliente; não há exclusão automática configurada. Procedimento da equipe em `ADMIN.md`. O fluxo atualiza somente o Sites; Netlify/GitHub externos exigem seu fluxo próprio.


## Etapa 4 — Campanhas e seminovas — 30/10/2026

`/ofertas/` agora lista campanhas reais, com a aba Seminovas separada. Filtros por modelo/unidade, ordenação, paginação, estados vazios e detalhes usam dados persistentes. Cada campanha tem modelo, ano/modelo opcional, arte, unidades, início/fim e até três alternativas não cumulativas. Cada seminova tem código único, ano de fabricação/modelo, km, cor, preço próprio, unidade e galeria revisada. Links individuais: `/ofertas/<slug>/` e `/seminovas/<slug>/`; URLs antigas comerciais redirecionam.

O painel salva rascunho e publicação separados, mostra prévia privada e oferece programar pela validade, pausar, retomar, encerrar e alterar disponibilidade. Reservadas continuam sinalizadas sem CTA de compra; vendidas/retiradas saem da lista, com aviso no endereço antigo. Só administrador reativa venda/retirada. Restaurar conteúdo preserva código e disponibilidade. O banner desktop/mobile de Ofertas tem configuração própria, depende de uma campanha ativa e não sincroniza com Home.

Datas são interpretadas em America/Sao_Paulo no servidor. HTML/APIs/mídia comercial não usam cache público; páginas abertas e relações do Blog consultam novamente o servidor por intervalos limitados e na volta à aba. A espera para vencer uma condição desconta o tempo de rede usando relógio monotônico, sem decidir validade pelo relógio civil do visitante. Na ausência de confirmação, o cliente oculta as condições. O servidor revalida versão pública, unidade, alternativa/exemplar e disponibilidade na gravação do contato; a condição escolhida, preço e código ficam preservados na fila e na mensagem pronta.

`drizzle/0003_fuzzy_shatterstar.sql` acrescenta só o esquema do banner e o código único do estoque; migrações anteriores permanecem imutáveis. Exportação de conteúdo v2 inclui banner. Não houve seed comercial na base hospedada. A entrada em operação aguarda material de uma campanha real e de uma seminova real; não há oferta, estoque ou política comercial inventados. Não foi incluído campo/upload de documento pessoal. Operação detalhada em `ADMIN.md` e evidências/limites em `QA.md`.


## Catálogo 0 km e seis seminovas de demonstração — 30/10/2026

Por solicitação explícita do usuário após a etapa 4, o catálogo original dos seis modelos voltou à aba 0 km, incluindo a escada de preços, filtros por linha/orçamento, ordenação e contato compartilhado. Campanhas continuam no módulo dinâmico abaixo do catálogo. O catálogo fica fora do fragmento de atualização comercial, preservando a seleção dos filtros durante a consulta de validade.

`seminovas-demo.json` define seis exemplos completos (um de cada modelo), com código, fabricação/modelo, km, cor, preço fictício, unidade, descrição e quatro imagens oficiais ilustrativas. `build.py` gera `lib/stock-demo-catalog.mjs`. `ensureStockDemos` grava registros, revisões e metadados em D1 e cópias das imagens no R2, fora das migrações. A carga é idempotente e não sobrescreve edição, retirada ou reserva da equipe. Retirar uma publicação não recria o exemplo. Falha de imagem impede publicar o cadastro incompleto e permite concluir na tentativa seguinte.

`is_demo` é um marcador persistente do cadastro, visível nos cards, detalhes e painel. Valores são identificados como fictícios; as imagens são ilustrativas e a página não emite schema de oferta real. O CTA consulta o estoque real sem transmitir o exemplar fictício, e a API recusa pedidos de compra associados ao ID de demonstração. O marcador não pode ser retirado de uma publicação; para uma moto real, criar um novo cadastro com fotos e dados reais. Não há nova migração de esquema, usuário ou credencial de demonstração, envio de WhatsApp ou alteração nos preços de catálogo.

## Etapa 6 — Consórcio e ampliação de Pós-venda — 30/10/2026

Página própria `/consorcio/`, com apresentação, processo, perguntas e pedido de orientação. A central `/pos-venda/` reúne Garantia, Manuais e Revisões em endereços compartilháveis: `/pos-venda/garantia/`, `/pos-venda/manuais/` e `/pos-venda/revisoes/`. Manutenção, peças e acessórios continuam no atendimento compartilhado. Menu Comprar, menu Pós-venda e rodapé dão acesso às novas páginas; a navegação não mudou de nome.

`owner_pages.py` mantém os templates; `owner-resources.json` registra origem, data de consulta, oito links de PDF com hashes e 23 correspondências exatas de modelo/ano publicadas pela Bajaj. É uma curadoria pontual, sem espelhamento ou busca agendada. Os arquivos abrem diretamente no domínio oficial e a consulta não exige cadastro. A nova D250 2026/2027 possui manual distinto das versões anteriores. Anos sem correspondência não recebem manual aproximado; há orientação e acesso ao catálogo oficial.

Formulários de Consórcio e Pós-venda passam pela captação persistente existente. Pós-venda permite ano fabricação/modelo, quilometragem e, para revisão/manutenção, data de preferência, validados no servidor e visíveis nos Contatos protegidos. O JSON do registro recebe somente os campos aplicáveis; nenhuma migração ou restauração de banco é necessária. Consórcio e serviços continuam com `pending_channel`, sem envio presumido aos números de vendas, sem reserva de horário e sem integração declarada com CRM/Syonet.

Conteúdo de garantia e orientações usam as fontes oficiais indicadas na página. A fonte nacional de revisão consultada informa vigência de preços até 30/09/2026: nenhum valor vencido foi copiado como atual. Parcelas, taxas e prazos de consórcio não foram inferidos. A conclusão comercial da etapa depende das condições aprovadas pela operação/administradora, tabela de revisão vigente, canais por unidade e responsável pela manutenção dos materiais. A estrutura e os pedidos de acompanhamento já podem ser utilizados.


## Heroes dos modelos — 03/11/2026

As seis páginas usam o mesmo hero compacto em `public/dominar-400.css`. `heroAsset` e `heroBounds` nas configurações escolhem uma fotografia oficial frontal em três quartos e seus limites visíveis; `product_page.py` centraliza e alinha os arquivos originais em quadro 8:5. As dimensões permanecem nos manifestos de imagens. Ao trocar a foto, atualizar os limites e conferir que a moto inteira cabe no quadro. A imagem da Dominar 250 continua como referência.

Todos os modelos têm `heroYoutube` próprio, distinto dos outros contextos do site. O vídeo roda sem som quando elegível em desktop e celular, respeitando pausa, movimento reduzido e economia de dados. A opacidade da camada é centralizada em `--d4-video-opacity: .25`; o cenário alternativo cobre a interface do player enquanto carrega e é ocultado quando a reprodução inicia. Galerias, recursos, giros 360°, ficha, preços e fluxos de contato mantêm suas fontes anteriores.
