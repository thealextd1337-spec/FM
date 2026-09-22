# Entwicklung und Veröffentlichung

## Code, Prüfung und Veröffentlichung

- Quellstand: `dist/`. Die versionierten Skripte werden in der Reihenfolge von `dist/index.html` geladen; neuere Dateien überschreiben teils ältere Funktionen. Vor Änderungen die ganze relevante Aufrufkette prüfen.
- `node work/server.cjs` startet lokal auf Port 4173. `node work/build.cjs` erzeugt die Einzeldatei `outputs/index.html`. `outputs/` und temporäre Dateien bleiben außerhalb von Git.
- Passende Tests aus `work/test-*.cjs` ausführen. `node work/test-v31.cjs` simuliert zwölf Saisonen; `node work/test-v35.cjs` prüft die Transferansicht und den übernommenen Saisonablauf; `node work/test-v36.cjs` prüft die Jugendverpflichtung mit und ohne Scouting. Bei Änderungen an Finanzen, Transfers oder Saisonwechsel mindestens den Dauertest erneut ausführen.
- `node work/test-v41.cjs` prüft Pokalspielplan, getrennte Statistiken, Sieger-Award, einmalige Prämie und Elfmeterschützen.
- `node work/test-v42.cjs` prüft das gespeicherte Elfmeterschießen nach einem Remis und die isolierte Demo.
- `node work/test-v43.cjs` prüft Vereinsrekorde und Awardhistorie.
- `node work/test-v44.cjs` prüft Trikot- und Logowahl, Kontrast und Torwarttrikot.
- `node work/test-v50.cjs` prüft Fouls, Freistöße, Ecken, Blocks, Abpraller, reguläre Elfmeter, Aggressivität, Halbzeit, Spielende und den Pokalübergang.
- `node work/test-v50-balance.cjs` simuliert 108 vollständige Matches mit drei eigenen und drei gegnerischen Aggressivitätsstufen. Der Test prüft die Foulhäufigkeit, Standardsituationen und Spieldauer.
- `node work/test-v51.cjs` prüft gekoppelte Form und Frische, Ermüdung im Match und den gespeicherten Frischewert nach Abpfiff. `node work/test-v52.cjs` prüft den stufenlosen Balken, Variante A sowie die einmalige Erholung nach Match und Neuladen. `node work/generate-status-icons.cjs` erzeugt die SVG-Symbole, die Vorschau und ihre Daten für den Einzeldatei-Build.
- `node work/test-v55.cjs` prüft neue Spielstände und Computerkader mit Fähigkeiten von 1–20, den sichtbaren Einwurf, Abseits und den kurzen Freistoß. Der frühere `test-v53.cjs` und sein 0–20-Prüfspielstand beschreiben den nicht mehr ladbaren Vorgängerstand.
- `node work/test-v56.cjs` prüft die körperliche Reichweite von Zweikämpfen, sichtbare Grätschen mit Ball- oder Körperkontakt, Fouls ohne Karten oder Platzverweise, die volle Spielerzahl, Abstand bei Luftduellen und vollständige Matches.
- `node work/test-v57.cjs` prüft die Positionierung beider Teams bei Freistoß und Abseits, die lesbare Abseitsszene sowie Ausblendung und anschließende halbe Sekunde Spielpause.
- GitHub-Repository: `thealextd1337-spec/FM` (öffentlich). Ein Push auf `main` startet den Deployment-Workflow für `https://fussball.cakamper.at/` auf World4You; der Workflow kann auch manuell gestartet werden. Vor einer Veröffentlichung Build und Live-Version gesondert prüfen. Bestehende Branch-Historie vor Push oder Merge prüfen und nicht mit Force Push überschreiben.

## Stärkeskala und neue Matchregeln

`dist/strength-v55.js` erzeugt Spieler und Computerkader direkt mit ganzzahligen Fähigkeiten von 1 bis 20. `ability()` liefert effektive Matchwerte auf derselben Skala; Form, Frische, Alter, Müdigkeit und fremde Einsatzposition werden dort berücksichtigt. Scouting, Transferqualität, Gehälter, Saisonereignisse und Elfmeterschießen rechnen direkt mit der 20er-Skala. Frischeprozente, Geldbeträge, Wahrscheinlichkeiten und Spielnoten behalten eigene Einheiten.

`dist/pitch-v55.js` bündelt Abwehrlinie, Einsatzposition, hohe Bälle, Flanken, Luftduelle, Einwurf und Abseits. Alte Spielstände werden auf ausdrücklichen Produktentscheid hin nicht migriert: gelesen werden nur `sechser.saves.v5` und Exporte mit Schema 5. Die Computerkader entstehen in jeder neuen Karriere erneut. `dist/strength-v53.js` ist ein nicht mehr geladenes Vorgängerskript mit alten Kompatibilitätsumrechnungen; neue Aufrufstellen dürfen es nicht verwenden. Der Build und der lokale Server müssen neue Skripte in ihrer Dateiliste führen.

`dist/pitch-v56.js` ersetzt die alte abstrakte Zweikampfentscheidung durch Kontakt- und Richtungsprüfung in Spielfeldpixeln. Grätschen laufen über mehrere Simulationsschritte und unterbrechen die reguläre Spielerbewegung bis zur kurzen Erholung. Die vorhandenen Foul- und Standardsituationsregeln bleiben maßgeblich; es werden keine Karten oder Platzverweise erzeugt.

`dist/pitch-v57.js` bewegt die Spieler während der Freistoß- und Abseitsbanner zu festen Wiederanstoßpositionen. `dist/set-pieces-v50.js` hält Freistöße nach dem Ausblenden für weitere 0,5 reale Sekunden an; Ecken, Elfmeter und Anstöße behalten ihren bisherigen Ablauf.

Bei Änderungen an der Spiellogik `node work/test-v55.cjs`, `node work/build.cjs` und einen vollständigen Browser-Match prüfen. Besonders prüfen: Ball außerhalb der Seitenlinie während des Einwurfs, verlangsamte Uhr bei weiterlaufender Bewegung, Abseitslinie und Wiederanstoß, Kurzpass nach Abseits, tatsächlicher Landepunkt hoher Bälle und keine doppelten Schüsse oder Vorlagen.
