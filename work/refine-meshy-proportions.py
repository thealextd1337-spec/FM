"""Local mesh/rest-rig refinement; preserve source GLBs, UVs, weights and clips."""
import bpy, json, sys, pathlib
from mathutils import Vector
assert bpy.app.background, 'Run in an isolated --factory-startup background process, never in the user scene'
project = pathlib.Path(sys.argv[sys.argv.index('--')+1])
out = project/'proportions-refined'
out.mkdir(exist_ok=True)
reports=[]
for name in ('rigged','walking','running'):
    # This is a separate --factory-startup background process, not the user's UI.
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for action in list(bpy.data.actions): bpy.data.actions.remove(action)
    bpy.context.scene.render.fps=30
    bpy.ops.import_scene.gltf(filepath=str(project/(name+'.glb')))
    arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
    mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
    old={b.name:(b.head_local.copy(),b.tail_local.copy()) for b in arm.data.bones}
    # Coordinates in the armature's bind space; local clips remain relative to it.
    to_arm=arm.matrix_world.inverted()@mesh.matrix_world
    from_arm=to_arm.inverted()
    transforms={}
    for side in ('Left','Right'):
        a=old[side+'Arm'][0]; e=old[side+'ForeArm'][0]; w=old[side+'Hand'][0]
        axis=(w-e).normalized(); length=(w-e).length
        # Meshy armatures may use centimetre-local bones with a scaled root.
        world_a=arm.matrix_world@a
        shift=arm.matrix_world.to_3x3().inverted()@Vector((.025 if world_a.x>0 else -.025,0,0))
        transforms[side]=(a,e,w,axis,length,shift)
    groups={g.index:g.name for g in mesh.vertex_groups}
    for v in mesh.data.vertices:
        p=to_arm@v.co; displacement=Vector()
        for group in v.groups:
            gn=groups[group.group]
            for side,(a,e,w,axis,length,shift) in transforms.items():
                if gn==side+'Shoulder': displacement+=shift*.5*group.weight
                elif gn==side+'Arm':
                    upper=(e-a).normalized(); d=p-a; radial=d-upper*d.dot(upper)
                    displacement+=(shift+radial*.06)*group.weight
                elif gn==side+'ForeArm':
                    d=p-e; along=d.dot(axis); radial=d-axis*along
                    displacement+=(shift-axis*along*.05-radial*.22)*group.weight
                elif gn==side+'Hand': displacement+=(shift-axis*length*.05)*group.weight
        v.co=from_arm@(p+displacement)
    bpy.context.view_layer.objects.active=arm
    bpy.ops.object.mode_set(mode='EDIT')
    for side,(a,e,w,axis,length,shift) in transforms.items():
        for part in ('Shoulder','Arm','ForeArm','Hand'):
            bone=arm.data.edit_bones[side+part]
            head,tail=old[side+part]
            if part=='Shoulder': head+=shift*.5; tail+=shift*.5
            elif part=='ForeArm': head+=shift; tail+=shift-axis*length*.05
            elif part=='Hand': head+=shift-axis*length*.05; tail+=shift-axis*length*.05
            else: head+=shift;tail+=shift
            bone.head=head;bone.tail=tail
    bpy.ops.object.mode_set(mode='OBJECT')
    mesh.data.update()
    # GLTF imported local location curves should be zero except the moving hips.
    location_max=0
    for action in bpy.data.actions:
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for f in bag.fcurves:
                        # Imported 30-Hz float timestamps can fall just below a
                        # frame boundary; prevent the exporter dropping the end.
                        for k in f.keyframe_points:
                            rounded=round(k.co.x)
                            if abs(k.co.x-rounded)<1e-4:
                                delta=rounded-k.co.x
                                k.co.x=rounded;k.handle_left.x+=delta;k.handle_right.x+=delta
                        f.update()
                        if f.data_path.endswith('.location') and any(s+p in f.data_path for s in ('Left','Right') for p in ('Shoulder','Arm','ForeArm','Hand')):
                            location_max=max(location_max,max((abs(k.co.y) for k in f.keyframe_points),default=0))
    assert location_max<1e-4, 'Nonzero arm translations require explicit retargeting'
    report={'asset':name,'triangles':sum(len(p.vertices)-2 for p in mesh.data.polygons),'bones':len(arm.data.bones),'armLocationMax':location_max,'vertices':len(mesh.data.vertices)}
    reports.append(report)
    bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);arm.select_set(True)
    # Preserve the imported single clip; no resampling/extra generation.
    from io_scene_gltf2 import get_format_items
    formats=[i[0] for i in get_format_items(None,bpy.context)]
    assert 'GLB' in formats
    bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True)
    if name=='rigged': bpy.ops.wm.save_as_mainfile(filepath=str(out/'Meshy-B-Proportionen-v2.blend'))
(out/'refinement.json').write_text(json.dumps({'shoulderShiftPerSideMeters':.025,'upperArmRadialGain':.06,'forearmRadialReduction':.22,'forearmLengthReduction':.05,'reports':reports},indent=2))
print('PROPORTIONS_RESULT '+json.dumps(reports))
