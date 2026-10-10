'use strict';
const fs=require('node:fs'),vm=require('node:vm');
function harness(){const setup=fs.readFileSync('work/test-world-expansion-v161.cjs','utf8').split('// Freeze legacy generation')[0],scope=vm.createContext({require,console,structuredClone,URLSearchParams});vm.runInContext(setup+';globalThis.api={context,run,call,copy};',scope);const api=scope.api;for(const f of ['world-expansion-catalog-v161.js','world-expansion-v161.js','world-expansion-domestic-v164.js','world-expansion-crown-v165.js','world-expansion-horizon-v166.js','world-expansion-progression-v167.js','world-expansion-economy-v168.js'])api.run(f);return api;}
module.exports={harness};
