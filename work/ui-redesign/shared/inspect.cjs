'use strict';
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.goto(process.env.D6_TEST_URL||'http://127.0.0.1:4198/');
  await page.waitForFunction(()=>typeof v61CreateCareer==='function');
  const result=await page.evaluate(async()=>{
   const career=await v61StoreNewCareer(v61CreateCareer('GER-2','flutlicht-baseline','Alex'));
   v61CurrentCareer=career;v61RenderCareer(career);
   const club=v66Own(career);
   return {children:[...v61WorldScreen.children].map(n=>({tag:n.tagName,id:n.id,cls:n.className,view:n.dataset.v46View})),tabs:v61CareerTabs.map(x=>[x[0],x[2]]),progress:v58State(),playerKeys:Object.keys(club.roster[0]),clubKeys:Object.keys(club),sponsor:club.sponsor,phase:career.world.market.phase,dialogs:[...document.querySelectorAll('dialog')].map(n=>n.id)};
  });
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
