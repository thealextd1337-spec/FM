"""Klares Low-Poly player mesh on the unchanged Release 130 rig. Background Blender only.

  blender --background --factory-startup --python-exit-code 1 --python build_lowpoly.py -- [--version v1] [--target 2600]

Source: dist/players/football-v130.glb (read only). The 28-joint Generic rig,
its rest pose and every clip stay untouched; only the visible skin is rebuilt:

1. Welds the glTF seam duplicates (UVs stay per face corner, so seams remain).
2. Density-controlled collapse: a permission group lets hair, torso panels and
   thighs simplify most, keeps more loops at shoulder, elbow, wrist, hip, knee,
   ankle and neck, and nearly keeps the boot sole outline (ground contact).
3. Skin weights are transferred again from the original surface at each new
   vertex position (nearest face, interpolated), limited to four and normalised.
4. Facets: rigid segments are flat shaded; faces in strongly blended joint zones
   stay smooth so no hard light break sits on a bending crease.
5. Exports FBX (Unity import, same axis/scale settings as export_fbx.py, no
   animation) and a GLB record, then measures and renders previews.
Outputs: outputs/platform/assets/lowpoly-<version>/ (report lowpoly-report.json).
"""
import bpy, bmesh, json, pathlib, sys, hashlib, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree
assert bpy.app.background, 'Run in a separate background Blender process'
root = pathlib.Path(__file__).resolve().parents[4]
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
opt = {argv[i]: argv[i + 1] for i in range(0, len(argv) - 1, 2)}
version = opt.get('--version', 'v1')
target = int(opt.get('--target', '2600'))
name = 'd6_lowpoly_' + version
src_glb = root / 'dist/players/football-v130.glb'
out = root / ('outputs/platform/assets/lowpoly-' + version)
out.mkdir(parents=True, exist_ok=True)
sha = lambda p: hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = 30
bpy.ops.import_scene.gltf(filepath=str(src_glb))
rig = next(o for o in scene.objects if o.type == 'ARMATURE')
mesh = next(o for o in scene.objects if o.type == 'MESH')
assert len(rig.data.bones) == 28
if rig.animation_data:
    for track in list(rig.animation_data.nla_tracks): rig.animation_data.nla_tracks.remove(track)
    rig.animation_data.action = None
for pb in rig.pose.bones: pb.matrix_basis.identity()
rig.data.pose_position = 'REST'
bpy.context.view_layer.update()

