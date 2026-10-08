const fs=require('node:fs'),assert=require('node:assert/strict');
const old=JSON.parse(fs.readFileSync('dist/players/calibration-v113.json')),fresh=JSON.parse(fs.readFileSync('meshy_output/keeper-calibration-v130.json'));
for(const name of ['keeper_ready_meshy','keeper_shuffle_meshy']){assert(fresh.clips[name]);old.clips[name]=fresh.clips[name];}
old.model='football-v130.glb';fs.copyFileSync('meshy_output/character-keeper-v130.glb','dist/players/football-v130.glb');fs.writeFileSync('dist/players/calibration-v130.json',JSON.stringify(old));
console.log('Installed Meshy goalkeeper clips; original calibration profiles preserved.');
