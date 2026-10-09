'use strict';
// Pixel zoom of a PNG region: node zoom-png-114.cjs in.png out.png x y w h scale
const path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const [inp,outp,x,y,w,h,s='4']=process.argv.slice(2).map((v,i)=>i<2?v:Number(v));
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const p=await b.newPage({viewport:{width:w*s,height:h*s}});
const data='data:image/png;base64,'+fs.readFileSync(inp).toString('base64');
await p.setContent(`<body style="margin:0"><canvas id=c width=${w*s} height=${h*s}></canvas><script>const i=new Image();i.onload=()=>{const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(i,${x},${y},${w},${h},0,0,${w*s},${h*s});document.title='ok'};i.src='${data}'</script></body>`);
await p.waitForFunction(()=>document.title==='ok');await p.screenshot({path:outp});await b.close()})();
