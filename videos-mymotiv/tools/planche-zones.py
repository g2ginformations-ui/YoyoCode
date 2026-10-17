# Planche de contrôle avec les zones cachées par l'interface TikTok (rouge) et la zone sûre (vert), voir src/tiktok.ts.
# Usage : python3 tools/planche-zones.py "prev/<Comp>-*.png" planche.png
import glob, sys
from PIL import Image, ImageDraw
pat, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(pat), key=lambda f: float(f.split('-')[-1][:-4]))
W, H = 270, 480; n = 6
sheet = Image.new('RGB', (W*n, (H+20)*((len(fs)+n-1)//n)), 'white')
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for box in [(0, 0, 1080, 280), (0, 1440, 1080, 1920), (920, 280, 1080, 1440), (0, 280, 120, 1440)]:
        d.rectangle(box, fill=(255, 0, 0, 70))
    d.rectangle((120, 280, 920, 1440), outline=(0, 255, 0, 255), width=6)
    im = Image.alpha_composite(im, ov).convert('RGB').resize((W, H))
    x = (i % n)*W; y = (i//n)*(H+20)
    sheet.paste(im, (x, y+20)); ImageDraw.Draw(sheet).text((x+4, y+4), f.split('-')[-1][:-4], fill='black')
sheet.save(out)
