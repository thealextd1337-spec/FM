# Veröffentlichung 136

Release 136 vom 26. Oktober 2026 enthält Release 135 und die geprüften Stände `feat/ai-tactics` (`8ba80dd4`, einschließlich Ballphysik 184 aus `feat/ball-physics` `40fad42e`), `fix/si-defender-drift` (`81c52b59`) und `fix/unity-skin-colors` (`f312c5ce`). Veröffentlicht wird aus `work/release-r136` auf `release/r136`. Der Nutzer hat Zusammenstellung, Versionserhöhung, Build, Deployment und Live-Abnahme beauftragt (Plan vom 26. Oktober 2026, „Führe A aus, danach B, danach C“). Kimodo-Animationen sind nicht enthalten.

## Umfang

- **Ballphysik 184:** In neuen Partien von Welten mit Stempel 183 formt die Physik die Flugbahn (Schwerkraft, Luftwiderstand, Seiteneffet, Aufspringen, Rollen, Pfosten und Latte). Ergebnisse, Flugdauern und Endpunkte bleiben vorab entschieden. [Produktregel](product.md), [Entscheidung](entscheidungen.md).
- **KI-Trainer 185:** Computertrainer stellen in neuen ausgespielten Partien solcher Welten Formation, Pressing, Abwehrlinie, Passspiel und Härte um und wechseln gezielt, wenn sie unter Druck geraten. Die Qualität hängt von der Gegneranpassung des Trainers ab. Ankündigung im Liveticker und Spielbericht. Kompakte Partien bleiben unverändert.
- **B28:** Verteidiger ohne Pressingaufgabe laufen nicht mehr vom Ballführer weg (Variante V2, Balllinienklemme in SI-4). Nutzerentscheidung vom 24. Oktober 2026: Die Korrektur bleibt trotz weniger Tore ohne Nachkalibrierung.
- **B29:** Unity-Gesichter zeigen die vorgesehenen Haut- und Haarfarben, der helle Streifen über Wangen und Nase entfällt. Neuer Unity-Binärbuild, Quellenkennung `b434de968015f08eaa33a057f0aeb982d4debdda1001dc2193aedb7873b630b3`. Der Build stammt aus der Prüfung von B29 und wurde unverändert übernommen, weil seine Quellenkennung den Quellen dieses Stands entspricht. Das neu erzeugte Manifest ist bytegleich.

Footer und `data-d6-release`, Einzeldatei-Build, Runtime-Cache, Unity-Produktmetadaten und 3D-Hilfedaten tragen gemeinsam 136.

## Bilanz

Die Matchdateien sind bytegleich zum Demostand `demo/kimodo-ball` (`5f967b2e`), auf dem die kombinierte Bilanz gemessen wurde. Gegenüber diesem Stand unterscheiden sich nur Darstellung, Einführung und der Autosave-Takt aus Release 134/135. Node-Replay mit 192 Ligapaarungen: 3,84 Tore je Partie ohne B28/185, 3,46 mit B28 (−0,38 ± 0,17), 3,61 mit B28 und KI-Trainer 185. Das Zielband 3–5 Tore bleibt erfüllt. Ballphysik 184 ist in der Referenz enthalten.

## Prüfung und Veröffentlichung

Vor dem Push liefen `work/test-release-version.cjs` und alle 135 Befehle des Produktionsworkflows lokal grün. `test-ai-coach-v185.cjs` war zunächst rot: Das Replay-Harness lädt nur einen Ausschnitt von `world-physical-v65.js` und kannte die Autosave-Konstante `V65_LIVE_SAVE_MS` aus Release 135 nicht. Es lädt die Konstante jetzt aus der Quelldatei mit. Dazu kamen:

- die R132/R133-Altszenen (`check-old-matches-v182/v183.cjs`, 158/158 und 340/340 gegen `e4e531c0`),
- die lokalen Browserprüfungen `test-world-unity-picture-contract.cjs` (0 abgelehnte Bilder) und `test-world-unity-watchdog.cjs`,
- Speichern/Fortsetzen (`check-mobile-jank-save.cjs`, 6/6 allein; ein roter Lauf parallel zur Live-Probe wegen der festen Wartezeit nach dem Fortsetzen),
- ein Probelauf der Live-Prüfung gegen den lokalen Build,
- die Offline-Publikationsprobe.

Nachweise liegen unter `outputs/release-r136/`. `main` wird ohne Umschreiben der Historie vorgespult; der Produktionsworkflow wiederholt die Prüfungen, lädt zuerst die Unity-Laufzeit und danach die Spielseite hoch.

Nach dem Deployment vergleicht `work/check-live-r136.cjs` die öffentliche Spielseite, die Runtime-Dateien und die Unity-Builddateien laut Manifest per SHA-256 mit dem lokalen Stand. Dazu startet es in einem isolierten Browserprofil je eine Partie in Unity und in 2D und prüft Speichern und Neuladen. Ergebnis am 26. Oktober 2026 nach Deploy-Lauf 40370380214: alle Prüfungen bestanden (erster Versuch: Zeitlimit beim Laden der 96-MB-Seite, Bytevergleich bereits grün). Die [Abnahme-Checkliste](abnahme-release-136.md) führt durch die offenen Nutzerabnahmen.

## Grenzen

Ballphysik, B28 und KI-Trainer wirken nur in neuen Partien von Welten mit Stempel 183; bestehende Welten und Partien werden nicht umgerechnet. Die B29-Farbkorrektur gilt für Unity; die three.js-Darstellung hat weiterhin eine zu große Augenmaske. Konkrete Nutzerabnahmen stehen aus, auch für B01/B30 am Pixel und B23–B27. B05 bleibt offen.
