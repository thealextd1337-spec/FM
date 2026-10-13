'use strict';
// Shared helpers for the local style-demo tools (package-demo, serve-demo, verify-package).
// Reads the repository and writes nothing. Node 20+ built-ins only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');

const SCHEMA='d6-style-demo-package-1';
const STYLES={baseline:{port:4410},nighttime:{port:4411},lowpoly:{port:4412}};
const OWN_REPO=path.resolve(__dirname,'../..');
// Inputs that decide what the demo contains. Changing any of them makes a package stale.
// Unity Library/Temp and the Unity project outside the repo are not covered (see README).
const DEFAULT_INPUTS=['dist','prototypes/match-engine-unity','work/build.cjs','work/generate-3d-documentation.cjs','work/ui-redesign/shared','work/platform','work/match-next/contacts/catalog.json','docs/3d-system.md','docs/3d-system-en.md'];
const RUNTIME_ASSETS=['data','framework.js','loader.js','wasm'].map(x=>'unity-web.'+x);
const SCHEDULER=['/* D6_VIEW_FRAME_SCHEDULER_BEGIN */\n','\n/* D6_VIEW_FRAME_SCHEDULER_END */'];
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.data':'application/octet-stream','.css':'text/css; charset=utf-8','.png':'image/png','.htaccess':'text/plain; charset=utf-8'};
const mimeOf=file=>MIME[path.extname(file).toLowerCase()]||(path.basename(file)==='.htaccess'?MIME['.htaccess']:'application/octet-stream');

function requireNode(){if(Number(process.versions.node.split('.')[0])<20){console.error('Node 20+ erforderlich (gefunden '+process.versions.node+'). Node 24: C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');process.exit(1);}}
const sha256=data=>crypto.createHash('sha256').update(data).digest('hex');
const sha256File=file=>sha256(fs.readFileSync(file));
const lf=text=>text.replace(/\r\n/g,'\n');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const fail=(message,code=1)=>{const error=new Error(message);error.exitCode=code;return error;};

// Strict `--key value` / `--flag` parser; unknown options are errors. spec: {name:'string'|'boolean'|'list'}.
function parseArgs(argv,spec){
  const out={};
  for(const [name,type] of Object.entries(spec))if(type==='list')out[name]=[];
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(!arg.startsWith('--'))throw fail('Unerwartetes Argument: '+arg);
    const name=arg.slice(2),type=spec[name];
    if(!type)throw fail('Unbekannte Option: '+arg);
    if(type==='boolean'){out[name]=true;continue;}
    const value=argv[++i];
    if(value===undefined||value.startsWith('--'))throw fail('Option '+arg+' braucht einen Wert');
    if(type==='list')out[name].push(value);else out[name]=value;
  }
  return out;
}
function requireStyle(args){
  if(!args.style)throw fail('--style ist Pflicht ('+Object.keys(STYLES).join('|')+')');
  if(!STYLES[args.style])throw fail('Unbekannter Stil: '+args.style+' (erlaubt: '+Object.keys(STYLES).join(', ')+')');
  return args.style;
}
const resolveRepo=args=>{const repo=path.resolve(args.repo||OWN_REPO);if(!fs.existsSync(path.join(repo,'.git')))throw fail('Kein Git-Checkout: '+repo);return repo;};
// The package directory must stay below <repo>/outputs/style-demos so no tool can overwrite sources or other outputs.
function resolveOut(repo,style,args){
  const base=path.join(repo,'outputs','style-demos'),out=path.resolve(repo,args.out||path.join('outputs','style-demos',style));
  const rel=path.relative(base,out);
  if(!rel||rel.startsWith('..')||path.isAbsolute(rel))throw fail('--out muss unter '+base+' liegen: '+out);
  return out;
}

const git=(repo,args)=>execFileSync('git',['-C',repo,...args],{encoding:'utf8',maxBuffer:1<<28});
const gitBranch=repo=>git(repo,['rev-parse','--abbrev-ref','HEAD']).trim();

