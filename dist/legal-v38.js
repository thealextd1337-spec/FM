'use strict';

const v38Owner={name:'Carlo-Alexander Kamper',address:'Am Anger 11a, 8054 Seiersberg-Pirka, Österreich',email:'alex@cakamper.at'};
const v38Style=document.createElement('style');
v38Style.textContent=`
.legal-nav{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;max-width:1180px;margin:0 auto;padding:14px 16px 30px}
.legal-nav button,.legal-inline{border:0;background:transparent;color:#c7f36b;text-decoration:underline;text-underline-offset:3px;cursor:pointer;font:inherit}
.legal-nav button{padding:9px 11px;font-size:12px}
.legal-intro{margin-top:16px}
.legal-dialog{width:min(680px,calc(100% - 28px));max-height:min(85vh,900px);padding:0;border:1px solid #52686b;border-radius:12px;background:#17282c;color:#eaf0ee;box-shadow:0 20px 70px #000a}
.legal-dialog::backdrop{background:#061215c9}
.legal-dialog-inner{padding:22px;overflow-y:auto;max-height:85vh}
.legal-dialog-header{display:flex;align-items:start;justify-content:space-between;gap:12px;border-bottom:1px solid #3b5053;padding-bottom:14px}
.legal-dialog-header h2{font-size:24px}
.legal-dialog-close{min-width:44px;min-height:44px;border:1px solid #52686b;border-radius:8px;background:#23363b;color:#eaf0ee;cursor:pointer}
.legal-dialog-content{font-size:14px;line-height:1.65}
.legal-dialog-content h3{margin:24px 0 8px;color:#c7f36b}
.legal-dialog-content p,.legal-dialog-content ul{margin:8px 0 13px}
.legal-dialog-content a{color:#c7f36b}
.legal-dialog-content address{font-style:normal}
.legal-dialog-content .privacy-actions{margin:12px 0}
@media(max-width:760px){.legal-dialog-inner{padding:17px}.legal-dialog-content{font-size:14px}}
`;
document.head.append(v38Style);

const v38Nav=document.createElement('nav');
v38Nav.className='legal-nav';v38Nav.setAttribute('aria-label','Rechtliche Hinweise');
v38Nav.innerHTML='<button type="button" data-legal-page="impressum">Impressum</button><button type="button" data-legal-page="datenschutz">Datenschutz</button><button type="button" data-legal-page="speicher">Cookies & Speicher</button>';
document.body.append(v38Nav);
const v38Dialog=document.createElement('dialog');
v38Dialog.className='legal-dialog';v38Dialog.setAttribute('aria-labelledby','legal-title');
v38Dialog.innerHTML='<div class="legal-dialog-inner"><div class="legal-dialog-header"><h2 id="legal-title"></h2><button type="button" class="legal-dialog-close" aria-label="Hinweise schließen">Schließen</button></div><div class="legal-dialog-content"></div></div>';
document.body.append(v38Dialog);

