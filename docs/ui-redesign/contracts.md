# Flutlicht – UI-Vertrag v1.2

Freigabe: I00, 7. Oktober 2026. Browser-Integration in den bestehenden Vereinswelt-Code, klassische Scripts unter `window.D6Flutlicht`. Neue Namen sind ab dieser Lieferung verbindlich; einzelne Produzenten werden vor Paketstart ergänzt. Keine zweite Fach- oder Speicherautorität.

## Rahmen und Komponenten

`components` exportiert `escape`, `icon(name)`, `skill({label,band,colorLabel})`, `form({band,label,compact=false})`, `freshness({percent,band,label})`, `award({kind,label})`, `status({tone,label})`, `result({outcome,label,detail})`, `installTooltips(root)` (liefert Cleanup). `compact` zeigt nur den zugänglich beschrifteten Smiley mit Tooltip.

Fähigkeitsbänder sind ausschließlich `violetgray`, `bluegray`, `yellow`, `orange`, `pink` oder ein ausdrücklich unbekannter Zustand. Keine exakten Fähigkeiten, Talentwerte, Entwicklungspunkte oder internen Spielerobjekte. Zahlen sind für Frische, Alter, Geld und erfasste Statistik zulässig. Texte werden escaped; Typen/Bänder sind Allowlisten.

`shell.mount(emptyHost, projection, actions)` liefert `{update(projection), unmount(), content}`. I00 erstellt den leeren Host innerhalb des bestehenden Welt-Screens und verschiebt vorhandene Ansichtsknoten nach `content`, ohne Klonen oder Verlust ihrer Listener. Die Shell greift weder auf Karriereglobals noch auf Storage/RNG zu.

Rahmenprojektion: `{clubName,clubMeta,clubCrestHTML,managerLabel,titles:[{kind,label}],navigation:[{id,label,icon,active,disabled}],activeRoute,leadAction:{label,disabled,reason},themePreference,labels:{brand,menu,close,skip,navigation,manager}}`. `clubCrestHTML` ist ausschließlich bereits lokal erzeugtes, vertrauenswürdiges Wappen-SVG. Alle anderen Texte werden escaped.

Aktionen: `navigate(id)`, `lead()`, `themeChanged(preference)`. Präferenz `system|light|dark`; Standard `system`. I00 speichert ausschließlich diese unabhängige Darstellungseinstellung unter `doppel6.ui.flutlicht.theme` in LocalStorage mit Fehlerbehandlung; Spielstände bleiben unverändert. Gerätewechsel setzt keine Filter oder Phase zurück. Manueller Wechsel erscheint nur in Hilfe & Einstellungen.

Shell-Stilgrenzen: `.fl-shell[data-fl-theme=light|dark]`, `.fl-content`; bestehende Welt-Dialoge erhalten `.fl-dialog` und denselben Themezustand. Der später ausdrücklich beauftragte Match-/Taktikstil verwendet `.fl-match[data-fl-theme=light|dark]`, ohne die Shell um native Matchknoten zu legen oder ihre Aktionen zu ersetzen.

## Ansichten und Integration

### Freigabe U01-A/B/C

U01-R ist mit 16 Fixturefällen geprüft; gemeinsamer Zugriff `node work/ui-redesign/run.cjs --package ID --target fixture` funktioniert. Pakete ergänzen ihre spezifischen Randfixtures in den eigenen Prüfpfaden.

`overview={fixture:null|{dateLabel,seasonLabel,competitionLabel,roundLabel,home:{id,name,crestHTML,rankLabel,recent:[{outcome,label,detail}]},away:same},sponsor:null|{name,logoHTML,goals:[{label,bonusLabel,onCourse,achieved,paid}]}}`. Produzenten: nächstes eigenes offenes Fixture aus `v62Fixtures`, Ränge `v62FixtureRankLabels`, letzte fünf erfasste Ligaspiele nach Saison/Tag, Sponsor `club.sponsors/club.sponsorId`, `v66SponsorMet` und vorhandene Ledgerkeys. Rangziel erst nach Ligabeendigung endgültig. Bestehende Phasen-/Finanz-/Rückblickbereiche erhalten.

