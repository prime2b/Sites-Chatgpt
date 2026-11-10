"""Bounded owner/consortium pages. Official links retain their exact applicability."""
import json
from html import escape as esc
from pathlib import Path

RESOURCES = json.loads(Path(__file__).with_name('owner-resources.json').read_text())
MEDIA = json.loads(Path(__file__).with_name('owner-media.json').read_text())


def media_img(item, sizes='100vw', eager=False):
    large = item['variants'][-1]
    srcset = ', '.join(f'/assets/{v["file"]} {v["width"]}w' for v in item['variants'])
    loading = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    return f'<img src="/assets/{large["file"]}" srcset="{srcset}" sizes="{sizes}" width="{large["width"]}" height="{large["height"]}" alt="{esc(item["alt"])}" {loading} decoding="async">'


def media_figure(key, cls='owner-editorial-media', sizes='(max-width:767px) 90vw, 42vw', focus=None):
    item = MEDIA['images'][key]
    if focus:
        large = item['variants'][-1]
        # These official compositions reserve half the canvas for copy. Show
        # the complete photographic half inside the content column.
        image = f'<div class="owner-content-frame owner-content-frame--{focus}" style="aspect-ratio:{large["width"] / 2:g}/{large["height"]}">'+media_img(item, '(max-width:767px) 180vw, 90vw')+'</div>'
    else:
        image = media_img(item, sizes)
    return f'<figure class="{cls}">{image}<figcaption>Foto de divulgação Bajaj.</figcaption></figure>'


def external(url, label, cls='text-link'):
    return f'<a class="{cls}" href="{esc(url)}" target="_blank" rel="noopener noreferrer">{label} <span aria-hidden="true">↗</span><span class="visually-hidden"> (abre em nova aba)</span></a>'


def hero(label, title, description, parent=False):
    trail = '<a href="/pos-venda/">Pós-venda</a><span aria-hidden="true">/</span>' if parent else ''
    return f'<section class="service-hero"><nav aria-label="Você está aqui"><a href="/">Início</a><span aria-hidden="true">/</span>{trail}<span aria-current="page">{label}</span></nav><p class="service-eyebrow">Bajaj InteriorSP · {label}</p><h1>{title}</h1><p>{description}</p></section>'


def owner_nav(active=''):
    paths = [('garantia', 'Garantia'), ('manuais', 'Manuais'), ('revisoes', 'Revisões')]
    return '<nav class="owner-subnav" aria-label="Área do proprietário"><a href="/pos-venda/"'+(' aria-current="page"' if active == 'pos-venda' else '')+'>Pós-venda</a>'+''.join(f'<a href="/pos-venda/{path}/"'+(' aria-current="page"' if active == path else '')+f'>{label}</a>' for path, label in paths)+'<a href="/pos-venda/#atendimento">Solicitar atendimento</a></nav>'


