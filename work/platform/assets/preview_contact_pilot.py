"""Render the retargeted model, never the live Blender scene."""
import bpy,pathlib,json,math
from mathutils import Vector
assert bpy.app.background
root=pathlib.Path(__file__).resolve().parents[3];out=root/'meshy_output/contact-pilot-2026-10-08'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out/'football-contact-pilot.glb'))
scene=bpy.context.scene;scene.render.engine='BLENDER_WORKBENCH';scene.render.resolution_x=1440;scene.render.resolution_y=780;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Pilot preview world')
scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL';scene.display.shading.show_shadows=True;scene.display.shading.show_cavity=True;scene.display.shading.background_type='WORLD';scene.world.color=(.055,.075,.09)
rig=next(o for o in scene.objects if o.type=='ARMATURE');mesh=next(o for o in scene.objects if o.type=='MESH');scene.render.fps=30
mapping={track.name:strip.action for track in rig.animation_data.nla_tracks for strip in track.strips}
for track in rig.animation_data.nla_tracks:track.mute=True
samples=[]
for row,name in enumerate(['pass_inside_meshy','receive_ground_meshy']):
 for column,time in enumerate([0,.45,.85,1.3,1.9]):
  action=mapping[name];rig.animation_data.action=action
  if action.slots:rig.animation_data.action_slot=action.slots[0]
  scene.frame_set(int(time*30)+1,subframe=time*30-int(time*30));bpy.context.view_layer.update()
  pose={b.name:b.matrix_basis.copy() for b in rig.pose.bones}
  arm=rig.copy();arm.data=rig.data.copy();scene.collection.objects.link(arm);arm.animation_data_clear();arm.location=rig.location+Vector(((column-2)*2.2,row*3,0))
  body=mesh.copy();body.data=mesh.data;scene.collection.objects.link(body);body.parent=arm
  for modifier in body.modifiers:
   if modifier.type=='ARMATURE':modifier.object=arm
  for bone in arm.pose.bones:bone.matrix_basis=pose[bone.name]
  bpy.context.view_layer.update()
  bones={b.name:list(arm.matrix_world@b.matrix.translation) for b in arm.pose.bones}
  samples.append({'clip':name,'time':time,'rightFoot':bones.get('mixamorig:RightFoot'),'leftFoot':bones.get('mixamorig:LeftFoot'),'hips':bones.get('mixamorig:Hips')})
rig.hide_render=True;mesh.hide_render=True
camera=bpy.data.objects.new('Pilot camera',bpy.data.cameras.new('Pilot camera'));scene.collection.objects.link(camera);scene.camera=camera;camera.location=(0,-10,4.2);camera.rotation_euler=(Vector((0,1.5,.95))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=13
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'retarget-preview.png');bpy.ops.render.render(write_still=True)
(out/'preview-samples.json').write_text(json.dumps(samples,indent=2),encoding='utf8')
print('D6_PREVIEW',scene.render.filepath)
