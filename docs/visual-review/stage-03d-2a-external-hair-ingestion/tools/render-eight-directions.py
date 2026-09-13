import bpy,json,math,hashlib
from pathlib import Path
from mathutils import Vector
repo=Path(r'C:\Users\Wisdom\Documents\Codex\2026-09-08\github-plugin-github-openai-curated-remote-2\game'); base=repo/'docs/visual-review/stage-03d-2a-external-hair-ingestion/external-specimens/derived-reference'; src=base/'tryzick-hum015-luceus-inspection.blend'; out=base/'luceus-eight-direction';out.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(src));o=bpy.data.objects.get('HAIR_Top');assert o and len(o.data.vertices)==2610 and len(o.data.polygons)==2558
for x in bpy.data.objects:x.hide_render=not(x==o)
pts=[o.matrix_world@Vector(c) for c in o.bound_box];mn=Vector((min(v.x for v in pts),min(v.y for v in pts),min(v.z for v in pts)));mx=Vector((max(v.x for v in pts),max(v.y for v in pts),max(v.z for v in pts)));target=Vector(((mn.x+mx.x)/2,(mn.y+mx.y)/2,(mn.z+mx.z)/2)); extent=max(mx.x-mn.x,mx.y-mn.y,mx.z-mn.z); scale=extent*1.35
cd=bpy.data.cameras.new('MC_CANONICAL_ORTHO');cam=bpy.data.objects.new('MC_CANONICAL_ORTHO',cd);bpy.context.scene.collection.objects.link(cam);cd.type='ORTHO';cd.ortho_scale=scale;bpy.context.scene.camera=cam
D=[('front',0),('front-left-3q',45),('left',90),('back-left-3q',135),('back',180),('back-right-3q',225),('right',270),('front-right-3q',315)]
for name,yaw in D:
 a=math.radians(yaw);cam.location=target+Vector((-math.sin(a)*3,-math.cos(a)*3,0));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();sc=bpy.context.scene;sc.render.engine='BLENDER_WORKBENCH';sc.render.resolution_x=384;sc.render.resolution_y=384;sc.render.resolution_percentage=100;sc.render.film_transparent=True;sc.display.shading.light='STUDIO';sc.display.shading.color_type='MATERIAL';sc.render.filepath=str(out/f'luceus-{name}.png');bpy.ops.render.render(write_still=True)
manifest={'specimen_id':'tryzick-hum015-luceus','source_blend':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'resolution':[384,384],'projection':'orthographic','canonical_head_origin':[target.x,target.y,target.z],'orthographic_scale':scale,'camera_elevation':0,'directions':[{'id':n,'yaw_degrees':y,'output':str(out/f'luceus-{n}.png')} for n,y in D],'geometry':{'object':'HAIR_Top','vertices':2610,'polygons':2558},'production_mode':'COMPLETE','provenance':'fan_resource_permitted'}
json.dump(manifest,open(out/'luceus-eight-direction-manifest.json','w'),indent=2)
