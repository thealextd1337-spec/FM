# P02: lokaler Belastungskandidat v158

Stand: 8. Oktober 2026. Reine Ergänzung für die ausdrücklich neue lokale P02-Prüfintegration. Quelle: `dist/player-load-candidate-v158.js`; Browserexport `D6LoadCandidate`, Nodeexport `module.exports`. Keine DOM-, Uhr-, Zufalls-, Speicher- oder Matchabhängigkeit. Die bestehenden Schnittstellen von [Frische](freshness.md) und [effektiven Fähigkeiten](effective-abilities.md) bleiben erhalten.

Die konkreten Belastungsgewichte, Feld-/Keeper-Konditionsverläufe und vier linearen Kurven sind **lokale Kalibrierungskandidaten**, keine allgemeine Produktfreigabe. Die bestätigten Referenzen und maximalen Müdigkeitsabzüge bleiben maßgeblich. Keine Rekonstruktion, Ergänzung oder Umrechnung vorhandener Karrieren oder Partien. Aktivierung, tatsächliche Ereigniserfassung und Kalenderübergänge gehören zum gemeinsamen Integrator.

## API und gespeicherte Parameter

`createParameters() -> parameters` liefert tief eingefrorene, reine JSON-Daten mit Schema `d6-load-candidate-158-1` und `parameterId = p02-local-candidate-158-1`. Die beiden Kennzeichnungen sind Text; sämtliche Rechenparameter und Kurvenpunkte sind Zahlen. Der Integrator speichert den vollständigen Datensatz, keine Funktionen. Kopieren über JSON bleibt möglich.

`materializeParameters(parameters) -> runtime` validiert und kopiert den Datensatz ohne Eingabeänderung. Ausgabe:

```text
runtime.parameters       numerischer, unveränderlicher Speicherstand
runtime.loadParameters   loadPartition, actionRates, staminaFactor(stamina,kind)
runtime.effectParameters vier ausdrückliche Müdigkeitskurven
runtime.formParameters   minStage, maxStage, additivePerStage
```

`runtime.loadParameters` wird an `D6Freshness.consumeFreshness` übergeben; `runtime.effectParameters` an die vorhandenen `D6EffectiveAbilities`-Funktionen. Die reine Funktion `staminaFactor` entsteht erst im Laufzeitsatz. Nach Laden wird sie aus derselben gespeicherten Punktliste erneut erstellt. Der materialisierte Datensatz ist tief eingefroren.

Materialisierung einmal beim Anlegen/Laden ausführen und beim Integrator nach Parameterobjekt puffern. Das Modul puffert zusätzlich unveränderliche Eingaben per `WeakMap`; veränderliche JSON-Eingaben werden jeweils neu validiert und kopiert. Ein bereits materialisierter Satz wird unverändert zurückgegeben. Die bestehende Kurvenvalidierung der Kernmodule bleibt erhalten; dieses Paket verändert deren API oder Rechenwege nicht.

## Explizite lokale Rechenwerte

| Parameter | Lokaler Kandidat |
| --- | --- |
| Feldgrundlast je tatsächlich gespielter virtueller Minute | `60/90` |
| Keepergrundlast je tatsächlich gespielter virtueller Minute | `30/90` |
| Normaler Aktionsanteil der 90-Minuten-Referenz | jeweils `10` |
| Sprint | `0.35` je tatsächlich aktiver virtueller Minute |
| Pressing | `0.35` je tatsächlich aktiver virtueller Minute |
| Intensiver Zweikampf | `0.35` je tatsächlich ausgeführtem intensiven Kontakt |
| Einfacher Keeperabsprung / volle Hechtaktion | bestehende bestätigte Kosten `0.5/1` bei Kondition 10 |
| Antizipation, Entscheidungen, maximale Geschwindigkeit, Beschleunigung | jeweils `[[0,1],[100,0]]` als normierte Verlustkurve |

`normalActionCost90` wird nicht pauschal gebucht. Der normale Referenzwert entsteht ausschließlich, wenn tatsächlich beobachtete Zusatzlast zusammen zehn Punkte beträgt. Die Spiellast darf darunter oder darüber liegen. Rollen, Anweisungen, vorhergesagte Kontakte, Animationsclips, Replays und Echtzeit sind keine eigenständigen Belastungseinheiten.

Feld-Konditionskurve: `[[1,92.5/70],[6,80/70],[10,1],[14,60/70],[20,45/70]]`. Keeper-Konditionskurve: `[[1,1.36],[10,1],[20,0.8]]`. Dazwischen wird stufenlos linear interpoliert. Beide Kurven sind positiv, nicht steigend und bei Kondition 10 auf 1 normiert. Die Feldreferenzen bei Kondition 6/10/14 liefern bei identischer Normalbelastung 80/70/60 Punkte. Die übrigen Stufen und Zwischenwerte sind ausdrückliche lokale Kandidaten.

