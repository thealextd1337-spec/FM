'use strict';
// Focused package checker: local file hashes, sourceId/manifest bindings, freshness against the checkout,
// and the HTTP payload identity of the served package (own ephemeral server, or a running one via --url).
// Static checks only; this is NOT a match acceptance (no browser, no Unity runtime).
// usage: node work/style-demos/verify-package.cjs --style nighttime|lowpoly|baseline [--repo DIR] [--out DIR]
//        [--url http://127.0.0.1:4411] [--no-http] [--deep] [--require-clean] [--allow-stale] [--report FILE]
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const lib=require('./lib.cjs'),{createDemoServer,listen}=require('./serve-demo.cjs');

function request(base,{method='GET',target='/',headers={}}){
  return new Promise((resolve,reject)=>{
    const url=new URL(base),hash=crypto.createHash('sha256');let bytes=0,chunks=[];
    const req=http.request({host:url.hostname,port:url.port,method,path:target,headers,agent:false},res=>{
      res.on('data',c=>{bytes+=c.length;hash.update(c);if(bytes<=1<<20)chunks.push(c);});
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,bytes,sha256:hash.digest('hex'),text:bytes<=1<<20?Buffer.concat(chunks).toString('utf8'):''}));
    });
    req.on('error',reject);req.end();
  });
}

async function checkHttp(base,out,manifest,checks){
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const build=await request(base,{target:'/__build'});let state={};
  try{state=JSON.parse(build.text);}catch{}
  checks.add('/__build liefert JSON mit Stil '+manifest.style,build.status===200&&state.style===manifest.style);
  checks.add('/__build: sourceId, Fingerprint, Commit, HTML- und Unity-Manifest-Hash = Paketmanifest',state.sourceId===manifest.sourceId&&state.sourceFingerprint===manifest.source.fingerprint&&state.sourceCommit===manifest.source.commit&&state.sourceDirty===manifest.source.dirty&&state.htmlSha256===manifest.htmlSha256&&state.unityManifestSha256===manifest.unityManifestSha256);
  checks.add('/__build: Dateiliste und demo-package.json-Hash = lokales Paket',same(state.files,manifest.files)&&state.packageManifestSha256===lib.sha256File(path.join(out,'demo-package.json')));
  checks.add('/__build: Integritätsprüfung des Servers bestanden',state.integrity?.ok===true,JSON.stringify(state.freshness));
  const probe=lib.readJson(path.join(out,'site/unity/probe-build.json'));
  for(const row of manifest.files){
    const target='/'+row.file,get=await request(base,{target}),head=await request(base,{method:'HEAD',target});
    const header=name=>get.headers[name];
    checks.add('HTTP GET '+target+' = Manifest (sha256, Größe)',get.status===200&&get.sha256===row.sha256&&get.bytes===row.bytes,get.status+' '+get.sha256.slice(0,12));
    checks.add('HTTP '+target+': Content-Type, no-store, Content-Length, X-D6-Sha256',header('content-type')===lib.mimeOf(row.file)&&header('cache-control')==='no-store'&&Number(header('content-length'))===row.bytes&&header('x-d6-sha256')===row.sha256,header('content-type')+' / '+header('cache-control'));
    checks.add('HTTP HEAD '+target+' ohne Body mit gleicher Größe',head.status===200&&head.bytes===0&&Number(head.headers['content-length'])===row.bytes);
  }
  const root=await request(base,{target:'/'});
  checks.add('HTTP GET / = index.html des Manifests',root.status===200&&root.sha256===manifest.htmlSha256);
  for(const [name,url] of [['loader',probe.loaderUrl],['data',probe.dataUrl],['framework',probe.frameworkUrl],['wasm',probe.codeUrl]]){
    const row=manifest.files.find(f=>f.file==='unity/Build/'+path.basename(url.split('?')[0])),got=await request(base,{target:url});
    checks.add('Hash-URL aus probe-build.json ('+name+') liefert dasselbe Payload',Boolean(row)&&got.status===200&&got.sha256===row.sha256&&url.endsWith('?v='+row.sha256));
  }
  // Rejections: nothing outside the manifest may be served and nothing may escape the site.
  const bad=[['/%2e%2e/demo-package.json',400],['/unity/Build/../probe-build.json',400],['/..%5cdemo-package.json',400],['//127.0.0.1/index.html',400],['/index.html%00',400],['/demo-package.json',404],['/unity-match/',404],['/unity/',404]];
  for(const [target,code] of bad){const got=await request(base,{target});checks.add('HTTP-Ablehnung '+target+' → '+code,got.status===code&&got.sha256!==manifest.htmlSha256,got.status);}
  const post=await request(base,{method:'POST',target:'/'});
  checks.add('HTTP-Ablehnung POST → 405 mit Allow',post.status===405&&post.headers.allow==='GET, HEAD');
  const host=await request(base,{target:'/',headers:{Host:'evil.example'}});
  checks.add('HTTP-Ablehnung fremder Host-Header → 403',host.status===403);
}

