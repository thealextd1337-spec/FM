# Accounts: konkretes Betriebspaket zur Auswahl

Stand und Quellenabruf: **9. Oktober 2026**. Vorschlag zur Anbieterentscheidung, keine Buchung, Zugangskonfiguration oder Produktionsanmeldung. 3D-Abnahme bleibt vorrangig. Grundlage: [Produktregeln](../product.md), [Accountsauftrag](../agentenauftraege/04-accounts-adminstatistik.md), [offene Gates](account-preflight.md), [C01-Vertrag](account-contract.md) und [C02-Vertrag](admin-statistics-contract.md).

**Empfehlung:** World4You für die bestehende Website behalten; als kleinsten günstigen Accountbetrieb Paket A mit einem EU-Server, Better Auth, PostgreSQL und Brevo vorsehen. Das spart Geld, setzt aber eine ausdrücklich benannte Person für Betrieb, Updates und Wiederherstellung voraus. Paket B mit Supabase Pro ist die Alternative mit weniger eigener Infrastrukturarbeit, wenn sein tatsächlicher Endpreis einschließlich Mail und anderer Dienste im gemeinsamen Budget bleibt. Beide sind Auswahlvorschläge, keine bereits gewählten Anbieter.

## Bestehender Rahmen

- `.github/workflows/deploy.yml` veröffentlicht die bestehende Website über FTPS; `https://fussball.cakamper.at/` bleibt der Frontendort. Der Bestand beweist keine gebuchte Accountdatenbank, Authplattform oder verfügbare Backendkapazität bei World4You. Der vorhandene PHP-Matchstatistikpfad `dist/api/match.php` ist kein Accountdienst; `work/server.cjs` ist ein lokaler Dateiserver.
- Verbindlich: E-Mail-Anmeldelink und Google; kein eigenes Passwort, kein Gast. Betreiberlogin über Google mit serverseitig provisionierter Admin-ID; keine zusätzliche App-TOTP-Abfrage. U14 braucht servergeprüfte Elternfreigabe vor Spielzugang und Statistikverarbeitung.
- 30 Tage Geräteofflinezugang nach letzter erfolgreicher Onlineprüfung; explizites Abmelden entwertet ihn lokal sofort. Neue Karrieren sind accountgebunden; alte Karrieren werden weder übernommen noch importiert und bleiben unverändert gespeichert. Vollständige Cloudfortsetzung ist später S01.
- C02 liefert ausschließlich private Adminansicht und CSV: getrennte Karrierewertung, gleiche Titelwertung und Ranggleichheit bei gleicher Summe. Keine Rohsaves, Elternkontakte, geheimen/exakten Spielerwerte oder KI-Inspektoransicht. Clientmeldungen bleiben manipulierbar. Aktive Vordergrundzeit pausiert nach fünf Minuten Eingabeidle außer bei laufendem Match; keine Rückschätzung.
- Eigene Datenbank, Replikate und Backups müssen in der EU liegen. Google- und Maildatenflüsse werden gesondert betrachtet. **Alle zusätzlichen Dienste zusammen höchstens 30 Euro monatlich außerhalb Meshy**; kein eigener 30-Euro-Topf allein für Accounts. Bereits gebundene Zusatzkosten sind noch nicht belegt.

## Zwei passende Pakete

| Baustein | A: kleiner eigener EU-Server | B: verwaltetes Supabase-Pro-Projekt |
| --- | --- | --- |
| Website | bestehendes World4You | bestehendes World4You |
| API und Autorisierung | eigene kleine Node-API auf Hetzner; C01/C02 prüfen zentrale Identität und Rechte | eigene C01/C02-Handler als Supabase Edge Functions; keine offenen Tabellenzugriffe für Adminberichte |
| Anmeldewege | Better Auth mit Magic-Link-Plugin, Google und PostgreSQL-Adapter | Supabase Auth mit E-Mail-Magic-Link und Google |
| Eigene Primärdaten | PostgreSQL auf demselben Server, fest Deutschland, z. B. Nürnberg | PostgreSQL mit **exakter** Region Frankfurt `eu-central-1` |
| Sicherungen | tägliche konsistente DB-Exporte in geschützten Serverdateien plus aktivierte tägliche Hetzner-Serverbackups; Wiederherstellung regelmäßig testen | tägliche verwaltete Datenbankbackups mit sieben Tagen Retention; Wiederherstellung testen |
| Transaktionale Mails | Brevo SMTP/API, keine eigene Mailserverzustellung | Brevo über eigenes SMTP; Supabase-Standardversand nicht für reale Nutzer verwenden |
| Hauptnachteil | selbst verantwortlich für Betrieb, Sicherheitsupdates, DB, Alarmierung und Restore | wenig Budgetreserve; USD-Endpreis, Limits und Zusatzprojekte/Add-ons beachten |

