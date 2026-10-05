const fs=require('fs'),read=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
let html=read('outputs/index.html');html=html.replace(/<title>[^<]*<\/title>/,'<title>Doppel 6 · Nutzercharakter im Match</title>');
html=html.replaceAll('sechser.world.v9','sechser.world.user-meshy-v107').replaceAll('doppel6-world-v9','doppel6-world-user-meshy-v107');
const script=`<script>${read('work/user-locomotion-lab-v108.js')}</script><script type="module">
try{const models=await window.D6UserModelReady;if(!models)throw Error(window.userMeshyMatchError||'Spielermodell nicht verfügbar');
if(!new URLSearchParams(location.search).has('qa')){
const career=v61CreateCareer('GER-2','user-meshy-local-match'),club=career.world.clubs.find(c=>c.id==='GER-2');career.id='user-meshy-v107';v66ChooseSponsor(career,club.id,club.sponsors[0].id);if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')v66NextMarketDay(career);
const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId==='GER-2');career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};career.world.activeMatch.state.phase='live';clearInterval(v65WorldFrame);match=null;v65WorldActive=null;v61CurrentCareer=career;v98View='3d';v65Show(v65Context());draw();}
if(match)draw();window.userMeshyMatchReady=true;const note=document.createElement('p');note.id='user-meshy-note';note.textContent='Lokale Matchprobe · Dribbling, Pässe und Flanken · Torwartparaden und Fangen · Angepasster Ballmaßstab · Eigener Testspeicher';note.style.cssText='padding:8px 16px;color:#c7f36b;text-align:center;font-size:12px';document.querySelector('footer').before(note);
if(new URLSearchParams(location.search).has('bewegungsprobe'))D6MotionLab.start();
}catch(error){window.userMeshyMatchError=error.message;console.error(error);const note=document.createElement('p');note.setAttribute('role','alert');note.textContent='Modellprobe konnte nicht starten: '+error.message;document.body.prepend(note);}
</script>`;
html=html.replace('</body>',script+'</body>');fs.writeFileSync('outputs/spieler-nutzer-match.html',html);fs.writeFileSync('outputs/spieler-neustart.html',html);fs.writeFileSync('outputs/spieler-nutzer-bewegungsprobe.html',html.replace("if(new URLSearchParams(location.search).has('bewegungsprobe'))D6MotionLab.start();","D6MotionLab.start();"));console.log(JSON.stringify({output:'outputs/spieler-nutzer-match.html',bytes:Buffer.byteLength(html)}));
