# C02: private Adminstatistik, Entwurf 1

Stand: 9. Oktober 2026. Der ausdrückliche Nutzerstart erlaubt den Vertragsvorlauf parallel zur vorrangigen 3D-Arbeit. Dieses Dokument ist ein **technischer Vorschlag**, keine implementierte API, Datenerfassung oder Authabnahme. Produktentscheidungen stammen aus [C01/C02-Aufträgen](../agentenauftraege/04-accounts-adminstatistik.md), [Account-/Statistikplan](../account-admin-statistik-plan.md) und [Produktregeln](../product.md). Gemeinsame Identität und Rechte stehen in [C01](account-contract.md); offene Anbieter-/Betriebsgates in [Vorlauf](account-preflight.md).

## Berechtigungen und Herkunft

C02 verarbeitet ausschließlich neue, serverseitig dem authentifizierten echten Nutzeraccount zugeordnete Karrieren. Altkarrieren bleiben ausgeschlossen, einschließlich Import, Umbenennung oder nachträglicher Zuordnung. Titel sämtlicher KI-Vereine und zusätzliche Einzelspielerprofile gehören nicht zur Accountstatistik. Der Ingestiondienst nimmt Eigentümermeldungen an; die private Adminansicht ist separat ausschließlich lesend. Statistik- und Exportanfragen verwenden bei jeder Route dieselbe zentrale Rechteprüfung. C02 interpretiert kein `adminFlag` und baut keine zweite Authautorität.

Vor Annahme eines Karriere- oder Zeitbeitrags prüft C01 zentral die aktuelle Account-/Elternberechtigung. Pending, Ablehnung oder Widerruf unter 14 verhindern direkte API-Umgehung. Die Prüfung darf nicht nur vor dem Request oder nur in der UI erfolgen; Repositorycommit muss mit paralleler Löschung/Widerruf konsistent sein. Normale Nutzer erhalten keine fremden Accountdaten, Rangliste oder Gesamtübersicht. Adminrecht zum Lesen verleiht keine Berechtigung, fremde Statistik hochzuladen oder Saves zu verändern.

Jede gespeicherte Auswertung bleibt `origin:'client_reported'`. Form-, Größen-, Rechte- und Plausibilitätsprüfungen machen daraus keinen manipulationssicheren Sportnachweis. Serverzeit bestätigt die Übertragung, nicht das Spielergebnis. Keine öffentliche Hall of Fame oder serververifizierte Ranglistenwertung ableiten.

## Vorschlag: Modulgrenzen und Serviceport

```ts
interface StatisticsPort {
  ingestCareer(ctx: AuthContext, dto: CareerStatisticsSnapshot): Promise<UploadReceipt>;
  ingestUsage(ctx: AuthContext, dto: UsageContribution): Promise<UploadReceipt>;
  archiveCareer(ctx: AuthContext, dto: CareerArchiveRequest): Promise<UploadReceipt>;
  readOverview(ctx: AuthContext, filters: AdminFilters): Promise<AdminOverview>;
  readAccount(ctx: AuthContext, accountId: string): Promise<AdminAccount>;
  readCareer(ctx: AuthContext, careerId: string, filters: AdminFilters): Promise<AdminCareer>;
  readRanking(ctx: AuthContext, page: PageRequest): Promise<AdminRanking>;
  exportCsv(ctx: AuthContext, selection: ExportSelection): Promise<PrivateCsv>;
  applyAccountDeletion(event: AccountDeletionEvent): Promise<void>; // serverinterner Outboxweg
}
```

Alle Typen sind Vertragsnotation. Routen-, Repository- und Serializerdateien bleiben Integratorbesitz. `applyAccountDeletion` ist kein vom Browser anwählbarer Adminendpunkt. Vorgeschlagenes Repositoryverfahren: account-/karrierebezogener Lock oder gleichwertige Transaktion über Rechteversion, Eigentümerprüfung, deduplizierte Ereignisse, aktuellen Snapshot, Aggregate und Quittung.

## Positivallowlist für Karriere-Uploads

Vorschlag für ein ersetzendes kumulatives Snapshotmodell: Events einer neuen bestätigten Revision werden nach stabilen fachlichen IDs gespeichert; Gesamtzahlen werden daraus abgeleitet und **nicht zusätzlich als additive Zähler** angenommen. Arrays enthalten nur tatsächlich erfasste Managerhistorie der angegebenen Karriere. Ein unvollständiger Quellverlauf trägt eine Lückenkennzeichnung. Nachträgliche Rekonstruktion ist kein Teil dieses Modells.

