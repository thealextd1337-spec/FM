"""The artwork rebuild must preserve every hand-reviewed mask byte for byte."""
from hashlib import sha256
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
SPRITES = ROOT / 'dist' / 'sprites'
MASKS = [
    SPRITES / f'player-pair-{pair}-{mode}-{channel}.png'
    for pair in ('a', 'a2', 'b', 'b2', 'c', 'c2', 'd', 'd2', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l')
    for mode in ('portrait', 'goal')
    for channel in ('shirt', 'trim', 'skin', 'hair')
]


def fingerprints():
    return {path.name: sha256(path.read_bytes()).hexdigest() for path in MASKS}


before = fingerprints()
subprocess.run([sys.executable, str(ROOT / 'work' / 'generate-world-sprite-pair-v87.py')],
               cwd=ROOT, check=True)
assert before == fingerprints(), 'Die Basiserzeugung darf feste Farbmasken nicht veraendern.'
print('128 feste Farbmasken bleiben bei erneutem Erzeugen bytegleich.')
