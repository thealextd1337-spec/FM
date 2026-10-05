// Complete the current career setup in isolated fixtures, preserving old reports.
const fs=require('fs'),Module=require('module'),path=require('path');
let source=fs.readFileSync('work/check-user-match-regression.cjs','utf8');
source=source.replace('function adapt(source){',`function adapt(source){
 source=source.replaceAll('PROTOTYP 105','PROTOTYP 107').replaceAll("while(career.world.market.phase==='open')","if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')").replaceAll('world3d-parity.json','world3d-parity-v134.json').replaceAll('world3d-home-sponsor.png','world3d-home-sponsor-v134.png');
 source=source.replaceAll("await page.locator('[data-v98-view=", "await page.evaluate(()=>v132RevealControls());await page.locator('[data-v98-view=").replaceAll("await page.locator('#v98-sound').click()", "await page.evaluate(()=>v132RevealControls());await page.locator('#v98-sound').click()");`);
const test=new Module(path.resolve('work/check-user-match-regression.cjs'),module);test.filename=path.resolve('work/check-user-match-regression.cjs');test.paths=module.paths;test._compile(source,test.filename);


