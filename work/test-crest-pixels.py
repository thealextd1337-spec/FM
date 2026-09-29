"""Asset checks for lost engraving, clipping and gaps in recolored artwork."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

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
        coverage += np.rint(load(f'-{channel}')[:,:,3]/255*alpha).astype(int)
    assert np.array_equal(coverage,alpha), f'{ident}: recolor lost pixels or overlapping regions'
    assert np.any((alpha > 0) & (alpha < 255)), f'{ident}: jagged binary alpha'
for ident in ('fra-3','fra-6','eng-6','ger-6','por-2'):
    detail = np.array(Image.open(root/f'{ident}-detail.png'))
    assert np.count_nonzero(detail[:,:,3]) > 30, f'{ident}: missing fine light details'
print('48 pixel assets: no clipped outlines, antialiased edges, exact engraving and complete recolor coverage.')
