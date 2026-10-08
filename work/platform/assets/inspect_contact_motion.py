"""Read only provider FBX in an isolated Blender process, export sampleable GLB."""
import bpy,sys,json,pathlib
assert bpy.app.background, 'Never replace the live Blender scene'
root=pathlib.Path(__file__).resolve().parents[3]
clip=sys.argv[sys.argv.index('--')+1]
assert clip in ('pass','receive')
out=root/'meshy_output/contact-pilot-2026-10-08'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(out/(clip+'-source')/'motion.fbx'))
scene=bpy.context.scene
rigs=[o for o in scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0];actions=list(bpy.data.actions);assert len(actions)==1
action=actions[0]
scene.frame_start=round(action.frame_range[0]);scene.frame_end=round(action.frame_range[1])
report={'clip':clip,'blender':bpy.app.version_string,'fps':scene.render.fps,'bones':[b.name for b in rig.data.bones],'actions':[{'name':a.name,'range':list(a.frame_range)} for a in actions],'meshes':[{'name':o.name,'vertices':len(o.data.vertices)} for o in scene.objects if o.type=='MESH']}
bpy.ops.export_scene.gltf(filepath=str(out/(clip+'-provider.glb')),export_format='GLB',export_animations=True,export_animation_mode='ACTIVE_ACTIONS',export_frame_range=True,export_force_sampling=True,export_materials='NONE')
(out/(clip+'-inspection.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
print('D6_MOTION_INSPECT',json.dumps(report))
