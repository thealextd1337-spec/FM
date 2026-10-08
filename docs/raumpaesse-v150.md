# Pässe in den freien Raum

Stand: 5. Oktober 2026. Lokal implementiert, noch nicht veröffentlicht. Die gemeinsame physische Vereinswelt-Simulation verwendet dieselben Regeln in 2D und 3D. Die interne Modulkennung v150 ist keine neue Veröffentlichungsnummer.

## Sichtbares Verhalten

Feldspieler können einen freien Punkt vor einem Mitspieler auswählen. Bewertet werden Raumgewinn, Passweg, Laufzeit und gegnerischer Zugriff. Tiefenlauf, Außenbahn, Angriffsfokus und direkte Teamtaktik beeinflussen die Wahl. Ein freier eigener Torlauf, ein besserer Querpass und geeignete Abschlüsse behalten ihre bisherigen Entscheidungen.

Der Raumpass hat eine feste Bahn zu einem Raumziel und keinen garantierten Empfänger. Bis zu zwei Spieler je Team verfolgen pro Bewegungsschritt erreichbare Kontaktpunkte auf der verbleibenden Bahn. Geeignete Torhüter kommen im Strafraum entgegen. Jeder tatsächlich erreichbare Spieler kann den Ball aufnehmen, auch ein anderer Mitspieler als ursprünglich vorgesehen. Verlässt der Ball das Feld, folgt der vorhandene Einwurf-, Abstoß- oder Eckballpfad.

Ohne Kontakt am Ziel rollt der Ball mit seiner bestehenden Geschwindigkeit und Bodenreibung weiter. Die Balljagd wird neu bewertet. Es gibt keine Versetzung eines Spielers zum Ball und keine vorab ausgewürfelte Ballübernahme. Die gemeinsame Kontaktprüfung berücksichtigt den Weg des Balls und des Spielers während des Simulationsschritts, damit ein schneller Ball keinen dazwischen stehenden Spieler überspringt. Die bestehende Kontaktreichweite beträgt 0,8 Meter.

Passspiel beeinflusst seitliche Streuung, Über- und Unterdosierung sowie die Auswahlhäufigkeit. Technik ergänzt die Ausführung, besonders unter Druck. Stellungsspiel bestimmt die Laufreaktion; die vorhandenen effektiven Geschwindigkeits- und Konditionswerte begrenzen das tatsächliche Erreichen. Die geplanten mentalen Fähigkeiten werden nicht eingeführt. Fähigkeiten bleiben in allen Spieleransichten ausschließlich als Farbstufen sichtbar.

## Abseits, Statistik und Speichern

Die Abseitsposition wird beim Abspiel festgehalten. Ein Pfiff folgt erst beim tatsächlichen Kontakt eines damals im Abseits stehenden Mitspielers. Die Aufnahme durch einen Gegner löst diesen Pfiff nicht aus.

Ein Versuch zählt einmal als Pass. Die erfolgreiche Annahme zählt erst beim Kontakt eines anderen eigenen Spielers; bei gegnerischem Kontakt zählen Fehlpass und Interception. Eigenes Wiederaufnehmen ist keine erfolgreiche Passannahme. Ausquerung, Abseits und Abbruch schließen den Versuch ebenfalls einmalig ab. Das bestehende Ballereignisprotokoll unterscheidet Raumziel, beabsichtigten Mitspieler, tatsächlichen Empfänger und Ausgang. Direkte Anschlussaktionen verwenden die vorhandene Technik-, Abseits- und Statistiklogik.

Verfolgungsziele, Spielerreferenzen und Kontaktpläne liegen in einer WeakMap. Nur ein **neu erzeugter**, noch frei rollender Raumpass speichert `match.spacePassIntent` mit Kennung 150, Spielerkennungen, Abspielpositionen und Abseitsabsicht. Der bestehende sichere Snapshot enthält diesen einfachen Datensatz. Nach dem Laden werden die Referenzen für diesen laufenden neuen Pass wieder hergestellt. Nach Abschluss wird die Kennung entfernt. Alte freie Bälle, frühere Ergebnisse und historische Statistiken werden nicht rekonstruiert oder umgerechnet.

## Prüfung

- [Gezielte Szenen](../outputs/space-passes-v150.json), `work/check-space-passes-v150.cjs`: 14 Fälle in beiden Angriffsrichtungen für Tiefenlauf, anderen Empfänger, Abfangen, Abseits, Torwartzugriff, unerreichtes Ziel und Ausquerung. Zwei Überholduelle gewinnt jeweils der schnellere Verfolger. Passspiel und Stellungsspiel sind getrennt variiert. Tatsächliche Snapshot-Wiederherstellung erhält Passwertung und spätere Abseitsbeteiligung; ein alter freier Ball bleibt unverändert. Zusätzliche Grafikaufrufe ändern weder Matchzustand noch Zufallsstrom. Der bestehende Rücksprung zur Abspielposition bei einem Abseitspfiff ist von der Laufgeschwindigkeitsmessung getrennt.
- [Bestehende Ballaktionen](../outputs/space-regular-actions-v150.json), `work/run-space-contacts-v150.cjs`: reguläre Direktpässe und Direktabschlüsse, Kontrollfehler, unerreichte Zuspiele, Abseits, Ausquerung, Torwartzugriff und Tacklings bestehen mit unveränderten Assertions.
- [Vollständiger Matchvergleich](../outputs/world3d-parity-v150.json), `work/run-space-parity-v150.cjs`: 2.334 Schritte, identischer Verlauf, Ergebnis 1:0, Ereignisse, Wechsel, Statistiken und Buchung in 2D und 3D. Banner, Pause, Abseits, Standards, Halbzeit, Gerätewechsel, Kontextverlust, Verlassen/Speichern und Offline-Build bestehen.
- [Acht vollständige Partien](../outputs/space-match-study-v150.json), `work/check-space-matches-v150.cjs`: vier gleiche Ausgangsseeds mit ausschließlich verändertem Passspiel der eigenen Feldspieler. Insgesamt 48 automatische Raumpässe, davon 25 angenommen und 23 abgefangen; keine offenen Passabsichten am Abpfiff und keine ungültigen Positionen. Bei schwachem Passspiel erreichen 4 von 9 eigenen Raumpässen einen Mitspieler, bei starkem 10 von 14. Diese kleine Stichprobe bestätigt das Auftreten und die Abrechnung; sie ist keine allgemeine Balancefreigabe oder Aussage über Torwahrscheinlichkeiten.
- `work/test-v55.cjs`: vorhandene Match-, Anstoß-/Einwurf-, Abseits- und Karriereprüfung erfolgreich.

Build und lokale Modellprobe werden mit `work/build.cjs` und `work/generate-user-meshy-match.cjs` erzeugt. Browserprüfungen benötigen den gebündelten Node-Runtime und laufen mit getrennten Edge-Profilen; Nutzerkarrieren werden nicht gelesen. Balleffet, dauerhafter Rückschau-/Videoexport und echte Mobilhardwaremessung bleiben offen. Das bestehende Meshy-Rig wird weiterverwendet.

`work/verify-space-passes-v150.cjs` bestätigt den identischen Inhalt von Quellmodul und Offline-Build sowie den unveränderten lokalen Versionsstand 110. [Abschlussnachweis mit Quellen- und Prüfdatenhashes](../outputs/space-pass-verification-v150.json), [echte 3D-Raumpass-Szene mit dem vorhandenen Meshy-Modell](../outputs/space-pass-native-v150.png). Die lokale Testversion läuft über `work/serve-player-neustart.cjs` auf `http://127.0.0.1:4216/`; es erfolgt keine Veröffentlichung.
