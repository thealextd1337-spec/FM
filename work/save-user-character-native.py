import bpy,pathlib,json,math,sys
assert bpy.app.background
root=pathlib.Path(__file__).resolve().parent.parent
contact='--contact' in sys.argv
ball_actions='--ball-actions' in sys.argv or contact
stance_shot='--stance-shot' in sys.argv or ball_actions
locomotion='--locomotion' in sys.argv or stance_shot
head='--head' in sys.argv or locomotion
football='--football' in sys.argv or head
textured='--textured' in sys.argv or football
source=root/('meshy_output/user-character-2026-10-03/character-football-v111.glb' if ball_actions else 'meshy_output/user-character-2026-10-03/character-football-v110.glb' if stance_shot else 'meshy_output/user-character-2026-10-03/character-locomotion-v108.glb' if locomotion else 'meshy_output/user-character-2026-10-03/character-head-textured-football.glb' if head else 'meshy_output/user-character-2026-10-03/character-football-animations.glb' if football else 'meshy_output/user-character-2026-10-03/character-textured-meshy-motions.glb' if textured else 'meshy_output/user-character-2026-10-03/character-meshy-motions.glb')
if contact:source=root/'meshy_output/user-character-2026-10-03/character-football-v113.glb'
native=root/'meshy_output/user-character-2026-10-03/contact-v113' if contact else pathlib.Path('G:/Blenderassets/FM/Nutzercharakter-2026-10-03');native.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
armatures=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(armatures)==1
arm=armatures[0];assert len(arm.data.bones)==28
actions=list(bpy.data.actions);assert len(actions)==(32 if contact else 29 if ball_actions else 25 if stance_shot else 22 if locomotion else 9 if football else 3)
if football:assert all(any(a.name.startswith(key) for a in actions) for key in ['run_fast4','run_fast6','sprint_forward','celebrate_fist','celebrate_arms','celebrate_victory'])
walking=next(a for a in actions if a.name.startswith('walking'))
if not arm.animation_data:arm.animation_data_create()
for track in arm.animation_data.nla_tracks:track.mute=True
arm.animation_data.action=walking
if walking.slots:arm.animation_data.action_slot=walking.slots[0]
scene=bpy.context.scene;scene.frame_start=0;scene.frame_end=math.ceil(walking.frame_range[1]);scene.frame_set(0)
meshes=[o for o in scene.objects if o.type=='MESH']
skinned=[o for o in meshes if any(m.type=='ARMATURE' and m.object==arm for m in o.modifiers)];assert len(skinned)==1
helpers=[o for o in meshes if any(b.custom_shape==o for b in arm.pose.bones)]
assert all(o in skinned or o in helpers for o in meshes)
if textured:
 mask=bpy.data.images.load(str(root/'meshy_output/user-character-2026-10-03/cloth-mask.png'),check_existing=True)
 mask.colorspace_settings.name='Non-Color';mask.pack()
 material=skinned[0].data.materials[0];tree=material.node_tree
 bsdf=next(n for n in tree.nodes if n.type=='BSDF_PRINCIPLED')
 original_link=bsdf.inputs['Base Color'].links[0]
 original_color=original_link.from_socket
 group=bpy.data.node_groups.new('Vereinsfarben_Trikot_Hose_Stutzen','ShaderNodeTree')
 group.interface.new_socket(name='Meshy-Farbe',in_out='INPUT',socket_type='NodeSocketColor')
 group.interface.new_socket(name='Farbe',in_out='OUTPUT',socket_type='NodeSocketColor')
 for label in ['Trikot','Hose','Stutzen']:
  enabled=group.interface.new_socket(name=label+' aktiv',in_out='INPUT',socket_type='NodeSocketFloat');enabled.default_value=0;enabled.min_value=0;enabled.max_value=1
  color=group.interface.new_socket(name=label+' Farbe',in_out='INPUT',socket_type='NodeSocketColor');color.default_value=(.3,.3,.3,1)
 nodes=group.nodes;links=group.links;inputs=nodes.new('NodeGroupInput');output=nodes.new('NodeGroupOutput')
 mask_node=nodes.new('ShaderNodeTexImage');mask_node.image=mask;mask_node.interpolation='Linear';mask_node.label='R: Trikot, G: Hose, B: Stutzen'
 split=nodes.new('ShaderNodeSeparateColor');split.mode='RGB';links.new(mask_node.outputs['Color'],split.inputs['Color'])
 luminance=nodes.new('ShaderNodeRGBToBW');links.new(inputs.outputs['Meshy-Farbe'],luminance.inputs['Color'])
 previous=inputs.outputs['Meshy-Farbe']
 for i,(label,reference) in enumerate(zip(['Trikot','Hose','Stutzen'],[.07,.014,.85])):
  factor=nodes.new('ShaderNodeMath');factor.operation='MULTIPLY';links.new(split.outputs[i],factor.inputs[0]);links.new(inputs.outputs[label+' aktiv'],factor.inputs[1])
  shade=nodes.new('ShaderNodeMath');shade.operation='DIVIDE';shade.inputs[1].default_value=reference;links.new(luminance.outputs[0],shade.inputs[0])
  tinted=nodes.new('ShaderNodeMixRGB');tinted.blend_type='MULTIPLY';tinted.inputs[0].default_value=1;links.new(inputs.outputs[label+' Farbe'],tinted.inputs[1]);links.new(shade.outputs[0],tinted.inputs[2])
  mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MIX';links.new(factor.outputs[0],mix.inputs[0]);links.new(previous,mix.inputs[1]);links.new(tinted.outputs[0],mix.inputs[2]);previous=mix.outputs[0]
 links.new(previous,output.inputs['Farbe'])
 control=tree.nodes.new('ShaderNodeGroup');control.node_tree=group;control.label='Vereinsfarben · aktiv 0 = Meshy-Original';control.location=(bsdf.location.x-280,bsdf.location.y)
 tree.links.new(original_color,control.inputs['Meshy-Farbe']);tree.links.new(control.outputs['Farbe'],bsdf.inputs['Base Color'])
 def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
 for label,rgb in [('Trikot',(34,87,154)),('Hose',(16,36,62)),('Stutzen',(244,245,244))]:control.inputs[label+' Farbe'].default_value=tuple(linear(v/255) for v in rgb)+(1,)
 skinned[0]['Meshy_Textur_Task']='01a10128-99dd-77a5-8b30-b633116d62fe'
 if head:skinned[0]['Meshy_Kopftextur_Task']=json.loads((root/'docs/spieler-nutzer-rig/head-transfer-qa.json').read_text())['headTextureTaskId']
 skinned[0]['Vereinsfarben']='Materialgruppe: Aktivierung je Stoffregion; Wappen und Nummern noch offen.'
