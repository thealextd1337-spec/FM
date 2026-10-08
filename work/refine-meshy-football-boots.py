"""Low-cut soccer cleats on the existing textured/skinned character."""
import bpy,json,sys,pathlib,math
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
assert bpy.app.background, 'Use a separate --factory-startup background process'
source=pathlib.Path(sys.argv[sys.argv.index('--')+1])
out=source.parent/'football-boots-v4';out.mkdir(exist_ok=True)
reports=[]
for name in ('rigged','walking','running'):
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for action in list(bpy.data.actions):bpy.data.actions.remove(action)
    bpy.context.scene.render.fps=30
    bpy.ops.import_scene.gltf(filepath=str(source/(name+'.glb')))
    arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
    body=next(o for o in bpy.context.scene.objects if o.type=='MESH')
    to_world=body.matrix_world.copy();from_world=to_world.inverted()
    feet={}
    for side in ('Left','Right'):
        ankle=arm.matrix_world@arm.data.bones[side+'Foot'].head_local
        toe=arm.matrix_world@arm.data.bones[side+'ToeBase'].head_local
        forward=toe-ankle;forward.z=0;forward.normalize()
        lateral=Vector((-forward.y,forward.x,0))
        feet[side]=(ankle,forward,lateral)
    # Preserve the foot joints, taper the boot and lower its bulky upper.
    changed=0
    for vertex in body.data.vertices:
        p=to_world@vertex.co
        if p.z>=.16:continue
        side='Left' if p.x>0 else 'Right';ankle,forward,lateral=feet[side]
        factor=max(0,min(1,(.16-p.z)/.06))
        u=(p-ankle).dot(lateral);p-=lateral*u*.14*factor
        if p.z<.025:p.z=.016+.006*max(0,p.z)/.025
        elif p.z<.1:p.z=.022+(p.z-.025)*.8
        else:p.z-=.018*factor
        vertex.co=from_world@p;changed+=1
    body.data.update()
    detail_mat=bpy.data.materials.new('Football_Boot_Details');detail_mat.use_nodes=True
    shader=next(n for n in detail_mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Roughness'].default_value=.7
    colors=detail_mat.node_tree.nodes.new('ShaderNodeVertexColor');colors.layer_name='BootDetails'
    detail_mat.node_tree.links.new(colors.outputs[0],shader.inputs['Base Color'])
    body.data.materials.append(detail_mat);detail_slot=len(body.data.materials)-1
    attr=body.data.color_attributes.new(name='BootDetails',type='FLOAT_COLOR',domain='CORNER')
    for value in attr.data:value.color=(1,1,1,1)
    points=[to_world@v.co for v in body.data.vertices]
    polygons=[tuple(p.vertices) for p in body.data.polygons]
    # The former high boot shaft becomes the lower sock/ankle region.
    sock_faces=0
    for polygon in body.data.polygons:
        center=sum((points[i] for i in polygon.vertices),Vector())/len(polygon.vertices)
        side='Left' if center.x>0 else 'Right';ankle,forward,lateral=feet[side]
        along=(center-ankle).dot(forward)
        if center.z<.17:
            polygon.material_index=detail_slot;sock_faces+=1
            for loop in polygon.loop_indices:
                point=points[body.data.loops[loop].vertex_index]
                distance=(point-ankle).dot(forward)
                collar=.080+.015*max(0,min(1,(distance+.02)/.08))
                blend=max(0,min(1,(point.z-collar)/.008+.5))
                attr.data[loop].color=tuple(a+(b-a)*blend for a,b in zip((.025,.035,.044,1),(.80,.79,.70,1)))
    bvh=BVHTree.FromPolygons(points,polygons,all_triangles=True)
    verts=[];faces=[];face_colors=[]
    dark=(.045,.058,.060,1);rim=(.44,.48,.43,1);lace=(.82,.83,.73,1)
    def add_face(indices,color):faces.append(tuple(indices));face_colors.append(color)
    def local(side,u,s,z):
        ankle,forward,lateral=feet[side]
        p=ankle+lateral*u+forward*s;p.z=z
        return p
    def surface(side,u,s):
        p=local(side,u,s,.205)
        hit,normal,index,distance=bvh.ray_cast(p,Vector((0,0,-1)),.21)
        assert hit is not None, 'Laces must lie on the boot surface'
        return hit+Vector((0,0,.0025))
    for side in ('Left','Right'):
        # Thin shaped plate instead of a chunky trainer sole.
        outline=[(-.027,-.073),(.027,-.073),(.034,-.037),(.045,.055),(.046,.126),(.031,.177),(0,.196),(-.031,.177),(-.046,.126),(-.045,.055),(-.034,-.037)]
        start=len(verts);count=len(outline)
        verts.extend(local(side,u,s,z) for z in (.014,.021) for u,s in outline)
        for i in range(count):add_face((start+i,start+(i+1)%count,start+count+(i+1)%count,start+count+i),rim)
        add_face(tuple(start+count+i for i in range(count)),dark)
        add_face(tuple(start+i for i in reversed(range(count))),dark)
        # Three forward pairs plus a heel pair: eight firm-ground studs per shoe.
        studs=[(-.023,-.040),(.023,-.040),(-.031,.052),(.031,.052),(-.032,.106),(.032,.106),(-.021,.151),(.021,.151)]
        for u,s in studs:
            start=len(verts)
            for z,r in ((0,.0048),(.015,.0065)):
                for i in range(6):verts.append(local(side,u+r*math.cos(i*math.tau/6),s+r*math.sin(i*math.tau/6),z))
            for i in range(6):add_face((start+i,start+(i+1)%6,start+6+(i+1)%6,start+6+i),dark)
            add_face(tuple(start+i for i in reversed(range(6))),dark)
        # Five compact X-shaped lace rows, projected onto the actual upper.
        for s in (.066,.081,.096,.111,.126):
            for direction in (-1,1):
                for segment in range(3):
                    u0=-.020+.040*segment/3;u1=-.020+.040*(segment+1)/3
                    s0=s+direction*.004*u0/.020;s1=s+direction*.004*u1/.020
                    start=len(verts)
                    verts.extend(surface(side,u,t) for u,t in ((u0,s0-.0012),(u1,s1-.0012),(u1,s1+.0012),(u0,s0+.0012)))
                    add_face((start,start+1,start+2,start+3),lace)
    detail_mesh=bpy.data.meshes.new('Soccer_Cleat_Accents');detail_mesh.from_pydata(verts,[],faces);detail_mesh.update()
    details=bpy.data.objects.new('Soccer_Cleat_Accents',detail_mesh);bpy.context.collection.objects.link(details)
    details.data.materials.append(detail_mat)
    detail_colors=details.data.color_attributes.new(name='BootDetails',type='FLOAT_COLOR',domain='CORNER')
    for polygon,color in zip(details.data.polygons,face_colors):
        for loop in polygon.loop_indices:detail_colors.data[loop].color=color
    groups={g.index:g.name for g in body.vertex_groups}
    for group_name in groups.values():details.vertex_groups.new(name=group_name)
    # Interpolate the source triangle's weights so details stay with the upper.
    for i,p in enumerate(verts):
        hit,normal,index,distance=bvh.find_nearest(p);ids=polygons[index]
        bary=barycentric_transform(hit,*[points[j] for j in ids],Vector((1,0,0)),Vector((0,1,0)),Vector((0,0,1)))
        weighted={}
        for j,amount in zip(ids,bary):
            for group in body.data.vertices[j].groups:weighted[groups[group.group]]=weighted.get(groups[group.group],0)+max(0,amount)*group.weight
        total=sum(weighted.values());assert total>0
        for gn,weight in weighted.items():
            if weight>1e-8:details.vertex_groups[gn].add([i],weight/total,'REPLACE')
    bpy.ops.object.select_all(action='DESELECT');body.select_set(True);details.select_set(True);bpy.context.view_layer.objects.active=body
    bpy.ops.object.join();body.data.update()
    for action in bpy.data.actions:
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        for key in curve.keyframe_points:
                            rounded=round(key.co.x)
                            if abs(key.co.x-rounded)<1e-4:
                                delta=rounded-key.co.x;key.co.x=rounded;key.handle_left.x+=delta;key.handle_right.x+=delta
                        curve.update()
    bpy.ops.object.select_all(action='DESELECT');body.select_set(True);arm.select_set(True)
    from io_scene_gltf2 import get_format_items
    assert 'GLB' in [item[0] for item in get_format_items(None,bpy.context)]
    bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=True)
    if name=='rigged':bpy.ops.wm.save_as_mainfile(filepath=str(out/'Meshy-B-Fussballschuhe-v4.blend'))
    reports.append({'asset':name,'bones':len(arm.data.bones),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'materials':len(body.data.materials),'changedVertices':changed,'sockFaces':sock_faces,'studs':16,'laceRows':10})
(out/'refinement.json').write_text(json.dumps({'source':str(source),'additionalMeshyCredits':0,'reports':reports},indent=2))
print('BOOT_RESULT '+json.dumps(reports))
