"""Render fixed mask channels beside the original sprite for visual inspection."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / 'dist' / 'sprites'
OUT = ROOT / 'outputs'
OUT.mkdir(exist_ok=True)
COLORS = {'shirt': (0, 224, 255), 'trim': (255, 64, 220),
          'skin': (255, 211, 44), 'hair': (110, 255, 90)}

for pair in ('a', 'a2', 'b', 'b2', 'c', 'c2', 'd', 'd2', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'):
    sheet = Image.new('RGBA', (1280, 680), '#142833')
    draw = ImageDraw.Draw(sheet)
    for row, mode in enumerate(('portrait', 'goal')):
        base = Image.open(SPRITES / f'player-pair-{pair}-{mode}.png').convert('RGBA')
        marked = base.copy()
        segmentation = Image.new('RGBA', base.size, '#142833')
        for name, color in COLORS.items():
            mask = Image.open(SPRITES / f'player-pair-{pair}-{mode}-{name}.png').convert('RGBA').getchannel('A')
            solid = Image.new('RGBA', base.size, (*color, 255))
            segmentation.paste(solid, (0, 0), mask)
            tint = Image.new('RGBA', base.size, (*color, 105))
            marked.paste(tint, (0, 0), mask)
        y = row * 340 + 20
        for col, image in enumerate((base, marked, segmentation)):
            sheet.alpha_composite(image, (col * 320, y))
        draw.text((970, y + 12), f'{pair.upper()} / {mode}', fill='white')
        for index, (name, color) in enumerate(COLORS.items()):
            draw.rectangle((970, y + 44 + index * 32, 984, y + 58 + index * 32), fill=color)
            draw.text((993, y + 44 + index * 32), name, fill='white')
    sheet.convert('RGB').save(OUT / f'sprite-mask-qa-{pair}.png')
print('16 Masken-Pruefbilder erzeugt.')