| Feld | Typ/Inhalt | Zweck und Herkunft |
| --- | --- | --- |
| `schemaVersion` | `1` | Exakte freigegebene Allowlist; unbekannte Version ablehnen |
| `careerId` | serverzugeordnete Kennung | Eigentümer aus zentralem Registryvertrag prüfen; kein Client-Accountfeld |
| `ruleVersion`, `sourceVersion` | freigegebene Versionskennungen | Erfassungsstand anzeigen; nicht als Eigentumsbeweis verwenden |
| `sourceRevision` | positive, streng geordnete Ganzzahl | Bezug auf dauerhaft bestätigten lokalen Zustand |
| `checkpointId` | stabile Kennung des sicheren lokalen Speicherpunkts | Keine halb verbuchte Partie oder noch laufende Schreibpromise übertragen |
| `completionId`, `completionKind` | stabiler Abschlussbezug; `match`/`season` | Automatik nach vollständigem Spiel-/Saisonabschluss |
| `requestId` | stabil pro immutable Uploadauftrag | Retry nach verlorener Antwort; keine neue ID bei jeder Wiederholung |
| `origin` | exakt `client_reported` | Sichtbare Aussage zur Vertrauensgrenze |
| `configuration` | `{fieldSize:'standard'|'large', fieldPlayers:5|6}` | Varianten getrennt auswertbar, nur aus gespeicherter neuer Karriere |
| `coverage` | unten definierter Umfang | Unbekannt von nachweislich null unterscheiden |
| `titles[]` | `TitleDTO` unten | Titelzuordnung und private Karrierewertung |
| `matches[]` | `MatchDTO` unten | Endgültige Matchbilanz und Saison-/Wettbewerbsfilter |
| `financeSeasons[]` | optionaler Vorschlagsblock unten | Account-/karrierebezogene Saisonfinanzen; erst nach Kennzahlenfreigabe |
| `developmentSeasons[]` | optionaler Vorschlagsblock unten | Zulässige qualitative Mannschaftsentwicklung; erst nach Kennzahlenfreigabe |

`accountId`, Rollen, Elternstatus, IP/E-Mail, Auth-/Provider-/Sessionsecrets, Elternkontakt, Rohsave, RNG-/Live-Matchzustand und Browserablagedumps sind keine Uploadfelder. Exakte Fähigkeiten, Entwicklungspunkte, individuelle Fähigkeitsobergrenzen, verborgenes Talent oder daraus abgeleitete Talentkategorien sind ausgeschlossen. Auch Fehler-/Debug-/Logpfade verwenden diese Daten nicht. Vorschlag: unbekannte Felder strikt ablehnen statt Payloads still weiterzuspeichern. Sämtliche numerischen Felder müssen endlich, passend ganzzahlig und im zentral freigegebenen Größenrahmen liegen; Größen-/Text-/Arraylimits sind Konfigurationsgate.

### Untertypen und Datenlücken

`coverage = {recordingStartedAt, throughCheckpointId, completeness:'complete_since_start'|'partial', gaps[]}`. `recordingStartedAt` ist tatsächlich bekannter Beginn, keine rückgeschätzte Zeit. Vorgeschlagene Lückenfelder: `{domain:'titles'|'matches'|'finance'|'development', seasonId:string|null, reason:'not_recorded'|'manager_unknown'|'competition_unknown'|'season_unknown'|'final_outcome_unknown'}`. Unbekannte Daten bleiben als Lücke erkennbar. Die Auswahl „Gesamte Karriere“ darf eine Teilhistorie nicht vollständig nennen.

`TitleDTO = {titleId, seasonId, competitionId, category:'league'|'cup'|'europe', winnerClubId, managedClubAtAward, ruleVersion}`. Es werden nur Titel eingereiht, bei denen der menschliche Nutzer **bei endgültiger Vergabe** Trainer des Siegervereins ist. `managedClubAtAward == winnerClubId`; heutiger Verein ersetzt diese historischen Angaben nicht. Fachlicher Vorschlag für `titleId`: kanonischer Bezug aus Karrierekennung, eindeutiger Wettbewerbkennung und Wettbewerbssaison; Namens-/Uploadzeitgleichheit erzeugt keinen Titelbezug. Finaler Entscheidungszeitpunkt kommt aus dem vorhandenen Abschlussereignis, nicht aus der Serverannahme. Die endgültige Identitätskonvention gibt der Integrator frei.