Better Auth unterstützt die vorgesehenen [Magic Links](https://better-auth.com/docs/plugins/magic-link), [Google-Anmeldung](https://better-auth.com/docs/authentication/google) und [PostgreSQL](https://better-auth.com/docs/adapters/postgresql); das Projekt steht unter [MIT-Lizenz](https://raw.githubusercontent.com/better-auth/better-auth/main/LICENSE.md). Daraus folgt keine Betriebsleistung des Anbieters: API, Mailversand, Elternstatus und Offlinefreigabe bleiben eigene Aufgaben.

Supabase dokumentiert [E-Mail-Magic-Links](https://supabase.com/docs/guides/auth/auth-email-passwordless) und [Google](https://supabase.com/docs/guides/auth/social-login/auth-google). Sein Standard-SMTP ist auf Projektteamadressen und derzeit zwei Mails pro Stunde beschränkt; für Produktion verlangt die Dokumentation [eigenes SMTP](https://supabase.com/docs/guides/auth/auth-smtp). Auch nach dessen Einrichtung muss das zunächst niedrigere Auth-Sendelimit passend konfiguriert werden.

**Regionnachweis:** Hetzner-Backups liegen am Standort des Ursprungsservers; bei einem deutschen Server bleiben sie damit in Deutschland. Das sind Plattenkopien, kein Beweis einer konsistenten laufenden Datenbank: vorgeschlagene DB-Exporte müssen tatsächlich in einer gesicherten Kopie enthalten und wiederherstellbar sein. Sieben tägliche Slots sind verfügbar. [Standorte](https://docs.hetzner.com/cloud/servers/backups-snapshots/faq/), [Backupumfang](https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/).

Supabase bestätigt in seiner FAQ vom 6. Oktober 2026, dass Datenbank, Auth, Storage und Backups in der ausgewählten Region liegen. **Nicht** einfach die Gruppenauswahl „Europe“ wählen: sie kann auch Nicht-EU-Regionen umfassen. Edge Functions gezielt in Frankfurt ausführen. Die FAQ nennt außerdem getrennte Support-, Verwaltungs-, Telemetrie- und CDN-Datenflüsse außerhalb der gewählten Region; EU-Datenbank bedeutet keine pauschal ausschließliche EU-Verarbeitung. [Datenresidenz](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq), [exakte Regionen](https://supabase.com/docs/guides/platform/regions), [regionale Funktionsausführung](https://supabase.com/docs/guides/functions/regional-invocation).

Brevo beschreibt Datenablagen in Frankreich, Deutschland und Belgien sowie verschlüsselte Sicherungen. Die tatsächliche Vertrags-/Unterauftragsverarbeiterkonfiguration bleibt vor Nutzung zu prüfen. Das sagt nichts über den Empfang einer Mail bei Google oder einem anderen Empfängeranbieter aus. [Brevo-Datenstandorte](https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location).

## Budget für 100 und 1.000 aktive Accounts

Die Zahlen sind **Rechenszenarien, keine Kapazitätsmessung**. MAU bedeutet monatlich aktiver Account, nicht gleichzeitig spielende Person. Vorgeschlagene Planungsannahmen: höchstens vier aktuelle Karrieresnapshots je Account, je 100 KB; 40 Abschlussübertragungen im Monat; fünf transaktionale Mails je Account/Monat einschließlich erneuter Links und Eltern-/Servicemails. Spielzeit wird kompakt gepuffert, nicht jede Sekunde übertragen. Als Hülle werden 450 API-Aufrufe je MAU/Monat einschließlich Zeitpuffern, Prüfungen und Wiederholungen angesetzt. Diese Größenbegrenzungen und Takte sind vor Codearbeit mit G07/G08 abzugleichen, keine neuen Produktentscheidungen.

| Szenario | 100 MAU | 1.000 MAU |
| --- | ---: | ---: |
| Mails pro Monat / Tagesmittel bei 30 Tagen | 500 / ca. 17 | 5.000 / ca. 167 |
| API-Aufrufe pro Monat | 45.000 | 450.000 |
| aktuelle Snapshotdaten ohne Historie/Indizes | 40 MB | 400 MB |
| Snapshot-Upload pro Monat ohne Zeitdaten/Protokollaufwand | 400 MB | 4 GB |
| A: vorgeschlagene Servergröße | CX23, 2 vCPU / 4 GB RAM / 40 GB Disk | CX33, 4 vCPU / 8 GB RAM / 80 GB Disk als Reserve |
| A: Server + IPv4 + tägliche Backups, netto | 5,49 + 0,50 + 1,098 = **7,088 Euro** | 8,49 + 0,50 + 1,698 = **10,688 Euro** |
| A: Modell mit 20 % Steueraufschlag und Brevo Free | **8,51 Euro/Monat** | **12,83 Euro/Monat** |
| A: Rest im gemeinsamen 30-Euro-Topf vor anderen Diensten | **21,49 Euro** | **17,17 Euro** |
| B: ein Pro-Projekt mit Micro und Brevo Free | **ab 25 USD/Monat**, Endpreis unten | **ab 25 USD/Monat**, Endpreis unten |

Hetzner nennt seit 15. Juni 2026 für Deutschland/Finnland CX23 mit 5,49 Euro und CX33 mit 8,49 Euro monatlich netto ohne IPv4. IPv4 kostet zusätzlich 0,50 Euro netto; Backups kosten 20 % des Serverpreises. Die Servergrößen kommen von der aktuellen Produktseite. **Dort sind diese Cost-Optimized-Tarife beim Abruf als nicht verfügbar markiert**: Verfügbarkeit und Endpreis am gewünschten EU-Standort sind vor Bestellung zu bestätigen; kein stiller Wechsel auf einen teureren Tarif. [Aktuelle Preisänderung](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), [IP-Kosten](https://docs.hetzner.com/cloud/servers/overview/), [Backupabrechnung](https://docs.hetzner.com/cloud/billing/faq/), [Servergrößen und Verfügbarkeit](https://www.hetzner.com/cloud/cost-optimized/).

Supabase Pro beginnt bei 25 USD monatlich. Ein Micro wird durch das enthaltene Compute-Guthaben abgedeckt; berücksichtigt ist **nur ein** bezahltes Projekt. Enthalten sind 100.000 MAU, 8 GB Datenbankdisk, 250 GB Egress, zwei Millionen Funktionsaufrufe und sieben Tage tägliche DB-Backups. Free wird nicht als Produktionspaket empfohlen: keine automatischen Backups und mögliche Inaktivitätspause. Custom Domain, PITR, weitere bezahlte Projekte und höheres Compute sind hier nicht einkalkuliert. Spend Cap ersetzt keine gemeinsame Budgetprüfung. [Offizielle Supabase-Preise](https://supabase.com/pricing).

Die 20 % sind ausschließlich eine vorsichtige **Rechenannahme**, keine Aussage über die tatsächliche Rechnung oder Steuersituation. Bei B gilt: `25 / r × (1 + t) + M + Z ≤ 30 Euro`, mit `r` = tatsächlich abgerechnete USD pro Euro, `t` = tatsächlicher Steueraufschlag, `M` = Mailkosten und `Z` = alle sonstigen Zusatzkosten. Beispielannahme `r=1,10`, `t=0,20`, `M=Z=0`: 27,27 Euro; bei Parität wären es bereits 30 Euro. Das sind **keine aktuellen Wechselkursangebote**. Wechselkurs-/Kartengebühren, vorhandene Zusatzdienste und Endrechnung müssen geprüft werden. Das bestehende Websitehosting wird nicht neu gebucht; seine Rechnung ist hier nicht bekannt.

**Mailengpass:** Brevo Free liefert höchstens 300 Mails täglich, ohne Übertrag ungenutzter Tagesmengen. Überschuss kann verzögert werden; eine später zugestellte Anmeldemail kann bereits abgelaufen sein. Das Tagesmittel allein beweist deshalb keine Eignung für 1.000 Accounts. Das kostenlose Szenario gilt nur bei nachgewiesenen Spitzen unter dem Tageslimit; als Pilotziel höchstens 250 pro Tag mit Reserve vorsehen. Ein gleichzeitiger Start von 1.000 E-Mail-Nutzern passt nicht. [Free-Limits und Retryqueue](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan).

Für breiten Start muss ein bezahltes Mailkontingent im Restbudget konkret angeboten werden. Brevo Starter beginnt bei 9 USD netto/Monat für die erste Stufe; 5.000 Mails/500 gespeicherte Kontakte, größere Stufe 10.000/1.500, ohne Tageslimit. **Der Einstiegspreis ist kein belegter Preis der größeren Stufe.** Bei Speicherung von 1.000 Kontakten nicht die 500-Kontakte-Stufe kalkulieren; höhere Stufen/automatische Upgrades können Kosten erhöhen. Für Paket A gilt mit obiger Modellrechnung: der tatsächlich angebotene gesamte Mailendpreis plus sonstige Zusatzdienste muss bei 1.000 MAU höchstens 17,17 Euro betragen. Bei B ist die Reserve deutlich kleiner. [Brevo-Stufen, Steuern und Upgrades](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans). Ein dauerhaft belastbares 1.000-MAU-Paket mit beliebigen Mailspitzen ist damit **noch nicht preislich bestätigt**.

Die Tabelle umfasst C01/C02, keine Cloudsave-/APK-/Assetverteilung. Historische und archivierte Karrierestatistiken wachsen weiter; MAU begrenzt nicht die Anzahl gespeicherter Altaccounts. Archivierte Titel bleiben bis Accountlöschung erhalten. Retention, komprimierte Zeitintervalle, Indizes und fortlaufendes DB-Wachstum müssen gemessen werden. S01 und zusätzliche Distribution teilen später denselben Topf und brauchen eine eigene Last-/Kostenrechnung.

## Drei Entscheidungen, die die Auswahl konkret machen

1. **Betriebsweg und Budgetrest:** Paket A mit benannter Verantwortung für Updates, Alarme und Restore, oder Paket B mit bestätigtem Endpreis. Tatsächliche EU-Konfiguration, Tarifverfügbarkeit, bestehende Zusatzkosten und Mailspitzen ergänzen; bei breitem Start Mailangebot innerhalb des Restbudgets festlegen. Das ist die fehlende Sachauswahl, kein erneuter Startauftrag.
2. **Tatsächliches Elternverfahren:** Wie Altersgruppe geklärt/korrigiert wird, welche Prüfung elterlicher Verantwortung durchgeführt wird, wer strittige Fälle bearbeitet, wie Zweckversion/Widerruf funktionieren und wie lange Kontakt-/Prüfdaten bestehen. Ein Eltern-E-Mail-Link belegt Mailzugriff, allein keine elterliche Verantwortung. Beide Pakete benötigen diesen eigenen serverseitigen Prozess. Hier wird kein Verfahren als rechtlich ausreichend behauptet.
3. **Löschung und Wiederherstellung:** Technische Löschfristen einschließlich Backups, Tombstones nach Restore, Umgang mit widerrufenen/noch gepufferten Daten und verantwortlicher Restoretest. Vorschlag für den ersten Betrieb: täglich konsistente Sicherung, sieben Tage Backupfenster, angestrebter Datenverlust höchstens 24 Stunden; diese Betriebsziele und die übrigen Fristen müssen tatsächlich festgelegt und geprüft werden.

## Integration nach der 3D-Abnahme

Der Integrator reserviert zunächst gemeinsame Provider-/Repository-/Session-/Routerdateien und bestätigt G02. API-Origin, Google-Redirects, Magic-Link-Rückkehr zur bestehenden Website, erlaubte CORS-/Cookie- oder Tokenwege und Maildomain werden konkret festgelegt. Keine Secrets in `dist/`; kein Browserrollenflag als Adminnachweis. Die oben vorgeschlagenen Pfade sind noch nicht eingerichtet.

Frontendstorage, Start-/Speicherhooks und neue Karriereherkunft sind Bestandsgates: anonyme lokale Saves werden nicht nachträglich accountgebunden. 30-Tage-Offlinegrant, persistenter Logout über Tabs/Neustarts und Zeitänderungen brauchen eine eigene abgesicherte Integration; die Provider-Sitzung liefert diese Produktregel nicht automatisch. Elternwiderruf ist offline nicht sofort erkennbar. Erfolgreiche technische Authentifizierung allein darf keine offene Elternfreigabe umgehen.

Danach können C01 Account-/Eltern-/Policyhandler und Ansicht sowie C02 idempotente Snapshot-Ingestion, private Leseansicht, Rangliste und CSV **parallel gegen dieselben freigegebenen Ports** liefern. Gemeinsame Storage-/Completion-/Spielzeithooks integriert der Integrator anschließend seriell. Reale Abnahme muss beide Loginwege, Rechte-/Eigentümerablehnung, Elternstatus, Offlinefrist/Logout, Mailquoten, Wiederholungskonflikte, EU-Backuprestore und Löschung zeigen. Diese Datei schließt den Auswahlvorlauf ab; sie ersetzt diese Nachweise nicht.
