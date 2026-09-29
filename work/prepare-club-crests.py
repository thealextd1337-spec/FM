"""Extract the approved boards and fixed color masks. Run after explicit asset-edit approval."""
from pathlib import Path
from collections import deque
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/wappen-entwuerfe'
DEST = ROOT / 'dist/crests'
DEST.mkdir(exist_ok=True)
def save_png(picture, path):
    # Replace complete files atomically while the preview server reads assets.
    temporary=path.with_suffix('.tmp.png')
    picture.save(temporary,optimize=True)
    temporary.replace(path)
palette_file = ROOT / 'outputs/crest-palettes.json'
catalog = json.loads(palette_file.read_text(encoding='utf-8')) if palette_file.exists() else [dict(id=ident,palette=data['palette']) for ident,data in json.loads((DEST/'manifest.json').read_text(encoding='utf-8')).items()]
countries = dict(ENG='england', ESP='spanien', ITA='italien', GER='deutschland', FRA='frankreich', POR='portugal')
overrides = {'FRA-1': (0, 0), 'FRA-C1': (1, 0), 'GER-1': (0, 1), 'GER-C1': (1, 1)}
# Free-standing artwork needs a slightly stronger silhouette on dark game surfaces.
open_marks = {'ENG-2','ENG-4','ENG-6','ENG-C1','ESP-2','ESP-3','ESP-5','ESP-C1','ESP-C2','ITA-1','ITA-5','ITA-6','ITA-C2','GER-6','GER-C1','FRA-1','FRA-3','FRA-6','POR-2','POR-3','POR-6','POR-C1','POR-C2'}
frames = {'ENG-6':'plaque','ESP-5':'shield','ITA-5':'round','GER-6':'hex','FRA-3':'shield','FRA-6':'round','POR-2':'shield','POR-6':'plaque','ESP-C2':'hex','ITA-3':'round','POR-C2':'shield'}