`MatchDTO = {matchId, seasonId, competitionId, category:'league'|'cup'|'europe', managedClubId, opponentClubId, outcome:'win'|'draw'|'loss', resolution:'regular'|'extra_time'|'penalties', goalsFor:number|null, goalsAgainst:number|null, ruleVersion}`. Nur tatsächlich betreute Managerpartien mit endgültigem Ergebnis zählen. Ein Elfmeterschießen mit bekanntem endgültigem Sieger liefert `win` oder `loss`, nie zusätzlich `draw`. Unbekannter Finalausgang wird als Lücke geführt und nicht in die vollständige Bilanz gezählt. Unklare Saison/Kategorie ist ebenfalls keine geschätzte Bilanzzeile. Vorschlag `matchId`: karrieregebundene gespeicherte Matchkennung, nicht Spielername oder Ergebnistext. Ergebnisauflösung muss mit dem gespeicherten finalen Matchausgang übereinstimmen; keine neue Matchregel einführen.

**Optionale Kennzahlvorschläge, nicht Produktfreigabe für einzelne Felder:**

- `FinanceSeasonDTO = {seasonId, managedClubId, closingBalanceCredits:number|null, incomeCredits:number|null, expenseCredits:number|null, completeness}`. Nur bestätigte periodengerechte Daten für während der Saison tatsächlich betreute Vereine; Clubwechsel klar trennen. Fehlende bereits gebuchte Summen bleiben null, keine doppelte Summierung über aktuelle Bilanz plus Finanzereignisse. Kreditzahlen sind Finanzstatistik, keine verdeckten Fähigkeiten. Keine detaillierten Verträge/alle KI-Bilanzen vorsorglich übertragen.
- `DevelopmentSeasonDTO = {seasonId, managedClubId, recordedRosterCount, abilityBandCounts[], completeness}` mit `abilityBandCounts[] = {abilityId, violetGray, blueGray, yellow, orange, pink}`. Dieser Vorschlag zählt ausschließlich bereits zulässige sichtbare Fähigkeitsfarbstufen der betreuten Mannschaft an tatsächlich erfassten Saisonständen. Es entstehen keine einzelnen Spielerprofile, Spieler-IDs, Lernpunkte, Potenzial- oder Talentfelder. `abilityId` kommt aus dem freigegebenen sichtbaren Fähigkeitensatz; alle Bandanzahlen sind nichtnegative Ganzzahlen, Summe je Fähigkeit passt zum tatsächlich erfassten Kaderumfang. Fehlende Saisonstände bleiben unbekannt; Unterschiede werden nicht rückgerechnet. Vor Freigabe bleiben diese Blöcke deaktiviert/fehlend.

Bei partiell bekannten Daten ist `null`/Lücke nicht gleich Nullwert. Beispiel: keine aufgenommenen Titel in einer vollständigen ab Start geführten Karriere ergibt 0 Titel; fehlende Trainerhistorie ergibt eine Zuordnungslücke statt des Beweises, dass kein Titel gewonnen wurde.

## Reihenfolge, Retry und Archivierung

Vorschlag: serverseitiger kanonischer Hash des erlaubten DTO, Schlüssel `(accountId, careerId, requestId)` und Snapshotversion `(careerId, sourceRevision)`. Der Hash wird serverseitig aus validierten Feldern berechnet; ein hochgeladener Clienthash ist kein Integritätsnachweis.

| Eingang | Ergebnis |
| --- | --- |
| Derselbe Request mit identischem erlaubtem Inhalt | Bestehende Quittung zurückgeben; keine zweite Zeile/Aggregataddition |
| Derselbe Request mit anderem Inhalt | `idempotency_conflict`; kein Commit |
| Gleiche Revision mit anderem Inhalt, auch anderer Request-ID | `revision_conflict`; kein Commit |
| Ältere Revision als aktueller Stand | `stale_revision`; kein Rückschritt; aktuell bestätigte Revision aus eigener Quittung verfügbar |
| Neuere valide Revision | Aktuellen Snapshot transaktional ersetzen/merge nach festgelegtem Modell; Aggregate exakt aus dem aktuellen Bestand ableiten |
| Wiederholte fachliche Titel-/Match-ID | Gleiches Ereignis einmal zählen; anderer endgültiger Inhalt ist Konflikt |
| Archivierte Karriere, verspäteter normaler Upload | `career_archived`; Archiv und letzter bestätigter Titelstand unverändert |
| Gelöschter Account / falscher Eigentümer / fehlende Freigabe | Vor Wiederholung/Commit Rechtefehler; keine Reaktivierung |

