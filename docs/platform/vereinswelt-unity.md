# Echte Vereinswelt-Partie mit Unity

Stand: 8. Oktober 2026. Der nächste ausdrücklich beauftragte Integrationsschritt ist lokal umgesetzt. Unity zeigt jetzt den tatsächlichen Vereinswelt-Matchzustand mit den beteiligten Vereinen, deren Trikots, Spielernummern, Spielernamen und aktueller Aufstellung. Die bisherige Simulation entscheidet weiterhin über Ball, Uhr, Regeln, Tore, Statistiken und Karrierebuchungen. Die getrennte Spielzugdemo bleibt verfügbar.

## Benutzung

Aktuelle Korrektur: [Namensschilder, Bewegung und Halbzeit](unity-3d-iteration.md). Dieser Folgestand ergänzt die ursprüngliche Integration; die unten namentlich genannten älteren Build- und Demoabnahmen gehören zu ihrem jeweiligen damaligen Stand.

- Vereinswelt: `http://127.0.0.1:4200/source/index.html?engine=unity`.
- Vergleichsdemo: `http://127.0.0.1:4300/?engine=unity`.
- Eine direkt geöffnete `dist/index.html` oder der Offline-Build verwendet denselben lokalen Unity-Lader auf Port 4300. Der lokale Server muss laufen. Der Spielstand bleibt im Speicherbereich der geöffneten Karriere; er wird nicht zwischen Datei- und HTTP-Seite kopiert. `?engine=browser` wählt ausdrücklich die bisherige Vergleichsdarstellung.
- Vor dem Match bleibt die taktische Ansicht erreichbar. Im laufenden Spiel stehen Unity-TV und die vorhandene 2D-Ansicht zur Verfügung. Pause, Wechsel, Halbzeit, Rückschau und Rückkehr zur Karriere verwenden die bestehenden Bedienelemente und Speichercontroller.

## Grenze zwischen Spiel und Darstellung

`dist/world-unity-v151.js` übergibt ausschließlich Bilder nach `d6-world-view-1`: Identitäten, Farben, Positionen, Blickrichtung, vorhandene Aktion, Ball, Kamera, Uhr und Spielstand. Fähigkeiten, Talent und Entwicklungspunkte werden nicht übertragen. Es gibt höchstens 20 Bilder pro Sekunde und nur eine ausstehende Bestätigung. Die Bildschleife verwendet den separaten visuellen Zufallsstrom; sie verändert keine Spielentscheidung.

`dist/unity-match/runtime.js` lädt den tatsächlichen WebGL-Build und reicht die Bilder an `WorldCommand` weiter. Eltern- und Kindfenster prüfen Gegenstelle, Herkunft und Sitzung. Für lokale Dateien ist der Elternursprung technisch `null`; Antworten gehen ausschließlich an das eigene Elternfenster, das wiederum das konkrete Kindfenster und dessen HTTP-Ursprung prüft. Fremde, verspätete und ungültige Bilder werden verworfen. C# prüft eine neue Konfiguration vor dem Ersetzen der sichtbaren Szene und übernimmt Bildfolgen atomar. Unity erhält keine Schreibschnittstelle für Karriere oder Ergebnis.

Die vorhandene Originalfigur und importierten Clips werden weitergenutzt. Lauf-, Stand-, Schuss-/Pass- und Keeperaktionen folgen dem tatsächlichen Bildzustand. Trikotmuster, Haut- und Haarfarbe werden anhand einer Stoffmaske gefärbt. Aktive Spieler werden exakt einmal erzeugt; Wechsel und rückwärts gesuchte Rückschaubilder können ihre Besetzung ändern. Nummern und Namen stehen als anklickbare Beschriftung über der Figur.

Automatische Torwiederholung und Matchrückschau konsumieren die vorhandenen Aufnahmen. Die Netzverformung wird mit dem nativen Torbild gespeichert und bei Wiederholung mit angezeigt. Sie ist in dieser Integration eine Darstellung der vorhandenen Torsequenz; die eigenständige Demo prüft zusätzlich nachgiebige physikalische Netzkontakte. Unity berechnet für eine Vereinswelt-Partie noch keine zweite Ballphysik.

Bei Lade-/Laufzeitfehlern bleibt das Match in der vorhandenen 2D-Ansicht bedienbar. Ein Wiederherstellen erzeugt eine neue Darstellungssitzung zum bestehenden Checkpoint. Verlassen des Matches entsorgt Fenster und Bildschleife; ein verborgenes Dokument pausiert den nativen Spielablauf.

## Abnahme

Die Prüfungen verwenden getrennte Testprofile und neue Testkarrieren. Der geöffnete Nutzer-Spielstand wird nicht verändert.

