'use strict';

// AP03 prepares an independent new world. AP04–06 attach its competitions.
// Existing global league/catalog arrays remain the six-country starting variant.
const v161EconomicFactors={A:1,B:.96,C:.9,D:.84};
const v161Partners={NED:[['BEL',45],['GER',40],['DEN',15]],BEL:[['FRA',45],['NED',35],['GER',20]],AUT:[['GER',45],['SUI',20],['CZE',20],['SVN',15]],SUI:[['FRA',35],['GER',30],['ITA',25],['AUT',10]],TUR:[['GER',45],['AZE',25],['GRE',15],['BUL',15]],GRE:[['CYP',40],['ALB',25],['BUL',20],['TUR',15]]};
Object.assign(v79YouthPartners,v161Partners);
Object.assign(v79ProfessionalHomeShare.roster,{NED:48,BEL:42,AUT:55,SUI:48,TUR:58,GRE:52});
Object.assign(v79ProfessionalHomeShare.free,{NED:30,BEL:28,AUT:36,SUI:32,TUR:38,GRE:34});
Object.assign(v79ProfessionalRoutes,{NED:{BEL:4,GER:3,DEN:3,SUR:5},BEL:{FRA:4,NED:3,GER:2,COD:4},AUT:{GER:4,SUI:3,CZE:3,SVN:3,CRO:3},SUI:{FRA:4,GER:4,ITA:3,AUT:2},TUR:{GER:4,AZE:4,BUL:3,GRE:2},GRE:{CYP:5,ALB:4,BUL:3,TUR:2}});
for(const country of v161Countries)if(!v61Names[country.id]){const nation=v79NationByCode[country.id];v61Names[country.id]=[nation.given,nation.family];}

const v161SponsorNames={NED:['Amstelstroom','Kanaalglas','Noorderlijn','Veldhaven','Lichtweef','Rijnkompas'],BEL:['Senneflux','Reiebron','Kempenwerk','Leievonk','Maasroute','Scheldekern'],AUT:['Traunlicht','Murquelle','Innwerk','Aarell','Donaufaden','Westpark Mobil'],SUI:['Limmatfaden','Reussklar','Sitterwerk','Rhônelinie','Ceresio Licht','Aarekompass'],TUR:['Kıyı Akım','Porsuk Kaynak','Marmara Örgü','Seyhan Rota','Alleben Işık','Kale Hat'],GRE:['Pinios Ropi','Therma Nima','Candia Nero','Achaia Fos','Pelion Dromos','Strymon Dikti']};
Object.assign(v66SponsorColors,{NED:['#c43743','#f3f5f2','#326db7'],BEL:['#1d2329','#e3bd42','#c43743'],AUT:['#c43743','#f3f5f2','#68b8d9'],SUI:['#c43743','#f3f5f2','#d9ab45'],TUR:['#c43743','#f3f5f2','#68b8d9'],GRE:['#326db7','#f3f5f2','#d9ab45']});
for(const [country,names]of Object.entries(v161SponsorNames))v66SponsorBrands[country]=names.map((name,index)=>({id:`exp-${country.toLowerCase()}-${index+1}`,name,icon:[
 '<path d="M8 58 30 12h14L22 58ZM34 58l22-46h14L48 58Z" fill="var(--primary)"/><path d="M8 65h62" stroke="var(--tertiary)" stroke-width="5"/>',
 '<path d="M37 8C14 32 10 47 37 65c27-18 23-33 0-57Z" fill="var(--primary)"/><path d="M37 24v28" stroke="var(--secondary)" stroke-width="5"/>',
 '<path d="M9 15h22v20H9ZM43 35h22v20H43Z" fill="var(--primary)"/><path d="M20 35v20h23M54 35V15H31" stroke="var(--tertiary)" stroke-width="5" fill="none"/>',
 '<path d="M9 54Q37 8 65 54M16 65h42" stroke="var(--primary)" stroke-width="7" fill="none"/><path d="m32 36 5-10 5 10Z" fill="var(--tertiary)"/>',
 '<path d="M10 10h18v48H10ZM31 25h18v33H31ZM52 40h18v18H52Z" fill="var(--primary)"/><path d="M10 65h60" stroke="var(--secondary)" stroke-width="4"/>',
 '<path d="M10 20h48v16H26v18h42v16H10Z" fill="var(--primary)"/><circle cx="58" cy="20" r="8" fill="var(--tertiary)"/>'
 ][index],word:`<text x="94" y="57" font-family="Arial,sans-serif" font-size="26" font-weight="700">${name}</text>`}));

