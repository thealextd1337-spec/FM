'use strict';
// Packages the standard HTML build plus the Unity WebGL build of one repo into an isolated,
// hashed site/ directory with demo-package.json. Never adopts an old or incomplete build.
// usage: node work/style-demos/package-demo.cjs --style nighttime|lowpoly|baseline [--repo DIR] [--out DIR]
//        [--build] [--require-clean] [--include PATH]... [--allow-branch NAME]
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const lib=require('./lib.cjs');
lib.requireNode();

function main(){
  const args=lib.parseArgs(process.argv.slice(2),{style:'string',repo:'string',out:'string',build:'boolean','require-clean':'boolean',include:'list','allow-branch':'string'});
  const style=lib.requireStyle(args),repo=lib.resolveRepo(args),out=lib.resolveOut(repo,style,args);
  const branch=lib.gitBranch(repo);
  if(!/^codex\/demo-/.test(branch)&&branch!==args['allow-branch'])throw lib.fail('Branch "'+branch+'" ist kein Demo-Branch (codex/demo-*). Paketieren/Bauen verändert diesen Checkout nicht, wird aber ausdrücklich verweigert; mit --allow-branch '+branch+' bewusst freigeben.');
  console.log('Checkout '+repo+'\nStil     '+style+'\nAusgabe  '+out);

  if(args.build){
    console.log('Standardbuild: node work/build.cjs (cwd = Checkout)');
    const run=spawnSync(process.execPath,['work/build.cjs'],{cwd:repo,encoding:'utf8',maxBuffer:1<<26});
    if(run.status!==0)throw lib.fail('work/build.cjs fehlgeschlagen (Exit '+run.status+'):\n'+(run.stderr||run.stdout||'').slice(-1500),2);
  }

  const inputs=[...new Set([...lib.DEFAULT_INPUTS,...args.include.map(p=>p.replace(/\\/g,'/').replace(/\/$/,''))])];
  const before=lib.sourceState(repo,inputs);
  if(args['require-clean']&&before.dirty)throw lib.fail('--require-clean: Arbeitsstand nicht committed ('+before.dirtyCount+' Pfade, z. B. '+before.dirtyPaths.slice(0,5).join(', ')+')',2);

  const checks=lib.makeChecks(),built=lib.checkRepoBuild(repo,checks);
  if(checks.failures.length){checks.print();throw lib.fail('Quellen und Build passen nicht zusammen ('+checks.failures.length+' Fehler); es wurde nichts paketiert. Fehlenden Build mit --build bzw. Unity-WebGL-Build erzeugen.',2);}
  console.log('Repo-Prüfung: '+checks.list.length+' Prüfungen bestanden');

  const copies=[['outputs/index.html','index.html'],['dist/unity-match/runtime.html','unity-match/runtime.html'],['dist/unity-match/runtime.js','unity-match/runtime.js'],['dist/unity-match/.htaccess','unity-match/.htaccess'],['outputs/platform/unity-web/probe-build.json','unity/probe-build.json'],...lib.RUNTIME_ASSETS.map(x=>['outputs/platform/unity-web/Build/'+x,'unity/Build/'+x])];
  const stage=path.join(out,'.staging-'+process.pid),site=path.join(stage,'site');
  fs.rmSync(stage,{recursive:true,force:true});
  try{
    const files=copies.map(([source,file])=>{
      const dest=path.join(site,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(repo,source),dest);
      return{file,sha256:lib.sha256File(dest),bytes:fs.statSync(dest).size};
    });
    const assets=lib.readJson(path.join(repo,'work/platform/assets/manifest.json')).source;
    const manifest={
      schema:lib.SCHEMA,style,version:built.version,createdAt:new Date().toISOString(),
      source:{repo:path.basename(repo),...before},
      sourceId:built.sourceId,unityManifestSources:built.manifest.sourceFiles.length,
      htmlSha256:files.find(f=>f.file==='index.html').sha256,unityManifestSha256:files.find(f=>f.file==='unity/probe-build.json').sha256,
      originalAssets:assets.map(a=>({path:a.path,sha256:a.sha256})),
      builtWithPackager:Boolean(args.build),files
    };
    fs.writeFileSync(path.join(stage,'demo-package.json'),JSON.stringify(manifest,null,2)+'\n');
    // Verify the staged copy exactly as the server and verifier will, and make sure the sources did not move meanwhile.
    const staged=lib.makeChecks();lib.checkPackage(stage,manifest,staged);
    const after=lib.sourceState(repo,inputs);
    staged.add('Quellenfingerprint während des Paketierens unverändert',after.fingerprint===before.fingerprint);
    if(staged.failures.length){staged.print();throw lib.fail('Paketprüfung fehlgeschlagen ('+staged.failures.length+' Fehler); bestehendes Paket unverändert.',2);}
    // Swap in. A running server on the old site/ must be stopped first (Windows keeps files locked).
    const old=path.join(out,'.previous-'+process.pid);
    for(const name of ['site','demo-package.json'])if(fs.existsSync(path.join(out,name))){fs.mkdirSync(old,{recursive:true});fs.renameSync(path.join(out,name),path.join(old,name));}
    try{fs.renameSync(site,path.join(out,'site'));fs.renameSync(path.join(stage,'demo-package.json'),path.join(out,'demo-package.json'));}
    catch(error){throw lib.fail('Austausch fehlgeschlagen ('+error.code+'): läuft noch ein Server auf diesem Paket? Altes Paket liegt in '+old,2);}
    fs.rmSync(old,{recursive:true,force:true});
    console.log('Paket geschrieben: '+path.join(out,'demo-package.json'));
    console.log('Quelle  '+lib.describeState(before));
    console.log('Fingerprint '+before.fingerprint+' ('+before.fingerprintFiles+' Dateien)');
    console.log('sourceId '+manifest.sourceId+'\nHTML sha256 '+manifest.htmlSha256+'\nVersion '+manifest.version+' · '+files.length+' Dateien · '+staged.list.length+' Paketprüfungen bestanden');
    if(before.dirty)console.log('HINWEIS: Arbeitsstand ist nicht committed. Für die Übergabe committen und mit --require-clean neu paketieren.');
  }finally{fs.rmSync(stage,{recursive:true,force:true});}
}
try{main();}catch(error){console.error(error.exitCode?error.message:error.stack);process.exitCode=error.exitCode||1;}
