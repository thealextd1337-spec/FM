"""Isolated GLB -> FBX export and numerical round-trip verification. Never run in GUI."""
import bpy, json, pathlib, math, hashlib
from mathutils import Vector
assert bpy.app.background, 'This exporter must run in a separate background process'
root=pathlib.Path(__file__).resolve().parents[3]
manifest=json.loads((root/'work/platform/assets/manifest.json').read_text())
out=root/manifest['outputDirectory']
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.fps=30
scene.unit_settings.system='METRIC'
scene.unit_settings.scale_length=1.0
bpy.ops.import_scene.gltf(filepath=str(out/'football-v130.glb'))
rigs=[o for o in scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0]
meshes=[o for o in scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
assert len(meshes)==1 and len(rig.data.bones)==28
mesh=meshes[0]
actions=list(bpy.data.actions)
assert len(actions)==34
# The glTF importer appends the target object to action names; use original NLA labels.
mapping={strip.action.name:track.name for track in rig.animation_data.nla_tracks for strip in track.strips}
for a in actions:
    a.name=mapping.get(a.name,a.name)
assert set(a.name for a in actions)==set(c['name'] for c in manifest['clips']), [a.name for a in actions]
for track in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(track)
def set_action(arm,action):
    arm.animation_data_create();arm.animation_data.action=action
    if action.slots:arm.animation_data.action_slot=action.slots[0]
def sample(arm,action,frame):
    set_action(arm,action);scene.frame_set(int(frame),subframe=frame-int(frame));bpy.context.view_layer.update()
    return {b.name:list(arm.matrix_world @ b.matrix.translation) for b in arm.pose.bones}
samples={a.name:[{'frame':float(t),'bones':sample(rig,a,float(t))} for t in [a.frame_range[0],sum(a.frame_range)/2,a.frame_range[1]]] for a in actions}
rig.animation_data.action=None
rig.data.pose_position='REST';bpy.context.view_layer.update()
coords=[mesh.matrix_world @ v.co for v in mesh.data.vertices]
bound={'min':[min(v[i] for v in coords) for i in range(3)],'max':[max(v[i] for v in coords) for i in range(3)]}
rig.data.pose_position='POSE'
for a in actions:
    track=rig.animation_data.nla_tracks.new();track.name=a.name
    strip=track.strips.new(a.name,0,a);strip.name=a.name
    if a.slots:strip.action_slot=a.slots[0]
    strip.blend_type='REPLACE';strip.extrapolation='NOTHING'
for image in bpy.data.images:
    if image.packed_file:
        # FBX references actual texture filenames instead of transient embedded image names.
        packed=bytes(image.packed_file.data)
        match=next((i for i in manifest['images'] if i['sha256']==hashlib.sha256(packed).hexdigest()),None)
        if match:image.filepath=str(out/match['file'])
bpy.ops.object.select_all(action='DESELECT')
for o in [rig,mesh]:o.select_set(True)
bpy.context.view_layer.objects.active=rig
fbx=out/'football-v130.fbx'
bpy.ops.export_scene.fbx(filepath=str(fbx),use_selection=True,object_types={'ARMATURE','MESH'},global_scale=1.0,apply_unit_scale=True,apply_scale_options='FBX_SCALE_UNITS',axis_forward='-Z',axis_up='Y',use_mesh_modifiers=False,mesh_smooth_type='OFF',use_armature_deform_only=False,add_leaf_bones=False,bake_anim=True,bake_anim_use_all_bones=True,bake_anim_use_nla_strips=True,bake_anim_use_all_actions=False,bake_anim_force_startend_keying=True,bake_anim_step=1.0,bake_anim_simplify_factor=0.0,path_mode='RELATIVE',embed_textures=False)
report={'blenderVersion':bpy.app.version_string,'background':bpy.app.background,'export':str(fbx),'sourceHash':manifest['assetHash'],'fps':30,'vertices':len(mesh.data.vertices),'triangles':sum(len(p.vertices)-2 for p in mesh.data.polygons),'bones':len(rig.data.bones),'boundsBlenderZUp':bound,'actions':[{'name':a.name,'frameRange':list(a.frame_range)} for a in actions],'sourceSamples':samples}
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.render.fps=30
bpy.ops.import_scene.fbx(filepath=str(fbx),use_anim=True,automatic_bone_orientation=False,ignore_leaf_bones=False)
rig=next(o for o in scene.objects if o.type=='ARMATURE')
for track in rig.animation_data.nla_tracks:track.mute=True
imported=list(bpy.data.actions)
errors=[]
for original,poses in samples.items():
    action=next((a for a in imported if a.name==original or a.name.endswith('|'+original)),None)
    assert action is not None,(original,[a.name for a in imported])
    # FBX reimport shifts each clip to frame 1.
    offset=action.frame_range[0]-poses[0]['frame']
    maximum=0
    for pose in poses:
        actual=sample(rig,action,pose['frame']+offset)
        maximum=max(maximum,max((Vector(v)-Vector(actual[k])).length for k,v in pose['bones'].items()))
    errors.append({'clip':original,'maxJointPositionErrorMetres':maximum,'importedName':action.name,'frameRange':list(action.frame_range)})
report['roundTrip']={'bones':len(rig.data.bones),'actions':len(imported),'samplesPerClip':3,'clips':errors,'maxJointPositionErrorMetres':max(e['maxJointPositionErrorMetres'] for e in errors)}
report['roundTrip']['meshes']=[{'name':o.name,'vertices':len(o.data.vertices),'triangles':sum(len(p.vertices)-2 for p in o.data.polygons),'uvLayers':[u.name for u in o.data.uv_layers]} for o in scene.objects if o.type=='MESH']
report['roundTrip']['images']=[{'name':i.name,'path':i.filepath,'exists':pathlib.Path(bpy.path.abspath(i.filepath)).exists(),'size':list(i.size)} for i in bpy.data.images if i.source=='FILE']
report['roundTrip']['passed']=len(rig.data.bones)==28 and len(imported)==34 and report['roundTrip']['maxJointPositionErrorMetres']<0.002
(out/'fbx-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('D6_ASSET_EXPORT',json.dumps({k:v for k,v in report.items() if k not in ['sourceSamples','actions']}))
assert report['roundTrip']['passed'], 'FBX round trip exceeded 2 mm joint tolerance'