def request_section(data, icon, kind='pos-venda', intent='revisao'):
    consortium = kind == 'consorcio'
    title = 'Vamos planejar sua próxima Bajaj?' if consortium else 'Qual é o próximo cuidado?'
    description = 'Escolha o modelo de interesse e a unidade. A equipe pode orientar você sobre os planos e as condições disponíveis.' if consortium else 'Informe sua necessidade e a unidade. Modelo, ano e quilometragem ajudam a equipe a orientar o atendimento.'
    options = '<option value="">Quero orientação da equipe</option>'+''.join(f'<option value="{m["id"]}">{esc(m["name"])}</option>' for m in data['models'])
    form = f'<form class="service-request" data-service-form="{kind}"><label for="service-model">Modelo <span>(opcional)</span></label><select id="service-model" name="model">{options}</select>'
    if consortium:
        form += '<input type="hidden" name="intent" value="consorcio">'
    else:
        services = [('revisao', 'Revisão'), ('manutencao', 'Manutenção'), ('pecas', 'Peças genuínas'), ('acessorios', 'Acessórios'), ('garantia', 'Garantia e orientação de manual')]
        form += '<label for="service-intent">O que você precisa?</label><select id="service-intent" name="intent">'+''.join(f'<option value="{key}"'+(' selected' if key == intent else '')+f'>{text}</option>' for key, text in services)+'</select>'
        form += '<div class="owner-form-pair"><div><label for="service-year">Ano fabricação/modelo <span>(opcional)</span></label><input id="service-year" name="model_year" placeholder="2026/2027" pattern="[0-9]{4}/[0-9]{4}" maxlength="9" aria-describedby="service-year-hint"><small id="service-year-hint">Use o ano da sua moto, como 2026/2027.</small></div><div><label for="service-mileage">Quilometragem <span>(opcional)</span></label><input id="service-mileage" name="mileage" type="number" min="0" max="999999" step="1" inputmode="numeric" placeholder="Em km"></div></div><div data-service-date-row><label for="service-date">Data de preferência <span>(opcional)</span></label><input id="service-date" name="date" type="date"><small>A equipe confirma a disponibilidade. Este pedido não reserva um horário.</small></div>'
    form += '<label for="service-unit">Unidade</label><select id="service-unit" name="unit" required><option value="">Escolha sua unidade</option>'+''.join(f'<option value="{u["id"]}">{esc(u["name"])}</option>' for u in data['units'])+'</select><label for="service-detail">Quer acrescentar algo? <span>(opcional)</span></label><textarea id="service-detail" name="detail" rows="3" maxlength="500" placeholder="Conte sua necessidade, sem documentos ou dados sensíveis."></textarea><p class="form-error" role="alert" data-service-error hidden></p><button class="button" type="submit">Solicitar orientação '+icon('arrow')+'</button><p class="fine">Na próxima etapa, informe nome e WhatsApp para registrar sua solicitação. A equipe da unidade acompanha o pedido.</p></form>'
    foot = 'Valores, parcelas e condições são apresentados pela equipe conforme o plano e o regulamento da administradora. O envio não contrata uma cota.' if consortium else 'Revisões, manutenção, peças, acessórios e garantia: cada solicitação segue para acompanhamento da unidade escolhida. Serviços, peças e horários precisam ser confirmados.'
    return f'<section class="section service-request-grid owner-contact" id="atendimento"><div><p class="owner-kicker">Atendimento por unidade</p><h2>{title}</h2><p>{description}</p><p class="owner-contact-note">{foot}</p>{'' if consortium else '<p>Pós-venda Rio Preto: <a class="text-link" href="tel:+551730420708">(17) 3042-0708</a></p><p class="fine">Bauru: registre o pedido para acompanhamento pela equipe da unidade.</p>'}<a class="text-link" href="/unidades/">Conheça Rio Preto e Bauru {icon("arrow")}</a></div>{form}</section>'


def faq(items):
    return '<div class="owner-faq">'+''.join(f'<details><summary>{q}<span aria-hidden="true">+</span></summary><div><p>{a}</p></div></details>' for q, a in items)+'</div>'


