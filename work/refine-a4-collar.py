"""Add a fitted clean crewneck band; leave A4 vertex positions and maps intact."""
import bpy,bmesh,json,pathlib,math
from mathutils import Vector,Matrix
from mathutils.geometry import barycentric_transform
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
assert bpy.app.background
root=pathlib.Path(__file__).resolve().parent.parent
out=root/'docs/spieler-a5-mehransichten';out.mkdir(exist_ok=True)
source=root/'meshy_output/player-a3-quality/player-a4-final.glb'
target=root/'meshy_output/player-a3-quality/player-a5-collar.glb'
native=pathlib.Path('G:/Blenderassets/FM/Spieler-A3-Qualitaet-2026-10-02')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
body=next(o for o in bpy.context.scene.objects if o.type=='MESH');body.name='A5_A4_Body_Unchanged'
original=[body.matrix_world@v.co for v in body.data.vertices]
lo=Vector(tuple(min(p[i] for p in original) for i in range(3)));hi=Vector(tuple(max(p[i] for p in original) for i in range(3)))
scale=1.8/(hi.z-lo.z);center=(hi+lo)/2
def norm(p):return Vector(((p.x-center.x)*scale,(p.y-center.y)*scale,(p.z-lo.z)*scale))
def world(p):return Vector((p.x/scale+center.x,p.y/scale+center.y,p.z/scale+lo.z))
points=[norm(p) for p in original]
original_faces=[list(p.vertices) for p in body.data.polygons]
original_normals=[[body.data.corner_normals[i].vector.copy() for i in p.loop_indices] for p in body.data.polygons]
bvh=BVHTree.FromPolygons(points,original_faces)
# Match the actual front-shirt albedo, instead of inventing a contrasting trim.
image=next(n.image for n in body.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE' and n.image and n.image.colorspace_settings.name=='sRGB')
w,h=image.size;pixels=image.pixels[:];uv=body.data.uv_layers.active.data;colors=[]
for p in body.data.polygons:
 c=sum((points[i] for i in p.vertices),Vector())/len(p.vertices)
 if 1.41<c.z<1.45 and abs(c.x)<.04 and c.y<.015:
  t=sum((uv[i].uv for i in p.loop_indices),Vector((0,0)))/len(p.loop_indices)
  i=(int(t.y*h)%h*w+int(t.x*w)%w)*4;colors.append(pixels[i:i+3])
assert colors
rgb=[sum(c[i] for c in colors)/len(colors) for i in range(3)]
def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
material=bpy.data.materials.new('Clean_Shirt_Crewneck');material.use_nodes=True
node=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
node.inputs['Base Color'].default_value=(*[linear(c) for c in rgb],1)
node.inputs['Roughness'].default_value=.93;node.inputs['Metallic'].default_value=0
body.data.materials.append(material);reassigned=0
bm=bmesh.new();bm.from_mesh(body.data)
edges=[e for e in bm.edges if all(1.465<norm(body.matrix_world@v.co).z<1.565 and abs(norm(body.matrix_world@v.co).x)<.145 for v in e.verts)]
bmesh.ops.subdivide_edges(bm,edges=edges,cuts=5,use_grid_fill=True)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
bm.to_mesh(body.data);bm.free();body.data.update()
bpy.context.view_layer.objects.active=body;body.select_set(True)
if body.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
for face in body.data.polygons:face.use_smooth=True
body.data.set_sharp_from_angle(angle=math.radians(55))
refined_points=[norm(body.matrix_world@v.co) for v in body.data.vertices]
def color_region(c):
 angle=math.atan2(c.y-.045,c.x);radius=math.hypot(c.x,c.y-.045)
 neckline=1.522+.022*math.sin(angle)+.012*math.cos(angle)**2
 return .052<radius<.115 and neckline-.034<c.z<neckline-.001
for face in body.data.polygons:
 if all(color_region(refined_points[i]) for i in face.vertices):
  face.material_index=1;reassigned+=1
# Interpolate the accepted A4 split normals onto locally inserted vertices.
# This retains the source shading instead of faceting the exposed neck.
loop_normals=[None]*len(body.data.loops)
for face in body.data.polygons:
 c=sum((refined_points[i] for i in face.vertices),Vector())/len(face.vertices)
 hit,n,index,d=bvh.find_nearest(c);ids=original_faces[index];ns=original_normals[index]
 assert len(ids)==3
 for loop_index in face.loop_indices:
  p=refined_points[body.data.loops[loop_index].vertex_index]
  loop_normals[loop_index]=barycentric_transform(p,*[points[i] for i in ids],*ns).normalized()
body.data.normals_split_custom_set(loop_normals)
segments=128;rows=7;radii=[];heights=[]
for j in range(rows):
 t=j/(rows-1);ring=[];zs=[]
 for i in range(segments):
  angle=2*math.pi*i/segments;direction=Vector((math.cos(angle),math.sin(angle),0))
  z=1.522+.022*math.sin(angle)+.012*math.cos(angle)**2-.020*t
  origin=Vector((0,.045,z));hit,normal,index,distance=bvh.ray_cast(origin,direction,.25)
  assert hit is not None,(j,i,z)
  ring.append(min(distance,.083));zs.append(z)
 # Regularize the ragged imported neckline while following its overall section.
 for _ in range(3):ring=[(ring[(i-1)%segments]+2*ring[i]+ring[(i+1)%segments])/4 for i in range(segments)]
 radii.append(ring);heights.append(zs)
verts=[]
for j in range(rows):
 t=j/(rows-1)
 for i in range(segments):
  angle=2*math.pi*i/segments
  # Lift the band enough to cover the original rough seam, taper at outer edge.
  r=radii[j][i]+.0015+.0005*math.sin(math.pi*t)
  verts.append(world(Vector((r*math.cos(angle),.045+r*math.sin(angle),heights[j][i]))))
faces=[]
for j in range(rows-1):
 for i in range(segments):faces.append((j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i))
mesh=bpy.data.meshes.new('Fitted_Crewneck_Band');mesh.from_pydata(verts,[],faces);mesh.update()
collar=bpy.data.objects.new('A5_Clean_Crewneck',mesh);bpy.context.collection.objects.link(collar);mesh.materials.append(material)
for p in mesh.polygons:p.use_smooth=True
assert max(bvh.find_nearest(p)[3] for p in refined_points)<1e-6
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);collar.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_animations=False)
# Verify the actual exported body and closed band from a fresh import.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(target))
objects=[o for o in bpy.context.scene.objects if o.type=='MESH'];assert len(objects)==2
rebody=next(o for o in objects if o.name.startswith('A5_A4_Body'))
result=[rebody.matrix_world@v.co for v in rebody.data.vertices]
def distance(a,b):
 tree=KDTree(len(b))
 for i,p in enumerate(b):tree.insert(p,i)
 tree.balance();return max(tree.find(p)[2] for p in a)