async function main(){
  lib.requireNode();
  const args=lib.parseArgs(process.argv.slice(2),{style:'string',repo:'string',out:'string',url:'string','no-http':'boolean',deep:'boolean','require-clean':'boolean','allow-stale':'boolean',report:'string'});
  const style=lib.requireStyle(args),repo=lib.resolveRepo(args),out=lib.resolveOut(repo,style,args);
  const file=path.join(out,'demo-package.json');
  if(!fs.existsSync(file))throw lib.fail('Kein Paket in '+out,2);
  const manifest=lib.readJson(file),checks=lib.makeChecks();
  checks.add('Paketstil = --style '+style,manifest.style===style,manifest.style);
  lib.checkPackage(out,manifest,checks);
  let now=null;
  if(!args['allow-stale'])now=lib.checkFreshness(repo,manifest,checks);
  if(args.deep){
    const deep=lib.checkRepoBuild(repo,checks);
    checks.add('Tiefenprüfung: sourceId und Version des Repo-Builds = Paket',deep.sourceId===manifest.sourceId&&deep.version===manifest.version);
  }
  if(args['require-clean']){
    now=now||lib.sourceState(repo,manifest.source.inputs);
    checks.add('--require-clean: Paket stammt aus committetem Stand',manifest.source.dirty===false,manifest.source.dirtyCount+' Pfade offen');
    checks.add('--require-clean: Checkout ist sauber und auf dem Paketcommit',now.dirty===false&&now.commit===manifest.source.commit,lib.describeState(now));
  }
  let url=args.url,server=null;
  if(!args['no-http']){
    if(!url){
      const pkg={manifest,file,integrity:{ok:true,files:manifest.files.length,checkedAt:new Date().toISOString(),checks:checks.list.length},freshness:{state:'checked-by-verifier',detail:''}};
      server=createDemoServer(out,pkg);url='http://127.0.0.1:'+await listen(server,0);
    }
    try{await checkHttp(url,out,manifest,checks);}finally{if(server)await new Promise(r=>server.close(r));}
    const after=lib.makeChecks();lib.checkPackage(out,manifest,after);
    checks.add('Paketdateien nach der HTTP-Prüfung unverändert',after.failures.length===0,after.failures.length+' Abweichungen');
  }
  const pass=checks.failures.length===0;
  checks.print();
  console.log((pass?'BESTANDEN':'FEHLGESCHLAGEN')+' · '+checks.list.length+' Prüfungen · '+style+' · '+lib.describeState(manifest.source)+' · '+(args['no-http']?'ohne HTTP':'HTTP '+url));
  if(args.report){
    const report={schema:'d6-style-demo-verify-1',checkedAt:new Date().toISOString(),pass,style,url:args['no-http']?null:url,flags:{deep:Boolean(args.deep),requireClean:Boolean(args['require-clean']),allowStale:Boolean(args['allow-stale'])},
      packageManifestSha256:lib.sha256File(file),sourceCommit:manifest.source.commit,sourceDirty:manifest.source.dirty,sourceFingerprint:manifest.source.fingerprint,sourceId:manifest.sourceId,htmlSha256:manifest.htmlSha256,unityManifestSha256:manifest.unityManifestSha256,
      scope:'Statische Datei-/HTTP-Identität. Keine Browser-, Unity-Runtime- oder Matchabnahme.',checks:checks.list};
    const target=path.resolve(repo,args.report);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');console.log('Bericht '+target);
  }
  if(!pass)process.exitCode=2;
}
main().catch(error=>{console.error(error.exitCode?error.message:error.stack);process.exitCode=error.exitCode||1;});
