'use strict';
// Minimal integration of explicit NEW local candidate worlds. Loading an old
// career never calls this generator or constructs missing internal properties.
function v153Options(options,seed){
 if(!options)return null;
 if(!['wave2-local-candidate-1','wave3-local-candidate-1','native-player-v160-1'].includes(options.parameterId)||!options.parameters||!options.qualityMapping)throw Error('Unbekannter Spieler-Prüfstand.');
 const clean=JSON.parse(JSON.stringify(options));clean.version=2;clean.worldId=seed;if(clean.loadParameters)D6LoadCandidate.materializeParameters(clean.loadParameters);
 // Actual initial youth volumes, rather than a quota per team or a fabricated
 // equal club population, normalize the confirmed high-talent weights.
 const counts={weak:0,normal:0,strong:0};
 for(const entry of v61Catalog){if(entry.id.includes('-C'))continue;const count=2+Math.floor(v61Random(`${seed}:${entry.id}:starting-youth`)()*3),quality=clean.qualityMapping[entry.profile[2]];if(!Object.hasOwn(counts,quality))throw Error('Jugendprofil fehlt.');counts[quality]+=count;}
 clean.parameters.youthPopulationWeights=counts;return clean;
}
function v153PreviewOptions(){return typeof window==='object'?window.D6PlayerFoundationPreviewOptions||window.D6PlayerFoundationOptions||null:null;}
function v153Generate(player,foundation,kind,quality,youthQuality){
 if(!foundation)return player;
 if(player.history?.length||player.seasons?.length||player.playerModel)throw Error('Spielergrundlagen dürfen nur bei Neuerzeugung entstehen.');
 const context={id:player.pid,age:kind==='youth'?17:player.age,mainPosition:player.line,kind,clubQuality:foundation.qualityMapping[quality],youthQuality:foundation.qualityMapping[youthQuality]||'normal'};
 const created=D6PlayerGeneration.generatePlayer(context,foundation.parameters,v61Random(`${player.pid}:player-foundation-2`));
 Object.assign(player,created.skills,{age:created.age,heightCm:created.heightCm,foot:{right:'Rechts',left:'Links',both:'Beidfüßig'}[created.preferredFoot]});
 player.playerModel={version:2,parameterId:foundation.parameterId,playablePositions:created.playablePositions,caps:created.caps,talent:created.talent,preferredFoot:created.preferredFoot,recommendedRoles:created.recommendedRoles,development:D6Development.createLedger(player.pid,foundation.worldId,foundation.season||1),aging:D6Aging.createLedger(player.pid,foundation.worldId)};
 if(typeof v154GenerateRoles==='function')v154GenerateRoles(player,created,foundation);
 if(typeof v158Generate==='function')v158Generate(player,foundation);
 delete player.potential;delete player.developmentMinutes;
 return player;
}
function v153ReidentifyNewPlayer(player){
 const model=player.playerModel;if(model?.version!==2)return;
 if(player.history?.length||model.development.processedAppearances.length||model.aging.processedSeasons.length)throw Error('Nur frische freie Spieler dürfen eine endgültige ID erhalten.');
 model.development.playerId=player.pid;model.aging.playerId=player.pid;
 if(model.freshnessState){if(model.freshnessState.ledger.loads.length||model.freshnessState.ledger.transitions.length)throw Error('Belasteter Spieler darf keine neue ID erhalten.');model.freshnessState.id=player.pid;}
}
function v153AgePlayer(career,player,newSeason){
 const model=player.playerModel;if(model?.version!==2){player.age++;return;}
 if(model.aging.processedSeasons.some(s=>s.seasonId===newSeason))return;
 const skills=Object.fromEntries(D6Aging.SKILL_KEYS.map(k=>[k,player[k]])),change=D6Aging.agingTransition(skills,model.aging,{worldId:career.world.seed,seasonId:newSeason,newAge:player.age+1});
 if(change.status==='unsupported')throw Error('Altersbuchung gehört zu einer anderen Welt.');
 const next={};for(const k of D6Aging.SKILL_KEYS)next[k]=player[k]+change.skillDelta[k];
 const nextDevelopment=D6Development.resetSeason(model.development,newSeason);
 Object.assign(player,next);player.age++;model.aging=change.nextLedger;model.development=nextDevelopment;
 if(typeof v154Active==='function'&&v154Active(career))model.roleModel.bestRecommendedRole=D6PlayerRoles.bestRecommendedRole(model.recommendedRoles,model.roleModel.bestRecommendedRole,v154Skills(player),model.roleModel.routine,career.world.playerFoundation.roles.suitability);
}
function v153UiPlayer(player){
 // Explicit safe projection: no full player spread, talent, caps or ledgers.
 return {pid:player.pid,name:player.name,age:player.age,line:player.line,heightCm:player.heightCm??null,foot:player.foot,skills:Object.fromEntries(D6PlayerGeneration.SKILL_KEYS.filter(k=>Number.isFinite(player[k])).map(k=>[k,v55SkillBand(player[k])])),playablePositions:[...(player.playerModel?.playablePositions||[player.line])],recommendedRoles:(player.playerModel?.recommendedRoles||[]).map(r=>({position:r.position,roleId:r.roleId}))};
}
function v153ApplyAppearance(career,player,appearance,approvedWeights){
 const model=player.playerModel;if(model?.version!==2||!career.world.playerFoundation)return {status:'unsupported',reason:'unmarked-world'};
 const internal={id:player.pid,age:player.age,talent:model.talent,skills:Object.fromEntries(D6Development.SKILL_KEYS.map(k=>[k,player[k]])),caps:model.caps};
 const change=D6Development.developmentDelta(internal,model.development,appearance,approvedWeights);
 if(change.status==='unsupported'||change.status==='duplicate')return change;
 const next={};for(const k of D6Development.SKILL_KEYS)next[k]=player[k]+change.skillDelta[k];
 Object.assign(player,next);model.development=change.nextLedger;return change;
}
if(typeof window==='object')window.D6PlayerFoundation={uiPlayer:v153UiPlayer,applyAppearance:v153ApplyAppearance};
