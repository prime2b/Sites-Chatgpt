# Painel de conteúdo e Contatos

## Central de Ajuda e Treinamento online — 03/11/2026

O menu **Ajuda e Treinamento** abre `/admin/ajuda/`; `/admin/treinamento/` reúne as trilhas. O acesso usa a mesma sessão individual do painel. A entrega inicial contém 35 conteúdos: 17 orientações operacionais, 12 aulas, três guias de multiplicadores e três referências técnicas, com 32 perguntas. O material visível varia conforme as permissões.

**Manual** tem busca por tarefa e módulo, procedimentos, checklists e telas demonstrativas protegidas. **Treinamento** oferece etapas, revisão e modo apresentação no navegador; **Meu progresso** distingue estudo, resultado da avaliação e prática observada. Progresso e avaliações são persistidos por pessoa e versão no D1. Aprovação de prova exige pelo menos 80% e todos os acertos críticos. As tentativas guardam o próprio gabarito e não mudam quando a aula é editada.

Administradores têm os recursos da central. Em **Equipe e permissões**, podem conceder separadamente **Acompanhar treinamentos** (multiplicador, participantes e observações) e **Manter documentação e aulas** (editor da central). Essas autorizações não dão acesso a Contatos, à gestão de pessoas ou à referência técnica administrativa. O instrutor não pode validar a própria prática. Relatórios mostram apenas aulas permitidas aos perfis envolvidos.

O editor da central mantém artigos/aulas, etapas, checklist, tela demonstrativa, exercício, público, trilha e perguntas. Rascunho, prévia, publicação, retirada e revisões são separados de Blog e campanhas. Restaurar uma versão não substitui a publicação. A marcação **Exigir revisão de estudo** sinaliza a necessidade de estudar uma versão nova e preserva os registros antigos. O seed inicial é idempotente e não reescreve edições ou recria publicações retiradas.

O **Simulador** cobre artigo, campanha e banner, seminova, contato, revisão e acesso fictício. Reutiliza os formulários de Blog e de comércio. Os estados do exercício ficam somente na memória da página e reiniciam ao recarregar; não há chamadas de escrita às APIs comerciais, cadastro de pessoas reais ou envio ao WhatsApp. O estudo e as avaliações continuam persistidos separadamente. As fotos são ilustrações fictícias identificadas para treinamento.

As tabelas `academy_*` são independentes das comerciais. A migração adicional `0004_majestic_captain_stacy.sql` acrescenta somente esquema e permissões com padrão zero; não altera credenciais ou cadastros comerciais existentes. A exportação editorial v2 não inclui a central, progresso, provas ou observações; cópias completas dependem do processo técnico de backup do banco. A documentação inicial fica em `lib/academy-seed.mjs`; manutenção após a carga inicial ocorre pelo editor protegido.

O piloto com a equipe e o encontro ao vivo dependem de disponibilidade da Bajaj; não há agendamento ou envio automático de convites.

Entrada: `/admin/`, na mesma prévia do Bajaj InteriorSP. O site mantém a audiência existente. Não foi atualizado o ambiente externo no Netlify ou GitHub.

## Acesso com usuário e senha

Entre em `/admin/entrar/`. Pessoas da equipe não precisam de conta ou assinatura do ChatGPT. Não existe cadastro aberto ou senha padrão compartilhada. O responsável inicial recebe um link privado de ativação, de uso único, para definir seu próprio usuário e senha. O link inicial vence em sete dias; links individuais emitidos pelo painel vencem em 24 horas.

Em **Equipe e permissões**, o administrador cadastra nome, e-mail de contato, perfil e autorização independente de contatos. O painel exibe um link privado; compartilhe apenas com a pessoa autorizada. Não há envio automático de mensagem. O usuário define suas próprias credenciais ao ativar. **Gerar link de acesso** permite redefinir a senha; links anteriores pendentes são cancelados. A redefinição encerra sessões anteriores. **Minha conta** permite mudar a senha informando a atual.

