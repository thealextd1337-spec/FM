'use strict';
// Side-by-side sheets (left baseline, right candidate) of equally named WebGL
// captures: outputs/style-demos/nighttime/webgl/{baseline,candidate} -> compare/.
const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../../../outputs/style-demos/nighttime/webgl'),out=path.join(root,'compare');fs.mkdirSync(out,{recursive:true});
(async()=>{let n=0;
 for(const file of fs.readdirSync(path.join(root,'candidate')).filter(f=>f.endsWith('.png'))){
  const before=path.join(root,'baseline',file.replace(/^candidate-/,'baseline-'));if(!fs.existsSync(before))continue;
  const a=sharp(before),b=sharp(path.join(root,'candidate',file));const [ma,mb]=await Promise.all([a.metadata(),b.metadata()]);
  const w=Math.max(ma.width,mb.width),h=Math.max(ma.height,mb.height);
  await sharp({create:{width:w*2+8,height:h,channels:3,background:'#000'}}).composite([{input:await a.png().toBuffer(),left:0,top:0},{input:await b.png().toBuffer(),left:w+8,top:0}]).png().toFile(path.join(out,file.replace(/^candidate-/,'compare-')));n++;
 }
 console.log(n+' sheets in '+out);
})();
