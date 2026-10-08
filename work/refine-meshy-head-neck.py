"""Derive a larger head / shorter neck from the already refined player."""
import bpy,json,sys,pathlib
from mathutils import Vector
assert bpy.app.background, 'Use an isolated --factory-startup background process'
source=pathlib.Path(sys.argv[sys.argv.index('--')+1])
out=source.parent/'head-neck-refined-v3';out.mkdir(exist_ok=True)
reports=[]
for name in ('rigged','walking','running'):
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for action in list(bpy.data.actions):bpy.data.actions.remove(action)
    bpy.context.scene.render.fps=30
    bpy.ops.import_scene.gltf(filepath=str(source/(name+'.glb')))
    arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
    mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
    world=arm.matrix_world.copy();inverse=world.inverted()
    old={b.name:(b.head_local.copy(),b.tail_local.copy()) for b in arm.data.bones}
    pivot=world@old['Head'][0];base=world@old['neck'][0]
    gap=pivot.z-base.z
    head_names=('Head','head_end','headfront')
    drop=Vector((0,0,-.024))
    def head_position(p):
        d=p-pivot
        return pivot+Vector((d.x*1.16,d.y*1.16,d.z*1.10))+drop
    groups={g.index:g.name for g in mesh.vertex_groups}
    to_world=mesh.matrix_world.copy();from_world=to_world.inverted()
    for vertex in mesh.data.vertices:
        p=to_world@vertex.co;delta=Vector()
        for group in vertex.groups:
            gn=groups[group.group]
            if gn in head_names:delta+=(head_position(p)-p)*group.weight
            elif gn=='neck':
                d=p-base;t=max(0,min(1,d.z/gap))
                change=Vector((d.x*.12,d.y*.12,drop.z*t))
                delta+=change*group.weight
        vertex.co=from_world@(p+delta)
    bpy.context.view_layer.objects.active=arm;bpy.ops.object.mode_set(mode='EDIT')
    for gn in head_names:
        bone=arm.data.edit_bones[gn];h,t=old[gn]
        new_h=inverse@head_position(world@h)
        delta=new_h-h
        # Preserve each existing rest axis so the clips need no rotation retarget.
        bone.head=h+delta;bone.tail=t+delta
    bpy.ops.object.mode_set(mode='OBJECT');mesh.data.update()
    location_max=0
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
                        if curve.data_path.endswith('.location') and any(gn in curve.data_path for gn in head_names):
                            location_max=max(location_max,max((abs(k.co.y) for k in curve.keyframe_points),default=0))
    assert location_max<1e-4, 'Head position curves need explicit retargeting'
    bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);arm.select_set(True)
    from io_scene_gltf2 import get_format_items
    formats=[item[0] for item in get_format_items(None,bpy.context)];assert 'GLB' in formats
    bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True)
    if name=='rigged':bpy.ops.wm.save_as_mainfile(filepath=str(out/'Meshy-B-Kopf-Hals-v3.blend'))
    reports.append({'asset':name,'neckJointDistanceBefore':gap,'neckJointDistanceAfter':gap-.024,'headLocationCurveMax':location_max,'triangles':sum(len(p.vertices)-2 for p in mesh.data.polygons),'bones':len(arm.data.bones)})
(out/'refinement.json').write_text(json.dumps({'source':str(source),'headWidthDepthScale':1.16,'headHeightScale':1.10,'headDropMeters':.024,'neckWidthDepthScale':1.12,'additionalMeshyCredits':0,'reports':reports},indent=2))
print('HEAD_NECK_RESULT '+json.dumps(reports))
