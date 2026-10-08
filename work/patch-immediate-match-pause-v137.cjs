const fs=require('fs');const file='dist/world-goal-replay-v103.js';let s=fs.readFileSync(file,'utf8');const old="if(context.state.phase==='live'){context.state.phase='paused';running=false;clearInterval(v65WorldFrame);v65PauseRequested=false;v65PauseView=false;$('#board-label').textContent='PAUSE';v65Snapshot(context);v65UpdateControls(context);v58Refresh();}";if(!s.includes(old))throw Error('pause block');s=s.replace(old,'v131PauseMatch();');s=s.replace('function v131Seek(time){',`function v131PauseMatch(){
 const context=v65Context();if(!context||context.state.phase!=='live')return;
 context.state.phase='paused';running=false;clearInterval(v65WorldFrame);v65PauseRequested=false;v65PauseView=false;$('#board-label').textContent='PAUSE';v65Snapshot(context);v65UpdateControls(context);v58Refresh();
}
function v131Seek(time){`);s=s.replace("if(state.review)v131ReturnLive();else if(running){v65PauseTargetTab='lineup';v65Pause();}else v65Resume();","if(state.review)v131ReturnLive();else if(running)v131PauseMatch();else v65Resume();");fs.writeFileSync(file,s);
const test='work/check-match-play-button-v137.cjs';s=fs.readFileSync(test,'utf8');const point='   // Explicit seek still selects a historical scene; playback never advances the match.';s=s.replace(point,`   // The selected button freezes ongoing actions immediately, like seeking does.
   for(const kind of ['flight','slide']){
    await page.evaluate(kind=>{match[kind]={progress:.4};running=true;v65Context().state.phase='live';v131ReviewUI();},kind);
    await click();assert.equal((await inspect()).running,false);assert.equal((await inspect()).phase,'paused');assert.equal((await inspect()).review,null);
    const action=await page.evaluate(kind=>JSON.stringify(match[kind]),kind);await page.waitForTimeout(120);assert.equal(await page.evaluate(kind=>JSON.stringify(match[kind]),kind),action);
    await click();await page.evaluate(()=>{clearInterval(v65WorldFrame);v102StopPaint();});assert.equal((await inspect()).running,true);assert.equal(await page.evaluate(kind=>JSON.stringify(match[kind]),kind),action);await page.evaluate(kind=>{match[kind]=null;},kind);
   }
`+point);fs.writeFileSync(test,s);