// Honest source state: HEAD, dirty flag and a content fingerprint of the working tree inputs
// (tracked + untracked-not-ignored files, raw bytes). Same content gives the same fingerprint
// whether or not it is committed; `dirty` says whether it is.
function sourceState(repo,inputs=DEFAULT_INPUTS){
  const files=git(repo,['ls-files','-z','--cached','--others','--exclude-standard','--',...inputs]).split('\0').filter(Boolean).sort();
  const hash=crypto.createHash('sha256');hash.update('d6-source-fingerprint-1\0'+inputs.join('\n')+'\n');
  let count=0;
  for(const file of [...new Set(files)]){const full=path.join(repo,file);if(!fs.existsSync(full))continue;hash.update(file+'\0'+sha256File(full)+'\n');count++;}
  const records=git(repo,['status','--porcelain=v1','-z','--untracked-files=all','--',...inputs]).split('\0').filter(Boolean),dirtyPaths=[];
  for(let i=0;i<records.length;i++){dirtyPaths.push(records[i].slice(3));if(/^[RC]/.test(records[i]))i++;}
  return{branch:gitBranch(repo),commit:git(repo,['rev-parse','HEAD']).trim(),dirty:dirtyPaths.length>0,dirtyCount:dirtyPaths.length,dirtyPaths:dirtyPaths.slice(0,40),fingerprint:hash.digest('hex'),fingerprintFiles:count,inputs};
}
const describeState=s=>s.commit.slice(0,10)+' ('+s.branch+') · '+(s.dirty?'ARBEITSSTAND NICHT COMMITTED, '+s.dirtyCount+' Pfade':'sauber, committed');

function makeChecks(){
  const list=[];
  return{list,add(name,ok,detail){list.push({name,ok:Boolean(ok),...(detail===undefined?{}:{detail:String(detail)})});return Boolean(ok);},
    get failures(){return list.filter(c=>!c.ok);},
    print(prefix=''){for(const c of list)console.log(prefix+(c.ok?'PASS ':'FAIL ')+c.name+(c.detail&&!c.ok?' · '+c.detail:''));}};
}

function walk(dir,base=dir,out=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,base,out);else out.push(path.relative(base,full).split(path.sep).join('/'));
  }
  return out;
}
const buildDir=repo=>path.join(repo,'outputs/platform/unity-web');

