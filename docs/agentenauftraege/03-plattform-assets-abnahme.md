# Agentenaufträge: Plattform, Assets und Abnahme

**Aktuelle Teilfreigabe vom 8. Oktober 2026:** Welle 0 und Welle 1 sind als lokale PC-Vergleichsdemo einschließlich Unity ausdrücklich gestartet; [Umfang und Nachweise](../platform/local-demo.md). Sie umfassen gemeinsame Verträge, Kontaktfixtures, Assetableitung, begrenzte Prototypen und Messungen. Android bleibt in dieser Welle dokumentiert, ohne Modulinstallation oder APK. Weitere Produktions-/Ausbaupakete bleiben geplant und ungestartet. Die kopierbaren Prompts gelten zusammen mit diesem Rahmen und dem [Masterplan](README.md); erfüllte technische Startbedingungen allein erweitern die Freigabe nicht.

Stand: 8. Oktober 2026. E01/A01/R01/Q01 sind im Umfang der lokalen Welle-0/1-Probe gestartet. Weitere Asset-/Produktpakete, Meshy-Jobs und Veröffentlichungen sind nicht beauftragt. Neue Nutzerentscheidungen gelten vor älteren Planformulierungen: Öffentliche Freigabe PC-Browser zuerst, Android danach, iPhone zurückgestellt. Frühe Android-Testfassungen sind dagegen installierbar und aktualisierbar parallel zum PC-Ausbau vorgesehen; [Installations-/Updateplan](../android-installation-update-plan.md). Eine große Testgruppe ist keine Voraussetzung der internen Abnahme. Grundlage sind [Matchausbau](../match-ausbau-plan.md), [Enginevergleich](../unity-match-engine-plan.md), [Mobile-Nachweise](../mobile-3d-performance-v135.md) und [MSH-01 bis MSH-05](../meshy-match-auftraege.md).

## Gemeinsame Regeln für jeden Auftrag

- Du bist nicht allein im Codebestand. Erhalte fremde Änderungen und historische Testnachweise. Keine Rücksetzungen, Bereinigungen oder Bearbeitung von `freekickdemo/`.
- Lies `AGENTS.md`, die relevanten Produktentscheidungen und `docs/development.md`. Prüfe vor Änderungen die tatsächlich geladene Aufrufkette in `dist/`; Dateinamen sind keine Versionsgarantie. Die Welle-0/1-Demopfade sind inzwischen vorhanden; weitere genannte Produktionspfade bleiben geplante Lieferorte. Den konkreten Stand vor Fortsetzung lesen.
- Nur der Integrator ändert gemeinsame Loader, `dist/index.html`, `work/build.cjs`, `work/server.cjs`, die Produktionsanbindung und Veröffentlichungsdaten. Gemeinsam genutzte Renderer-/Rig-Dateien bleiben ebenfalls beim Integrator, bis er sie ausdrücklich einer einzelnen Spur für ein serielles Integrationsfenster übergibt. Performance- und Animationsagent ändern diese Dateien niemals gleichzeitig.
- Darstellung liest den Simulationszustand. Kein zusätzlicher Spielzufall, keine Kontaktentscheidung, keine geänderten Fähigkeiten oder Matchzeiten durch Grafikqualität. Pause, Rückschau und sichere Fortsetzung müssen erhalten bleiben. Keine Umrechnung alter Spielstände oder Neuberechnung historischer Ergebnisse.
- Simulation und Rendering verwenden denselben eingefrorenen Szenen-, Asset- und Parameterstand. Dokumentiere Quellhashes, Parameterhash, Zufallsstart, Messmethode und Umgebung. Ein bloßer Commitbezug reicht bei uncommittierten Dateien nicht. Ändere während einer Leistungs- oder Balancestudie keine Gewichte. Varianten erhalten getrennte, ausdrücklich benannte Stände.
- Pro physischem Gerät läuft jeweils nur eine Leistungsprüfung. Parallel können auf anderen Geräten Messungen sowie unabhängige Entwicklung laufen. Emulatoren belegen Layout und Funktion, keine reale GPU-Leistung oder Erwärmung.
- PC-Ladeziel ist bestätigt: erstes spielbereites 3D-Match auf einer dokumentierten guten Verbindung innerhalb von höchstens 10–15 Sekunden, Fortschrittsanzeige und schnellerer Folgestart durch Cache. Numerische MB-, Speicher-, Bildzeit- und Thermalbudgets sind noch festzulegen. Stabile 30 Bilder/s auf Pixel 9a und Pixel 9 Pro XL sind als Android-Leistungsziel bestätigt, keine bereits erreichte Leistung. Automatische Grafikreduzierung ist zulässig, Simulation und Regeln bleiben unverändert. 60 Bilder/s als zusätzliche Stufe, 1K/2K-Texturen und rund 6.000/3.000 Dreiecke bleiben vorläufige Kandidaten.
- Neue Dienste zusammen höchstens 30 Euro/Monat außerhalb des bestehenden Meshy-Abos. Ungefähr 4.000 Meshy-Credits/Monat sind gemeldet, kein geprüftes Restguthaben oder Verbrauchsauftrag. Keine Abos, Käufe, Providerjobs, Storeuploads oder Veröffentlichung durch diese Aufgabenfestlegung.
- Vor tatsächlicher Einführung aktuelle Engine-, Lizenz-, SDK-, Store- und Provideranforderungen mit Primärquellen prüfen. Alte Quellen in Planungen gelten nicht als aktuelle Freigabe. iOS darf keine laufende Android-/PC-Umsetzung blockieren; Architekturannahmen für später festhalten, iPhone-Hardwareabnahme offen lassen.
- Liefermeldung: eigene geänderte Dateien, Eingabe-/Ausgabevertrag, ausgeführte Prüfungen samt Rohbelegen, nicht ausführbare Prüfungen, offene Risiken und konkrete Integratoränderungen. Kein erfolgreicher Hardware-/Store-/Kontaktbefund ohne entsprechenden Nachweis. Dokumentation und Changelog über einen Integrator-Nachtrag liefern; diese gemeinsamen Dateien nicht nebenläufig bearbeiten.

