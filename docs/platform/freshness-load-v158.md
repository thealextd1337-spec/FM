# Belastung, Erholung und Unity-Bewegung v158

Stand: 8. Oktober 2026. Lokaler P02-Integrationsstand; keine Veröffentlichung oder allgemeine Balancefreigabe. [Reine Parameter und Schnittstellen](../player-contracts/load-v158.md).

## Aktivierung und Zuständigkeit

Eine **neu angelegte** lokale Karriere unter `players=wave3` speichert `playerFoundation.loadParameters` mit `p02-local-candidate-158-1`. Alle darin neu erzeugten Start-, Pokal-, freien und Nachwuchsspieler erhalten einen eigenen Frischezustand und Kalendercursor. Vorhandene Karrieren, einschließlich älterer wave3-Karrieren, erhalten keine Ergänzung oder Umrechnung. Der normale Karrierepfad und wave2 bleiben beim bisherigen Modell.

`dist/world-player-load-v158.js` verbindet die vorhandenen reinen P02-Rechner mit den gemeinsamen Matchcontrollern. Während einer Partie ist `state.playerLoad.players[pid]` maßgeblich. Physische Spielerkopien, 2D, Browser-3D und Unity lesen daraus. Parameter, Minutenintervalle, Aktionsursachen und offene Lastpakete sind einfache JSON-Daten. Speichern/Laden rekonstruiert keine alten Aktionen.

Die vollständige Lastledger gehört zum laufenden Einsatz und bleibt bei seinen Checkpoints erhalten. Ein neuer Einsatz beginnt mit `startFresh` aus dem dauerhaften Frischewert. Nach erfolgreicher Verbuchung speichert der Spieler diesen Endwert als neue Kalenderbasis, ohne die abgeschlossenen minutenweisen Transportquittungen anzusammeln. Das vorhandene `fixture.matchRecord` verhindert eine zweite Matchverbuchung; aktive Matchübergänge, Spieler-Kalendercursor und tatsächliche Einsatztage verhindern doppelte Erholung. Der reine P02-Rechner bleibt unverändert. Dadurch wächst der Karriere-Speicher nicht um vollständige Lastpakete jeder historischen Partie aller Vereine.

Ein Snapshot speichert den noch offenen Lastpuffer unverändert. Automatische Sicherung nach Wandzeit darf keine Last vorzeitig verbuchen oder die wirksamen Fähigkeiten innerhalb der virtuellen Minute verändern. Erst native Minuten-/Matchübergänge und tatsächliche Spielerwechsel schließen den Puffer; Laden erhält ihn zusammen mit dem Matchzustand.

Der neue Fähigkeitsadapter ersetzt in gekennzeichneten Partien den bisherigen Frische-/Zeitabzug, einschließlich der frischeabhängigen Formbegrenzung. Rohform bleibt eine Ergebnisbewertung. Bewegung erhält ihre separaten Tempo-/Beschleunigungsfaktoren genau einmal; Masse, Bremsweg und Körperdrehung bleiben im vorhandenen v157-Controller. Keine zweite Unity-Simulation.

## Tatsächliche Belastung

Native Einsätze verwenden die tatsächlich fortgeschrittene virtuelle Uhr, einschließlich anteiliger Einsatzminuten und Nachspielzeit. Laufbelastung stammt aus ausgeführten Wegen und Tempo vor der Körpertrennung. Pressing benötigt einen bewegten Annäherungsweg zu einem gegnerischen Ballführer; eine Anweisung allein kostet keine Frische. Gleichzeitiges Sprinten und Pressing teilen sich einen Ursachenanteil und werden nicht doppelt berechnet. Standards und Positionswechsel während Pausen gelten nicht als Sprint.

Erreichbare stehende Zweikämpfe und Grätschen belasten beide beteiligten Spieler einmal, unabhängig vom Erfolg. Ein Torwartabschlag oder eine Parade allein wird nicht als Hechtsprung behandelt. Neue Schüsse besitzen eine native Höhenbeschreibung; der tatsächlich gestartete Sprung-/Hechtvorgang wird einmal erfasst und dieselbe Beschreibung an die Darstellung übergeben. Ein naher tatsächlich gestarteter Keeper-Smother besitzt eine eigene Ursache. Feldspielersprünge haben gemäß Vertrag keine zusätzliche Sprunglast.

Tatsächlich erreichbare Luftzweikämpfe belasten beide Kontaktteilnehmer, ohne eine separate Feldsprunglast einzuführen. Auch der ausgeführte Torwarthecht bei einem regulären Elfmeter besitzt eine stabile, im Standard gespeicherte Ursache. Das Elfmeterschießen nach Abpfiff gehört nicht mehr zur Matchbelastung.

Kompakte Weltpartien simulieren weiterhin abstrakte Aktionen. Der neue Kandidat führt begrenzte, gespeicherte Laufwege für ausgewählte Anschlussangebote und nahe Presser aus; nur ihre aktive Teilminute wird belastet. Tatsächlich nahe Empfangskontakte können einen Zweikampf auslösen und den Angriff beenden. Neue kompakte Schüsse legen ihre Höhe und seitliche Platzierung vor dem Tor-/Paradenresultat fest. Daraus kann ein konkreter Keeper-Sprung oder Hechtvorgang entstehen. Diese Angaben sind keine rekonstruierten 3D-Bilder.

