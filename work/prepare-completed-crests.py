"""Resize authored individual PNGs and derive the existing three-color crest masks."""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/wappen-completion'
DEST=ROOT/'dist/crests'
assets={}
for club in json.loads((SOURCE/'catalog.json').read_text(encoding='utf-8')):
    source=SOURCE/'source'/f"{club['id'].lower()}.png"
    artwork=Image.open(source).convert('RGBA')
    alpha=np.array(artwork.getchannel('A'))
    assert np.count_nonzero(alpha==0)>alpha.size*.1, f'Transparency: {source}'
    box=artwork.getchannel('A').point(lambda a:255 if a>48 else 0).getbbox()
    assert box
    crop=artwork.crop(box)
    crop.thumbnail((292,300),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(336,336))
    canvas.alpha_composite(crop,((336-crop.width)//2,(336-crop.height)//2))
    pixels=np.array(canvas)
    palette=np.array([tuple(bytes.fromhex(c[1:])) for c in club['palette']])
    distances=((pixels[:,:,:3,None].astype(float)-palette.T)**2).sum(axis=2)
    choices=distances.argmin(axis=2)
    neutral=(pixels[:,:,:3].max(axis=2)<65)&(np.ptp(pixels[:,:,:3].astype(int),axis=2)<35)
    if not (palette.min(axis=1)>175).any():
        neutral|=(pixels[:,:,:3].min(axis=2)>190)&(np.ptp(pixels[:,:,:3].astype(int),axis=2)<45)
    stem='new-'+club['id'].lower()
    canvas.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(DEST/f'{stem}.png',optimize=True)
    outline=Image.new('RGBA',(336,336),'#fff8e8')
    outline.putalpha(canvas.getchannel('A').filter(ImageFilter.MaxFilter(3)))
    outline.save(DEST/f'{stem}-edge.png',optimize=True)
    detail=pixels.copy()
    detail[:,:,3]=np.where(neutral,pixels[:,:,3],0)
    Image.fromarray(detail).quantize(colors=128,method=Image.Quantize.FASTOCTREE).save(DEST/f'{stem}-detail.png',optimize=True)
    for channel in range(3):
        mask=np.full_like(pixels,255)
        mask[:,:,3]=np.where((choices==channel)&~neutral&(pixels[:,:,3]>0),255,0)
        Image.fromarray(mask).save(DEST/f'{stem}-{channel}.png',optimize=True)
    assets[club['id']]=dict(image=f'crests/{stem}.png',edge=f'crests/{stem}-edge.png',detail=f'crests/{stem}-detail.png',masks=[f'crests/{stem}-{j}.png' for j in range(3)],palette=club['palette'],neutralForeground=None,source=f"source/{club['id'].lower()}.png")
assert len(assets)==48
(SOURCE/'manifest.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
p=ROOT/'dist/world-expansion-v161.js'
s=p.read_bytes().decode('utf-8')
start,end='// BEGIN COMPLETED EXPANSION CRESTS','// END COMPLETED EXPANSION CRESTS'
block=start+'\nObject.assign(v61CrestAssets,'+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+');\n'+end
if start in s:
    s=s[:s.index(start)]+block+s[s.index(end)+len(end):]
else:
    s=s.replace('function v161Crest(club,size=44){',block+'\nfunction v161Crest(club,size=44){')
p.write_bytes(s.encode('utf-8'))
print('48 individual crests packaged; 288 PNG assets.')