// Package-only checks: everything provable from the package itself (no repository needed).
function checkPackage(out,manifest,checks){
  const site=path.join(out,'site');
  checks.add('Paketschema '+SCHEMA,manifest.schema===SCHEMA,manifest.schema);
  checks.add('Stil bekannt',Boolean(STYLES[manifest.style]),manifest.style);
  const listed=new Set(manifest.files.map(f=>f.file));
  const required=['index.html','unity-match/runtime.html','unity-match/runtime.js','unity-match/.htaccess','unity/probe-build.json',...RUNTIME_ASSETS.map(x=>'unity/Build/'+x)];
  checks.add('Pflichtdateien im Manifest (HTML, Runtime, Unity-Manifest, 4 WebGL-Dateien)',required.every(f=>listed.has(f))&&listed.size===required.length,required.filter(f=>!listed.has(f)).join(', ')||('Dateien: '+listed.size));
  const actual=fs.existsSync(site)?walk(site):[];
  checks.add('Dateisatz von site/ entspricht dem Manifest exakt',JSON.stringify(actual.slice().sort())===JSON.stringify([...listed].sort()),'extra: '+actual.filter(f=>!listed.has(f)).join(',')+' fehlt: '+[...listed].filter(f=>!actual.includes(f)).join(','));
  const bytes={};
  for(const row of manifest.files){
    const full=path.join(site,row.file);
    if(!fs.existsSync(full)){checks.add('Datei '+row.file,false,'fehlt');continue;}
    const data=fs.readFileSync(full);bytes[row.file]=data;
    checks.add('Datei '+row.file+' sha256/Größe',data.length===row.bytes&&sha256(data)===row.sha256,'sha '+sha256(data).slice(0,12)+' erwartet '+row.sha256.slice(0,12));
  }
  if(!bytes['unity/probe-build.json']||!bytes['index.html']||!bytes['unity-match/runtime.js'])return;
  const probe=JSON.parse(bytes['unity/probe-build.json'].toString('utf8')),html=bytes['index.html'].toString('utf8'),runtime=bytes['unity-match/runtime.js'].toString('utf8');
  checks.add('Manifest sourceId = Unity-Manifest sourceId',manifest.sourceId===probe.sourceId&&/^[0-9a-f]{64}$/.test(probe.sourceId),probe.sourceId);
  checks.add('Manifest htmlSha256/unityManifestSha256 stimmen',manifest.htmlSha256===sha256(bytes['index.html'])&&manifest.unityManifestSha256===sha256(bytes['unity/probe-build.json']));
  checks.add('probe-build.json: Schema d6-probe-1 und Weltansicht d6-world-view-1',probe.schema==='d6-probe-1'&&probe.worldView==='d6-world-view-1');
  const urls={'unity-web.loader.js':probe.loaderUrl,'unity-web.data':probe.dataUrl,'unity-web.framework.js':probe.frameworkUrl,'unity-web.wasm':probe.codeUrl};
  for(const name of RUNTIME_ASSETS){
    const row=probe.files?.find(f=>f.file===name),data=bytes['unity/Build/'+name];
    checks.add('WebGL '+name+': Manifestzeile, Bytes und hashgebundene URL',Boolean(row&&data)&&row.sha256===sha256(data)&&row.bytes===data.length&&urls[name]==='/unity/Build/'+name+'?v='+row.sha256,urls[name]);
  }
  checks.add('probe-build.json listet genau 4 WebGL-Dateien',probe.files?.length===4);
  checks.add('Manifestquellen im Unity-Manifest vorhanden',manifest.unityManifestSources===probe.sourceFiles?.length&&probe.sourceFiles.length>0,probe.sourceFiles?.length);
  checks.add('HTML trägt PROTOTYP '+manifest.version,html.includes('PROTOTYP '+manifest.version));
  checks.add('HTML bindet Unity-Runtime unity-match/runtime.html?v='+manifest.version,html.includes('unity-match/runtime.html?v='+manifest.version));
  checks.add('HTML ohne lokalen Vorschau-Frame',!html.includes('local-preview-frame.js'));
  const begin=runtime.indexOf(SCHEDULER[0]),end=runtime.indexOf(SCHEDULER[1]),block=begin>=0&&end>begin?runtime.slice(begin+SCHEDULER[0].length,end):'';
  checks.add('Runtime beginnt mit Frame-Scheduler',begin===0&&block.length>200);
  checks.add('Frame-Scheduler der Runtime ist bytegleich im Eltern-HTML eingebettet',block.length>200&&lf(html).includes(block));
  checks.add('runtime.html lädt runtime.js und runtime.js holt /unity/probe-build.json',bytes['unity-match/runtime.html'].toString('utf8').includes('src="runtime.js"')&&runtime.includes("fetch('/unity/probe-build.json'"));
}