def consortium_page(data, icon):
    title = 'Consórcio Nacional Bajaj'
    desc = 'Planeje a compra da sua Bajaj. Conheça o funcionamento do consórcio e solicite orientação em Rio Preto ou Bauru.'
    body = hero('Consórcio', 'Sua próxima Bajaj.<br>No seu planejamento.', desc)
    body += '<section class="section consortium-intro"><div><p class="owner-kicker">Consórcio Nacional Bajaj</p><h2>Um plano para<br>chegar mais longe.</h2><p>O Consórcio Nacional Bajaj é administrado pela Âncora Consórcios. Conheça o processo e converse com a equipe sobre o modelo que você quer conquistar.</p><div class="actions"><a class="button" href="#atendimento">Quero conhecer os planos '+icon('arrow')+'</a><a class="text-link" href="#como-funciona">Como funciona '+icon('arrow')+'</a></div><small>Consulte o regulamento e as condições do grupo antes de contratar.</small></div>'+media_figure('consorcio', 'owner-content-media', focus='right')+'</section>'
    steps = [('Escolha seu objetivo', 'Defina a moto de interesse e peça orientação sobre o crédito, os custos e o prazo do grupo.'), ('Conheça as regras', 'O grupo reúne participantes que contribuem para a aquisição de bens. Confira o contrato e a composição das parcelas.'), ('Acompanhe a contemplação', 'A contemplação ocorre por sorteio ou lance, conforme o regulamento e os recursos do grupo. Não há data antecipada garantida.')]
    body += '<section class="section consortium-steps" id="como-funciona"><div class="section-head"><h2>Do objetivo<br>ao próximo passo.</h2><p>Entenda o caminho antes de escolher um plano.</p></div><ol>'+''.join(f'<li><span class="owner-index">0{i+1}</span><h3>{h}</h3><p>{p}</p></li>' for i, (h, p) in enumerate(steps))+'</ol></section>'
    body += '<section class="section owner-questions"><div><p class="owner-kicker">Antes de decidir</p><h2>Suas dúvidas.<br>Uma conversa clara.</h2></div>'+faq([('Quando posso receber a moto?', 'A contemplação depende das regras e dos recursos do grupo. A adesão ou a antecipação de parcelas não garante recebimento imediato.'), ('Como consultar parcelas e custos?', 'Peça à equipe a proposta vigente, com taxa de administração, demais encargos, prazo e critérios de reajuste. Os valores dependem do plano; não há simulação de parcelas nesta página.'), ('O pedido já contrata o consórcio?', 'Não. O formulário registra seu interesse para atendimento. A contratação e a análise seguem os procedimentos da administradora.'), ('Onde consultar as informações oficiais?', 'A Bajaj apresenta a Âncora como administradora do Consórcio Nacional Bajaj. Consulte os canais oficiais e o regulamento do grupo.')])+'</section>'
    body += '<section class="section owner-source-strip"><div><strong>Informação para uma escolha consciente.</strong><p>Consulte a apresentação oficial e as orientações da administradora. Condições da InteriorSP são confirmadas no atendimento.</p></div><div class="actions">'+external(RESOURCES['consortium_source'], 'Consórcio no site Bajaj')+external(RESOURCES['consortium_rules_source'], 'Orientações da Âncora')+'</div></section>'
    return '<div class="service-page owner-page consortium-page">'+body+request_section(data, icon, 'consorcio')+'</div>', title, desc


