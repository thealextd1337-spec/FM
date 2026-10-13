'use strict';
// Pairs <name>-original.png / <name>-lowpoly.png of a preview folder into one sheet per row group.
//   node preview-sheet.cjs <folder> <out.png> [filter regex]
const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const [dir,out,filter]=process.argv.slice(2);const re=filter?new RegExp(filter):null;
(async()=>{
 const names=fs.readdirSync(dir).filter(f=>f.endsWith('-original.png')).map(f=>f.slice(0,-13)).filter(n=>!re||re.test(n)).sort();
 const tiles=[];for(const n of names){for(const k of ['original','lowpoly']){const f=path.join(dir,`${n}-${k}.png`);if(fs.existsSync(f))tiles.push({f,n,k});}}
 const meta=await sharp(tiles[0].f).metadata();const w=Math.round(meta.width/2),h=Math.round(meta.height/2),cols=8,rows=Math.ceil(tiles.length/cols);
 const comp=await Promise.all(tiles.map(async(t,i)=>({input:await sharp(t.f).resize(w,h).toBuffer(),left:(i%cols)*w,top:Math.floor(i/cols)*h})));
 await sharp({create:{width:cols*w,height:rows*h,channels:3,background:'#fff'}}).composite(comp).png().toFile(out);console.log(out,names.length);
})();
