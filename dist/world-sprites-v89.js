'use strict';

// Additional paired artwork for the most frequent uncovered pose/hair combinations.
const v89AssetRows=[
 ['e','portrait','sprites/player-pair-e-portrait.png','sprites/player-pair-e-portrait-shirt.png','sprites/player-pair-e-portrait-trim.png','sprites/player-pair-e-portrait-skin.png','sprites/player-pair-e-portrait-hair.png'],
 ['e','goal','sprites/player-pair-e-goal.png','sprites/player-pair-e-goal-shirt.png','sprites/player-pair-e-goal-trim.png','sprites/player-pair-e-goal-skin.png','sprites/player-pair-e-goal-hair.png'],
 ['f','portrait','sprites/player-pair-f-portrait.png','sprites/player-pair-f-portrait-shirt.png','sprites/player-pair-f-portrait-trim.png','sprites/player-pair-f-portrait-skin.png','sprites/player-pair-f-portrait-hair.png'],
 ['f','goal','sprites/player-pair-f-goal.png','sprites/player-pair-f-goal-shirt.png','sprites/player-pair-f-goal-trim.png','sprites/player-pair-f-goal-skin.png','sprites/player-pair-f-goal-hair.png'],
 ['g','portrait','sprites/player-pair-g-portrait.png','sprites/player-pair-g-portrait-shirt.png','sprites/player-pair-g-portrait-trim.png','sprites/player-pair-g-portrait-skin.png','sprites/player-pair-g-portrait-hair.png'],
 ['g','goal','sprites/player-pair-g-goal.png','sprites/player-pair-g-goal-shirt.png','sprites/player-pair-g-goal-trim.png','sprites/player-pair-g-goal-skin.png','sprites/player-pair-g-goal-hair.png'],
 ['h','portrait','sprites/player-pair-h-portrait.png','sprites/player-pair-h-portrait-shirt.png','sprites/player-pair-h-portrait-trim.png','sprites/player-pair-h-portrait-skin.png','sprites/player-pair-h-portrait-hair.png'],
 ['h','goal','sprites/player-pair-h-goal.png','sprites/player-pair-h-goal-shirt.png','sprites/player-pair-h-goal-trim.png','sprites/player-pair-h-goal-skin.png','sprites/player-pair-h-goal-hair.png'],
 ['i','portrait','sprites/player-pair-i-portrait.png','sprites/player-pair-i-portrait-shirt.png','sprites/player-pair-i-portrait-trim.png','sprites/player-pair-i-portrait-skin.png','sprites/player-pair-i-portrait-hair.png'],
 ['i','goal','sprites/player-pair-i-goal.png','sprites/player-pair-i-goal-shirt.png','sprites/player-pair-i-goal-trim.png','sprites/player-pair-i-goal-skin.png','sprites/player-pair-i-goal-hair.png'],
 ['j','portrait','sprites/player-pair-j-portrait.png','sprites/player-pair-j-portrait-shirt.png','sprites/player-pair-j-portrait-trim.png','sprites/player-pair-j-portrait-skin.png','sprites/player-pair-j-portrait-hair.png'],
 ['j','goal','sprites/player-pair-j-goal.png','sprites/player-pair-j-goal-shirt.png','sprites/player-pair-j-goal-trim.png','sprites/player-pair-j-goal-skin.png','sprites/player-pair-j-goal-hair.png'],
 ['k','portrait','sprites/player-pair-k-portrait.png','sprites/player-pair-k-portrait-shirt.png','sprites/player-pair-k-portrait-trim.png','sprites/player-pair-k-portrait-skin.png','sprites/player-pair-k-portrait-hair.png'],
 ['k','goal','sprites/player-pair-k-goal.png','sprites/player-pair-k-goal-shirt.png','sprites/player-pair-k-goal-trim.png','sprites/player-pair-k-goal-skin.png','sprites/player-pair-k-goal-hair.png'],
 ['l','portrait','sprites/player-pair-l-portrait.png','sprites/player-pair-l-portrait-shirt.png','sprites/player-pair-l-portrait-trim.png','sprites/player-pair-l-portrait-skin.png','sprites/player-pair-l-portrait-hair.png'],
 ['l','goal','sprites/player-pair-l-goal.png','sprites/player-pair-l-goal-shirt.png','sprites/player-pair-l-goal-trim.png','sprites/player-pair-l-goal-skin.png','sprites/player-pair-l-goal-hair.png']
];
const v89Template={e:'a',f:'d',g:'b',h:'d',i:'b',j:'c',k:'b',l:'d'};
for(const [pair,view,base,shirt,trim,skin,hair] of v89AssetRows){
 if(!v87PairAssets[pair]){
  v87PairAssets[pair]={};
  v87PairProfiles[pair]={...v87PairProfiles[v89Template[pair]],...v61AuthoredFaces[pair]};
 }
 v87PairAssets[pair][view]={base,shirt,trim,skin,hair};
}
v82SpriteCache.clear();