function v161Rules(){return{version:1,variant:'expansion12',stage:'foundation',countries:v161Countries.map(c=>c.id),clubsPerLeague:8,cupOnlyClubs:8,leagueRounds:14,nationalCup:{participants:16,firstRound:'R16'},international:JSON.parse(JSON.stringify(v161Opening.rules)),calendar:null};}
function v161GenerationPolicy(){const tierOffsets={A:0,B:-.25,C:-.5,D:-.75};return{version:1,tierOffsets,clubOffsets:Object.fromEntries(v161Catalog.map(c=>[c.id,tierOffsets[v161Countries.find(n=>n.id===c.countryId).tier]+(c.profile[5]-3)*.2]))};}
function v61Rules(career){return career?.world?.rules||{version:1,variant:'legacy6',countries:v61Countries.map(([id])=>id),clubsPerLeague:6,cupOnlyClubs:2,leagueRounds:10};}
function v161ValidateRules(career){
 const r=career?.world?.rules;
 return r?.version===1&&r.variant==='expansion12'&&r.stage==='foundation'&&career.phase==='world-foundation'&&v161SameData(r,v161Rules())&&v161SameData(career.world.opening,v161Opening)&&career.world.season===1&&career.world.calendarCursor===0&&Array.isArray(career.world.competitions)&&career.world.competitions.length===0&&career.world.playerFoundation?.parameterId==='native-player-v160-1'&&v161SameData(career.world.playerFoundation.expansionGeneration,v161GenerationPolicy());
}
function v161SameData(a,b){if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&v161SameData(a[k],b[k]));}
function v161ValidateClubs(career){
 return v161Catalog.every(entry=>{const club=career.world.clubs.find(c=>c.id===entry.id);return club&&club.countryId===entry.countryId&&club.leagueId===(entry.playable?`${entry.countryId}-LEAGUE`:null)&&club.cupId===`${entry.countryId}-CUP`&&club.simulationOnly===!entry.playable&&club.expansionTier===v161Countries.find(c=>c.id===entry.countryId).tier&&club.roster.every(p=>p.playerModel?.parameterId==='native-player-v160-1'&&D6PlayerGeneration.SKILL_KEYS.every(k=>Number.isFinite(p[k])&&p[k]>=1&&p[k]<=20))&&(career.world.rules.stage==='active'||club.roster.some(p=>p.line==='gk')&&['def','mid','att'].every(line=>club.roster.some(p=>p.line===line)))&&club.assetIdentity?.crestId===club.id&&club.assetIdentity?.stadium?.clubId===club.id;});
}
function v161GenerationParameters(foundation,kind,clubId){
 const offset=kind==='youth'?0:foundation.expansionGeneration?.clubOffsets?.[clubId]||0;
 if(!offset)return foundation.parameters;
 const rows=foundation.parameters.qualityByKind[kind].map(row=>({...row,byQuality:Object.fromEntries(Object.entries(row.byQuality).map(([quality,bands])=>[quality,bands.map(band=>({...band,min:Math.max(1,band.min+offset),max:Math.min(20,band.max+offset)}))]))}));
 return{...foundation.parameters,qualityByKind:{...foundation.parameters.qualityByKind,[kind]:rows}};
}
function v161ClubRecord(entry,seed,foundation){
 const club=v61ClubRecord(entry,seed,foundation),tier=v161Countries.find(c=>c.id===entry.countryId).tier;
 club.expansionTier=tier;
 club.assetIdentity={version:1,crestId:club.id,crestConcept:entry.crestConcept,stadium:{clubId:club.id,city:club.city,status:'identity-only',renderer:'existing-neutral-fallback'}};
 return club;
}
function v161StartFunds(career){career.world.foundationReady={version:1,catalog:192,assets:'vector-identities',competitions:'pending-ap04-ap06'};}
function v161CreateCareer(clubId,seed=crypto.randomUUID(),name='Manager',matchOptions=undefined,progressionVersion=undefined){return v61CreateCareer(clubId,seed,name,undefined,matchOptions,{variant:'expansion12',progressionVersion});}

