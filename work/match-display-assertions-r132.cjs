'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(page,label='surfaces')=>{
 const rows=await page.evaluate(()=>{
  const c=v61CurrentCareer,active=c.world.activeMatch,current=match,world=v65WorldActive,live=running,savedFormation=formation,view=v98View;
  const rows=[];running=false;v98View='2d';
  try{
   for(const ownSide of [0,1]){
    const f=v62Fixtures(c).find(f=>!f.result&&(ownSide===0?f.homeId:f.awayId)===c.manager.managedClubId);
    c.world.activeMatch={fixtureId:f.id,state:v64MakeState(c,f)};const ctx=v65Context();ctx.state.phase='paused';v65WorldActive=ctx;v65CreateMatch(ctx);match.score=[4,1];updateTeamStats();const frame=v98PitchFrame(match);v132BroadcastUI(frame);
    const row={ownSide,expected:[f.homeId,f.awayId].map(id=>c.world.clubs.find(club=>club.id===id).name),names:[...document.querySelectorAll('#match-area .score-name-text')].map(n=>n.textContent.replace(/ \(\d+\.\)$/,'')),tvNames:[...document.querySelectorAll('#v132-tv [data-tv-team]')].map(n=>n.title),score:$('#score').textContent,tvScore:frame.broadcast.score,colours:frame.broadcast.colours,expectedColours:(ownSide===0?[match.kits.user,match.kits.opponent]:[match.kits.opponent,match.kits.user]).map(k=>k.main),nativeScore:[...match.score]};
    const comp=v62Current(c).find(q=>q.id===f.competitionId),type=comp.type,saved={round:f.round,leg:f.leg,pair:f.pair},before=JSON.stringify(match);comp.type='europe';Object.assign(f,{round:'QF',leg:2,pair:'display-r132'});comp.fixtures.push({id:'display-r132-first',round:'QF',leg:1,pair:f.pair,homeId:f.awayId,awayId:f.homeId,result:{homeGoals:3,awayGoals:2}});
    try{v25UpdateLiveBoard();const broadcast=v132Broadcast(match);v132BroadcastUI({broadcast});row.aggregate=broadcast.aggregate;row.boardAggregate=$('#score .v65-aggregate').textContent;row.tvAggregate=$('#v132-tv .v141-tv-aggregate').textContent;row.unchanged=before===JSON.stringify(match);}finally{comp.fixtures.pop();comp.type=type;Object.assign(f,saved);}
    rows.push(row);
   }
  }finally{c.world.activeMatch=active;match=current;v65WorldActive=world;running=live;formation=savedFormation;v98View=view;updateTeamStats();draw();v102StopPaint();v132BroadcastUI(v98PitchFrame(match));}
  return rows;
 });
 for(const r of rows){assert.deepEqual(r.names,r.expected);assert.deepEqual(r.tvNames,r.expected);assert.deepEqual(r.tvScore,r.ownSide===0?[4,1]:[1,4]);assert.equal(r.score,r.ownSide===0?'4 : 1':'1 : 4');assert.deepEqual(r.colours,r.expectedColours);assert.deepEqual(r.nativeScore,[4,1]);assert.equal(r.aggregate,r.ownSide===0?'(6:4)':'(3:7)');assert.equal(r.boardAggregate,r.aggregate);assert.equal(r.tvAggregate,r.aggregate);assert(r.unchanged);}
 fs.mkdirSync('outputs/r132-display',{recursive:true});fs.writeFileSync('outputs/r132-display/homeaway-'+label+'.json',JSON.stringify({pass:true,rows},null,2)+'\n');
 return rows;
};
