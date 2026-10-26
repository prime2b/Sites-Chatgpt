# Revisão de imagens e vídeos — 23/10/2026

Site existente Bajaj InteriorSP, 14 páginas. A revisão considera HTML, templates compartilhados, imagens em CSS, configurações JSON e mídias carregadas pelos carrosséis. Variantes de resolução, miniaturas, reflexos decorativos e ampliações no lightbox representam a mesma origem; trocar o nome ou o recorte de um arquivo não foi contado como substituição de conteúdo.

## Imagens corrigidas

| Página | Repetição encontrada | Substituições |
|---|---|---:|
| Pulsar N150 | Fotos repetidas entre apresentação, galeria e recursos | 5 |
| Dominar NS160 | Fotos repetidas entre apresentação, galeria e recursos | 5 |
| Dominar NS200 | Fotos repetidas entre apresentação, galeria e recursos | 5 |
| Dominar 250 | Fotos repetidas entre apresentação, galeria e recursos | 7 |
| Dominar NS400Z | Fotos repetidas entre apresentação, galeria e recursos | 7 |
| Dominar 400 | Fotos e recortes do hero repetidos na galeria e nos recursos | 7 |
| Home | Cinco posters reaproveitavam fotografias dos produtos | 5 |
| Home — fechamento | Poster da Dominar 250 também usado no hero | 1 |
| A InteriorSP | Imagem Dominar 400 também usada em outros contextos | 1 |

São 36 substituições nos produtos e 7 nas demais posições. Cada galeria mantém 6 imagens. Fotografias técnicas específicas foram preservadas nos recursos sempre que adequadas; outras poses passaram a ocupar as galerias. As fotos da D400 continuam pertencendo ao mesmo ensaio Savanna Green. A página A InteriorSP usa fotografia real do showroom de Bauru, com identificação e crédito.

`media-photo-sources.json` registra 77 posições nos produtos/posters e um poster adicional para o fechamento, com IDs Drive, URL canônica, alt e SHA256. As 72 posições de apresentação/galeria/recursos usam 72 originais distintos, e os 6 posters novos também têm origens exclusivas. As imagens foram convertidas proporcionalmente para WebP 800/1600/2400, sem reconstrução, espelhamento ou corte da fotografia.

## Vídeos corrigidos

- O MP4 da Dominar 250 aparecia no hero da Home, no fechamento e em dois locais da página do modelo. Agora ele permanece apenas no hero da Home; os outros contextos recebem filmes distintos.
- N150 e NS400Z repetiam o mesmo filme na Home e no produto. Os produtos receberam filmes oficiais diferentes.
- NS160 e NS200 compartilhavam o filme da família NS. NS160 recebe um filme próprio; NS200 conserva o filme da família, identificado corretamente.
- Os três destinos anteriormente vinculados à D400 eram da NS400Z. Hero, filme de detalhes e link complementar agora apontam para materiais D400 verificados.
- O fechamento da Home recebe o filme institucional “Bajaj |3Anos de História no Brasil”.

São 8 locais de reprodução alterados, além do link complementar D400. Há 16 contextos de reprodução com fontes distintas, mais um vídeo complementar distinto. Títulos e autor dos 16 vídeos YouTube foram conferidos pelo oEmbed oficial e registrados em `media-video-sources.json`. Os players dos produtos usam a própria capa do YouTube e carregamento lazy, com link direto alternativo. Não houve download ou reedição dos vídeos YouTube.

## Reutilizações funcionais preservadas

Logotipos, ícones, imagens de identificação dos modelos no menu/catálogo/Ofertas, miniaturas, reflexos decorativos e ampliações da galeria. A fachada de Rio Preto permanece na galeria institucional da Home e na identificação da unidade. Links diretos para o mesmo filme ao lado de seu player são alternativas de acesso.

Header e rodapé foram comparados com a versão anterior e permanecem idênticos nas 14 páginas. Ofertas permanece integralmente idêntica. Preços, fichas, unidades, contatos e rotas não foram alterados.

## Validação

- Verificação estática das 14 páginas, mídias, âncoras e contatos internos aprovada.
- 52 testes automatizados aprovados, incluindo ausência de repetição por origem e associação dos filmes aos modelos.
- 40 verificações no navegador: Home, seis produtos e A InteriorSP em 375/428/1024/1440/1920 px, sem transbordamento horizontal nem imagens quebradas no viewport inspecionado.
- Galerias N150/D400 conferidas visualmente; player N150 carregou título e duração oficiais. Reprodução integral de todos os filmes externos não foi certificada no navegador de teste.
