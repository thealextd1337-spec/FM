const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto'),https=require('https');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const live='https://fussball.cakamper.at/',hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function readLive(){return new Promise((resolve,reject)=>{https.get(live+'?verify-finance-106='+Date.now(),{headers:{'Cache-Control':'no-cache'}},response=>{
 if(response.statusCode!==200){response.resume();reject(Error('Live HTTP '+response.statusCode));return}
 const chunks=[];response.on('data',chunk=>chunks.push(chunk));response.on('end',()=>resolve(Buffer.concat(chunks)));response.on('error',reject);
 }).on('error',reject)})}
(async()=>{
 const expected=fs.readFileSync('outputs/index.html'),actual=await readLive();
 assert.equal(hash(actual),hash(expected),'Live-Datei entspricht exakt dem freigegebenen Build');
 assert(actual.toString('utf8').includes('Doppel 6 / PROTOTYP 106'));
 const source=fs.readFileSync('dist/index.html','utf8');assert(source.includes('Doppel 6 / PROTOTYP 106'));
 const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(live+'?finance-106='+Date.now());await page.waitForFunction(()=>typeof v124SetYouthBudget==='function');
  const result=await page.evaluate(()=>{
   const career=v61CreateCareer('GER-2','finance-live-106'),own=v66Club(career,'GER-2'),passive=career.world.clubs.filter(club=>club.simulationOnly);
   v61CurrentCareer=career;v61WorldScreen.hidden=false;v61CareerTab='overview';
   v66ChooseSponsor(career,own.id,own.sponsors[0].id);v61RenderCareer(career);
   const budgetPhase=career.world.market.phase,budgetVisible=Boolean(document.querySelector('#v124-budget'));
   v124SetYouthBudget(career,200);v61SetCareerTab('club');
   const financeVisible=document.querySelector('.v66-finance').textContent.includes('Sichere Schlussprognose');
   return{version:document.querySelector('footer').textContent,passiveCount:passive.length,leagueCount:career.world.clubs.filter(club=>club.leagueId).length,zeroEconomy:passive.every(club=>club.balance===0&&club.ledger.length===0&&club.youthPool.length===0&&v66SalaryDue(career,club.id)===0),budgetPhase,budgetVisible,financeVisible,valid:v61ValidateCareer(career)};
  });
  assert.equal(result.passiveCount,12);assert.equal(result.leagueCount,36);assert(result.zeroEconomy&&result.budgetVisible&&result.financeVisible&&result.valid);assert.equal(result.budgetPhase,'budget');assert(result.version.includes('PROTOTYP 106'));
  await page.evaluate(()=>window.doppel6Language.set('en'));await page.waitForFunction(()=>document.querySelector('.v66-finance').textContent.includes('Guaranteed closing forecast'));
  assert.deepEqual(errors,[]);
  fs.mkdirSync('outputs/release-106-tests',{recursive:true});
  fs.writeFileSync('outputs/release-106-tests/live-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),url:live,sha256:hash(actual),bytes:actual.length,result,languages:['de','en'],status:'passed'},null,2));
  console.log('Prototyp 106 live: Build-Prüfsumme, zwölf Simulationsteams, 36 Ligavereine, Budgetfolge und DE/EN bestätigt.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