// Repository-bound checks of the standard build and WebGL output (before packaging).
function checkRepoBuild(repo,checks){
  const unity=path.join(repo,'prototypes/match-engine-unity'),web=buildDir(repo),out={};
  const identity=readJson(path.join(unity,'source-identity.json')),hash=crypto.createHash('sha256');
  for(const file of identity.sources){hash.update(file+'\0');hash.update(fs.readFileSync(path.join(repo,file)));}
  const sourceId=hash.digest('hex');out.sourceId=identity.sourceId;
  checks.add('Unity sourceId aus '+identity.sources.length+' Identitätsdateien neu berechnet = source-identity.json',sourceId===identity.sourceId,sourceId);
  checks.add('ProbeBuildIdentity.cs trägt sourceId',fs.readFileSync(path.join(unity,'ProbeBuildIdentity.cs'),'utf8').includes('"'+sourceId+'"'));
  const manifestFile=path.join(web,'probe-build.json');
  if(!fs.existsSync(manifestFile)){checks.add('outputs/platform/unity-web/probe-build.json vorhanden (WebGL-Build fehlt?)',false);return out;}
  const manifest=readJson(manifestFile);out.manifest=manifest;
  checks.add('Unity-Manifest sourceId = Quellen-sourceId (WebGL passt zu den Quellen)',manifest.sourceId===sourceId,manifest.sourceId);
  let badSources=manifest.sourceFiles.filter(r=>!fs.existsSync(path.join(unity,r.file))||sha256File(path.join(unity,r.file))!==r.sha256).map(r=>r.file);
  checks.add('Alle '+manifest.sourceFiles.length+' Manifestquellen entsprechen den aktuellen Dateien',badSources.length===0,badSources.join(', '));
  const assets=readJson(path.join(repo,'work/platform/assets/manifest.json'));
  const badAssets=assets.source.filter(r=>!fs.existsSync(path.join(repo,r.path))||sha256File(path.join(repo,r.path))!==r.sha256).map(r=>r.path);
  checks.add('Alle '+assets.source.length+' Originalassets entsprechen dem Assetmanifest',badAssets.length===0,badAssets.join(', '));
  checks.add('assetHash und catalogHash des Unity-Manifests aktuell',manifest.assetHash===assets.assetHash&&manifest.catalogHash===sha256File(path.join(repo,'work/match-next/contacts/catalog.json')));
  const buildFiles=fs.existsSync(path.join(web,'Build'))?fs.readdirSync(path.join(web,'Build')).sort():[];
  checks.add('Build-Ordner enthält genau die 4 WebGL-Dateien',JSON.stringify(buildFiles)===JSON.stringify([...RUNTIME_ASSETS].sort()),buildFiles.join(','));
  for(const row of manifest.files)checks.add('WebGL '+row.file+' entspricht dem Unity-Manifest',fs.existsSync(path.join(web,'Build',row.file))&&sha256File(path.join(web,'Build',row.file))===row.sha256);
  const htmlFile=path.join(repo,'outputs/index.html'),htmlCopy=path.join(repo,'outputs/Doppel-6-Fussballmanager.html');
  if(!fs.existsSync(htmlFile)){checks.add('outputs/index.html vorhanden (Standardbuild: work/build.cjs)',false);return out;}
  const html=fs.readFileSync(htmlFile,'utf8');
  checks.add('outputs/index.html = outputs/Doppel-6-Fussballmanager.html',fs.existsSync(htmlCopy)&&fs.readFileSync(htmlCopy).equals(fs.readFileSync(htmlFile)));
  const build=fs.readFileSync(path.join(repo,'work/build.cjs'),'utf8'),version=/replace\(\/PROTOTYP \\d\+\\b\/g,'PROTOTYP (\d+)'\)/.exec(build)?.[1];
  checks.add('build.cjs nennt die Versionsnummer',Boolean(version),version);out.version=Number(version);
  checks.add('HTML trägt PROTOTYP '+version+' und Runtime-Adresse ?v='+version,html.includes('PROTOTYP '+version)&&html.includes('unity-match/runtime.html?v='+version));
  // Staleness guard: every script/style that build.cjs embeds must appear byte-for-byte in the HTML.
  const names=[...new Set([...build.matchAll(/'([A-Za-z0-9_][A-Za-z0-9_./-]*\.(?:js|css))'/g)].map(m=>m[1]))].filter(n=>n!=='player-user-bootstrap-v112.js');
  const flut=require(path.join(repo,'work/ui-redesign/shared/assets.cjs')),embedded=[...names.map(n=>'dist/'+n),...[...flut.styles,...flut.scripts].map(n=>'dist/ui-flutlicht/'+n)].filter(f=>fs.existsSync(path.join(repo,f))&&fs.statSync(path.join(repo,f)).isFile());
  // build.cjs also rewrites the version label and inlines referee/trophy/sprite/crest PNGs after embedding; apply the same rewrites to the source text.
  const png=new Map(),inline=text=>text.replace(/PROTOTYP \d+\b/g,'PROTOTYP '+version).replace(/(?:referees|trophies|sprites|crests)\/[a-z0-9-]+\.png/g,asset=>{if(!png.has(asset))png.set(asset,'data:image/png;base64,'+fs.readFileSync(path.join(repo,'dist',asset)).toString('base64'));return png.get(asset);});
  // Short-prefix search plus startsWith keeps this linear; includes() with a multi-megabyte needle can stall.
  const embeds=text=>{const head=text.slice(0,160);for(let i=html.indexOf(head);i>=0;i=html.indexOf(head,i+1))if(html.startsWith(text,i))return true;return false;};
  const missing=embedded.filter(f=>{const text=lf(fs.readFileSync(path.join(repo,f),'utf8'));return text.length>0&&!embeds(text)&&!embeds(inline(text));});
  checks.add('Alle '+embedded.length+' vom Standardbuild eingebetteten Quelldateien stecken unverändert im HTML (kein alter Build)',embedded.length>100&&missing.length===0,missing.slice(0,8).join(', '));
  const sched=fs.readdirSync(path.join(repo,'dist')).filter(f=>/^view-frame-scheduler-v\d+\.js$/.test(f));
  checks.add('Genau ein Frame-Scheduler in dist/',sched.length===1,sched.join(','));
  if(sched.length===1){
    const runtime=lf(fs.readFileSync(path.join(repo,'dist/unity-match/runtime.js'),'utf8')),text=lf(fs.readFileSync(path.join(repo,'dist',sched[0]),'utf8')).replace(/\n$/,'');
    checks.add('dist/unity-match/runtime.js trägt '+sched[0]+' bytegleich im Präfix',runtime.startsWith(SCHEDULER[0]+text+SCHEDULER[1]));
  }
  return out;
}