Für den vorgeschlagenen kumulativen Snapshot darf eine neue Revision bereits bestätigte endgültige Titel/Matches nicht still entfernen oder umdeuten. Historische Korrekturen benötigen einen später separat freigegebenen Vertrag; die lesende Adminansicht ist kein Korrekturweg. Größen- und Historienwachstum ist vor Umsetzung zu prüfen; wenn ein Vollstatistiksnapshot das Limit erreicht, muss der Integrator einen paginierten/Delta-Vertrag freigeben, ohne summierten und ereignisbasierten Beitrag zu vermischen.

Vorschlag Quittung: `{requestId, status:'accepted'|'already_accepted', acceptedRevision, confirmedAt, careerState:'active'|'archived', origin:'client_reported'}`. `confirmedAt` kommt vom Server. Ein gespeichert lokaler Uploadauftrag bleibt so lange unquittiert, bis die tatsächliche Serverantwort denselben Auftrag bestätigt. Netzwerk-/Providerfehler stoppen nur die Übertragung, nicht gültiges Offline-Spiel. Fehler verwenden die C01-Hülle, zusätzlich `revision_conflict`, `idempotency_conflict`, `stale_revision`, `career_archived`, `invalid_snapshot`, `payload_too_large`.

`CareerArchiveRequest = {schemaVersion:1, careerId, requestId, localDeletionId}`. Die eigentliche lokale Karriere wird vom bestehenden sicheren Löschablauf entfernt; Server archiviert ausschließlich den **zuletzt bestätigten Titelstand**, Account-/Karrierebezug, Versions-/Aktualitäts-/Erfassungsdaten. Kein Rohsave und keine Wiederherstellung. Online noch nicht bestätigte offline Erfolge werden nicht geschätzt. Optional können zuvor bestätigte Uploadaufträge vor dem Archivauftrag seriell übertragen werden; bis dahin gilt nur der vorhandene Serverstand. Wiederholte Löschmeldung hat dieselbe Wirkung. Übernahme weiterer Match-/Finanzhistorie in das Archiv ist nicht automatisch erlaubt und bleibt Aufbewahrungsgate.

Archivierte Ranglistenstatistik bleibt bestätigt bis vollständiger Accountlöschung bestehen, ohne separates Ablaufdatum. Accountlöschung entfernt aktive und archivierte Einträge, private Caches und accountbezogene Aggregatbeiträge. Tombstones/Löschereignisse müssen auch nach Backuprestore greifen. Neue Anmeldung mit neuer Account-ID und verspätete Retries erben weder alte Zuordnung noch gelöscht geglaubte Beiträge. Technische Fristen/Backupbehandlung und Aufbewahrung sonstiger Daten sind vor Produktion festzulegen.

## Titelrang und Matchauswertung

Eine Karriere ist ein Ranglisteneintrag, mehrere Karrieren eines Accounts bleiben getrennt. `totalTitles = leagueTitles + cupTitles + europeTitles`, alle Titel gleichwertig. Sortierung absteigend nach Gesamttiteln, gleiche Summe erhält denselben Rang. Vorschlag zur noch offenen Rangnummernlücke: Wettbewerbsrang `rank = 1 + Anzahl Karrieren mit strikt mehr Titeln` (z.B. Summen 5,3,3,1 → Ränge 1,2,2,4); dichtere Ränge 1,2,2,3 sind alternativ offen. Stabile ID-Reihenfolge innerhalb eines Gleichstands darf Pagination reproduzierbar machen, aber **keinen Rangvorteil** oder Zusatzwertung erzeugen. Saison-/Wettbewerbsfilter betreffen Matchbilanz, nicht Gesamttitelrang.

