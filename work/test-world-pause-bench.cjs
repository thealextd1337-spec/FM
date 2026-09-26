const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('dist/world-physical-v65.js','utf8');
const benchSource=source.slice(source.indexOf('function v65PauseBench'),source.indexOf('function v65PausePending'));
const context=vm.createContext({
 match:{exitedPeople:[{pid:'out'}]},
 v64Bench:state=>state.bench,
 v64Side:()=>[{pid:'out',name:'Gabriel Thomas',n:11,nation:'FRA',line:'att',fresh:70},{pid:'reserve',name:'Leon Wagner',n:8,nation:'GER',line:'mid',fresh:80}],
 v61FlagSVG:()=>'<svg></svg>',
 v61PositionNames:{att:'Angriff',mid:'Mittelfeld'},
 freshText:()=> 'frisch',
 v51StatusHTML:()=>'',
 v55TopSkillsHTML:()=>'',
 escapeHTML:value=>String(value),
 performanceRating:()=>7.2,
 v64UiName:pid=>pid
});
vm.runInContext(benchSource,context);
const render=vm.runInContext('v65PauseBench',context);
const state={bench:['reserve'],fresh:{},pending:[[]],substitutions:[{side:0,outPid:'out',inPid:'incoming',minute:35}],minutes:{out:35}};
let html=render({career:{},fixture:{},state,ownSide:0});
assert(html.includes('Gabriel Thomas')&&html.includes('Ausgewechselt · 35 Min. · Note 7,2'),'ausgewechselter Spieler steht als bewertete Karte auf der Bank');
assert.equal((html.match(/data-v65-bench=/g)||[]).length,1,'ausgewechselter Spieler ist nicht erneut einwechselbar');
assert(html.includes('data-v65-profile="out"'),'Spielerprofil bleibt erreichbar');
state.minutes.out=12;
html=render({career:{},fixture:{},state,ownSide:0});
assert(html.includes('Ausgewechselt · 12 Min. · ohne Note'),'kurzer Einsatz erhält keine Spielnote');
console.log('Pausenbank: ausgewechselte Spieler mit Einsatzzeit, Spielnote und ohne erneute Auswahl geprüft.');
