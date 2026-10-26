"""Dominar page template. Commercial and technical source of truth remains data.json."""
import json,html
from pathlib import Path
from urllib.parse import quote,urlparse,parse_qs
P=Path(__file__).parent
def esc(value):return html.escape(str(value),quote=True)
def eyebrow(label):
 return '<p class="d4-eyebrow"><span>'+label+'</span></p>'

def product_page(data,icon,cta,money,model_id="dominar-400"):
 m=next(x for x in data['models'] if x['id']==model_id)
 is_d400=model_id=='dominar-400'
 cfg=json.loads((P/'d400-settings.json').read_text()) if is_d400 else json.loads((P/'model-settings.json').read_text())[model_id]
 assets=json.loads((P/('d400-assets.json' if is_d400 else 'model-assets.json')).read_text())
 hero_key=cfg.get('heroAsset','right')
 hero_alt=cfg.get('heroAlt','Dominar 400 Savanna Green, vista completa do lado direito em três quartos')
 intro=cfg.get('intro',{'title':'Alma de viajante.<br>Presença de Dominar.','text':'O motor DOHC de 373,27 cc entrega 40 CV, com refrigeração líquida. Do trajeto cotidiano à próxima viagem, a Dominar 400 reúne performance e tecnologia para acompanhar seus planos.','checks':['Quatro modos de pilotagem','Controle de tração eletrônico','Embreagem assistida e deslizante','Painel digital com Bluetooth','Entrada USB'],'asset':'left','alt':'Dominar 400 Savanna Green, vista completa do lado esquerdo em três quartos'})
 def image(key,alt,cls='',eager=False,png=False,sizes='(max-width:767px) 95vw, 45vw'):
  a=assets[key];large=a['large'];full=a['full'];small=a['small']
  attrs=f'width="{large["width"]}" height="{large["height"]}" alt="{esc(alt)}" decoding="async"'+(' fetchpriority="high"' if eager else ' loading="lazy"')
  variants={v['width']:v['file'] for v in [small,large,full]}
  srcset=', '.join(f'/assets/{file} {width}w' for width,file in variants.items())
  if png and is_d400:return f'<picture class="{cls}"><source type="image/webp" srcset="{srcset}" sizes="(max-width:767px) 95vw, 1000px"><img src="/assets/d4-right.png" {attrs}></picture>'
  return f'<img class="{cls}" src="/assets/{large["file"]}" srcset="{srcset}" sizes="{sizes}" {attrs}>'
 def contact(label='Falar com a BIA',style='white'):
  return cta(label,'vendas',m['id'],'d4-button '+style)
 def digits(value):
  result=''
  for i,c in enumerate(value):
   if c.isdigit():result+=f'<span class="d4-digit-window" style="--digit:{c};--delay:{i*.075:.3f}s"><span>'+''.join(f'<b>{n}</b>' for n in range(10))+'</span></span>'
   else:result+='<span class="d4-punctuation">'+c+'</span>'
  return f'<span aria-hidden="true" class="d4-number">{result}</span><span class="d4-sr">{value}</span>'
 summary=''.join(f'<div><span>{label}</span><strong>{digits(value) if value!="ABS" else value}</strong><small>{unit}</small></div>' for label,value,unit in cfg.get('summary',[('Torque máximo','3,569','kgf.m'),('Cilindrada','373,27','cc'),('Potência','40','cv'),('Freios','ABS','Nas duas rodas'),('Transmissão','6','Velocidades')]))
 gallery=''.join(f'<button type="button" class="d4-gallery-card" data-gallery="{i}" data-full="/assets/{assets[g["asset"]]["full"]["file"]}" aria-label="Ampliar: {esc(g["alt"])}">{image(g["asset"],g["alt"],sizes="(max-width:767px) 95vw, (max-width:1024px) 45vw, 30vw")}<span class="d4-gallery-overlay" aria-hidden="true"><span>+</span></span></button>' for i,g in enumerate(cfg['gallery']))
 mode_selector='<div class="d4-modes" role="radiogroup" aria-label="Conheça os modos de pilotagem">'+''.join(f'<button type="button" role="radio" data-d4-mode="{m["id"]}" aria-checked="{str(m["id"]=="road").lower()}" tabindex="{0 if m["id"]=="road" else -1}">{m["label"]}</button>' for m in cfg['modes'])+'</div><p class="d4-mode-copy" data-d4-mode-copy aria-live="polite">'+(next((mode['description'] for mode in cfg['modes'] if mode['id']=='road'),''))+'</p>'
 features=''.join(f'<article class="d4-feature d4-section {"d4-dark" if i%2 else "d4-light"}"><div class="d4-container d4-feature-grid d4-reveal"><div class="d4-feature-image">{image(f["asset"],f["alt"])}</div><div>{eyebrow("Recurso")}<h3>{f["title"]}</h3><p>{f["text"]}</p>{mode_selector if f.get("modes") else ""}{contact("Falar com um vendedor","white" if i%2 else "solid")}</div></div></article>' for i,f in enumerate(cfg['features']))
 specs={k:list(v) for k,v in m['specs'].items()}
 if is_d400:
  traction=next(row for row in specs['Sistema elétrico'] if row[0]=='Controle de tração');specs['Sistema elétrico'].remove(traction);specs['Chassi']+=[['Freios','ABS nas duas rodas'],traction]
 tabs=''.join(f'<button type="button" role="tab" id="d4-spec-tab-{i}" aria-controls="d4-spec-panel-{i}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}" data-d4-spec="{i}">{name}</button>' for i,name in enumerate(specs))
 panels=''.join(f'<div role="tabpanel" id="d4-spec-panel-{i}" aria-labelledby="d4-spec-tab-{i}" tabindex="0" {"hidden" if i else ""}><dl>'+''.join(f'<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k,v in rows)+'</dl></div>' for i,(name,rows) in enumerate(specs.items()))
 entries=list(range(0,m['price'],500))+[m['price']]
 terms=''.join(f'<button type="button" role="radio" data-d4-term="{n}" aria-checked="{str(n==cfg["initialTerm"]).lower()}" tabindex="{0 if n==cfg["initialTerm"] else -1}">{n}x</button>' for n in [12,24,36,48])
 cities=''.join(f'<button type="button" role="radio" data-d4-city="{u["id"]}" aria-checked="false" tabindex="{0 if i==0 else -1}">{u["short"]}</button>' for i,u in enumerate(data['units']))
 units=''
 for u in data['units']:
  message=f'Olá! Quero agendar um test ride da {m["name"]} na unidade de {u["short"]}.'
  url='https://wa.me/'+u['phone']+'?text='+quote(message,safe='')
  units+=f'<article class="d4-unit"><h3>Bajaj InteriorSP · {u["name"]}</h3><address>{u["address"]}<br>CEP {u["cep"]}</address><p>WhatsApp {u["display"]}</p><div class="d4-actions"><a class="d4-button solid" href="{url}" target="_blank" rel="noopener" data-d4-unit-link="{u["id"]}">Agendar test ride {icon("arrow")}</a><a class="d4-button outline google-maps-link" href="{esc(u["mapsDirections"])}" target="_blank" rel="noopener noreferrer" aria-label="Como chegar à unidade de {u["name"]} pelo Google Maps (abre em nova aba)">Como chegar {icon("maps")}</a></div><small>INTERIORSP MOTOS LTDA · CNPJ {u["cnpj"]}</small></article>'
 main_video_url='https://www.youtube.com/watch?v='+cfg['heroYoutube'] if cfg.get('heroYoutube') else ''
 detail_video_id=parse_qs(urlparse(cfg['youtubeUrl']).query)['v'][0] if cfg['youtubeUrl'] else ''
 video_title=cfg.get('videoTitle',m['name'])
 video_player=f'<iframe class="d4-detail-player" width="1280" height="720" src="https://www.youtube-nocookie.com/embed/{esc(detail_video_id)}?playsinline=1&amp;rel=0" title="Filme oficial · {esc(video_title)}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>' if detail_video_id else ''
 settings={'model':m['id'],'name':m['name'],'price':m['price'],'units':data['units'],'modes':cfg['modes'],'heroVideo':cfg['heroVideo'],'heroYoutube':cfg.get('heroYoutube'),'initialEntry':cfg['initialEntry'],'initialTerm':cfg['initialTerm']}
 video_section=''
 if is_d400:
  video_section=f'''<section id="video" class="d4-section d4-dark"><div class="d4-container d4-reveal"><div class="d4-section-heading">{eyebrow('Assista agora')}<h2>Confira os detalhes<br>da Dominar 400</h2></div><div class="d4-video-card">{video_player}</div><p class="d4-video-note">Reproduza aqui com som e controles. <a href="{esc(cfg['youtubeUrl'])}" target="_blank" rel="noopener">Abrir no YouTube ↗</a></p><div class="d4-film-links"><a href="{esc(main_video_url)}" target="_blank" rel="noopener">Vídeo principal ↗</a><a href="{esc(cfg['additionalVideoUrl'])}" target="_blank" rel="noopener">Mais sobre a Dominar 400 ↗</a></div></div></section>'''
 elif cfg.get('youtubeUrl'):
  video_section=f'''<section id="video" class="d4-section d4-dark"><div class="d4-container d4-reveal"><div class="d4-section-heading">{eyebrow('Filme oficial')}<h2>Conheça a {esc(video_title)}<br>em movimento</h2></div><div class="d4-video-card">{video_player}</div><p class="d4-video-note"><a href="{esc(cfg['youtubeUrl'])}" target="_blank" rel="noopener">Assistir no YouTube ↗</a></p></div></section>'''
 elif cfg.get('localVideo') or cfg.get('heroVideo'):
  video_section=f'''<section id="video" class="d4-section d4-dark"><div class="d4-container d4-reveal"><div class="d4-section-heading">{eyebrow('Filme oficial')}<h2>A {esc(cfg.get('videoTitle',m['name']))}<br>de perto</h2></div><video class="product-local-film" controls playsinline preload="none" poster="{esc(cfg.get('localVideoPoster','/assets/dominar-250-poster.jpg'))}" width="1280" height="720" aria-label="Filme oficial da {esc(cfg.get('videoTitle',m['name']))}"><source src="{esc(cfg.get('localVideo') or cfg['heroVideo'])}" type="video/mp4"></video></div></section>'''
 return f'''<div class="d4-page">
 <section class="d4-hero d4-dark" data-d4-hero data-motion-active="true">
 <div class="d4-hero-media" aria-hidden="true"><video data-d4-video muted loop playsinline preload="none" hidden></video><div class="d4-youtube-background"><div id="d4-youtube-hero"></div></div><div class="d4-video-tint"></div><div class="d4-video-vignette"></div><div class="d4-video-fade"></div></div>
 <div class="d4-showroom" aria-hidden="true"><i></i><i></i><i></i></div><div class="d4-streaks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="d4-outline-word" aria-hidden="true">{cfg.get("outline","DOMINAR")}</div>
 <button type="button" class="d4-motion-toggle" data-d4-motion>Pausar efeitos</button>
 <div class="d4-container d4-hero-inner"><div class="d4-hero-title d4-stage-enter"><h1><span>{m["name"]}</span></h1><nav class="d4-breadcrumb" aria-label="Você está aqui"><a href="/">Início</a><span>/</span><a href="/#motos">Motos</a><span>/</span><span aria-current="page">{m["name"]}</span></nav></div>
 <figure class="d4-motorcycle"><div class="d4-bike-glow" aria-hidden="true"></div>{image(hero_key,hero_alt,'d4-bike',True,True,sizes='(max-width:767px) 95vw, 1000px')}<div class="d4-reflection" aria-hidden="true"><img src="/assets/{assets[hero_key]['large']['file']}" width="{assets[hero_key]['large']['width']}" height="{assets[hero_key]['large']['height']}" alt="" role="presentation"></div><figcaption>{cfg.get("caption","Savanna Green · Imagem ilustrativa. Consulte cores e estoque.")}</figcaption></figure>
 <div class="d4-summary d4-stage-enter" data-d4-summary><p class="d4-label">Especificações técnicas</p><div class="d4-summary-grid">{summary}</div></div>
 <div class="d4-price d4-stage-enter"><span class="d4-label">A partir de</span><strong>{money(m['price'])}</strong><p>À vista. Consulte disponibilidade e condições.</p><div class="d4-actions"><a class="d4-button white" href="#interesse">Eu tenho interesse {icon('arrow')}</a><a class="d4-button outline" href="#test-ride">Agendar test ride {icon('arrow')}</a></div>{f'<a class="d4-film-link" href="{esc(main_video_url)}" target="_blank" rel="noopener">Assistir ao vídeo principal com som ↗</a>' if main_video_url else ""}</div></div></section>
 <section id="apresentacao" class="d4-section d4-dark"><div class="d4-container d4-intro d4-reveal"><div><h2>{intro["title"]}</h2><p>{intro["text"]}</p><ul class="d4-checks">{''.join('<li><span aria-hidden="true">✓</span>'+x+'</li>' for x in intro['checks'])}</ul>{contact()}</div><div class="d4-intro-image">{image(intro['asset'],intro['alt'])}</div></div></section>
 <section id="galeria" class="d4-section d4-light"><div class="d4-container d4-reveal"><div class="d4-section-heading">{eyebrow('Visual marcante')}<h2>Cada detalhe pensado<br>para impressionar</h2><p>Explore a moto em todos os ângulos e descubra como desempenho e design se unem na {m['name']}.</p></div><div class="d4-gallery-grid">{gallery}</div><div class="d4-center-action"><a class="d4-button solid" href="#interesse">Eu tenho interesse {icon('arrow')}</a></div></div></section>
 {video_section}
 <section id="recursos" aria-label="Recursos da {m['name']}">{features}</section>
 <section id="ficha" class="d4-section d4-dark"><div class="d4-container d4-reveal"><div class="d4-section-heading">{eyebrow('Ficha técnica')}<h2>O que está por trás<br>da potência</h2></div><div class="d4-spec-tabs" role="tablist" aria-label="Categorias da ficha técnica">{tabs}</div><div class="d4-spec-panels">{panels}</div><p class="d4-source">Fonte: material oficial Bajaj · Modelo {m["year"]}. Especificações sujeitas a alteração pela fabricante.</p></div></section>
 <section id="interesse" class="d4-section d4-light"><span id="simulacao" class="d4-anchor" aria-hidden="true"></span><div class="d4-container d4-finance-grid d4-reveal"><div>{eyebrow('Simulação')}<h2>Sua Bajaj começa<br>com uma conversa</h2><p>Conte o que você tem em mente. A BIA continua a solicitação de financiamento e a análise de crédito no WhatsApp.</p><p class="d4-fine">Sem cálculo de parcelas aqui: as condições dependem da análise e da proposta apresentada no atendimento.</p>{contact('Prefiro falar direto com a BIA','solid')}</div>
 <form class="d4-finance-card" id="d4-finance"><div class="d4-entry-heading"><label for="d4-entry">Entrada desejada</label><output for="d4-entry" data-d4-entry-value>{money(cfg['initialEntry'])}</output></div><input type="range" id="d4-entry" min="0" max="{len(entries)-1}" step="1" value="{entries.index(cfg['initialEntry'])}" aria-valuetext="{money(cfg['initialEntry'])}"><div class="d4-range-limits"><span>{money(0)}</span><span>{money(m['price'])}</span></div><div class="d4-finance-bar" aria-hidden="true" style="--entry-percent:{cfg['initialEntry']/m['price']*100:.3f}%"><span data-d4-entry-bar></span></div><div class="d4-balance-labels"><span>Entrada <b data-d4-entry-label>{money(cfg['initialEntry'])}</b></span><span>A financiar <b data-d4-balance>{money(m['price']-cfg['initialEntry'])}</b></span></div>
 <fieldset><legend>Prazo desejado</legend><div class="d4-terms" role="radiogroup" aria-label="Prazo desejado">{terms}</div></fieldset><fieldset><legend>Unidade</legend><div class="d4-cities" role="radiogroup" aria-label="Unidade de atendimento">{cities}</div></fieldset><p class="d4-form-error" role="alert" data-d4-error hidden>Escolha Rio Preto ou Bauru para continuar no WhatsApp.</p><button class="d4-button solid" type="submit">Enviar simulação no WhatsApp {icon('arrow')}</button><p class="d4-fine">O WhatsApp abre com a mensagem pronta. Nada é enviado até você tocar em enviar.</p><p class="d4-fallback" data-d4-fallback hidden>Mensagem pronta. <a target="_blank" rel="noopener" data-d4-fallback-link>Continuar no WhatsApp →</a></p></form></div></section>
 <section id="test-ride" class="d4-section d4-dark"><div class="d4-container d4-reveal"><div class="d4-section-heading">{eyebrow('Test ride')}<h2>Sinta a {m["name"]}<br>antes de decidir</h2><p>A equipe confirma disponibilidade, requisitos e horário em Rio Preto ou Bauru.</p></div><div class="d4-units" id="unidades">{units}</div></div></section><script type="application/json" id="d4-data">{json.dumps(settings,ensure_ascii=False)}</script></div>'''
