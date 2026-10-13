'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let t=fs.readFileSync(path.join(__dirname,'audit-retirement-20years-20261011.cjs'),'utf8');
t=t.replace("const out=path.join(root,'outputs/retirement-20years-20261011')", "const out=path.join(root,'outputs/youth-comparison-20years-20261011')");
t=t.replace("const initialIds=new Set",`const variant=process.argv.find(a=>a.startsWith('--variant='))?.slice(10)||'status';
assert(['status','country'].includes(variant));
const statusRows=resumed?.statusRows||[];context.auditStatusRows=statusRows;context.auditComparisonVariant=variant;
// Construction remains native and identical, including initial pools, budgets and AI promotions.
evaluate(fs.readFileSync(path.join(root,'work/youth-comparison-hooks-20261011.js'),'utf8'));
call('auditInitYouthStatus',career);
const initialIds=new Set`);
t=t.replace("maxSeason,retirementRule:","maxSeason,variant,statusRows,retirementRule:");
t=t.replace("repairManaged();snapshot(season,'opening');","repairManaged();call('auditFreezeExpectations',career);snapshot(season,'opening');");
t=t.replace("budget:club.youthBudget,poolSize:","budget:club.youthBudget,youthStatus:club.auditYouthStatus??null,poolSize:");
fs.writeFileSync(path.join(__dirname,'audit-youth-comparison-20261011.cjs'),t);
console.log('Prepared comparison runner');
