import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const json=name=>JSON.parse(read(name));
const models=json('data.json').models;
const configs={...json('model-settings.json'),'dominar-400':json('d400-settings.json')};

test('cada contexto de vídeo tem um filme distinto, com autor e modelo conferidos',()=>{
 const sources=json('media-video-sources.json'),ids=[];
 const add=id=>{assert.ok(id);assert.ok(!ids.includes(id),`Filme repetido: ${id}`);ids.push(id);};
 for(const media of Object.values(json('home-hero-media.json')))add(media.youtube||media.src);
 add('qtKc_UTKBgo');add(json('home-closing-media.json').youtube);
 for(const model of models){
  const cfg=configs[model.id];
  assert.ok(cfg.heroYoutube,`Hero sem vídeo: ${model.id}`);
  for(const id of [cfg.heroYoutube,cfg.heroVideo,new URL(cfg.youtubeUrl).searchParams.get('v')].filter(Boolean))add(id);
  const film=sources.find(x=>x.youtube===new URL(cfg.youtubeUrl).searchParams.get('v'));
  assert.equal(film.author,'Bajaj do Brasil');assert.ok(film.title.toLowerCase().includes(model.name.replace('Dominar ','').toLowerCase()));
  const html=read(`public/motos/${model.id}/index.html`);
  assert.match(html,/class="d4-detail-player"[^>]*loading="lazy"/);
  assert.equal(html.includes('<div class="d4-video-card"><img'),false);
 }
 assert.equal(ids.length,20);
});

test('apresentação, galeria, recursos e posters usam originais diferentes, inclusive entre variantes',()=>{
 const photos=json('media-photo-sources.json').placements;
 assert.equal(photos.length,77);assert.equal(new Set(photos.map(p=>p.id)).size,77);
 const closing=json('media-photo-sources.json').closingPoster;assert.ok(closing);assert.ok(!photos.some(p=>p.id===closing.id));
 assert.equal(json('home-closing-media.json').poster,'/assets/'+closing.variants.full.file);
 const heroOriginal='16ZhKm9jm56XlyXlxWWWG8IQ1focSqjOz';
 for(const model of models){
  const cfg=configs[model.id],assets=json(model.id==='dominar-400'?'d400-assets.json':'model-assets.json');
  const body=photos.filter(p=>p.model_id===model.id&&p.use!=='home-poster');
  assert.equal(body.length,1+cfg.gallery.length+cfg.features.length);assert.equal(cfg.gallery.length,6);
  for(const p of body){
   const slot=p.use==='intro'?cfg.intro:cfg[p.use==='gallery'?'gallery':'features'][p.index];
   assert.equal(slot.asset,p.asset);assert.equal(slot.alt,p.alt);
   if(model.id==='dominar-400')assert.notEqual(p.id,heroOriginal);
   assert.ok(read(`public/motos/${model.id}/index.html`).includes('/assets/'+assets[p.asset].large.file));
  }
  if(model.id!=='dominar-250'){
   const poster=photos.find(p=>p.model_id===model.id&&p.use==='home-poster');
   assert.equal(json('home-hero-media.json')[model.id].poster,'/assets/'+assets[poster.asset].large.file);
  }
 }
});
