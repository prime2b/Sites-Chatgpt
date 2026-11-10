"""Web derivatives from supplied originals. No generated or reconstructed motorcycle pixels."""
from PIL import Image
from pathlib import Path
import json
P=Path(__file__).resolve().parents[1];out=P/'public/assets';manifest={}
sources={'right':'d400-angle3.png','left':'d400-angle7.png','front':'dominar-400.png','panel':'d400-7267.jpg','headlight':'d400-headlight-source.jpg','seat':'d400-7206.jpg','engine':'d400-7189.jpg'}
for key,name in sources.items():
 im=Image.open(P/'raw-assets'/name);im.load()
 if im.mode=='RGBA':
  box=im.getchannel('A').getbbox();im=im.crop(box);padded=Image.new('RGBA',(im.width+160,im.height+160));padded.paste(im,(80,80));im=padded
 sizes={}
 for variant,width in [('full',im.width),('large',min(1800,im.width)),('small',min(900,im.width))]:
  current=im.copy();current.thumbnail((width,99999),Image.Resampling.LANCZOS)
  filename=f'd4-{key}-{variant}.webp';current.save(out/filename,'WEBP',quality=88,method=6)
  sizes[variant]={'file':filename,'width':current.width,'height':current.height}
 if key=='right':im.save(out/'d4-right.png',optimize=True)
 manifest[key]=sizes
# Requested close-ups are literal crops of the supplied right view, never generated detail.
source=Image.open(P/'raw-assets/d400-angle3.png')
for key,box in {'brake':(3250,1470,4850,2870),'fork':(3390,570,4480,1990)}.items():
 im=source.crop(box);sizes={}
 for variant,width in [('full',im.width),('large',min(1800,im.width)),('small',min(900,im.width))]:
  current=im.copy();current.thumbnail((width,99999),Image.Resampling.LANCZOS);filename=f'd4-{key}-{variant}.webp';current.save(out/filename,'WEBP',quality=90,method=6);sizes[variant]={'file':filename,'width':current.width,'height':current.height}
 manifest[key]=sizes
(P/'d400-assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Prepared native-size WebP lightbox assets, responsive variants and PNG hero fallback.')
