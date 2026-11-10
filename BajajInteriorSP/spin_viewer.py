"""Progressively enhanced, self-hosted product rotation section."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent


def spin_viewer(model_id):
    model = json.loads((ROOT / 'product-360.json').read_text())[model_id]
    name = html.escape(model['name'], quote=True)
    first = model['colors'][0]
    colors = ''.join(
        f'<button type="button" class="spin-color" data-spin-color="{i}" '
        f'aria-pressed="{str(i == 0).lower()}" disabled><span class="spin-swatch" '
        f'style="--spin-color:{color["swatch"]}" aria-hidden="true"></span>'
        f'<span>{html.escape(color["label"])}</span></button>'
        for i, color in enumerate(model['colors']))
    return f'''<section class="d4-section d4-light product-spin" id="visualizador-360" data-product-spin aria-labelledby="spin-title">
    <div class="d4-container"><div class="d4-section-heading"><p class="d4-eyebrow"><span>Explore em 360°</span></p>
    <h2 id="spin-title">Veja sua próxima Bajaj<br>de todos os ângulos</h2></div>
    <div class="spin-layout"><div class="spin-showroom"><div class="spin-stage" data-spin-stage tabindex="0" role="group" aria-label="Vista interativa da {name}" aria-describedby="spin-instructions">
    <img data-spin-image src="{first['frames'][0]}" width="{first['width']}" height="{first['height']}" alt="{name} · {html.escape(first['label'])} · vista de produto" loading="lazy" decoding="async" draggable="false">
    <span class="spin-angle" data-spin-angle aria-hidden="true">360°</span></div>
    <div class="spin-controls" data-spin-controls hidden><button type="button" class="spin-step" data-spin-prev aria-label="Girar para a esquerda" disabled>←</button>
    <label class="visually-hidden" for="spin-angle">Ângulo da moto</label><input id="spin-angle" data-spin-range type="range" min="0" max="{len(first['frames'])-1}" value="0" aria-valuetext="0 graus" disabled>
    <button type="button" class="spin-step" data-spin-next aria-label="Girar para a direita" disabled>→</button></div></div>
    <div class="spin-details"><p class="d4-label">{name}</p><h3>O design, por inteiro.</h3>
    <p id="spin-instructions">Ative o giro e arraste para explorar. Você também pode usar as setas ou escolher um ângulo na barra.</p>
    <div class="spin-colors" role="group" aria-label="Cor da moto no visualizador">{colors}</div>
    <button type="button" class="d4-button solid spin-activate" data-spin-activate hidden>Ativar giro 360°</button>
    <p class="spin-status" data-spin-status role="status" aria-live="polite"></p>
    <p class="d4-fine">Imagens oficiais ilustrativas. Consulte configuração, cores e disponibilidade na unidade. As cores exibidas não representam estoque.</p>
    <noscript><p>Esta é uma vista estática. Ative o JavaScript para girar a moto e explorar as cores.</p></noscript></div></div></div>
    <script type="application/json" data-spin-config>{json.dumps(model, ensure_ascii=False)}</script></section>'''
