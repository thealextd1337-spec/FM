"""Rasterize editable clothing regions in the original UV layout; retain all Meshy pixels."""
import json,pathlib
import numpy as np
from PIL import Image,ImageFilter
root=pathlib.Path(__file__).resolve().parent.parent
folder=root/'meshy_output/user-character-2026-10-03'
data=json.loads((folder/'cloth-input.json').read_text())
positions=np.array(data['positions']);uv=np.array(data['uv']);indices=np.array(data['indices']).reshape(-1,3)
image=np.array(Image.open(folder/'base-color.jpg').convert('RGB'));height,width=image.shape[:2]
assert (width,height)==(2048,2048)
labels=np.zeros((height,width),dtype=np.uint8);occupied=np.zeros_like(labels,dtype=bool)
for triangle in indices:
 coords=uv[triangle]*[width,height]-0.5
 left,top=np.maximum(np.floor(coords.min(axis=0)).astype(int),0)
 right,bottom=np.minimum(np.ceil(coords.max(axis=0)).astype(int),[width-1,height-1])
 if right<left or bottom<top:continue
 ax,ay=coords[0];bx,by=coords[1];cx,cy=coords[2]
 denominator=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
 if abs(denominator)<1e-8:continue
 x,y=np.meshgrid(np.arange(left,right+1),np.arange(top,bottom+1))
 w0=((by-cy)*(x-cx)+(cx-bx)*(y-cy))/denominator
 w1=((cy-ay)*(x-cx)+(ax-cx)*(y-cy))/denominator;w2=1-w0-w1
 inside=(w0>=-1e-5)&(w1>=-1e-5)&(w2>=-1e-5)
 p=w0[...,None]*positions[triangle[0]]+w1[...,None]*positions[triangle[1]]+w2[...,None]*positions[triangle[2]]
 r,g,b=np.moveaxis(image[top:bottom+1,left:right+1].astype(float),-1,0)
 blue=(b>r*1.12)&(b>g*1.08)&(b>20)
 # Warm skin/hair and black boots remain outside every clothing mask.
 shirt=blue&(p[...,1]>.90)&(p[...,1]<1.45)&(abs(p[...,0])<.40)
 warm_skin=(r>b*1.32)&(g>b*1.16)&(r>95)&(g>55)
 shorts=(~warm_skin)&(p[...,1]>.64)&(p[...,1]<.93)&(abs(p[...,0])<.25)
 # Choose the royal-blue shirt hem above the navy waistband.
 shorts &= ~((p[...,1]>.89)&(b>85)&(b>r*1.12))
 # Include dark fabric pixels and filtered UV edges so white seams do not survive recoloring.
 socks=(~warm_skin)&(p[...,1]>.14)&(p[...,1]<.52)
 region=np.zeros_like(inside,dtype=np.uint8);region[shirt]=1;region[shorts]=2;region[socks]=3
 patch=labels[top:bottom+1,left:right+1];patch[inside]=region[inside]
 occupied[top:bottom+1,left:right+1]|=inside
mask=np.stack([np.where(labels==n,255,0).astype(np.uint8) for n in [1,2,3]],axis=-1)
# Extend only into unused UV gutters, never into another surface's occupied pixels.
for channel in range(3):
 expanded=np.array(Image.fromarray(mask[...,channel]).filter(ImageFilter.MaxFilter(5)))
 mask[...,channel]=np.where(occupied,mask[...,channel],expanded)
Image.fromarray(mask).save(folder/'cloth-mask.png')
Image.fromarray(labels).save(folder/'cloth-labels.png')
references=[float(np.median(image[labels==n].max(axis=1)))/255 for n in [1,2,3]]
counts=[int(np.sum(labels==n)) for n in [1,2,3]]
assert all(c>10000 for c in counts),counts
report={'resolution':[width,height],'channels':{'red':'jersey','green':'shorts','blue':'socks'},'pixelCounts':dict(zip(['jersey','shorts','socks'],counts)),'referenceBrightness':references,'meshAndUVsModified':False,'source':'Meshy base color plus rasterized original model positions','limitation':'Editable fabric pixels; contrasting fixed seams and skin remain intact. Artistic seam inspection still required.'}
(root/'docs/spieler-nutzer-rig/cloth-mask-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
