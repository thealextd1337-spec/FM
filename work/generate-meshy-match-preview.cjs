const fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'),data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64'),vendor='outputs/meshy-viewer-vendor';
const loader=data(read(vendor+'/GLTFLoader.js').replace('../utils/BufferGeometryUtils.js',data(read(vendor+'/BufferGeometryUtils.js'))));
const job=JSON.parse(read('meshy_output/soccer-b-torso-v6.json').replace(/^\uFEFF/,''));
let html=read('outputs/index.html');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Doppel 6 · Meshy-Matchprobe</title>');
// Separate preview storage from every existing world, including file:// saves.
html=html.replaceAll('sechser.world.v9','sechser.world.meshy-squad-v6').replaceAll('doppel6-world-v9','doppel6-world-meshy-squad-v6');
const script=`<script>${read('dist/player-meshy-v106.js')}</script><script type="importmap">${JSON.stringify({imports:{three:data(read(vendor+'/three.module.js'))}})}</script><script type="module">
import {GLTFLoader} from '${loader}';
try{const bytes=Uint8Array.from(atob('${fs.readFileSync(path.join(job.project,'rigged.glb')).toString('base64')}'),c=>c.charCodeAt(0));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer,'');window.meshyMatchTrial=D6MeshyPlayer.install(gltf.scene);
if(typeof v98Dispose==='function')v98Dispose();
if(!new URLSearchParams(location.search).has('qa')){
const career=v61CreateCareer('GER-2','meshy-local-trial'),club=career.world.clubs.find(c=>c.id==='GER-2');career.id='meshy-squad-v6';v66ChooseSponsor(career,club.id,club.sponsors[0].id);
while(career.world.market.phase==='open')v66NextMarketDay(career);
const fixture=v62Fixtures(career).find(f=>!f.result&&f.homeId==='GER-2');
career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};career.world.activeMatch.state.phase='live';clearInterval(v65WorldFrame);match=null;v65WorldActive=null;v61CurrentCareer=career;v98View='3d';v65Show(v65Context());draw();
}
draw();window.meshyMatchReady=true;
const note=document.createElement('p');note.id='meshy-match-note';note.textContent='Lokale Mannschaftsprobe · Neue Feldspieler und ruhigere Bewegungen. Eigener Testspeicher.';note.style.cssText='padding:8px 16px;color:#c7f36b;text-align:center;font-size:12px';document.querySelector('footer').before(note);
}catch(error){window.meshyMatchError=error.message;console.error(error);const note=document.createElement('p');note.setAttribute('role','alert');note.textContent='Modellprobe konnte nicht starten: '+error.message;document.body.prepend(note);}
</script>`;
html=html.replace('</body>',script+'</body>');fs.writeFileSync('outputs/meshy-match-preview.html',html);console.log('Created outputs/meshy-match-preview.html');
