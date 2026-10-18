'use strict';
const assert=require('node:assert/strict'),{create}=require('./native183-scenes.cjs');
const h=create({view:true,goalScene:true});
const rows=h.evaluate(`(()=>{
 const rows=[];
 for(const size of ['standard','large']){
  Native183.constructed({seed:'dribble-r133',roles:true,size});let carrierFrames=0,fakeWindups=0,releaseFrames=0;
  for(let i=0;i<800&&!match.finished;i++){
   Native183.advance();
   for(const p of match.people){const a=v102PlayerAction(match,p);if(['pass','shot','highPass','cross'].includes(a?.kind))releaseFrames++;}
   const p=match.owner;if(!p||p.keeper||match.flight||match.setPiece||match.goalPause||match.kickoff)continue;
   carrierFrames++;if(v102PlayerAction(match,p)?.id==='kick-ready')fakeWindups++;
  }
  rows.push({size,carrierFrames,fakeWindups,releaseFrames});
 }
 return rows;
})()`);
for(const row of rows){assert.ok(row.carrierFrames>30,'Real dribble exposure');assert.equal(row.fakeWindups,0,`${row.size}: generic decision timer created ${row.fakeWindups}/${row.carrierFrames} fake shot windups`);assert.ok(row.releaseFrames>0,'Actual release animations retained');}
console.log('PASS actual native dribbling without fabricated shot countdown; committed releases retained: '+JSON.stringify(rows));
