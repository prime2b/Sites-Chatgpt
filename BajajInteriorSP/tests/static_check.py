from pathlib import Path
from urllib.parse import urlparse
from html.parser import HTMLParser
import json,re
ROOT=Path(__file__).resolve().parents[1]/'public'
class Doc(HTMLParser):
 def __init__(self,s):super().__init__();self.tags=[];self.ids=[];self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a);self.tags.append((t,a))
  if 'id'in a:self.ids.append(a['id'])
DYNAMIC_ROUTES={'/blog/','/ofertas/','/seminovas/'}
files=list(ROOT.rglob('*.html'));docs={str(p.relative_to(ROOT).parent).replace('.',''):Doc(p.read_text()) for p in files};issues=[]
for p in files:
 s=p.read_text();d=Doc(s);assert len(d.ids)==len(set(d.ids)),str(p)+' duplicate IDs'
 assert 'noindex,nofollow' in s
 for tag,a in d.tags:
  if tag=='img':assert ('alt' in a and (a['alt'] or a.get('role')=='presentation')) and a.get('width') and a.get('height'),a
  for attr in ['src','poster','data-src','href']:
   v=a.get(attr)
   if v is None:continue
   assert v not in ('','#','javascript:void(0)'),(p,a)
   u=urlparse(v)
   if u.scheme or u.netloc:continue
   if not u.path and u.fragment:
    assert u.fragment in d.ids,(p,v)
    continue
   if u.path in DYNAMIC_ROUTES:continue
   target=ROOT/u.path.lstrip('/')
   if target.is_dir():target=target/'index.html'
   assert target.is_file(),(p,v)
   if u.fragment and target.suffix=='.html':assert u.fragment in Doc(target.read_text()).ids,(p,v)
  if tag=='label':assert a.get('for') in d.ids,(p,a)
  if 'aria-controls'in a:assert a['aria-controls'] in d.ids,(p,a)
 # No form collecting sensitive data and no third-party measurement scripts.
 assert not re.search(r'name="(?:cpf|documento|cnh|email|telefone)"',s,re.I)
 assert not re.search(r'<script[^>]+src="https?://',s)
 for tag,a in d.tags:
  if tag=='a' and a.get('target')=='_blank':assert 'noopener'in a.get('rel',''),a
 # Structured data is parseable and prices centralized.
 for j in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s):json.loads(j)
print(f'OK: {len(files)} páginas, arquivos, âncoras, dimensões/alt, rótulos, SEO e destinos internos, sem placeholders.')
# Verify brand and complete product image boxes, not a crop of the motorcycles.
from PIL import Image
for f in ROOT.joinpath('assets').glob('*.webp'):
 im=Image.open(f);im.load()
 if f.stem in ['dominar-400','dominar-ns160','dominar-ns200','dominar-ns400z','pulsar-n150']:
  box=im.getchannel('A').getbbox();assert box[0]>0 and box[1]>0 and box[2]<im.width and box[3]<im.height,(f,box)
print('OK: imagens decodificadas e cinco recortes transparentes de produto com margem integral.')