def owner_page(kind, data, icon):
    labels = {'pos-venda': 'Pós-venda', 'garantia': 'Garantia Bajaj', 'manuais': 'Manuais do proprietário', 'revisoes': 'Revisões a preço fixo'}
    titles = {'pos-venda': 'O cuidado continua.<br>A cada quilômetro.', 'garantia': 'Sua Bajaj.<br>Bem acompanhada.', 'manuais': 'Sua moto.<br>O manual certo.', 'revisoes': 'Planeje o cuidado.<br>Preserve o caminho.'}
    descriptions = {'pos-venda': 'Garantia, manuais, revisões e atendimento para sua Bajaj. Encontre a informação certa e conte com a equipe da sua unidade.', 'garantia': 'Entenda onde consultar as condições da garantia e o que preparar para receber orientação da equipe.', 'manuais': 'Encontre os PDFs oficiais Bajaj pelo modelo e ano de fabricação/modelo. A consulta é livre, sem cadastro.', 'revisoes': 'Consulte o plano de manutenção da sua Bajaj e solicite à unidade as condições vigentes da revisão.'}
    body = hero(labels[kind], titles[kind], descriptions[kind], kind != 'pos-venda')+owner_nav(kind)
    if kind == 'pos-venda':
        cards = [('garantia', 'Garantia', 'Condições, orientações e o caminho para consultar a cobertura da sua Bajaj.', 'Conhecer a garantia'), ('manuais', 'Manuais', 'Arquivos oficiais identificados por modelo e ano, para consultar quando precisar.', 'Encontrar meu manual'), ('revisoes', 'Revisões', 'Plano de manutenção e consulta das condições vigentes para sua próxima revisão.', 'Consultar revisões')]
        card_images = {'garantia': MEDIA['images']['garantia-diagnostico'], 'manuais': MEDIA['manual_covers'][RESOURCES['manuals'][0]['url']], 'revisoes': MEDIA['images']['revisao-loja']}
        body += '<section class="section owner-overview"><div class="section-head"><h2>Informação certa.<br>Cuidado de perto.</h2><p>Três caminhos para acompanhar sua moto com mais clareza.</p></div><div class="owner-card-grid">'+''.join(f'<a class="owner-card owner-card--illustrated" href="/pos-venda/{path}/"><span class="owner-card-media">'+media_img(card_images[path], '(max-width:767px) 90vw, 28vw')+f'</span><span class="owner-index">0{i+1}</span><h3>{title}</h3><p>{text}</p><span class="text-link">{label} {icon("arrow")}</span></a>' for i, (path, title, text, label) in enumerate(cards))+'</div></section>'
        body += '<section class="section owner-services"><div><p class="owner-kicker">Sua unidade, por perto</p><h2>Além da revisão.</h2><p>Conte sua necessidade. A equipe verifica aplicação, disponibilidade e os próximos passos.</p>'+media_figure('servicos', 'owner-services-media')+'</div><div class="owner-service-list">'+''.join(f'<a href="#atendimento" data-service-choice="{key}"><span><strong>{label}</strong><small>{text}</small></span>{icon("arrow")}</a>' for key, label, text in [('manutencao','Manutenção','Orientação e avaliação do cuidado que sua moto precisa.'), ('pecas','Peças genuínas','Consulta da peça adequada ao modelo e ano da moto.'), ('acessorios','Acessórios','Aplicação e disponibilidade confirmadas com a equipe.')])+'</div></section>'
    elif kind == 'garantia':
        body += '<section class="section owner-warranty"><div class="owner-warranty-visual">'+media_figure('garantia-diagnostico')+'<div class="owner-warranty-number"><strong>3<span>anos</span></strong><p>Garantia de fábrica<br>sem limite de quilometragem*</p></div></div><div><p class="owner-kicker">Garantia Bajaj</p><h2>Conheça os termos.<br>Guarde seu histórico.</h2><p>A fabricante informa cobertura de três anos para motos 0 km, conforme o Manual do Proprietário. A análise de cada solicitação considera os termos e as exclusões aplicáveis à motocicleta.</p><p>Observe o plano de manutenção e conserve os registros das revisões. Consulte o manual do seu modelo e ano antes de tomar decisões sobre cobertura.</p><p class="fine">*Condições da fabricante consultadas em 30/10/2026. Esta apresentação não substitui o certificado e o contrato de garantia da sua moto.</p><div class="actions">'+external(RESOURCES['warranty_source'],'Ler condições oficiais')+'<a class="text-link" href="/pos-venda/manuais/">Encontrar meu manual '+icon('arrow')+'</a></div></div></section>'
        body += '<section class="section owner-questions"><div><p class="owner-kicker">Orientação de garantia</p><h2>Antes do<br>atendimento.</h2></div>'+faq([('O que informar à equipe?', 'Modelo, ano e uma descrição objetiva da necessidade. Não envie documentos pessoais no formulário do site. A equipe orientará sobre os próximos passos.'), ('A solicitação confirma a cobertura?', 'Não. A equipe precisa avaliar a motocicleta e as condições aplicáveis. Consulte o manual, o certificado de garantia e a fabricante.'), ('Onde encontro os termos da minha moto?', 'No Manual do Proprietário e no certificado que acompanha a motocicleta. A área de Manuais organiza os links oficiais por modelo e ano.')])+'</section>'
    elif kind == 'manuais':
        body += manuals_section(data, icon)
    elif kind == 'revisoes':
        body += '<script type="module" src="/maintenance.mjs"></script><!--maintenance:start-->'+(Path(__file__).parent / 'sections/maintenance.html').read_text()+'<!--maintenance:end-->'
        body += '<section class="section owner-revision"><div><p class="owner-kicker">Revisão com preço fixo</p><h2>Conheça o plano.<br>Confirme as condições.</h2><p>O programa Bajaj reúne revisões programadas com valores definidos pela fabricante. Intervalos, itens previstos e condições de uso devem ser conferidos no manual correspondente à sua moto.</p><p>Informe modelo, ano e quilometragem para consultar com a unidade o serviço adequado e o valor vigente antes da visita.</p><div class="actions"><a class="button" href="#atendimento">Solicitar revisão '+icon('arrow')+'</a><a class="text-link" href="/pos-venda/manuais/">Consultar meu manual '+icon('arrow')+'</a></div></div><div class="owner-revision-side">'+media_figure('revisoes', 'owner-content-media', focus='left')+'<aside class="owner-validity"><span class="owner-kicker">Programa oficial atualizado</span><h3>Consulte as sete tabelas.</h3><p>Escolha o modelo e a versão na tabela desta página. A equipe confirma a aplicação das condições à sua moto e à unidade.</p></aside></div></section>'
        body += '<section class="section owner-questions"><div><p class="owner-kicker">Para planejar sua visita</p><h2>Revisão<br>sem dúvida.</h2></div>'+faq([('Como saber a revisão correta?', 'Consulte no manual do seu modelo e ano os intervalos por tempo e quilometragem, observando o que ocorrer primeiro e as condições de uso. A equipe pode ajudar a identificar o serviço.'), ('O valor inclui qualquer reparo?', 'Serviços adicionais, itens de desgaste e situações fora do plano podem ter cobrança própria. Confirme previamente o escopo e as condições com a unidade.'), ('O pedido reserva data e horário?', 'Não. A data informada é uma preferência. A unidade precisa confirmar disponibilidade, serviço e horário antes da sua visita.')])+'</section>'
    body += request_section(data, icon, intent='garantia' if kind in ['garantia', 'manuais'] else 'revisao')
    return '<div class="service-page owner-page">'+body+'</div>', labels[kind], descriptions[kind]


