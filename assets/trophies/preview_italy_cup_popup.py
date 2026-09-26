"""Render an illustrative Italian cup victory dialog from the shipped sprite."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "pokal-popup-italien-beispiel.png"
TROPHY = ROOT / "dist" / "trophies" / "ita-cup.png"
FONT = Path("C:/Windows/Fonts/segoeuib.ttf")
FONT_REGULAR = Path("C:/Windows/Fonts/segoeui.ttf")


def face(size, bold=False):
    return ImageFont.truetype(str(FONT if bold else FONT_REGULAR), size)


def centered(draw, text, y, font, fill, width=900):
    bounds = draw.textbbox((0, 0), text, font=font)
    draw.text(((width - (bounds[2] - bounds[0])) / 2, y), text, font=font, fill=fill)


canvas = Image.new("RGBA", (900, 900), "#102126")
draw = ImageDraw.Draw(canvas)

# A subdued career screen behind the modal gives the preview its game context.
draw.rounded_rectangle((55, 42, 845, 136), radius=16, fill="#1c383b")
draw.rounded_rectangle((55, 155, 845, 470), radius=16, fill="#183034")
draw.rounded_rectangle((55, 490, 845, 850), radius=16, fill="#183034")
for x, y, width in ((88, 77, 200), (88, 190, 420), (88, 222, 280), (88, 515, 350)):
    draw.rounded_rectangle((x, y, x + width, y + 11), radius=5, fill="#345557")
veil = Image.new("RGBA", canvas.size, (4, 17, 19, 185))
canvas = Image.alpha_composite(canvas, veil)

shadow = Image.new("RGBA", canvas.size)
s = ImageDraw.Draw(shadow)
s.rounded_rectangle((121, 75, 779, 836), radius=24, fill=(0, 0, 0, 175))
shadow = shadow.filter(ImageFilter.GaussianBlur(26))
canvas = Image.alpha_composite(canvas, shadow)

draw = ImageDraw.Draw(canvas)
draw.rounded_rectangle((128, 64, 772, 826), radius=22, fill="#1a3438", outline="#627d72", width=2)
draw.line((178, 156, 722, 156), fill="#52706a", width=2)
centered(draw, "Herzlichen Glückwunsch!", 93, face(31, True), "#f0f7ef")
centered(draw, "POKALSIEGER", 180, face(48, True), "#e9bd58")
centered(draw, "Nationaler Pokal · Italien · Saison 3", 243, face(20), "#d6e5d9")

trophy = Image.open(TROPHY).convert("RGBA")
trophy = trophy.resize((310, 310), Image.Resampling.NEAREST)
canvas.alpha_composite(trophy, (295, 286))
draw = ImageDraw.Draw(canvas)

# Napoli Sud AC crest follows the existing club crest geometry and colors.
crest_x, crest_y = 400, 601
outline = [(crest_x + 7, crest_y), (crest_x + 93, crest_y),
           (crest_x + 93, crest_y + 55), (crest_x + 83, crest_y + 86),
           (crest_x + 50, crest_y + 104), (crest_x + 17, crest_y + 86),
           (crest_x + 7, crest_y + 55)]
draw.polygon(outline, fill="#ba674d")
draw.line(outline + [outline[0]], fill="#1d2329", width=6, joint="curve")
draw.line((crest_x + 33, crest_y + 12, crest_x + 33, crest_y + 76), fill="#1d2329", width=8)
draw.line((crest_x + 67, crest_y + 12, crest_x + 67, crest_y + 76), fill="#1d2329", width=8)
draw.rounded_rectangle((crest_x + 21, crest_y + 39, crest_x + 79, crest_y + 67), radius=5, fill="#102126")
centered(draw, "NS", crest_y + 40, face(23, True), "#ffffff")
centered(draw, "Napoli Sud AC", 714, face(23, True), "#f0f7ef")

draw.rounded_rectangle((186, 756, 714, 802), radius=9, fill="#c7f36b")
centered(draw, "Weiter zum Spielbericht", 766, face(20, True), "#102126")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
canvas.convert("RGB").save(OUTPUT, optimize=True)
print(OUTPUT)
