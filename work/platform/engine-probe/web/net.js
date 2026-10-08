(function(root){'use strict';
// A compliant local net patch, shared by simulation and rendering. Fixed attachments remain still.
function step(s,h,emit,applyForce=true){
 s.netPatches??=[];
 for(const patch of s.netPatches){patch.touching=false;patch.velocity+=(-65*patch.displacement-7*patch.velocity)*h;patch.displacement+=patch.velocity*h;if(Math.abs(patch.displacement)+Math.abs(patch.velocity)<.0001){patch.displacement=0;patch.velocity=0;}}
 if(!s.goalSign)return;
 const g=s.geometry,b=s.ball,p=b.position,v=b.velocity,sign=s.goalSign,depth=sign*p[0]-g.length/2;
 if(depth<0||(!applyForce&&depth>4)){for(const patch of s.netPatches)patch.contacting=false;return;}
 const panels=[{panel:'back',axis:0,out:sign,limit:g.length/2+2.2-b.radius},{panel:'left',axis:2,out:-1,limit:g.goalWidth/2-b.radius},{panel:'right',axis:2,out:1,limit:g.goalWidth/2-b.radius},{panel:'roof',axis:1,out:1,limit:g.goalHeight-b.radius}];
 for(const plane of panels){const {panel,axis,out,limit}=plane,penetration=p[axis]*out-limit;if(penetration<=0)continue;
  if(panel==='back'&&(Math.abs(p[2])>g.goalWidth/2+.1||p[1]>g.goalHeight+.1))continue;
  if(panel!=='back'&&depth>2.2+.1)continue;
  let patch=s.netPatches.find(q=>q.panel===panel&&q.goalSign===sign);
  const contact=patch&&patch.contacting;
  if(!patch){patch={panel,goalSign:sign,position:[...p],displacement:0,velocity:0,peak:0,touching:false,contacting:false};s.netPatches.push(patch);}
  if(!contact&&emit)emit('net-contact',panel==='back'?'Rücknetz':panel==='roof'?'Netzdach':'Seitennetz');
  const amount=Math.min(1.6,penetration),speed=v[axis]*out;
  patch.position=[...p];patch.position[axis]=out*(limit+b.radius);patch.displacement=amount;patch.velocity=speed;patch.peak=Math.max(patch.peak,amount);patch.touching=true;
  if(applyForce){v[axis]-=out*Math.max(0,90*penetration+24*speed)*h;if(penetration>1.6){p[axis]=out*(limit+1.6);if(v[axis]*out>0)v[axis]=0;}}
 }
 for(const patch of s.netPatches)patch.contacting=patch.touching;
}
function weight(g,p,panel){
 const depth=Math.abs(p[0])-g.length/2,half=g.goalWidth/2;
 const edges=panel==='back'?[p[1],g.goalHeight-p[1],p[2]+half,half-p[2]]:panel==='roof'?[depth,2.2-depth,p[2]+half,half-p[2]]:[depth,2.2-depth,p[1],g.goalHeight-p[1]];
 const x=Math.max(0,Math.min(1,Math.min(...edges)/.4));return x*x*(3-2*x);
}
function displacement(g,p,patch){const axis=patch.panel==='back'?0:patch.panel==='roof'?1:2;let d=0;for(let i=0;i<3;i++)if(i!==axis)d+=(p[i]-patch.position[i])**2;return patch.displacement*Math.min(1.4,weight(g,p,patch.panel)/Math.max(.05,weight(g,patch.position,patch.panel)))*Math.exp(-d/(2*.95*.95));}
const api={step,displacement};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.D6Net=api;
})(typeof globalThis!=='undefined'?globalThis:this);
