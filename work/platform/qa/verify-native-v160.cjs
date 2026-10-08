'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const out='outputs/platform/native-integration-v160',read=f=>fs.readFileSync(f,'utf8'),json=f=>JSON.parse(read(path.join(out,f))),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const source=json('source-tests.json'),build=json('build-tests.json');
assert.equal(source.matrix.checks.length,195);assert.deepEqual(build.matrix,source.matrix);assert.equal(source.fullMatches.length,4);
for(const run of source.fullMatches){assert.equal(run.matches.length,2);assert.deepEqual({...run.matches[0],restore:true},run.matches[1]);assert(run.checks.includes('Complete gameplay/report/model parity after JSON'));}
for(const run of build.fullMatches){assert.equal(run.parity,true);const same=source.fullMatches.find(s=>JSON.stringify(s.config)===JSON.stringify(run.config));assert(same);assert.deepEqual(same.matches,run.matches);}
assert.equal(source.ui.checks.length,14);assert.equal(build.ui.checks.length,14);assert(source.reload&&build.reload.reload);
assert(source.ui.scrollWidth<=source.ui.width&&build.ui.scrollWidth<=build.ui.width);
assert.equal(json('multiseason.json').rows.length,6);assert.equal(json('multiseason-six-final.json').rows.length,3);
for(const report of ['multiseason.json','multiseason-six-final.json']){assert(json(report).pass);assert(json(report).rows.every(row=>row.matches===259));}
const html=read('outputs/index.html');assert.equal(read('outputs/Doppel-6-Fussballmanager.html'),html);
assert.deepEqual([...new Set(read('dist/index.html').match(/PROTOTYP \d+/g))],[...new Set(html.match(/PROTOTYP \d+/g))]);
const files=execFileSync('git',['diff','--name-only','ef0e7d0','--','dist'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
for(const file of files.filter(f=>f.endsWith('.js')))new vm.Script(read(file),{filename:file});
const manifest={base:'ef0e7d0',sourceHashes:Object.fromEntries(['dist/index.html',...files].map(f=>[f,hash(f)])),buildHash:hash('outputs/index.html'),buildBytes:fs.statSync('outputs/index.html').size,sourceChecks:195,buildChecks:195,nativeFullMatches:12,modelSeasonChecks:9,uiChecks:28,checkedAt:new Date().toISOString()};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`PASS: ${files.length} changed sources compile; source/build evidence agrees; native geometry, UI and career proofs recorded`);