- **Administrador:** conteúdo, publicação, arquivos, equipe e recuperação.
- **Editor:** conteúdo, publicação, arquivos e histórico editorial.
- **Contatos:** permissão independente para consultar e acompanhar os registros; editar conteúdo ou receber perfil administrador não concede esse acesso automaticamente.
- **Suspensão:** impede acesso no servidor imediatamente. O responsável inicial não pode ser suspenso ou rebaixado.

As sessões têm duração fixa de oito horas. Senhas exigem pelo menos 12 caracteres, recebem salt individual, PBKDF2 e segredo separado do banco. Cookies são HttpOnly, Secure em HTTPS, SameSite=Lax e limitados ao host; o banco guarda apenas o hash do identificador da sessão. Há limitação de tentativas e conferência de origem nas mutações. A credencial ChatGPT anterior não autentica o painel.

Se o responsável perder o acesso e não houver outro meio de recuperação, o responsável técnico pode emitir um novo token privado pelo ambiente seguro do Site. Nunca colocar senhas, tokens de ativação, cookies ou segredos em código, arquivos de conteúdo ou logs.

## Rotina editorial

1. Abra Ofertas, Seminovas ou Blog e crie o rascunho.
2. Informe título, resumo e texto. Use imagens aprovadas nas campanhas e fotos reais nas seminovas. O Blog também aceita PDFs relacionados na biblioteca. Imagens: JPG/PNG/WebP até 10 MB; PDF até 20 MB. SVG e formatos incompatíveis são recusados pelo servidor.
3. Salve. O endereço é gerado pelo título e fica fixo após a primeira publicação.
4. Use **Ver prévia salva**: a prévia mostra a última versão salva e exige acesso editorial.
5. Use **Publicar**. O painel só confirma após persistência e verificação dos arquivos. A página em `/ofertas/<endereço>/`, `/seminovas/<endereço>/` ou `/blog/<endereço>/` passa a responder com HTML e metadados, respeitando a audiência atual do Site.
6. Novas alterações ficam no rascunho até **Publicar alterações**. O material já publicado permanece igual enquanto é revisado.
7. **Retirar do site** preserva rascunho, histórico e arquivos. O endereço deixa de mostrar o conteúdo e os arquivos deixam de ser públicos se não houver outro conteúdo publicado usando-os.

Publicação é síncrona e não exige deploy manual. O estado “Publicando…” dura durante o envio; falhas não são marcadas como sucesso. Reenvio de uma versão antiga recebe conflito e não sobrescreve a versão recente. Não há sincronização automática com os banners da Home.

## Recuperação

**Ver versões e restaurar** recria um rascunho a partir de uma revisão anterior, sem mudar a versão publicada. A publicação deve ser confirmada depois da conferência. Os arquivos são imutáveis e preservados; não há exclusão física de arquivos pelo painel.

Em **Recuperação**, baixe o JSON de conteúdos, revisões e metadados dos arquivos. Baixe também os originais em **Biblioteca de mídia** para manter uma cópia externa completa. O JSON v2 inclui também o banner de Ofertas; não contém os bytes dos arquivos, usuários, credenciais ou contatos. A restauração pelo painel é por revisão; reconstituição de uma base perdida usando a exportação exige operação técnica, com reenvio dos originais se necessário. Não foi configurado backup externo automático ou prometida restauração automática de banco.

Reverter o código no Sites não apaga os dados do D1/R2. Não apagar ou recriar tabelas durante rollback. Migrações aplicadas são imutáveis; novas alterações de esquema recebem novas migrações.

## Limites desta etapa

Esta é a base editorial de template fixo, sem edição de header, heroes, código, fontes, cores, fichas e preços de catálogo. Ofertas e Seminovas já têm campos, regras, listagens e páginas especializadas da etapa 4. O Blog já possui listagem, página de leitura, vínculos e formatação básica. Recursos editoriais adicionais podem ser ampliados em outro lote. Não publicar exemplos fictícios como condições reais.

A captação da etapa 3 está conectada à área protegida de Contatos. Não há novo CRM, contratação paga, integração de Syonet ou alteração na BIA de atendimento.

## Contatos — rotina de acompanhamento