`players={season,ownClubId,roster:[row],all:[row]}`; row: `{id,name,number,nationCode,nationLabel,positionCode,positionLabel,age,skills:[{key,label,band,colorLabel}],form:{band,label},freshness:{percent,band,label},stats:{appearances,substitutions,goals,assists,averageRating,ratedGames,substitutionCoverage}}`. `all` enthält Profis, Nachwuchs, freie und ehemalige Spieler. B verwendet roster für Kader und all für Profile, C all für seine Karten. `v55SkillEntries` nur auf Kopie, Band aus `v55SkillBand`; Form `v51EffectiveForm` mit expliziter Frische. Statistik aus tatsächlich erfasster Saisonhistorie, Einwechslungen bei unvollständiger Abdeckung null. Views besitzen keine Rohspieler. Zulässige Aktionen B/C vorerst ausschließlich bestehende DOM-Aktionen und `t`; zusätzliche Filter dürfen ausschließlich vorhandene DOM-Zeilen ausblenden. Keine fachliche Änderung.

### Erweiterung v1.1 — D/E/F

Kontext zusätzlich `competitions`; `club` ist jetzt konkret. Die vorher freigegebenen A/B/C-Felder bleiben gleich. Vor der Schlussabnahme werden Projektionen unabhängig gegen diese Allowlist geprüft.

`competitions={tables:[{id,rows:[{clubId,wins,draws,losses,goalsFor,goalsAgainst}]}],report:null|{id,title,contextLabel,home:{id,name},away:{id,name},scoreLabel,penaltiesLabel,teamStats:null|[{label,home,away}],events:null|[{minuteLabel,text}],lineups:null|{home:[{id,name}],away:[{id,name}]},substitutions:null|[{minuteLabel,teamLabel,out:{id,name},in:{id,name}}],players:null|[{id,name,teamLabel,stats:[{label,value}]}],awards:null|[{kind,label,playerId}]}}`. Tabellen aus `v62Table`, Berichte ausschließlich aus gespeicherten `fixture.result/matchRecord/lineups/switches`. Fehlende Teile einschließlich verlorener Live-Berichte null, keine Rekonstruktion. Kalender-/Ergebnisnodes tragen `data-fl-fixture-id`, Tabellen `data-fl-competition-id`. Aktionen `openReport(id)`, `closeReport()` ändern ausschließlich Adapter-Auswahl; `openPlayer(pid,button)` delegiert an `v61OpenProfile`.

`club={ownId,profiles:[{id,records:{coverageLabel,goals:[{playerId,name,value,rank,profileAvailable}],appearances:[same]},lastLineup:null|{season,dateLabel,competitionLabel,opponentName,players:[{playerId,name,number,positionLabel,profileAvailable}],olderThanLastMatch}}]}`. Profile: eigener und aktuell geöffneter Verein; Detailnode `data-fl-club-id`. Toplisten aus gespeicherten `player.seasons` plus nur nicht bereits zusammengefasster `history` für diesen Verein; ehemalige/freie Spieler einbeziehen soweit erhalten, gleiche Werte gleicher Rang, feste Namens-/PID-Reihenfolge. Älteste Lücken und gelöschte Spieler ausdrücklich ausgenommen. Elf nur aus aufgezeichneten Starterlisten einer abgeschlossenen Partie. Heutige Spielernummer/Position nicht als historische Angaben ausgeben. Neue Profilbuttons behalten `data-v68-player`.

`settings={themePreference,language}`. F erzeugt genau eine anfangs passend versteckte Ansicht `settings` im `.fl-content`. Bestehende Inputs bei Aktualisierung erhalten. `setLanguage(language)` delegiert an `doppel6Language.set`; `manageCareers()` wartet auf `v61ShowStart` einschließlich Speicherung/Fehler; `openHelp()` auf `D6ThreeHelp.open`; `openLegal(id)` nur `impressum|datenschutz|speicher` an `v38OpenLegal`. Theme über bestehenden Shell-Delegaten `data-fl-theme-preference-control`. Keine zweite Karriereverwaltung oder Speicherung.

`registry.register({id,enhance(root,projection,actions)})` registriert genau ein Paket. `enhance` erhält vorhandenen DOM und ausschließlich bereinigte Daten. Es ist idempotent: keine doppelten Abschnitte/Handler bei wiederholtem Aufruf; vorhandene IDs und delegierte Aktionsattribute bleiben erhalten. Rückgabewert optional Cleanup. Paket-CSS und zusätzliche DOM-Marker verwenden eigene `fl-<bereich>`-Namensräume.