Filtervorschlag: `{seasonId:string|null, competition:'all'|'league'|'cup'|'europe'}`; `null` heißt gesamte erfasste Karriere. Jede ausgewählte bekannte endgültige Partie gehört genau einer Kategorie an und zählt einmal. `games=wins+draws+losses`, `winRatePercent = games===0 ? null : wins/games*100`. Bei null Spielen „Noch keine Spiele“. Unvollständige Erfassung/ausgeschlossene unbekannte Historie wird daneben ausgewiesen. Gespeicherte Wettbewerbssaison ist maßgeblich, nicht Uploadzeit oder Kalenderjahr.

Referenz: Liga 30 Spiele/18 Siege, Pokal 6/5, Europacup 4/1 → insgesamt 40/24, also 60 Prozent. Gesamtquote wird aus Summen berechnet, nicht aus Mittelwerten der Kategoriequoten. Titelarten, Aktivitätszeit und Matchbilanz brechen keinen Titelgleichstand.

## Reale Accountspielzeit: separater Vorschlagsvertrag

Bestätigte Regel: sichtbare Vordergrundzeit in Menü/Match zählt. Ab fünf Minuten ohne Nutzereingabe wird pausiert, außer während eines tatsächlich laufenden Matches. Hintergrundtab, minimiertes Fenster, App im Hintergrund und pausierter Prozess zählen nicht. Ein pausiertes Match erhält die reguläre Fünf-Minuten-Regel; Rückschau/animierte Oberfläche alleine gelten nicht als laufendes Match. Die Integration muss diese konkreten Lifecyclezustände liefern. Keine reale Zeit aus Matchuhr/Spielerminuten ableiten und keine Vergangenheit rückschätzen.

Vorschlag `UsageContribution = {schemaVersion:1, requestId, usageSessionId, deviceId, sequence, accountEpoch, purposeVersion, measuredDurationMs, windowStartEstimateUtc, windowEndEstimateUtc, timeAnchorId, coverage:'measured'|'partial'}`. Account-ID und benötigte Elternberechtigung kommen serverseitig aus C01. Keine Klicks, Mauswege, URLs, Rohinputs oder IP/E-Mail im DTO. Gerätekontext dient nur Bindung/Entdoppelung und wird nicht im Admin-/CSV-Datensatz offengelegt. Angeblicher Zeitraum und Dauer sind clientgemeldet; `timeAnchorId` verweist auf bestätigte zentrale Zeitankerkonvention. C01-Sitzungskennung ist keine Spielzeit-Sitzungskennung.

Jeder Beitrag enthält nur gemessene, dauerhaft gepufferte reale Dauer eines zusammenhängenden aktiven Fensters. Sichtbarkeits-/Idle-/Accountwechsel teilen Fenster; inaktive Lücken sind kein Teil der behaupteten aktiven Zeitspanne. Vorschlag: monotone Laufzeitquelle, unterbrochene Timerintervalle verwerfen statt große nachgeholte Zeit zählen. Crash vor dauerhafter Pufferung hinterlässt eine sichtbare Erfassungslücke, keine nachträglich ergänzten Sekunden. Mess-, Puffer-, Übertragungstakt und maximale tolerierbare Lücke sind offene Parameter. Erfassung ist nur bei gültiger Zugang-/Elternberechtigung aktiv und endet bei Abmeldung, Kontowechsel oder Ablauf. Alte Aufträge behalten ihren Account-/Epochbezug; sie dürfen nicht unter einem neuen Konto gesendet werden.

**Mehrfachzählung ist ein Implementierungsgate:** Vorgeschlagen ist eine geräteweite Vordergrund-Messzuständigkeit für parallele Tabs, serverseitig deduplizierte Beitrags-IDs und Zusammenführung überlappender Messfenster **als persönliche Zeitvereinigung statt Summe**. Beitrags-ID allein verhindert keine Doppelzählung verschiedener paralleler Sitzungen. Geräteübergreifender Offlinebetrieb, unsichere Wanduhranker und geteilt gemessene Intervalle benötigen einen gemeinsam freigegebenen Algorithmus. Bis dahin keine einfache Summe aller Gerätebeiträge und keine Behauptung sekundengenauer, manipulationssicherer Personenspielzeit. Unauflösbar überlappende Zeit bleibt als unklare Erfassung markiert, nicht heimlich voll addiert.

