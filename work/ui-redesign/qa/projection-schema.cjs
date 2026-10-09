'use strict';
const assert=require('node:assert/strict');
const nullable=s=>({nullable:s}),list=s=>({list:s}),record=fields=>({fields});
const person=record({id:nullable('string'),name:'string'}),skill=record({key:'string',label:'string',band:'band',colorLabel:'string'});
const row=record({id:'string',name:'string',number:'number',nationCode:'string',nationLabel:'string',positionCode:'string',positionLabel:'string',age:'number',skills:list(skill),form:record({band:'band',label:'string'}),formRatings:nullable(list('rating')),freshness:record({percent:'number',band:'band',label:'string'}),stats:record({appearances:'number',substitutions:nullable('number'),goals:'number',assists:'number',averageRating:nullable('number'),ratedGames:'number',substitutionCoverage:'string'})});
const team=record({id:'string',name:'string',crestHTML:'string',rankLabel:'string',recent:list(record({outcome:'string',label:'string',detail:'string'}))});
const ranking=record({playerId:'string',name:'string',value:'number',rank:'number',profileAvailable:'boolean'});
const schema=record({
 frame:record({clubName:'string',clubMeta:'string',clubCrestHTML:'string',managerLabel:'string',titles:list(record({kind:'string',label:'string'})),navigation:list(record({id:'string',label:'string',icon:'string',active:'boolean',disabled:nullable('boolean')})),activeRoute:'string',leadAction:nullable(record({label:'string',disabled:'boolean',busy:'boolean',processingLabel:'string',progressLabel:'string',reason:'string'})),themePreference:'string',language:'string',labels:record({brand:'string',menu:'string',close:'string',skip:'string',navigation:'string',manager:'string',actionFailed:'string'})}),
 navigation:record({squad:'string',transfers:'string',competition:'string',transferBalanceHTML:'string'}),
 players:record({season:'number',ownClubId:'string',roster:list(row),all:list(row)}),
 overview:record({kpis:list(record({label:'string',value:'string',detail:nullable('string')})),office:list(record({id:'string',title:'string',detail:'string',route:'string',section:'string',actionLabel:'string'})),finance:record({balanceLabel:'string',rows:list(record({label:'string',valueLabel:'string',tone:nullable('string')})),note:'string'}),fixture:nullable(record({dateLabel:'string',seasonLabel:'string',competitionLabel:'string',roundLabel:'string',home:team,away:team})),sponsor:nullable(record({name:'string',logoHTML:'string',goals:list(record({label:'string',bonusLabel:'string',onCourse:'boolean',achieved:nullable('boolean'),paid:'boolean'}))}))}),
 club:record({ownId:'string',activeSection:'string',sponsorHTML:'string',profiles:list(record({id:'string',records:record({coverageLabel:'string',goals:list(ranking),appearances:list(ranking)}),lastLineup:nullable(record({season:'number',dateLabel:'string',competitionLabel:'string',opponentName:'string',olderThanLastMatch:'boolean',players:list(record({playerId:'string',name:'string',number:nullable('number'),positionLabel:'string',profileAvailable:'boolean'}))}))}))}),
 competitions:record({tables:list(record({id:'string',rows:list(record({clubId:'string',wins:'number',draws:'number',losses:'number',goalsFor:'number',goalsAgainst:'number'}))})),report:nullable(record({id:'string',title:'string',contextLabel:'string',home:record({id:'string',name:'string',crestHTML:'string',currentRank:nullable('number')}),away:record({id:'string',name:'string',crestHTML:'string',currentRank:nullable('number')}),scoreLabel:'string',penaltiesLabel:nullable('string'),teamStats:nullable(list(record({label:'string',home:nullable('display'),away:nullable('display')}))),events:nullable(list(record({minuteLabel:'string',text:'string'}))),lineups:nullable(record({home:list(person),away:list(person)})),substitutions:nullable(list(record({minuteLabel:'string',teamLabel:'string',out:person,in:person}))),players:nullable(list(record({id:'string',name:'string',teamLabel:'string',stats:list(record({label:'string',value:nullable('display')}))}))),awards:nullable(list(record({kind:'string',label:'string',playerId:nullable('string')})))}))}),
 settings:record({themePreference:'string',language:'string'})
});
function validate(value,shape=schema,at='projection'){
 if(typeof shape==='string'){
  if(shape==='rating')assert(Number.isFinite(value)&&value>=1&&value<=10,at+' stored match rating');
  else if(shape==='band')assert(['violetgray','bluegray','yellow','orange','pink','unknown'].includes(value),at+' invalid band');
  else if(shape==='display')assert(['number','string'].includes(typeof value),at+' invalid display value');
  else {assert.equal(typeof value,shape,at);if(shape==='number')assert(Number.isFinite(value),at+' finite');}
  return;
 }
 if(shape.nullable){if(value==null)return;return validate(value,shape.nullable,at);}
 if(shape.list){assert(Array.isArray(value),at+' array');return value.forEach((v,i)=>validate(v,shape.list,at+'['+i+']'));}
 assert(value&&typeof value==='object'&&!Array.isArray(value),at+' object');assert.deepEqual(Object.keys(value).filter(k=>!Object.hasOwn(shape.fields,k)),[],at+' unknown keys');
 for(const [key,child] of Object.entries(shape.fields))validate(value[key],child,at+'.'+key);
}
module.exports={validate};
