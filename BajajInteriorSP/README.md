# Bajaj InteriorSP
Site estático com14 páginas: home, seis modelos, ofertas, financiamento, test ride, pós-venda, unidades, apresentação da InteriorSP e privacidade. Publicação privada de validação pelo Sites; domínio final preparado: https://bajajinteriorsp.com.br/, sem configuração de DNS afirmada.

## Atualização pela Prime2B
- `data.json`: preços, nomes, fichas técnicas e unidades. Os seis preços do briefing são a fonte comercial única.
- `model-settings.json`: textos, imagens, destaques, modos e vídeos dos cinco modelos expandidos. D400 preserva `d400-settings.json` e `d400-assets.json`.
- `product_page.py`: padrão reutilizável dos seis produtos, com galerias, recursos, ficha em abas e solicitação de simulação.
- `support_pages.py`: páginas comerciais e institucionais; sem painel administrativo.
- `offers_page.py`, `dist/offers.css` e `dist/offers.mjs`: corpo da página Ofertas, com filtro por linha, teto de investimento, ordenação e contato com a BIA da unidade escolhida. Header, hero e rodapé continuam compartilhados. `offers-assets.json` registra os PNGs oficiais e suas variantes.
- `build.py`: `python build.py` gera HTML, JSON e sitemap. Python padrão; otimização de novos ativos exige Pillow.
- `model-assets.json`: dimensões e variantes de fotos. `source-model-photos.json` registra os arquivos do Drive fornecido. `source-model-specs.json` preserva as fichas recebidas, sem publicar links internos dos documentos.
- `scripts/prepare_model_assets.py CAMINHO_DOS_ORIGINAIS`: otimiza as fotos sem corte ou reconstrução. Variantes800/1600/2400 no maior lado, sem ampliar. Fotos integrais em contain; hero reutiliza ativo completo existente.

## Verificação e publicação
`python tests/static_check.py` e `node --test tests/*.test.mjs`. Scripts em `dist/` são módulos nativos; sem instalação de dependências frontend. Publicar pelo fluxo Sites preservando `.openai/hosting.json` e o acesso atual. `QA.md` registra verificações e limites de navegador.

## Fluxos comerciais
A unidade é salva somente neste navegador em `interiorsp.unit.v1` e pode ser alterada pelo topo ou formulários. WhatsApp por unidade, com modelo, preço e intenção contextualizados. Simulação solicita entrada e prazo, sem taxas, parcelas calculadas ou aprovação. Test ride e pós-venda preparam mensagens, com data de preferência opcional para test ride. Sem CPF, documentos, CRM, bancos ou nova IA. A BIA existente continua o atendimento; abrir WhatsApp não confirma envio ou agendamento.

Sem identificadores externos de mensuração ativados. Eventos locais não incluem valores de entrada, prazos, datas ou descrição livre. Preview noindex/nofollow e robots disallow; liberar indexação somente na publicação final autorizada. Quatro links provisórios da jornada continuam exatamente como solicitados: #contato, #test-ride, #oficina, #garantia; dependem dos destinos definitivos.

## Auditoria de mídias
`MEDIA-AUDIT.md` registra a revisão completa de 23/10/2026. `media-photo-sources.json` guarda a origem de cada posição revisada, e `media-video-sources.json` guarda a conferência dos filmes oficiais. `home-closing-media.json` centraliza o filme institucional e o poster da CTA final. O novo player de fundo respeita visibilidade, movimento reduzido e economia de dados. `scripts/prepare_media_refresh.py` recebe os planos revisados de produtos, posters da Home e poster de fechamento, nesta ordem, para otimizar os originais sem corte.


## Hospedagem Netlify
O projeto `bajaj-interiorsp` pertence à equipe Prime2B Dev. (`marketing-wkwnzoq`). O ID e o destino de publicação constam em `netlify-project.json`. O mesmo código do site existente é enviado como site estático de 14 páginas; não há novo frontend ou cópia editorial independente.

`netlify.toml` define `python3 build.py` e `dist`. Para publicação manual, construir primeiro com `python3 build.py` e depois executar `netlify deploy --prod --dir dist --site 337fc8fa-6dcf-4c41-af1e-49721fde8257`. Login do CLI pode ser autorizado no navegador local com `netlify login --request "Publicar Bajaj InteriorSP" --json`, seguido por `netlify login --check ID_DO_TICKET`. Credenciais e `.netlify/` ficam fora do Git. O projeto não tem publicação contínua via Git configurada.