I00 liefert `adapter.project(career)` als JSON-fähige Allowlistprojektion und `adapter.refresh()`. Nur der Adapter liest rohe Karriere-/Spielerobjekte. Kontext enthält `frame`, `players`, `overview`, `club`, `settings`; konkrete Paketfelder werden vor Freigabe dokumentiert. Fehlend/unbekannt bleibt `null` oder ausdrücklich nicht erfasst, niemals aus fehlenden Altwerten erfundenes Nullergebnis.

Zusätzliche Paketaktionen sind vom Integrator freigegebene Controlleraufrufe; vorhanden gebundene DOM-Aktionen bleiben der vorrangige Weg. `actions.t(text)` verwendet ausschließlich den bestehenden Sprachpfad. Neue DE/EN-Labels werden vom Integrator in `i18n-v75.js` aufgenommen. Navigation erhält aktuelle Auswahl; Browser-Zurück/Vorwärts wird als UI-Zustand geführt, ohne Spielphasen zurückzudrehen.

Änderungen an diesem Vertrag erfolgen nur durch I00 mit betroffenen Paketen und gezielter Wiederholungsprüfung. Lokale Fixtures belegen Renderer, echte Quell-/Buildprüfungen belegen Integration und Aktionen.


## Erweiterung v1.2: Nutzerbesichtigung vom 8. Oktober 2026

`overview` ergänzt `kpis:[{label,value,detail?}]`, `office:[{id,title,detail,route,section,actionLabel}]` und `finance:{balanceLabel,rows:[{label,valueLabel,tone?}],note}`. Rang/Punkte aus v62Table, Kontostand und Kaderzahl aus dem aktuellen Verein, Fristen/Angebote aus Verträgen und Markt, Finanzprognosen ausschließlich aus dem bestehenden v124FinancePlan für Zahlungsplanwelten. Keine neue Buchung oder Prognoseannahme für Altstände.

`navigation={squad,transfers,competition,transferBalanceHTML}` enthält ausschließlich Unterbereichswahl und native lesende Transferhistorie. Kader roster/contracts/youth; Transfers search/listed/own/offers/balance; Wettbewerbe league/cup/europe/countries/archive. `club` ergänzt `activeSection` profile/finances/sponsor/history/manager und `sponsorHTML` als lesenden aktuellen Sponsorvertrag. Offene Sponsorpflichtwahl bleibt am vorhandenen Übersichtscontroller. Aktive Unterbereiche und Browserhistorie sind flüchtiger UI-Zustand; Filter/Originalknoten bleiben beim Umschalten erhalten.

Aktionen `navigate(route,{section})`, `setSection(route,section)`, `setClubSection(section)` ändern Darstellung und Verlauf; vorhandene Profil-/Vertragsrückwege aktivieren den richtigen Unterbereich. `navigation.select(route,section,{focus})` und `clubView.select(panel,section,{focus})` sind reine Darstellungshilfen. Kalender/Statistik verwenden Allowlistmarker aus ihren echten Wettbewerben, keine geratene Text-/Rendererreihenfolge.

`frame.leadAction` ergänzt `busy`, `processingLabel`, `progressLabel`; `frame.labels.actionFailed` liefert den bekannten Fehlertext. Hauptaktion sperrt sofort Mehrfachklicks, lässt die Ladeanzeige zeichnen und wartet auf den bestehenden Controller beziehungsweise dessen Busyabschluss. Kein erfundener prozentualer Fortschritt. Reduzierte Bewegung erhält die Textmeldung.

Startseite/Vereinserstellung übernehmen Tokens und Geräteschema mit bestehender manueller Präferenz. Native IDs, Eingaben, Seeds, Speicheraktionen und Fehlerversuche bleiben unverändert. Keine zweite Karriereverwaltung. Quell- und Offline-Buildprüfungen verwenden eigene Profile.

Weitere Besichtigung: Spielerzeilen ergänzen `formRatings:number[]|null` ausschließlich aus dem gespeicherten letzten Formfenster (bis zu fünf gültige Noten 1–10, älteste zuerst). Keine Herleitung aus Saisonmitteln, keine historischen Ersatznoten. Saison-Durchschnitt und einzelne Formnoten werden getrennt beschrieben; Zahlen sind Matchstatistik, keine Fähigkeitswerte. Büro-/Kalenderkompaktheit verändert nur Darstellung. `D6Flutlicht.match.refresh()` wendet die bestehende Themenpräferenz auf native Matchflächen an und ergänzt deren bestehende Registerkarten um Tastatur-/ARIA-Verhalten. Rolle, Aufstellung, Matchregeln und Speichercontroller bleiben unverändert; P05 bleibt ein eigener Auftrag.
