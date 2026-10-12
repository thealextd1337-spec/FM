'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),site=path.join(__dirname,'site');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.data':'application/octet-stream'};
http.createServer((req,res)=>{const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 if(pathname==='/away.html'){res.setHeader('Content-Type','text/html');return res.end('<!doctype html><title>Own release QA</title><a href="/">Return</a>');}
 const f=path.resolve(site,pathname==='/'?'index.html':pathname.slice(1));if(!f.startsWith(site+path.sep)||!fs.existsSync(f)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
}).listen(4548,'127.0.0.1',()=>console.log('Own production release130 QA http://127.0.0.1:4548'));
