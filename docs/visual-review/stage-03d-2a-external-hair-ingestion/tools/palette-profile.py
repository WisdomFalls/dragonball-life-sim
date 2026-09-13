from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,hashlib
repo=Path(r'C:\Users\Wisdom\Documents\Codex\2026-09-08\github-plugin-github-openai-curated-remote-2\game');d=repo/'docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference/stage-03d5-luceus-master';master=Image.open(d/'luceus-front-left-3q-master-128.png').convert('RGBA'); roles=[(8,10,14),(24,27,36),(48,54,68),(82,90,106),(145,151,162),(218,220,224)]
profiles={'natural_black':[(8,9,12),(20,22,28),(36,40,48),(62,68,78),(112,119,130),(174,181,188)],'dark_brown':[(12,8,9),(30,18,18),(57,31,28),(88,50,40),(133,78,57),(184,119,82)],'super_saiyan_gold':[(18,12,4),(54,31,5),(102,65,8),(164,116,18),(218,173,54),(255,229,139)],'super_saiyan_blue':[(5,10,24),(8,24,58),(12,49,108),(24,88,170),(74,150,231),(164,220,255)],'silver_white':[(18,20,26),(44,48,58),(78,84,96),(124,132,145),(190,197,207),(245,248,255)]}
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
