# Account-Vorlauf: Entscheidungen und Übergabe

Stand: 9. Oktober 2026. Der Nutzerstart umfasst parallelen C01/C02-Vertragsvorlauf; Umsetzung und Abnahme der 3D-Qualität bleiben vorrangig. Lieferungen: [C01 Accountvertrag](account-contract.md), [C02 Adminstatistikvertrag](admin-statistics-contract.md). Keine Auth-/UI-/Backendstubs, Anbieterbuchung, echten E-Mails, Runtimehooks, Messung oder Veröffentlichung wurden dafür erzeugt. Der [ursprüngliche Auftrag](../agentenauftraege/04-accounts-adminstatistik.md) und [Accountplan](../account-admin-statistik-plan.md) liefern die bestätigten Produktentscheidungen; ihre früheren Stopps gelten für Produktionsanbindung weiter, für den nun beauftragten Dokumentationsvorlauf nicht.

## Bereits beschlossen

E-Mail-Anmeldelink plus Google, kein eigenes Passwort und kein Gast. Accountzugang gehört zum ersten geplanten PC-Ausbau; Geräteofflinefortsetzung ist 30 Tage nach letzter erfolgreicher Onlineprüfung erlaubt. Abmelden sperrt sofort auch offline und erhält lokalen Fortschritt. U14 benötigt zentrale servergeprüfte Elternfreigabe; minimal benötigte Altersgruppe statt Geburtsdatum, Einstieg per zweckgebundenem Eltern-E-Mail-Link ohne Eltern-Spielkonto. Googlebetreiberlogin mit serverseitiger gezielter Adminprovisionierung; keine zusätzliche App-TOTP-Abfrage.

Neue Karrieren sind accountgebunden; bestehende Karrieren, Titel und Daten werden nicht übernommen, nachträglich zugeordnet oder importiert. Altbestände bleiben unverändert erhalten. Automatische Statistik nach dauerhaft gespeichertem Spiel-/Saisonabschluss ist bestätigt; Spielzeit erhält eigenen Mess-/Pufferweg. Private Rangliste wertet jede Karriere separat, alle Titel gleichwertig, gleiche Gesamtsumme ranggleich. Titel zählt für den menschlichen Trainer bei endgültiger Vergabe. Matchbilanz und Saison-/Wettbewerbsfilter sind zusätzliche Informationen, keine Gleichstandsauflösung. Clientmeldungen sind nicht manipulationssicher. Private Adminansicht und CSV verwenden begrenzte Allowlisten ohne Rohsaves, Elternkontakte und verborgene/exakte Fußballwerte. Vollständige Cloudfortsetzung und Hall of Fame bleiben spätere Pakete.

## Offene Gates ohne stille Vorentscheidung

