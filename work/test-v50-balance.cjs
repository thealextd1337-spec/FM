const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {makeContext}=require('./test-v41.cjs');
const files=['penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','set-pieces-v50.js'];
const opponents=[['union',-1],['hafen',0],['nord',1]];
const totals=Object.fromEntries([-1,0,1].map(level=>[level,{ownFouls:0,opponentFouls:0,corners:0,freeKicks:0,penalties:0,seconds:0,games:0}]));
const opponentFouls=Object.fromEntries(opponents.map(([,level])=>[level,0]));

for(const [opponentId,opponentLevel] of opponents)for(const level of [-1,0,1])for(let game=0;game<12;game++){
 const context=makeContext();
 for(const file of files)vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
 const sample=JSON.parse(vm.runInContext(`(()=>{
  let seed=${1000+game};
  Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');
  const fixture=userFixture();fixture.home='user';fixture.away='${opponentId}';
  aggression=${level};
  start();let frames=0;while(!match.finished&&frames++<4500)step(.039,.05);
  return JSON.stringify({frames,finished:match.finished,opponentAggression:match.aggression[1],stats:match.setPieceStats});
 })()`,context));
 assert(sample.finished,`match stalled: ${opponentId}, level ${level}, seed ${game}`);
 assert.equal(sample.opponentAggression,opponentLevel);
 const total=totals[level],stats=sample.stats;
 total.ownFouls+=stats.fouls[0];total.opponentFouls+=stats.fouls[1];
 total.corners+=stats.corners[0]+stats.corners[1];
 total.freeKicks+=stats.freeKicks[0]+stats.freeKicks[1];
 total.penalties+=stats.penalties[0]+stats.penalties[1];
 total.seconds+=sample.frames*.05;total.games++;
 opponentFouls[opponentLevel]+=stats.fouls[1];
}
assert(totals[-1].ownFouls<totals[0].ownFouls&&totals[0].ownFouls<totals[1].ownFouls,'own foul rates follow aggression');
assert(opponentFouls[-1]<opponentFouls[0]&&opponentFouls[0]<opponentFouls[1],'opponent foul rates follow aggression');
console.log(`Opponent fouls by style: cautious ${opponentFouls[-1]}, normal ${opponentFouls[0]}, aggressive ${opponentFouls[1]}`);
for(const level of [-1,0,1]){
 const total=totals[level],average=total.seconds/total.games;
 assert(average>=90&&average<=150,`match duration changed: ${average.toFixed(1)} s`);
 assert(total.corners>0&&total.freeKicks>0,'set pieces occur during full matches');
 console.log(`${level}: ${total.games} matches, own fouls ${total.ownFouls}, opponent fouls ${total.opponentFouls}, corners ${total.corners}, free kicks ${total.freeKicks}, penalties ${total.penalties}, mean ${average.toFixed(1)} s`);
}
console.log('PASS: both teams use aggression; corners, fouls, free kicks and match duration remain plausible');
