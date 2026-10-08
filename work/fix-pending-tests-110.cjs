const fs=require('node:fs');
for(const file of ['work/check-shared-tactics-v140.cjs','work/check-penalty-ready-v143.cjs'])fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('()=>userMeshyMatchReady','()=>window.userMeshyMatchReady'));