## E01: Begrenzte Engine- und Android-Integrationsprobe

**Start:** Nach eingefrorenem Szenen-/Kontaktvertrag und ausdrücklich gestarteter Prototypwelle. Bereits vorher können Inventar, bestehende Android-Paketwege und benötigte Werkzeuge ohne Installation/Kosten untersucht werden. Keine vollständige neue JavaScript- und C#-Match-KI parallel entwickeln.

**Eigentum der lokalen Lieferung:** Dateien unter `work/platform/engine-probe/`, `prototypes/match-engine-unity/` und `docs/platform/engine-probe.md`. Browserquellen und Masterassets nur lesen. Die gestartete Demo nutzt ausschließlich `Assets/Doppel6EngineProbe/` im vorhandenen Unity-Projekt; kein zweites vollständiges Spielprojekt wird angelegt.

**Agentenprompt:**

> Bewerte bestehende Browserengine mit einem getrennt geprüften Android-Appweg gegen einen begrenzten Unity-Matchprototyp. Der Manager, Vereinswelt und Karriere werden nicht neu gebaut. Verwende dieselben freigegebenen Figuren, Kameras, Szenen, Abmessungen und vergleichbare Grafikqualität.
>
> Liefere zuerst ein Werkzeuginventar und einen begrenzten Prüfplan. Wähle und fixiere nach aktueller Primärquellenprüfung einen tatsächlich verfügbaren Editor-/Paketstand. Fehlen Werkzeuge, Buildressourcen oder Geräte, dokumentiere die Grenze; kein ungeprüfter Installations- oder Bezahldienst als Voraussetzung.
>
> Die Probe zeigt zwölf Figuren mit vorgegebenen Abläufen, zusätzlich vierzehn Figuren für die bestätigte Sechs-Feldspieler-Variante. Drei bis vier Figuren führen die relevanten Kontaktszenen aus. Implementiere nur den dafür nötigen Ablauf: freies Tor, erreichbare und unerreichbare Parade, Strafraumgrenze, Passabfang und tatsächlicher Abpraller. Nutze gemeinsame Fachfixtures; keine zweite vollständige Karriere-/Matchsimulation. Änderungen an Browserkontakten bleiben bei der Kontaktspur.
>
> Demonstriere einen schmalen Manager-/Match-Rundlauf: Start mit IDs und festen Parametern, Pause, erlaubte Befehle, Fortsetzen, sicherer Unterbrechungspunkt und genau einmalige Ergebnisübergabe. Befehle und Momentaufnahmen sind versioniert; keine Übertragung jedes Gelenkbilds. Definiere, welches einzelne System Uhr, Ballbesitz, Kontakte und Statistik besitzt. Die vorhandene HTML-Oberfläche wird durch Unity nicht automatisch zur nativen Manageroberfläche.
>
> Untersuche für die Browserengine einen konkreten Android-Paketweg, beispielsweise einen isolierten Wrapper als Vergleichskandidat. Die Verpackung allein ist kein Performancebeweis. Erstelle PC-Web- und Android-Testartefakte erst innerhalb der gestarteten Probe; keine Storeveröffentlichung. iOS später als dokumentierte Integrationsgrenze, kein iOS-Prototyp in dieser Welle.
>
> Liefere Start-/Pause-/Ergebnisverträge, reproduzierbare Buildanleitung, Artefakthashes, Kontaktvideos beziehungsweise Zustandslogs und Aufwand für dieselbe zusätzliche kleine Matchregel. Performancewerte kommen aus R01. Vergleiche fachliche Ergebnisse und Verteilungen; fordere keine bitgleichen Resultate verschiedener Physiksysteme. Empfiehl einen Kandidaten nur anhand bestandener Fachtests, PC-/Androidmessungen und realistischer Integration. Unentschiedene Befunde bleiben unentschieden.

**Schnittstellen:** integratorfreigegebene Match-Eingabe, Befehle, Kontakt-/Ergebnisereignisse und sichere Zustände; Assetmanifest von A01; Kontaktphasen von A02; Messprotokoll von R01; unabhängige Prüffälle von Q01.

**Fertig:** kleiner reproduzierbarer Vergleich, dokumentierter Appweg und Evidenzmatrix. Kein Enginewechsel allein durch Abschluss dieses Pakets. Nach Auswahl nur die gewählte Engine vollständig ausbauen.

## R01: Messung und isolierte Qualitätskandidaten

**Start:** sofort für nicht invasive Baselineplanung und Messwerkzeuge; Hardwaremessung erst mit verfügbarem Testbuild und Nutzer-/Gerätezugriff. Optimierungen nach belegtem Engpass, gemeinsame Rendereranbindung nur seriell durch den Integrator.

**Eigentum, künftig:** ausschließlich neue `work/platform/performance/collect.cjs`, `work/platform/performance/scenarios.json`, `work/platform/performance/quality-policy.cjs`, `work/platform/performance/check-invariants.cjs` und `docs/platform/performance-report.md`; neue Rohbelege unter `outputs/platform/performance/<run-id>/`. Die Qualitätsdatei ist zunächst ein isolierter Kandidat, kein automatisch geladener Produktionsadapter. Weitere eigene Dateien nur in diesen Paketverzeichnissen.

**Agentenprompt:**

