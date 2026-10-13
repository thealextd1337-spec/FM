"""Render the master GLB rest pose (front/side/back) for visual reference. Background Blender only."""
import bpy, pathlib, sys, math, bmesh
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[4]
argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
src=pathlib.Path(argv[0]) if argv else root/'dist/players/football-v130.glb'
out=pathlib.Path(argv[1]) if len(argv)>1 else root/'outputs/style-demos/lowpoly/blender/master'
flat=len(argv)>2 and argv[2]=='flat'
out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(src),merge_vertices=True)
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bm=bmesh.new();bm.from_mesh(mesh.data);print('D6_MERGED',len(mesh.data.vertices),'boundary',sum(1 for e in bm.edges if e.is_boundary),'nonmanifold',sum(1 for e in bm.edges if not e.is_manifold));bm.free()
scene=bpy.context.scene
try: scene.render.engine='BLENDER_WORKBENCH'
except TypeError as e: print(e)
scene.display.shading.light='STUDIO';scene.display.shading.color_type='TEXTURE'
scene.display.shading.show_cavity=False
scene.render.resolution_x=640;scene.render.resolution_y=900
cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam'));scene.collection.objects.link(cam);scene.camera=cam
cam.data.type='ORTHO';cam.data.ortho_scale=1.9
for name,(x,y) in {'front':(0,-4),'side':(4,0),'back':(0,4),'q':(2.8,-2.8)}.items():
    cam.location=(x,y,.9);d=Vector((0,0,.9))-cam.location;cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/f'{name}.png');bpy.ops.render.render(write_still=True)
# close-up head and feet
cam.data.ortho_scale=.45
for name,(loc,tgt) in {'head-front':((0,-3,1.55),(0,0,1.55)),'head-q':((2,-2,1.6),(0,0,1.55)),'feet-q':((1.6,-1.6,.25),(0,0,.08)),'hand-front':((.65,-3,1.38),(.65,0,1.38))}.items():
    cam.location=loc;d=Vector(tgt)-Vector(loc);cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/f'{name}.png');bpy.ops.render.render(write_still=True)
print('D6_RENDERED',out)
