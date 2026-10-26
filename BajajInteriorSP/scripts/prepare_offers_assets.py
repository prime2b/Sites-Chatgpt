"""Keep native-resolution official transparent PNGs plus responsive PNG variants."""
import json
import sys
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = Path(sys.argv[1])
ASSETS = ROOT / 'dist' / 'assets'
Image.MAX_IMAGE_PIXELS = None
manifest_path = ROOT / 'offers-assets.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
selected = sys.argv[2:] or ['pulsar-n150', 'dominar-ns160', 'dominar-ns200', 'dominar-250', 'dominar-ns400z', 'dominar-400']
for model in selected:
    source = ROOT / 'dist/assets/d4-right.png' if model == 'dominar-400' else ORIGINALS / f'{model}.png'
    with Image.open(source) as original:
        native_size = list(original.size)
        image = original.convert('RGBA')
    # The approved D250 crop removes only its distant, almost transparent floor shadow.
    bounds = (150, 86, 894, 631) if model == 'dominar-250' else image.getchannel('A').getbbox()
    if not bounds:
        raise ValueError(f'Empty image: {model}')
    image = image.crop(bounds)
    padding = max(12, round(max(image.size) * .025))
    canvas = Image.new('RGBA', (image.width + padding * 2, image.height + padding * 2))
    canvas.paste(image, (padding, padding))
    del image
    # Discard RGB data that is fully invisible, preserving alpha and every visible pixel.
    transparent = canvas.getchannel('A').point(lambda alpha: 255 if alpha == 0 else 0)
    canvas.paste((0, 0, 0, 0), (0, 0, canvas.width, canvas.height), transparent)
    del transparent
    variants = []
    for width in [160, 400, 800, 1600, canvas.width]:
        if width > canvas.width or any(v['width'] == width for v in variants):
            continue
        name = f'offers-{model}.png' if width == canvas.width else f'offers-{model}-{width}.png'
        resized = canvas if width == canvas.width else canvas.resize((width, round(canvas.height * width / canvas.width)), Image.Resampling.LANCZOS)
        destination = ASSETS / name
        temporary = destination.with_suffix('.pending')
        resized.save(temporary, format='PNG', optimize=True, compress_level=9)
        with Image.open(temporary) as written:
            written.verify()
        temporary.replace(destination)
        variants.append({'file': name, 'width': resized.width, 'height': resized.height})
    manifest[model] = {'originalSize': native_size, 'variants': variants, 'full': variants[-1]}
    print(model, native_size, 'native PNG', canvas.size, flush=True)
    del canvas
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
subprocess.run([sys.executable, str(ROOT / 'offers_native_assets.py'), 'split'], check=True)
