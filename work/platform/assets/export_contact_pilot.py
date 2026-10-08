"""Animation-only delivery on the existing rig; isolated Blender, never the user's scene."""
import bpy,pathlib,json,hashlib
from mathutils import Vector
assert bpy.app.background
root=pathlib.Path(__file__).resolve().parents[3];out=root/'meshy_output/contact-pilot-2026-10-08'
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.render.fps=30
bpy.ops.import_scene.gltf(filepath=str(out/'football-contact-pilot.glb'))
rig=next(o for o in scene.objects if o.type=='ARMATURE')
mapping={track.name:strip.action for track in rig.animation_data.nla_tracks for strip in track.strips}
names=['pass_inside_meshy','receive_ground_meshy'];actions=[mapping[n] for n in names]
for track in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(track)
def sample(arm,action,frame):
 arm.animation_data_create();arm.animation_data.action=action
 if action.slots:arm.animation_data.action_slot=action.slots[0]
 scene.frame_set(int(frame),subframe=frame-int(frame));bpy.context.view_layer.update()
 return {b.name:list(arm.matrix_world@b.matrix.translation) for b in arm.pose.bones}
samples={name:[{'time':i/30,'bones':sample(rig,action,i+action.frame_range[0])} for i in range(61)] for name,action in zip(names,actions)}
rig.animation_data.action=None
for name,action in zip(names,actions):
 action.name=name;track=rig.animation_data.nla_tracks.new();track.name=name
 strip=track.strips.new(name,0,action);strip.name=name;strip.blend_type='REPLACE';strip.extrapolation='NOTHING'
 if action.slots:strip.action_slot=action.slots[0]
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
fbx=out/'football-contact-pilot.fbx'
bpy.ops.export_scene.fbx(filepath=str(fbx),use_selection=True,object_types={'ARMATURE'},global_scale=1,apply_unit_scale=True,apply_scale_options='FBX_SCALE_UNITS',axis_forward='-Z',axis_up='Y',add_leaf_bones=False,bake_anim=True,bake_anim_use_all_bones=True,bake_anim_use_nla_strips=True,bake_anim_use_all_actions=False,bake_anim_force_startend_keying=True,bake_anim_step=1,bake_anim_simplify_factor=0)
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.render.fps=30
bpy.ops.import_scene.fbx(filepath=str(fbx),automatic_bone_orientation=False)
rig=next(o for o in scene.objects if o.type=='ARMATURE')
for track in rig.animation_data.nla_tracks:track.mute=True
errors=[]
for name in names:
 action=next(a for a in bpy.data.actions if a.name==name or a.name.endswith('|'+name));maximum=0
 for pose in samples[name]:
  actual=sample(rig,action,pose['time']*30+action.frame_range[0])
  maximum=max(maximum,max((Vector(v)-Vector(actual[k])).length for k,v in pose['bones'].items()))
 errors.append({'clip':name,'maxJointPositionErrorMetres':maximum})
report={'bones':len(rig.data.bones),'clips':errors,'meshes':len([o for o in scene.objects if o.type=='MESH']),'sha256':hashlib.sha256(fbx.read_bytes()).hexdigest()}
report['pass']=report['bones']==28 and report['meshes']==0 and len(bpy.data.actions)==2 and max(e['maxJointPositionErrorMetres'] for e in errors)<.002
(out/'contact-fbx-validation.json').write_text(json.dumps(report,indent=2))
(out/'contact-bone-samples.json').write_text(json.dumps(samples))
print('D6_CONTACT_FBX',json.dumps(report));assert report['pass']
