# Native Grätschenprojektion

Stand: 9. Oktober 2026. Lokale Umsetzung auf Basis Release 114, keine Veröffentlichung.

Die bisherige Unity-Brücke übertrug zwar Laufbewegung und Fußballaktionen, aber nicht die vorhandene Grätschenphase. `v98PitchFrame` liefert jetzt eine separate optionale `unityAction` aus `match.slide`, `slideActive`, Bewegungsrichtung und `recoverUntil`. Bestehende Browseraktionen und deren Rig-Pfad bleiben erhalten. Die Unity-Brücke wählt Foulreaktionen vor dieser Pose und überträgt anschließend Rutschen oder Aufstehen mit Fortschritt, Dauer, Richtung und Kontaktziel. Die Laufzeit benötigt dafür keinen eigenen fortschreitenden Timer.

Die Rutschdauer ist 0,65 Sekunden; die Erholung wird aus der verbleibenden nativen Erholungszeit innerhalb des vorhandenen 0,6-Zeitfensters abgeleitet. Der Bildpuffer interpoliert den Fortschritt innerhalb derselben Phase und wechselt erst an der nächsten Bildgrenze. Beide Feldgrößen skalieren Kontaktziel und Richtung gemeinsam. Keine neuen Match-/Karrierefelder, Ergebnisbuchungen, Zufallsziehungen oder Rückberechnungen.

Prüfungen:

- `node work/platform/qa/test-world-unity-contract.cjs`: bestehende Identitäts-, Geometrie-, Kamera- und reine Bildprojektion bestanden.
- `node work/platform/qa/test-world-unity-slides.cjs`: aktive Grätsche, Erholung, Foulvorrang, gedrehte Richtung, große Geometrie, Bildpuffer und Pause bestanden.
- `node work/build.cjs`: regulärer lokaler HTML-/Offline-Build erzeugt, Versionsstand 114 beibehalten.
- T3-Browser: zwei vollständige Partien mit großem Feld und sechs Feldspielern je Team über `work/platform/qa/unity-integration-v160.js`; einmal Kontrolllauf, einmal zusätzliche Projektion nach jedem nativen Schritt. Halbzeit, Pause und echte JSON-Fortsetzung waren Teil beider Läufe. Alle 14 Zustands-/Buchungshashes und Gesamtfingerabdruck `44417dc8` stimmen überein. 32 aktive Rutschbilder, 40 Erholungsbilder und 164 Foulverursacherbilder wurden ohne ungültige Position/Richtung/Fortschritt erfasst. [Lokaler Nachweis](../../outputs/3d-quality/native-slide-parity.json).

Dieser Nachweis betrifft die native Projektion und ihre Ergebnisneutralität. Er belegt weder die sichtbare Unity-Grätsche noch deren Posequalität oder Smartphoneleistung. Diese Abnahme gehört zur Unity-Umsetzung und zum [Animationsaudit](animation-quality-audit.md).

Zusätzlich bestand dieselbe vollständige Partie im regulär erzeugten HTML-Build, lokal über HTTP geladen: derselbe Gesamtfingerabdruck `44417dc8` und alle 14 Teilhashes. [Buildnachweis](../../outputs/3d-quality/native-slide-built.json). Dies ist kein Offline-Netzwerk- oder neuer Unity-Rendernachweis.

Nach der Unity-Übergabe bestand dieselbe große 14-Spieler-Partie auch mit tatsächlich laufendem WebGL, wiederum Fingerabdruck `44417dc8`. Rig-/Editorbilder und der separate Browserlauf stehen in [Unity-Umsetzung](3d-quality-unity.md) und [Gesamtabnahme](3d-quality-validation.md). Die ursprünglichen Projektionsnachweise bleiben unverändert erhalten.
