const fs=require('node:fs');
const assert=require('node:assert/strict');
const index=fs.readFileSync('dist/index.html','utf8');
const buildScript=fs.readFileSync('work/build.cjs','utf8');
const html=fs.readFileSync('outputs/index.html','utf8');
for(const script of ['world-sprites-v82.js','world-sprites-v85.js','world-sprites-v86.js','world-sprites-v87.js','world-sprites-v88.js','world-sprites-v89.js','player-reference-v92.js']){
 assert(!index.includes(`<script src="${script}">`),`${script} is loaded in source page`);
 assert(!buildScript.includes(`'${script}'`),`${script} is included by builder`);
}
for(const marker of ['function v82SpriteSVG','player-atlas-a.png','player-atlas-b.png','player-reference-v92.png','function v92ReferenceSVG']){
 assert(!html.includes(marker),`${marker} leaked into release build`);
}
assert(html.includes('function v67Youth('),'existing youth gameplay must remain');
assert(html.includes('function v83StartGoalScene('),'goal scene must remain');
assert(html.includes('function v84BannerHTML('),'text and crest goal banner must remain');
assert(index.includes('PROTOTYP 80')&&html.includes('PROTOTYP 80'),'source and build version must match');
console.log('Release: no player portrait or celebration renderer; youth, goal scene and banner remain.');
