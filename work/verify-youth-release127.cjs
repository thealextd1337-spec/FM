'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const html=fs.readFileSync('outputs/index.html','utf8'),source=fs.readFileSync('dist/index.html','utf8'),files=['world-youth-legacy-v176.js','world-youth-legacy-ui-v176.js','world-youth-legacy-v176.css'],hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const f of files){assert(source.includes(f));const code=fs.readFileSync('dist/'+f,'utf8').replace(/\r\n/g,'\n');assert(html.includes(code),'Build has exact '+f);assert(!html.includes(`src="${f}"`)&&!html.includes(`href="${f}"`));}
for(const s of [source,html,fs.readFileSync('dist/progress-v58.js','utf8')])assert(s.includes('PROTOTYP 127'));
assert.equal(hash(fs.readFileSync('outputs/index.html')),hash(fs.readFileSync('outputs/Doppel-6-Fussballmanager.html')));
const summary=JSON.parse(fs.readFileSync('outputs/release-127/longterm-summary.json','utf8'));assert(summary.complete&&summary.latest===20);assert.equal(summary.nativeFixtures,59460);assert(summary.annual.every(r=>r.nativeValidation&&r.initialAdultsRemaining>=0&&r.maxAge<39));assert.equal(summary.annual.at(-1).initialAdultsRemaining,0);
const controls=JSON.parse(fs.readFileSync('outputs/release-127/controls.json','utf8'));assert(controls.pass&&Math.abs(controls.highExpected-.05)<1e-12);
for(const name of ['source','build']){const browser=JSON.parse(fs.readFileSync(`outputs/release-127/${name}-browser.json`,'utf8'));assert(browser.pass&&browser.rows.length===12&&browser.reload);}
const physical=JSON.parse(fs.readFileSync('outputs/release-127/browser-current.json','utf8'));assert(physical.pass&&physical.physicalPauseReload&&physical.completed.valid&&physical.completed.result);assert.deepEqual(physical.errors,[]);
const gates=JSON.parse(fs.readFileSync('outputs/release-127/gates.json','utf8'));assert(gates.pass&&gates.complete);
const report={pass:true,version:127,nativeFixtures:summary.nativeFixtures,sourceBuildEmbedded:files,buildSha256:hash(fs.readFileSync('outputs/index.html')),buildBytes:fs.statSync('outputs/index.html').size,controls:true,browserCases:24,nativePauseReload:true,gates:gates.results.length,final:summary.annual.at(-1)};
fs.writeFileSync('outputs/release-127/validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
