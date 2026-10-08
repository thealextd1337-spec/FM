"""Refine the existing athlete's ribcage/waist/back, preserving rig and clips."""
import bpy,json,sys,pathlib,math,struct
assert bpy.app.background
source=pathlib.Path(sys.argv[sys.argv.index('--')+1]);out=source.parent/'torso-v6';out.mkdir(exist_ok=True)
# height, width, front depth, back depth; smooth profile avoids the former flared hem.
profile=[(.935,1,1,1),(.965,.91,.82,.82),(1.005,.86,.78,.78),(1.055,.88,.82,.82),(1.11,.97,.96,.96),(1.20,1.06,1.14,1.09),(1.29,1.07,1.05,.96),(1.38,1.04,1.02,.88),(1.47,1,1,1)]
def factors(z):
 for a,b in zip(profile,profile[1:]):
  if a[0]<=z<=b[0]:
   t=(z-a[0])/(b[0]-a[0]);t=t*t*(3-2*t)
   return tuple(a[i]+(b[i]-a[i])*t for i in range(1,4))
 return (1,1,1)
reports=[]
for name in ('rigged','walking','running'):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for action in list(bpy.data.actions):bpy.data.actions.remove(action)
 bpy.context.scene.render.fps=30;bpy.ops.import_scene.gltf(filepath=str(source/(name+'.glb')))
 arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
 before=[];after=[];count=0;maximum=0
 for mesh in meshes:
  matrix=mesh.matrix_world.copy();inverse=matrix.inverted();groups={g.index:g.name for g in mesh.vertex_groups}
  image=next((n.image for slot in mesh.material_slots if slot.material and slot.material.use_nodes for n in slot.material.node_tree.nodes if n.type=='TEX_IMAGE' and n.image),None)
  pixels=list(image.pixels) if image else None;uv_by_vertex={}
  if mesh.data.uv_layers.active:
   for loop in mesh.data.loops:uv_by_vertex[loop.vertex_index]=mesh.data.uv_layers.active.data[loop.index].uv.copy()
  for vertex in mesh.data.vertices:
   p=matrix@vertex.co;weights={groups[g.group]:g.weight for g in vertex.groups};torso=sum(weights.get(n,0) for n in ('Hips','Spine02','Spine01','Spine'))
   cloth=True
   if pixels and vertex.index in uv_by_vertex:
    uv=uv_by_vertex[vertex.index];x=min(image.size[0]-1,max(0,int(uv.x*image.size[0])));y=min(image.size[1]-1,max(0,int(uv.y*image.size[1])));index=(y*image.size[0]+x)*4;r,g,b=pixels[index:index+3]
    cloth=g>r*1.12 and g>b*1.10 or min(r,g,b)>.35 and r<g*1.15
   # Spatial torso envelope also includes the hem bound partly to thigh/shoulder bones.
   if .935<p.z<1.47 and abs(p.x)<.245 and cloth:
    old=p.copy();before.append(tuple(p));width,front,back=factors(p.z);blend=min(1,max(0,(.245-abs(p.x))/.065));blend=blend*blend*(3-2*blend)
    p.x*=1+(width-1)*blend;p.y=.018+(p.y-.018)*(1+((front if p.y<.018 else back)-1)*blend)
    vertex.co=inverse@p;after.append(tuple(p));count+=1;maximum=max(maximum,(p-old).length)
  mesh.data.update()
 for action in bpy.data.actions:
  for layer in action.layers:
   for strip in layer.strips:
    for bag in strip.channelbags:
     for curve in bag.fcurves:
      for key in curve.keyframe_points:
       rounded=round(key.co.x)
       if abs(key.co.x-rounded)<1e-4:
        delta=rounded-key.co.x;key.co.x=rounded;key.handle_left.x+=delta;key.handle_right.x+=delta
      curve.update()
 bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
 for mesh in meshes:mesh.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True)
 if name=='rigged':bpy.ops.wm.save_as_mainfile(filepath=str(out/'Meshy-B-Rumpf-v6.blend'))
 def bands(points):
  result=[]
  for z in (1.055,1.11,1.20,1.29,1.38):
   group=[p for p in points if abs(p[2]-z)<.045]
   if group:result.append({'height':z,'width':max(p[0] for p in group)-min(p[0] for p in group),'front':min(p[1] for p in group),'back':max(p[1] for p in group),'vertices':len(group)})
  return result
 exported=(out/(name+'.glb')).read_bytes();gltf=json.loads(exported[20:20+struct.unpack_from('<I',exported,12)[0]])
 triangles=sum(gltf['accessors'][p['indices']]['count']//3 for m in gltf['meshes'] for p in m['primitives'])
 reports.append({'asset':name,'torsoVertices':count,'maximumDisplacement':maximum,'before':bands(before),'after':bands(after),'bones':len(arm.data.bones),'triangles':triangles})
(out/'refinement.json').write_text(json.dumps({'source':str(source),'profile':profile,'additionalMeshyCredits':0,'reports':reports},indent=2))
print('TORSO_RESULT '+json.dumps(reports))