error=max(distance(original,result),max(bvh.find_nearest(norm(p))[3]/scale for p in result));assert error<1e-6
reb=next(o for o in objects if o!=rebody)
assert all(math.isfinite(c) for o in objects for v in o.data.vertices for c in v.co)
names=[o.name for o in objects]
# Preserve the isolated native camera/lights, aligning both model pieces together.
bpy.ops.wm.open_mainfile(filepath=str(native/'Doppel6-A4-Qualitaet-4K.blend'))
old=[o for o in bpy.context.scene.objects if o.type=='MESH'];assert len(old)==1
alignment=old[0].matrix_world.copy()
for o in old:bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.import_scene.gltf(filepath=str(target))
for o in bpy.context.scene.objects:
 if o.type=='MESH':o.matrix_world=alignment@o.matrix_world
for img in bpy.data.images:
 if not img.has_data and img.source=='FILE':_=img.pixels[0]
 if img.has_data and not img.packed_file:img.pack()
file=native/'Doppel6-A5-Kragen.blend';bpy.ops.wm.save_as_mainfile(filepath=str(file))
bpy.context.scene.render.filepath=str(out/'blender-gesicht.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.open_mainfile(filepath=str(file));assert len([o for o in bpy.context.scene.objects if o.type=='MESH'])==2
report={'source':str(source),'model':str(target),'native':str(file),'nativeReopened':True,'sourceBodyVertices':len(original),'bodyMaxPositionErrorMetres':error/scale,'collarQuads':len(faces),'collarSegments':segments,'collarRows':rows,'collarFacesReassigned':reassigned,'sampledShirtAlbedoSRGB':rgb,'finite':True,'additionalMeshyCredits':0}
(out/'asset-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
