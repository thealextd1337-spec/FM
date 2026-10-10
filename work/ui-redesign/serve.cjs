'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../..');
function createServer(){return http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const rel=decodeURIComponent(url.pathname),source=rel.startsWith('/source/'),unity=rel.startsWith('/unity/');
 const root=source?path.join(base,'dist'):unity?path.join(base,'outputs/platform/unity-web'):__dirname;
 const file=path.resolve(root,source?rel.slice(8):unity?rel.slice(7):rel==='/'?'preview.html':rel.slice(1));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm','.data':'application/octet-stream'}[path.extname(file)]||'application/octet-stream'));
 res.setHeader('Cache-Control',unity&&url.searchParams.has('v')?'private, max-age=3600':'no-cache');
 if(source&&path.basename(file)==='index.html'){res.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script>window.D6UnityMatchUrl="/source/unity-match/runtime.html";</script>'));return;}
 fs.createReadStream(file).pipe(res);
 });}
module.exports={createServer};
if(require.main===module)createServer().listen(4200,'127.0.0.1',()=>console.log('Flutlicht: http://127.0.0.1:4200/'));
