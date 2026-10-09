# Release 119: Ablauf der offensiven Laufangebote

Stand: 10. Oktober 2026. Zwei Stock-Proben abgeschlossen; keine Produktionsänderung und kein privater Kandidat.

## Umfang

Standardfeld mit fünf beziehungsweise sechs Feldspielern, Karriere `shot119-0`, PRNG-Start `169032`, erste Ligapartie `S1:GER:LEAGUE:R1:GER-6-GER-2:1`. Beide vollständigen beobachteten Laufdigests stimmen exakt mit den vorhandenen unbeobachteten Kontrollen überein: Ergebnis, Statistiken, Ereignisse, Belastung, physischer Zustand, Fortsetzungszustand sowie PRNG-Endpunkt und Anzahl der Zufallsziehungen. Sämtliche geladenen Quellbytes entsprechen der Baseline. Kein großes Feld und kein weiterer Lauf wurden benötigt.

Der Observer liest tatsächliche Aufrufe von `v152PrepareAttack`, `v159Offers`, `v157Target`, `v162RecoverTarget` und `v157Move`. Er speichert lokale Plain-Snapshots und Intent-Identitäten. Vorhandene Getter werden nicht zusätzlich aufgerufen, um native Bewegungsmodi zu erzeugen. Die Pausenklassifikation beobachtet ausschließlich die tatsächlich ausgeführten Aufrufe von `v121PositioningPaused`.

## Ergebnisse

| Beobachtung | Standard 5 | Standard 6 |
| --- | ---: | ---: |
| Zugewiesene Tiefenläufe | 33 | 69 |
| Offer-Resets: Besitzerwechsel / Ablauf / erreicht / crowded | 61 / 19 / 0 / 0 | 46 / 24 / 1 / 0 |
| Tiefenläufe am Offer-Ablauf, registrierter und aktueller Besitzer gleich | 4 | 13 |
| Alter dieser Läufe, Mittel | 1,050 s | 1,054 s |
| Tatsächliche gültige Move-dt, Mittel | 1,050 s | 1,054 s |
| Anfangsdistanz zum Wunschziel, Mittel | 9,92 m | 10,37 m |
| Rest zum Wunschziel, Mittel | 7,13 m | 6,87 m |
| Wunschziel jenseits der zuletzt beobachteten Formationsgrenze | 3 von 4 | 11 von 13 |
| Rest zum letzten tatsächlich beobachteten Bewegungstarget, Mittel | 5,93 m | 3,40 m |
| Noch mehr als 1,5 m vom tatsächlichen Bewegungstarget entfernt | 4 von 4 | 10 von 13 |
| Offer-Abläufe ohne neuen Tiefenläufer | 15 von 19 | 8 von 24 |
| Davon kein grundsätzlich geeigneter Läufer / alle geeigneten in Recovery | 8 / 7 | 0 / 8 |
| Auslaufende Tiefenläufer mit tatsächlich gesetzter 0,55-s-Recovery | 4 | 13 |
| Wiederzuweisung nach Ablauf bei gleicher Besitzer-ID an den Endpunkten | einmal nach 1,05 s | sechsmal nach 1,05 s; einmal nach 2,05 s |

Die tatsächlichen Bewegungstargets berücksichtigen das beobachtete Smoothing und die Formation-/Abseitsgrenze. Ihre Restdistanzen werden aus gespeicherten Positionen mit der eingefrorenen Standard-Geometrie abgeleitet. Diese Skalierung wurde gegen jede aufgezeichnete native Anfangs- und Vorwärtsdistanz geprüft; es wird kein neuer Positionscontroller verwendet.

Ein klarer Fall ohne Konflikt mit der zuletzt beobachteten Grenze ist Standard5-Lauf 5: Anfangsdistanz 11,54 m, in 1,05 s tatsächlicher Vorwärtsfortschritt 7,42 m, Restweg 3,90 m, anschließend Ablauf und Recovery. Bei Standard6 sind Läufe 31 und 60 weitere Fälle ohne diesen Grenzkonflikt, mit 3,42/3,82 m Restweg.

Die 8/29 anderen Löschungen `intent-expired-before-offer-reset` erfolgen sämtlich bei `owner=null`. Sie sind von der erneuten Planung eines gegenwärtigen Ballträgers getrennt und können beispielsweise während eines laufenden Passes entstehen. Besitzerwechsel ist insgesamt der häufigste Anlass zur Neuplanung.