const v38Pages={
 impressum:{title:'Impressum',html:()=>`<h3>Medieninhaber und Betreiber</h3><address><b>${escapeHTML(v38Owner.name)}</b><br>${escapeHTML(v38Owner.address)}<br><a href="mailto:${escapeHTML(v38Owner.email)}">${escapeHTML(v38Owner.email)}</a></address><h3>Inhaltliche Ausrichtung</h3><p>SECHSER ist ein kostenloses Fußballmanager-Browserspiel. Die Seite informiert über das Spiel und stellt es zur Nutzung bereit.</p><p>Die Credits im Spiel sind eine fiktive Spielwährung. Es finden darüber keine Echtgeldzahlungen statt.</p>`},
 datenschutz:{title:'Datenschutz',html:()=>`<h3>Verantwortlicher</h3><p>${escapeHTML(v38Owner.name)}, ${escapeHTML(v38Owner.address)}. Kontakt: <a href="mailto:${escapeHTML(v38Owner.email)}">${escapeHTML(v38Owner.email)}</a>.</p><h3>Aufruf der Website</h3><p>Die Seite wird bei World4You Internet Services GmbH gehostet. Bei einem Aufruf verarbeitet der Webserver technische Verbindungsdaten, insbesondere IP-Adresse, Zeitpunkt, angeforderte Adresse und Browserangaben, um die Seite auszuliefern und den Betrieb zu sichern. Grundlage ist das berechtigte Interesse am sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Angaben zur Verarbeitung durch den Hoster stehen in dessen <a href="https://www.world4you.com/datenschutzerklaerung" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.</p><h3>Spielstände auf deinem Gerät</h3><p>Spielstände und die Wahl zur Datenübertragung werden im lokalen Speicher deines Browsers abgelegt. Spielstände werden nicht an den Spielserver übertragen. Du kannst einzelne Spielstände im Startbildschirm löschen oder exportieren. Beim Löschen der Website-Daten im Browser verschwinden auch die lokal gespeicherten Spielstände und Einstellungen.</p><h3>Freiwillige Spielstatistiken</h3><p>Nur wenn du „Spieldaten teilen“ aktivierst, sendet das Spiel nach einem Match Ergebnis, Taktik und Spielerstatistiken an den eigenen Server. Die gesendeten Daten enthalten keine Vereins- oder Spielernamen und keine dauerhafte Nutzerkennung; pro Match wird eine zufällige Kennung erzeugt. Die Statistikdatei enthält keine IP-Adresse. Bei der HTTP-Übertragung verarbeitet der Hoster die IP-Adresse technisch. Grundlage der freiwilligen Übertragung ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit unter „Cookies & Speicher“ für künftige Spiele widerrufen. Die bis dahin erfolgte Verarbeitung bleibt rechtmäßig.</p><p>Statistikdateien, die älter als 90 Tage sind, werden beim nächsten Eingang einer Spielzusammenfassung gelöscht. Da die Datensätze keine dauerhafte Nutzerkennung enthalten, können bereits übertragene Zusammenfassungen nicht zuverlässig einem Spielstand zugeordnet und einzeln entfernt werden.</p><h3>Empfänger und Rechte</h3><p>World4You erbringt das Hosting. Im Spielcode werden keine Werbe- oder Analyseangebote Dritter eingebunden. Du kannst dich wegen Auskunft, Berichtigung, Löschung, Einschränkung oder Widerspruch an die oben genannte E-Mail-Adresse wenden. Außerdem besteht ein Beschwerderecht bei der <a href="https://dsb.gv.at/eingabe-an-die-dsb/beschwerde" target="_blank" rel="noopener noreferrer">österreichischen Datenschutzbehörde</a>.</p><p><button type="button" class="legal-inline" data-legal-page="speicher">Cookies und Speichereinstellungen ansehen</button></p>`},
 speicher:{title:'Cookies & Speicher',html:()=>`<h3>Was wird gespeichert?</h3><p>Der Spielcode setzt keine Cookies. Für Spielstände nutzt SECHSER den lokalen Speicher des Browsers (Local Storage). Dort liegt auch deine Wahl zur freiwilligen Übertragung von Spielstatistiken. Spielstände kannst du im Startbildschirm einzeln löschen; die Übertragungswahl kannst du jederzeit ändern. Beim Löschen der Website-Daten im Browser verschwinden beide Einträge.</p><p>Für das Spielen und Speichern auf diesem Gerät ist keine Zustimmung zur Übertragung von Spielstatistiken nötig. Ohne ausdrückliche Aktivierung bleibt sie ausgeschaltet.</p><h3>Freiwillige Spielstatistiken</h3><p>Mit „Spieldaten teilen“ erlaubst du die Übertragung künftiger Match-Zusammenfassungen an den eigenen Server. Mit „Nur lokal spielen“ widerrufst du diese Wahl jederzeit für künftige Spiele.</p><div class="privacy-actions"><button type="button" class="menu-action" data-legal-consent="yes">Spieldaten teilen</button><button type="button" class="menu-action" data-legal-consent="no">Nur lokal spielen</button></div><p id="legal-consent-status" role="status"></p><p><button type="button" class="legal-inline" data-legal-page="datenschutz">Datenschutzhinweise lesen</button></p>`}
};

function v38UpdateConsent(){
 const enabled=analyticsEnabled(),status=v38Dialog.querySelector('#legal-consent-status');
 if(status)status.textContent=enabled?'Spieldaten teilen ist aktiviert.':'Nur lokal spielen ist aktiv.';
 for(const button of v38Dialog.querySelectorAll('[data-legal-consent]'))button.setAttribute('aria-pressed',String((button.dataset.legalConsent==='yes')===enabled))
}
function v38OpenLegal(page){
 const entry=v38Pages[page];if(!entry)return;
 v38Dialog.querySelector('#legal-title').textContent=entry.title;
 v38Dialog.querySelector('.legal-dialog-content').innerHTML=entry.html();
 if(!v38Dialog.open)v38Dialog.showModal();
 v38Dialog.querySelector('.legal-dialog-inner').scrollTop=0;
 v38UpdateConsent()
}
v38Nav.addEventListener('click',event=>{const page=event.target.closest('[data-legal-page]')?.dataset.legalPage;if(page)v38OpenLegal(page)});
v38Dialog.addEventListener('click',event=>{
 if(event.target.closest('.legal-dialog-close')){v38Dialog.close();return}
 const page=event.target.closest('[data-legal-page]')?.dataset.legalPage;if(page){v38OpenLegal(page);return}
 const consent=event.target.closest('[data-legal-consent]')?.dataset.legalConsent;if(!consent)return;
 try{localStorage.setItem(CONSENT_KEY,consent)}catch{v38Dialog.querySelector('#legal-consent-status').textContent='Die Auswahl konnte nicht gespeichert werden.';return}
 consentStatus();v38UpdateConsent()
});

startScreen.querySelector('footer')?.insertAdjacentHTML('beforebegin','<section class="panel legal-intro"><h2>Datenschutz & lokale Spielstände</h2><p class="help">SECHSER speichert Spielstände in deinem Browser. Freiwillige Spielstatistiken werden nur nach deiner Aktivierung übertragen. Der Spielcode setzt keine Cookies.</p><button type="button" class="menu-action" id="legal-details">Hinweise und Einstellungen ansehen</button></section>');
startScreen.querySelector('#legal-details').onclick=()=>v38OpenLegal('speicher');
const v38ShareText=startScreen.querySelector('#share-yes')?.closest('.panel')?.querySelector('.help');
if(v38ShareText)v38ShareText.textContent='Freiwillig: Nach jedem Match werden Ergebnis, Taktik und Spielerstatistiken an den eigenen Server gesendet. Ohne Vereinsnamen, Spielernamen oder dauerhafte Nutzerkennung. Mehr dazu unter Datenschutz.';
const v37RenderCenterV38=renderCenter;
renderCenter=function(){const result=v37RenderCenterV38();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 38');return result};
startScreen.querySelector('footer').textContent='SECHSER / PROTOTYP 38';
