'use strict';
// Predicate test for the '[D6] match mesh ...' load-line check of acceptance-browser.cjs (--expectGroundMesh). No browser, no files.
//   node work/style-demos/test-mesh-line.cjs
const lib=require('./lib.cjs');lib.requireNode();
let passed=0,failed=0;
const ok=(name,cond,detail)=>{if(cond)passed++;else failed++;console.log((cond?'ok   ':'FAIL ')+name+(cond?'':'  '+(detail||'')));};
const L=(mesh,v,ground)=>'[D6] match mesh '+mesh+' vertices='+v+' base=d6_lowpoly_v4_base mask=d6_lowpoly_v4_mask'+(ground===undefined?'':' ground='+ground);
const exp={mesh:'WorldPlayerLowPoly-v4',vertices:6926,groundMesh:'WorldPlayer',groundVertices:9725};
const r=(lines,e=exp)=>lib.matchMeshLines(lines,e);
ok('fixed build line accepted',r([L('WorldPlayerLowPoly-v4',6926,'WorldPlayer vertices=9725')]).ok);
ok('ground=drawn rejected',!r([L('WorldPlayerLowPoly-v4',6926,'drawn')]).ok);
ok('missing ground field (old d8 build) rejected when ground expected',!r([L('WorldPlayerLowPoly-v4',6926)]).ok);
ok('wrong ground mesh rejected',!r([L('WorldPlayerLowPoly-v4',6926,'WorldPlayerLowPoly-v4 vertices=6926')]).ok);
ok('wrong ground vertices rejected',!r([L('WorldPlayerLowPoly-v4',6926,'WorldPlayer vertices=9000')]).ok);
ok('original mesh rejected',!r([L('WorldPlayer',9725,'WorldPlayer vertices=9725')]).ok);
ok('wrong visible vertices rejected',!r([L('WorldPlayerLowPoly-v4',6000,'WorldPlayer vertices=9725')]).ok);
ok('empty line list rejected',!r([]).ok);
ok('one bad line among good rejected',!r([L('WorldPlayerLowPoly-v4',6926,'WorldPlayer vertices=9725'),L('WorldPlayerLowPoly-v4',6926,'drawn')]).ok);
ok('unparseable line rejected',!r(['[D6] match mesh ???']).ok);
// Without --expectGroundMesh the ground part is not judged (Nighttime / historical packages).
const hist={mesh:'WorldPlayerLowPoly-v4'};
ok('historical expectation accepts line without ground field',lib.matchMeshLines([L('WorldPlayerLowPoly-v4',6926)],hist).ok);
ok('historical expectation accepts ground=drawn',lib.matchMeshLines([L('WorldPlayerLowPoly-v4',6926,'drawn')],hist).ok);
console.log(passed+' passed, '+failed+' failed');process.exit(failed?1:0);
