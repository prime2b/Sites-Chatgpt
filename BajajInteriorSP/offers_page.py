"""The Ofertas body. Shared header, hero and footer are generated unchanged."""
import json
from html import escape
from pathlib import Path

MODELS = [
    ('pulsar-n150', 'Pulsar N150', 'Pulsar', 'Para acompanhar o seu dia.', 16500, 'N150', '150'),
    ('dominar-ns160', 'Dominar NS160', 'Linha NS', 'Atitude em cada caminho.', 19500, 'NS160', '160'),
    ('dominar-ns200', 'Dominar NS200', 'Linha NS', 'Seu ritmo. Sua cidade.', 22500, 'NS200', '200'),
    ('dominar-250', 'Dominar 250', 'Linha Dominar', 'Novas rotas começam aqui.', 23800, 'D250', '250'),
    ('dominar-ns400z', 'Dominar NS400Z', 'Linha NS', 'Pronta para o seu próximo passo.', 26990, 'NS400Z', '400'),
    ('dominar-400', 'Dominar 400', 'Linha Dominar', 'Reimagine suas experiências.', 27490, 'D400', '400'),
]


def offers_body(data, icon, money):
    assets = json.loads(Path(__file__).with_name('offers-assets.json').read_text())
    existing = {m['id']: m for m in data['models']}
    cards, nodes, models = [], [], []
    for index, (id_, name, line, phrase, price, short, number) in enumerate(MODELS):
        assert existing[id_]['name'] == name and existing[id_]['price'] == price
        image = assets[id_]['full']
        thumbnail = assets[id_]['variants'][0]
        srcset = ', '.join(f'/assets/{v["file"]} {v["width"]}w' for v in assets[id_]['variants'] if v['width'] >= 400)
        position = (price - 16500) / (27490 - 16500) * 100
        models.append({'id': id_, 'name': name, 'line': line, 'price': price})
        nodes.append(f'''<a class="offers-ladder-node {'is-above' if index % 2 == 0 else 'is-below'}" href="#{id_}" data-offer-node="{id_}" style="--offer-position:{position:.7f}%" aria-label="Ver {name}, {money(price)}">
          <span class="offers-ladder-dot" aria-hidden="true"></span><span class="offers-ladder-label"><img src="/assets/{thumbnail['file']}" width="{thumbnail['width']}" height="{thumbnail['height']}" alt="" role="presentation" decoding="async"><strong>{short}</strong><span>{money(price)}</span></span></a>''')
        cards.append(f'''<article class="offer-card" id="{id_}" data-offer-card="{id_}" aria-labelledby="offer-title-{id_}">
          <div class="offer-stage"><span class="offer-line">{line}</span><span class="offer-number" aria-hidden="true">{number}</span><img class="offer-bike" src="/assets/{image['file']}" srcset="{srcset}" sizes="(max-width:767px) 70vw, (max-width:1199px) 33vw, 360px" width="{image['width']}" height="{image['height']}" alt="{name}, motocicleta completa em imagem oficial Bajaj" loading="lazy" decoding="async"></div>
          <div class="offer-copy"><h3 id="offer-title-{id_}">{name}</h3><p class="offer-phrase">{phrase}</p><div class="offer-purchase"><span class="offer-from">A partir de</span><strong class="offer-price">{money(price)}</strong><p class="offer-conditions">À vista. Consulte disponibilidade e condições.</p><div class="offer-actions"><a class="offer-button" href="/motos/{id_}/">Conhecer modelo {icon('arrow')}</a><a class="offer-bia" href="/unidades/" data-offer-bia="{id_}" aria-label="Consultar {name} com a BIA">Consultar com a BIA {icon('arrow')}</a></div></div></div>
        </article>''')
    filters = ''.join(f'<button type="button" class="offers-filter" role="radio" aria-checked="{str(i == 0).lower()}" tabindex="{0 if i == 0 else -1}" aria-controls="offers-grid" data-offer-line="{value}">{label} <span>({count})</span></button>' for i, (value, label, count) in enumerate([('all', 'Todos', 6), ('Pulsar', 'Pulsar', 1), ('Linha NS', 'Linha NS', 3), ('Linha Dominar', 'Linha Dominar', 2)]))
    config = json.dumps({'models': models, 'units': [{'id': u['id'], 'phone': u['phone']} for u in data['units']]}, ensure_ascii=False)
    return f'''<div class="offers-catalog" data-offers-catalog>
      <div class="offers-shell">
        <section class="offers-intro" aria-labelledby="offers-heading"><div class="offers-intro-heading"><h2 id="offers-heading">Seis formas de<br>seguir em frente.</h2><p>Preços à vista do catálogo InteriorSP. Consulte cores, configuração e estoque. As condições de financiamento são apresentadas no atendimento.</p></div>
          <div class="offers-controls"><div class="offers-control-top"><div class="offers-lines" role="radiogroup" aria-label="Filtrar modelos por linha">{filters}</div><div class="offers-sort"><span class="offers-control-label" id="offers-sort-label">Ordenar</span><div class="offers-sort-options" role="radiogroup" aria-labelledby="offers-sort-label"><button type="button" role="radio" aria-checked="true" aria-controls="offers-grid" tabindex="0" data-offer-order="asc">Menor preço</button><button type="button" role="radio" aria-checked="false" aria-controls="offers-grid" tabindex="-1" data-offer-order="desc">Maior preço</button></div></div></div>
            <div class="offers-budget"><div class="offers-budget-heading"><label class="offers-control-label" for="offers-budget">Quanto você quer investir?</label><output for="offers-budget" class="offers-budget-value" aria-live="polite" aria-atomic="true">Até <strong data-offer-budget-value>R$ 27.490,00</strong><span> · <span data-offer-count>6 modelos</span></span></output></div>
              <div class="offers-ladder-scroll" role="region" aria-label="Escada de preços dos seis modelos Bajaj" tabindex="0"><div class="offers-ladder"><div class="offers-ladder-track"><div class="offers-ladder-fill" aria-hidden="true"></div>{''.join(nodes)}</div></div></div><p class="offers-ladder-hint">Deslize para ver todos os modelos.</p>
              <input class="offers-range" id="offers-budget" type="range" min="16500" max="27490" step="10" value="27490" aria-valuetext="R$ 27.490,00" aria-controls="offers-grid"><div class="offers-range-limits" aria-hidden="true"><span>R$ 16.500</span><span>R$ 27.490</span></div>
            </div>
          </div>
        </section>
        <section class="offers-results" aria-label="Modelos disponíveis no filtro"><div class="offers-grid" id="offers-grid">{''.join(cards)}</div><div class="offers-empty" data-offers-empty hidden><h2>Nenhum modelo nesse filtro.</h2><p>Aumente o valor de investimento ou escolha outra linha.</p><button class="offer-button" type="button" data-offers-reset>Ver todos os modelos {icon('arrow')}</button></div><p class="offers-contact-status" data-offers-contact-status role="status" hidden>Seu atendimento está pronto. <a data-offers-contact-fallback target="_blank" rel="noopener noreferrer" href="/unidades/">Abrir WhatsApp {icon('arrow')}</a></p></section>
      </div><script type="application/json" id="offers-data">{config}</script>
    </div>'''
