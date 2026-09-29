// Register generated paths explicitly so the single-file build can embed every asset.
const fs=require('fs');
const manifest=JSON.parse(fs.readFileSync('dist/crests/manifest.json','utf8'));
const assets=Object.fromEntries(Object.entries(manifest).map(([id,{palette,neutralForeground}])=>[id,{palette,neutralForeground,image:`crests/${id.toLowerCase()}.png`,edge:`crests/${id.toLowerCase()}-edge.png`,detail:`crests/${id.toLowerCase()}-detail.png`,masks:[0,1,2].map(i=>`crests/${id.toLowerCase()}-${i}.png`)}]));
const path='dist/world-foundation-v61.js';
let source=fs.readFileSync(path,'utf8');
const start='// BEGIN AUTHORED CREST ASSETS',end='// END AUTHORED CREST ASSETS';
const block=start+'\nconst v61CrestAssets='+JSON.stringify(assets,null,1)+';\nlet v61CrestInstance=0;\n'+end+'\n';
if(source.includes(start))source=source.slice(0,source.indexOf(start))+block+source.slice(source.indexOf(end)+end.length+1);
else source=source.replace('function v61CrestSVG(club){',block+'function v61CrestSVG(club){');
fs.writeFileSync(path,source);
