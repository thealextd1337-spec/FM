const fs=require('fs'),Module=require('module'),path=require('path');
const source=fs.readFileSync('work/test-air-bounce-v124.cjs','utf8').replaceAll('-v124.json','-v127.json');
const test=new Module(path.resolve('work/test-air-bounce-v124.cjs'),module);test.filename=path.resolve('work/test-air-bounce-v124.cjs');test.paths=module.paths;test._compile(source,test.filename);
