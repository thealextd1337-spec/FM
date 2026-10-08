'use strict';
// Test-only adapter. No product files or user profiles are changed.
async function prepare(page, {seed=12345,view='3d'}={}) {
 await page.waitForFunction(()=>window.D6UserModelStatus==='ready',null,{timeout:120000});
 return page.evaluate(({seed,view})=>{
  window.__d6Seed=seed;Math.random=()=>{window.__d6Seed=(window.__d6Seed*1664525+1013904223)>>>0;return window.__d6Seed/4294967296};
  const career=v61CreateCareer('GER-2','R01 isolated performance'),club=career.world.clubs.find(c=>c.id==='GER-2');
  v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);
  while(career.world.market.phase==='open')v66NextMarketDay(career);
  const fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId==='GER-2'||f.awayId==='GER-2'));
  career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};v61CurrentCareer=career;
  career.world.activeMatch.state.phase='live';v98View=view;v65Show(v65Context());
  clearInterval(v65WorldFrame);clearInterval(v64UiTimer);running=false;v102StopPaint();hideOverlay();draw();
  return {players:match.people.length,renderedPlayers:v98Players.size,view,model:D6UserModelStatus,elapsed:match.elapsed};
 },{seed,view});
}
async function start(page){await page.evaluate(()=>{running=true;v65Context().state.phase='live';v65StartLoop()})}
async function stop(page){await page.evaluate(()=>{clearInterval(v65WorldFrame);clearInterval(v64UiTimer);running=false;v102StopPaint();if(typeof v132StopReview==='function')v132StopReview()})}
async function snapshot(page){return page.evaluate(()=>({elapsed:match.elapsed,finished:match.finished,phase:v65Context().state.phase,score:match.score,players:match.people.length,timelineFrames:v103ReplayState(match).timeline.length,renderCount:v102PaintCount,view:v98View}))}
module.exports={prepare,start,stop,snapshot};