# 1 Weld seam duplicates; corner UVs keep the seams.
bm = bmesh.new(); bm.from_mesh(mesh.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
bm.to_mesh(mesh.data); bm.free()
with bpy.context.temp_override(object=mesh, active_object=mesh):
    try: bpy.ops.mesh.customdata_custom_splitnormals_clear()
    except RuntimeError: pass
source = mesh.copy(); source.data = mesh.data.copy(); source.name = 'd6_source'
for m in list(source.modifiers): source.modifiers.remove(m)
scene.collection.objects.link(source)
src_tris = sum(len(p.vertices) - 2 for p in source.data.polygons)

bones = {b.name: b for b in rig.data.bones}
groups = {g.index: g.name for g in mesh.vertex_groups}
def dominant(v):
    gs = [g for g in v.groups if g.group in groups and g.weight > 0]
    return groups[max(gs, key=lambda g: g.weight).group] if gs else None
def ramp(d, r0, r1): return 1.0 if d <= r0 else 0.0 if d >= r1 else 1 - (d - r0) / (r1 - r0)

# 2 Permission weights (1 = simplify freely, 0 = keep).
joints = [('LeftArm', .05, .11), ('RightArm', .05, .11), ('LeftForeArm', .035, .085), ('RightForeArm', .035, .085),
          ('LeftHand', .03, .07), ('RightHand', .03, .07), ('LeftUpLeg', .05, .12), ('RightUpLeg', .05, .12),
          ('LeftLeg', .045, .1), ('RightLeg', .045, .1), ('LeftFoot', .035, .08), ('RightFoot', .035, .08), ('Neck', .04, .09)]
heads = [(bones['mixamorig:' + j].head_local.copy(), r0, r1) for j, r0, r1 in joints]
perm = mesh.vertex_groups.new(name='lp_permission')
protect_of = []
for v in mesh.data.vertices:
    p = v.co; d = dominant(v) or ''
    keep = max((ramp((p - h).length, r0, r1) * .62 for h, r0, r1 in heads), default=0)
    if ('Foot' in d or 'Toe' in d) and p.z < .02: keep = max(keep, .9)   # boot sole outline and ground contact
    elif 'Foot' in d or 'Toe' in d: keep = max(keep, .35)
    if 'Hand' in d: keep = max(keep, .5)                                # hand and thumb: no spikes
    if d in ('mixamorig:Head', 'headfront') and p.y < .02 and 1.44 < p.z < 1.64: keep = max(keep, .4)  # face planes
    protect_of.append(keep)
    perm.add([v.index], 1 - keep, 'REPLACE')

dec = mesh.modifiers.new('lp_decimate', 'DECIMATE')
dec.decimate_type = 'COLLAPSE'; dec.vertex_group = 'lp_permission'; dec.vertex_group_factor = 1.0
dec.use_symmetry = True; dec.symmetry_axis = 'X'; dec.use_collapse_triangulate = True
def apply_decimate(ratio):
    m = mesh.copy(); m.data = mesh.data.copy(); scene.collection.objects.link(m)
    for mod in list(m.modifiers):
        if mod.type != 'DECIMATE': m.modifiers.remove(mod)
    m.modifiers['lp_decimate'].ratio = ratio
    with bpy.context.temp_override(object=m, active_object=m):
        bpy.ops.object.modifier_apply(modifier='lp_decimate')
    return m
# Bisection on the ratio for the requested triangle count.
lo, hi, best = .05, .6, None
for _ in range(12):
    ratio = (lo + hi) / 2; cand = apply_decimate(ratio)
    tris = sum(len(p.vertices) - 2 for p in cand.data.polygons)
    if best is not None: bpy.data.objects.remove(best[0], do_unlink=True)
    best = (cand, ratio, tris)
    if abs(tris - target) <= target * .02: break
    if tris > target: hi = ratio
    else: lo = ratio
low, ratio, tris = best
bpy.data.objects.remove(mesh, do_unlink=True)
low.name = name; low.data.name = name
low.parent = rig
arm = low.modifiers.new('Armature', 'ARMATURE'); arm.object = rig
low.vertex_groups.remove(low.vertex_groups['lp_permission'])

# 3 Skin weights again from the original surface.
for g in list(low.vertex_groups): low.vertex_groups.remove(g)
for g in source.vertex_groups:
    if g.name != 'lp_permission': low.vertex_groups.new(name=g.name)
dt = low.modifiers.new('lp_weights', 'DATA_TRANSFER')
dt.object = source; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
with bpy.context.temp_override(object=low, active_object=low):
    bpy.ops.object.modifier_move_to_index(modifier='lp_weights', index=0)
    bpy.ops.object.modifier_apply(modifier='lp_weights')
bpy.context.view_layer.objects.active = low
for o in scene.objects: o.select_set(o == low)
with bpy.context.temp_override(object=low, active_object=low, selected_objects=[low], selected_editable_objects=[low]):
    bpy.ops.object.vertex_group_clean(group_select_mode='ALL', limit=.002)
    bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
    bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)

# 3b UV0 from the original surface, one UV island per face. Collapse
# interpolation mixes corner UVs across seams (texels from outside an island:
# wrong BaseColor and wrong cloth-mask region). Each low face takes the island
# of the original face under its centre; every corner gets the barycentric UV
# of the nearest point on that island, so a face never spans two islands.
from mathutils.geometry import barycentric_transform
sbm = bmesh.new(); sbm.from_mesh(source.data); sbm.faces.ensure_lookup_table()
suv = sbm.loops.layers.uv.active
island = [-1] * len(sbm.faces); count = 0
for f in sbm.faces:
    if island[f.index] >= 0: continue
    stack = [f]; island[f.index] = count
    while stack:
        g = stack.pop()
        for loop in g.loops:
            e = loop.edge
            for other in e.link_loops:
                h = other.face
                if h is g or island[h.index] >= 0: continue
                # Continuous UV across this edge: both endpoints match.
                a0, a1 = loop[suv].uv, loop.link_loop_next[suv].uv
                b0, b1 = other.link_loop_next[suv].uv, other[suv].uv
                if (a0 - b0).length < 1e-5 and (a1 - b1).length < 1e-5:
                    island[h.index] = count; stack.append(h)
    count += 1