def badge(art, colors, shape):
    """Three club-color rims and a quiet field; artwork keeps its own silhouette."""
    size=1008
    result=Image.new('RGBA',(size,size))
    draw=ImageDraw.Draw(result)
    def layer(inset,color):
        a=inset*3; b=size-a
        if shape=='round': draw.ellipse((a,a,b,b),fill=color)
        elif shape=='plaque': draw.rounded_rectangle((a,186+a*.42,b,822-a*.42),radius=65,fill=color)
        elif shape=='hex': draw.polygon([(size/2,a),(b,a+(b-a)*.25),(b,b-(b-a)*.25),(size/2,b),(a,b-(b-a)*.25),(a,a+(b-a)*.25)],fill=color)
        else: draw.polygon([(a,a),(b,a),(b,a+(b-a)*.63),(a+(b-a)*.84,a+(b-a)*.82),(size/2,b),(a+(b-a)*.16,a+(b-a)*.82),(a,a+(b-a)*.63)],fill=color)
    neutral_colors=[c for c in colors if min(int(c[i:i+2],16) for i in (1,3,5))>145 and max(int(c[i:i+2],16) for i in (1,3,5))-min(int(c[i:i+2],16) for i in (1,3,5))<60]
    field=neutral_colors[0] if neutral_colors else '#fff8e8'
    for inset,color in zip((8,14,18,22),(*colors,field)): layer(inset,color)
    result=result.resize((336,336),Image.Resampling.LANCZOS)
    field_image=Image.new('RGBA',(size,size)); draw=ImageDraw.Draw(field_image)
    layer(22,'white')
    field_image=field_image.resize((336,336),Image.Resampling.LANCZOS)
    motif=art.crop(art.getbbox())
    motif.thumbnail((268,160) if shape=='plaque' else ((208,210) if shape in ('shield','hex') else (240,238)),Image.Resampling.LANCZOS)
    position=((336-motif.width)//2,(326-motif.height)//2)
    result.alpha_composite(motif,position)
    motif_mask=Image.new('L',(336,336)); motif_mask.paste(motif.getchannel('A'),position)
    field_mask=np.array(field_image.getchannel('A')).astype(float)*(1-np.array(motif_mask)/255)
    return result,field_mask>254
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
    # Keep enclosed ivory details (eyes, lettering and negative-space counters).
    # Removing every light pixel erased these details in the first extraction.
    alpha = np.where(outside, 0, 255).astype('uint8')
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
    # Unmat the one-pixel fringe against the board's ivory ground. Recover a local
    # foreground estimate from the opaque interior, then solve coverage instead
    # of retaining pale background-contaminated pixels as fully opaque artwork.
    ground = np.median(rgb[outside],axis=0).astype(float)
    inner = np.array(Image.fromarray(alpha).filter(ImageFilter.MinFilter(5))) > 0
    known = inner.copy(); estimate = rgb.astype(float).copy()
    for step in range(3):
        total = np.zeros_like(estimate); count = np.zeros((h,w))
        for dy,dx in ((-1,0),(1,0),(0,-1),(0,1)):
            valid = np.roll(known,(dy,dx),(0,1))
            if dy == -1: valid[-1,:] = False
            if dy == 1: valid[0,:] = False
            if dx == -1: valid[:,-1] = False
            if dx == 1: valid[:,0] = False
            total += np.roll(estimate,(dy,dx),(0,1))*valid[:,:,None]
            count += valid
        newly = (~known) & (count > 0) & (alpha > 0)
        estimate[newly] = total[newly]/count[newly,None]
        known |= newly
    edge = (alpha > 0) & ~inner & known
    direction = estimate-ground
    coverage = np.clip(((rgb-ground)*direction).sum(axis=2)/np.maximum((direction**2).sum(axis=2),1),0,1)
    # Only modify edges with clear evidence of ivory contamination.
    edge &= (coverage < .98) & (np.linalg.norm(direction,axis=2) > 80)
    alpha[edge] = np.rint(coverage[edge]*255).astype('uint8')
    rgb[edge] = np.clip(estimate[edge],0,255).astype('uint8')
    coords = np.argwhere(alpha > 0)
    y0,x0 = coords.min(axis=0); y1,x1 = coords.max(axis=0)+1
    rgba = np.dstack((rgb,alpha))[y0:y1,x0:x1]
    picture = Image.fromarray(rgba).convert('RGBA')
    picture.thumbnail((320,320),Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA',(336,336)); canvas.alpha_composite(picture,((336-picture.width)//2,(336-picture.height)//2))
    # Normalize the *actual* source pigments to the authoritative club palette.
    # Previously the default PNG bypassed this step entirely, and recoloring used
    # catalog values as if they were the source pigments, producing wrong colors.
    pixels = np.array(canvas)
    palette = np.array([[int(c[i:i+2],16) for i in (1,3,5)] for c in club['palette']], dtype=float)
    # Hue identifies green fabric even when the board painted it much darker
    # than the catalog mint. RGB distance alone incorrectly classified it as navy.
    hsv=np.array(canvas.convert('RGB').convert('HSV')).astype(float)/255
    palette_hsv=np.array(Image.fromarray(palette.astype('uint8')[None,:,:]).convert('HSV'))[0].astype(float)/255
    hue=np.abs(hsv[:,:,0,None]-palette_hsv[:,0]); hue=np.minimum(hue,1-hue)
    distances=4*hue**2 + .25*(hsv[:,:,1,None]-palette_hsv[:,1])**2 + .12*(hsv[:,:,2,None]-palette_hsv[:,2])**2
    rgb_distances=((pixels[:,:,:3,None].astype(float)-palette.T)**2).sum(axis=2)/255**2
    distances=np.where((hsv[:,:,1,None]<.18),rgb_distances,distances)
    choices=distances.argmin(axis=2)
    # Valmy's dark teal lettering is the charcoal secondary color; mint belongs
    # to its frame. Its textured source crosses several hue bins, not regions.
    if ident=='FRA-6': choices[(hsv[:,:,0]>.22)&(hsv[:,:,0]<.70)&(hsv[:,:,2]<.75)]=1
    neutral = (pixels[:,:,:3].min(axis=2) > 180) & (np.ptp(pixels[:,:,:3].astype(int),axis=2) < 48)
    # White/cream is a club color when the palette supplies it; otherwise retain
    # it as a neutral engraving color. It must not consume the closest dark hue.
    lights=(palette.min(axis=1)>145) & (np.ptp(palette,axis=1)<60)
    lightest=int(np.argmax(np.where(lights,palette @ np.array([.2126,.7152,.0722]),-1)))
    if lights.any():
        choices[neutral]=lightest
        neutral[:]=False
    dark_neutral=(pixels[:,:,:3].max(axis=2)<75) & (np.ptp(pixels[:,:,:3].astype(int),axis=2)<30)
    if np.min(palette @ np.array([.2126,.7152,.0722]))>75: neutral |= dark_neutral
    for channel in range(3):
        selected=(choices==channel) & ~neutral & (pixels[:,:,3]>0)
        solid=selected & (pixels[:,:,3]>240)
        if not solid.any(): continue
        pigment=np.median(pixels[:,:,:3][solid],axis=0)
        shading=np.clip((pixels[:,:,:3].astype(float)-pigment)*.25,-8,8)
        pixels[:,:,:3][selected]=np.clip(palette[channel]+shading[selected],0,255).astype('uint8')
    canvas=Image.fromarray(pixels)
    frame=frames.get(ident)
    field_mask=np.zeros((336,336),dtype=bool)
    if frame: canvas,field_mask=badge(canvas,club['palette'],frame)
    else:
        # Some reference drawings omit one of the club's colors. Give that color
        # a narrow trim following the existing crest instead of inventing a motif.
        for channel in range(3):
            if np.count_nonzero((choices==channel)&~neutral&(pixels[:,:,3]>240))>=300: continue
            trim=Image.new('RGBA',(336,336),club['palette'][channel])
            trim.putalpha(canvas.getchannel('A').filter(ImageFilter.MaxFilter(5)))
            trim.alpha_composite(canvas); canvas=trim
    pixels=np.array(canvas)
    distances=((pixels[:,:,:3,None].astype(float)-palette.T)**2).sum(axis=2)
    choices=distances.argmin(axis=2)
    # The quiet ivory field is neutral when absent from the club's own palette.
    neutral=(pixels[:,:,:3].min(axis=2)>180) & (np.ptp(pixels[:,:,:3].astype(int),axis=2)<48) if not lights.any() else np.zeros((336,336),dtype=bool)
    if np.min(palette @ np.array([.2126,.7152,.0722]))>75:
        neutral |= (pixels[:,:,:3].max(axis=2)<75) & (np.ptp(pixels[:,:,:3].astype(int),axis=2)<30)
    neutral |= field_mask
    save_png(canvas,DEST / (ident.lower()+'.png'))
    outline=Image.new('RGBA',(336,336),'#fff8e8')
    outline.putalpha(canvas.getchannel('A').filter(ImageFilter.MaxFilter(3)))
    save_png(outline,DEST / f'{ident.lower()}-edge.png')
    details = pixels.copy(); details[:,:,3] = np.where(neutral,pixels[:,:,3],0)
    save_png(Image.fromarray(details),DEST / f'{ident.lower()}-detail.png')
    for channel in range(3):
        mask = np.full_like(pixels,255)
        # Source artwork supplies its own alpha; masks only select a color region.
        mask[:,:,3] = np.where((choices == channel) & ~neutral & (pixels[:,:,3] > 0),255,0)
        save_png(Image.fromarray(mask),DEST / f'{ident.lower()}-{channel}.png')
    manifest[ident] = {'source': 'vier-vereine-v2.png' if ident in overrides else countries[ident[:3]]+'.png', 'box':box, 'palette':club['palette'],'frame':frame,'neutralForeground':({'FRA-6':1,'ESP-C2':1,'ITA-3':2,'POR-C2':2}.get(ident,0) if frame else None)}
    outline.alpha_composite(canvas)
    previews.append((club,outline))
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
