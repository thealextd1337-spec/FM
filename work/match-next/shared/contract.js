(function(root){'use strict';
const VERSION='d6-probe-1',BASE={length:68,width:44,goalWidth:44*.2/(544/600),goalHeight:44*.2/(544/600)/3,penaltyDepth:10,penaltyWidth:20,ballRadius:.1764};
function geometry(large=false,fieldPlayers=5,attackDirection=1){if(![5,6].includes(fieldPlayers)||![1,-1].includes(attackDirection))throw Error('Invalid demo configuration');return {...BASE,length:BASE.length*(large?1.2:1),width:BASE.width*(large?1.2:1),fieldPlayers,attackDirection};}
function toNative(p,g){return {x:.5+p[2]/g.width*(544/600),y:.5-p[0]/g.length*(688/740)};}
function fromNative(p,g,height=0){return [(.5-p.y)*g.length/(688/740),height,(p.x-.5)*g.width/(544/600)];}
function rng(seed=617){let state=seed>>>0;return {next(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;},get state(){return state;},set state(v){state=v>>>0;}};}
function ledger(){let entries=new Map();return {add(e){if(!e||typeof e.id!=='string')throw Error('Event ID required');if(entries.has(e.id))return false;entries.set(e.id,JSON.parse(JSON.stringify(e)));return true;},all(){return [...entries.values()].map(e=>JSON.parse(JSON.stringify(e)));},restore(list){entries=new Map();list.forEach(e=>this.add(e));}};}
const api={VERSION,BASE,geometry,toNative,fromNative,rng,ledger};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.D6ProbeContract=api;
})(typeof globalThis!=='undefined'?globalThis:this);