Die vorhandene Ursachengruppierung gilt weiter: Sprint und Pressing derselben physischen Laufursache kosten höchstens den größeren Beitrag; Keeperabsprung und Hechten derselben Luftaktion ebenfalls. Wird eine stärkere Beobachtung später geliefert, wird nur die Differenz gebucht. Tatsächliche intensive Kontakte bilden eine separate Gruppe. Kopfballabsprünge von Feldspielern erhalten keine eigene Sprunglast.

## Formadapter und Fähigkeiten

`formContext(skills, rawForm, runtime.formParameters) -> {multipliers}` übersetzt die bestehende additive Formwirkung für den reinen Fähigkeitsrechner. `rawForm` ist die gespeicherte Ergebnisform; sie wird auf −2 bis +2 begrenzt. Je Stufe gilt weiterhin `0.5` Fähigkeitspunkt. Für jeden Schlüssel außer `str` lautet der Faktor `(Grundfähigkeit + begrenzteForm * 0.5) / Grundfähigkeit`; Körperkraft erhält genau 1. Alle Grundwerte müssen intern auf 1–20 liegen. Die Faktoren bleiben dabei zwischen 0 und 2; das bestehende Fähigkeitsmodul begrenzt die fertige Ausgabe auf 1–20.

Die alte Funktion `v51EffectiveForm` begrenzt Form zusätzlich bei Frische 88/72/52/32. Diese Frischebegrenzung darf der neue Adapter nicht übernehmen: Die neuen Müdigkeitsfaktoren wirken danach genau einmal. Der Adapter liest deshalb weder Frische noch Matchzustand. Körperkraft erhält weiterhin keinen Formbonus oder Formmalus.

Die bestehenden bestätigten Höchstabzüge bleiben im Kernmodul: technische Fähigkeiten/Tormannspiel 10 %, Zweikampf/Luftspiel 15 %, Ruhe bei tatsächlichem Druck 20 %, Antizipation/Entscheidungen 15 %, Körperkraft 20 %, maximale Geschwindigkeit 15 % und Beschleunigung 25 %. `spd`, `sta` und `pos` erhalten keinen zusätzlichen Fähigkeitsabzug durch Müdigkeit. Die Bewegungslimits werden getrennt einmal auf die noch nicht ermüdeten Basisbewegungswerte angewendet.

## Reine Nachweise

`node work/test-player-load-candidate-v158.cjs`: elf bestandene Prüfgruppen. Reine JSON-Parameter, erneute Materialisierung, positive kontinuierliche Konditionskurven, unveränderte eingefrorene Eingaben, deterministische Ausgaben, UMD-Export ohne Browserabhängigkeiten und Fehler bei ungültigen Parametern geprüft. Zusätzlich die unveränderten Kernprüfungen `test-player-freshness.cjs` mit zehn sowie `test-player-effective-abilities.cjs` mit sieben Gruppen bestanden.

Kontrollierter normaler Feldverlauf: je Halbzeit fünf aktive Sprintminuten, `37/7` davon unabhängige aktive Pressingminuten und vier tatsächlich intensive Kontakte. Das ergibt fünf Zusatzlastpunkte je Halbzeit bei Rate `0.35`, zusätzlich zu 30 Grundlast. Daher Referenz `100→65→75→40→50`, Gesamtverbrauch 70; bei identischer Belastung und Kondition 6/14 Verbrauch 80/60. Die ruhige Prüfsequenz hat keine Zusatzaktionen und verbraucht 60; die intensive Prüfsequenz je Halbzeit 15 Sprintminuten, `67/7` unabhängige Pressingminuten und vier intensive Kontakte, insgesamt 80. Diese rechnerisch gewählten Sequenzen sind keine erwartete Aktionshäufigkeit realer Partien.

Keeperreferenz: je Halbzeit vier unabhängige einfache Absprünge und drei unabhängige Hechtaktionen, auch mit erfolgloser Parade. Mit 15 Grundlast plus fünf Aktionspunkten ergibt sich `100→80→90→70→80`, Gesamtverbrauch 40. Ohne tatsächliche Keeperaktionen beträgt die Grundlast 30. Überschneidende Minuten, inkrementelle Sprint-/Pressing- und Sprung-/Hechtbeobachtungen, JSON-Laden, Wiederholungen und einmalige Erholung sind durch den bestehenden Ledger geprüft.

Diese reinen Prüfungen belegen Rechen- und Speicherfähigkeit des lokalen Kandidaten. Tatsächliche sichtbare/kompakte Partien, native Ereignisvollständigkeit, Bank-/Wechselregeln, Kalendererholung sowie Quell-/Build-/Unity-Parität benötigen die getrennte Integrationsabnahme.
