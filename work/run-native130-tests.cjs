'use strict';
const path=require('node:path'),fs=require('node:fs'),cp=require('node:child_process');
const suites=[];for(const file of ['test-keeper-chase-v130.cjs','test-restart-facing-v130.cjs']){const r=cp.spawnSync(process.execPath,[path.join(__dirname,file)],{cwd:process.cwd(),env:process.env,encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||r.stdout);process.exit(r.status||1);}suites.push(JSON.parse(r.stdout.trim()));}
const result={pass:true,node:process.version,suites};if(process.env.D6_TEST_REPORT)fs.writeFileSync(process.env.D6_TEST_REPORT,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