> Erstelle eine belastbare PC-/Android-Baseline. Trenne Simulation, Planung, Rig-/Kontaktanimation, Render-CPU, verfügbare GPU-Messungen, Speicher, Netzwerktransfer, Entpacken/Import und erstes spielbereites Bild. GPU- oder thermische Messsignale, die die Plattform nicht liefert, markierst du als nicht verfügbar; nutze keine erfundenen Ersatzwerte.
>
> Halte Quell-, Parameter-, Szenen- und Assetstand pro Vergleich fest. Erfasse kalten und warmen Cache, vollständige Partien, beide Feldgrößen, zwölf und vierzehn Figuren, vollständige Rückschau, Aufräumen und mindestens 20 Minuten Sitzung. Berichte p50/p95/p99 der Bildzeiten, lange Unterbrechungen, Speicherverlauf sowie Geräte-/Browser-/Systemstand, Qualitätsstufe, Verbindung und Hintergrundlast. Pixel 9a und Pixel 9 Pro XL sind die verbindlich gesetzten echten Android-Referenzgeräte. Stabile 30 Bilder/s auf beiden Geräten sind inzwischen als verbindliches Android-Leistungsziel bestätigt; belege die tatsächliche Leistung einschließlich längerer Sitzungen, nicht nur den Durchschnitt. Beobachtete Erwärmung und messbarer Leistungseinbruch sind getrennt von tatsächlicher Temperaturmessung zu kennzeichnen.
>
> Verwende die vorhandenen v135-Prüfungen als strukturelle Referenz. Ihre SwiftShader-Ergebnisse belegen keinen Pixel-Hardwareerfolg. Eigene Prüfungen bekommen eigene Ausgabepfade; historische JSON-/Bildnachweise bleiben erhalten.
>
> Erst nach Engpassmessung entwickelst du isolierte Kandidaten für Auflösung, Schatten, Stadiondetails oder Asset-/Rigkosten. Automatik und manuelle Wahl dürfen ausschließlich Grafik betreffen. Keine verringerte Kontaktrate, keine anderer Spielzufall und keine unsichtbar verkürzte Rückschau. Lese Momentaufnahmen, statt den Spielzustand für Messung oder Qualitätswechsel zu verändern. Übergib nötige Produktionshooks als kleinen konkreten Integrationsvorschlag.
>
> Vergleiche Instrumentierung an/aus, 2D/3D und unterschiedliche Renderbildraten auf denselben reproduzierbaren Matchzuständen. Eine Verbesserung der mittleren FPS genügt bei schlechteren Ausreißern oder unbounded Speicherwachstum nicht. Liefere Rohdaten, Methode, Ergebnisgrenzen und aus der Baseline abgeleitete Budgetvorschläge. Ohne echte Geräte bleibt Hardwareabnahme offen.

**Schnittstellen:** E01 liefert unveränderte Builds; A01 liefert versionierte Kandidaten; Q01 validiert Simulationsparität. Eigener Messadapter verändert keine Assetdateien oder Kontakt-/Animationsimplementierung.

**Fertig:** reproduzierbare Ausgangsmessung, belegter Engpass, isolierter Kandidat mit Vergleich und offene Hardwareliste. Erst der Integrator aktiviert einen abgenommenen Kandidaten.

## A01: Vorhandene Figur, mobile Ableitungen und Importvertrag

**Start:** unabhängig von Enginewahl. Lokale Bestandsaufnahme ist sofort möglich; konkrete Ableitungen erst in gestarteter Assetwelle. Keine neue Generierung durch diesen Auftrag.

**Eigentum, künftig:** neue `work/platform/assets/inventory.cjs`, `work/platform/assets/validate.cjs`, `work/platform/assets/manifest.json`, `work/platform/assets/derive.cjs`, `docs/platform/asset-contract.md` und abgeleitete Kandidaten unter `outputs/platform/assets/<asset-hash>/`. Der bestehende Master `dist/players/football-v130.glb`, Kalibrierung und Kleidungsmasken bleiben unverändert. Freigegebene Laufzeitvarianten werden ausschließlich durch den Integrator nach `dist/` übernommen.

**Agentenprompt:**

> Setze den lokalen Teil von MSH-01 um. Inventarisiere das tatsächlich geladene Masterasset, Texturen, Skin, Gelenkhierarchie, Clipnamen, Kalibrierungen und Herkunft mit Hashes. Die dokumentierte Basis hat 28 Gelenke und 34 Clips; prüfe diesen Bestand, statt alte Inventarzahlen als Messergebnis auszugeben.
>
> Lege einen Browser-/Unity-Importvertrag fest: Maße, Bodenbezug, Vorwärtsrichtung, Bindepose, Gelenknamen, Material-/UV-Semantik, Vereinsfarben, Nummern und Kontaktreferenzen. Assets und Texturen teilen, nicht pro Spieler zwölf oder vierzehn unabhängige Komplettpakete laden. Individuelle Skelette/Mixer bleiben korrekt getrennt. Fehlende Daten oder Lizenzen melden.
>
> Bereite lokale Textur-/Clipkompression und gegebenenfalls Skin-erhaltende Geometrievarianten vor. 1K/2K und circa 6.000/3.000 Dreiecke sind Kandidaten, keine endgültigen Grenzen. Master und Originalclips archivieren; keine verlorenen Clips als Einsparung verkaufen. Den vorhandenen Skin nicht durch ein unbewiesenes Remesh oder neues Rig ersetzen.
>
> Prüfe Silhouette im TV-Blick, Trikotlesbarkeit, Knie-/Schulterverformung, Hände/Füße und identische Kontaktreferenzen je Kandidat. Liefere Bytegrößen vor/nach, Testbilder, Importfehler und lokale Prüfschritte. R01 misst die tatsächliche Laufzeitwirkung, A02 prüft Kontaktphasen. Modellgröße allein belegt keine mobile Freigabe.
>
> MSH-05 bleibt Wiederverwendung und sichtbare Mängelliste für vorhandene Masken/Texturen. Ball, Tor und Stadion werden nicht neu erzeugt. Ist Meshy später für eine konkrete Lücke erforderlich, liefere den bereits definierten MSH-Auftrag mit Quellen-/Kostenprüfung an den Integrator; starte keinen Providerjob. Vor echter Meshy-/3D-Bearbeitung den Meshy-Skill und `docs/meshy-workflow.md` anwenden.

