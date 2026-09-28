"""Extract the approved trophy sprites from the generated reference sheet."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).with_name("source-sheet.png")
PERSONAL_SOURCE = Path(__file__).with_name("personal-awards-sheet.png")
TEAM_SOURCE = Path(__file__).with_name("team-awards-sheet.png")
MATCH_SOURCE = Path(__file__).with_name("man-of-the-match.png")
NATIONAL_MATCH_SOURCE = Path(__file__).with_name("national-man-of-the-match-sheet.png")
OUTPUT = ROOT / "dist" / "trophies"
PREVIEW = ROOT / "docs" / "trophy-sprites-preview.png"
SMALL_PREVIEW = ROOT / "docs" / "trophy-sprites-small-preview.png"

COUNTRIES = ("eng", "esp", "ita", "ger", "fra", "por")
KINDS = ("league", "cup", "top-scorer", "player-of-season", "man-of-the-match")
TEAM_Y_BOUNDS = (0, 350, 660, 950, 1245, 1545, 1897)
PERSONAL_Y_BOUNDS = (0, 252, 498, 767, 1017, 1272, 1536)
NATIONAL_MATCH_Y_BOUNDS = (0, 500, 965, 1536)
FULL_SIZE = 320
COMPACT_SOURCE_SIZE = 48
SMALL_SIZE = 24


def extract(source: Image.Image, bounds: tuple[int, int, int, int], size: int) -> Image.Image:
    region = source.crop(bounds)
    alpha = region.getchannel("A").point(lambda value: 255 if value >= 96 else 0)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError(f"Empty sprite in {bounds}")
    region = region.crop(bbox)
    alpha = alpha.crop(bbox)
    max_size = size - (12 if size == FULL_SIZE else 4)
    ratio = min(max_size / region.width, max_size / region.height)
    width = max(1, round(region.width * ratio))
    height = max(1, round(region.height * ratio))
    region = region.resize((width, height), Image.Resampling.LANCZOS if size == FULL_SIZE else Image.Resampling.NEAREST)
    alpha = alpha.resize((width, height), Image.Resampling.NEAREST)
    limited = region if size == FULL_SIZE else region.convert("RGB").quantize(colors=31, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert("RGBA")
    limited.putalpha(alpha)
    sprite = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sprite.alpha_composite(limited, ((size - width) // 2, (size - height) // 2))
    # Image generation sometimes leaves detached glow pixels outside the trophy.
    pixels = sprite.load()
    seen: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    for start_y in range(size):
        for start_x in range(size):
            if (start_x, start_y) in seen or pixels[start_x, start_y][3] == 0:
                continue
            stack = [(start_x, start_y)]
            seen.add((start_x, start_y))
            component = []
            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    next_x, next_y = x + dx, y + dy
                    if 0 <= next_x < size and 0 <= next_y < size and (next_x, next_y) not in seen and pixels[next_x, next_y][3]:
                        seen.add((next_x, next_y))
                        stack.append((next_x, next_y))
            components.append(component)
    if components:
        largest = max(components, key=len)
        for component in components:
            if component is largest or len(component) >= (200 if size == FULL_SIZE else 25):
                continue
            for x, y in component:
                pixels[x, y] = (0, 0, 0, 0)
    return sprite


def simplify(sprite: Image.Image) -> Image.Image:
    reduced = sprite.resize((SMALL_SIZE, SMALL_SIZE), Image.Resampling.BOX)
    alpha = reduced.getchannel("A").point(lambda value: 255 if value >= 56 else 0)
    limited = reduced.convert("RGB").quantize(colors=14, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert("RGBA")
    limited.putalpha(alpha)
    return limited


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    personal_source = Image.open(PERSONAL_SOURCE).convert("RGBA")
    team_source = Image.open(TEAM_SOURCE).convert("RGBA")
    match_source = Image.open(MATCH_SOURCE).convert("RGBA")
    national_match_source = Image.open(NATIONAL_MATCH_SOURCE).convert("RGBA")
    if source.size != (1268, 1241):
        raise ValueError(f"Unexpected source size: {source.size}")
    if personal_source.size != (1024, 1536):
        raise ValueError(f"Unexpected personal-awards size: {personal_source.size}")
    if team_source.size != (829, 1897):
        raise ValueError(f"Unexpected team-awards size: {team_source.size}")
    if national_match_source.size != (1024, 1536):
        raise ValueError(f"Unexpected national-match size: {national_match_source.size}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    entries = [(country, kind, column, row) for row, country in enumerate(COUNTRIES) for column, kind in enumerate(KINDS)]
    entries.extend((("eu", "europe", 0, 0), ("eu", "man-of-the-match", 0, 0)))
    preview = Image.new("RGB", (5 * 200, 7 * 225), "#132a30")
    draw = ImageDraw.Draw(preview)
    small_preview = Image.new("RGB", (5 * 160, 7 * 120), "#132a30")
    small_draw = ImageDraw.Draw(small_preview)
    font = ImageFont.load_default()
    for index, (country, kind, column, row) in enumerate(entries):
        if kind == "man-of-the-match" and country == "eu":
            selected_source = match_source
            bounds = (0, 0, match_source.width, match_source.height)
        elif kind == "man-of-the-match":
            country_index = COUNTRIES.index(country)
            medal_column, medal_row = country_index % 2, country_index // 2
            selected_source = national_match_source
            bounds = (medal_column * 512, NATIONAL_MATCH_Y_BOUNDS[medal_row], (medal_column + 1) * 512, NATIONAL_MATCH_Y_BOUNDS[medal_row + 1])
        elif kind in ("top-scorer", "player-of-season"):
            personal_column = 0 if kind == "top-scorer" else 1
            bounds = (personal_column * 512, PERSONAL_Y_BOUNDS[row], (personal_column + 1) * 512, PERSONAL_Y_BOUNDS[row + 1])
            selected_source = personal_source
        elif kind in ("league", "cup"):
            bounds = (column * 414, TEAM_Y_BOUNDS[row], 414 if column == 0 else 829, TEAM_Y_BOUNDS[row + 1])
            selected_source = team_source
        else:
            bounds = (989, 0, 1268, 240)
            selected_source = source
        sprite = extract(selected_source, bounds, FULL_SIZE)
        sprite.save(OUTPUT / f"{country}-{kind}.png", optimize=True)
        small = simplify(extract(selected_source, bounds, COMPACT_SOURCE_SIZE))
        small.save(OUTPUT / f"{country}-{kind}-small.png", optimize=True)
        preview_col = index % 5
        preview_row = index // 5
        x, y = preview_col * 200 + 8, preview_row * 225 + 8
        draw.rounded_rectangle((x, y, x + 184, y + 209), radius=8, fill="#1b3936", outline="#4c695d", width=2)
        preview_sprite = sprite.resize((164, 164), Image.Resampling.LANCZOS)
        preview.paste(preview_sprite, (x + 10, y + 7), preview_sprite)
        draw.text((x + 8, y + 181), f"{country.upper()} · {kind}", font=font, fill="#d9f6a8")
        small_x, small_y = preview_col * 160 + 8, preview_row * 120 + 8
        small_draw.rounded_rectangle((small_x, small_y, small_x + 144, small_y + 104), radius=8, fill="#1b3936", outline="#4c695d", width=2)
        enlarged = small.resize((72, 72), Image.Resampling.NEAREST)
        small_preview.paste(enlarged, (small_x + 8, small_y + 5), enlarged)
        small_preview.paste(small, (small_x + 106, small_y + 25), small)
        small_draw.text((small_x + 8, small_y + 84), f"{country.upper()} · {kind}", font=font, fill="#d9f6a8")
    preview.save(PREVIEW, optimize=True)
    small_preview.save(SMALL_PREVIEW, optimize=True)
    print(f"Saved {len(entries)} full and compact sprites, plus previews")


if __name__ == "__main__":
    main()
