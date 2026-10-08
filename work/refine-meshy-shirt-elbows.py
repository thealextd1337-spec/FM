"""Refine cloth fit and elbow skinning without changing clips or joint timing."""
import bpy,json,sys,pathlib,math,struct
from mathutils import Vector
assert bpy.app.background
source=pathlib.Path(sys.argv[sys.argv.index('--')+1]);out=source.parent/'shirt-elbows-v5';out.mkdir(exist_ok=True)
reports=[]
for name in ('rigged','walking','running'):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for action in list(bpy.data.actions):bpy.data.actions.remove(action)
 bpy.context.scene.render.fps=30;bpy.ops.import_scene.gltf(filepath=str(source/(name+'.glb')))
 arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
 elbows={side:tuple(arm.matrix_world@arm.data.bones[side+part].head_local for part in ('Arm','ForeArm','Hand')) for side in ('Left','Right')}
 shirt_count=elbow_count=0
 for mesh in meshes:
  matrix=mesh.matrix_world.copy();inverse=matrix.inverted();groups={g.index:g.name for g in mesh.vertex_groups}
  for v in mesh.data.vertices:
   p=matrix@v.co;weights={groups[g.group]:g.weight for g in v.groups}
   torso=sum(weights.get(n,0) for n in ('Hips','Spine02','Spine01','Spine'))
   if 1.035<p.z<1.31 and abs(p.x)<.23 and torso>.65:
    fit=math.sin(math.pi*(p.z-1.035)/(.275))**.5
    p.x*=1-.09*fit;p.y=.018+(p.y-.018)*(1-.22*fit)
    transfer=weights.get('Hips',0)*.80*fit
    if transfer:
     mesh.vertex_groups['Hips'].add([v.index],weights['Hips']-transfer,'REPLACE')
     mesh.vertex_groups['Spine02'].add([v.index],weights.get('Spine02',0)+transfer,'REPLACE')
    shirt_count+=1
   for side,(a,e,w) in elbows.items():
    total=weights.get(side+'Arm',0)+weights.get(side+'ForeArm',0)
    distance=(p-e).length
    if total>.65 and distance<.065:
     axis=(w-a).normalized();relative=p-e;radial=relative-axis*relative.dot(axis)
     p-=radial*.12*(1-distance/.065)
     t=max(0,min(1,(relative.dot(axis)+.027)/.054));t=t*t*(3-2*t)
     mesh.vertex_groups[side+'Arm'].add([v.index],total*(1-t),'REPLACE')
     mesh.vertex_groups[side+'ForeArm'].add([v.index],total*t,'REPLACE');elbow_count+=1
   v.co=inverse@p
  mesh.data.update()
 for action in bpy.data.actions:
  for layer in action.layers:
   for strip in layer.strips:
    for bag in strip.channelbags:
     for curve in bag.fcurves:
      for key in curve.keyframe_points:
       rounded=round(key.co.x)
       if abs(key.co.x-rounded)<1e-4:
        d=rounded-key.co.x;key.co.x=rounded;key.handle_left.x+=d;key.handle_right.x+=d
      curve.update()
 bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
 for mesh in meshes:mesh.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True)
 if name=='rigged':bpy.ops.wm.save_as_mainfile(filepath=str(out/'Meshy-B-Trikot-Ellenbogen-v5.blend'))
 exported=(out/(name+'.glb')).read_bytes();gltf=json.loads(exported[20:20+struct.unpack_from('<I',exported,12)[0]])
 triangles=sum(gltf['accessors'][p['indices']]['count']//3 for m in gltf['meshes'] for p in m['primitives'])
 reports.append({'asset':name,'shirtVertices':shirt_count,'elbowVertices':elbow_count,'bones':len(arm.data.bones),'triangles':triangles})
(out/'refinement.json').write_text(json.dumps({'source':str(source),'additionalMeshyCredits':0,'reports':reports},indent=2))
print('FIT_RESULT '+json.dumps(reports))
