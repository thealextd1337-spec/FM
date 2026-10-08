import bpy,json,math
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)];arms=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
assert len(arms)==1 and len(arms[0].data.bones)==24
assert all(math.isfinite(value) for o in meshes for v in o.data.vertices for value in v.co)
errors=[(o.name,v.index,sum(g.weight for g in v.groups)) for o in meshes for v in o.data.vertices if abs(sum(g.weight for g in v.groups)-1)>=1e-5]
assert not errors, errors[:8]
print('NATIVE_OK '+json.dumps({'bones':24,'meshes':len(meshes),'vertices':sum(len(o.data.vertices) for o in meshes),'finite':True,'weights':True}))