// Does the package still match this repository? Fingerprint plus the build outputs it was made from.
function checkFreshness(repo,manifest,checks){
  const now=sourceState(repo,manifest.source.inputs);
  checks.add('Quellenfingerprint des Checkouts = Paketfingerprint (kein Arbeitsstand seit dem Paketieren verändert)',now.fingerprint===manifest.source.fingerprint,'Paket '+manifest.source.fingerprint.slice(0,12)+' / jetzt '+now.fingerprint.slice(0,12));
  const outputs={'index.html':'outputs/index.html','unity/probe-build.json':'outputs/platform/unity-web/probe-build.json',...Object.fromEntries(RUNTIME_ASSETS.map(x=>['unity/Build/'+x,'outputs/platform/unity-web/Build/'+x]))};
  for(const [file,source] of Object.entries(outputs)){
    const full=path.join(repo,source),row=manifest.files.find(f=>f.file===file);
    checks.add('Build-Ausgabe '+source+' = Paketdatei',fs.existsSync(full)&&row&&sha256File(full)===row.sha256,'Ausgabe neuer gebaut oder gelöscht');
  }
  return now;
}

// '[D6] match mesh <name> vertices=<n> base=<b> mask=<m> ground=<name> vertices=<n>|drawn' (WorldViewBridge, logged once per Unity runtime).
// expect: {mesh, vertices?, groundMesh?, groundVertices?}. Without groundMesh the ground part is not judged (historical packages do not log it);
// with groundMesh the line must name exactly that separate ground mesh ('ground=drawn' = no separate ground mesh = fails).
function matchMeshLines(lines,expect){
  const parse=l=>{const m=/match mesh (\S+) vertices=(\d+) base=(\S*) mask=(\S*)(?: ground=(\S+)(?: vertices=(\d+))?)?/.exec(l);return m&&{mesh:m[1],vertices:Number(m[2]),ground:m[5]===undefined?null:m[5],groundVertices:m[6]===undefined?null:Number(m[6])};};
  const parsed=lines.map(parse),problems=[];
  if(!lines.length)problems.push('keine Zeile "match mesh"');
  parsed.forEach((p,i)=>{
    if(!p){problems.push('nicht lesbar: '+lines[i]);return;}
    if(p.mesh!==expect.mesh)problems.push('Mesh '+p.mesh+' statt '+expect.mesh);
    if(expect.vertices!=null&&p.vertices!==expect.vertices)problems.push('Vertices '+p.vertices+' statt '+expect.vertices);
    if(expect.groundMesh){
      if(p.ground!==expect.groundMesh)problems.push('ground='+p.ground+' statt '+expect.groundMesh);
      if(expect.groundVertices!=null&&p.groundVertices!==expect.groundVertices)problems.push('Ground-Vertices '+p.groundVertices+' statt '+expect.groundVertices);
    }
  });
  return{ok:problems.length===0,problems,parsed};
}

module.exports={matchMeshLines,SCHEMA,STYLES,OWN_REPO,DEFAULT_INPUTS,RUNTIME_ASSETS,MIME,mimeOf,requireNode,sha256,sha256File,lf,readJson,fail,parseArgs,requireStyle,resolveRepo,resolveOut,git,gitBranch,sourceState,describeState,makeChecks,walk,checkPackage,checkRepoBuild,checkFreshness,buildDir};
