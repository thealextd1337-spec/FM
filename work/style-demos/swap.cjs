'use strict';
// Transactional replacement of the package entries (site/, demo-package.json) inside one owned output directory.
// Backing up the old entries and installing the staged ones form ONE transaction: on any rename error the old
// package is moved back, the staged candidate is moved out of the served location, and the original error is
// reported. The backup is deleted only after everything succeeded. `fsx` exists for fault injection in test-swap.cjs.
const nodeFs=require('node:fs'),path=require('node:path');
const {fail}=require('./lib.cjs');

const ENTRIES=['site','demo-package.json'];

// Every path that is moved or deleted must be absolute and strictly inside the owned output directory.
function ownedPath(root,p){
  const abs=path.resolve(p),rel=path.relative(root,abs);
  if(!path.isAbsolute(p)||!rel||rel.startsWith('..')||path.isAbsolute(rel))throw fail('Pfad außerhalb des eigenen Ausgabeordners, nichts verschoben oder gelöscht: '+p+' (Ordner '+root+')');
  return abs;
}

// staged: [[name, absolute path of the staged candidate]]; backupDir and rejectDir are absolute paths inside `out`.
function swapIn({out,staged,backupDir,rejectDir,fsx=nodeFs}){
  const root=path.resolve(out);
  if(!path.isAbsolute(out))throw fail('Ausgabeordner muss absolut sein: '+out);
  const own=p=>ownedPath(root,p);
  const move=(from,to)=>fsx.renameSync(own(from),own(to));
  const remove=p=>fsx.rmSync(own(p),{recursive:true,force:true});
  for(const [name] of staged)if(!ENTRIES.includes(name))throw fail('Unbekannter Paketeintrag: '+name);
  const hadOld=ENTRIES.some(name=>fsx.existsSync(own(path.join(root,name))));
  const backed=[],installed=[];
  try{
    for(const name of ENTRIES)if(fsx.existsSync(own(path.join(root,name)))){
      fsx.mkdirSync(own(backupDir),{recursive:true});
      move(path.join(root,name),path.join(backupDir,name));backed.push(name);
    }
    for(const [name,from] of staged){move(from,path.join(root,name));installed.push([name,from]);}
  }catch(original){
    const problems=[],rejected=[];
    // 1. Take the staged candidate out of the served location again (last installed first).
    for(const [name,from] of installed.slice().reverse()){
      try{move(path.join(root,name),from);}
      catch(e1){
        try{fsx.mkdirSync(own(rejectDir),{recursive:true});move(path.join(root,name),path.join(rejectDir,name));rejected.push(path.join(rejectDir,name));}
        catch(e2){problems.push('Kandidat '+name+' liegt noch in '+path.join(root,name)+' ('+(e2.code||e2.message)+')');}
      }
    }
    // 2. Put the previous package back.
    for(const name of backed.slice().reverse()){
      try{move(path.join(backupDir,name),path.join(root,name));}
      catch(e){problems.push('Altes '+name+' liegt noch in '+path.join(backupDir,name)+' ('+(e.code||e.message)+')');}
    }
    const reason=original.code&&!original.message.startsWith(original.code)?original.code+': '+original.message:original.message;
    if(problems.length){
      const error=fail('Austausch fehlgeschlagen ('+reason+') UND Wiederherstellung unvollständig. Zustand sichergestellt, nichts gelöscht:\n  - '+problems.join('\n  - ')+(rejected.length?'\n  - abgelehnter Kandidat in '+rejected.join(', '):'')+'\nAltes Paket (soweit gesichert): '+backupDir,2);
      error.rollbackFailed=true;error.cause=original;throw error;
    }
    try{remove(backupDir);}catch{}
    try{if(rejected.length)remove(rejectDir);}catch{}
    const error=fail('Austausch fehlgeschlagen ('+reason+'). Das bisherige Paket ist unverändert wiederhergestellt'+(hadOld?'':' (es war keins vorhanden)')+'; läuft noch ein Server auf diesem Paket?',2);
    error.cause=original;throw error;
  }
  try{remove(backupDir);}catch(e){console.warn('HINWEIS: Paket ausgetauscht, aber Sicherung '+backupDir+' ließ sich nicht löschen ('+(e.code||e.message)+'); sie kann manuell entfernt werden.');}
}

module.exports={ENTRIES,ownedPath,swapIn};