Im Adminbereich erscheinen nur bestätigte Accountspielzeit, Erfassungsbeginn und letzter Übertragungsstand. Nicht erfasste Zeit ist unbekannt, nicht null. Gesamtspielzeit ist Summe der nach freigegebenem Überlappungsverfahren bestätigten Accountzeiten über erfasste Accounts. Spielzeit ist keine Titelwertung.

## Eigenständige Allowlist für Adminantworten

Adminantworten projizieren erlaubte Statistikdaten neu; sie serialisieren keine Repositoryobjekte direkt. Vorschlag:

- Gemeinsame Hülle: `{contractVersion, origin:'client_reported', generatedAt, coverage, filters?, pagination?}`.
- Accountübersicht: `{accountId, displayName?, careers:[careerId], confirmedUsageMs:number|null, usageRecordingStartedAt:string|null, lastUsageConfirmedAt:string|null}`. E-Mail, Alter, Elternkontakt/-status, Provider-/Session-/Gerätekennungen werden nicht an C02-Adminansicht gegeben.
- Karriereübersicht: `{accountId, careerId, archiveState, ruleVersion, sourceVersion, configuration, sourceRevision, checkpointId, lastConfirmedAt, coverage, titles:{total,league,cup,europe}, matchBalance:{games,wins,draws,losses,winRatePercent}, seasonIds[]}`. Optionale freigegebene Finanz-/Farbstufenverläufe und vorhandene endgültige Ergebniszeilen verwenden nur ihre eigene oben beschriebene Allowlist.
- Ranglistenzeile: `{rank,accountId,displayName?,careerId,archiveState,totalTitles,leagueTitles,cupTitles,europeTitles,lastConfirmedAt,coverage}`. Kein zusammengezogener Accounttitelrang.
- Gesamtübersicht: vorgeschlagen `recordedAccounts`, `recordedCareers`, `recordedCompletedMatches`, `confirmedUsageMs` mit klarer Erfassungs-/Archiv-/Zeitdefinition. „Registrierte Accounts“ wäre eine separate C01-Repositoryzahl; „aktive Accounts“ erfordert einen freigegebenen Zeitraum/positiven Nutzungsbezug und wird nicht aus Seitenladungen/Uploadhäufigkeit geraten. Weitere Aggregat-/Versionsfilter bleiben zu entscheiden.

`lastConfirmedAt` bezeichnet letzten akzeptierten Upload, nicht aktuellen lokalen Stand. Für veraltete Zustände zeigt die UI Datum/Alter, nie eine garantierte Liveaktualität. Ein optionaler „veraltet“-Schwellwert ist ein offener Anzeigeparameter. Statistikzahlen dürfen numerisch erscheinen; Fußballfähigkeiten ausschließlich als Farbstufen. Keine Detailansicht aller KI-Vereine/individueller Fußballspieler hinter einem Link ergänzen.

## Privater CSV-Export: konkreter Formatvorschlag

Der Export verwendet dieselbe zentrale Adminberechtigung und Datenprojektion wie die gewählte Ansicht, inklusive Saison-/Wettbewerbsfilter. Er erzeugt keine öffentlich zugängliche Datei/URL. Vorschlag: Anfragegebundener Download, private/no-store-Antwort, keine Rohpayloadlogs; endgültige Router-/Cachekonfiguration zentral prüfen.

Formatvorschlag **`d6-admin-csv-1`**: UTF-8 mit BOM für den vorgesehenen Excel-Import, Semikolon als Separator, CRLF, jedes Feld doppelt gequotet, enthaltene `"` verdoppelt. Ganzzahlen ohne Tausenderzeichen, Prozentwerte als Dezimalzahl mit Punkt in eigener Spalte `win_rate_percent` (z.B. `60`, nicht `0.6`), Spielzeit in `confirmed_usage_seconds` (dauerMs/1000), Finanzspalten explizit `_credits`; UTC-Zeit ISO 8601. Fehlende Werte sind leere Zellen, nachweisliche Null `0`. Locale-/Excel-Import mit expliziter Kodierung, Separator und Text-/Zahlenzuordnung ist noch am tatsächlichen Excel zu prüfen; kein versprochener universeller Doppelklickimport.

