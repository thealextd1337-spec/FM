'use strict';
// Renders the app icons (web manifest, Android launcher, Play listing) from the favicon motif "66" on #f0c46e.
//   node work/generate-app-icons.cjs
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
if(Number(process.versions.node.split('.')[0])<20){const result=require('node:child_process').spawnSync(path.join(runtime,'bin/node.exe'),[__filename,...process.argv.slice(2)],{stdio:'inherit'});process.exit(result.status??1);}
const {chromium}=require(path.join(runtime,'node_modules/playwright'));
const res='work/platform/android-twa/app/src/main/res/';
// size, corner radius as share of the size, glyph scale (1 = favicon proportions), transparent background
const icons=[
 ['dist/icons/icon-192.png',192,.25,1],
 ['dist/icons/icon-512.png',512,.25,1],
 // Maskable and Play icons are full-bleed; the glyph stays inside the 80 % safe circle.
 ['dist/icons/icon-maskable-512.png',512,0,.8],
 ['docs/play-store/icon-512.png',512,0,.8],
 // Adaptive launcher foreground: 108 dp canvas, visible safe zone 66 dp.
 [res+'drawable-nodpi/ic_launcher_foreground.png',432,null,.75],
];
const svg=(size,radius,scale)=>{const f=size*scale;return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`+
 (radius===null?'':`<rect width="${size}" height="${size}" rx="${size*radius}" fill="#f0c46e"/>`)+
 `<text x="${size/2}" y="${size/2+f*.175}" text-anchor="middle" font-size="${f*.55}" font-family="Arial" font-weight="bold" fill="#15191e">66</text></svg>`;};
const feature=`<div style="width:1024px;height:500px;background:#15191e;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;font-family:Arial;color:#edf0f3">`+
 svg(260,.25,1)+`<div><div style="font-size:86px;font-weight:bold">Doppel 6</div><div style="font-size:38px;margin-top:14px;color:#f0c46e">Dein Fußballmanager</div>`+
 `<div style="font-size:28px;margin-top:22px;line-height:1.35">Fünf Feldspieler. Ein Torwart.<br>Und dein Plan.</div></div></div>`;
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage();
  for(const [file,size,radius,scale] of icons){
   await page.setViewportSize({width:size,height:size});
   await page.setContent(`<body style="margin:0">${svg(size,radius,scale)}</body>`);
   fs.mkdirSync(path.dirname(file),{recursive:true});
   await page.locator('svg').screenshot({path:file,omitBackground:true});console.log('wrote',file);
  }
  await page.setViewportSize({width:1024,height:500});await page.setContent(`<body style="margin:0">${feature}</body>`);
  await page.locator('body>div').screenshot({path:'docs/play-store/feature-graphic.png'});console.log('wrote docs/play-store/feature-graphic.png');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
