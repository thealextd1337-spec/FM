// Isolated manual browser QA; never part of the production build.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const controls=`<script>
(()=>{
 let failWrites=false;
 const put=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(...args){if(failWrites&&this.name==='careers')throw new DOMException('Test: Speicher voll','QuotaExceededError');return put.apply(this,args)};
 const panel=document.createElement('aside');panel.id='storage-test-controls';
 panel.style.cssText='position:fixed;bottom:8px;left:8px;z-index:99999;background:#fff;color:#000;padding:8px;max-width:90vw;font:12px sans-serif';
 panel.innerHTML='<b>Isolierter Speichertest</b> <button id="qa-fail">Schreibfehler einschalten</button> <button id="qa-allow">Schreibfehler ausschalten</button> <button id="qa-corrupt">Test-Hauptkopie beschädigen</button> <output id="qa-result"></output>';
 document.body.append(panel);
 const result=panel.querySelector('output');
 panel.querySelector('#qa-fail').onclick=()=>{failWrites=true;result.textContent='Schreibfehler aktiv'};
 panel.querySelector('#qa-allow').onclick=()=>{failWrites=false;result.textContent='Schreiben erlaubt'};
 panel.querySelector('#qa-corrupt').onclick=()=>{const tx=v61StorageDb.transaction('careers','readwrite');tx.objectStore('careers').put([{broken:true}],'worlds');tx.oncomplete=()=>{result.textContent='Test-Hauptkopie beschädigt; Seite neu laden'}};
})();
</script>`;
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1'),relative=url.pathname==='/'?'index.html':url.pathname.slice(1);
 const target=path.resolve('dist',relative),root=path.resolve('dist')+path.sep;
 if(!target.startsWith(root)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return}
 res.setHeader('Cache-Control','no-store');
 res.setHeader('Content-Type',target.endsWith('.html')?'text/html; charset=utf-8':target.endsWith('.js')?'text/javascript; charset=utf-8':target.endsWith('.css')?'text/css; charset=utf-8':'image/png');
 const body=fs.readFileSync(target);
 res.end(relative==='index.html'?body.toString().replace('</body>',controls+'</body>'):body);
}).listen(4187,'127.0.0.1',()=>console.log('Isolated storage QA: http://127.0.0.1:4187'));