O formulário compartilhado aparece ao solicitar atendimento pelo cabeçalho, rodapé, botão flutuante, Home, Ofertas, páginas de modelos e formulários de financiamento/test ride/pós-venda. Pede nome, WhatsApp e unidade, sem e-mail ou CPF. Digitar, navegar ou trocar de unidade não envia dados pessoais. A pessoa confirma o pedido e o aviso antes de enviar.

O site só mostra **Solicitação registrada** depois da confirmação do servidor. O contato fica no D1 mesmo se a pessoa fechar a página sem abrir o WhatsApp. Reenvio técnico com os mesmos dados usa a mesma chave e não duplica o registro. Falhas de conexão mantêm os campos para tentar novamente. Nome e telefone não são guardados no armazenamento local do navegador.

1. Entre no painel e abra **Contatos**. Somente quem recebeu a permissão específica vê e usa essa área.
2. Filtre por **Novo**, unidade ou interesse. A lista tem até 50 registros por página; use Anteriores/Próximos para continuar.
3. Abra **Ver solicitação**. Confira nome, telefone, unidade, modelo, origem, intenção e, quando aplicáveis, campanha/exemplar, entrada, prazo, data de preferência e descrição.
4. Dê continuidade pelo processo da unidade e altere a situação para **Em acompanhamento**, **Concluído** ou **Arquivado**. O status é manual; não confirma automaticamente conversa ou venda. Alterações concorrentes exigem reabrir o registro.
5. Revise também os novos pedidos sem tentativa de abrir o WhatsApp. A ausência dessa tentativa não prova que a pessoa não conversou por outro caminho.

Os destinos liberados para vendas, simulação e test ride são os dois números comerciais já aprovados. Consórcio e as intenções de pós-venda ficam registrados para acompanhamento, com **canal pendente**; não são enviados por presunção aos números de vendas. Confirmar os canais oficiais por unidade antes de liberar seu encaminhamento direto. A integração de CRM/Syonet continua separada e não é declarada ativa.

O responsável pela operação deve indicar quem consulta essa fila e a frequência de retorno, usando Equipe e permissões para autorizar as pessoas. A política e o prazo de retenção devem ser definidos pelo responsável do cliente. Não foi criado prazo automático de exclusão sem essa definição. **Arquivar preserva o registro**; exclusão definitiva de contatos não está disponível neste painel. Encaminhe solicitações sobre os dados ao responsável pela operação e à manutenção técnica.

O site registra separadamente o salvamento e a tentativa de abrir o WhatsApp. Não há confirmação automática de mensagem enviada, atendimento, agendamento, análise de crédito ou venda. Não enviar dados pessoais em eventos de publicidade.

## Manutenção da captação

`lib/contact-server.mjs` valida e persiste; `lib/contact-domain.mjs` normaliza campos e prepara o encaminhamento com dados comerciais do servidor. `public/contact-capture.mjs` conecta a experiência compartilhada; `public/contact-admin.mjs` apresenta a fila. O aviso tem versão registrada junto do pedido. A migração adicional `drizzle/0002_tan_black_tom.sql` acrescenta somente esquema e índices; as duas anteriores permanecem imutáveis.

A API pública aceita envios com origem válida e limita novas solicitações por chave derivada do IP, sem guardar o IP em claro. Recibos não dão acesso público a nome/telefone. A tentativa de encaminhamento exige o recibo secreto correspondente; contatos e suas mutações continuam protegidos no servidor. Nenhuma credencial é publicada no navegador.

## Manutenção técnica

O acervo estático fica em `public/`. `python3 build.py` gera 17 páginas estáticas e os fragmentos compartilhados; Ofertas, Blog e detalhes são dinâmicos. Não criar um `public/ofertas/index.html`, pois um arquivo estático pode desviar a rota do servidor; a compilação Vinext gera `dist/client` e `dist/server`. O Worker preserva as URLs existentes e acrescenta `/admin`, `/api/admin`, `/conteudos` e `/midia`. O build mantém a integração `sites()`.

