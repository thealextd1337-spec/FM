const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('dist/world-physical-v65.js','utf8');
const segment=source.slice(source.indexOf('function v65BookWorldMatch('),source.indexOf('function v65ShowWorldPenalties('));
let saves=0,reports=0,dialog;
const context=vm.createContext({
 v62Days:{league:[7,28,49,70,91,112,133,154,175,196]},
 v61CountryNames:{ITA:'Italien'},
 v62Current:career=>career.world.competitions,
 v64CompleteOwnMatch:career=>{career.world.activeMatch.fixture.matchRecord={}},
 v64UiFirstLegScore:()=>null,
 v64UiSave:async()=>{saves++},
 v66Club:(career,id)=>career.world.clubs.find(club=>club.id===id),
 v61CrestSVG:club=>`<svg aria-label="Vereinslogo ${club.name}"></svg>`,
 v61ClubColors:()=>['#114477','#ffcc22'],
 v62AwardIcon:(country,kind)=>`<img src="${country||'EU'}-${kind}.png">`,
 v58Refresh:()=>{},
 v65ShowPostMatch:()=>{reports++},
 escapeHTML:value=>String(value),
 document:{body:{append:element=>{dialog=element}},createElement:()=>({open:false,setAttribute(){},addEventListener(){},querySelector(selector){return selector==='button'?this.button:{textContent:''}},button:{disabled:false},showModal(){this.open=true},close(){this.open=false}})}
});
vm.runInContext(segment,context);
const call=(name,...args)=>vm.runInContext(name,context)(...args);

function fixture(type,round,day,winner='own'){
 const game={id:'final',competitionId:'competition',round,day,matchRecord:{}};
 const competition={id:'competition',type,country:type==='europe'?null:'ITA',season:3,winnerId:winner};
 const career={manager:{managedClubId:'own'},world:{season:3,clubs:[{id:'own',name:'Napoli Sud AC'}],competitions:[competition],activeMatch:{fixture:game}}};
 const state={postMatchStep:'report',postMatchReport:{score:[2,1]}};
 career.world.activeMatch.state=state;
 return{career,fixture:game,state,ownSide:0};
}

for(const [type,round,day]of [['cup','F',193],['europe','F',214],['league','R10',196]]){
 const item=fixture(type,round,day);
 call('v65BookWorldMatch',item);
 assert.equal(item.state.postMatchStep,'celebration',`${type} title opens celebration`);
 assert.equal(call('v65ShowCelebration',item),true);
 assert.equal((dialog.innerHTML.match(/--confetti-color:/g)||[]).length,60,`${type}: Konfetti bei jedem Titel`);
 assert(dialog.innerHTML.includes('--confetti-color:#114477')&&dialog.innerHTML.includes('--confetti-color:#ffcc22'));
 dialog.close();
}
for(const [type,round,day,winner]of [['cup','SF',144,'own'],['europe','F',214,'other'],['league','R9',175,'own'],['league','R10',196,'other']]){
 const item=fixture(type,round,day,winner);
 call('v65BookWorldMatch',item);
 assert.equal(item.state.postMatchStep,'report',`${type} ${round} without title skips celebration`);
}

(async()=>{
 const item=fixture('cup','F',193);
 call('v65BookWorldMatch',item);
 assert.equal(call('v65ShowCelebration',item),true);
 assert.match(dialog.innerHTML,/Herzlichen Glückwunsch!/);
 assert.match(dialog.innerHTML,/Pokalsieger/);
 assert.match(dialog.innerHTML,/ITA-cup\.png/);
 assert.match(dialog.innerHTML,/Saison 3/);
 assert.match(dialog.innerHTML,/Napoli Sud AC/);
 assert.match(dialog.innerHTML,/class="v65-victory-confetti" aria-hidden="true"/);
 assert.equal(dialog.open,true);
 const before=saves;
 await dialog.button.onclick();
 assert.equal(saves,before+1,'confirmation is saved');
 assert.equal(item.state.postMatchStep,'report');
 assert.equal(dialog.open,false);
 assert.equal(reports,1);
 console.log('Sieger-Popup: Pokal, Europacup und letzter Ligaspieltag, Ausschlüsse, Darstellung und Bestätigung geprüft.');
})().catch(error=>{console.error(error);process.exitCode=1});
