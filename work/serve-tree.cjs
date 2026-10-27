'use strict';
// Serves a checkout or frozen tree like work/ui-redesign/serve.cjs (source page with the Unity runtime URL, /unity/ build)
// plus /native-build.html (outputs/index.html), so before/after trees run side by side on QA ports 4250-4269.
//   node work/serve-tree.cjs <root> <port>
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),port=Number(process.argv[3]||4254);
// Installed-app files (service worker, manifest, icons, privacy page, asset links) sit at the site root as on the server.
const appFiles=fs.existsSync(path.join(root,'work/app-files.json'))?JSON.parse(fs.readFileSync(path.join(root,'work/app-files.json'),'utf8')):[];
if(port<4250||port>4269)throw Error('Port outside 4250-4269');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm','.data':'application/octet-stream','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(rel==='/native-build.html'||rel==='/'||rel==='/index.html'?path.join(root,'outputs/index.html'):rel.startsWith('/source/')?path.join(root,'dist',rel.slice(8)):rel.startsWith('/unity/')?path.join(root,'outputs/platform/unity-web',rel.slice(7)):rel.startsWith('/unity-match/')||appFiles.includes(rel.slice(1))?path.join(root,'dist',rel.slice(1)):'/');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');
 if(rel==='/source/index.html'){res.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script>window.D6UnityMatchUrl="/source/unity-match/runtime.html";</script>'));return;}
 fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('serving '+root+' on '+port));
