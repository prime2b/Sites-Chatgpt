"""Optimize supplied Drive photos without cropping or reconstruction. Originals stay outside dist."""
from PIL import Image,ImageOps
from pathlib import Path
import json,sys,concurrent.futures
P=Path(__file__).resolve().parents[1];raw=Path(sys.argv[1]);out=P/'dist/assets'
photos=json.loads((P/'source-model-photos.json').read_text());data=json.loads((P/'data.json').read_text())
def process(photo):
 key=photo['key'];im=ImageOps.exif_transpose(Image.open(raw/(key+'.jpg'))).convert('RGB');result={}
 for label,max_side in [('small',800),('large',1600),('full',2400)]:
  variant=im.copy();variant.thumbnail((max_side,max_side),Image.Resampling.LANCZOS);file=f'product-{key}-{label}.webp';variant.save(out/file,'WEBP',quality=86,method=4)
  result[label]={'file':file,'width':variant.width,'height':variant.height}
 return key,result
assets=dict(concurrent.futures.ThreadPoolExecutor(3).map(process,[p for rows in photos.values() for p in rows]))
for m in data['models']:
 if m['id']=='dominar-400':continue
 file=m['catalogImage'] if m['id']=='dominar-250' else m['image'];im=Image.open(out/file);v={'file':file,'width':im.width,'height':im.height};assets[m['id']+'-hero']={k:v for k in ['small','large','full']}
cover=out/'family-ns-poster.jpg'
if cover.exists():
 im=Image.open(cover);v={'file':cover.name,'width':im.width,'height':im.height};assets['family-ns-cover']={label:v for label in ['small','large','full']}
(P/'model-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n');print('OK:',len(assets),'grupos de imagens oficiais.')
