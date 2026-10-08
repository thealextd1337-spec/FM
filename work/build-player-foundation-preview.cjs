'use strict';
const fs=require('node:fs'),{candidateParameters}=require('./measure-player-generation.cjs');
const options={parameterId:'native-player-v160-1',parameters:candidateParameters,qualityMapping:{0:'weak',1:'weak',2:'weak',3:'normal',4:'strong',5:'strong'},balanceSource:'wave3-local-candidate-1'};
function generateSource(){return `'use strict';
// Existing measured candidates are the initial regular-career parameter stand.
// Persist all parameters in new worlds; loading never creates this data.
if(typeof window==='object'){
 window.D6PlayerFoundationOptions=${JSON.stringify(options)};
 Object.assign(window.D6PlayerFoundationOptions,{roles:{suitability:D6PlayerRoles.candidateParameters,routine:D6PositionRoutine.candidateParameters,transitions:D6TacticTransitions.candidateParameters},ratings:D6MatchRatings.candidateParameters,loadParameters:D6LoadCandidate.createParameters(),loadDay:0});
 if((location.protocol==='file:'||['127.0.0.1','localhost'].includes(location.hostname))&&['wave2','wave3'].includes(new URLSearchParams(location.search).get('players'))){
  window.D6PlayerFoundationPreviewOptions=structuredClone(window.D6PlayerFoundationOptions);
  const wave=new URLSearchParams(location.search).get('players');window.D6PlayerFoundationPreviewOptions.parameterId=wave==='wave3'?'wave3-local-candidate-1':'wave2-local-candidate-1';
  if(wave==='wave2')for(const key of ['roles','ratings','loadParameters','loadDay','balanceSource'])delete window.D6PlayerFoundationPreviewOptions[key];
 }
}
`;}
module.exports={generateSource};
if(require.main===module){fs.writeFileSync('dist/player-foundation-preview-v153.js',generateSource());console.log('Regular and local preview player parameters generated.');}
