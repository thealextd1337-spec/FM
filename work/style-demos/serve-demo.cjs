'use strict';
// Starts the hash-bound HTTP candidate of one style demo on 127.0.0.1 and prints its build state.
// Serves only files listed in demo-package.json (GET/HEAD, no-store). GET /__build shows the build state.
// usage: node work/style-demos/serve-demo.cjs --style nighttime|lowpoly|baseline [--repo DIR] [--out DIR]
//        [--port N] [--allow-stale] [--json]
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{pipeline}=require('node:stream/promises');
const lib=require('./lib.cjs');

// Reads and verifies the package; throws exit-code-2 errors when it is broken, tampered or stale.
function loadPackage(repo,out,{allowStale=false}={}){
  const file=path.join(out,'demo-package.json');
  if(!fs.existsSync(file))throw lib.fail('Kein Paket in '+out+'. Zuerst: node work/style-demos/package-demo.cjs --style <stil> [--build]',2);
  const manifest=lib.readJson(file),checks=lib.makeChecks();
  lib.checkPackage(out,manifest,checks);
  const integrity=checks.failures.length===0;
  let freshness={state:'skipped',detail:'--allow-stale'};
  if(integrity&&!allowStale){
    const fresh=lib.makeChecks();lib.checkFreshness(repo,manifest,fresh);
    freshness=fresh.failures.length?{state:'stale',detail:fresh.failures.map(c=>c.name+(c.detail?' ('+c.detail+')':'')).join('; ')}:{state:'fresh',detail:'Fingerprint und Build-Ausgaben stimmen mit dem Checkout überein'};
    if(fresh.failures.length)checks.list.push(...fresh.failures);
  }
  if(checks.failures.length){checks.print();throw lib.fail('Paket '+out+' ist ungültig oder veraltet ('+checks.failures.length+' Fehler). Neu paketieren, oder zur bewussten Ausnahme --allow-stale (nur Frischeprüfung).',2);}
  return{manifest,integrity:{ok:true,files:manifest.files.length,checkedAt:new Date().toISOString(),checks:checks.list.length},freshness,file};
}