Dados: D1 (`DB`), arquivos: R2 (`BUCKET`), ativos estáticos: `ASSETS`. Manifesto sem `static`, com o mesmo project_id. Migração inicial: `drizzle/0000_yielding_ultimates.sql`; sem seed de conteúdo ou usuário de teste. O responsável é vinculado no primeiro acesso autenticado, não na migração.

Verificar: `python3 build.py`, `node --test tests/*.test.mjs`, `python3 tests/static_check.py`, `npx tsc --noEmit` e build pelo helper do Sites. Os testes administrativos usam SQLite em memória e R2 em memória; não gravam dados de homologação na base hospedada.

O Netlify entrega os arquivos estáticos de `public` e uma Edge Function encaminha as rotas dinâmicas ao backend Sites existente. O painel, a central, o Blog e o estoque usam a mesma base e os mesmos acessos individuais; editar um conteúdo publicado afeta os dois endereços. A assinatura do gateway protege o contexto da requisição, sem substituir a sessão ou conceder permissões. O cookie de login permanece vinculado ao domínio acessado, portanto é necessário entrar em cada endereço utilizado.

Para manutenção, preservar a chave secreta `BAJAJ_NETLIFY_GATEWAY_SECRET` nos dois provedores. No Netlify, ela pertence ao escopo Functions, com valores explícitos para os contextos utilizados. Nunca colocá-la em `public`, no TOML, em logs ou em URLs. Rotação exige atualizar os dois ambientes e publicar novamente. Falhas do gateway devolvem erro 502/503; verificar a disponibilidade do backend, a implantação da Edge Function e a configuração da chave, sem registrar valores, corpos de formulários ou cookies. Os limites existentes de mídia, permissões e controle de tentativas continuam aplicáveis.

## Blog e vínculos da lateral

No editor de um artigo, a área **Artigo e vínculos** define categoria, autor, capa/foto do acervo e descrição acessível. Selecione os modelos em **Motos citadas**, escolha uma oferta para o banner e até três ofertas relacionadas. Cada vínculo pode apontar para uma condição de catálogo aprovada ou uma campanha publicada.

Em Ofertas, selecione o modelo da campanha e defina início/fim em horário de São Paulo. Campanhas futuras, encerradas ou retiradas não são exibidas na lateral. Os valores de catálogo não são alterados pelo editor. Nossas lojas sempre leva às unidades existentes.

O texto aceita `## Subtítulo`, `**negrito**`, listas iniciadas por `-` e links seguros. HTML arbitrário não é executado. A prévia privada mostra o mesmo template da página pública. Depois de publicar ou retirar um artigo, Blog e Home refletem o novo estado pelo servidor.

Os três textos iniciais são originais e usam as fichas/apresentações já aprovadas no site. A referência visual não autoriza copiar o texto da Carrera, suas notícias ou condições comerciais.


## Ofertas 0 km — rotina de campanhas

1. Abra **Ofertas → Nova campanha**. Informe título, resumo, condições gerais, modelo Bajaj e a imagem aprovada com descrição acessível. Ano/modelo e preço geral à vista são opcionais; só preencher se constarem do material comercial aprovado.
2. Marque as unidades participantes e início/fim no horário de São Paulo. Uma data futura é permitida; o fim precisa ser posterior ao início e ainda não ter passado ao publicar.
3. Preencha de uma a três alternativas. Cada uma tem título, condições completas e preço à vista opcional. Opções não utilizadas ficam inteiramente vazias. As alternativas são escolhas independentes: benefícios não são somados.
4. Salve o rascunho e confira **Ver prévia salva**. A prévia exige sessão editorial, usa a última versão salva e desativa a captação. Salvar não altera a campanha pública.
5. **Publicar** torna a campanha ativa ou programada conforme a validade. **Pausar** oculta; **Retomar** devolve enquanto a validade permitir; **Encerrar** retira e mantém histórico. Uma campanha vencida ou encerrada só volta após revisar o rascunho e publicar uma validade futura aprovada.
6. No Blog, vincule a campanha ao banner ou às ofertas relacionadas do artigo. Campanhas pausadas, futuras, encerradas e vencidas não aparecem nesses vínculos. O catálogo mantém seus preços próprios, sem ser tratado como campanha promocional.