for img in bpy.data.images:
 if not img.has_data and img.source=='FILE':_=img.pixels[0]
 if img.has_data and not img.packed_file:img.pack()
file=native/('Doppel6-Nutzercharakter-Meshy-Ballaktionen-Torwart.blend' if ball_actions else 'Doppel6-Nutzercharakter-Meshy-Stand-Schuss.blend' if stance_shot else 'Doppel6-Nutzercharakter-Meshy-Lokomotion.blend' if locomotion else 'Doppel6-Nutzercharakter-Kopftextur-Fussballanimationen.blend' if head else 'Doppel6-Nutzercharakter-Fussballanimationen.blend' if football else 'Doppel6-Nutzercharakter-Texturiert.blend' if textured else 'Doppel6-Nutzercharakter-Meshy-Bewegungen.blend')
if contact:file=native/'Doppel6-Nutzercharakter-Foul-Stand-v113.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(file))
bpy.ops.wm.open_mainfile(filepath=str(file))
arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');assert len(arm.data.bones)==28
assert len(bpy.data.actions)==(32 if contact else 29 if ball_actions else 25 if stance_shot else 22 if locomotion else 9 if football else 3)
assert arm.animation_data.action.name.startswith('walking')
for img in bpy.data.images:
 if not img.has_data and img.source=='FILE':_=img.pixels[0]
report={'file':str(file),'source':str(source),'nativeReopened':True,'joints':28,'actions':[{'name':a.name,'frameRange':list(a.frame_range)} for a in bpy.data.actions],'activeClip':arm.animation_data.action.name,'nlaTracksMuted':True,'images':[{'size':list(i.size),'packed':bool(i.packed_file)} for i in bpy.data.images if i.has_data],'clothControlGroup':textured and bool(bpy.data.node_groups.get('Vereinsfarben_Trikot_Hose_Stutzen'))}
assert report['images'] and all(i['packed'] for i in report['images'])
(root/('docs/spieler-nutzer-rig/contact-native-qa-v113.json' if contact else 'docs/spieler-nutzer-rig/ball-actions-native-qa-v111.json' if ball_actions else 'docs/spieler-nutzer-rig/stance-shot-native-qa-v110.json' if stance_shot else 'docs/spieler-nutzer-rig/locomotion-native-qa.json' if locomotion else 'docs/spieler-nutzer-rig/head-native-qa.json' if head else 'docs/spieler-nutzer-rig/football-native-qa.json' if football else 'docs/spieler-nutzer-rig/texture-native-qa.json' if textured else 'docs/spieler-nutzer-rig/native-qa.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
