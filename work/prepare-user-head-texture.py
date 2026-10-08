"""Use Meshy's new albedo only on the original head UV surface."""
import pathlib,json,sys
import numpy as np
from PIL import Image,ImageFilter
root=pathlib.Path(__file__).resolve().parent.parent
folder=root/'meshy_output/user-character-2026-10-03';stage=folder/('head-retexture-v2' if '--variant2' in sys.argv else 'head-retexture')
data=json.loads((stage/'mask-input.json').read_text())
pos=np.array(data['positions']);uv=np.array(data['uv']);indices=np.array(data['indices']).reshape(-1,3)
joints=np.array(data['joints']);weights=np.array(data['weights'])
head=np.sum(weights*np.isin(joints,data['headJointIndices']),axis=1)
new=Image.open(stage/'meshy-base.image').convert('RGB');assert new.size==(4096,4096)
old=Image.open(stage/'before-base.image').convert('RGB').resize(new.size,Image.Resampling.NEAREST)
cloth=Image.open(folder/'cloth-mask.png').resize(new.size,Image.Resampling.NEAREST)
old_array=np.array(old);new_array=np.array(new);protected=np.max(np.array(cloth),axis=2)>127
height,width=new_array.shape[:2];mask=np.zeros((height,width),dtype=np.uint8);occupied=np.zeros_like(mask,dtype=bool)
for tri in indices:
 coords=uv[tri]*[width,height]-.5
 left,top=np.maximum(np.floor(coords.min(axis=0)).astype(int),0);right,bottom=np.minimum(np.ceil(coords.max(axis=0)).astype(int),[width-1,height-1])
 if right<left or bottom<top:continue
 ax,ay=coords[0];bx,by=coords[1];cx,cy=coords[2];den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
 if abs(den)<1e-8:continue
 x,y=np.meshgrid(np.arange(left,right+1),np.arange(top,bottom+1));w0=((by-cy)*(x-cx)+(cx-bx)*(y-cy))/den;w1=((cy-ay)*(x-cx)+(ax-cx)*(y-cy))/den;w2=1-w0-w1
 inside=(w0>=-1e-5)&(w1>=-1e-5)&(w2>=-1e-5)
 p=w0[...,None]*pos[tri[0]]+w1[...,None]*pos[tri[1]]+w2[...,None]*pos[tri[2]]
 score=w0*head[tri[0]]+w1*head[tri[1]]+w2*head[tri[2]]
 strength=np.clip((p[...,1]-1.36)/.05,0,1)*np.clip((score-.25)/.35,0,1)
 strength=np.where(abs(p[...,0])<.24,strength,0)
 strength=np.where(protected[top:bottom+1,left:right+1],0,strength)
 patch=mask[top:bottom+1,left:right+1];patch[inside]=np.round(strength[inside]*255).astype(np.uint8)
 occupied[top:bottom+1,left:right+1]|=inside
expanded=np.array(Image.fromarray(mask).filter(ImageFilter.MaxFilter(7)));mask=np.where(occupied,mask,expanded)
mask[protected]=0
alpha=mask.astype(np.float32)[...,None]/255
merged=np.round(old_array*(1-alpha)+new_array*alpha).astype(np.uint8)
assert np.array_equal(merged[mask==0],old_array[mask==0]);assert np.array_equal(merged[protected],old_array[protected])
Image.fromarray(mask).save(stage/'head-mask.png');Image.fromarray(merged).save(stage/'head-merged-base.png')
Image.fromarray(old_array).save(stage/'previous-base-4k.png')
cloth.save(stage/'cloth-mask-4k.png')
report={'resolution':[width,height],'source':'Meshy 4K retexture albedo; original UV geometry, head/neck bone weights and clothing mask','newHeadPixels':int(np.sum(mask>0)),'fullReplacementPixels':int(np.sum(mask==255)),'outsideHeadPixelChanges':0,'protectedClothingPixelChanges':0,'neckTransition':'5 cm geometric blend above original mesh Y 1.36','originalBodyUpscale':'nearest-neighbor 2K to 4K; decoded source pixels preserved exactly','normalAndMaterialMaps':'Retained from previous character'}
(root/'docs/spieler-nutzer-rig/head-mask-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