A aba 0 km mostra novamente o catálogo original, com os seis modelos e seus preços aprovados, e as campanhas cadastradas abaixo. Sem campanhas reais ativas, informa a ausência de campanha e mantém o catálogo e o contato com a unidade. Expiração funciona pela regra do servidor, sem agendamento externo. Páginas abertas consultam novamente as condições; voltar a uma aba também exige confirmação. Sem JavaScript é preciso reabrir a página para obter o estado atual, e a captação não é liberada por essa interface.

## Banner da página Ofertas

Em **Ofertas → Banner da página**, vincule uma campanha e selecione imagens desktop/mobile com descrição acessível. Recomendação: **1600 × 600 px (8:3)** no desktop e **800 × 1000 px (4:5)** no mobile. A imagem inteira é preservada, sem corte; diferenças de proporção podem produzir respiro ao redor da arte.

**Salvar rascunho** mantém o banner privado; **Ver prévia salva** permite revisar mesmo antes de a campanha começar. **Publicar banner** disponibiliza o vínculo, que aparece somente com campanha ativa. Pausa, encerramento e validade da campanha também controlam a exibição do banner e de suas mídias. **Retirar banner** não altera a campanha. Este cadastro é independente dos banners e do hero da Home.

## Seminovas — rotina de estoque próprio

1. Cadastre somente exemplar Bajaj do estoque próprio, escolhendo um dos modelos existentes. Informe código único do estoque, título, resumo/descrição, unidade, ano de fabricação, ano do modelo, km, cor e preço próprio. O código e o endereço ficam preservados após a primeira publicação.
2. Envie uma foto real de capa e as fotos reais da galeria. JPG, PNG ou WebP; até 10 MB por imagem e até 12 itens na galeria. As setas do painel mudam a ordem; a capa é apresentada primeiro na página pública.
3. Revise manualmente imagens, placas e dados pessoais desnecessários. Confirme a revisão antes de publicar; trocar capa/seleção/ordem exige nova confirmação. Não há remoção automática de placas ou metadados implementada. Não use imagem de catálogo para anunciar uma seminova.
4. Salve, confira a prévia privada e publique. A página individual compartilha preço, ficha do exemplar, unidade e galeria com ampliação e navegação por teclado. O preço do estoque não altera o catálogo de motos novas.
5. Use **Reservar** para manter a moto na lista com sinalização e sem pedido de compra daquele anúncio. Use **Vender** ou **Retirar do estoque** para sair da listagem. O endereço antigo informa a indisponibilidade e oferece outros caminhos.
6. A reativação de exemplar vendido ou retirado exige administrador. Restaurar uma revisão ou retirar/republicar o conteúdo não reativa o estoque. Editor pode revisar conteúdo, mas não contornar a disponibilidade por esses caminhos.

Pedidos do anúncio levam código, preço, modelo e unidade do exemplar. Pedidos de campanha levam a alternativa escolhida e suas condições/preço. Se versão pública, validade, unidade ou disponibilidade mudar antes de salvar, o servidor pede atualização do anúncio; não registra uma condição nova como se fosse a antiga. Pedidos já confirmados continuam preservados.

## Material pendente para entrada em operação

A aba Seminovas contém seis cadastros fictícios de demonstração, claramente identificados. Não são estoque ou ofertas reais. As campanhas reais continuam dependendo do material aprovado. Para homologar a operação comercial, receber uma campanha real (artes, condições alternativas, modelo/ano, unidades e validade) e uma seminova real (código, dados, preço, unidade e fotos revisadas). Confirmar com a operação o significado de “documento” antes de considerar qualquer mudança de escopo; esta etapa não coleta documento pessoal.


## Usar e retirar os seis exemplos fictícios

A pedido do usuário, foram incluídos exemplos de Pulsar N150, Dominar NS160, Dominar NS200, Dominar 250, Dominar 400 e Dominar NS400Z. Cada um tem cadastro completo e quatro imagens oficiais ilustrativas, código iniciado por DEMO, dados/preço fictícios e unidade apenas como referência de demonstração.

