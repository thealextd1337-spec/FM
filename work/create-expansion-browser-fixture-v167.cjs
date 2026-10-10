'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{harness}=require('./world-expansion-harness-v167.cjs');
function createFixture(){
const {call,context}=harness();
const career=call('v167CreateCareer','AUT-5','ap07-browser-fixture','QA'),club=call('v66Club',career,'AUT-5');context.v61CurrentCareer=career;
call('v66ChooseSponsor',career,club.id,club.sponsors[0].id);call('v124SetYouthBudget',career,0);for(let i=0;i<5;i++)call('v66NextMarketDay',career);
vm.runInContext(`v62Score=function(career,f){const random=v61Random(career.world.seed+f.id),homeGoals=Math.floor(random()*4),awayGoals=Math.floor(random()*4);f.matchRecord={score:[homeGoals,awayGoals],players:[],substitutions:[]};return{homeGoals,awayGoals,penalties:null,winnerId:null};};`,context);
while(!career.world.seasonFinished)call('v62AdvanceDay',career);assert(call('v61ValidateCareer',career));return career;
}
module.exports={createFixture};
if(require.main===module){const career=createFixture();fs.mkdirSync('outputs/ligaexpansion-ap07',{recursive:true});fs.writeFileSync('outputs/ligaexpansion-ap07/browser-fixture.json',JSON.stringify(career));console.log('Valid closed UI fixture: 991 synthetic scores through native booking and season close.');}
