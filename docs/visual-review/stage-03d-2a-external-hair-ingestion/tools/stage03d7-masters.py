from PIL import Image,ImageOps,ImageFilter,ImageChops,ImageDraw,ImageFont
from pathlib import Path
import json,hashlib
repo=Path(r'C:\Users\Wisdom\Documents\Codex\2026-09-08\github-plugin-github-openai-curated-remote-2\game');base=repo/'docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference';srcdir=base/'luceus-eight-direction';out=base/'stage-03d7-luceus-masters';out.mkdir(exist_ok=True)
roles=[(5,7,10),(14,18,24),(28,34,43),(48,57,68),(92,103,116),(157,168,180)];dirs=['front','left','back-left-3q','back','back-right-3q','right','front-right-3q'];records=[]
for n in dirs:
 im=Image.open(srcdir/f'luceus-{n}.png').convert('RGBA');box=im.getchannel('A').getbbox();crop=im.crop(box);h=128;w=round(crop.width*h/crop.height);crop=crop.resize((w,h),Image.Resampling.LANCZOS);a=crop.getchannel('A').point(lambda p:255 if p>=96 else 0);lum=ImageOps.grayscale(crop);q=lum.point(lambda p:0 if p<35 else 1 if p<75 else 2 if p<115 else 3 if p<155 else 4 if p<205 else 5);m=Image.new('RGBA',crop.size,(0,0,0,0));px=m.load();qp=q.load();ap=a.load()
 for y in range(h):
  for x in range(w):px[x,y]=roles[qp[x,y]]+(ap[x,y],)
 edge=a.filter(ImageFilter.MaxFilter(3));co=ImageChops.subtract(edge,a);o=Image.new('RGBA',a.size,roles[0]+(255,));o.putalpha(co);canvas=Image.new('RGBA',(w+2,h+2),(0,0,0,0));canvas.alpha_composite(o);canvas.alpha_composite(m,(1,1));canvas.save(str(out/f'luceus-{n}-master-128.png'));canvas.resize((canvas.width*4,canvas.height*4),Image.Resampling.NEAREST).save(str(out/f'luceus-{n}-master-128-review4x.png'));records.append({'direction':n,'source':str(srcdir/f'luceus-{n}.png'),'output':str(out/f'luceus-{n}-master-128.png'),'crop_box':list(box),'size':list(canvas.size)})
# boards, include existing approved reference
order=['front','front-left-3q','left','back-left-3q','back','back-right-3q','right','front-right-3q'];sh=Image.new('RGBA',(256*4,300*2),(10,14,20,255));d=ImageDraw.Draw(sh);f=ImageFont.load_default()
for i,n in enumerate(order):p=(base/'stage-03d5-luceus-master/luceus-front-left-3q-master-128-review4x.png') if n=='front-left-3q' else out/f'luceus-{n}-master-128-review4x.png';im=Image.open(p).convert('RGBA');im.thumbnail((248,260),Image.Resampling.NEAREST);x=i%4*256+(256-im.width)//2;y=i//4*300;sh.alpha_composite(im,(x,y));d.text((i%4*256+6,y+270),n,fill='white',font=f)
sh.convert('RGB').save(str(out/'luceus-eight-direction-master-board.png'));sh.convert('RGB').save(str(out/'luceus-eight-direction-rotation-strip.png'));json.dump({'order':order,'palette':'natural_black','roles':roles,'masters':records,'approved_reference':'stage-03d5-luceus-master/luceus-front-left-3q-master-128.png'},open(out/'luceus-seven-masters-manifest.json','w'),indent=2)
