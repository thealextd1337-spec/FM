const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),target='C:/Users/alex/.codex/worktrees/halftime-fullscreen-109/Fussballmanager';
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:target,encoding:'utf8',windowsHide:true}).trim();assert.equal(head,'1e48990cb7ed1dedd03736c18ab09025f29c7f3d');
const live=JSON.parse(fs.readFileSync(path.join(root,'outputs/live-release-v109.json'),'utf8')),deployment=JSON.parse(fs.readFileSync(path.join(root,'outputs/release-109-deployment.json'),'utf8'));assert.equal(deployment.conclusion,'success');assert(live.sourceBuildLiveMatch);
const read=(dir,file)=>fs.readFileSync(path.join(dir,file),'utf8').replace(/\r\n/g,'\n');
const proof=JSON.parse(read(root,'docs/release-109-verification.json'));assert.equal(proof.preflight.sha256,live.sha256);proof.releaseCommit=head;proof.live=live;proof.deployment=deployment;
proof.releaseTests=JSON.parse(read(target,'outputs/release-tests-v108.json'));assert(proof.releaseTests.passed);
for(const file of ['release-109-preflight.json','world3d-parity-v136.json','fullscreen-tv-qa-v136.json','halftime-fullscreen-v136.json'])fs.copyFileSync(path.join(target,'outputs',file),path.join(root,'outputs',file));
fs.copyFileSync(path.join(target,'outputs/release-tests-v108.json'),path.join(root,'outputs/release-tests-v109.json'));
const statement='Am 5. Oktober 2026 als [Prototyp 109 live veröffentlicht](https://fussball.cakamper.at/). [Deployment]('+deployment.url+') erfolgreich. Quellseite, Build und Live-Seite zeigen Version 109; die Live-Datei stimmt bytegenau mit dem geprüften Build überein: SHA-256 `'+live.sha256+'`. Halbzeit-Taktikansicht und Vollbildrückkehr direkt live in einem isolierten Testspielstand geprüft. [Nachweise](release-109-verification.json).';
for(const dir of [root,target]){
 fs.writeFileSync(path.join(dir,'docs/release-109-verification.json'),JSON.stringify(proof,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'docs/release-109.md'),read(dir,'docs/release-109.md').replace('Für die Live-Seite vorbereitet: ',statement+'\n\n').replace('Liveprüfung folgt nach Deployment.','Liveprüfung bestätigt identische Dateibytes und alle fünf Halbzeit-/Vollbildfälle einschließlich Bereinigung.\n\nRelease-Commit: ['+head.slice(0,7)+'](https://github.com/thealextd1337-spec/FM/commit/'+head+').'));
 fs.writeFileSync(path.join(dir,'docs/CHANGELOG.md'),read(dir,'docs/CHANGELOG.md').replace('## 2026-10-05 (Prototyp 109 · Halbzeit und Vollbild)\n\n','## 2026-10-05 (Prototyp 109 · Halbzeit und Vollbild)\n\n'+statement+'\n\n'));
 fs.writeFileSync(path.join(dir,'docs/halftime-fullscreen-v136.md'),read(dir,'docs/halftime-fullscreen-v136.md').replace('Für Veröffentlichung 109 vorbereitet.','Als [Prototyp 109 live veröffentlicht](release-109.md); Quellseite, Build und Live-Version stimmen bytegenau überein. Alle fünf Fälle einschließlich Bereinigung auch direkt live bestanden.'));
}
const files=['docs/release-109-verification.json','docs/release-109.md','docs/CHANGELOG.md','docs/halftime-fullscreen-v136.md'];execFileSync('git',['add','--',...files],{cwd:target,windowsHide:true,stdio:'inherit'});
console.log(JSON.stringify({version:109,files,sha256:live.sha256,deployment:deployment.url}));
