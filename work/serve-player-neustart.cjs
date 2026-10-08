const http=require('http'),fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'../outputs/spieler-neustart.html');
http.createServer((req,res)=>{
 if(new URL(req.url,'http://localhost').pathname!=='/'){res.writeHead(404);return res.end('Nicht gefunden');}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');
 fs.createReadStream(file).pipe(res);
}).listen(4216,'127.0.0.1',()=>console.log('http://127.0.0.1:4216/'));
