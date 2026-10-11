'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const backup=process.argv.includes('--backup'),response=await fetch('https://fussball.cakamper.at/?release127-check='+Date.now(),{headers:{'Cache-Control':'no-cache'}});
 assert(response.ok,'Public page HTTP '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer()),version=bytes.toString('utf8').match(/PROTOTYP\s+(\d+)/)?.[1];
 const report={pass:true,url:'https://fussball.cakamper.at/',checkedAt:new Date().toISOString(),version:Number(version),bytes:bytes.length,sha256:hash(bytes)};
 if(backup){fs.writeFileSync('outputs/release-127/previous-live.html',bytes);fs.writeFileSync('outputs/release-127/previous-live-hash.json',JSON.stringify(report,null,2));}
 else{const local=fs.readFileSync('outputs/index.html');assert.equal(Number(version),127);assert.equal(hash(bytes),hash(local));assert.equal(hash(bytes),hash(fs.readFileSync('outputs/Doppel-6-Fussballmanager.html')));fs.writeFileSync('outputs/release-127/live-hash.json',JSON.stringify(report,null,2));}
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
