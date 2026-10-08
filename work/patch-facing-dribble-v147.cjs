const fs=require('fs');function edit(f,a,b){const s=fs.readFileSync(f,'utf8');if(!s.includes(a))throw Error(f+' seam');fs.writeFileSync(f,s.replace(a,b));}
edit('dist/i18n-v75.js','Verhandlung öffnen\tOpen negotiation','Verhandlung öffnen\tOpen negotiation\nVerlängern\tRenew contract');
edit('dist/world-start-v61.css','body.v65-world-match #v65-plan-view .v64-prematch-field .player-label{order:1;margin-top:0}','body.v65-world-match #v65-plan-view .v64-prematch-field .player-label{order:1;margin-top:4px}');
edit('dist/world-pitch3d-v98.js',' const ball=v98PitchPoint(rawBall,turned);',` const ball=v98PitchPoint(rawBall,turned);
 const restartFacing=Boolean(current.throwIn||current.setPiece?.type==='corner'||current.owner?.keeper&&v99Actions.get(current)?.kicks.get(current.owner.pid)?.phase==='waiting');
 const restartTaker=current.throwIn?.taker||current.setPiece?.taker||current.owner;`);
edit('dist/world-pitch3d-v98.js',"const mode=typeof v108MovementMode==='function'?v108MovementMode(current,person):null;", "const mode=restartFacing&&person!==restartTaker?{mode:'restart',facing:rawBall}:typeof v108MovementMode==='function'?v108MovementMode(current,person):null;");
edit('dist/pitch-motion-v102.js','if(speed>.10||person.keeper&&focus){const face=person.keeper?focus:person.movement?.mode===\'backpedal\'?person.movement.facing:null',"if(speed>.10||person.keeper&&focus||person.movement?.mode==='restart'){const face=person.keeper?focus:['backpedal','restart'].includes(person.movement?.mode)?person.movement.facing:null");
edit('dist/player-user-motion-v108.js',"  state.carrying=carrying;", "  const restartFacing=person.movement?.mode==='restart';if(restartFacing){idleHeading=null;if(state.transition?.name.startsWith('turn_'))state.transition=null;}\n  state.carrying=carrying;");
edit('dist/player-user-motion-v108.js','else if(!person.keeper&&!teleport&&!backward){','else if(!person.keeper&&!teleport&&!backward&&!restartFacing){');
edit('dist/player-user-motion-v108.js','state.idleTurning=!person.keeper&&!special&&!celebrating&&!carrying&&speed<.25&&idleHeading!==null;',"state.idleTurning=!person.keeper&&!special&&!celebrating&&!carrying&&speed<.25&&(idleHeading!==null||restartFacing&&Math.abs(angle(state.facingHeading??v.heading,v.heading))>.001);state.facingHeading=v.heading;");
edit('dist/player-user-motion-v108.js','  if(state.idleTurning)for(const f of feet){f.locked=false;f.blocked=false;f.age=0}',`  const freeStride=state.carrying&&state.previousSpeed>.25;
  if(state.idleTurning||freeStride)for(const f of feet){f.locked=false;f.blocked=false;f.age=0;if(freeStride)f.strength=0}`);
edit('dist/player-user-motion-v108.js','if(state.idleTurning||!f.locked', 'if(state.idleTurning||freeStride||!f.locked');
edit('dist/player-user-motion-v108.js','if(!state.idleTurning&&!f.locked', 'if(!state.idleTurning&&!freeStride&&!f.locked');
