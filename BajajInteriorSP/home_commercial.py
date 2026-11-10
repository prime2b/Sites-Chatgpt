"""Home-only copy and BIA introduction. Commercial product data stays in data.json."""
import json
from html import escape
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import re

ROOT = Path(__file__).parent


def hero_showroom(data, icon, cta):
    models = data['models']
    model = next(item for item in models if item['id'] == 'pulsar-n150')
    copy = json.loads((ROOT / 'home-commercial.json').read_text())
    media = json.loads((ROOT / 'home-hero-media.json').read_text())
    settings = [
        {**{key: item[key] for key in ['id', 'name', 'tag', 'catalogDescription', 'catalogImage', 'catalogWidth', 'catalogHeight']},
         'commercial': copy[item['id']], 'media': media[item['id']]}
        for item in models
    ]
    thumbnails = ''.join(
        f'<button type="button" class="showroom-model" data-hero-index="{i}" aria-pressed="{str(item["id"] == model["id"]).lower()}" aria-label="Mostrar {item["name"]}" aria-controls="hero-slide"><span>{item["name"]}</span><img src="/assets/{item["catalogImage"].replace(".webp", "-small.webp")}" width="{item["catalogSmallWidth"]}" height="405" alt="" role="presentation" loading="lazy" decoding="async" draggable="false"></button>'
        for i, item in enumerate(models)
    )
    contact = cta('Falar com a BIA', 'vendas', model['id'], 'showroom-bia').replace('data-contact=', 'data-hero-contact data-contact=')
    return f'''<section class="showroom-hero" id="inicio" aria-label="Destaques Bajaj InteriorSP" aria-roledescription="carrossel" data-hero-initial="0" data-hero-mode="film" data-hero-unit-ids="{' '.join(unit['id'] for unit in data['units'])}">
    <div class="showroom-stage" id="hero-slide" role="group" aria-roledescription="slide" aria-label="Pulsar N150, 1 de 6">
      <div class="showroom-visual" aria-hidden="true"><div class="showroom-studio"></div><div class="showroom-film" data-hero-film><img data-hero-poster src="/assets/refresh-pulsar-n150-home-poster-large.webp" alt="" role="presentation" width="1280" height="720" fetchpriority="high"><div class="showroom-youtube" data-hero-youtube hidden></div><video data-hero-video muted loop playsinline preload="none" poster="/assets/refresh-pulsar-n150-home-poster-large.webp" tabindex="-1"><source data-src="/assets/brand-film.mp4" type="video/mp4"></video></div><img class="showroom-product" data-hero-product alt="" role="presentation" width="918" height="620" decoding="async" draggable="false" hidden></div>
      <div class="showroom-shade" aria-hidden="true"></div>
      <div class="showroom-content"><p class="showroom-eyebrow">Bajaj InteriorSP</p><div class="showroom-heading-row"><h1 id="hero-heading" data-hero-name>{model['name']}</h1><div class="showroom-navigation"><span class="showroom-counter" data-hero-counter>01 / 06</span><div class="showroom-controls" role="group" aria-label="Navegar pelos destaques"><button type="button" data-hero-previous aria-label="Mostrar modelo anterior">{icon('left')}</button><button type="button" data-hero-next aria-label="Mostrar próximo modelo">{icon('arrow')}</button></div></div></div><p class="showroom-benefit" data-hero-benefit>{escape(copy[model['id']]['headline'])}</p><p class="showroom-description" data-hero-description>{escape(copy[model['id']]['description'])}</p>
        <div class="showroom-bottom"><div class="showroom-actions"><a class="showroom-cta" data-hero-link href="/motos/{model['id']}/">Conhecer a moto {icon('arrow')}</a><a class="showroom-cta secondary" data-hero-simulation data-simulate-model="{model['id']}" href="/financiamento/?modelo={model['id']}#simulacao">Simular minha moto {icon('arrow')}</a>{contact}</div>

        </div>
      </div>
      <button class="showroom-play" data-hero-play type="button">Reproduzir vídeo</button><a class="showroom-watch" data-hero-watch href="https://www.youtube.com/watch?v=6veAFJZqq7Y" target="_blank" rel="noopener">Assistir ao filme oficial ↗</a><p class="showroom-credit" data-hero-credit>Filme oficial Bajaj · Pulsar N150</p>
    </div>
    <div class="showroom-models" role="group" aria-label="Escolha sua Bajaj">{thumbnails}</div><p class="showroom-model-hint">Escolha sua Bajaj nas miniaturas ou use as setas para explorar os seis modelos.</p><p class="visually-hidden" data-hero-announcement aria-live="polite" aria-atomic="true"></p><script type="application/json" id="hero-model-data">{json.dumps(settings, ensure_ascii=False)}</script>
    </section>'''


def _bia_source(value):
    if not isinstance(value, str) or not value:
        raise ValueError('A mídia ativa da BIA precisa de um arquivo aprovado.')
    parsed = urlparse(value)
    if value.startswith('/assets/') and not parsed.netloc and not parsed.query and '..' not in value.split('/'):
        if not (ROOT / 'public' / value.lstrip('/')).is_file():
            raise ValueError('Arquivo de mídia da BIA não encontrado: ' + value)
        return value
    if parsed.scheme == 'https' and parsed.netloc and not parsed.username and not parsed.password:
        return value
    raise ValueError('Use um arquivo de /assets/ ou um endereço HTTPS para a BIA.')


