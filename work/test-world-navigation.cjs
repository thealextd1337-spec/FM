const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/world-match-ui-v64.js','utf8');
const saveButton={hidden:true,disabled:false},error={textContent:''},panel={},header={},controls={};
const calls=[];
const context=vm.createContext({
 v61CurrentCareer:{world:{}},v61WorldScreen:{hidden:false},startScreen:{hidden:false},
 v64MatchMenu:{parentElement:header,open:false,classList:{toggle(){}},querySelector:selector=>selector==='[data-v64-save-exit]'?saveButton:selector==='[role="alert"]'?error:panel},
 v58Bar:{hidden:true,querySelector:()=>controls},v58Button:{parentElement:controls},v64HeaderActions:header,
 v64LanguageControl:{parentElement:panel},v64MenuAnchor:{remove(){}},document:{querySelectorAll:()=>[]},
 v65WorldActive:null,
 async v64UiSave(){calls.push('save')},
 async v61ShowStart(){calls.push('start');context.v61WorldScreen.hidden=true;context.startScreen.hidden=false;context.v61CurrentCareer=null},
 showStartScreen(){calls.push('legacy')}
});
vm.runInContext(source.slice(source.indexOf('function v64UiMenuVisible'),source.indexOf('const v64BaseProgressRefresh')),context);
vm.runInContext(source.slice(source.indexOf('async function v64SaveAndStart'),source.indexOf("v64MatchMenu.addEventListener('click'")),context);
vm.runInContext(source.slice(source.indexOf('const v64BaseLegacyShowStart'),source.indexOf('function v64UiCount')),context);
(async()=>{
 context.v64UiMenuVisible();
 assert.equal(saveButton.hidden,false,'aktive Karriere bietet Speichern & Start auch bei inkonsistentem Sichtbarkeitszustand');
 await context.showStartScreen();
 assert.deepEqual(calls,['save','start'],'Logo speichert und verlässt die Vereinswelt statt alte Startseite zusätzlich einzublenden');
 assert.equal(context.v61WorldScreen.hidden,true);
 context.v64UiMenuVisible();assert.equal(saveButton.hidden,true,'ohne Karriere keine Speicheraktion');
 calls.length=0;
 await context.showStartScreen();assert.deepEqual(calls,['legacy'],'alte Startseite bleibt ohne Vereinswelt erreichbar');
 context.v61WorldScreen.hidden=false;calls.length=0;
 await context.showStartScreen();assert.deepEqual(calls,['start'],'Länder-/Vereinswahl wird ebenfalls geschlossen');
 context.v61CurrentCareer={world:{}};context.startScreen.hidden=true;context.v61WorldScreen.hidden=false;calls.length=0;
 context.v64UiSave=async()=>{throw Error('Speicher voll')};
 await context.v64SaveAndStart(saveButton);
 assert.equal(context.startScreen.hidden,true,'Speicherfehler darf die Karriere nicht schließen');
 assert.equal(context.v61WorldScreen.hidden,false);
 assert.equal(error.textContent,'Speicher voll');assert.equal(saveButton.disabled,false);
 context.v65WorldActive={};calls.length=0;
 context.v61ShowStart=async()=>{calls.push('physical-save-and-leave')};
 await context.v64SaveAndStart(saveButton);
 assert.deepEqual(calls,['physical-save-and-leave'],'laufende Partie nutzt den vorhandenen Snapshot- und Pausenablauf');
 assert(error.textContent.includes('laufenden Ballaktion'));
 assert(source.includes('>Speichern & Start</button>'));
 // Exercise the actual exit wrapper with a delayed/failed write, not just a mocked exit.
 let finish,rejectWrite,closed=0,stopped=0;
 const exit=vm.createContext({v61CurrentCareer:{world:{activeMatch:{state:{phase:'live'}}}},v64UiStop(){stopped++},
  v64UiSave:()=>new Promise((resolve,reject)=>{finish=resolve;rejectWrite=reject}),v61WaitForStorage:async()=>{},
  v61ShowStart(){closed++},v64MatchMenu:{},v64UiMenuVisible(){},document:{querySelectorAll:()=>[]}});
 const wrapperStart=source.indexOf('const v64BaseShowStart='),wrapper=source.slice(wrapperStart,source.indexOf('const v64BaseProgressState=',wrapperStart));vm.runInContext(wrapper,exit);
 const failedExit=exit.v61ShowStart();assert.equal(closed,0);assert.equal(stopped,1);rejectWrite(Error('Speicher voll'));
 await assert.rejects(failedExit,/Speicher voll/);assert.equal(closed,0,'Fehlgeschlagener Schreibabschluss erhält die Karriere');
 const delayedExit=exit.v61ShowStart();assert.equal(closed,0);finish();await delayedExit;assert.equal(closed,1,'Erst der bestätigte Schreibabschluss öffnet die Startseite');
 console.log('Navigation: Menü, Logo, Speichern vor Start, Fehlerfall und Übergabe laufender Partien geprüft.');
})().catch(error=>{console.error(error);process.exitCode=1});