function createDemoServer(out,pkg){
  const {manifest}=pkg,site=path.join(out,'site'),files=new Map();
  for(const row of manifest.files){const full=path.join(site,row.file),stat=fs.statSync(full);files.set(row.file,{row,full,size:stat.size,mtimeMs:stat.mtimeMs,type:lib.mimeOf(row.file)});}
  const startedAt=new Date().toISOString();
  const status=port=>({schema:'d6-style-demo-build-1',style:manifest.style,version:manifest.version,url:'http://127.0.0.1:'+port+'/',pid:process.pid,startedAt,
    sourceCommit:manifest.source.commit,sourceBranch:manifest.source.branch,sourceDirty:manifest.source.dirty,sourceDirtyCount:manifest.source.dirtyCount,sourceDirtyPaths:manifest.source.dirtyPaths,
    sourceFingerprint:manifest.source.fingerprint,sourceId:manifest.sourceId,htmlSha256:manifest.htmlSha256,unityManifestSha256:manifest.unityManifestSha256,
    packageCreatedAt:manifest.createdAt,packageManifestSha256:lib.sha256File(pkg.file),integrity:pkg.integrity,freshness:pkg.freshness,files:manifest.files});
  const server=http.createServer((req,res)=>{
    const port=server.address().port,send=(code,body,type='text/plain; charset=utf-8',extra={})=>{
      const data=Buffer.from(body);res.writeHead(code,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(req.method==='HEAD'?undefined:data);};
    if(req.method!=='GET'&&req.method!=='HEAD')return send(405,'Method not allowed',undefined,{Allow:'GET, HEAD'});
    if(!['127.0.0.1:'+port,'localhost:'+port,'[::1]:'+port].includes(req.headers.host))return send(403,'Bad host');
    if(!/^\/[^\\\s]*$/.test(req.url)||req.url.startsWith('//'))return send(400,'Bad request target');
    let pathname;try{pathname=decodeURIComponent(req.url.split(/[?#]/)[0]);}catch{return send(400,'Bad encoding');}
    const parts=pathname.split('/');
    if(pathname.includes('\0')||pathname.includes('\\')||parts.includes('..')||parts.includes('.'))return send(400,'Bad path');
    if(pathname==='/__build')return send(200,JSON.stringify(status(port),null,2)+'\n','application/json; charset=utf-8');
    const entry=files.get(pathname==='/'?'index.html':pathname.slice(1));
    if(!entry)return send(404,'Not found');
    let stat;try{stat=fs.statSync(entry.full);}catch{return send(500,'Package file missing');}
    if(stat.size!==entry.size||stat.mtimeMs!==entry.mtimeMs)return send(500,'Package changed on disk after start; restart the server');
    res.writeHead(200,{'Content-Type':entry.type,'Content-Length':entry.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-D6-Style':manifest.style,'X-D6-Sha256':entry.row.sha256});
    if(req.method==='HEAD')return res.end();
    pipeline(fs.createReadStream(entry.full),res).catch(()=>{});
  });
  server.d6={status};
  return server;
}

// Resolves with the port; rejects with exit code 3 and a message about the occupant on EADDRINUSE.
function listen(server,port){
  return new Promise((resolve,reject)=>{
    server.once('error',async error=>{
      if(error.code!=='EADDRINUSE')return reject(error);
      let who='unbekannter Dienst (kein /__build)';
      try{const body=await new Promise((ok,no)=>{const r=http.get({host:'127.0.0.1',port,path:'/__build',timeout:1500},res=>{let t='';res.on('data',c=>t+=c);res.on('end',()=>ok(t));});r.on('error',no);r.on('timeout',()=>r.destroy(new Error('timeout')));});const s=JSON.parse(body);who='Stil-Demo '+s.style+' (PID '+s.pid+', Commit '+String(s.sourceCommit).slice(0,10)+')';}catch{}
      reject(lib.fail('Port '+port+' ist belegt von: '+who+'. Nichts wurde beendet. Anderen Port mit --port wählen oder den Besitzer selbst stoppen.',3));
    });
    server.listen(port,'127.0.0.1',()=>resolve(server.address().port));
  });
}

async function main(){
  lib.requireNode();
  const args=lib.parseArgs(process.argv.slice(2),{style:'string',repo:'string',out:'string',port:'string','allow-stale':'boolean',json:'boolean'});
  const style=lib.requireStyle(args),repo=lib.resolveRepo(args),out=lib.resolveOut(repo,style,args);
  const port=args.port===undefined?lib.STYLES[style].port:Number(args.port);
  if(!Number.isInteger(port)||port<0||port>65535)throw lib.fail('Ungültiger --port: '+args.port);
  const pkg=loadPackage(repo,out,{allowStale:args['allow-stale']});
  if(pkg.manifest.style!==style)throw lib.fail('Paket in '+out+' gehört zum Stil '+pkg.manifest.style+', nicht '+style,2);
  const server=createDemoServer(out,pkg),actual=await listen(server,port),s=server.d6.status(actual);
  if(args.json)console.log(JSON.stringify({...s,files:undefined}));
  else{
    const m=pkg.manifest;
    console.log('Doppel 6 Stildemo · Stil '+m.style+' · Version '+m.version+' · nur Loopback');
    console.log('URL         http://127.0.0.1:'+actual+'/\nBuildstand  http://127.0.0.1:'+actual+'/__build');
    console.log('Quelle      '+lib.describeState(m.source));
    console.log('Fingerprint '+m.source.fingerprint+'\nsourceId    '+m.sourceId+'\nHTML sha256 '+m.htmlSha256+'\nUnity-Manifest sha256 '+m.unityManifestSha256);
    console.log('Paket       '+m.createdAt+' · '+pkg.integrity.files+' Dateien geprüft');
    console.log('Frische     '+(pkg.freshness.state==='fresh'?'aktuell zum Checkout':pkg.freshness.state.toUpperCase()+' · '+pkg.freshness.detail));
    if(m.source.dirty)console.log('HINWEIS     Paket stammt aus nicht committetem Arbeitsstand ('+m.source.dirtyCount+' Pfade).');
    console.log('Beenden mit Strg+C. Statische Auslieferung ist keine Matchabnahme.');
  }
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
module.exports={loadPackage,createDemoServer,listen};
if(require.main===module)main().catch(error=>{console.error(error.exitCode?error.message:error.stack);process.exitCode=error.exitCode||1;});
