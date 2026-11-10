"""Import only reviewed official Bajaj sequences; never run as a scheduled sync.

Run with a Python installation containing Pillow. Original URLs and hashes stay
in official-360-sources.json; visitors receive local WebP images only.
"""
import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
import time
import urllib.request

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def download_frame(task):
    model_id, color, index = task
    url = color['source'] + f'/{index:02d}.png'
    target = ROOT / 'public' / 'assets' / 'spin' / model_id / color['id'] / f'{index:02d}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=40) as response:
                original = response.read()
            with Image.open(io.BytesIO(original)) as image:
                image.load()
                if image.width < 600 or image.height < 350:
                    raise ValueError('Official frame is too small')
                image = image.convert('RGBA')
                image.save(target, 'WEBP', quality=91, method=6)
                dimensions = [image.width, image.height]
            return {
                'model': model_id, 'color': color['id'], 'index': index,
                'src': '/' + str(target.relative_to(ROOT / 'public')),
                'width': dimensions[0], 'height': dimensions[1],
                'sourceSha256': hashlib.sha256(original).hexdigest(),
                'bytes': target.stat().st_size,
            }
        except Exception:
            if attempt == 2:
                raise RuntimeError(f'Unable to import official frame: {url}') from None
            time.sleep(attempt + 1)


def main():
    sources = json.loads((ROOT / 'official-360-sources.json').read_text())
    tasks = [(model_id, color, index)
             for model_id, model in sources['models'].items()
             for color in model['colors'] for index in range(color['count'])]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        for result in executor.map(download_frame, tasks):
            results.append(result)
    manifest = {}
    for model_id, model in sources['models'].items():
        colors = []
        for color in model['colors']:
            frames = sorted((r for r in results if r['model'] == model_id and r['color'] == color['id']),
                            key=lambda r: r['index'])
            dimensions = {(r['width'], r['height']) for r in frames}
            if len(frames) != color['count'] or len(dimensions) != 1:
                raise RuntimeError(f'Incomplete or inconsistent sequence: {model_id}/{color["id"]}')
            if len({r['sourceSha256'] for r in frames}) < len(frames) - 1:
                raise RuntimeError(f'Repeated official frames: {model_id}/{color["id"]}')
            width, height = dimensions.pop()
            colors.append({
                'id': color['id'], 'label': color['label'], 'swatch': color['swatch'],
                'width': width, 'height': height,
                'frames': [r['src'] for r in frames],
            })
        manifest[model_id] = {'name': model['name'], 'colors': colors}
    (ROOT / 'product-360.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    sources['frames'] = results
    (ROOT / 'official-360-sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'models': len(manifest), 'colors': sum(len(m['colors']) for m in manifest.values()),
                      'frames': len(results), 'bytes': sum(r['bytes'] for r in results)}))


if __name__ == '__main__':
    main()
