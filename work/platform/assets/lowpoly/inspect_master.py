"""Read-only inspection of the Release 130 master GLB (background Blender)."""
import bpy, json, pathlib, sys
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[4]
glb=root/'dist/players/football-v130.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(glb))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
me=mesh.data
groups={g.index:g.name for g in mesh.vertex_groups}
counts={}
maxinf=0
for v in me.vertices:
    gs=[g for g in v.groups if g.weight>0]
    maxinf=max(maxinf,len(gs))
    if gs:
        top=max(gs,key=lambda g:g.weight);counts[groups[top.group]]=counts.get(groups[top.group],0)+1
co=[mesh.matrix_world@v.co for v in me.vertices]
out={'mesh':mesh.name,'data':me.name,'vertices':len(me.vertices),'faces':len(me.polygons),'tris':sum(len(p.vertices)-2 for p in me.polygons),
 'uv':[u.name for u in me.uv_layers],'attributes':[(a.name,a.domain,a.data_type) for a in me.attributes],
 'matrix_world':[list(r) for r in mesh.matrix_world],'parent':mesh.parent.name if mesh.parent else None,
 'rig':rig.name,'rigMatrix':[list(r) for r in rig.matrix_world],'bones':[(b.name,b.parent.name if b.parent else None,list(b.head_local),list(b.tail_local)) for b in rig.data.bones],
 'vertexGroups':list(groups.values()),'maxInfluences':maxinf,'dominantCounts':counts,
 'bounds':{'min':[min(c[i] for c in co) for i in range(3)],'max':[max(c[i] for c in co) for i in range(3)]},
 'materials':[m.name for m in me.materials],'seams':sum(1 for e in me.edges if e.use_seam),'sharp':sum(1 for e in me.edges if e.use_edge_sharp),
 'manifold_boundary_edges':None}
import bmesh
bm=bmesh.new();bm.from_mesh(me)
out['manifold_boundary_edges']=sum(1 for e in bm.edges if e.is_boundary)
out['islands_uv_seam_edges']=sum(1 for e in bm.edges if not e.is_boundary and any(True for _ in [0]) and e.seam)
# UV discontinuity edges (different UVs across an edge)
uvl=bm.loops.layers.uv.active
disc=0
for e in bm.edges:
    if len(e.link_loops)==2:
        l1,l2=e.link_loops
        a1,b1=l1[uvl].uv,l1.link_loop_next[uvl].uv
        a2,b2=l2.link_loop_next[uvl].uv,l2[uvl].uv
        if (a1-a2).length>1e-5 or (b1-b2).length>1e-5:disc+=1
out['uv_discontinuous_edges']=disc
bm.free()
(root/'outputs/style-demos/lowpoly/master-inspection.json').write_text(json.dumps(out,indent=1))
print('D6_INSPECT',json.dumps({k:out[k] for k in ['mesh','vertices','faces','tris','uv','maxInfluences','bounds','parent','materials','manifold_boundary_edges','uv_discontinuous_edges']}))
