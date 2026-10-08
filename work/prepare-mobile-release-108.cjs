// Copy only this release's changes onto the fetched production checkout.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),target=path.resolve('C:/Users/alex/.codex/worktrees/mobile-3d-release-108/Fussballmanager');
if(!fs.existsSync(path.join(target,'.git')))throw Error('Managed release checkout missing');
const read=(dir,file)=>fs.readFileSync(path.join(dir,file),'utf8').replace(/\r\n/g,'\n');
const write=(file,text)=>fs.writeFileSync(path.join(target,file),text);
const production=file=>execFileSync('git',['show','HEAD:'+file],{cwd:target,encoding:'utf8',windowsHide:true,maxBuffer:1024*1024}).replace(/\r\n/g,'\n');
const files=['dist/pitch-scene-v98.js','dist/world-pitch3d-v98.js','dist/world-goal-replay-v103.js','dist/index.html','dist/world-3d-documentation-data-v134.js','work/build.cjs','work/generate-3d-documentation.cjs','work/test-3d-documentation-v134.cjs','work/test-mobile-performance-v135.cjs','work/check-mobile-performance-v135.cjs','work/run-mobile-regression-v135.cjs','work/check-live-release-v108.cjs','work/check-release-tests-v108.cjs','docs/3d-system.md','docs/3d-system-en.md','docs/mobile-3d-performance-v135.md'];
for(const file of files)write(file,read(root,file));
for(const file of ['work/generate-user-meshy-match.cjs','work/user-locomotion-lab-v108.js','work/check-fullscreen-tv-v132.cjs'])if(!fs.existsSync(path.join(target,file)))write(file,read(root,file));
const mobile=read(root,'docs/CHANGELOG.md').split('\n').find(line=>line.startsWith('- Mobile 3D-Performance v135:')).replace('noch nicht veröffentlicht und noch nicht auf echter Pixel-Hardware geprüft','auf echter Pixel-Hardware noch nicht geprüft');
write('docs/CHANGELOG.md',production('docs/CHANGELOG.md').replace('## Noch nicht veröffentlicht\n\n','## Noch nicht veröffentlicht\n\n## 2026-10-05 (Prototyp 108 · Mobile 3D-Performance)\n\n'+mobile+'\n\n'));
const development=read(root,'docs/development.md').split('\n').find(line=>line.startsWith('- Mobile 3D-Performance v135,')).replace('v135, lokal:','v135 / Veröffentlichung 108:').replace('Kein Release oder Spielstandeingriff.','Build und Quellversion 108; kein Spielstandeingriff.');
write('docs/development.md',production('docs/development.md').replace('## Code, Prüfung und Veröffentlichung\n\n','## Code, Prüfung und Veröffentlichung\n\n'+development+'\n\n'));
const product=read(root,'docs/product.md').split('\n').find(line=>line.startsWith('- Die 3D-Ansicht verwendet auf Geräten')).replace('Lokale Umsetzung','Umsetzung');
write('docs/product.md',production('docs/product.md').replace(/(- Mobiles Vollbild[^\n]*\n)/,'$1'+product+'\n'));
write('.github/workflows/deploy.yml',production('.github/workflows/deploy.yml').replace('          node work/test-3d-documentation-v134.cjs\n','          node work/test-3d-documentation-v134.cjs\n          node work/test-mobile-performance-v135.cjs\n'));
write('docs/mobile-3d-performance-v135.md',read(target,'docs/mobile-3d-performance-v135.md').replace('Lokal umgesetzt am 5. Oktober 2026; noch nicht veröffentlicht. Die bestehende Veröffentlichung bleibt Prototyp 107.','Am 5. Oktober 2026 für die Veröffentlichung als Prototyp 108 vorbereitet.').replace('Versionsnummer bleibt 107, da keine Veröffentlichung erfolgt.','Quellseite und Build zeigen Version 108.'));
console.log(JSON.stringify({target,copied:files.length,scopedDocuments:3,workflowTest:true}));
