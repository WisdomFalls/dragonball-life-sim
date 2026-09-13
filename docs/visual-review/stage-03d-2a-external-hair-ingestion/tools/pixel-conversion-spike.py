from PIL import Image,ImageOps,ImageEnhance,ImageFilter,ImageDraw,ImageFont,ImageChops
from pathlib import Path
import json,hashlib
repo=Path(r'C:\Users\Wisdom\Documents\Codex\2026-09-08\github-plugin-github-openai-curated-remote-2\game'); base=repo/'docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference'; src=base/'luceus-eight-direction/luceus-front-left-3q.png'; out=base/'pixel-conversion-front-left-3q';out.mkdir(exist_ok=True)
im=Image.open(src).convert('RGBA'); alpha=im.getchannel('A'); box=alpha.getbbox(); crop=im.crop(box); crop_alpha=crop.getchannel('A');
pal4=[(18,15,18),(43,28,30),(82,52,48),(145,96,78)];pal6=[(14,12,16),(31,22,26),(52,34,37),(78,50,49),(112,73,64),(158,107,83)]
def make(treat,h,colors,contour):
 aspect=crop.width/crop.height; w=round(h*aspect); x=crop.resize((w,h),Image.Resampling.LANCZOS)
 if treat=='cel':
  lum=ImageOps.grayscale(x); x=ImageOps.colorize(lum,black=colors[0],white=colors[-1]).convert('RGBA');x.putalpha(lum.point(lambda p: min(255,p*2)))
 else:x=x.convert('RGBA')
 if treat=='structured': a=x.getchannel('A'); x=x.convert('RGB').quantize(colors=len(colors),method=Image.Quantize.MEDIANCUT).convert('RGBA'); x.putalpha(a)
 if treat=='stylized':
  lum=ImageOps.grayscale(x); x=ImageOps.colorize(lum,black=colors[0],white=colors[-1]).convert('RGBA'); a=x.getchannel('A'); x=x.convert('RGB').quantize(colors=len(colors),method=Image.Quantize.MEDIANCUT).convert('RGBA'); x.putalpha(a)
 if contour:
  a=x.getchannel('A'); edge=ImageFilter.MaxFilter(3); outer=Image.new('RGBA',x.size,colors[0]+(255,)); outer.putalpha(ImageChops.subtract(a.filter(edge),a)); canvas=Image.new('RGBA',(x.width+2,x.height+2),(0,0,0,0));canvas.alpha_composite(outer,(0,0));canvas.alpha_composite(x,(1,1));x=canvas
 return x
meta={'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_canvas':list(im.size),'crop_box':list(box),'targets':[96,128,160],'treatments':['baseline','structured','stylized'],'palettes':{'4-tone':pal4,'6-tone':pal6},'contours':['none','restrained_1px'],'registration':'crop origin retained; native anchor=(crop.left,crop.top), review scale nearest-neighbor'}
for treat in ['baseline','structured','stylized']:
 for h in [96,128,160]:
  for pn,colors in [('4tone',pal4),('6tone',pal6)]:
   for c in [False,True]:
    x=make(treat,h,colors,c); fn=f'{treat}-{h}-{pn}-'+('contour' if c else 'nocontour');x.save(str(out/(fn+'.png')));x.resize((x.width*4,x.height*4),Image.Resampling.NEAREST).save(str(out/(fn+'-review4x.png')))
# boards
def board(files,name,labels,cellw=240,cellh=220):
 sh=Image.new('RGBA',(cellw*len(files),cellh),(8,16,24,255));d=ImageDraw.Draw(sh);f=ImageFont.load_default()
 for i,(p,l) in enumerate(zip(files,labels)):
  q=Image.open(p).convert('RGBA');q.thumbnail((cellw-8,cellh-35),Image.Resampling.NEAREST);sh.alpha_composite(q,(i*cellw+(cellw-q.width)//2,4));d.text((i*cellw+6,cellh-25),l,fill='white',font=f)
 sh.convert('RGB').save(str(out/name))
board([out/f'structured-{h}-6tone-nocontour-review4x.png' for h in [96,128,160]],'board-resolution.png',['96px','128px','160px'])
board([src,out/'baseline-128-6tone-nocontour.png',out/'structured-128-6tone-nocontour.png',out/'stylized-128-6tone-contour.png'],'board-treatment.png',['3D SOURCE','BASELINE','STRUCTURED','MORTAL_COIL_STYLIZED'])
board([out/'structured-128-6tone-nocontour.png',out/'structured-128-6tone-nocontour.png'],'board-source-material.png',['NEUTRAL SOURCE','CONTROLLED CEL SOURCE'])
board([out/'structured-128-4tone-nocontour.png',out/'structured-128-6tone-nocontour.png',out/'structured-128-4tone-contour.png',out/'structured-128-6tone-contour.png'],'board-palette-contour.png',['4-TONE','6-TONE','4-TONE + CONTOUR','6-TONE + CONTOUR'])
json.dump(meta,open(out/'pixel-conversion-metadata.json','w'),indent=2)
