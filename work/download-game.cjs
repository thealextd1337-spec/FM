// Local download of the existing offline build; no publishing or game changes.
const http=require('http'),fs=require('fs'),path=require('path');
const directory=path.resolve(__dirname,'../outputs');
http.createServer((req,res)=>{
 const route=new URL(req.url,'http://localhost').pathname;
 if(route==='/'){
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end('<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Doppel 6 herunterladen</title><body style="font:18px system-ui;max-width:640px;margin:48px auto;padding:20px;background:#142b2c;color:#f3f8ed"><h1>Doppel 6 herunterladen</h1><p>Aktuelle Offline-Version mit naher und weiter TV-Kamera.</p><p><a href="/doppel6.zip" download style="display:inline-block;padding:16px;background:#c7f36b;color:#142629;border-radius:6px">ZIP herunterladen</a></p><p>ZIP entpacken und doppel6.html im Browser öffnen.</p><p><a href="/doppel6.html" download style="color:#c7f36b">HTML-Datei direkt herunterladen</a></p></body></html>');return;
 }
 const name=route==='/doppel6.zip'?'doppel6.zip':route==='/doppel6.html'?'doppel6.html':null;
 if(!name||!['GET','HEAD'].includes(req.method)){res.writeHead(404);res.end();return;}
 const file=path.join(directory,name);
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',name.endsWith('.zip')?'application/zip':'text/html; charset=utf-8');
 res.setHeader('Content-Disposition',`attachment; filename="${name}"`);
 res.setHeader('Content-Length',fs.statSync(file).size);res.setHeader('Cache-Control','no-store');
 if(req.method==='HEAD'){res.end();return;}
 fs.createReadStream(file).pipe(res);
}).listen(4191,'127.0.0.1',()=>console.log('Download: http://127.0.0.1:4191/'));
