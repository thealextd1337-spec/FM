const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const read=file=>fs.readFileSync(path.join(dist,file),'utf8');
const before=(file,marker)=>{
 const source=read(file),end=source.indexOf(marker);
 if(end<0)throw Error(`Abschnitt fehlt: ${file} / ${marker}`);
 return source.slice(0,end);
};
const variableSpriteFiles=['player-atlas-a.png','player-atlas-b.png',
 'player-pose-arms-wide.png','player-pose-fist-chest.png','player-pose-two-fingers.png'];
const variableSpriteData=Object.fromEntries(variableSpriteFiles.map(file=>[
 file,`data:image/png;base64,${fs.readFileSync(path.join(dist,'sprites',file)).toString('base64')}`
]));
const variableSpriteSource=read('world-sprites-v86.js')
 .replace('`sprites/player-atlas-${sheet}.png`','v90SpriteAsset(`player-atlas-${sheet}.png`)')
 .replace('href="sprites/${pose.file}"','href="${v90SpriteAsset(pose.file)}"');
if(variableSpriteSource.includes('`sprites/player-atlas-${sheet}.png`')||variableSpriteSource.includes('href="sprites/${pose.file}"'))throw Error('Variable Sprite-Pfade nicht eingebettet');
const sources=[
 read('world-catalog-v61.js'),
 read('world-nationalities-v79.js'),
 before('world-foundation-v61.js','const v61Panel='),
 before('world-youth-manager-v67.js','function v67Init('),
 before('world-sprites-v82.js','const v82BaseOpenPlayerProfile='),
 read('world-sprites-v85.js'),
 `const v90SpriteAssets=${JSON.stringify(variableSpriteData)};function v90SpriteAsset(name){return v90SpriteAssets[name]||''}`,
 variableSpriteSource,
 ...['world-sprites-v87.js','world-sprites-v88.js','world-sprites-v89.js',
     'player-reference-v92.js','player-creation-demo-v90.js'].map(read)
];
if(sources.some(source=>/<\/script/i.test(source)))throw Error('Inline-Skript enthält schließendes Script-Tag');
const template=read('player-creation-demo-v90.template.html');
if(!template.includes('<!-- DEMO_RUNTIME -->'))throw Error('Demo-Platzhalter fehlt');
let html=template.replace('<!-- DEMO_RUNTIME -->',`<script>\n${sources.join('\n')}\n</script>`);
const assets=[...new Set(html.match(/sprites\/[a-z0-9-]+\.png/g)||[])];
for(const asset of assets){
 const data=fs.readFileSync(path.join(dist,asset)).toString('base64');
 html=html.replaceAll(asset,`data:image/png;base64,${data}`);
}
const target=path.join(dist,'player-creation-demo-v90.html');
fs.writeFileSync(target,html);
console.log(`${path.relative(root,target)}: ${assets.length+variableSpriteFiles.length} eingebettete PNGs, ${(Buffer.byteLength(html)/1048576).toFixed(1)} MiB`);
