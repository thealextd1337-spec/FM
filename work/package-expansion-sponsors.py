"""Extract 36 generated sponsor wordmarks and compact symbols without changing offers."""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/wappen-expansion/sponsors'
DEST = ROOT / 'dist/sprites'
groups = json.loads((SOURCE / 'catalog.json').read_text(encoding='utf-8'))
assets = {}

def fit(art, size, padding):
    bbox = art.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()
    assert bbox, 'Missing sponsor artwork'
    art = art.crop(bbox)
    art.thumbnail((size[0]-2*padding, size[1]-2*padding), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size)
    canvas.alpha_composite(art, ((size[0]-art.width)//2, (size[1]-art.height)//2))
    return canvas

for group, entries in enumerate(groups):
    sheet = Image.open(SOURCE / f'group-{group}.png').convert('RGBA')
    alpha = np.array(sheet.getchannel('A'))
    assert np.count_nonzero(alpha == 0) > alpha.size * .2
    h, w = alpha.shape
    symbols = Image.open(SOURCE / f'group-{group}-symbols.png').convert('RGBA')
    sw,sh = symbols.size
    labels, count = ndimage.label(alpha > 16, structure=np.ones((3,3)))
    areas = np.bincount(labels.ravel())
    significant = [i for i in range(1,count+1) if areas[i] >= 8]
    centers = ndimage.center_of_mass(alpha, labels, significant)
    membership = np.full(count+1,-1,dtype=int)
    for label,(y,x) in zip(significant,centers):
        membership[label] = min(3,int(y*4/h))*3 + min(2,int(x*3/w))
    for i, entry in enumerate(entries):
        region = membership[labels] == i
        assert region.sum() > 1000, entry['name']
        mask = Image.fromarray((region*255).astype('uint8')).filter(ImageFilter.MaxFilter(3))
        isolated = sheet.copy()
        isolated.putalpha(Image.fromarray(np.where(np.array(mask)>0,alpha,0).astype('uint8')))
        box = mask.getbbox()
        wordmark = fit(isolated.crop(box),(480,180),12)
        symbol_box = ((i%3)*sw//3,(i//3)*sh//4,(i%3+1)*sw//3,(i//3+1)*sh//4)
        symbol_art = symbols.crop(symbol_box)
        symbol_alpha = np.array(symbol_art.getchannel('A'))
        parts, part_count = ndimage.label(symbol_alpha > 32, structure=np.ones((3,3)))
        part_areas = np.bincount(parts.ravel())
        threshold = max(40, part_areas[1:].max() * .005)
        keep = (part_areas >= threshold); keep[0] = False
        clean = Image.fromarray((keep[parts]*255).astype('uint8')).filter(ImageFilter.MaxFilter(3))
        symbol_art.putalpha(Image.fromarray(np.where(np.array(clean)>0,symbol_alpha,0).astype('uint8')))
        symbol = fit(symbol_art,(192,192),14)
        stem = 'sponsor-'+entry['id']
        wordmark.save(DEST / f'{stem}.png',optimize=True)
        symbol.save(DEST / f'{stem}-symbol.png',optimize=True)
        assets[entry['id']] = dict(name=entry['name'], image=f'sprites/{stem}.png',
            symbol=f'sprites/{stem}-symbol.png',source=f'group-{group}.png',box=box,
            symbolSource=f'group-{group}-symbols.png',symbolBox=symbol_box)

(SOURCE / 'manifest.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
module = ROOT / 'dist/world-expansion-v161.js'
source = module.read_bytes().decode('utf-8')
start,end = '// BEGIN AUTHORED EXPANSION SPONSORS','// END AUTHORED EXPANSION SPONSORS'
block = start+'\nconst v173SponsorArt='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n'+'''const v173BaseSponsorLogo=v66SponsorLogoSVG;
v66SponsorLogoSVG=function(countryId,sponsor,compact=false){
 const brand=v66SponsorBrand(countryId,sponsor),art=brand&&v173SponsorArt[brand.id];
 if(!art)return v173BaseSponsorLogo(countryId,sponsor,compact);
 const size=compact?192:480,height=compact?192:180;
 return `<svg class="v66-sponsor-logo ${compact?'v97-sponsor-symbol':'v97-sponsor-wordmark'}" data-v66-brand="${brand.id}" viewBox="0 0 ${size} ${height}" translate="no" aria-hidden="true" focusable="false"><image href="${compact?art.symbol:art.image}" width="${size}" height="${height}"/></svg>`;
};
'''+end
if start in source:
    source=source[:source.index(start)]+block+source[source.index(end)+len(end):]
else:
    source=source.replace('function v161Rules(){',block+'\nfunction v161Rules(){')
module.write_bytes(source.encode('utf-8'))
print(f'{len(assets)} individual sponsor wordmarks and compact symbols packaged.')
