'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const meta=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'))),base='https://fussball.cakamper.at/',rows=[];
(async()=>{for(const file of meta.files.filter(x=>!x.file.endsWith('.htaccess'))){
 const url=new URL(file.file,base);url.searchParams.set('releasecheck','130-'+file.sha256);
 const response=await fetch(url,{signal:AbortSignal.timeout(180000),headers:{'Cache-Control':'no-cache'}});assert.equal(response.status,200,url.href);
 const h=crypto.createHash('sha256');let bytes=0;for await(const b of response.body){h.update(b);bytes+=b.length;}
 const sha256=h.digest('hex');assert.equal(bytes,file.bytes,file.file+' bytes');assert.equal(sha256,file.sha256,file.file+' hash');rows.push({file:file.file,url:url.href,bytes,sha256,pass:true});console.log('PASS '+file.file);
 }
 const result={pass:true,at:new Date().toISOString(),release:130,sourceId:meta.sourceId,htmlSha256:meta.htmlSha256,manifestSha256:meta.manifestSha256,files:rows};fs.writeFileSync(path.join(__dirname,'live-files.json'),JSON.stringify(result,null,2));console.log('Verified all '+rows.length+' public release130 files.');
})().catch(e=>{fs.writeFileSync(path.join(__dirname,'live-files-failure.json'),JSON.stringify({pass:false,error:String(e),rows},null,2));console.error(e);process.exitCode=1;});