Anschlussangebot und Pressing desselben Spielers teilen sich dabei ein gespeichertes Bewegungszeitbudget von insgesamt höchstens einer aktiven Minute je tatsächlich durchlaufener virtueller Minute. Mehrere Aktionen können dieses Budget nicht mehrfach beanspruchen.

## Erholung und Kalender

Halbzeit und Abpfiff geben jedem tatsächlich eingesetzten Spieler jeweils bis zu zehn Frischepunkte zurück, einschließlich zuvor Ausgewechselter. Unbenutzte Bankspieler erhalten keinen solchen Matchbonus. Die Übergänge sind einmalig; Verlängerung der Anzeige, Neuladen oder anschließendes Elfmeterschießen buchen sie nicht erneut. Im Abschlussbericht bleiben Frische am Abpfiff und nach Erholung getrennt.

Kalendererholung verarbeitet ausschließlich vollständig abgeschlossene spielfreie Tage. Spieler besitzen einen absoluten Cursor über Saisonwechsel hinweg und die Tage tatsächlicher Einsätze. Kader, Nachwuchs und freie Spieler werden gemeinsam nach ID geprüft; ein Vereinswechsel setzt den Cursor nicht zurück. Der nächste Spieltag wird nicht schon vor seinem Ende als Ruhetag gutgeschrieben. Volle Frische benötigt keine weiteren wirkungslosen Erholungsbuchungen.

Auf zusätzliche Nutzerentscheidung starten alle Spieler jeder neu erreichten Saison mit 100 % Frische und einer zufälligen bestehenden Formstufe von −2 bis +2. Dies gilt auch im normalen Karrierepfad. Die Auswahl ist je Welt/Saison/Spieler deterministisch, wird einmal beim echten Übergang ausgeführt und leert ausschließlich das aktuelle Formnotenfenster. Historische Berichte bleiben erhalten; Laden einer laufenden Saison löst keinen Reset aus. P02-Spieler bekommen dabei die neue Frischebasis und den passenden absoluten Kalendercursor.

## Unity

Neue P02-Bilder übertragen optional `freshness` zwischen 0 und 1. Alte Bilder lassen das Feld weg; Unity behandelt fehlende Frische als nicht erfasst. Antritt und Bremsen zeigen begrenzte Oberkörperreaktionen aus tatsächlicher Beschleunigung. Laufende Kurven behalten ihren Schritt. Eine dezente müde Ruhehaltung stammt ausschließlich aus der übertragenen Frische; Standfüße, Wurzelposition und Kontaktprioritäten bleiben erhalten.

## Abnahme und Grenzen

Die [abschließende Lieferung und Nachweise](../../outputs/platform/freshness-v158/README.md) verbinden 149 aktuelle Eingaben und die tatsächlichen Unity-Binärdateien. Quelle und Build bestehen jeweils 13.342 Prüfungen: neun native und drei kompakte Hauptpartien sowie zwei weitere native Partien für die Speicherregression. 48 zusätzliche Sicherungen verändern Spielbericht, Statistik und vollständige Belastungsledger nicht. Quell-/Build-Berichte und native/Unity-Vollpartie sind exakt gleich. Unity besteht 33 Browserprüfungen einschließlich vergrößerter echter Halbzeit, zweiter Halbzeit, aktuellen Kopfprojektionen und lokalem Build, dazu 356 C#-Prüfungen. Der Unity-Build hat null Buildfehler; eine frühere MCP-Zeitüberschreitung bleibt ausdrücklich als Tooldiagnose erhalten. Der Editor ist exakt wiederhergestellt. Der dauerhafte Matchplan besteht 191 Prüfungen mit je sechs Quell-/Build-Browserfällen. Die 189 Dateien des vorherigen v157-Vergleichs bleiben unverändert archiviert.

Die Aufnahme der vergrößerten zweiten Halbzeit wartet auf die nach dem tatsächlichen Renderbild gesendeten Kopfprojektionen. Eine Empfangsbestätigung allein liegt vor diesem Bild; die erste früh aufgenommene Darstellung bleibt zur Diagnose separat unter `unity-world-before-projection-wait/` erhalten. Die aktuelle Aufnahme wurde visuell geprüft; die Namen sind an den sichtbaren Spielern verankert.

Konkrete Belastungsgewichte und Kurven bleiben Kandidaten für weitere Kalibrierung. Die drei zurückgestellten UI-Besichtigungen bleiben vorgemerkt: echtes 200-%-Zoom, echtes Smartphone/Screenreader und gemeinsame visuelle Besichtigung. Für diese spätere Besichtigung ist außerdem die schwach kontrastierte Überschrift über den Frischekarten in der hellen vergrößerten Matchansicht festgehalten; die Drag-&-Drop-Abnahme ist keine allgemeine visuelle UI-Freigabe.

Die vollständige Weltkarriere einer Testsaison lässt sich über den regulären IndexedDB-Pfad speichern und identisch lesen. Der vorhandene localStorage-Ersatzpfad mit zusätzlicher Sicherung erreicht bei dieser großen wave3-Karriere seine Speichergrenze; auch die entsprechende Kopie ohne P02 überschreitet sie. Der Fehler wird sichtbar gemeldet und überschreibt den vorherigen Eintrag nicht. Eine allgemeine Speicherformatänderung gehört nicht zu diesem Block; Unterstützung großer Karrieren im Ersatzpfad bleibt offen.
