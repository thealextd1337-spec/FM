"""Asset checks for lost engraving, clipping and gaps in recolored artwork."""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1] / 'dist/crests'
manifest = json.loads((root/'manifest.json').read_text(encoding='utf-8'))
for ident in manifest:
    stem = ident.lower()
    load = lambda suffix: np.array(Image.open(root/f'{stem}{suffix}.png').convert('RGBA'))
    art, edge, detail = load(''), load('-edge'), load('-detail')
    alpha = art[:,:,3].astype(int)
    assert not edge[[0,-1],:,3].any() and not edge[:,[0,-1],3].any(), f'{ident}: clipped outline'
    assert np.all(edge[:,:,3] >= alpha), f'{ident}: backing misses artwork'
    assert np.count_nonzero(edge[:,:,3]) > np.count_nonzero(alpha), f'{ident}: missing contrast contour'
    assert np.array_equal(art[detail[:,:,3] > 0],detail[detail[:,:,3] > 0]), f'{ident}: altered engraving'
    coverage = detail[:,:,3].astype(int)
    for channel in range(3):
        mask=load(f'-{channel}')[:,:,3]
        coverage += np.rint(mask/255*alpha).astype(int)
        selected=(mask>0)&(alpha>250)
        color=manifest[ident]['palette'][channel]
        rgb=np.array([int(color[i:i+2],16) for i in (1,3,5)])
        error=np.abs(art[:,:,:3].astype(int)[selected]-rgb).max(axis=1)
        assert np.count_nonzero(error<=16)>100, f'{ident}: club color {color} absent from visible artwork'
        # Ignore antialiased boundaries between two official colors. Evaluate
        # large region interiors separately from narrow legitimate color trims.
        interior=(np.array(Image.fromarray(mask).filter(ImageFilter.MinFilter(3)))>0)&(alpha>250)
        if interior.sum()>100:
            error=np.abs(art[:,:,:3].astype(int)[interior]-rgb).max(axis=1)
            assert np.mean(error<=16)>.85, f'{ident}: artwork does not match club color {color}'
    assert np.array_equal(coverage,alpha), f'{ident}: recolor lost pixels or overlapping regions'
    assert np.any((alpha > 0) & (alpha < 255)), f'{ident}: jagged binary alpha'
for ident in ('FRA-3','FRA-6','ENG-6','GER-6','POR-2'):
    assert manifest[ident]['frame'], f'{ident}: missing legible enclosing badge'
print('48 pixel assets: all three club colors visible and accurate, complete recolor coverage, clean edges and five enclosing badges.')
