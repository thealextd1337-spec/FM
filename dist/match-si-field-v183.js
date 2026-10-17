'use strict';

// Player intelligence 183, package SI-5: large pitch and six field players.
// New logic only for v183Active(m,'field') on a pitch larger than the standard
// pitch (geometry.length > 68 m); otherwise the wrapped previous function runs
// unchanged, so the standard pitch, unmarked and 182 matches, and marked
// matches with the package off stay byte-identical. The shared clock rate is
// untouched: the large pitch closes its gap through pace and shooting range
// and, optionally, through the formation in metres, never through the clock.
// Wrapped here (plan 8.3): v183PaceFactor (ball carrier and own runs),
// v183OptWindowBase (the switch of SI-1's shooter window), the formation anchor weiche
// v183FormationAnchor (game.js team()), v55DefenderY (pitch-v55.js, line base of
// v55PrepareMovement) and v121PreparePositioning (line plans of SI-4's
// defensive positioning; SI-4 left this function to SI-5). The module draws no
// random number and keeps no state: every result is a pure function of the
// stored match.si parameters, the geometry and the positions, so a restored
// match continues with the same behaviour.
//
// Measured with 96 paired large-pitch matches per variant (docs/
// spielerintelligenz-si5-field-183.md): pace and a longer shooting window close
// the gap. Capping the block width, the row gap and the line bases in metres,
// and widening the offers of SI-2 with the pitch, each lowered shots and goals
// (the attack rows move away from the goal), so the shape parameters are
// implemented and tested but stay off by default.

// ----- Parameters (defaults; stored with every new match) -----
// Distances are metres on the pitch of the match; a cap equal to the standard
// value leaves the standard pitch unchanged by construction. "extra" below is
// pitch length / 68 m - 1 (0.2 on the large pitch).
//   carrierPaceGain / runPaceGain / pressPaceGain / otherPaceGain
//                pace factor 1 + gain * extra on the ball carrier, on own runs
//                (depth/follow), on pressing and on all other purposes
//                (support, base, intercept, contest).
//   carrierCloseGain  the same for a ball carrier with a rival inside SI-2's
//                carrierCloseRadius (duel pace 1.28): 0 keeps the duel pace of the
//                standard pitch; 0.5 gives 1.41 (the pressing pace is 1.58, so the
//                duel pace stays below it).
//   carrierSpeedMax / runSpeedMax  absolute ceilings (m/s) of the scaled carrier and
//                run pace; the scaling never lowers a pace below the unscaled one;
//                0 = no ceiling.
//   windowGain   metres added to the shooter window of SI-1 (v183OptWindowBase)
//                per unit of extra (the longer way to goal costs attempts
//                from the edge of the window; 12 gives +2.4 m on the large pitch).
//   anchorWidth  maximum lateral span (m) between the outermost grid columns of
//                a formation (standard grid: 34.9 m); 0 = no cap.
//   rowGap       maximum distance (m) between two grid rows (standard grid:
//                9.1 m); the rows contract towards the centre line; 0 = no cap.
//   pin          0..1: share of the line positions that keep their standard
//                distance (m) from the nearer goal line (the goal zone has a
//                fixed size in metres); fades to the centre line over pinFull
//                (normalised distance from the centre line).
//   defenderLine / linePlans  1: also apply the row/pin rule to the defensive
//                line base (v55DefenderY) and to the line plans of
//                v121PreparePositioning.
const V183_FIELD_STANDARD=Object.freeze({length:68,width:44,columns:.72,rowStep:.125});
v183RegisterDefaults('field',{
 carrierPaceGain:1,carrierCloseGain:.5,runPaceGain:.75,pressPaceGain:0,otherPaceGain:0,carrierSpeedMax:8.5,runSpeedMax:9.5,windowGain:12,
 anchorWidth:0,rowGap:0,pin:0,pinFull:.255,defenderLine:0,linePlans:0
});

// ----- Geometry -----
function v183FieldOn(m){
 if(!(typeof v183Active==='function'&&v183Active(m,'field')))return false;
 const g=m.geometry;return Boolean(g&&g.length>V183_FIELD_STANDARD.length+1e-9);
}
function v183FieldExtra(m){return m.geometry.length/V183_FIELD_STANDARD.length-1;}
// Metres per normalised unit of the pitch and the size relative to the standard pitch.
function v183FieldUnits(m){
 const g=m.geometry,F=V183_FIELD_STANDARD;
 return {ux:g.width/(v55Field.right-v55Field.left),uy:g.length/(v55Field.bottom-v55Field.top),sx:g.width/F.width,sy:g.length/F.length};
}
// Contraction factors of the grid (lateral span and row gap capped in metres)
// and the pin share; kg is the share of the standard distance from the goal a
// pinned line keeps.
function v183FieldFactors(m){
 const P=key=>v183Param(m,'field.'+key),u=v183FieldUnits(m),F=V183_FIELD_STANDARD;
 const spanX=F.columns*u.ux,gapY=F.rowStep*u.uy,cap=P('anchorWidth'),gap=P('rowGap');
 return {kx:cap>0?Math.min(1,cap/spanX):1,ky:gap>0?Math.min(1,gap/gapY):1,kg:1/u.sy,pin:P('pin')};
}
// Normalised y of a line position in the frame of team 0 (goal at the top). Pure.
function v183FieldMapY(m,y,k=v183FieldFactors(m)){
 const E=(v55Field.bottom-v55Field.top)/2,d=Math.abs(y-.5);
 if(d>E+1e-9||k.ky===1&&!k.pin)return y;
 const compressed=d*k.ky,pinned=E-(E-d)*k.kg,w=Math.max(0,Math.min(1,d/v183Param(m,'field.pinFull')))*k.pin;
 return .5+Math.sign(y-.5)*((1-w)*compressed+w*pinned);
}
// Same mapping for a y of team t (team 1 plays towards the bottom: mirrored).
function v183FieldMapTeamY(m,t,y,k){return t?1-v183FieldMapY(m,1-y,k):v183FieldMapY(m,y,k);}