sverts = [v.co.copy() for v in sbm.verts]
all_bvh = BVHTree.FromPolygons(sverts, [[v.index for v in f.verts] for f in sbm.faces])
island_faces = {}
for f in sbm.faces: island_faces.setdefault(island[f.index], []).append(f.index)
island_bvh = {k: BVHTree.FromPolygons(sverts, [[v.index for v in sbm.faces[i].verts] for i in faces]) for k, faces in island_faces.items()}
def uv_at(face_index, point):
    f = sbm.faces[face_index]; loops = list(f.loops)
    a, b, c = (l.vert.co for l in loops[:3]); ua, ub, uc = (l[suv].uv for l in loops[:3])
    w = barycentric_transform(point, a, b, c, Vector((ua.x, ua.y, 0)), Vector((ub.x, ub.y, 0)), Vector((uc.x, uc.y, 0)))
    return w.x, w.y
luv = low.data.uv_layers.active.data; lverts = low.data.vertices; islands_used = set()
for poly in low.data.polygons:
    centre = sum((lverts[i].co for i in poly.vertices), Vector()) / len(poly.vertices)
    k = island[all_bvh.find_nearest(centre)[2]]; islands_used.add(k); faces = island_faces[k]
    for li in poly.loop_indices:
        p = lverts[low.data.loops[li].vertex_index].co
        loc, _, local, _ = island_bvh[k].find_nearest(p)
        luv[li].uv = uv_at(faces[local], loc)
uv_islands = {'original': count, 'used': len(islands_used)}
sbm.free()

# 4 Facets: flat on rigid segments, smooth across strongly blended joints.
lgroups = {g.index: g.name for g in low.vertex_groups}
bend = []
for v in low.data.vertices:
    ws = sorted((g.weight for g in v.groups if g.weight > 0), reverse=True)
    bend.append(1 - (ws[0] if ws else 1))
smooth_faces = 0
for poly in low.data.polygons:
    b = sum(bend[i] for i in poly.vertices) / len(poly.vertices)
    poly.use_smooth = b >= .3
    smooth_faces += poly.use_smooth

# 5 Measurements against the original surface.
src_bm = bmesh.new(); src_bm.from_mesh(source.data); src_bvh = BVHTree.FromBMesh(src_bm)
dist = [src_bvh.find_nearest(v.co)[3] for v in low.data.vertices]
low_bm = bmesh.new(); low_bm.from_mesh(low.data); low_bvh = BVHTree.FromBMesh(low_bm)
back = [low_bvh.find_nearest(v.co)[3] for v in source.data.vertices]
def region_counts(obj):
    g = {x.index: x.name for x in obj.vertex_groups}; c = {}
    for poly in obj.data.polygons:
        names = []
        for i in poly.vertices:
            gs = [x for x in obj.data.vertices[i].groups if x.group in g and x.weight > 0]
            names.append(g[max(gs, key=lambda x: x.weight).group] if gs else '-')
        n = max(set(names), key=names.count); c[n] = c.get(n, 0) + len(poly.vertices) - 2
    return dict(sorted(c.items()))
def sole(obj, side):
    g = {x.index: x.name for x in obj.vertex_groups}; zs = []
    for v in obj.data.vertices:
        gs = [x for x in v.groups if x.group in g and x.weight > 0]
        if gs and side in g[max(gs, key=lambda x: x.weight).group] and ('Foot' in g[max(gs, key=lambda x: x.weight).group] or 'Toe' in g[max(gs, key=lambda x: x.weight).group]): zs.append(v.co.z)
    return {'min': min(zs), 'count': len(zs), 'below1cm': sum(1 for z in zs if z < .01)}
weights = []
for v in low.data.vertices:
    ws = [g.weight for g in v.groups if g.weight > 0]; weights.append((len(ws), sum(ws)))