- [Vollständige Runtime-Prüfung](../../outputs/platform/world-unity/runtime-tests.json): tatsächlicher Unity-WebGL-Lader, Heim-/Auswärtspartie, zwölf reale Startspieler, Pause ohne Uhr-/Ball-/Zufallsänderung, Checkpoint, genau ein ausgeführter Wechsel, Rückschau, 2D-Rückweg, Entsorgung und Fehlerfall. Der direkt geöffnete Offline-Build samt Prüfung fremder Nachrichten war Bestandteil der Erstabnahme; die aktuelle Nachprüfung lädt den gebauten HTML-Stand über lokales HTTP.
- [Partievergleich mit Rohdaten](../../outputs/platform/world-unity/parity-raw.json): 2.900 gleiche Simulationstakte einschließlich Halbzeit, 99 native angezeigte Minuten, Ergebnis 0:0. Ereignisse, Spielerstatistiken, Wechsel, Spielbericht, Finanzledger, Formhistorie und Frische sind exakt gleich. Ein zusätzlicher isolierter Torfall prüft Netzbild und Wiederholung ohne Doppelbuchung; die vollständige Vergleichspartie selbst enthält kein Tor.
- [C#-Vertrag](../../outputs/platform/world-unity/contract-tests.json): ursprünglich 15 Fälle einschließlich ungültiger Identitäten, Sitzung, Koordinaten, Kamera, Netz, doppelter/veralteter Bilder und Rückschau gegen die Uhr; im aktuellen Folgestand 22 einschließlich Darstellungsbuffer und Pause. Die JavaScript-Prüfung unter `work/platform/qa/test-world-unity-contract.cjs` prüft die Whitelist und unveränderte Quelldaten.
- Bestehende Demokerne erneut bestanden: [288 Kontakte und Zwischenstände](../../prototypes/match-engine-unity/selftest.json), [24 Spielzüge](../../prototypes/match-engine-unity/play-tests.json), [48 Physikfälle](../../prototypes/match-engine-unity/physics-tests.json) und [acht Netzfälle](../../prototypes/match-engine-unity/net-tests.json). [Sechs sichtbare Unity-Web-Spielzüge der Erstabnahme](../../outputs/platform/qa/2026-10-08T12-22-04-169Z-unity-play/report.json) mit beiden Richtungen, 12/14 Figuren, Pause, Wiederherstellung, Annahme, Abpraller und Reset; die erneute Prüfung mit dem neuen Build steht in der [3D-Iteration](unity-3d-iteration.md).
- [Unity-Build der Erstabnahme](../../outputs/platform/world-unity/build-report.json): `build_19b10dc75210`, erfolgreich, keine Fehler, drei bestehende Werkzeug-/APIwarnungen. [Laufzeitmanifest](../../outputs/platform/unity-web/probe-build.json) enthält jeweils die aktuelle Quellkennung und Dateihashes. [Editor vor](../../outputs/platform/world-unity/editor-before.json) und [nach](../../outputs/platform/world-unity/editor-after.json) der Erstabnahme: ursprüngliche Grafik-/Web-Einstellungen und Windows-Buildziel wiederhergestellt; SampleScene unverändert und sauber. Neue Build-/Editornachweise unter [3D-Iteration](unity-3d-iteration.md).
- [Finale Auslieferungsprüfung](../../outputs/platform/world-unity/delivery-manifest.json): beide lokalen Server liefern den identischen aktuellen Unity- und Quellstand; 25 eingebettete UI-Dateien, gleiche Offline-Kopien und vorhandene Version 110. Je 262 UI-Prüfungen und 21 Runtime-Prüfungen bestanden. Exakte Quell-, Offline- und Unity-Dateihashes sind gespeichert. Start und Prüfung unter `work/platform/qa/verify-world-delivery.cjs`.

## Nächster Ausbau

Diese Lieferung ist eine lokale Integration der Unity-Darstellung. Generische Clips ersetzen noch nicht die gesamte vorhandene Animations-/IK-Bibliothek; Handschuhe, direkt aufgedruckte Trikotnummern und weitere Bewegungsdetails bleiben offen. Es gibt noch keine vollständige neue Unity-Match-KI und keine mobile Leistungsfreigabe. Frühere Demo-Messungen gelten nur für ihren jeweiligen Stand.

Als nächstes folgen die Spielergrundlagen P01–P03 und Rollen P04. Darauf baut die vollständige taktische Generalüberholung P05 mit Rollen, Ausrichtungen und gemeinsamen Aktionsräumen auf. Die jetzt zusätzlich modernisierten taktischen und Matchoberflächen verändern diese Regeln noch nicht. Geräteprüfungen und die drei gesondert zurückgestellten UI-Besichtigungspunkte bleiben später. Keine Veröffentlichung, Versionsanhebung, Meshy-Generierung oder rückwirkende Berechnung historischer Partien.
