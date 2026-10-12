'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
if(Number(process.versions.node.split('.')[0])<20){const node=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');process.exit(require('node:child_process').spawnSync(node,[__filename],{stdio:'inherit'}).status??1);}
(async()=>{
 const source=fs.readFileSync('dist/index.html','utf8'),built=fs.readFileSync('outputs/index.html'),offline=fs.readFileSync('outputs/Doppel-6-Fussballmanager.html');
 assert.match(source,/PROTOTYP 128/);assert.ok(built.equals(offline),'both build files are identical');
 const response=await fetch(`https://fussball.cakamper.at/?release128-proof=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(120000)});assert.equal(response.status,200);
 const live=Buffer.from(await response.arrayBuffer());assert.ok(live.equals(built),'live page matches the exact tested build');
 const text=live.toString('utf8');assert.deepEqual([...new Set(text.match(/PROTOTYP \d+/g))],['PROTOTYP 128']);
 assert.ok(text.includes('unity-match/runtime.html?v=128'));
 const proof={passed:true,url:'https://fussball.cakamper.at/',checkedAt:new Date().toISOString(),version:128,bytes:live.length,sha256:crypto.createHash('sha256').update(live).digest('hex'),checks:['source footer','matching offline builds','HTTP 200','byte-identical public page','live footer and runtime release']};
 fs.mkdirSync('outputs/release-128',{recursive:true});fs.writeFileSync('outputs/release-128/live-bytes.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
})().catch(error=>{console.error(error);process.exitCode=1;});
