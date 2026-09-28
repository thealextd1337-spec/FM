'use strict';

// An authored pair is used only when every saved structural face feature matches.
const v88PreviousSpriteSVG=v82SpriteSVG;
const v88AssetRows=[
 ['a2','portrait','sprites/player-pair-a2-portrait.png','sprites/player-pair-a2-portrait-shirt.png','sprites/player-pair-a2-portrait-trim.png','sprites/player-pair-a2-portrait-skin.png','sprites/player-pair-a2-portrait-hair.png'],
 ['a2','goal','sprites/player-pair-a2-goal.png','sprites/player-pair-a2-goal-shirt.png','sprites/player-pair-a2-goal-trim.png','sprites/player-pair-a2-goal-skin.png','sprites/player-pair-a2-goal-hair.png'],
 ['b2','portrait','sprites/player-pair-b2-portrait.png','sprites/player-pair-b2-portrait-shirt.png','sprites/player-pair-b2-portrait-trim.png','sprites/player-pair-b2-portrait-skin.png','sprites/player-pair-b2-portrait-hair.png'],
 ['b2','goal','sprites/player-pair-b2-goal.png','sprites/player-pair-b2-goal-shirt.png','sprites/player-pair-b2-goal-trim.png','sprites/player-pair-b2-goal-skin.png','sprites/player-pair-b2-goal-hair.png'],
 ['c2','portrait','sprites/player-pair-c2-portrait.png','sprites/player-pair-c2-portrait-shirt.png','sprites/player-pair-c2-portrait-trim.png','sprites/player-pair-c2-portrait-skin.png','sprites/player-pair-c2-portrait-hair.png'],
 ['c2','goal','sprites/player-pair-c2-goal.png','sprites/player-pair-c2-goal-shirt.png','sprites/player-pair-c2-goal-trim.png','sprites/player-pair-c2-goal-skin.png','sprites/player-pair-c2-goal-hair.png'],
 ['d2','portrait','sprites/player-pair-d2-portrait.png','sprites/player-pair-d2-portrait-shirt.png','sprites/player-pair-d2-portrait-trim.png','sprites/player-pair-d2-portrait-skin.png','sprites/player-pair-d2-portrait-hair.png'],
 ['d2','goal','sprites/player-pair-d2-goal.png','sprites/player-pair-d2-goal-shirt.png','sprites/player-pair-d2-goal-trim.png','sprites/player-pair-d2-goal-skin.png','sprites/player-pair-d2-goal-hair.png']
];
for(const [pair,view,base,shirt,trim,skin,hair] of v88AssetRows){
 if(!v87PairAssets[pair]){
  v87PairAssets[pair]={};
  v87PairProfiles[pair]={...v87PairProfiles[pair[0]],...v61AuthoredFaces[pair]};
 }
 v87PairAssets[pair][view]={base,shirt,trim,skin,hair};
}
function v88PairForAppearance(appearance){
 const fields=['hairstyle','pose','faceShape','eyeBrows','nose','mouth','facialHair'];
 return Object.keys(v87PairProfiles).find(pair=>fields.every(field=>appearance[field]===v87PairProfiles[pair][field]))||null;
}
v82SpriteCache.clear();
v82SpriteSVG=function(player,kit,mode='portrait'){
 const appearance=player?.appearance;
 if(appearance&&v61ValidAppearance(appearance)){
  const pair=v88PairForAppearance(appearance);
  if(pair)return v87PairSpriteSVG(player,kit,mode,pair);
 }
 return v88PreviousSpriteSVG(player,kit,mode);
};
