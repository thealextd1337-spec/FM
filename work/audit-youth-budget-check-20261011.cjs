'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-20years-20261011');
process.chdir(path.join(out,'source'));
const {harness}=require(path.join(root,'work/youth-audit-native-harness.cjs')),h=harness();h.run('world-expansion-stories-v170.js');
for(const seed of ['youth20-a','youth20-b','youth20-c']){
 const c=JSON.parse(fs.readFileSync(path.join(out,seed+'-checkpoint.json')));h.context.v61CurrentCareer=c;
 if(c.world.transition.choice===null)h.call('v67ChooseOffer',c);h.call('v62NextSeason',c);const own=h.call('v66Club',c,c.manager.managedClubId);
 h.call('v66ChooseSponsor',c,own.id,own.sponsors[0].id);
 console.log(JSON.stringify({seed,season:c.world.season,balance:own.balance,salaryDue:own.salaryDue,budgetLimit:h.call('v67BudgetLimit',own),phase:c.world.market.phase,youthPending:c.world.youthBudgetPending,sponsor:own.sponsorId}));
}