| Gate | Zuständig | Konkretes Ergebnis vor betroffener Umsetzung |
| --- | --- | --- |
| G01 Anbieter/Host/Mail/Google | Integrator + Betreiber | Tatsächlich gewählter gepflegter Authweg für beide Anmeldewege, Konfiguration/Redirects, kompatible Kind-/Elternzugänge, Mailweg und dokumentierte Datenflüsse |
| G02 zentrale Identität/Repository/Session/Router | Integrator | Freigegebene gemeinsame Ports, stabile Kennungen, transaktionale Eigentümer-/Widerrufs-/Löschprüfung, erlaubte Dateipfade und Routerintegration; keine zweite Authautorität |
| G03 Alters-/Elternverfahren | Betreiber + Integrator, nötige fachliche Prüfung | Konkretes altersgruppenbezogenes Klären/Korrigieren, angemessene Elternverifikation, Zweckversion, Ablehnung/Widerruf, Fristen, Umgang mit bereits erfassten/noch gepufferten Daten; Mailbesitz allein nicht als Elternnachweis ausgeben |
| G04 Offlinegrant/Zeit/Logout | Integrator + Plattform | Signatur-/Schlüssel-/Gerätebindung und persistente Sperre über Tabs/Neustart, Clockänderungsbehandlung und sichere Matchunterbrechung; Vorschlag exakt30×24h, Tokenablauf getrennt vom Logout |
| G05 neue Karriereherkunft/Kopien | Integrator | Neuer Erstellungs- und Registrypfad ohne Altclaim/Import; entscheiden, wie neue Karrieren offline erzeugt/zugeordnet werden; Clientmarker alleine ist kein Herkunftsnachweis |
| G06 Save-/Abschlussrevision | Integrator | Tatsächlich dauerhaft bestätigte Checkpoint-/Completionkennungen und immutable Revisionskonvention; C02 löst keine eigenen Spielbuchungen aus |
| G07 Spielzeitmehrfachzählung | C02 + Integrator | Mess-/Puffer-/Übertragungstakte, Restzeitlücke, Einzeltabzuständigkeit und freigegebene Überlappungsvereinigung auch mehrerer Offlinegeräte/unsicherer Zeitanker; kein Summieren paralleler Sessions |
| G08 genaue Zusatzkennzahlen/Umfang | Betreiber + C02 | Finanz-/Entwicklungs-Allowlist, definierte Gesamt-/Aktivitätszahlen, Größen-/Arraygrenzen, Snapshotwachstum/gegebenenfalls Deltaweg und Aktualitätsanzeige; Vorschläge nicht automatisch aktivieren |
| G09 Rangnummern/CSV | Betreiber + C02/Q01 | Gleicher Rang ist beschlossen; Ranglückenformel noch auswählen. CSV-Schema/Textbehandlung und tatsächlicher Excelimport der gewählten Filter freigeben |
| G10 Löschung/Aufbewahrung/Backups | Betreiber + Integrator | Archivierte Titelstatistik bis Accountlöschung beschlossen; konkrete technische Accountlöschfristen, Backuprestore/Tombstone, Elternwiderruf und Fristen sonstiger Daten festlegen, keine anonyme Restverwertung voraussetzen |
| G11 EU/Budget | Betreiber + Integrator | Nachweis EU-Speicherung eigener Primärdatenbank, Replikate und Backups/Wiederherstellungsablagen. Gemeinsames Monatsbudget≤30Euro außerhalb Meshy bleibt Vorgabe; aktuelle Preise und Konfiguration erst bei Anbieterwahl belegen |
| G12 tatsächliche Produktionsabnahme | Q01 + Integrator | Reale Auth-/Repository-/Geräte-/Rechte-/Eltern-/Abschluss-/CSV-Prüfung, DE/EN und zugängliche Anzeige, freigegebene Hinweise/Datenschutz-/Betriebsunterlagen |

G01/G03/G10/G11 enthalten noch unbewiesene Betriebsfragen. Diese Dokumente wählen keinen Anbieter und behaupten weder Rechtskonformität noch aktuell ausreichende Preise/Kapazität. Vor Anbieterentscheidung aktuelle Primärquellen und tatsächliche Konfiguration prüfen. 100/1.000 monatlich aktive Accounts sind langfristige Rechenszenarien, keine gleichzeitigen Sessions oder Kapazitätszusage. Google-/Mail-/Werbeflüsse sind separat zu prüfen; EU-eigene Datenbank ist keine pauschale Aussage über jeden Drittanbieterdienst.

## Nach Gatefreigabe parallel implementierbar

1. Integrator gibt G02 und exakte Dateizuständigkeit frei, legt gemeinsame IDs/Ports als verbindlichen Vertrag fest. Ende dieser Phase: C01/C02 verwenden dieselbe geprüfte Authautorität und Repositorykonvention.
2. C01 implementiert eigene Account-/Eltern-/Policyhandler und isolierte Ansicht; C02 unabhängig eigene Ingestion-/Lese-/Exportmodule und Ansicht gegen die freigegebenen Ports. G01/G03/G04/G05 dürfen nicht durch fingierte Testdouble-Erfolge übergangen werden. Ende: fachliche Modulprüfungen und konkrete Integrationslieferungen, ausdrücklich markierte offene Produktionsabhängigkeiten.
3. Integrator bindet Provider, Router, Start-/Speicher-/Abschlusshooks und Übersetzungen seriell ein. C02 erstellt Aufträge erst nach dauerhaft bestätigtem Abschluss; G06/G07 gelten vor echter Aufzeichnung. Ende: beide echten Anmeldewege, accountgebundener Offlinezugang und tatsächlich private Statistiken auf dem integrierten Pfad.
4. Q01 prüft negative und fachliche Fälle aus beiden Verträgen mit echten Serverrechten und der vorgesehenen Plattform/Excelimport. Ende: reproduzierbare Belege für den geprüften Quell-/Konfigurationsstand und einzeln benannte verbleibende Grenzen; Veröffentlichung separat.

Der Dokumentationsvorlauf ist erfüllt, sobald beide Verträge verlinkt, Quellenentscheidungen widerspruchsfrei übernommen und offene Gates erkennbar sind. Er ersetzt keine Implementierung oder Produktionsabnahme. Gemeinsame Index-/Produkt-/Changelogpflege bleibt beim Integrator.
