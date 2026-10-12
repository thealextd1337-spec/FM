'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.join(__dirname,'handoff.json'),report=JSON.parse(fs.readFileSync(file));assert(report.pass);
// Retain the original PowerShell/BOM/CRLF intermediate observation locally.
// The public ci.json contains the complete terminal run and job/step records.
report.localOnlyArtifacts=report.artifacts.filter(x=>x.file==='ci-job-observation.json');
report.artifacts=report.artifacts.filter(x=>x.file!=='ci-job-observation.json');
report.continuedByRoot=true;
report.resolvedQAObservations=['roster-load-timeout.json','parity-dom-navigation-timeout.json','parity-early-read-failure.json'];
report.finalReadiness='Navigation commit followed by actual storage/model readiness, real actor ACK, strict career validation and byte-identical complete save restoration. No production source changes.';
fs.writeFileSync(file,JSON.stringify(report,null,2));
