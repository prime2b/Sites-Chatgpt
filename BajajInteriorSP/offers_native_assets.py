"""Keep native PNGs reproducible within the source host's per-object size limit."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CHUNK_SIZE = 4 * 1024 * 1024


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def freeze_native_assets(root=ROOT):
    directory = root / 'source-assets' / 'offers'
    directory.mkdir(parents=True, exist_ok=True)
    index_path = directory / 'index.json'
    previous = json.loads(index_path.read_text()) if index_path.exists() else {}
    manifest = json.loads((root / 'offers-assets.json').read_text())
    entries = {}
    for model, entry in manifest.items():
        filename = entry['full']['file']
        source = root / 'public' / 'assets' / filename
        if not source.exists():
            if filename in previous:
                entries[filename] = previous[filename]
                continue
            raise FileNotFoundError(source)
        if filename in previous and 'published' in previous[filename]:
            known = previous[filename]
            if digest(source) in {known['sha256'], known['published']['sha256']}:
                entries[filename] = known
                continue
        if source.stat().st_size <= CHUNK_SIZE:
            continue
        parts = []
        with source.open('rb') as stream:
            while chunk := stream.read(CHUNK_SIZE):
                name = f'{model}-{len(parts):03d}.part'
                (directory / name).write_bytes(chunk)
                parts.append(name)
        entries[filename] = {'sha256': digest(source), 'bytes': source.stat().st_size, 'parts': parts}
    retained = {name for entry in entries.values() for name in entry['parts']}
    for path in directory.glob('*.part'):
        if path.name not in retained:
            path.unlink()
    index_path.write_text(json.dumps(entries, indent=2) + '\n')
    print(f'Native PNG source: {len(entries)} images, {len(retained)} source parts; pixels unchanged.')


def assemble_native_assets(root=ROOT):
    directory = root / 'source-assets' / 'offers'
    index_path = directory / 'index.json'
    if not index_path.exists():
        return
    for filename, entry in json.loads(index_path.read_text()).items():
        target = root / 'public' / 'assets' / filename
        published = entry.get('published')
        native = root / 'native-build-assets' / filename if published else target
        if not (native.exists() and native.stat().st_size == entry['bytes'] and digest(native) == entry['sha256']):
            pending = native.with_suffix('.assembling')
            pending.parent.mkdir(parents=True, exist_ok=True)
            with pending.open('wb') as output:
                for name in entry['parts']:
                    with (directory / name).open('rb') as source:
                        while chunk := source.read(1024 * 1024):
                            output.write(chunk)
            if pending.stat().st_size != entry['bytes'] or digest(pending) != entry['sha256']:
                pending.unlink()
                raise ValueError(f'Native PNG integrity check failed: {filename}')
            pending.replace(native)
        if published:
            if not (target.exists() and target.stat().st_size == published['bytes'] and digest(target) == published['sha256']):
                from PIL import Image
                pending = target.with_suffix('.assembling')
                with Image.open(native) as image:
                    image.resize((published['width'], published['height']), Image.Resampling.LANCZOS).save(pending, format='PNG', optimize=True, compress_level=9)
                if pending.stat().st_size != published['bytes'] or digest(pending) != published['sha256']:
                    pending.unlink()
                    raise ValueError(f'Published PNG integrity check failed: {filename}')
                pending.replace(target)
            manifest_path = root / 'offers-assets.json'
            manifest = json.loads(manifest_path.read_text())
            changed = False
            for model in manifest.values():
                if model['full']['file'] != filename:
                    continue
                if 'nativeFull' not in model:
                    model['nativeFull'] = dict(model['full'])
                    changed = True
                for variant in [model['full'], *model['variants']]:
                    if variant['file'] == filename and (variant['width'] != published['width'] or variant['height'] != published['height']):
                        variant.update(width=published['width'], height=published['height'])
                        changed = True
            if changed:
                manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'split':
        freeze_native_assets()
    else:
        assemble_native_assets()