def manuals_section(data, icon):
    models = {m['id']: m for m in data['models']}
    years = sorted({y for item in RESOURCES['manuals'] for y in item['years']}, reverse=True)
    filters = '<form class="owner-manual-filters" data-manual-filters role="search" aria-label="Buscar manual"><div><label for="manual-model">Modelo</label><select id="manual-model" name="modelo"><option value="">Todos os modelos</option>'+''.join(f'<option value="{key}">{esc(m["name"])}</option>' for key, m in models.items())+'</select></div><div><label for="manual-year">Fabricação/modelo</label><select id="manual-year" name="ano"><option value="">Todos os anos disponíveis</option>'+''.join(f'<option>{year}</option>' for year in years)+'</select></div><button class="button outline" type="reset">Limpar filtros '+icon('arrow')+'</button></form>'
    cards = []
    for item in RESOURCES['manuals']:
        m = models[item['model']]
        years_label = ' · '.join(item['years'])
        cards.append(f'<article class="owner-manual-card" data-manual-model="{m["id"]}" data-manual-years="{" ".join(item["years"])}"><figure class="owner-manual-cover">'+media_img(MEDIA['manual_covers'][item['url']], '(max-width:767px) 86vw, (max-width:1150px) 42vw, 28vw')+f'</figure><div class="owner-manual-title"><span class="owner-pdf" aria-hidden="true">PDF</span><div><p>Manual do Proprietário</p><h3>{esc(m["name"])}</h3></div></div><dl><div><dt>Fabricação/modelo</dt><dd>{years_label}</dd></div><div><dt>Origem</dt><dd>Bajaj do Brasil</dd></div></dl>'+external(item['url'], 'Abrir manual em PDF', 'button outline')+'</article>')
    return '<section class="section owner-manuals"><div class="owner-manual-intro"><div><h2>Encontre o arquivo<br>da sua Bajaj.</h2><p>Confira o ano de fabricação/modelo da sua moto. Os vínculos abaixo seguem o catálogo oficial da fabricante, consultado em 30/10/2026.</p></div>'+media_figure('manuais', 'owner-content-media', focus='right')+'</div>'+filters+f'<p class="owner-manual-count" data-manual-count role="status">{len(cards)} documentos disponíveis</p><div class="owner-manual-grid">'+''.join(cards)+'</div><div class="owner-manual-empty" data-manual-empty hidden><h3>Nenhum manual para essa combinação.</h3><p>Não use o arquivo de outro ano ou versão. Solicite orientação à equipe ou consulte o catálogo da fabricante.</p></div><div class="owner-manual-help"><h3>Seu ano ou versão não está na lista?</h3><p>Os anos exibidos são apenas os vinculados pela Bajaj aos documentos acima. A ausência de um ano não autoriza usar outra versão.</p><div class="actions"><a class="text-link" href="#atendimento" data-manual-help>Solicitar orientação de manual '+icon('arrow')+'</a>'+external(RESOURCES['manual_source'],'Ver todos os manuais oficiais')+'</div><p class="fine">Os PDFs abrem no site da fabricante; você pode salvar o arquivo pelo visualizador do navegador. Se um link estiver indisponível, use o catálogo oficial ou solicite orientação.</p></div></section>'
