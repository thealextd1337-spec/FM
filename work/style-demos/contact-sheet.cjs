'use strict';
// Contact sheets of acceptance screenshots for visual inspection (images are only laid out and downscaled, never altered on disk).
//   node work/style-demos/contact-sheet.cjs --out <dir under outputs/style-demos> --cols 3 --width 640 --name arch-ENG-1 --files a.png,b.png,...   (files relative to --shots)
const fs=require('node:fs'),path=require('node:path'),lib=require('./lib.cjs');lib.requireNode();
const args=lib.parseArgs(process.argv.slice(2),{shots:'string',out:'string',name:'string',files:'string',cols:'string',width:'string',playwright:'string',edge:'string'});
for(const k of ['shots','out','name','files'])if(!args[k])throw lib.fail('--'+k+' ist Pflicht');
const {chromium}=require(args.playwright||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const edge=args.edge||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',cols=Number(args.cols||3),w=Number(args.width||640),files=args.files.split(',');
const html='<body style="margin:0;background:#222;color:#eee;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat('+cols+',auto);gap:6px;padding:6px;width:max-content">'+files.map(f=>'<figure style="margin:0"><img style="width:'+w+'px;display:block" src="file:///'+path.resolve(args.shots,f).split(path.sep).join('/')+'"><figcaption>'+f.replace('.png','')+'</figcaption></figure>').join('')+'</div></body>';
(async()=>{fs.mkdirSync(args.out,{recursive:true});const tmp=path.join(args.out,'.sheet-'+args.name+'.html');fs.writeFileSync(tmp,html);
  const browser=await chromium.launch({executablePath:edge,headless:true,args:['--allow-file-access-from-files']}),page=await browser.newPage({viewport:{width:cols*(w+6)+6,height:400}});
  await page.goto('file:///'+tmp.split(path.sep).join('/'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
  const file=path.join(args.out,args.name+'.png');await page.screenshot({path:file,fullPage:true});await browser.close();fs.rmSync(tmp);console.log(file);})();