**Schnittstellen:** unveränderter Master als Input; versionierte Varianten und Manifest als Output. Renderer, Bootstrap, Build und Produktionsrig bleiben außerhalb des Eigentums. Rigänderungen benötigen ein eigenes serielles Integrationsfenster.

**Fertig:** gemessenes Inventar, geprüfte lokale Kandidaten, Importvertrag und klare Wiederverwendungs-/Lückenliste. Kein neuer Meshy-Task und kein Creditsverbrauch erforderlich.

## A02: Kontaktphasen und Wiederverwendung vorhandener Clips

**Start:** Inventar und Metadaten bereits parallel zu A01. Ableitungen/Retargeting gegen dessen eingefrorene Rigreferenz; Produktionsanbindung erst nach Kontaktvertrag und serieller Integration. MSH-03/04 erst nach bestandenem MSH-02-Pilot, keine neue Generierung in dieser Welle.

**Eigentum, künftig:** neue `work/platform/animation/clip-manifest.json`, `work/platform/animation/probe.cjs`, `work/platform/animation/check-contacts.cjs`, `docs/platform/animation-handoff.md` und eigene Clips/Belege unter `outputs/platform/animation/<rig-hash>/`. Keine Änderung an `player-user-motion-v108.js`, `player-user-ball-actions-v111.js`, `pitch-motion-v102.js` oder am gemeinsamen Laufzeitasset durch parallele Arbeit.

**Agentenprompt:**

> Prüfe vorhandene Lokomotion, Schuss, Keeperparaden/-bereitschaft, Sturz und Jubel vor jedem Zusatzbedarf. Verwende genau die A01-Rigreferenz und dieselbe Figurenbasis. Trenne Matchentscheidung vom sichtbaren Bewegungsangebot: Animation darf misslingen und entscheidet weder Besitz noch Tor, Parade, Foul oder Abseits.
>
> Liefere je tatsächlich geeignetem Clip Vorbereitung, Kontaktfenster, Freigabe, Nachbewegung, erlaubte Übergänge, verwendeten Fuß/Hand, Spiegelbarkeit und Rootbehandlung. Zeiten stammen aus geprüften Clips, keine Promptversprechen. 30 Samples/s ist ein vorläufiger Assetstandard, unabhängig von Simulation und Grafikbildrate. Weltbewegung und horizontale Drehung kommen von der Simulation; mögliche Sprunghöhen müssen mit dem Kontaktvertrag übereinstimmen.
>
> Bereite den vorhandenen MSH-02-Pilot für Innenseitpass und Bodenannahme vor. Zeige, was mit Bestandsclips beziehungsweise lokalen Ableitungen bereits möglich ist und welche konkrete Quellbewegung fehlt. Keine neu erfundene Clipfamilie und keine Meshy-Jobs. Erst nach später beauftragtem und bestandenem Pilot dürfen MSH-03-Ballaktionen und MSH-04-Verteidigen/Torwartabspiel getrennt produziert werden.
>
> Prüfe linke/rechte Varianten, Standfuß, Übergang zum Laufen, erreichbaren Ballpunkt und Körper-/Fußsprünge. Kein Ball wird an einen Quellclip gebunden, um einen fachlich verfehlten Kontakt nachträglich erfolgreich zu machen. Vorbereitung kann vor Kontakt abbrechen; freigegebener Ball kann nicht durch neue Animation retargetet werden.
>
> Liefere manifestierte Clipphasen, eigene Kontaktprobe, Videos/Bilder und konkrete Adapteranforderungen. Änderungen an Produktionsrig und Renderer werden vom Integrator seriell eingespielt. R01 liest die geprüfte Lieferung und optimiert nicht gleichzeitig deren Kontaktlogik.

**Fertig:** geprüfte Wiederverwendung, stabile Kontaktmetadaten, Pilotlücken und reproduzierbare Vorschau. Tatsächlich fehlende Quellbewegung ist ein offener Bedarf, keine erfolgreiche Animation.

## Q01: Unabhängige Fach-, Plattform- und Freigabeprüfung

