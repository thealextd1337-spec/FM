"""Rebuild base cutouts and validate the fixed, hand-reviewed layer PNGs.

The 128 files player-pair-{a,a2,b,b2,c,c2,d,d2,e,f,g,h,i,j,k,l}-{portrait,goal}-{shirt,trim,skin,hair}.png
are source artwork. Edit those PNGs directly; never infer a mask from the colors
of a completed character image.
"""
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / 'dist' / 'sprites'
CHANNELS = ('shirt', 'trim', 'skin', 'hair')
PAIRS = {
    'a': {'portrait': (0, 87, 800, 887), 'goal': (800, -87, 1774, 887)},
    'a2': {'portrait': (0, 87, 800, 887), 'goal': (800, -87, 1774, 887)},
    'b': {'portrait': (0, 0, 610, 768), 'goal': (620, 0, 2048, 768)},
    'b2': {'portrait': (0, 0, 610, 768), 'goal': (620, 0, 2048, 768)},
    'c': {'portrait': (80, 0, 830, 809), 'goal': (840, 0, 1944, 809)},
    'c2': {'portrait': (80, 0, 830, 809), 'goal': (840, 0, 1944, 809)},
    'd': {'portrait': (150, 0, 900, 793), 'goal': (1010, 0, 1880, 793)},
    'd2': {'portrait': (150, 0, 900, 793), 'goal': (1010, 0, 1880, 793)},
    'e': {'portrait': (0, 87, 800, 887), 'goal': (800, -87, 1774, 887)},
    'f': {'portrait': (150, 0, 900, 793), 'goal': (1010, 0, 1880, 793)},
    'g': {'portrait': (0, 0, 610, 768), 'goal': (620, 0, 2048, 768)},
    'h': {'portrait': (150, 0, 900, 793), 'goal': (1010, 0, 1880, 793)},
    'i': {'portrait': (0, 0, 610, 768), 'goal': (620, 0, 2048, 768)},
    'j': {'portrait': (80, 0, 830, 809), 'goal': (840, 0, 1944, 809)},
    'k': {'portrait': (0, 0, 610, 768), 'goal': (620, 0, 2048, 768)},
    'l': {'portrait': (150, 0, 900, 793), 'goal': (1010, 0, 1880, 793)},
}


def cutout(source, box, pair):
    cropped = source.crop(box)
    if pair in ('a', 'a2', 'e'):
        return cropped.resize((320, 320), Image.Resampling.LANCZOS)
    side = max(cropped.size)
    canvas = Image.new('RGBA', (side, side))
    canvas.alpha_composite(cropped, ((side - cropped.width) // 2, (side - cropped.height) // 2))
    return canvas.resize((320, 320), Image.Resampling.LANCZOS)


def validate_masks(pair, mode, base):
    base_alpha = base.getchannel('A')
    solid = []
    for channel in CHANNELS:
        path = SPRITES / f'player-pair-{pair}-{mode}-{channel}.png'
        if not path.is_file():
            raise ValueError(f'Feste Farbmaske fehlt: {path}')
        layer = Image.open(path).convert('RGBA')
        if layer.size != (320, 320):
            raise ValueError(f'Falsche Maskengroesse: {path}')
        red, green, blue, alpha = (layer.getchannel(channel_name) for channel_name in 'RGBA')
        if ImageChops.difference(red, green).getbbox() or ImageChops.difference(red, blue).getbbox():
            raise ValueError(f'Maske muss Graustufen enthalten: {path}')
        if ImageChops.subtract(alpha, base_alpha).getbbox():
            raise ValueError(f'Maske liegt ausserhalb der Figur: {path}')
        binary = alpha.point(lambda value: 255 if value > 128 else 0)
        if binary.histogram()[255] < 500:
            raise ValueError(f'Maske fast leer: {path}')
        solid.append((channel, binary))
    for index, (first_name, first) in enumerate(solid):
        for second_name, second in solid[index + 1:]:
            if ImageChops.multiply(first, second).getbbox():
                raise ValueError(f'Masken ueberlappen: {pair}/{mode}: {first_name}, {second_name}')


for pair, views in PAIRS.items():
    source_name = (f'player-pair-{pair}-blank.png' if pair in 'efghijkl' else
                   f'player-pair-{pair[0]}-alt-blank.png' if pair.endswith('2') else
                   f'player-pair-{pair}-blank-v2.png' if pair in ('b', 'c') else
                   f'player-pair-{pair}-blank.png')
    source = Image.open(SPRITES / source_name).convert('RGBA')
    for mode, box in views.items():
        base = cutout(source, box, pair)
        validate_masks(pair, mode, base)
        base.save(SPRITES / f'player-pair-{pair}-{mode}.png', optimize=True)

print('16 Basisbildpaare erzeugt; 128 feste Farbmasken geprueft und unveraendert.')
