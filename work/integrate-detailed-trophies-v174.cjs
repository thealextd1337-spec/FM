'use strict';
// Product asset packaging only: approved image-generator alpha is preserved.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('../outputs/ligaexpansion-ap11/meshy-runner/node_modules/sharp');
const root=path.resolve(__dirname,'..'),base=path.join(root,'outputs/ligaexpansion-ap11/trophy-cutouts');
async function main(){
 const target=path.join(root,'dist/trophies-expansion/manifest.json'),manifest=JSON.parse(fs.readFileSync(target,'utf8'));
 const selected=manifest.entries.filter(e=>e.country!=='EU');if(selected.length!==64)throw Error('Expected 64 approved awards');
 for(const e of selected)if(!fs.existsSync(path.join(base,e.key+'.png')))throw Error('Missing cutout: '+e.key);
 const file=path.join(root,'dist/world-expansion-awards-v171.js'),previous=fs.readFileSync(file,'utf8'),footer=previous.slice(previous.indexOf('function v171AwardSource'));
 if(!footer.startsWith('function v171AwardSource'))throw Error('Award renderer missing');
 const originalManifest=path.join(base,'previous-product-manifest.json');if(!fs.existsSync(originalManifest))fs.copyFileSync(target,originalManifest);
 const assets={},checks=[];
 // Validate the entire approved batch before changing any product asset.
 for(const e of selected){
  const raw=await sharp(path.join(base,e.key+'.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(raw.info.channels!==4)throw Error('Unexpected channels: '+e.key);
  let transparent=0,opaque=0;for(let i=3;i<raw.data.length;i+=4){transparent+=raw.data[i]===0;opaque+=raw.data[i]>=240;}
  if(transparent<raw.info.width*raw.info.height*.1||opaque<raw.info.width*raw.info.height*.1)throw Error('Invalid cutout coverage: '+e.key);
 }
 for(const e of selected){
  const input=path.join(base,e.key+'.png'),meta=await sharp(input).metadata();if(!meta.hasAlpha)throw Error('No alpha: '+e.key);
  const raw=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});let transparent=0,opaque=0;
  for(let i=3;i<raw.data.length;i+=4){transparent+=raw.data[i]===0;opaque+=raw.data[i]>=240;}
  if(transparent<raw.info.width*raw.info.height*.1||opaque<raw.info.width*raw.info.height*.1)throw Error('Invalid cutout coverage: '+e.key);
  const art={key:e.key,label:e.label};const variants={};let total=0;
  for(const [variant,size] of [['large',320],['small',96]]){
   const data=await sharp(input).resize(size,size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:90,alphaQuality:100,effort:6}).toBuffer();
   const relative='trophies-expansion/'+e.key+(variant==='small'?'-small':'')+'.webp';fs.writeFileSync(path.join(root,'dist',relative),data);variants[variant]=relative;art[variant]='data:image/webp;base64,'+data.toString('base64');total+=data.length;
  }
  assets[e.key]=art;e.variants=variants;e.source='Approved Meshy design, image-generator cutout; world-expansion-awards-v171';e.format='webp-alpha';
  checks.push({key:e.key,width:meta.width,height:meta.height,transparentPixels:transparent,nearOpaquePixels:opaque,bytes:total,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex')});
 }
 manifest.version=174;manifest.style='Approved detailed trophies with true alpha; 320px large and 96px compact sources';manifest.source='Meshy originals and image_gen cutouts approved 2026-10-10';
 fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(file,"'use strict';\nconst v171AwardAssets="+JSON.stringify(assets)+';\n'+footer);
 fs.writeFileSync(path.join(base,'integration-checks.json'),JSON.stringify({count:checks.length,variants:128,bytes:checks.reduce((s,c)=>s+c.bytes,0),checks},null,2)+'\n');
 console.log(JSON.stringify({integrated:checks.length,variants:128,bytes:checks.reduce((s,c)=>s+c.bytes,0)}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
