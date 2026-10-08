# Welle 0/1 – lokale Vergleichsdemo

Start: 8. Oktober 2026. Welle 0 und anschließend Welle 1 wurden ausdrücklich beauftragt. Ausführung mit GPT-6 Astra/high in drei Fachslots und einer Integration. Der Umfang ist auf lokale PC-Vergleichsdemos begrenzt. Android-Appweg dokumentieren, APK-/Gerätemessungen später. Die drei UI-Besichtigungspunkte sind ausdrücklich verschoben.

## Aktueller Stand

Unity-Fußballpilot vom 8. Oktober: zwei eigene Pass-/Annahmeclips, Standfuß-/Kontaktkorrektur und kurze Übergänge in den bestehenden Spielzugproben. [Direkter Spielzug](http://127.0.0.1:4300/?engine=unity&scene=play-goal&camera=contact), [Lieferung und Abnahme](unity-football-pilot.md). Die Browservergleichsengine behält ihre bisherigen Animationen; spätere Unity-bezogene Verbesserungen ändern nicht die archivierten Engine-Leistungsmessungen. Die Figurenbasis bleibt unverändert, zusätzlich wurden für diesen späteren Pilot zwei Meshy-Bewegungen für insgesamt 20 Credits geliefert.

Neuester Stand vom 8. Oktober: Das Tornetz verformt sich lokal am Einschlag und schwingt gedämpft zurück. Rückseite, Seiten und Dach besitzen feste Randbefestigungen. Die isolierten Ballphysikproben bremsen den Ball allmählich im nachgiebigen Netz; die Netzprobe erreicht rund 77 cm Eindrücktiefe. Beide Renderer verändern dafür die tatsächlichen Netzvertices. Pause, Rücksetzen und Zwischenstand berücksichtigen die Verformung. Unity verwendet den Kontakt auch im bisherigen Nachlauf; im nativen Browsernachlauf folgt die Netzansicht der vorhandenen Ballansicht, ohne die Bestandsphysik zu ersetzen. [Aktuelle Abnahme und Grenzen](demo-acceptance.md#nachgiebige-tornetze).

Erweiterung vom 8. Oktober: Alle 42 Szenenfamilien haben unterschiedliche sichtbare Namen. Die ursprünglichen 36 Familien bleiben unverändert gekennzeichnet; sechs zusätzliche Ballphysikproben zeigen hohen Flug, Ausrollen, Bodenaufprall, Pfosten, Latte und Tor/Netz. Diese Proben verwenden einen isolierten Demokern in JavaScript und Unity, keine umgestellte Bestands-Matchphysik. Die Kontaktansicht bildet nun die tatsächliche Kontaktzone ab, auch im Mittelfeld. Torrahmen sind rund, Beteiligte und Teamfarben werden benannt. Kamera und Ballphysik verwenden dieselben Parameter; die Demo bildet weiterhin keine vollständige Partie ab. [Parameter und Grenzen](../match-contracts/shared.md#ergänzung-isolierte-ballphysikproben).

Frühere Ergänzung vom 8. Oktober: Die sichtbaren Szenen laufen drei Sekunden nach. Beide Ansichten besitzen vollständige Tornetze und eine Bodenreferenz für den Ball. Unity trennt das Kontaktresultat vom Szenenende; freie Bälle fallen und rollen aus. Gefangene Bälle bleiben gehalten. Der Browser übernimmt seine vorhandene 3D-Ballansicht zusätzlich zur getrennt erfassten logischen Position und setzt den nativen Ablauf fort. Pause, Fortsetzung und Zwischenstand funktionieren auch im Nachlauf. Der zunächst starre Netzkontakt ist durch die oben beschriebene Ergänzung ersetzt. [Nachlaufprüfung](demo-acceptance.md#nachlauf-und-tornetze).

Die Messungen weiter unten beschreiben den ursprünglichen Stand **vor** dieser Ergänzung. Für den neuen Nachlauf-/Netzstand wurde keine neue Leistungsmessung oder Engineentscheidung durchgeführt. Die Berichtsseite kennzeichnet den bisherigen Vergleich entsprechend als archiviert.

Welle 0 ist geliefert: gemeinsamer [Demovertrag](../match-contracts/shared.md), [Kontakte](../match-contracts/contacts.md), [Assetinventar](asset-inventory.md) und [Messwerkzeuge](performance-report.md). Welle 1 ist als lokale Browser-/Unity-Demo geliefert. Die abschließenden Bedien-, Bild- und Dauerprüfungen sind in der [Nachweismatrix](demo-acceptance.md) geführt. [Enginebefunde und dokumentierter Android-Appweg](engine-probe.md).

Die ursprüngliche Figurenbasis ist unverändert `football-v130.glb`. Der Basisimport verwendet eine lokal abgeleitete FBX mit gleicher Topologie und denselben 34 Clips. Die oben genannte spätere Unity-Iteration ergänzt zwei separate Bewegungsassets.

Die Funktionsabnahme besteht aus neun Browser- und zehn Unity-Prüfgruppen sowie dem tatsächlichen Wechsel Browser → Unity → Browser. Sie prüft sichtbare Bilder nach Laden, Zurücksetzen und Wiederherstellen, zwölf/vierzehn Figuren, Start/Pause/Fortsetzung, Kamera, Zustandsausgabe und Fehlerfälle. Der native Adapter hat zusätzlich 48 Wiederholungs-/Zustandsfälle bestanden. Unity besteht 288 Fachfälle einschließlich sicherer Fortsetzung und 288 Prüfungen durch die tatsächliche JSON-Befehlshülle. Diese Zahlen beschreiben unterschiedliche Prüfungen und werden nicht als gemeinsame Zahl bestandener Produktionskontakte addiert.

## Gemessener Vergleich

Beide Demos absolvierten je 20 Minuten mit 148 Neustarts und allen acht Konfigurationen ohne Seiten-, Grafik- oder Ablaufsteuerungsfehler. Keine Messintervalle gingen verloren; alle sieben eingefrorenen Quellwurzeln waren vor/nach beiden Läufen identisch. Browser-Bildabstände p50/p95/p99: 17,5/18,5/19,2 ms, Maximum 208,3 ms einschließlich Szenenwechseln; Unity: 16/18/18 ms, Maximum 20 ms.

**Keine Aussage über einen Vollspiel-Leistungssieger:** Die Browserprobe war beobachtet 99,90 % der Sitzung aktiv, Unity nur 4,18 %, weil dessen begrenzte Kontaktabläufe früh enden und danach weiter gerendert werden. Neustarts erfolgten bei beiden frühestens nach acht realen Sekunden. Gemessen ist die Stabilität dieser Render-/Kontaktproben, keine gleichwertige Match-KI. [Messmethode, Speicher, aktive Zeiten und Grenzen](performance-report.md).

Beim ersten lokalen Aufruf war das vorbereitete Bild nach 0,81 s (Browser) beziehungsweise 2,92 s (Unity) bereit. Erfasster Transfer 30,26 beziehungsweise 86,33 MB. Bei Wiederholung werden große GLB-/data-/wasm-Dateien erneut übertragen; beide Caches sind nur teilweise warm. Kein Internet-Lade- oder Android-Nachweis. Die lokale Berichtsseite liest [Ergebnisse und Rohbeleglinks](../../outputs/platform/final-report.json).

## Start

Aus dem Repository: `node work/platform/engine-probe/server.cjs`. Lokale Adresse: `http://127.0.0.1:4300/`. Browser- und Unity-Webdemo werden nacheinander auf derselben Startseite ausgewählt. Der Server bindet ausschließlich localhost. Tests nutzen frische Browserkontexte und künstliche Szenen.

Der Browseradapter lädt die aktuelle Quelle und ergänzt ausschließlich im Demo-Server einen lesenden Verweis auf das bereits geladene GLTF. So verwendet die Vergleichsansicht dieselbe geparste Figur ohne zweiten Assetimport. Die Datei unter `dist/` bleibt unverändert. Simulation und Demo-Renderer sind getrennt.

## Bedienung

1. Engine, Szene, Feld, Mannschaft und Angriffsrichtung wählen; **Szene laden** übernimmt die Auswahl. Beide Feldgrößen sind vorläufige Vergleichswerte.
2. **Start**, **Pause** und **Fortsetzen** steuern den Ablauf. **Gesamtfeld** und **Kontaktansicht** wechseln die Kamera, ohne den Spielzustand zu verändern.
3. **Zwischenstand merken** pausiert und sichert die lokale Probe. **Zwischenstand laden** stellt diesen Zustand wieder her. **Zurücksetzen** beginnt dieselbe Szene neu; **Messstand exportieren** liefert den beobachteten Zustand als JSON.

Erwartete und tatsächlich beobachtete Ereignisse stehen getrennt unter dem Spielfeld. Fehlende Unterstützung oder abweichende Bestandsregeln bleiben als Befunde sichtbar. **Vergleich und Nachweise** im Seitenfuß öffnet die lokale Ergebnistabelle mit Rohbelegen. Die Demo speichert keine produktive Karriere.

## Geprüfte Werkzeuggrundlage

Unity MCP ist direkt erreichbar, Projekt `G:/unity/My project`, Unity 6000.6.4f1, URP 17.6.0. WebGL- und Windows-Unterstützung installiert; Android-Unterstützung fehlt. Unity-Dateien dieser Demo sind ausschließlich in `Assets/Doppel6EngineProbe/` reserviert, reproduzierbare Quellkopien liegen im Repository. Die vorhandene SampleScene bleibt erhalten. Blender 5.2.2 exportiert in isolierten Hintergrundprozessen; die offene Benutzerszene wird nicht benutzt. Blender MCP beantwortet Status- und Szenenabfragen; sein älteres Add-on meldet Protokoll 11 statt 13. Meshy-Plugin/CLI 0.4.0 bestätigt authenticated und verified; anschließend tritt beim Beenden des CLI-Prozesses eine Windows-libuv-Assertion auf. Keine Anmeldung oder Zugangsdaten wurden geändert, kein neuer Meshy-Job gestartet. [Bereinigter Werkzeugnachweis](../../outputs/platform/tool-access.json).

## Später

1. Echter 200-%-Browserzoom der Flutlicht-Verwaltungsoberfläche.
2. Smartphone- und Screenreaderprüfung mit Tastatur und Dialogen.
3. Gemeinsame visuelle Besichtigung: Lesbarkeit, Abstände und Bedienung.

Diese Punkte bleiben offen und blockieren Welle 0/1 nicht. Öffentliche Veröffentlichung, Versionsanhebung, endgültige Enginewahl, weitere Ausbauwellen und Android-Geräteabnahme sind keine stillen Folgeaktionen dieses Auftrags.




## Zusammenhängende Spielzüge und Unity-Priorität

Nutzerentscheidung vom 8. Oktober 2026: Unity wird der Hauptpfad für den weiteren 3D-Ausbau. Der Browserpfad bleibt als Bestands- und Vergleichsgrundlage erhalten. Die visuelle Wahl ist keine neue Vollspiel-/Android-Leistungsmessung. Die [zusammenhängenden Spielzüge](connected-play.md) sind lokal geliefert; als nächstes folgt die abgegrenzte Unity-Anbindung an echte Vereinswelt-Partien mit Pause, Zwischenstand und Rückschau.
