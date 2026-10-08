// Match parity excludes presentation waits by skipping replays in both runs.
// Replay recording, holds and the skip button are checked separately.
const fs=require('fs'),vm=require('vm'),{pathToFileURL}=require('url');
process.env.D6_TEST_URL=pathToFileURL(require('path').resolve('outputs/meshy-match-preview.html')).href+'?qa=1';
let source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const original='   step(.05*MATCH_SPEED,.05);if(v65Context().state.phase';
if(!source.includes(original))throw Error('Parity loop changed; update explicit replay skip');
source=source.replace(original,'   v103EndReplay(match);step(.05*MATCH_SPEED,.05);if(v65Context().state.phase');
vm.runInNewContext(source,{require,process,console},{filename:'meshymatch-regression'});
