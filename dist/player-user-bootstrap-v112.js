'use strict';
// Shared player assets load once; no career, save or match is created here.
window.D6UserModelStatus='loading';
window.D6UserModelReady=(async()=>{
 let seed=112;
 function graphics(work){const saved=Math.random;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};try{return work()}finally{Math.random=saved}}
 try{
  const [{GLTFLoader},response,calibration,mask]=await Promise.all([
   import('./camera-prototype/vendor/GLTFLoader.js'),
   fetch('players/football-v130.glb').then(r=>{if(!r.ok)throw Error('Player asset unavailable');return r.arrayBuffer()}),
   fetch('players/calibration-v130.json').then(r=>{if(!r.ok)throw Error('Player calibration unavailable');return r.json()}),
   graphics(()=>new THREE.TextureLoader().loadAsync('players/cloth-mask.png'))
  ]);
  const bytes=new Uint8Array(response),gltf=await new GLTFLoader().parseAsync(response,'');mask.flipY=false;mask.colorSpace=THREE.NoColorSpace;
  window.userMeshyMatch=graphics(()=>D6UserMeshyPlayer.install(gltf.scene,gltf.animations,mask,calibration));window.userMeshyCharacterBytes=bytes;window.userMeshyMatchReady=true;window.D6UserModelStatus='ready';
  // A match opened while loading is rebuilt with the new factory and the same engine state.
  if(typeof v98Dispose==='function')v98Dispose();if(typeof v98IsWorld==='function'&&v98IsWorld())draw();
  return window.userMeshyMatch;
 }catch(error){window.D6UserModelStatus='failed';window.userMeshyMatchError=error.message;console.warn('Football player assets unavailable',error);if(typeof v98Toolbar==='function'&&typeof v98IsWorld==='function'&&v98IsWorld())v98Toolbar();return null}
})();
