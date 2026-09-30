// One command builds and serves the isolated camera demo on port 4189.
require('./build-camera-prototype.cjs');
const http=require('http'),fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','outputs','camera-prototype.html');
http.createServer((request,response)=>{
 const pathname=new URL(request.url,'http://127.0.0.1').pathname;
 if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
 if(pathname==='/'||pathname==='/camera-prototype.html'){
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});response.end(fs.readFileSync(file));
 }else{response.writeHead(404);response.end();}
}).listen(4189,'127.0.0.1',()=>console.log('Camera prototype: http://127.0.0.1:4189/'));
