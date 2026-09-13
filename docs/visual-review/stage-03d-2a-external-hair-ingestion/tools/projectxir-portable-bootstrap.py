import bpy,sys,os,json
from pathlib import Path
addon=Path(os.environ['BLENDER_USER_SCRIPTS'])/'addons'; sys.path.insert(0,str(addon))
import importlib.util
p=addon/'Project XIR'/'__init__.py'; spec=importlib.util.spec_from_file_location('Project_XIR',str(p),submodule_search_locations=[str(p.parent)]); m=importlib.util.module_from_spec(spec);sys.modules['Project_XIR']=m;spec.loader.exec_module(m);m.register()
print(json.dumps({'blender':bpy.app.version_string,'scripts':bpy.utils.user_resource('SCRIPTS'),'addons':str(addon),'module':'Project_XIR','operator':hasattr(bpy.ops,'xenoverse_ir') and hasattr(bpy.ops.xenoverse_ir,'emd')}))