**Ergänzung Flutlicht-Redesign:** Im beauftragten U01-Vorlauf den unabhängigen Prüfkatalog und die Datengrenzprüfung vorbereiten. Q01 besitzt dafür `docs/ui-redesign/acceptance.md`, `work/ui-redesign/qa/` und Rohbelege unter `outputs/ui-redesign/Q01/<run-id>/`; diese Pfade sind von den U01-Produkt-/Paketdateien getrennt. Nach dem Vorlauf den Fachslot freigeben und für unabhängige Abnahme zurückkehren, ohne zwischenzeitlich U01-Produktdateien zu bearbeiten. Nach Integration die [UI-Abnahmematrix](06-ui-redesign.md#abnahme-durch-u01-und-q01) am eingefrorenen Stand prüfen: vollständiger Informationserhalt, Hell/Dunkel/Automatik, DE/EN, Desktop/Mobil, dauerhaft sichtbare Fähigkeiten, Tooltipbedienung, Mehrfachtitel, Sponsor-/Ergebniszustände, ewige Vereinslisten und echter Saisonwechsel. Die [eigenständige lokale Browserabnahme](06-ui-redesign.md#eigenständige-lokale-redesign-abnahme) wartet nicht auf neue Fachmodule oder Store-/Engineanbindung. Reale Geräte-/Screenreaderbefunde getrennt ausweisen; Dummy-Layoutchecks ersetzen keine Produktions- oder Hardwareabnahme. Sämtliche einschlägigen Gesamtgates gelten weiterhin vor öffentlichem Release.

**Ergänzung Monetarisierung:** Gemeinsame kostenlose App mit wenigen Bannern und accountgebundene Werbefrei-Freischaltung für ungefähr vier bis fünf Euro einmalig sind bestätigt. Ein Kauf gilt für denselben Account auf PC und Android; Preis, technische Wiederherstellung und erste Releaseverfügbarkeit bleiben offen. Q01 übernimmt nach beauftragter Integration zusätzlich die Kauf-/Restore-/Refund-, Kanal-, Rechte-, Netzwerk- und Offlinefälle aus [B01/B02](05-monetarisierung.md#q01-zusätzliche-unabhängige-abnahme). Gültig werbefrei bedeutet keine Anbieterinitialisierung oder Anzeigenrequests; ein Kaufstub belegt keine reale Freischaltung.

**Ergänzung Werbeplatzierung:** Bestätigt sind Anzeigen ausschließlich in Menüs und zwischen Partien. Q01 prüft nach tatsächlich beauftragter Werbeintegration: keine Anzeige oder Werbeunterbrechung im laufenden Match, in dessen Halbzeitpause oder Rückschau. Anzeigenfehler oder verspätete Antworten dürfen kein Overlay nach Wechsel ins Match öffnen, keine Matchpause erzwingen und weder Simulation noch Ergebnis-/Zeitbuchung verändern. Für den Start sind ausschließlich klar gekennzeichnete Banner an festen Menüplätzen bestätigt. Q01 prüft nach Integration Bannerformat und Ausschluss von Vollbild-/Video-/Belohnungsvideoanzeigen sowie Bedienbarkeit der vorgesehenen Menüplätze auf PC und den beiden Android-Referenzgeräten; keine verdeckten Bedienelemente oder nachträglich in den Matchbildschirm eingeblendeten Banner. Bestätigt ist außerdem uneingeschränkter Spielumfang bei fehlender Werbung. Q01 prüft nach Integration Werbeblocker, Offlinebetrieb, leeres Anzeigenangebot, Ladefehler, langsame Antwort und Anbieterausfall: Menüs/Partien bleiben bedienbar, kein Warten auf eine Anzeige oder Blockerdialog als Zugangssperre, kein nachträglicher Verlust einer Aktion oder doppelter Matchabschluss. Authentifizierung, Elternfreigabe und die 30-Tage-Offlinefreigabe werden dadurch nicht umgangen. Genaue Plätze/Größen, Häufigkeit, Anbieter und Datenfluss bleiben offen; keine SDK-Integration oder echten Anzeigen jetzt ausführen.

**Ergänzung Accounts/Adminstatistik:** Vor erster PC-Freigabe Accountpflicht ohne Gastfallback, erste Anmeldung ohne Netz und accountgebundenen Offline-Neustart sowie C01/C02 anhand des [Account-/Adminplans](../account-admin-statistik-plan.md) unabhängig prüfen: echte serverseitige Eigentümer-/Adminrechte, Account-A/B-Isolation, gefälschte Rollen, abgelaufene Sitzungen, Offline-/Providerfehler, Datenminimierung, Uploadrevision/Wiederholung, Löschung und verspätete Übertragung. Stubs ersetzen diese Rechteabnahme nicht.

**Start:** Prüfspezifikation unabhängig von Implementierung; ausführbare Prüfungen nach eingefrorenem Vertrag, aktuellem Build und jeweiligen Integrationen. Auf echten Geräten serielle Messfenster mit R01 vereinbaren.

**Eigentum, künftig:** neue `work/platform/qa/matrix.json`, `work/platform/qa/check-contract.cjs`, `work/platform/qa/check-lifecycle.cjs`, `work/platform/qa/run-parity.cjs`, `docs/platform/acceptance.md` und eigene Rohbelege unter `outputs/platform/qa/<run-id>/`. Bestehende Prüfungen lesen/ausführen, nicht ihre Erwartungen stillschweigend lockern. Fachfixtures der Matchspur konsumieren, nicht konkurrierend dieselben Fixtures schreiben.

**Agentenprompt:**

> Erstelle eine unabhängige Abnahmematrix für PC und frühe installierbare Android-Testlieferungen; öffentliche Releasefolge weiterhin PC zuerst und Android-Store danach. Keine große freiwillige Testgruppe als internes Pflichtgate. Prüfe echte Installation und mindestens zwei aufeinanderfolgende signierte Lieferungen als Update auf Pixel 9a und Pixel 9 Pro XL, mit Erhalt neuer Karrieren/Einstellungen, korrektem Account-/Offlinezustand und keinen doppelten Buchungen. Falsche Signierung/Paketkennung, ältere Version und unterbrochenen Download als negative Fälle prüfen; keinen Deinstallationszwang oder Datenreset als erfolgreichen Updateweg akzeptieren. Konkreten Verteilungs-/Signierungsvertrag übernimmt der Integrator nach S01-Vorbereitung. Ordne jedem bestätigten Verhalten mindestens eine konkrete Szene oder begründete vollständige Matchprüfung zu. Offene Budgetwerte und fehlende Hardware bleiben ausdrücklich offen, keine grünen Statusfelder aufgrund von Planung.
>
> Übernimm gezielte Matchfixtures: freies Tor trotz seitlichem Keeper; erreichbare/unerreichbare Parade; Strafraumgrenze und Rückpass-/Einwurfherkunft; konkurrierende Abfänger; echter Block und Abpraller; Tiefenlauf und Planänderung; veränderte Einzelwerte bei sonst gleichem Spieler; beide Angriffsrichtungen. Prüfe reale Kontakt- und Ereignisdaten, nicht nur Bildnähe.
>
> Prüfe identische Simulation bei 2D/3D, Pause, Rückschau und verschiedenen Bildraten innerhalb desselben Enginepfads. Ergebnis, Ereignisse, Einsätze und Statistiken werden genau einmal verbucht. Browserquellseite und Offline-Build müssen denselben Stand verwenden. Zwischen Engines gelten Fachinvarianten und Verteilungen, keine erzwungene bitgleiche Physik.
>
> Prüfe Hintergrundwechsel, Orientierung, Matchabbruch während Vorbereitung/Flug, Wiederaufnahme am letzten bestätigten sicheren Punkt, unterbrochenen Speichervorgang und wiederholte Ergebnisübergabe. Isolierte Testprofile und eigene neue Karrieren verwenden, keine persönlichen Daten öffnen oder Altstände umrechnen. Fähigkeiten einschließlich zugänglicher Beschriftungen erscheinen nur als Farbstufen; verborgenes Talent bleibt vollständig unsichtbar.
>
> Übernimm Performance-Rohdaten mit deren tatsächlicher Umgebung. Führe Hardwareabnahme auf Pixel 9 Pro XL und Pixel 9a durch, sobald Zugriff bereitsteht. Emulatorbefunde als Funktion/Layout kennzeichnen. iPhonefreigabe ist eine spätere offene Stufe. Vollständige Rückschau, Speicherwachstum, Touch, DE/EN und die beiden Mannschafts-/Feldvarianten einschließen.
>
> Balance ist eine getrennte Studie mit fixiertem Parameterstand, gepaarten Seeds, kontrollierten Einzelwerten und gewechseltem Heimrecht. Mindestens 30 Partien pro erstem Vergleich sind ein bestehender Arbeitsansatz, kein statistischer Beweis seltener Regeln. Seltene Regeln gezielt testen. Qualität und Entwicklung über mehrere Saisons prüft die Spieler-/Generierungsspur; keine parallel veränderten Gewichte. Bekannte historische Fixturefehler dokumentieren und von neuen Regressionen trennen.
>
> Liefere Nachweismatrix mit bestanden/offen/fehlgeschlagen, Rohbelegpfaden, Reproduktionsbefehlen und konkreten Befunden für den zuständigen Agenten. Kein eigener Produktfix in fremden Dateien. Public Release, Versionsanhebung und Livevergleich bleiben Integratoraufträge nach lokaler Abnahme.

**Fertig:** unabhängige Evidenz samt offenen Freigabepunkten. Ein Testbuild ist keine Storefreigabe; ein Emulatorlauf ist keine Hardwareabnahme.

## S01: Offline-, spätere Cloud- und Storeverträge

**Start:** Vertrag, Ausfallszenen und lokale Testdoubles können parallel vorbereitet werden. Produktadapter erst nach feststehendem Match-/Speichervertrag und Enginewahl. Vollständige Cloudfortsetzung und öffentliche Storefreigaben sind spätere Umsetzungspakete. Android-Installations-/Updatevertrag dagegen früh vorbereiten: nach Engine-/Appentscheidung echte installierbare Testlieferungen mit Folgeupdates und Erhalt neuer Karrieren/Einstellungen parallel zum PC-Ausbau, nicht erst nach öffentlicher PC-Freigabe. Accounterstellung und lesende Adminstatistik gehören dagegen bereits zum ersten PC-Release und werden separat durch [C01/C02](04-accounts-adminstatistik.md) geplant. S01 nutzt deren Identitätsvertrag, baut keine zweite Anmeldung.

**Eigentum, künftig:** neue `docs/platform/offline-cloud-contract.md`, `docs/platform/android-release-readiness.md`, `work/platform/data/checkpoint-contract.json`, `work/platform/data/sync-state-model.cjs`, `work/platform/data/test-sync-state-model.cjs`. Kein Backenddeployment, keine echten Accounts, Geheimnisse, Vertragsabschlüsse oder Storeuploads. Bestehende Speicherung und Matchadapter nur lesen; Produktionsanbindung durch Integrator.

**Agentenprompt:**

> Definiere einen kleinen engineunabhängigen Vertrag für neue Karrieren: stabile Karriere-/Spieler-/Match-/Ereigniskennungen, Schema-/Simulationsversion, sichere Zustandsrevision, Ausgangsrevision, aktive Gerätegeneration und Wiederholungsschlüssel. Matchzustand enthält wiederherstellbare Zeit, Zufall, Spieler/Ball, Absichten und abgeschlossene Buchungen. Keine serialisierten JavaScript-Callbacks und keine nachträgliche Rekonstruktion alter laufender Flüge.
>
> Offline-Spiel bleibt nach erfolgreicher Anmeldung auf dem freigeschalteten Gerät möglich; kein Gastzugang ohne Account. Erste Anmeldung benötigt Netz. C01/I00/I04 liefern den minimalen Account-/Offlinefreigabevertrag bereits vor dem ersten PC-Release; S01 ergänzt spätere Cloudfortsetzung, ohne eine zweite Berechtigungsautorität einzuführen. Ausdrückliche Abmeldung sperrt bestätigt auch Offline-Spiel; gespeicherter Fortschritt bleibt erhalten, Freischaltung erst nach erneuter erfolgreicher Onlineanmeldung. Abmeldung ohne Netz, Neustart/Neuladen, offene Tabs und Wiederanmeldung gehören zur Q01-Abnahme. Offlinefrist ist mit 30 Tagen ab letzter erfolgreicher Onlineprüfung bestätigt; erfolgreiche Wiederprüfung erneuert sie. Q01 prüft vor/an/nach Ablauf, Neustart, Fehlprüfung, Uhrzurückstellen und Fortschrittserhalt. Bestehende Altkarrieren werden nicht in den neuen Ausbau übernommen; gespeicherte Altdaten unangetastet lassen. Sichere Zeitprüfung, automatischen API-Ablauf und entfernte Widerrufe zentral abstimmen; entfernte Sperren können offline nicht sofort erkannt werden. Erforderliche Elternfreigabe gilt auch vor Offlinefreischaltung. Nach Appabbruch zählt der letzte dauerhaft bestätigte sichere Unterbrechungspunkt. Unterscheide flüchtigen Arbeitsspeicher, eingereihten Schreibauftrag und tatsächlich bestätigten Stand. Ergebnisbuchung und Checkpointgrenze dürfen keine halb bestätigten Statistiken erzeugen. Prüfe bestehende v61-/v65-Funktionen als Anker, ohne eine zweite Speicherautorität einzuführen.
>
> Für spätere Cloudkarrieren gilt genau eine aktive Gerätegeneration. Gerätewechsel erst nach bestätigtem Upload, Serverrevision und erfolgreichem Laden auf dem neuen Gerät. Verspätete Uploads alter Generationen oder falscher Ausgangsrevision werden abgewiesen. Kein automatisches Zusammenführen verschiedener Offlinefortschritte. Eine lokale UI-Sperre allein garantiert dies nicht; der Serververtrag muss Revision und Generation prüfen. Bei verlorenem Altgerät ist nur zuletzt bestätigter Cloudstand bekannt. Definiere Wiederholung, verlorene Bestätigung, Crash während Übergabe, unterbrochenes Netz, stale Upload, wiederholtes Ergebnis und accountbezogene Wiederherstellung mit einem lokalen Zustandsmodell. Noch keine Anbieterbindung.
>
> Bereite Android-Releasefragen als Checkliste tatsächlicher Voraussetzungen vor: Projekt-/Paketkennung, Signierungsverantwortung, Schlüsselaufbewahrung, Update- und Datenpfad, interne Testverteilung, unterstützte Geräte, Rechte/Datenflüsse, Entwicklerkonto und spätere aktuelle Storevorgaben. Noch offene Kaufgeltung, Zahlungs-/Werbeanbieter sowie Zielgruppen- oder Datenfragen als offene Entscheidung benennen, nicht Werbe-/Tracking-SDKs hinzufügen. Öffentliche Freigabe PC-Browser zuerst, Android-Store danach; frühe installierbare und über vorhandene Installation aktualisierbare Android-Testlieferungen dagegen parallel zum PC-Ausbau vorbereiten. Neue Appkarrieren/Einstellungen erhalten; Altprodukt-Karrieren nicht übernehmen. Paket-/Signierungs-/Versionsfolge und Übergang APK zu Play vor verbindlicher dauerhafter Testinstallation mit Integrator vereinbaren. Verteilungsweg ist bestätigt: erste private Tests über signierte APK-Dateien zum Download mit manuellen Installationen/Updates, später Google Play. Updatehinweis im Hauptmenü mit Versionsnummer und Downloadknopf ist bestätigt; Download und Installation bleiben bewusste Nutzeraktionen. Integrator definiert Versions-/Downloadvertrag, S01 bereitet ihn vor. Q01 prüft neuere/gleiche/ältere Version, falschen Kanal, fehlende Metadaten, Offline/Timeout, Wiederholung und verspätete Antwort nach Matchwechsel; kein Hinweis oder Pausenzwang im Match, keine Blockade berechtigten Spiels bei Prüfungsfehler und keine Verlängerung der Offlinefrist allein durch Versionsabfrage. Downloadort, Prüftakt und Signierungszuständigkeit bleiben festzulegen; keinen eigenen lautlosen Auto-Updater entwickeln. Den ersten APK-Updatepfad tatsächlich prüfen, nicht durch einen Storestub ersetzen; [Android-Installations-/Updateplan](../android-installation-update-plan.md). iPhone samt Builddienst später.
>
> Dienste erst nach Bedarf und aktuellen Primärquellen bewerten. Monatliche Gesamtkosten höchstens 30 Euro außerhalb Meshy; Storekonten und mögliche einmalige Kosten separat als ungeklärte Ressourcen nennen, keine Preise erfinden. Liefere einen Anbieter-unabhängigen Vertrag und lokale Fehlerszenen. Vollständige Cloud-/Storeimplementierung startet erst mit gesondertem konkretem Auftrag. Accountbetrieb und Adminstatistik sind für den ersten PC-Release eingeplant, bleiben unter demselben Ausführungsstopp.

**Schnittstellen:** Integrator besitzt sichere Snapshot-/Ergebnisanbindung; Datenpaket liefert Prüfmodell, keine zweite Weltwirtschaft. E01 zeigt Plattform-Lifecycle; Q01 konsumiert die vereinbarten Ausfallszenen. Bestehende Karrieren werden nicht automatisch verändert oder zu gewerteten Serverkarrieren erklärt.

**Fertig:** prüfbarer Zustandsvertrag mit lokalen Fehlerszenen und Ressourcenliste. Vollständige Produkt-Cloud und Storefreigabe bleiben spätere Arbeiten; Accountbetrieb und Adminstatistik sind eigene C01/C02-Pakete vor dem ersten PC-Release.

## Geprüfte Quell- und Testanker

Diese Anker wurden am 7. Oktober 2026 schmal am aktuellen Quellstand geprüft. Vor jedem späteren Eingriff erneut aktuelle geladene Funktionen feststellen.

| Bereich | Tatsächlicher Anker | Bedeutung für den Auftrag |
| --- | --- | --- |
| Assetladen | `dist/player-user-bootstrap-v112.js:8–17` | Lädt `football-v130.glb`, `calibration-v130.json`, `cloth-mask.png` gemeinsam; Grafikzufall getrennt; Match wird beim fertigen Asset neu dargestellt. |
| Rig | `dist/player-user-meshy-v107.js:8` | Prüft 28 Gelenke. Eine andere Rigbasis ist keine kompatible Lieferung ohne neue Probe. |
| Grafikqualität | `dist/pitch-scene-v98.js:10`, `docs/mobile-3d-performance-v135.md` | Primäre Touchbedienung als aktueller Qualitätszweig; keine Aussage über thermische Messfähigkeit. |
| Renderpfad | `dist/world-pitch3d-v98.js`, insbesondere `v98RenderScene` und `v98Render` | Gemeinsame Darstellung und Bildplanung; serieller Integrationsbesitz. |
| Rückschau | `dist/world-goal-replay-v103.js`, `work/test-mobile-performance-v135.cjs` | Vollständige Wiedergabe und deren Zeit-/Bildplanung bleiben zu prüfen. |
| Sicherer Matchstand | `dist/world-physical-v65.js:53`, `:63`, `:145` | `v65Snapshot`, `v65Restore` und laufende sichere Speicherung; neuer Vertrag muss tatsächliche Ausschlüsse erhalten beziehungsweise ausdrücklich präzisieren. |
| Speicherung | `dist/world-foundation-v61.js:212`, `:238`, `:277` | Gemeinsame Transaktion für Haupt-/Rückfallkopie, `v61WaitForStorage`, `v61RescueCareerData`. |
| Ladereihenfolge | `dist/index.html:151–166` | Aktive Grafik-, Raumpass- und Bootstrapanbindung. Nur Integrator ändert diese Reihenfolge. |
| Build | `work/build.cjs:7`, `:13–15` | Bindet Produktionsskripte ein und bettet aktuelle GLB, Kalibrierung und Maske ein. Neue Asset-/Modulnamen benötigen explizite Integration. |
| Testserver | `work/server.cjs:1` | Dateiallowlist und spezielle Assetpfade; neue Dateien werden nicht automatisch ausgeliefert. |
| Mobile-Befunde | `work/check-mobile-performance-v135.cjs:43` | JSON benennt Emulation und SwiftShader ausdrücklich. Neue Messung darf diesen Befund nicht als echten Pixeltest umdeuten. |
| Parität | `work/check-world-pitch3d-browser.cjs`, `work/run-space-parity-v150.cjs` | Vorhandener vollständiger Browservergleich und aktueller Raumpass-Adapter; eigene neue Berichte erhalten eigene Pfade. |
| Bestehende Prüfpakete | `work/run-mobile-regression-v135.cjs`, `work/verify-space-passes-v150.cjs`, `work/verify-play-block-v127.cjs` | Historische Nachweise nicht überschreiben oder Prüfziele stillschweigend abschwächen. Abhängigkeiten vor Ausführung prüfen. |

## Parallelität und Integrationsgrenzen

Mit vier verfügbaren Instanzen können Integrator und drei Fachagenten gleichzeitig arbeiten. Die sechs Pakete sind ein Pool, keine Zusage sechs paralleler Prozesse.

1. Ohne Engineentscheidung: R01-Baselinewerkzeuge, A01-Inventar und S01-Vertrag parallel. Q01-Spezifikation kann eine fertige Spur ersetzen. Gemeinsame Fachfixtures und Kontaktvertrag kommen aus der Matchplanung.
2. Begrenzte Probe: E01, R01 und A02 gegen eingefrorene Assets. Keine simultane Leistungsmessung auf demselben Gerät. A01 liefert Kandidaten vor dem Vergleich, ändert sie nicht währenddessen.
3. Nach Engineentscheidung: Plattformadapter und lokale Lifecycleintegration im gewählten Pfad; Q01 prüft vollständige Partien. Produktionsrig/-renderer werden in einzelnen seriellen Fenstern integriert. MSH-03/04 nur nach bestandenem Pilot und konkretem Produktionsauftrag.
4. Schon parallel zum PC-Ausbau nach Engine-/Appentscheidung: frühe installierbare Android-Testfassung, signierte Folgeupdates und echte Geräteabnahme auf beiden Pixels. Nach bestandener Abnahme öffentliche Freigaben in bestätigter Reihenfolge; vollständiger Cloudbetrieb und Stores folgen gesondert. iPhone bleibt eine spätere Welle.

## Noch offene Entscheidungen ohne Vorwegnahme

- Pixel 9a und Pixel 9 Pro XL sind verbindlich gesetzt. Eine schwächere Androidreferenz ist eine optionale spätere Ergänzung, kein offenes Pflichtgate dieser Gerätefestlegung.
- Welche gemessenen MB-, Speicher-, Ausreißer- und Dauerlastbudgets werden verbindliche Freigabegrenzen? PC-Ladezeitfenster und stabile 30 Bilder/s auf beiden Android-Referenzgeräten sind bestätigt; weitere konkrete Messbudgets bleiben offen.
- Welcher Android-Appweg und welche Engine bestehen den tatsächlichen Vergleich? Keine Vorauswahl allein aus Werkzeugangebot oder Verpackung.
- Bestätigt: Noch kein Google-Play-Entwicklerkonto. Wer übernimmt Kontoanlage/Signierung und die getrennte einmalige Registrierungsgebühr? Für einen neuen privaten Account derzeit mindestens 12 Testpersonen mit 14 Tagen durchgehender geschlossener Testanmeldung vor Produktionsantrag einplanen; Testerrekrutierung ist auf Nutzerentscheidung ausdrücklich bis zur späteren Storevorbereitung zurückgestellt, keine Suche oder Ansprache jetzt. Sie hält die kleine private APK-Abnahme nicht auf; vor Produktionsantrag tatsächliche Erfüllung der dann geltenden Auflage prüfen. Diese Storeauflage nicht mit der kleinen privaten APK-Abnahme gleichsetzen. Quellen und Aktualitätsgrenzen im [Installations-/Updateplan](../android-installation-update-plan.md). Weitere einmalige Ressourcen und iOS bleiben offen.
- Welche Accountwiederherstellung und verlorenes-Gerät-Übergabe wird später angeboten? Unbekannter Offlinefortschritt kann nicht aus der Cloud rekonstruiert werden.

Diese Punkte blockieren Inventar, Schnittstellen, Messwerkzeuge und lokale Szenen nicht. Hardwarefreigabe, Anbieterbindung und öffentliche Veröffentlichung erfordern dagegen konkrete Nachweise beziehungsweise spätere Entscheidungen.