uv = low.data.uv_layers.active.data
co = [v.co for v in low.data.vertices]
report = {
    'version': version, 'mesh': name, 'blender': bpy.app.version_string,
    'source': {'path': 'dist/players/football-v130.glb', 'sha256': sha(src_glb), 'vertices_welded': len(source.data.vertices), 'triangles': src_tris},
    'decimate': {'type': 'COLLAPSE', 'ratio': ratio, 'symmetry': 'X', 'permissionGroup': 'joints .62, sole .9, boot .35, fingers .25, face .4', 'target': target},
    'triangles': sum(len(p.vertices) - 2 for p in low.data.polygons), 'vertices_welded': len(low.data.vertices),
    'smoothFaces': smooth_faces, 'flatFaces': len(low.data.polygons) - smooth_faces,
    'bounds': {'min': [min(c[i] for c in co) for i in range(3)], 'max': [max(c[i] for c in co) for i in range(3)]},
    'distanceToOriginal': {'max': max(dist), 'mean': sum(dist) / len(dist), 'p95': sorted(dist)[int(len(dist) * .95)]},
    'originalToLow': {'max': max(back), 'mean': sum(back) / len(back), 'p95': sorted(back)[int(len(back) * .95)]},
    'trianglesByDominantBone': region_counts(low), 'originalTrianglesByDominantBone': region_counts(source),
    'sole': {'left': sole(low, 'Left'), 'right': sole(low, 'Right'), 'originalLeft': sole(source, 'Left'), 'originalRight': sole(source, 'Right')},
    'weights': {'maxInfluences': max(w[0] for w in weights), 'unweighted': sum(1 for w in weights if w[0] == 0), 'sumMin': min(w[1] for w in weights), 'sumMax': max(w[1] for w in weights)},
    'uv': {'islands': uv_islands, 'layers': [u.name for u in low.data.uv_layers], 'outside01': sum(1 for l in uv if not (-1e-4 <= l.uv.x <= 1.0001 and -1e-4 <= l.uv.y <= 1.0001))},
    'bones': [b.name for b in rig.data.bones],
}
src_bm.free(); low_bm.free()

# 5b Own UVs and baked textures. Large low-poly faces interpolating the
# original UVs cross concave UV islands (kit-region flecks), so the low mesh
# gets its own unwrap, and BaseColor plus cloth mask are baked from the
# original surface along each facet normal. The mask is a data texture:
# nearest sampling, thresholded back to binary R/G/B, islands padded.
import numpy as np
tex = int(opt.get('--texture', '1024'))
low.data.uv_layers.active.name = 'source_uv'
new_uv = low.data.uv_layers.new(name='lowpoly_uv'); low.data.uv_layers.active = new_uv; new_uv.active_render = True
for o in scene.objects: o.select_set(o == low)
bpy.context.view_layer.objects.active = low
with bpy.context.temp_override(object=low, active_object=low, selected_objects=[low], selected_editable_objects=[low]):
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=.004, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
# Face and hair get twice the texel density of body panels (eyes, brows, hairline).
head_names = {'mixamorig:Head', 'headfront', 'mixamorig:HeadTop_End', 'mixamorig:Neck'}
lg = {g.index: g.name for g in low.vertex_groups}
for poly in low.data.polygons:
    names = []
    for i in poly.vertices:
        gs = [x for x in low.data.vertices[i].groups if x.group in lg and x.weight > 0]
        names.append(lg[max(gs, key=lambda x: x.weight).group] if gs else '')
    if max(set(names), key=names.count) in head_names:
        for li in poly.loop_indices: new_uv.data[li].uv *= 2.0
with bpy.context.temp_override(object=low, active_object=low, selected_objects=[low], selected_editable_objects=[low]):
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=True, margin=.006)
    bpy.ops.object.mode_set(mode='OBJECT')
