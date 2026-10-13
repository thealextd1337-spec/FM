"""Original vs. low-poly skin on the same rig and clips (background Blender preview, not Unity evidence).

  blender --background --factory-startup --python preview_lowpoly.py -- <low-poly glb> <output folder>

The original GLB supplies rig, clips and the BaseColor material; the low-poly
skin is bound to that same armature by bone-named vertex groups.
"""
import bpy, pathlib, sys
from mathutils import Vector
root = pathlib.Path(__file__).resolve().parents[4]
argv = sys.argv[sys.argv.index('--') + 1:]
low_glb, out = pathlib.Path(argv[0]), pathlib.Path(argv[1]); out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(root / 'dist/players/football-v130.glb'))
rig = next(o for o in scene.objects if o.type == 'ARMATURE'); orig = next(o for o in scene.objects if o.type == 'MESH')
material = orig.data.materials[0]
before = set(scene.objects)
bpy.ops.import_scene.gltf(filepath=str(low_glb))
new = [o for o in scene.objects if o not in before]
low = next(o for o in new if o.type == 'MESH')
for o in new:
    if o.type == 'ARMATURE': bpy.data.objects.remove(o, do_unlink=True)
low.parent = rig; low.matrix_parent_inverse.identity()
for m in list(low.modifiers): low.modifiers.remove(m)
low.modifiers.new('Armature', 'ARMATURE').object = rig
low.data.materials.clear(); low.data.materials.append(material)
actions = {}
for track in rig.animation_data.nla_tracks:
    for strip in track.strips: actions[track.name] = strip.action
for track in list(rig.animation_data.nla_tracks): rig.animation_data.nla_tracks.remove(track)
try: scene.render.engine = 'BLENDER_WORKBENCH'
except TypeError as e: print(e)
scene.display.shading.light = 'STUDIO'; scene.display.shading.color_type = 'TEXTURE'
scene.render.resolution_x = 520; scene.render.resolution_y = 640; scene.render.film_transparent = False
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'
poses = [('rest', None, 0), ('idle_stand_meshy', 'idle_stand_meshy', .2), ('sprint', 'sprint_forward', .5), ('shot', 'shot_meshy', .45),
         ('keeper_dive', 'keeper_dive_meshy', .45), ('foul_fall', 'foul_fall_meshy', .55), ('keeper_low', 'keeper_low_meshy', .3),
         ('brake', 'brake_meshy', .5), ('turn_sharp', 'turn_sharp_right', .5), ('keeper_high', 'keeper_high_meshy', .4), ('back_step', 'back_step_meshy', .5)]
views = {'q': Vector((2.4, -2.6, .9)), 'side': Vector((3.4, 0, .9)), 'back': Vector((-1.6, 3, 1.1))}
for label, clip, at in poses:
    rig.animation_data.action = None
    for pb in rig.pose.bones: pb.matrix_basis.identity()
    if clip:
        a = actions[clip]; rig.animation_data.action = a
        if a.slots: rig.animation_data.action_slot = a.slots[0]
        f0, f1 = a.frame_range; frame = f0 + (f1 - f0) * at; scene.frame_set(int(frame), subframe=frame - int(frame))
    else:
        rig.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    hips = rig.matrix_world @ rig.pose.bones['mixamorig:Hips'].head
    for vname, offset in views.items():
        if label != 'rest' and vname == 'back' and label not in ('sprint', 'keeper_dive', 'foul_fall'): continue
        cam.data.ortho_scale = 2.1 if label in ('keeper_dive', 'foul_fall', 'rest') else 1.95
        cam.location = Vector((hips.x, hips.y, 0)) + offset; cam.rotation_euler = (Vector((hips.x, hips.y, max(.55, hips.z * .95))) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        for which, show in (('original', orig), ('lowpoly', low)):
            orig.hide_render = show is not orig; low.hide_render = show is not low
            scene.render.filepath = str(out / f'{label}-{vname}-{which}.png'); bpy.ops.render.render(write_still=True)
    rig.data.pose_position = 'POSE'
# Close faces and boots at rest.
rig.animation_data.action = None
for pb in rig.pose.bones: pb.matrix_basis.identity()
bpy.context.view_layer.update()
for label, (loc, tgt, scale) in {'head': ((.9, -1.6, 1.62), (0, .03, 1.56), .42), 'boots': ((.9, -1.3, .3), (0, .02, .08), .62), 'hand': ((1.1, -1.6, 1.5), (.66, .06, 1.3), .4), 'shorts': ((1.6, -.9, .85), (.12, .04, .78), .5), 'shorts-back': ((1.2, 1.4, .85), (.05, .06, .78), .55)}.items():
    cam.data.ortho_scale = scale; cam.location = loc; cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    for which, show in (('original', orig), ('lowpoly', low)):
        orig.hide_render = show is not orig; low.hide_render = show is not low
        scene.render.filepath = str(out / f'close-{label}-{which}.png'); bpy.ops.render.render(write_still=True)
print('D6_PREVIEW', out)
