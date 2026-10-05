const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{harness}=require('./world-finance-harness-v124.cjs');
const {call,context,market,next}=harness();
const source=fs.readFileSync('dist/world-payments-ui-v124.js','utf8');
vm.runInContext(source.slice(0,source.indexOf('function v124BudgetHTML')),context);
const career=call('v61CreateCareer','GER-2','finance-close-v130');
market(career);while(!career.world.seasonFinished)call('v62AdvanceDay',career);
const closings=new Map(career.world.clubs.map(club=>[club.id,club.balance]));
next(career);const own=call('v66Club',career,career.manager.managedClubId);call('v66ChooseSponsor',career,own.id,own.sponsors[0].id);
const before=JSON.stringify(career);
for(const club of career.world.clubs){
 const data=call('v130SeasonAccounts',career,club.id,1),books=club.ledger.filter(row=>row.season===1);
 assert.equal(data.closing,closings.get(club.id),'Current base/sponsor income must not change last season closing');
 assert.equal(data.opening+data.income-data.expense,data.closing);
 assert.equal(data.categories.salaries,Math.abs(books.filter(row=>row.id.endsWith(':salary')).reduce((sum,row)=>sum+row.amount,0)));
 assert.equal(data.salaryPaid,!club.simulationOnly);
 assert.equal(Object.values(data.categories).reduce((sum,value)=>sum+value,0),data.income+data.expense,'Every amount is included once');
}
assert.equal(JSON.stringify(career),before,'Accounts are read-only');
const probe=JSON.parse(before),club=call('v66Club',probe,probe.manager.managedClubId);club.ledger.push({id:'future-income',season:1,amount:71},{id:'future-cost',season:1,amount:-23});club.balance+=48;
const extra=call('v130SeasonAccounts',probe,club.id,1);assert.equal(extra.categories.otherIncome,71);assert.equal(extra.categories.otherExpense,23);
assert.equal(extra.opening+extra.income-extra.expense,extra.closing);
for(const [limit,expected]of [[0,[0]],[199,[0]],[200,[0,200]],[399,[0,200]],[400,[0,200,400]]])assert.deepEqual(Array.from(call('v130FundingOptions',limit)).filter(item=>item.available).map(item=>item.amount),expected);
const salary=call('v66SalaryDue',career,own.id),balance=own.balance;call('v124SetYouthBudget',career,400);assert.equal(own.ledger.filter(row=>row.season===2&&row.id.endsWith(':youth-budget')).length,1);assert(own.balance<=balance-400);assert.equal(call('v66SalaryDue',career,own.id),salary,'Budget selection does not pay future salaries');
assert.equal(call('v61ValidateCareer',JSON.parse(JSON.stringify(career))),true);
console.log('Financial accounts reconcile all clubs, separate seasons/salaries, include other entries and preserve career data. Funding is affordable and paid once.');
