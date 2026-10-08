'use strict';
const {PNG}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const crypto=require('node:crypto');
function imageEvidence(bytes){const png=PNG.sync.read(bytes),colors=new Map();let green=0;for(let i=0;i<png.data.length;i+=4){const r=png.data[i],g=png.data[i+1],b=png.data[i+2],key=(r<<16)|(g<<8)|b;colors.set(key,(colors.get(key)||0)+1);if(g>50&&g>r*1.1&&g>b*1.1)green++}const pixels=png.width*png.height;let dominant=0;for(const count of colors.values())dominant=Math.max(dominant,count);return {width:png.width,height:png.height,distinctColors:colors.size,greenPixelFraction:green/pixels,nonDominantPixelFraction:1-dominant/pixels,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}}
module.exports={imageEvidence};
