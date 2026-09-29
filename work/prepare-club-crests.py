"""Extract the approved boards and fixed color masks. Run after explicit asset-edit approval."""
from pathlib import Path
from collections import deque
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/wappen-entwuerfe'
DEST = ROOT / 'dist/crests'
DEST.mkdir(exist_ok=True)
palette_file = ROOT / 'outputs/crest-palettes.json'
catalog = json.loads(palette_file.read_text(encoding='utf-8')) if palette_file.exists() else [dict(id=ident,palette=data['palette']) for ident,data in json.loads((DEST/'manifest.json').read_text(encoding='utf-8')).items()]
countries = dict(ENG='england', ESP='spanien', ITA='italien', GER='deutschland', FRA='frankreich', POR='portugal')
overrides = {'FRA-1': (0, 0), 'FRA-C1': (1, 0), 'GER-1': (0, 1), 'GER-C1': (1, 1)}
# These open marks contain background counters rather than white heraldic fields.
open_marks = {'ENG-6', 'ESP-3', 'ESP-5', 'ITA-5', 'ITA-6', 'GER-6', 'GER-C1', 'FRA-3', 'FRA-6', 'POR-3', 'POR-6', 'POR-C1'}
previews = []
manifest = {}
for club in catalog:
    ident = club['id']
    if ident in overrides:
        col, row = overrides[ident]
        sheet = Image.open(SOURCE / 'vier-vereine-v2.png').convert('RGB')
        box = (col * 768, row * 512, (col + 1) * 768, 469 if row == 0 else 924)
    else:
        number = int(ident.split('-')[1].replace('C', '')) - 1 + (6 if '-C' in ident else 0)
        col, row = number % 4, number // 4
        sheet = Image.open(SOURCE / (countries[ident[:3]] + '.png')).convert('RGB')
        box = (col * 384, row * 512, (col + 1) * 384, 437 if row == 0 else 895)
        if ident == 'ITA-1': box = (0, 0, 410, 437)
        if ident == 'ITA-2': box = (414, 0, 768, 437)
    rgb = np.array(sheet.crop(box))
    # The boards have a nearly uniform ivory ground. Flood only boundary-connected
    # ground to preserve enclosed white fields and lettering within heraldic shields.
    light = (rgb.min(axis=2) > 226) & ((rgb.max(axis=2).astype(int) - rgb.min(axis=2)) < 35)
    h, w = light.shape
    outside = np.zeros((h, w), dtype=bool)
    queue = deque()
    for x in range(w):
        for y in (0, h-1):
            if light[y,x]: outside[y,x] = True; queue.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if light[y,x] and not outside[y,x]: outside[y,x] = True; queue.append((y,x))
    while queue:
        y,x = queue.popleft()
        for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= yy < h and 0 <= xx < w and light[yy,xx] and not outside[yy,xx]:
                outside[yy,xx] = True; queue.append((yy,xx))
    alpha = np.where(light if ident in open_marks else outside, 0, 255).astype('uint8')
    # Discard tiny fragments from neighboring artwork crossing the sheet's cell edge.
    seen = np.zeros((h,w),dtype=bool)
    for edge_y in range(h):
        for edge_x in (0,w-1):
            if not alpha[edge_y,edge_x] or seen[edge_y,edge_x]: continue
            component=[]; pending=[(edge_y,edge_x)]; seen[edge_y,edge_x]=True
            while pending:
                yy,xx=pending.pop(); component.append((yy,xx))
                for ny,nx in ((yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)):
                    if 0 <= ny < h and 0 <= nx < w and alpha[ny,nx] and not seen[ny,nx]:
                        seen[ny,nx]=True; pending.append((ny,nx))
            if len(component) < np.count_nonzero(alpha)*.08:
                for yy,xx in component: alpha[yy,xx]=0
    coords = np.argwhere(alpha > 0)
    y0,x0 = coords.min(axis=0); y1,x1 = coords.max(axis=0)+1
    rgba = np.dstack((rgb,alpha))[y0:y1,x0:x1]
    picture = Image.fromarray(rgba).convert('RGBA')
    picture.thumbnail((320,320),Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA',(336,336)); canvas.alpha_composite(picture,((336-picture.width)//2,(336-picture.height)//2))
    canvas.save(DEST / (ident.lower()+'.png'), optimize=True)
    # Masks share the exact same geometry as the approved artwork. Assign every
    # opaque pixel to the closest of the three canonical colors in weighted RGB.
    pixels = np.array(canvas)
    palette = np.array([[int(c[i:i+2],16) for i in (1,3,5)] for c in club['palette']], dtype=float)
    distances = ((pixels[:,:,:3,None].astype(float)-palette.T)**2 * np.array([.3,.59,.11])[None,None,:,None]).sum(axis=2)
    choices = distances.argmin(axis=2)
    for channel in range(3):
        mask = np.full_like(pixels,255)
        mask[:,:,3] = np.where(choices == channel,pixels[:,:,3],0)
        Image.fromarray(mask).save(DEST / f'{ident.lower()}-{channel}.png',optimize=True)
    manifest[ident] = {'source': 'vier-vereine-v2.png' if ident in overrides else countries[ident[:3]]+'.png', 'box':box, 'palette':club['palette']}
    previews.append((club,canvas))
(DEST / 'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
contact = Image.new('RGB',(1200,1440),'#183039'); draw=ImageDraw.Draw(contact)
for i,(club,crest) in enumerate(previews):
    x=(i%8)*150; y=(i//8)*240
    large=crest.resize((136,136),Image.Resampling.LANCZOS)
    contact.paste(large,(x+7,y+6),large)
    tiny=crest.resize((19,23),Image.Resampling.LANCZOS)
    contact.paste(tiny,(x+65,y+162),tiny)
    draw.text((x+40,y+200),club['id'],fill='white')
contact.save(ROOT/'outputs/crests-contact.png')
print(f'{len(manifest)} crests and 144 masks generated.')