const v161BaseBuildKits=v61BuildClubKits;
v61BuildClubKits=function(entry,chosenColors=null,chosenStyles=null){
 if(!entry.palette)return v161BaseBuildKits(entry,chosenColors,chosenStyles);
 const [primary,secondary,tertiary]=entry.palette.map(p=>p.hex),legacyIndex=v61Catalog.findIndex(c=>c.id===entry.id),index=v161Catalog.findIndex(c=>c.id===entry.id);
 return v161BaseBuildKits(entry,chosenColors||{primary,secondary,tertiary},chosenStyles||{home:v61KitStyles[(legacyIndex<0?index:legacyIndex)%v61KitStyles.length],away:v61KitStyles[((legacyIndex<0?index:legacyIndex)+3)%v61KitStyles.length]});
};
const v161BaseIncome=v66BaseIncome;
v66BaseIncome=function(club){return Math.round(v161BaseIncome(club)*(v161EconomicFactors[club.expansionTier]||1));};
const v161BaseSponsors=v66MakeSponsors;
v66MakeSponsors=function(career,club){const offers=v161BaseSponsors(career,club),factor=v161EconomicFactors[club.expansionTier]||1;if(factor!==1)for(const offer of offers)offer.fixed=Math.round(offer.fixed*factor/10)*10;return offers;};
const v161BaseAdvance=v62AdvanceDay;
v62AdvanceDay=function(career){if(career.world.rules?.stage==='foundation')throw Error('Die Wettbewerbe dieser Welt sind noch nicht vorbereitet.');return v161BaseAdvance(career);};
const v161BaseChooseSponsor=v66ChooseSponsor;
v66ChooseSponsor=function(career,...args){if(career.phase==='world-foundation')throw Error('Die Wettbewerbe dieser Welt sind noch nicht vorbereitet.');return v161BaseChooseSponsor(career,...args);};

function v161Escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function v161Crest(club,size=44){
 const entry=v161Catalog.find(c=>c.id===club.id);if(!entry)return '';
 const {primary:a,secondary:b,tertiary:c}=club.kits.colors;
 const index=v161Catalog.indexOf(entry),variant=index%6;
 const motif=[`<path d="M22 68V48a28 28 0 0 1 56 0v20M32 68V49a18 18 0 0 1 36 0v19" fill="none" stroke="${b}" stroke-width="7"/>`,`<path d="M20 57q15-23 30 0t30 0M22 70q14-15 28 0t28 0" fill="none" stroke="${b}" stroke-width="6"/>`,`<path d="M24 65V40h12v25M44 65V27h12v38M64 65V34h12v31" fill="${b}"/>`,`<path d="M22 35h24v24H22ZM54 47h24v24H54Z" fill="none" stroke="${b}" stroke-width="6"/>`,`<path d="M21 67 40 30l12 24 12-15 16 28Z" fill="none" stroke="${b}" stroke-width="6"/>`,`<path d="M29 70q-15-22 0-42 18 4 21 20 3-16 21-20 15 20 0 42M50 48v28" fill="none" stroke="${b}" stroke-width="6"/>`][variant];
 const outline=index%3===0?'M12 12h76v48Q85 83 50 94 15 83 12 60Z':index%3===1?'M50 7 91 30v40L50 94 9 70V30Z':'M50 8a42 42 0 1 1 0 84 42 42 0 1 1 0-84Z';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${v161Escape(club.name)}"><title>${v161Escape(club.name)}</title><path d="${outline}" fill="${a}" stroke="${c}" stroke-width="5"/>${motif}<path d="M${26+index%9} 80h${44-index%9}" stroke="${c}" stroke-width="4"/><circle cx="${24+index%13*4}" cy="19" r="3" fill="${c}"/></svg>`;
}
const v161BaseCrest=v61CrestSVG;
v61CrestSVG=function(club,...args){const entry=v161Catalog.find(c=>c.id===club?.id);return entry?.origin==='ap02-editorial'?v161Crest(club,typeof args[0]==='number'?args[0]:44):v161BaseCrest(club,...args);};
function v161RenderFoundation(career){
 const club=career.world.clubs.find(c=>c.id===career.manager.managedClubId);
 v61WorldScreen.innerHTML=`<section class="v61-shell"><h2>${v161Escape(club.name)}</h2>${v61CrestSVG(club)}<p>Die Vereinswelt mit zwölf Ländern und 192 Vereinen ist vorbereitet. Diese Vorschau enthält noch keine spielbaren Wettbewerbe.</p><p>Dieser Vorbereitungsstand bleibt gespeichert.</p><button type="button" onclick="v61ShowStart()">Zurück zu den Spielständen</button></section>`;
 v61ShowScreen();
}
// Install after the existing UI adapters have wrapped the shared next action.
if(typeof document==='object')document.addEventListener('DOMContentLoaded',()=>{
 const base=v58State;
 v58State=function(){if(v61CurrentCareer?.phase==='world-foundation'&&!v61WorldScreen.hidden)return{context:'Vereinswelt vorbereitet'};return base();};
});
if(typeof window==='object')window.D6Expansion={createFoundation:v161CreateCareer,rules:v61Rules,catalog:()=>v161Catalog.map(c=>({id:c.id,name:c.name,city:c.city,countryId:c.countryId,playable:c.playable})),countries:()=>v161Countries.map(c=>({id:c.id,name:c.name})),store:career=>{if(!v161ValidateRules(career))throw Error('Ungültiger Vorbereitungsstand.');return v61StoreNewCareer(career);},import:v61ImportCareerData,export:v61ExportCareerData,crest:v61CrestSVG};