// ----- Formation anchor (weiche in game.js team(), frame of team 0 before the mirror) -----
const v183FieldBaseAnchor=v183FormationAnchor;
v183FormationAnchor=function(m,p,t,point){
 const base=v183FieldBaseAnchor.call(this,m,p,t,point);
 if(!v183FieldOn(m))return base;
 const k=v183FieldFactors(m);
 if(k.kx===1&&k.ky===1&&!k.pin)return base;
 return {x:k.kx===1?base.x:.5+(base.x-.5)*k.kx,y:v183FieldMapY(m,base.y,k)};
};

// ----- Line base of the movement preparation (pitch-v55.js v55PrepareMovement) -----
const v183FieldBaseDefenderY=v55DefenderY;
v55DefenderY=function(team,line){
 const y=v183FieldBaseDefenderY.call(this,team,line),m=typeof match==='undefined'?null:match;
 if(!m||!v183FieldOn(m)||!v183Param(m,'field.defenderLine'))return y;
 return v183FieldMapTeamY(m,team,y);
};

// ----- Line plans of the defensive positioning (v121PreparePositioning) -----
const v183FieldBasePositioning=v121PreparePositioning;
v121PreparePositioning=function(current){
 const result=v183FieldBasePositioning.apply(this,arguments);
 if(!v183FieldOn(current)||!v183Param(current,'field.linePlans'))return result;
 const plans=v121PositioningPlans.get(current);if(!plans)return result;
 const k=v183FieldFactors(current);
 for(const [p,plan] of plans)if(plan.mark===null&&Number.isFinite(plan.y))plan.y=v183FieldMapTeamY(current,p.t,plan.y,k);
 return result;
};

// ----- Pace (switch v183PaceFactor) -----
// The ball carrier and the own runs cover the longer way of the large pitch with
// proportionally more pace. SI-2 (carrier, runs) and SI-4 (pressing) return
// their factors first; this module is the outermost wrapper and scales them.
// A scaled pace never falls below the unscaled one and never exceeds the ceiling
// (m/s) unless the unscaled pace already does; base speed as in v157Pace.
function v183FieldCap(m,p,factor,scaled,key){
 const cap=v183Param(m,'field.'+key);if(!(cap>0))return scaled;
 return Math.max(factor,Math.min(scaled,cap/(3+ability(p,'spd')*.14)));
}
const v183FieldBasePace=v183PaceFactor;
v183PaceFactor=function(m,p,purpose,detail={}){
 const factor=v183FieldBasePace.call(this,m,p,purpose,detail);
 if(!v183FieldOn(m))return factor;
 const extra=v183FieldExtra(m);
 if(purpose==='carrier'){
  // SI-2 marks a duel (rival inside its radius) on the shared detail object (detail.v183Duel). Without
  // SI-2 the previous carrier pace 1.28 is the duel pace, as before the marker existed.
  const duel=v183Active(m,'offball')?detail.v183Duel===true:true;
  return v183FieldCap(m,p,factor,factor*(1+v183Param(m,'field.'+(duel?'carrierCloseGain':'carrierPaceGain'))*extra),'carrierSpeedMax');
 }
 let key='otherPaceGain';
 if(purpose==='purposeful'){const reason=v183PaceReason(m,p,detail);key=reason==='run'||reason==='follow'?'runPaceGain':reason==='press'?'pressPaceGain':'otherPaceGain';}
 else if(purpose!=='support'&&purpose!=='base')return factor;
 const scaled=factor*(1+v183Param(m,'field.'+key)*extra);
 return key==='runPaceGain'?v183FieldCap(m,p,factor,scaled,'runSpeedMax'):scaled;
};

// ----- Shooter window of SI-1 (switch v183OptWindowBase) -----
const v183FieldBaseWindow=v183OptWindowBase;
v183OptWindowBase=function(m){
 const value=v183FieldBaseWindow.call(this,m);
 return v183FieldOn(m)?value+v183Param(m,'field.windowGain')*v183FieldExtra(m):value;
};

v183EnableByDefault('field');
