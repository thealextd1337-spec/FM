'use strict';
function v179PromiseOptionsHTML(career,selected){
 return['reserve','rotation','starter'].map(role=>`<optgroup label="${v179RoleLabel(role)}">${Array.from({length:v66PromiseLimit(career)+1},(_,n)=>n).filter(n=>v179SquadRole(career,n)===role).map(n=>`<option value="${n}" ${n===Number(selected)?'selected':''}>${v179RoleLabel(role)} · ${n} ${n===1?'Einsatz':'Einsätze'}</option>`).join('')}</optgroup>`).join('');
}
function v179ProgressHTML(career,player){
 const progress=v179PromiseProgress(career,player);if(!progress)return'';
 const label={none:'Keine Einsatz-Zusage',fulfilled:'Zusage erfüllt',pending:'Bewertung ab vier Spielen',behind:'Zu wenig Spielzeit', 'on-track':'Spielzeit im Plan'}[progress.status];
 return`<span class="v179-role">${v179RoleLabel(progress.role)} · ${progress.promise} <span>Einsätze pro Saison</span></span><small class="v179-progress" data-status="${progress.status}"><span>${label}</span><span>${progress.credits} / ${progress.target} · Anrechenbare Einsätze</span><span>${progress.expected} · Bisher erwartet</span></small>`;
}
function v179DepthHTML(career){
 const depth=v179SquadDepth(career,v66Own(career));
 return`<section class="v62-season v179-depth"><h3>Kaderrollen und Tiefe</h3><p class="v179-role-counts">${Object.entries(depth.counts).map(([role,count])=>`<span>${v179RoleLabel(role)} <b>${count}</b></span>`).join('')}</p><p>Grundordnung <strong>${depth.formation}</strong></p><div class="v179-depth-grid">${depth.positions.map(p=>`<div data-status="${p.status}"><strong>${v61PositionNames[p.line]}</strong><span>${p.available} / ${p.required} · Kader / Startplätze</span><small>${{missing:'Position unterbesetzt',thin:'Ohne direkten Ersatz',covered:'Mit Ersatz besetzt'}[p.status]}</small></div>`).join('')}</div>${depth.overpromised?'<p class="v179-warning" role="status">Mehr Stammspieler zugesagt als Startplätze verfügbar. Prüfe deine Spielzeitplanung.</p>':''}<p class="v66-note">Die Kaderrolle folgt der Einsatz-Zusage. Ändere sie bei einer Vertragsverhandlung. Stammspieler: 9–14, Rotation: 5–8, Ersatz: 0–4 Einsätze pro Saison.</p><p class="v66-note">Ein anrechenbarer Einsatz braucht 45 gewichtete Minuten. Kürzere Einsätze werden addiert; Europacup zählt 1,5-fach, Pokal vor dem Finale 0,75-fach. Spielzeitlücken von mindestens zwei Einsätzen können bei der Vertragsprüfung die Form senken.</p></section>`;
}
const v179BaseDecorate=v66DecorateCareer;
v66DecorateCareer=function(career){
 v179BaseDecorate(career);
 if(v167Active(career))v61WorldScreen.querySelector('.v66-contracts')?.insertAdjacentHTML('beforebegin',v179DepthHTML(career));
};
const v179BaseContractFacts=v66ContractFactsHTML;
v66ContractFactsHTML=function(contract,season){
 const html=v179BaseContractFacts(contract,season);
 if(!contract||contract.simulationOnly)return html;
 const career=v61CurrentCareer;
 return html+(career?`<span>Kaderrolle<b>${v179RoleLabel(v179SquadRole(career,contract.promise))}</b></span>`:'');
};
