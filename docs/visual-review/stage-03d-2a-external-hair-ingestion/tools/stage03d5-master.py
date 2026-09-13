from PIL import Image,ImageOps,ImageDraw,ImageFont,ImageChops,ImageFilter
from pathlib import Path
import json,hashlib
repo=Path(r'C:\Users\Wisdom\Documents\Codex\2026-09-08\github-plugin-github-openai-curated-remote-2\game'); base=repo/'docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference'; src=base/'luceus-eight-direction/luceus-front-left-3q.png';out=base/'stage-03d5-luceus-master';out.mkdir(exist_ok=True)
im=Image.open(src).convert('RGBA'); a=im.getchannel('A');box=a.getbbox(); crop=im.crop(box); h=128;w=round(crop.width*h/crop.height); crop=crop.resize((w,h),Image.Resampling.LANCZOS); a=crop.getchannel('A').point(lambda p:255 if p>=96 else 0); lum=ImageOps.grayscale(crop)
roles=[('outline_deepest',(8,10,14)),('deep_occlusion',(24,27,36)),('primary_shadow',(48,54,68)),('base_midtone',(82,90,106)),('primary_highlight',(145,151,162)),('accent_highlight',(218,220,224))]
# quantize luminance into six broad bands
q=lum.point(lambda p: 0 if p<35 else 1 if p<75 else 2 if p<115 else 3 if p<155 else 4 if p<205 else 5)
master=Image.new('RGBA',crop.size,(0,0,0,0));pix=master.load();qp=q.load();ap=a.load()
for y in range(h):
 for x in range(w): pix[x,y]=roles[qp[x,y]][1]+(ap[x,y],)
# restrained 1px outer contour, preserving binary alpha
edge=a.filter(ImageFilter.MaxFilter(3)); contour=ImageChops.subtract(edge,a); canvas=Image.new('RGBA',(w+2,h+2),(0,0,0,0)); outline=Image.new('RGBA',a.size,roles[0][1]+(255,));outline.putalpha(contour);canvas.alpha_composite(outline,(0,0));canvas.alpha_composite(master,(1,1));master=canvas
master.save(str(out/'luceus-front-left-3q-master-128.png'));master.resize((master.width*4,master.height*4),Image.Resampling.NEAREST).save(str(out/'luceus-front-left-3q-master-128-review4x.png'))
# checker review
chk=Image.new('RGBA',master.size,(235,235,235,255));d=ImageDraw.Draw(chk);s=8
for y in range(0,master.height,s):
 for x in range(0,master.width,s):
  if (x//s+y//s)%2: d.rectangle((x,y,x+s-1,y+s-1),fill=(190,190,190,255))
chk.alpha_composite(master);chk.resize((chk.width*4,chk.height*4),Image.Resampling.NEAREST).convert('RGB').save(str(out/'luceus-front-left-3q-master-checker4x.png'))
# palette role visualization
sw=Image.new('RGB',(420,120),'white');d=ImageDraw.Draw(sw);f=ImageFont.load_default()
for i,(n,c) in enumerate(roles):d.rectangle((i*70,0,i*70+69,70),fill=c);d.text((i*70+3,78),str(i+1),fill='black',font=f);d.text((i*70+3,92),n.split('_')[0],fill='black',font=f)
sw.save(str(out/'luceus-six-tone-role-palette.png'))
# comparison board
items=[('3D SOURCE',base/'luceus-eight-direction/luceus-front-left-3q.png'),('03D.4 DETERMINISTIC',base/'pixel-conversion-front-left-3q/baseline-128-6tone-nocontour.png'),('03D.4 STRUCTURED',base/'pixel-conversion-front-left-3q/structured-128-6tone-nocontour.png'),('03D.5 MASTER',out/'luceus-front-left-3q-master-128-review4x.png')];board=Image.new('RGB',(300*4,300),'#101820');d=ImageDraw.Draw(board);f=ImageFont.load_default()
for i,(n,p) in enumerate(items):q=Image.open(p).convert('RGBA');q.thumbnail((290,255),Image.Resampling.NEAREST);board.paste(q.convert('RGB'),(i*300+(300-q.width)//2,5));d.text((i*300+8,270),n,fill='white',font=f)
board.save(str(out/'luceus-front-left-3q-master-comparison.png'))
json.dump({'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'master':'luceus-front-left-3q-master-128.png','height_px':128,'palette_roles':[{'role':n,'rgb':c} for n,c in roles],'contour':'restrained 1 native pixel outer contour','alpha':'binary 0/255','registration':'source crop box retained; canonical front-left-3q anchor preserved','geometry_authority':'luceus-eight-direction source'},open(out/'stage-03d5-master-metadata.json','w'),indent=2)
