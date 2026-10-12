'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(process.env.D6_TEST_ROOT||process.cwd());
function harness({view=true}={}){
 const read=file=>fs.readFileSync(path.join(root,'dist',file),'utf8');
 // Reuse the repository's DOM fixture without executing its unrelated cup suite.
 const existing=fs.readFileSync(path.join(root,'work/test-v41.cjs'),'utf8'),start=existing.indexOf('function makeContext(){'),end=existing.indexOf('\nconst context=makeContext();');
 assert(start>=0&&end>start,'test-v41 makeContext fixture boundary');
 const ctx=Function('fs','vm','crypto',existing.slice(start,end)+'\nreturn makeContext();')({readFileSync:file=>read(file.replace(/^dist\//,''))},vm,crypto);
 Object.assign(ctx,{addEventListener(){},scrollTo(){},setInterval:()=>1,clearInterval(){},location:{protocol:'http:',hostname:'test.invalid',search:''}});ctx.window=ctx;ctx.globalThis=ctx;
 const run=(text,file='fixture')=>vm.runInContext(text,ctx,{filename:file}),evaluate=text=>run(text),call=(name,...args)=>evaluate(name)(...args),copy=value=>JSON.parse(JSON.stringify(value));
 run('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";');
 for(const file of [
  'youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js','pitch-v55.js','pitch-v56.js','pitch-v57.js',
  'world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js','player-generation.js','player-effective-abilities.js','player-freshness.js','player-load-candidate-v158.js','player-development.js','player-aging.js','player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','world-player-roles-v154.js','world-player-load-v158.js'
 ])run(read(file),file);
 const physical=read('world-physical-v65.js'),physicalEnd=physical.indexOf('function v65SyncMinute(');assert(physicalEnd>0);run(physical.slice(0,physicalEnd),'world-physical-v65.js');
 // UI/report transport is inert; no movement, contact, P02 or restore calculator is replaced.
 run('var v65ShowSwapInfo=()=>{};var v65SwapInfoHTML=()=>"";var v65Finish=()=>{};var v65WorldReport=()=>"";var v65Context=()=>v65WorldActive;');
 for(const file of ['world-pitch-actions-v99.js','pitch-motion-v102.js','world-backpedal-v108.js','world-corner-ball-v109.js','world-ball-motion-v110.js','world-space-passes-v150.js','world-attack-flow-v152.js','world-offensive-quality-v157.js','match-shot-choice-v159.js','world-football-flow-v159.js','match-ball-events-v117.js'])run(read(file),file);
 run('updateTeamStats=()=>{};note=()=>{};draw=()=>{};v64UiSave=()=>true;v65ApplyTactics=()=>{};v103CanReplay=()=>false;v99FlushSwaps=()=>{};running=true;');
 if(view){const pitch=read('world-pitch3d-v98.js'),pitchEnd=pitch.indexOf('function v98HomeSponsor(');assert(pitchEnd>0);run(pitch.slice(0,pitchEnd),'world-pitch3d-v98.js');
  const bridge=read('world-unity-v151.js'),a=bridge.indexOf('const basePitchFrame=v98PitchFrame;'),b=bridge.indexOf('\n let shownGeometry=',a);assert(a>=0&&b>a);run(bridge.slice(a,b),'native-action-world-projection');}
 run(fs.readFileSync(path.join(__dirname,'native130-fixtures.js'),'utf8'),'native130-fixtures.js');
 return{ctx,run,evaluate,call,copy,contract:require(path.join(root,'dist/world-unity-v151.js'))};
}
module.exports={harness,root};
