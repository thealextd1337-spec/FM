const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const physical=fs.readFileSync('dist/world-physical-v65.js','utf8');
const competitionSource=fs.readFileSync('dist/world-competition-v62.js','utf8');
const ui=fs.readFileSync('dist/world-match-ui-v64.js','utf8');
const context=vm.createContext({});
const load=(source,start,end)=>vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),context);
vm.runInContext(`
 var v65WorldActive=null,v42Session=null,match=null,rendered=0,saved=0,booked=0;
 var v42Screen={hidden:false},v61WorldScreen={hidden:true};
 var document={body:{classList:{remove(){}}}};
 function $(selector){return{hidden:false}}
 function v42Player(player){return{n:player.n,name:player.name,keeper:player.keeper,pid:player.pid,fin:player.fin,fresh:player.fresh}}
 function v42Sorted(players){return [...players].sort((a,b)=>b.fin-a.fin)}
 function v62Current(career){return career.world.competitions}
 function v64UiSave(){saved++}
 function v64CompleteOwnMatch(career){booked++;career.world.activeMatch.fixture.result={penalties:career.world.activeMatch.state.penaltyShootout};career.world.activeMatch.fixture.matchRecord={}}
 function v64UiRender(){rendered++}
 function v65Context(){return current}
`,context);
load(physical,'function v65Side(','function v65LineupPositions(');
load(ui,'function v64UiFirstLegScore(','function v64UiScreenHTML(');
load(physical,'function v65NeedsPenalties(','function v65Finish(');
load(competitionSource,'function v62ResolveSingle(','function v62CupProgress(');
load(competitionSource,'let v62CalendarSeason=null;','function v62AwardOverviewHTML(');
vm.runInContext("var v61CountryNames={FRA:'Frankreich'};function v62Date(){return '23. Dezember'}function escapeHTML(value){return String(value)}function v61CrestSVG(){return ''}",context);

const run=expression=>vm.runInContext(expression,context);
run(`
 var people=[0,1].flatMap(side=>Array.from({length:6},(_,n)=>({t:side,n:n+1,pid:side+'-'+n,name:'Spieler '+side+'-'+n,keeper:n===0,fin:10+n,fresh:80})));
 var fixture={id:'tie',competitionId:'cup',homeId:'own',awayId:'other',round:'SF',leg:1};
 var career={manager:{managedClubId:'own'},world:{seed:'fixed',season:1,clubs:[{id:'own',name:'Eigener Verein',roster:[]},{id:'other',name:'Gegner',roster:[]}],competitions:[{id:'cup',type:'cup',fixtures:[fixture]}],activeMatch:{fixture,state:{phase:'finished',fresh:{},stats:{},postMatchReport:{players:[],goals:[],score:[1,1],clubIds:['own','other']}}}}};
 var current={career,fixture,state:career.world.activeMatch.state,ownSide:0};
 match={score:[1,1],people,kits:{user:{main:'#123',trim:'#fff'},opponent:{main:'#456',trim:'#fff'}}};
 for(const person of people){current.state.stats[person.pid]={};current.state.postMatchReport.players.push({pid:person.pid,stats:{}})}
`);
assert.equal(run('v65NeedsPenalties(current)'),true,'Pokalremis startet Elfmeterschießen');
run("career.world.competitions[0].type='league'");
assert.equal(run('v65NeedsPenalties(current)'),false,'Ligaremise endet ohne Elfmeterschießen');
run("career.world.competitions[0].type='europe';fixture.round='F'");
assert.equal(run('v65NeedsPenalties(current)'),true,'Europacupfinale bei Remis');
run("fixture.round='SF';fixture.leg=2;fixture.pair=0;fixture.homeId='other';fixture.awayId='own';current.ownSide=1;career.world.competitions[0].fixtures.unshift({pair:0,round:'SF',leg:1,result:{homeGoals:2,awayGoals:1}});match.score=[1,2]");
assert.equal(run('v65NeedsPenalties(current)'),true,'Rückspiel bei gleichem Gesamtstand trotz Sieg im Einzelspiel');
run('match.score=[2,2]');
assert.equal(run('v65NeedsPenalties(current)'),false,'klarer Gesamtstand benötigt kein Elfmeterschießen');
run('match.score=[1,2];current.state.penaltySession=v65PenaltySession(current)');
assert.equal(run('current.state.penaltySession.own.length'),6);
assert.equal(run('current.state.penaltySession.opponent.length'),6);
run("current.state.penaltySession.phase='done';current.state.penaltySession.score=[4,3];current.state.penaltySession.winner=0;current.state.penaltySession.kicks=[{side:0,number:2,goal:true},{side:1,number:2,goal:false}]");
run('v65SettleWorldPenalties()');
assert.equal(run('career.world.activeMatch.fixture.result.penalties.join(":")'),'3:4','Elfmeterschießen wird auf Heim/Auswärts umgedreht');
assert.equal(run('current.state.stats["0-1"].penaltiesScored'),1);
assert.equal(run('current.state.stats["1-1"].penaltiesMissed'),1);
assert.equal(run('current.state.postMatchReport.penaltyShootout.score.join(":")'),'4:3');
assert.equal(run('current.state.phase'),'finished');
assert.equal(run('booked'),1,'Partie wird einmal verbucht');
assert.equal(run('rendered'),1,'Spielbericht wird geöffnet');
run("fixture.result={homeGoals:1,awayGoals:1,penalties:[3,4]};v62ResolveSingle(career,fixture)");
assert.equal(run('fixture.result.penalties.join(":")'),'3:4','gespieltes Pokalergebnis bleibt bestehen');
assert.equal(run('fixture.result.winnerId'),'own');
run("fixture.result={homeGoals:2,awayGoals:1,penalties:[3,4]};v62ResolveSecondLeg(career,fixture,career.world.competitions[0])");
assert.equal(run('fixture.result.penalties.join(":")'),'3:4','gespieltes Europacupergebnis bleibt bestehen');
assert.equal(run('fixture.result.winnerId'),'own');
run("career.world.competitions[0].season=1;career.world.competitions[0].country='FRA'");
assert.match(run('v62CalendarHTML(career)'),/1:2<small>i\. E\. 4:3<\/small>/,'Kalender zeigt Heim/Auswärts und Elfmeterschießen aus eigener Sicht');
console.log('Welt-Elfmeterschießen: Pokal, Europacup-Gesamtstand, Heimrecht, Statistik und einmalige Verbuchung geprüft.');