Os seis exemplos aparecem em **Seminovas** no painel e na aba pública. É possível revisar os dados, conferir a prévia e experimentar os estados do módulo. A indicação de demonstração permanece visível e não pode ser removida para transformar o exemplo em anúncio real. **Consultar estoque real** inicia um contato sobre o modelo, sem registrar interesse comercial no exemplar fictício.

Para tirar um exemplo da listagem, abra-o no painel e use **Retirar publicação** ou **Retirar do estoque**. Ele permanece no histórico e não reaparece por uma nova visita ou publicação de código. Para começar o estoque real, crie um cadastro separado com dados, preço e fotos daquele exemplar; depois retire os exemplos que não serão mais usados.

## Consórcio e Pós-venda — etapa 6

- **Consórcio:** a página própria informa o processo e recebe interesses com modelo e unidade. Não é contratação de cota nem simulação de parcelas. Consultar a administradora antes de apresentar condições comerciais.
- **Pós-venda:** Garantia, Manuais e Revisões têm páginas próprias. A equipe usa a mesma fila protegida de Contatos, filtrando interesse e unidade; ano fabricação/modelo, quilometragem e data de preferência aparecem no detalhe quando informados. A data não confirma horário. Peças, acessórios e garantia não carregam a preferência de data de uma revisão anterior.
- **Manuais:** oito PDFs oficiais e 23 combinações de modelo/ano, com consulta livre. O filtro não substitui anos ausentes por versões próximas. O visitante pode abrir e salvar o PDF no visualizador do navegador. Se a fabricante retirar um arquivo, orientar pela área oficial ou pelo atendimento.
- **Encaminhamento:** canais específicos de Consórcio e Pós-venda continuam pendentes. O registro fica disponível nesta fila e deve ser acompanhado pela pessoa responsável da unidade. Não há disparo automático para equipe/vendas nem API Syonet ativa. Nenhum número novo foi presumido.
- **Materiais:** os templates e a curadoria estão em `owner_pages.py` e `owner-resources.json`, sob manutenção técnica. Este lote não amplia o CMS geral. Solicitar atualização a partir de material aprovado, verificando modelo/ano, URL, arquivo, vigência, condições e unidade. Nomear responsável do cliente para a revisão periódica. Os hashes registram os arquivos inspecionados em 30/10/2026; não representam monitoramento automático de mudanças externas.
- **Valores:** a página nacional consultada informa preços de revisão válidos até 30/09/2026. Não há tabela numérica vigente publicada pela InteriorSP neste lote. Receber a tabela local aprovada, seus limites, validade e condições antes de acrescentar valores. O mesmo vale para parcelas, taxas e prazos de Consórcio.

## Tabelas oficiais de revisão e pós-venda — 10/11/2026

Acesse **Tabelas de revisão** no menu, em `/admin/revisoes/`. A consulta diária das 7h de São Paulo roda no Netlify (`maintenance-sync`, cron `0 10 * * *`) sem depender de navegador ou chat. **Conferir fonte agora** antecipa a verificação; resultados com menos de dois minutos podem ser reutilizados. Documento alterado sem extração segura fica pendente. O administrador deve baixar o PDF capturado, conferir as sete linhas em centavos, modelo/versão, prazos, vigência, somas e aplicação na unidade e registrar a orientação antes de aprovar. Há histórico, snapshots e PDFs em R2 (`maintenance/`). Valores vencidos não são exibidos no site. O pós-venda deve resolver os conflitos de prazo originais da D400 três velas e NS400Z (3 meses no cabeçalho / 1 mês no rodapé).

As solicitações continuam em **Contatos**, filtradas por unidade e serviço; registro não é agendamento. Pós-venda Rio Preto: ligação em **(17) 3042-0708**. Canal de Bauru pendente de definição; não encaminhar para um WhatsApp presumido. Telefones das lojas: Rio Preto **(17) 3042-0042**, Bauru **(14) 3042-0007**; BIA mantém os WhatsApps comerciais existentes. O novo material online “Pós-venda, telefones e tabelas de revisão” detalha essa rotina sem sobrescrever aulas editadas pela equipe.