Vorgeschlagene Ranglistenspalten: `schema_version,origin,rank,account_id,career_id,archive_state,total_titles,league_titles,cup_titles,europe_titles,last_confirmed_at,coverage`. Optionaler Anzeigename erst nach Text-/Namensfreigabe. Matchbilanzexport ergänzt `season_filter,competition_filter,games,wins,draws,losses,win_rate_percent`; Accountspielzeitexport ist ein eigener gewählter Export, nicht still an jeden Ranglistenexport angehängt. Optionale Finanz-/Entwicklungsansichten erhalten nach Kennzahlenfreigabe eigene versionierte Spalten. Export enthält keine zusätzlichen Saisons oder Felder außerhalb der Auswahl.

Nutzertexte dürfen keine Tabellenformeln ausführen. Vorschlag: systemische IDs auf kontrollierten opaken Zeichensatz beschränken; freie Namen in erster Exportfassung weglassen. Werden freie Texte freigegeben, ist ein dokumentierter Textimport/Sanitizer für gefährliche führende Formel-/Steuerzeichen nötig, der am vorgesehenen Import mit `=`, `+`, `-`, `@`, TAB, CR/LF, Leerzeichenvarianten und Separatoren tatsächlich geprüft wird. Numerische Finanzwerte werden aus validierten Zahlen formatiert, nicht aus Nutzereingaben übernommen. Quoting allein ist kein Schutz; Verfahren/Grenzen sind Abnahmegate. Bereits heruntergeladene Dateien sind bei späterer Accountlöschung nicht automatisch zurückholbar; neue Exporte lassen gelöschte Accountdaten aus.

## Negative und fachliche Abnahmefälle

| Fall | Erwartung |
| --- | --- |
| Anonym / normales Konto / gefälschte Adminrolle / fremde Karriere | Kein privilegierter Lese-/Export-/Schreibzugriff, auch per direktem Request/Filter |
| U14 pending/abgelehnt/widerrufen, veralteter Loginstatus, paralleler Widerruf | Keine Statistik-/Zeitaufnahme trotz gefälschter Clientfreigabe |
| Alte Karriere, Import, kopierte/umbenannte ID | Keine Accountzuordnung oder Titel-/Statistikübernahme |
| Unbestätigter Browserwrite, halb verbuchtes Ergebnis | Kein automatischer Uploadauftrag |
| Gleiches Request/Revision/Event mehrfach, verlorene Antwort | Gleiche Quittung; ein Beitrag |
| Gleicher Request/Revision mit anderem Inhalt, ältere Revision | Definierter Konflikt/kein Rückschritt |
| Managerwechsel vor/nach endgültiger Titelvergabe | Nur tatsächlicher Trainer bei Vergabe zählt; nachfolgender Wechsel verschiebt Titel nicht |
| Zwei Karrieren je Account, gleiche Titelzahl/verschiedene Titelarten | Getrennte Einträge, gleicher Rang; keine Zusatzwertung |
| Gesamt/Liga/Pokal/Europacup, Saisonfilter, 0 Spiele, 24/40 | Korrekte Summen/60 Prozent; keine Mittelung von Quoten |
| Remis vor Elfmeterschießen, danach Gewinner/Verlierer, Retry | Genau eine endgültige Sieg-/Niederlage; unbekannter Ausgang bleibt Lücke |
| Offlinearchivierung, verspäteter Upload, doppelte Löschmeldung | Nur letzter bestätigter Titelstand archiviert; keine Reaktivierung |
| Accountlöschung, neuer Account, Backuprestore, verspäteter Retry | Aktive/archivierte Statistik bleibt gelöscht; keine Wiederbelebung |
| Menüinput >5min idle, laufendes/pausiertes Match, Hintergrund/Apppause | Nur erlaubte reale Vordergrundzeit; keine künstlichen Timerstunden |
| Zwei Tabs/Geräte, Wiederholung, Clockänderung, Crash | Keine doppelte/falsch zugeordnete Zeit; unklare Restzeit markiert |
| Extraschlüssel/Rohsave/Secrets/Talent/Exaktfähigkeit in Input/Antwort/Log | Strikte Allowlist; keine verborgenen Daten |
| CSV direkt, Filter, Umlaute/Quote/CRLF/Formeltext, leere Auswahl | Dieselben privaten Felder, tatsächlicher Excelimport geprüft, keine Formelwirkung |

Dies ist ein Prüfkatalog, kein Bericht ausgeführter Implementierungstests. C02 ist erst nach echter serverseitiger Durchsetzung, geprüfter lokaler Abschlussbindung und tatsächlicher Admin-/CSV-Abnahme implementiert.
