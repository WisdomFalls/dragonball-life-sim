from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,hashlib
repo=Path(r'C:\Users\Wisdom\Documents\Codex\2026-09-08\github-plugin-github-openai-curated-remote-2\game');d=repo/'docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference/stage-03d5-luceus-master';master=Image.open(d/'luceus-front-left-3q-master-128.png').convert('RGBA'); roles=[(8,10,14),(24,27,36),(48,54,68),(82,90,106),(145,151,162),(218,220,224)]
profiles={'natural_black':[(5,7,10),(14,18,24),(28,34,43),(48,57,68),(92,103,116),(157,168,180)],'dark_brown':[(14,8,8),( 30,18,16),(58,31,25),(91,50,36),(139,79,51),(191,121,76)],'super_saiyan_gold':[(28,13,3),(74,35,4),(128,67,5),(188,111,9),(232,170,35),(255,224,112)],'super_saiyan_blue':[(4,8,24),(7,20,58),(10,42,112),(18,78,170),(50,137,220),(142,220,255)],'silver_white':[(18,20,26),(44,48,58),(78,84,96),(124,132,145),(190,197,207),(245,248,255)]}
for name,pal in profiles.items():
 out=Image.new('RGBA',master.size,(0,0,0,0)); src=master.load();dst=out.load()
 for y in range(master.height):
  for x in range(master.width):
   r,g,b,a=src[x,y]; idx=min(range(6),key=lambda i:sum((roles[i][j]-[r,g,b][j])**2 for j in range(3)));dst[x,y]=pal[idx]+(a,)
 out.save(str(d/f'luceus-{name}-128.png')); out.resize((512,512),Image.Resampling.NEAREST).save(str(d/f'luceus-{name}-128-review4x.png'))
# board
names=list(profiles); sh=Image.new('RGBA',(512*5,560),(10,14,20,255));dr=ImageDraw.Draw(sh);f=ImageFont.load_default()
for i,n in enumerate(names):q=Image.open(d/f'luceus-{n}-128-review4x.png');sh.alpha_composite(q,(i*512,0));dr.text((i*512+12,525),n.replace('_',' ').upper(),fill='white',font=f)
sh.convert('RGB').save(str(d/'luceus-palette-profile-comparison.png'))
meta={'master_source':'luceus-front-left-3q-master-128.png','profiles':{n:{'roles':pal,'output':f'luceus-{n}-128.png'} for n,pal in profiles.items()},'mapping':'exact role-color substitution; alpha and coordinates preserved'};json.dump(meta,open(d/'hair-palette-profiles.json','w'),indent=2)

