const http=require('http'),fs=require('fs'),path=require('path');
const base=path.resolve(__dirname,'../docs/3d-musterspieler-b');
const files=new Set(['vorschau.html','dreiviertel.png','frontal.png','profil.png','ruecken.png','gesicht.png','spieler.glb','spieler.blend']);
const mime={'.html':'text/html; charset=utf-8','.png':'image/png','.glb':'model/gltf-binary','.blend':'application/octet-stream'};
http.createServer((req,res)=>{
 const route=new URL(req.url,'http://localhost').pathname;
 const name=route==='/'?'vorschau.html':route.slice(1);
 const file=route==='/3d-stilreferenz-b.png'?path.resolve(base,'../3d-stilreferenz-b.png'):files.has(name)?path.join(base,name):null;
 if(!file||!fs.existsSync(file)){res.writeHead(404);return res.end('Nicht gefunden');}
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
 res.setHeader('Cache-Control','no-store');fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.D6_STYLE_PORT||4208),'127.0.0.1',()=>console.log('Musterspieler: http://127.0.0.1:'+Number(process.env.D6_STYLE_PORT||4208)));

