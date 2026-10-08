import pathlib
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(__file__).resolve().parent.parent
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',23)
comparison=Image.new('RGB',(840,510),'#102428');draw=ImageDraw.Draw(comparison)
for i,(file,label) in enumerate([('head-before.png','Bisherige Kopftextur'),('head-after.png','Neue Meshy-Kopftextur')]):
 tile=Image.open(root/'outputs'/file).convert('RGB').crop((365,170,715,555)).resize((420,462),Image.Resampling.LANCZOS)
 comparison.paste(tile,(i*420,48));draw.text((i*420+16,10),label,font=font,fill='#eef5ed')
comparison.save(root/'docs/spieler-nutzer-rig/kopftextur-vergleich.png')
grid=Image.new('RGB',(1440,730),'#102428');draw=ImageDraw.Draw(grid)
clips=[('run_fast4','Schneller Lauf 4'),('run_fast6','Schneller Lauf 6'),('sprint_forward','Sprint mit Vorneigung'),('celebrate_fist','Faustjubel'),('celebrate_arms','Beide Arme hoch'),('celebrate_victory','Siegesjubel')]
for i,(key,label) in enumerate(clips):
 tile=Image.open(root/'outputs'/('head-football-'+key+'.png')).convert('RGB').crop((18,104,1062,790)).resize((480,315),Image.Resampling.LANCZOS)
 x=(i%3)*480;y=(i//3)*365;draw.text((x+16,y+10),label,font=font,fill='#eef5ed');grid.paste(tile,(x,y+45))
grid.save(root/'docs/spieler-nutzer-rig/fussball-animationen.png')
