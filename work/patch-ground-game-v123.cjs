const fs=require('fs');
const changes={
 'dist/game.js':[
  ['const possession=owner?owner.t:m.flight?m.flight.team:0','const possession=typeof v123PossessionTeam===\'function\'&&v65WorldActive?v123PossessionTeam(m):owner?owner.t:m.flight?m.flight.team:0'],
  ['const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),speed=',"if(typeof v123DribbleTarget==='function')v123DribbleTarget(m,p,realDelta);const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),speed="],
  ['pace=p.keeper?2.6+ability(p,\'spd\')*.065:3+ability(p,\'spd\')*.14','pace=(p.keeper?2.6+ability(p,\'spd\')*.065:3+ability(p,\'spd\')*.14)*(world&&owner===p&&!p.keeper?.78+ability(p,\'tec\')*.009:1)'],
  ['m.ball.x=m.owner.x+.016;m.ball.y=m.owner.y+(m.owner.t===0?-.022:.022);',"const control=typeof v123OwnedBall==='function'&&v123OwnedBall(m);m.ball.x=control?control.x:m.owner.x+.016;m.ball.y=control?control.y:m.owner.y+(m.owner.t===0?-.022:.022);"]
 ],
 'dist/pitch-v56.js':[
  ['if(m.owner)m.ball={x:m.owner.x+.016,y:m.owner.y+(m.owner.t===0?-.022:.022)};',"if(m.owner)m.ball=typeof v123OwnedBall==='function'&&v123OwnedBall(m)||{x:m.owner.x+.016,y:m.owner.y+(m.owner.t===0?-.022:.022)};"]
 ]
};
for(const [file,pairs]of Object.entries(changes)){let source=fs.readFileSync(file,'utf8');for(const [from,to]of pairs){if(!source.includes(from))throw Error('Missing replacement '+from);source=source.replace(from,to)}fs.writeFileSync(file,source);}
