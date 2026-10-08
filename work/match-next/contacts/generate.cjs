'use strict';
const fs=require('node:fs'),path=require('node:path');
const radius=.1764,goalWidth=44*.2/(544/600),catalog=[];
for(const scale of [1,1.2])for(const fieldPlayers of [5,6])for(const dir of [-1,1]){
 const geometry={length:68*scale,width:44*scale,fieldPlayers,attackDirection:dir,goalWidth,goalHeight:goalWidth/3,penaltyDepth:10,penaltyWidth:20};
 const team=dir===1?0:1,defending=1-team,goal=geometry.length/2;
 const actor=(id,x,z,action='receive',side=defending,vx=0,vz=0)=>({id,team:side,role:id.includes('keeper')?'keeper':'field',position:[dir*x,.29,z],velocity:[dir*vx,0,vz],radius:.3,reach:.8,action});
 function add(id,title,kind,ball,actors,expected,provenance={},extras={}){
  const roster=[...actors];
  for(const t of [0,1]){
   if(!roster.some(a=>a.team===t&&a.role==='keeper'))roster.push({id:`reserve-keeper-${t}`,team:t,role:'keeper',position:[t===0?-goal+1:goal-1,.29,geometry.width/2-2],velocity:[0,0,0],radius:.3,reach:.8,action:'none'});
   let n=roster.filter(a=>a.team===t&&a.role==='field').length;
   while(n++<fieldPlayers)roster.push({id:`reserve-${t}-${n}`,team:t,role:'field',position:[(n-3)*3,.29,(t===0?-1:1)*(geometry.width/2-2)],velocity:[0,0,0],radius:.3,reach:.8,action:'none'});
  }
  catalog.push({schemaVersion:'d6-probe-1',id:`${id}-${scale===1?'current':'large'}-${fieldPlayers}-${dir===1?'positive':'negative'}`,title,kind,duration:1,ball:{position:[dir*ball[0],ball[1]??.29,ball[2]??0],velocity:[dir*(ball[3]??0),ball[4]??0,ball[5]??0],radius},actors:roster,expected,geometry,provenance:{family:id,status:'provisional-test-assumptions',coordinateUnit:'renderer-scene-unit',boundaryConvention:'ball-center-inclusive-box',contactModel:'constant-velocity-center-reach-sphere',tieBreak:'actor-id-lexical-test-only',...provenance},...extras});
 }
 for(const side of [-1,1])add(`free-goal-keeper-${side<0?'left':'right'}`,'Freies Tor neben seitlichem Keeper','shot',[goal-12,.29,0,20],[actor('keeper',goal-1,side*7,'catch')],{type:'goal',actorId:null});
 add('keeper-reachable','Erreichbare Parade','shot',[goal-12,.29,0,20],[actor('keeper',goal-1,0,'catch')],{type:'contact',actorId:'keeper'});
 add('keeper-unreachable','Unerreichbare Parade','shot',[goal-12,.29,0,20],[actor('keeper',goal-1,4,'catch')],{type:'goal',actorId:null});
 add('keeper-moving-away','Keeper entfernt sich tatsächlich von der Bahn','shot',[goal-12,.29,0,20],[actor('keeper',goal-1,0,'catch',defending,0,8)],{type:'goal',actorId:null});
 add('fast-pass-interception','Schneller Ball trifft bewegten Gegner vor Empfänger','contact',[0,.29,0,30],[actor('receiver',20,0,'receive',team),actor('interceptor',10,1,'intercept',defending,0,-3)],{type:'contact',actorId:'interceptor'});
 add('contact-tie','Zeitgleicher Kontakt reproduzierbar','contact',[0,.29,0,20],[actor('b',10,0),actor('a',10,0)],{type:'contact',actorId:'a'});
 add('blocker-enters','Verteidiger tritt während Ballflug in die Bahn','contact',[0,.29,0,20],[actor('blocker',10,3,'block',defending,0,-6)],{type:'contact',actorId:'blocker'});
 add('blocker-leaves','Verteidiger läuft vor Ankunft aus der Bahn','contact',[0,.29,0,20],[actor('blocker',10,0,'block',defending,0,6)],{type:'free',actorId:null});
 add('unreached-pass','Unerreichbares Raumziel erzeugt keinen Besitz','contact',[0,.29,0,16],[actor('receiver',15,8,'receive',team)],{type:'free',actorId:null});
 add('alternate-receiver','Tatsächlich erreichbarer anderer Mitspieler','contact',[0,.29,0,16],[actor('intended',15,8,'receive',team),actor('alternate',9,0,'receive',team)],{type:'contact',actorId:'alternate'},{intendedReceiverId:'intended'});
 add('self-recovery','Eigenwiederaufnahme ist keine Passannahme','contact',[0,.29,0,10],[actor('passer',6,0,'receive',team)],{type:'contact',actorId:'passer'},{passerId:'passer',expectedEvent:'self-recovery',passCompleted:false});
 for(const action of ['block','parry'])add(`${action}-followup`,'Tatsächlicher Abpraller und eigener Folgekontakt','sequence',[goal-12,.29,0,20],[actor(action==='parry'?'keeper':'blocker',goal-2,0,action),actor('finisher',goal-6,1,'shoot',team)],{type:'contact',actorId:action==='parry'?'keeper':'blocker'},{expectedEvents:['shot-release',action,'free-ball','shot-release','goal'],parentChainRequired:true},{followup:{intent:{actorId:'finisher',trigger:'actual-free-rebound',action:'chase-then-shoot',target:[dir*(goal+1),.29,0]},ball:{position:[dir*(goal-3),.29,1],velocity:[-dir*10,0,0],radius},actors:[actor('finisher',goal-6,1,'shoot',team)],duration:.6,expectedActorId:'finisher',shot:{position:[dir*(goal-6),.29,1],velocity:[dir*20,0,0],radius},shotDuration:.5,expectedFinalType:'goal'}});
 for(const [id,depth,z,allowed,reason] of [['box-inside',9,0,true,'allowed'],['box-boundary',10,0,true,'allowed'],['box-outside',10.001,0,false,'outside-own-box'],['box-width-boundary',5,10,true,'allowed'],['box-width-outside',5,10.001,false,'outside-own-box'],['native-box-mismatch',12,0,false,'outside-own-box'],['opponent-box',geometry.length-5,0,false,'outside-own-box']])add(id,'Handberechtigung im eigenen Strafraum','keeper-permission',[goal-depth,.29,z,0],[actor('keeper',goal-depth,z,'catch')],{allowed,reason},{subjectId:'keeper',...(id==='native-box-mismatch'?{nativeBaselineExpected:true,nativeBaselineReason:'native-area-16.5x24-versus-visible-10x20'}:{})});
 for(const [id,sourceAction,keeperFootAction,allowed] of [['normal-origin','opponent-shot','none',true],['backpass','deliberate-foot-pass','none',false],['own-throw','direct-throw-in','none',false],['control-no-exception','deliberate-foot-pass','control',false],['clearance-exception','deliberate-foot-pass','clearance-executed',true],['attempt-exception','direct-throw-in','clearance-attempted',true]])add(id,'Herkunft und bestätigte Rückpassausnahme','keeper-permission',[goal-3,.29,0,0],[actor('keeper',goal-3,0,'catch')],{allowed,reason:allowed?'allowed':'restricted-origin'},{subjectId:'keeper',sourceTeam:defending,sourceAction,keeperFootAction,violation:allowed?null:'indirect-free-kick-if-actual-hand-contact'});
 add('whole-ball-on-line','Ballmittelpunkt überschritten, Ball noch nicht vollständig','boundary',[goal-radius,.29,0,radius],[],{type:'free',actorId:null});
 add('whole-ball-tangent','Ball tangiert Linie am Ende: noch kein Tor','boundary',[goal,.29,0,radius],[],{type:'free',actorId:null});
 add('goal-post-edge','Ball reicht seitlich bis an Torpfosten','boundary',[goal-2,.29,goalWidth/2-radius,4],[],{type:'out',actorId:null},{limitation:'frame-collision-not-simulated; goal must not be awarded'});
 add('goal-crossbar-edge','Ball reicht bis an Querlattenhöhe','boundary',[goal-2,goalWidth/3-radius,0,4],[],{type:'out',actorId:null},{limitation:'frame-collision-not-simulated; goal must not be awarded'});
 add('touchline-out','Vollständige Seitenlinienquerung','boundary',[0,.29,geometry.width/2-1,0,0,4],[],{type:'out',actorId:null});
 for(const [id,participantId,participation,sourceAction,whistle] of [['offside-uninvolved','runner',false,'pass',false],['offside-late-participation','runner',true,'pass',true],['opponent-contact-no-whistle','defender',true,'pass',false],['direct-throw-exempt','runner',true,'direct-throw-in',false]])add(id,'Abseits erst bei tatsächlicher Beteiligung','offside',[0,.29,0,0],[],{whistle},{offsideIds:['runner'],participantId,participation,sourceAction});
}
const target=path.join(__dirname,'catalog.json');fs.writeFileSync(target,JSON.stringify(catalog,null,2)+'\n');
console.log(`Generated ${catalog.length} deterministic fixtures at ${target}`);