try: scene.render.engine = 'CYCLES'
except TypeError as e: print(e)
scene.cycles.device = 'CPU'
src_mat = source.data.materials[0]
base_src = next(n.image for n in src_mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image and n.image.size[0] == 4096)
mask_src = bpy.data.images.load(str(root / 'dist/players/cloth-mask.png')); mask_src.colorspace_settings.name = 'Non-Color'
def emit_material(image, data):
    m = bpy.data.materials.new('d6_bake_source'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = image; t.interpolation = 'Closest' if data else 'Linear'
    e = nt.nodes.new('ShaderNodeEmission'); o = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(t.outputs['Color'], e.inputs['Color']); nt.links.new(e.outputs['Emission'], o.inputs['Surface']); return m
def bake(image, data, filename, samples):
    target = bpy.data.images.new(filename, tex, tex, alpha=False, float_buffer=False)
    if data: target.colorspace_settings.name = 'Non-Color'
    source.data.materials.clear(); source.data.materials.append(emit_material(image, data))
    lm = bpy.data.materials.new('d6_bake_target'); lm.use_nodes = True; node = lm.node_tree.nodes.new('ShaderNodeTexImage'); node.image = target; lm.node_tree.nodes.active = node
    low.data.materials.clear(); low.data.materials.append(lm)
    scene.cycles.samples = samples
    for o in scene.objects: o.select_set(o in (source, low))
    bpy.context.view_layer.objects.active = low
    bpy.ops.object.bake(type='EMIT', use_selected_to_active=True, cage_extrusion=.02, max_ray_distance=.06, margin=12, margin_type='EXTEND', use_clear=True)
    if data:
        px = np.empty(tex * tex * 4, dtype=np.float32); target.pixels.foreach_get(px); px = px.reshape(-1, 4)
        px[:, :3] = (px[:, :3] > .5).astype(np.float32); px[:, 3] = 1; target.pixels.foreach_set(px.ravel())
    path = out / (filename + '.png'); target.filepath_raw = str(path); target.file_format = 'PNG'; target.save()
    return path
base_png = bake(base_src, False, name + '_base', 16)
mask_png = bake(mask_src, True, name + '_mask', 1)
low.data.materials.clear()
low.data.uv_layers.remove(low.data.uv_layers['source_uv']); low.data.uv_layers['lowpoly_uv'].name = 'UVMap'
report['textures'] = {'size': tex, 'base': base_png.name, 'mask': mask_png.name, 'bake': 'Cycles EMIT selected-to-active, cage .02 m, ray .06 m, margin 12 px extend; mask nearest + threshold .5; face/hair texel density x2'}

# 6 Export (no animation: the clips stay in football-v130.fbx).
bpy.data.objects.remove(source, do_unlink=True)
for o in scene.objects: o.select_set(o in (rig, low))
bpy.context.view_layer.objects.active = rig
fbx = out / (name + '.fbx'); glb = out / (name + '.glb')
bpy.ops.export_scene.fbx(filepath=str(fbx), use_selection=True, object_types={'ARMATURE', 'MESH'}, global_scale=1.0, apply_unit_scale=True,
    apply_scale_options='FBX_SCALE_UNITS', axis_forward='-Z', axis_up='Y', use_mesh_modifiers=False, mesh_smooth_type='OFF',
    use_armature_deform_only=False, add_leaf_bones=False, bake_anim=False, path_mode='STRIP', embed_textures=False)
bpy.ops.export_scene.gltf(filepath=str(glb), use_selection=True, export_animations=False, export_skins=True, export_normals=True,
    export_texcoords=True, export_materials='NONE', export_yup=True)
report['files'] = {p.name: {'bytes': p.stat().st_size, 'sha256': sha(p)} for p in (fbx, glb, base_png, mask_png)}

# Round trip: what Unity will read.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(fbx), automatic_bone_orientation=False, ignore_leaf_bones=False)
r_rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
r_mesh = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
report['roundTrip'] = {'bones': len(r_rig.data.bones), 'mesh': r_mesh.data.name, 'object': r_mesh.name, 'vertices': len(r_mesh.data.vertices),
    'triangles': sum(len(p.vertices) - 2 for p in r_mesh.data.polygons), 'vertexGroups': len(r_mesh.vertex_groups),
    'passed': len(r_rig.data.bones) == 28 and sum(len(p.vertices) - 2 for p in r_mesh.data.polygons) == report['triangles']}
(out / 'lowpoly-report.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
print('D6_LOWPOLY', json.dumps({k: report[k] for k in ('triangles', 'vertices_welded', 'smoothFaces', 'distanceToOriginal', 'originalToLow', 'sole', 'weights', 'uv', 'roundTrip')}))
assert report['roundTrip']['passed']