Tiefenziele liegen relativ zum Ballträger, nicht zwingend vor dem ausgewählten Läufer. Bei Standard5 liegen neun zugewiesene Ziele anfangs hinter dem Läufer, bei Standard6 zwanzig. Bei drei beziehungsweise zwei der oben genannten Offer-Abläufe ist der Nettofortschritt rückwärts. Diese Geometrie und die laufende Formationsgrenze dürfen nicht als nachgewiesene Folge des kurzen Ablauftimers ausgegeben werden.

## Einordnung und Grenzen

Der kurze Ablauf mit anschließender Recovery und verzögerter Wiederzuweisung ist tatsächlich beobachtet. Bei gleicher Besitzer-ID erfolgt die häufige Wiederzuweisung erst 0,50 s nach dem Recovery-Ende. Das belegt eine Phase ohne neues Tiefenangebot für den alten Läufer. Es belegt noch keinen Verlust einer legalen Torchance und keine allgemeine Ursache der niedrigen Schusszahl.

Die Restdistanz zum ungekappten Wunschziel überschätzt in vielen Fällen den Weg, den der Spieler vor dem nächsten Pass überhaupt laufen darf. Die Prüfung `reached` nutzt trotzdem die Intention und nicht das begrenzte tatsächliche Bewegungstarget. Ein weiterer privater Kandidat muss diese beiden Sachverhalte getrennt behandeln und die Formation-/Abseitsautorität erhalten.

Besitzer-Gleichheit im Report meint den registrierten/current Besitzer am Reset oder die IDs an Wiederzuweisungs-Endpunkten. Besitzkontinuität für jeden Zwischenframe wurde nicht aufgezeichnet. Die Recovery-Bewegung wird außerdem pro Spieler über verschiedene Gründe und Support-/Tiefenangebote summiert; daraus folgt kein isoliertes Maß für durch Ablauf verursachtes Zurücklaufen.

Die Aussagen betreffen zwei Konfigurationen eines Seeds. Die Probe verändert keine Laufdauer, Beschleunigung, Formationsgrenze, Ballkontakt, Zufallsfolge oder Uhr und macht kein Tempo- oder Schussversprechen. Root besitzt weitere private Versuche und die Produktionsentscheidung. Gespeicherte Fortsetzungen, Altpfad, echte Kontakte und Halbzeit/Abpfiff bleiben vor einer späteren Integration zu prüfen.

## Verantwortliche Stellen

- `dist/world-attack-flow-v152.js:13`: Entfernen bereits abgelaufener Intentionen vor `v159Offers`; deshalb benötigt die Diagnose einen vorherigen Snapshot.
- `dist/world-football-flow-v159.js:62`: gültiges Angebot, `crowded`- und `reached`-Bedingung.
- `dist/world-football-flow-v159.js:74`: Recovery für vorherige Angebote.
- `dist/world-football-flow-v159.js:76`: Ablaufzeit und anschließende Läuferauswahl.
- `dist/world-offensive-quality-v157.js:102`: abgelaufene oder fehlende Intention geht auf den bestehenden Recovery-Pfad.
- `dist/world-offensive-quality-v157.js:106`: tatsächliches Intent-Target mit bestehender Formationsgrenze.

## Evidence

- `work/diagnose-offer-lifecycle-v119.cjs`; SHA-256 `1f6218fca0661455ded9e535c9bbfe347251f69bee1b65adc6951cc22b6e2918`.
- `outputs/3d-quality/shot-volume-v119/offer-lifecycle-diagnosis.json`; SHA-256 `d64fe8245a7fd5e4e02967bb6944585781ff021e23f461604ad40519ed80a006`.
- `outputs/3d-quality/shot-volume-v119/offer-lifecycle-summary.json`; SHA-256 `d71bef057c8eee04181cc451a29c7345ce9d70e31a7731b485ee4c9e8ece6510`.

Der Rohreport enthält tatsächliche Resets, Lauf-Endpunkte, erlaubte Kandidaten, Recovery-Ausschlüsse und Wiederzuweisungen. Die Zusammenfassung hält zusätzlich begrenzte Bewegungstargets, Quellhashes und die genannten Aussagegrenzen fest. Alle eigenen Browserkontexte und Serverprozesse wurden geschlossen.
