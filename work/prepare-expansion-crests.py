"""Package six generated transparent 4x4 atlases using the existing crest contract.

Run from the project root after placing country PNGs in docs/wappen-expansion/.
Only extracts/resizes artwork and derives masks; does not redraw the images.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/wappen-expansion'
DEST = ROOT / 'dist/crests'
catalog = json.loads((SOURCE / 'catalog.json').read_text(encoding='utf-8'))
assets = {}

def crest_regions(alpha):
    # Broad wings and wordmarks can cross nominal cell boundaries. Assign whole
    # connected ink regions to their nearest grid center instead of slicing them.
    # Remove one-pixel ink specks linking neighboring outlines before grouping.
    core = ndimage.binary_opening(alpha > 48, structure=np.ones((3, 3)))
    labels, count = ndimage.label(core, structure=np.ones((3, 3)))
    areas = np.bincount(labels.ravel())
    significant = [i for i in range(1, count + 1) if areas[i] >= 50]
    centers = ndimage.center_of_mass(alpha, labels, significant)
    membership = np.full(count + 1, -1, dtype=int)
    h, w = alpha.shape
    for label, (y, x) in zip(significant, centers):
        row, col = min(3, int(y * 4 / h)), min(3, int(x * 4 / w))
        membership[label] = row * 4 + col
    regions = []
    for i in range(16):
        region = membership[labels] == i
        assert region.sum() > 2500, f'Incomplete or connected atlas cell {i + 1}'
        mask = Image.fromarray((region * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7))
        regions.append(mask)
    return regions

for country in ['NED', 'AUT', 'BEL', 'TUR', 'SUI', 'GRE']:
    sheet = Image.open(SOURCE / f'{country.lower()}.png').convert('RGBA')
    alpha = np.array(sheet.getchannel('A'))
    assert np.count_nonzero(alpha == 0) > alpha.size * .15, 'Real transparency required'
    regions = crest_regions(alpha)
    clubs = [c for c in catalog if c['countryId'] == country]
    assert len(clubs) == 16
    for i, club in enumerate(clubs):
        region = regions[i]
        box = region.getbbox()
        isolated = sheet.copy()
        isolated.putalpha(Image.fromarray(np.where(np.array(region) > 0, alpha, 0).astype('uint8')))
        crop = isolated.crop(box)
        # Ignore isolated antialias specks when finding the useful artwork bounds.
        bbox = crop.getchannel('A').point(lambda a: 255 if a > 48 else 0).getbbox()
        assert bbox, club['id']
        crop = crop.crop(bbox)
        crop.thumbnail((292, 300), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (336, 336))
        canvas.alpha_composite(crop, ((336-crop.width)//2, (336-crop.height)//2))
        pixels = np.array(canvas)
        palette = np.array([tuple(bytes.fromhex(c[1:])) for c in club['palette']])
        distances = ((pixels[:, :, :3, None].astype(float) - palette.T)**2).sum(axis=2)
        choices = distances.argmin(axis=2)
        neutral = (pixels[:, :, :3].max(axis=2) < 65) & (np.ptp(pixels[:, :, :3].astype(int), axis=2) < 35)
        # Keep neutral ivory engraving only when ivory is absent from the palette.
        if not (palette.min(axis=1) > 175).any():
            neutral |= (pixels[:, :, :3].min(axis=2) > 190) & (np.ptp(pixels[:, :, :3].astype(int), axis=2) < 45)
        stem = 'new-' + club['id'].lower()
        canvas.save(DEST / f'{stem}.png', optimize=True)
        outline = Image.new('RGBA', (336,336), '#fff8e8')
        outline.putalpha(canvas.getchannel('A').filter(ImageFilter.MaxFilter(3)))
        outline.save(DEST / f'{stem}-edge.png', optimize=True)
        detail = pixels.copy()
        detail[:, :, 3] = np.where(neutral, pixels[:, :, 3], 0)
        Image.fromarray(detail).save(DEST / f'{stem}-detail.png', optimize=True)
        for channel in range(3):
            mask = np.full_like(pixels, 255)
            mask[:, :, 3] = np.where((choices == channel) & ~neutral & (pixels[:, :, 3] > 0), 255, 0)
            Image.fromarray(mask).save(DEST / f'{stem}-{channel}.png', optimize=True)
        assets[club['id']] = dict(image=f'crests/{stem}.png', edge=f'crests/{stem}-edge.png',
            detail=f'crests/{stem}-detail.png', masks=[f'crests/{stem}-{j}.png' for j in range(3)],
            palette=club['palette'], neutralForeground=None, source=f'{country.lower()}.png', box=box)

(SOURCE / 'manifest.json').write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding='utf-8')
module = ROOT / 'dist/world-expansion-v161.js'
source = module.read_bytes().decode('utf-8')
start, end = '// BEGIN AUTHORED EXPANSION CRESTS', '// END AUTHORED EXPANSION CRESTS'
block = start + '\nObject.assign(v61CrestAssets,' + json.dumps(assets, ensure_ascii=False, separators=(',', ':')) + ');\n' + end
if start in source:
    source = source[:source.index(start)] + block + source[source.index(end)+len(end):]
else:
    source = source.replace('function v161Crest(club,size=44){', block + '\nfunction v161Crest(club,size=44){')
module.write_bytes(source.encode('utf-8'))
print(f'{len(assets)} crests and their color masks packaged.')
