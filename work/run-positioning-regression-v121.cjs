// Reuse the existing contact/keeper gates, retaining their historical output files.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
const target=process.argv[2];if(!['work/check-user-ball-actions-v111.cjs','work/check-keeper-scenarios-v120.cjs','work/check-keeper-visual-v120.cjs'].includes(target))throw Error('Unknown positioning regression gate');
const source=fs.readFileSync(target,'utf8').replaceAll('-v111.json','-v121.json').replaceAll('-v120.json','-v121.json').replaceAll('-v111.png','-v121.png').replaceAll('-v120.png','-v121.png');
const test=new Module(path.resolve(target),module);test.filename=path.resolve(target);test.paths=module.paths;test._compile(source,test.filename);
