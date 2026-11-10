"""Apply a reviewed Drive asset plan. Resize proportionally; preserve the complete photograph."""
from pathlib import Path
from PIL import Image, ImageOps
import concurrent.futures, hashlib, json, sys

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets'
plan=json.loads(Path(sys.argv[1]).read_text())['recommendations']
posters=json.loads(Path(sys.argv[2]).read_text())
settings=json.loads((ROOT/'model-settings.json').read_text())
d400_settings=json.loads((ROOT/'d400-settings.json').read_text())
model_assets=json.loads((ROOT/'model-assets.json').read_text())
d400_assets=json.loads((ROOT/'d400-assets.json').read_text())
home_media=json.loads((ROOT/'home-hero-media.json').read_text())

def optimize(row):
    if row.get('is_existing'):
        return row['existing_asset'],None
    slot=row.get('slot','home-poster')
    key=f'refresh-{row["model_id"]}-{slot}'
    source=Path(row['path'])
    assert hashlib.sha256(source.read_bytes()).hexdigest()==row['sha256'],source
    with Image.open(source) as original:
        image=ImageOps.exif_transpose(original)
        image=image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        variants={}
        for label,limit in [('small',800),('large',1600),('full',2400)]:
            variant=image.copy();variant.thumbnail((limit,limit),Image.Resampling.LANCZOS)
            file=f'{key}-{label}.webp';dest=OUT/file;temp=dest.with_suffix('.part')
            variant.save(temp,'WEBP',quality=86,method=4);temp.replace(dest)
            variants[label]={'file':file,'width':variant.width,'height':variant.height}
    return key,variants

records=[]
rows=plan+posters
with concurrent.futures.ThreadPoolExecutor(2) as pool:
    for row,(key,variants) in zip(rows,pool.map(optimize,rows)):
        assets=d400_assets if row['model_id']=='dominar-400' else model_assets
        if variants:assets[key]=variants
        if row['use']=='home-poster':
            home_media[row['model_id']]['poster']='/assets/'+assets[key]['large']['file']
            if row['model_id']=='dominar-ns200':row['alt']='Tanque, assinatura NS200 e conjunto dianteiro da Dominar NS200 branca, em fotografia oficial Bajaj.'
        else:
            cfg=d400_settings if row['model_id']=='dominar-400' else settings[row['model_id']]
            if row['use']=='intro':
                if 'intro' not in cfg:
                    cfg['intro']={'title':'Alma de viajante.<br>Presença de Dominar.','text':'O motor DOHC de 373,27 cc entrega 40 CV, com refrigeração líquida. Do trajeto cotidiano à próxima viagem, a Dominar 400 reúne performance e tecnologia para acompanhar seus planos.','checks':['Quatro modos de pilotagem','Controle de tração eletrônico','Embreagem assistida e deslizante','Painel digital com Bluetooth','Entrada USB']}
                target=cfg['intro']
            else:target=cfg['gallery' if row['use']=='gallery' else 'features'][row['index']]
            target.update(asset=key,alt=row['alt'])
        records.append({k:row[k] for k in ['model_id','use','index','id','name','url','alt','sha256']}|{'asset':key,'newPlacement':not row.get('is_existing',False)})

report={'reviewed':'2026-10-23','placements':records}
if len(sys.argv)>3:
    row=json.loads(Path(sys.argv[3]).read_text());row['slot']='closing-poster'
    key,variants=optimize(row)
    closing=json.loads((ROOT/'home-closing-media.json').read_text());full=variants['full']
    closing.update(poster='/assets/'+full['file'],posterWidth=full['width'],posterHeight=full['height'],posterSrcset=', '.join(f'/assets/{v["file"]} {v["width"]}w' for v in variants.values()))
    (ROOT/'home-closing-media.json').write_text(json.dumps(closing,ensure_ascii=False,indent=2)+'\n')
    report['closingPoster']={k:row[k] for k in ['model_id','id','name','url','alt','sha256']}|{'asset':key,'variants':variants}

for name,data in [('model-settings.json',settings),('d400-settings.json',d400_settings),('model-assets.json',model_assets),('d400-assets.json',d400_assets),('home-hero-media.json',home_media),('media-photo-sources.json',report)]:
    (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'{len(plan)} posições de produto; {sum(not r["is_existing"] for r in plan)} substituições; {len(posters)} novos posters.')
