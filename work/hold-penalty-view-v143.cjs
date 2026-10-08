const fs=require('fs');let file='dist/world-pitch-actions-v99.js',s=fs.readFileSync(file,'utf8');s+=`
// Keep the goal view visible before resolving a regular world-match penalty.
const v143BaseTakePenalty=v50TakePenalty;
v50TakePenalty=function(setPiece){
 if(v65WorldActive&&setPiece.phase==='waiting'&&!setPiece.penaltyReady){setPiece.penaltyReady=true;setPiece.wait=2;v50PenaltyVisual(setPiece,null);return;}
 return v143BaseTakePenalty(setPiece);
};
`;fs.writeFileSync(file,s);
file='dist/world-pitch3d-v98.js';s=fs.readFileSync(file,'utf8').replace("scene.classList.toggle('v100-penalty-award',!last);","scene.classList.toggle('v100-penalty-award',!last&&!setPiece.penaltyReady);\n if(!last&&setPiece.penaltyReady)scene.querySelector('.v78-penalty-referee')?.remove();").replace('if(!last)scene.innerHTML=`<img src="${v55RefereeAsset(\'penalty\')}"','if(!last&&!setPiece.penaltyReady)scene.innerHTML=`<img src="${v55RefereeAsset(\'penalty\')}"');fs.writeFileSync(file,s);
