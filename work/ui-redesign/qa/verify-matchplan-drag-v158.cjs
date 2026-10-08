'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),out='outputs/ui-redesign/matchplan-drag-v158',hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const roundsFile=`${out}/final-rounds.json`,selected=fs.existsSync(path.join(root,roundsFile))?read(roundsFile):{node:'node-final',source:'source-confirmed',build:'build-final'};
for(const round of Object.values(selected))assert.match(round,/^[a-z0-9-]+$/,'Explicit report round');
const reports=Object.fromEntries(Object.entries(selected).map(([name,round])=>[name,`${out}/${round}/report.json`])),results=Object.fromEntries(Object.entries(reports).map(([name,file])=>[name,read(file)]));
for(const [name,result]of Object.entries(results)){
 assert.equal(result.pass,true,`${name} completed`);assert.deepEqual(result.errors,[],`${name} has no uncaught errors`);
 for(const [file,expected]of Object.entries(result.after)){assert.equal(hash(file),expected,`${name}: current owned source ${file}`);assert.equal(result.before[file],expected,`${name}: frozen source ${file}`);}
 for(const [file,expected]of Object.entries(result.dependencyHashes))assert.equal(hash(file),expected,`${name}: current dependency ${file}`);
}
assert.equal(results.source.cases.length,6);assert.equal(results.build.cases.length,6);assert.equal(results.node.checks.length,32);assert.equal(results.source.checks.length,79);assert.equal(results.build.checks.length,80);
assert.equal(hash('outputs/index.html'),results.build.buildHash,'current Offline HTML');assert.equal(hash('outputs/Doppel-6-Fussballmanager.html'),results.build.buildHash,'Offline aliases agree');
assert.equal(hash('outputs/platform/freshness-v158/baseline/v157/dist/world-career-plan-v64.js'),results.node.baselineHash,'regression evidence uses preserved v157 input');
assert.deepEqual(results.source.dependencyHashes,results.build.dependencyHashes,'source and Offline browser cases use identical relevant sources');
const artifacts={};for(const file of Object.values(reports))artifacts[file]=hash(file);
for(const round of [selected.source,selected.build])for(const file of fs.readdirSync(path.join(root,out,round)).filter(file=>file.endsWith('.png')))artifacts[`${out}/${round}/${file}`]=hash(`${out}/${round}/${file}`);
if(fs.existsSync(path.join(root,roundsFile)))artifacts[roundsFile]=hash(roundsFile);
const helpers=['work/ui-redesign/qa/matchplan-drag-v158.cjs','work/ui-redesign/qa/verify-matchplan-drag-v158.cjs'];
const manifest={pass:true,createdAt:new Date().toISOString(),reports,checks:{node:32,source:79,build:80},browserCases:12,buildHash:results.build.buildHash,ownedSources:results.build.after,dependencies:results.build.dependencyHashes,helpers:Object.fromEntries(helpers.map(file=>[file,hash(file)])),artifacts,limitations:results.build.limitations};
fs.writeFileSync(path.join(root,out,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({pass:true,browserCases:12,checks:191,buildHash:manifest.buildHash,manifest:`${out}/manifest.json`}));
