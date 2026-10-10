'use strict';

function v165OpeningCrown(opening=v161Opening){
 const entrants=[opening.previousInternationalWinners.crown,opening.previousInternationalWinners.horizon],replacements=[];
 for(const country of opening.countryOrder){const row=opening.nationalPreviousSeason[country],champion=row.leagueOrder[0],cup=row.cupWinner===champion?row.cupFinalist:row.cupWinner;for(const id of [champion,cup]){if(entrants.includes(id))replacements.push(country);else entrants.push(id);}}
 for(const country of replacements){const id=opening.nationalPreviousSeason[country].leagueOrder.find(id=>!entrants.includes(id));if(!id)throw Error('Ein Crown-Nachrücker fehlt.');entrants.push(id);}
 if(entrants.length!==26||new Set(entrants).size!==26)throw Error('Ungültige Crown-Startqualifikation.');return entrants;
}
function v165DrawRounds(entrants,countryById,seed){
 const ids=[...entrants].sort(),counts=new Map();for(const id of ids){const c=countryById.get(id);if(!c)throw Error('Ein Crown-Verein fehlt.');counts.set(c,(counts.get(c)||0)+1);}
 if(ids.length!==26||new Set(ids).size!==26||Math.max(...counts.values())>13)throw Error('Ungültiges Crown-Teilnehmerfeld.');
 // Bounded backtracking of complete matchings, never relaxing country/repeat rules.
 for(let attempt=0;attempt<32;attempt++){
  const used=new Set(),rounds=[];let failed=false;
  const key=(a,b)=>[a,b].sort().join('|');
  for(let round=0;round<5;round++){
   const priority=v62Shuffle(ids,`${seed}:draw:${attempt}:${round}`),position=new Map(priority.map((id,i)=>[id,i]));let visits=0;
   const match=remaining=>{
    if(!remaining.length)return[];if(++visits>50000)return null;
    const allowed=a=>remaining.filter(b=>b!==a&&countryById.get(a)!==countryById.get(b)&&!used.has(key(a,b))).sort((a,b)=>position.get(a)-position.get(b));
    let selected=null,options=null;
    for(const id of remaining){const candidates=allowed(id);if(!candidates.length)return null;if(!options||candidates.length<options.length){selected=id;options=candidates;}}
    for(const other of options){const rest=match(remaining.filter(id=>id!==selected&&id!==other));if(rest)return[[selected,other],...rest];if(visits>50000)break;}
    return null;
   };
   const pairs=match(priority);if(!pairs){failed=true;break;}rounds.push(pairs);for(const[a,b]of pairs)used.add(key(a,b));
  }
  if(!failed)return rounds;
 }
 throw Error('Die Crown-Auslosung konnte kein vollständiges gültiges Feld bilden.');
}
function v165OrientRounds(rounds,entrants,seed){
 // Add one auxiliary edge at every odd-degree club, orient Euler circuits,
 // then discard auxiliary edges. Each club keeps two or three home edges.
 const helper=Symbol('home-balance'),edges=rounds.flatMap((pairs,round)=>pairs.map(([a,b],pair)=>({a,b,round,pair})));for(const id of entrants)edges.push({a:id,b:helper});
 const adjacency=new Map([...entrants,helper].map(id=>[id,[]]));edges.forEach((edge,i)=>{adjacency.get(edge.a).push(i);adjacency.get(edge.b).push(i);});
 for(const[id,list]of adjacency)adjacency.set(id,v62Shuffle(list,`${seed}:home:${String(id)}`));
 const used=new Set(),oriented=new Map();
 for(const start of adjacency.keys()){
  const stack=[start];while(stack.length){const current=stack[stack.length-1],list=adjacency.get(current);while(list.length&&used.has(list[list.length-1]))list.pop();if(!list.length){stack.pop();continue;}const i=list.pop(),edge=edges[i],next=current===edge.a?edge.b:edge.a;used.add(i);if(edge.round!==undefined)oriented.set(`${edge.round}:${edge.pair}`,[current,next]);stack.push(next);}
 }
 return rounds.map((pairs,r)=>pairs.map((_,p)=>oriented.get(`${r}:${p}`)));
}
function v165Crown(entrants,clubs,season,seed){
 const competition={id:`S${season}:CROWN`,type:'europe',format:'crown',name:'Crown Cup',country:null,season,entrants:[...entrants],fixtures:[],winnerId:null,ranking:null,quarterPairs:null,semiPairs:null};
 const countries=new Map(clubs.map(c=>[c.id,c.countryId])),rounds=v165OrientRounds(v165DrawRounds(entrants,countries,`${seed}:${competition.id}`),entrants,`${seed}:${competition.id}`),days=v164Calendar().crown.league;
 rounds.forEach((pairs,r)=>pairs.forEach(([home,away],p)=>v62Add(competition,v62Fixture(competition,`R${r+1}`,days[r],home,away,1,p))));return competition;
}
function v165Completed(competition,round,leg,size){
 const fixtures=competition.fixtures.filter(f=>f.round===round&&f.leg===leg);
 if(fixtures.length!==size||fixtures.some(f=>!f.result))throw Error('Die Crown-Runde ist noch nicht abgeschlossen.');return fixtures;
}
function v165CrownProgress(career,competition,day){
 const days=v164Calendar().crown,seed=career.world.seed;
 if(day===days.league[4]){
  for(let r=1;r<=5;r++)v165Completed(competition,`R${r}`,1,13);
  if(competition.quarterPairs)return;
  const rank=v62Table(competition,competition.entrants).map(r=>r.clubId),lower=v62Shuffle(rank.slice(4,8),`${seed}:${competition.id}:QF`);
  competition.ranking=rank;competition.quarterPairs=rank.slice(0,4).map((id,i)=>[id,lower[i]]);competition.quarterPairs.forEach(([a,b],i)=>v62TwoLegPair(competition,'QF',days.QF,a,b,i,rank));
 }else if(day===days.QF[1]){
  const fixtures=v165Completed(competition,'QF',2,4);if(fixtures.some(f=>![f.homeId,f.awayId].includes(f.result.winnerId)))throw Error('Ein Crown-Viertelfinalsieger fehlt.');if(competition.semiPairs)return;
  const winners=fixtures.sort((a,b)=>a.pair-b.pair).map(f=>f.result.winnerId);competition.semiPairs=[[winners[0],winners[1]],[winners[2],winners[3]]];competition.semiPairs.forEach(([a,b],i)=>v62TwoLegPair(competition,'SF',days.SF,a,b,i,competition.ranking));
 }else if(day===days.SF[1]){
  const fixtures=v165Completed(competition,'SF',2,2);if(fixtures.some(f=>![f.homeId,f.awayId].includes(f.result.winnerId)))throw Error('Ein Crown-Halbfinalsieger fehlt.');if(competition.fixtures.some(f=>f.round==='F'))return;
  const winners=fixtures.sort((a,b)=>a.pair-b.pair).map(f=>f.result.winnerId),f=v62Fixture(competition,'F',days.F,winners[0],winners[1],1,0);f.neutral=true;v62Add(competition,f);
 }else if(day===days.F){const f=v165Completed(competition,'F',1,1)[0];if(![f.homeId,f.awayId].includes(f.result.winnerId))throw Error('Der Crown-Finalsieger fehlt.');competition.winnerId=f.result.winnerId;}
}
function v165Rules(){return{...v164Rules(),stage:'crown-prepared'};}
function v165CreateCareer(clubId,seed,name,matchOptions){
 const career=v164CreateCareer(clubId,seed,name,matchOptions);career.world.competitions.push(v165Crown(v165OpeningCrown(career.world.opening),career.world.clubs,1,career.world.seed));career.world.rules=v165Rules();career.world.foundationReady.competitions='crown-prepared-horizon-pending';v62ValidateSchedule(career.world.competitions,career.world.clubs);return career;
}
const v165BaseValidator=v161ValidateRules;
v161ValidateRules=function(career){
 if(career?.world?.rules?.stage!=='crown-prepared')return v165BaseValidator(career);
 try{
  if(!v161SameData(career.world.rules,v165Rules())||career.world.competitions.length!==25)return false;
  const expected=v165Crown(v165OpeningCrown(career.world.opening),career.world.clubs,1,career.world.seed);if(!v161SameData(career.world.competitions[24],expected))return false;
  return v165BaseValidator({...career,world:{...career.world,rules:v164Rules(),competitions:career.world.competitions.slice(0,24)}});
 }catch{return false;}
};
const v165BaseEuropeProgress=v62EuropeProgress;
v62EuropeProgress=function(career,competition,day){return competition.format==='crown'?v165CrownProgress(career,competition,day):v165BaseEuropeProgress(career,competition,day);};
const v165BaseAdvance=v62AdvanceDay;
v62AdvanceDay=function(career){if(career.world.rules?.stage==='crown-prepared')throw Error('Der Horizon Cup dieser Welt ist noch nicht vorbereitet.');return v165BaseAdvance(career);};
const v165BaseRender=v161RenderFoundation;
function v165CrownHTML(career){
 const cup=career.world.competitions.find(c=>c.format==='crown');if(!cup)return '';
 const club=id=>v161Escape(career.world.clubs.find(c=>c.id===id).name);
 return `<h2>Crown Cup</h2><p>26 Teilnehmer · fünf Ligaphasenspiele · Top 8 direkt ins Viertelfinale</p><details><summary>Teilnehmer</summary><ul>${cup.entrants.map(id=>`<li>${club(id)}</li>`).join('')}</ul></details><details><summary>Ligaphasen-Spielplan</summary><ul>${cup.fixtures.filter(f=>/^R[1-5]$/.test(f.round)).map(f=>`<li>${v62Date(f.day)} · ${club(f.homeId)} – ${club(f.awayId)}</li>`).join('')}</ul></details>`;
}
v161RenderFoundation=function(career){
 v165BaseRender(career);if(career.world.rules?.stage!=='crown-prepared')return;
 v61WorldScreen.querySelector('section p').textContent='Die nationalen Spielpläne und der Crown Cup sind vorbereitet. Horizon folgt im nächsten Schritt; danach wird der gemeinsame Saisonlauf aktiviert.';
 v61WorldScreen.querySelector('section').insertAdjacentHTML('beforeend',v164CalendarHTML(career)+v165CrownHTML(career));
};
if(typeof window==='object')Object.assign(window.D6Expansion,{createCrown:v165CreateCareer,calendarHTML:career=>v164CalendarHTML(career),crownHTML:v165CrownHTML});
