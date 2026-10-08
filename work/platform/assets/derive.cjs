'use strict';
const {spawnSync}=require('node:child_process');
const {inspect,root}=require('./inventory.cjs');
inspect();
const blender=process.env.D6_BLENDER||'G:/Blender/blender.exe';
const result=spawnSync(blender,['--background','--factory-startup','--python-exit-code','1','--python','work/platform/assets/export_fbx.py'],{cwd:root,stdio:'inherit',windowsHide:true});
if(result.error)throw result.error;if(result.status!==0)throw Error(`Blender export failed (${result.status}); original assets remain untouched`);
require('./validate.cjs');
