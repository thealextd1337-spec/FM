const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const context=makeContext();
vm.runInContext(`beginSquadSetup();autoSelectSquad();confirmInitialSquad();activeSave.seasonNumber=4;const testPlayer=activeSave.squad[0];testPlayer.seasons=[1,2,3,4].map(number=>({...blankStats(number),games:number,goals:number}));`,context);
const card=vm.runInContext('playerCardHTML(testPlayer)',context);
assert.equal(vm.runInContext('seasonStatEntries(testPlayer).at(-1).stats.games',context),10,'career page totals all four seasons');
assert.equal((card.match(/class="season-stats-page"/g)||[]).length,5,'four seasons and career appear as five pages');
assert(card.indexOf('Saison 4')<card.indexOf('Saison 3')&&card.indexOf('Saison 3')<card.indexOf('Saison 2')&&card.indexOf('Saison 2')<card.indexOf('Saison 1'),'seasons run newest to oldest');
assert.match(card,/data-season-back[^>]*disabled/);
assert.match(card,/data-season-next/);
assert.match(card,/1 von 5/);
assert.match(card,/Karriere/);
assert.match(card,/Scoutingbericht/,'profile retains scouting');

const controls={};
function control(){return{disabled:false,listeners:{},addEventListener(type,handler){this.listeners[type]=handler}}}
const back=control(),next=control(),position={textContent:''},pages=Array.from({length:5},()=>({attributes:{},setAttribute(name,value){this.attributes[name]=value}}));
const track={clientWidth:300,scrollLeft:0,listeners:{},addEventListener(type,handler){this.listeners[type]=handler}};
const pager={dataset:{},querySelector(selector){return{'[data-season-back]':back,'[data-season-next]':next,'[data-season-position]':position,'.season-stats-track':track}[selector]},querySelectorAll(){return pages}};
context.seasonTestRoot={querySelectorAll(){return[pager]}};
vm.runInContext('bindSeasonStatPagers(seasonTestRoot)',context);
assert.equal(position.textContent,'1 von 5');assert.equal(back.disabled,true);
next.listeners.click();assert.equal(track.scrollLeft,300);assert.equal(position.textContent,'2 von 5');assert.equal(pages[1].attributes['aria-hidden'],'false');
track.scrollLeft=1200;track.listeners.scroll();assert.equal(position.textContent,'5 von 5');assert.equal(next.disabled,true);
track.listeners.keydown({key:'ArrowLeft',preventDefault(){}});assert.equal(position.textContent,'4 von 5');
console.log('PASS: alle Saisons und Karriere einzeln, Navigation per Knopf, Scrollen und Tastatur');