def bia_section(icon, cta, config=None):
    config = config or json.loads((ROOT / 'bia-presentation.json').read_text())
    media = config['media']
    mode = media.get('mode', 'brand')
    if mode not in ('brand', 'image', 'video', 'youtube'):
        raise ValueError('Modo de mídia da BIA inválido.')
    width, height = int(media.get('width', 1200)), int(media.get('height', 1500))
    if not 1 <= width <= 12000 or not 1 <= height <= 12000:
        raise ValueError('Dimensões da mídia da BIA inválidas.')
    brand = f'''<div class="bia-brand-art" data-bia-brand{' hidden' if mode != 'brand' else ''} aria-hidden="true">
      <div class="bia-brand-top"><span>BAJAJ INTERIORSP</span>{icon('chat')}</div>
      <span class="bia-brand-outline">BIA</span><div class="bia-brand-name"><span>PODE ME CHAMAR DE</span><strong>BIA<span>.</span></strong></div>
      <div class="bia-brand-bottom"><span>ASSISTENTE VIRTUAL</span><span>RIO PRETO + BAURU</span></div>
    </div>'''
    content, play = '', ''
    if mode == 'image':
        if not media.get('alt'):
            raise ValueError('Informe a descrição acessível da imagem da BIA.')
        content = f'<img class="bia-media-image" data-bia-image src="{escape(_bia_source(media.get("src")))}" alt="{escape(media["alt"])}" width="{width}" height="{height}" loading="lazy" decoding="async">'
    elif mode in ('video', 'youtube'):
        poster = _bia_source(media.get('poster'))
        content = f'<img class="bia-media-image" data-bia-poster src="{escape(poster)}" alt="{escape(media.get("alt") or "BIA, assistente virtual da Bajaj InteriorSP")}" width="{width}" height="{height}" loading="lazy" decoding="async">'
        title = escape(media.get('title') or 'Apresentação da BIA')
        if mode == 'video':
            source = _bia_source(media.get('src'))
            ext = urlparse(source).path.rsplit('.', 1)[-1].lower()
            if ext not in ('mp4', 'webm'):
                raise ValueError('O vídeo da BIA deve ser MP4 ou WebM.')
            track = f'<track kind="captions" srclang="pt-BR" label="Português" src="{escape(_bia_source(media["captions"]))}" default>' if media.get('captions') else ''
            content += f'<video class="bia-video" data-bia-video id="bia-player" controls muted playsinline preload="none" poster="{escape(poster)}" aria-label="{title}" hidden><source data-src="{escape(source)}" type="video/{ext}">{track}</video>'
            content += '<button type="button" class="bia-sound" data-bia-sound aria-controls="bia-player" aria-label="Ativar áudio da apresentação da BIA" aria-pressed="false" hidden><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg><span data-bia-sound-label>Ativar som</span></button>'
        else:
            video_id = str(media.get('src') or '')
            if not re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
                parsed = urlparse(video_id)
                if parsed.scheme != 'https' or parsed.netloc not in ('www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtu.be'):
                    raise ValueError('Use um vídeo aprovado do YouTube para a BIA.')
                video_id = parsed.path.strip('/') if parsed.netloc == 'youtu.be' else parse_qs(parsed.query).get('v', [''])[0] or parsed.path.rsplit('/', 1)[-1]
            if not re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
                raise ValueError('Identificador de vídeo da BIA inválido.')
            content += f'<div class="bia-video" data-bia-youtube="{video_id}" data-bia-video-title="{title}" id="bia-player" hidden></div>'
        play = '<button type="button" class="bia-play" data-bia-play aria-controls="bia-player"><svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true"><path fill="currentColor" d="m9 5 11 7-11 7Z"/></svg><span>Assistir à apresentação da BIA</span></button>'
    title = escape(config['title']).replace('Prazer, ', 'Prazer, <br>')
    return f'''<section class="section bia-intro" id="vantagens" aria-labelledby="bia-title" data-bia-media-mode="{mode}" data-bia-autoplay="{str(mode == 'video' and bool(media.get('autoplay'))).lower()}">
    <span id="bia" class="bia-anchor" aria-hidden="true"></span>
    <div class="bia-heading"><p class="bia-kicker">{escape(config['kicker'])}</p><h2 id="bia-title">{title}</h2></div>
    <figure class="bia-media{' is-landscape' if width > height else ''}"><div class="bia-stage" style="--bia-ratio:{width}/{height}">{brand}{content}{play}</div><figcaption>{escape(config['signature'])}</figcaption><p class="bia-media-status" data-bia-status role="status" hidden></p></figure>
    <div class="bia-description"><p class="bia-lead">{escape(config['lead'])}</p><p class="bia-copy">{escape(config['description'])}</p><div class="bia-actions">{cta(escape(config['button']), cls='button')}</div><p class="bia-local">{escape(config['unitHint'])}</p></div>
    </section>'''
