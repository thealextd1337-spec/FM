# M01 – Kontakte und Regeln für Welle 0/1

Stand 8. Oktober 2026. Der Nutzer hat Welle 0 und anschließend die lokale PC-Vergleichsdemo freigegeben. Dieser Vertrag und die isolierten Prüfungen ändern keine Produktionsengine. Gemeinsames Format: [shared.md](shared.md). Die 288 Szenen unter `work/match-next/contacts/catalog.json` decken 36 Familien in vier Feld-/Spielerzahlkombinationen und beiden Angriffsrichtungen ab.

## Geometrie und ausdrücklich vorläufige Parameter

Kanonische Position/Geschwindigkeit ist `[x,y,z]`: Länge, Höhe, Breite, Ursprung Feldmitte. Team 0 greift nach +x, Team 1 nach −x an. Die spiegelverkehrte Szene wechselt die angreifende Mannschaft. Zeit ist in Sekunden angegeben. 68×44 und 81,6×52,8 sind vorläufige Szeneneinheiten, keine neue verbindliche Meterentscheidung. Feldspielerzahl ist unabhängig davon fünf oder sechs plus Keeper je Team.

Die tatsächlich aufgerufene Matchdarstellung übergibt `goalWidth=44*.2/(544/600)` an `D6PitchScene.create` (`dist/world-pitch3d-v98.js:179`). Das ergibt 9,705882352941178 Breite und 3,2352941176470593 Höhe. Der allgemeine Szenenstandard 7,6 wird dort überschrieben. `dist/pitch-scene-v98.js:53` zeichnet Strafräume mit Tiefe 10 und Breite 20, Torräume 4×10 und den Elfmeterpunkt 8 Einheiten von der Torlinie. Ballradius: 0,28×0,63=0,1764 (`:157–159`). Nur das Feld wird vergrößert; diese Abmessungen und Figurengröße bleiben gleich.

Ein nachgewiesener Bestandsunterschied bleibt sichtbar: `v150KeeperArea` in `dist/world-space-passes-v150.js:8` und die Zugriffsvorbereitung in `dist/world-backpedal-v108.js:76–77` verwenden 16,5 Tiefe und 24 Breite. Der allgemeine freie Ball in `v50ChaseLooseBall` (`dist/set-pieces-v50.js`) prüft wiederum 14×24. Familie `native-box-mismatch` liegt 12 Einheiten vor dem Tor: außerhalb der sichtbaren Box, innerhalb dieser bisherigen Kontaktboxen. Die Browserbaseline wird dafür nicht still verändert.

Die Testkonvention für Keeperhand verwendet den Ballmittelpunkt und schließt die Boxlinie ein. Körperradius und Ballvolumen werden dabei nicht zur Boxprüfung addiert. Diese Grenzkonvention, die maximale Mittelpunktreichweite 0,8, Actorradius 0,3 und die lexikografische Kontaktgleichstandsauflösung sind benannte Demoannahmen. Sie sind keine Produktfreigabe. Die Reichweite ist eine analytische Kugel um den Testanker; keine Behauptung über Hand-/Fuß-/Kopfvolumen eines animierten Körpers.

## Regelvertrag

- Jeder tatsächliche Ballkontakt prüft den kontinuierlichen relativen Ball-/Spielerweg. Die früheste erreichbare Berührung geht einer späteren vor. Zielspieler und Aktionswunsch erhalten keinen Besitzanspruch. Höhe und bisherige Bewegung bleiben relevant; Planung darf den Ball nach Freigabe nicht umlenken.
- Tor oder Aus benötigen vollständige Ballquerung. Der ganze Ball muss zwischen den Pfosten und unter der Latte liegen. Reine Mittelpunktquerung oder Endtangente genügt nicht. Der analytische Grenzprüfer bildet keine Pfosten-/Lattenkollision ab: Seine Randfälle prüfen ausschließlich, dass kein Tor vergeben wird; ein physischer Abpraller benötigt den jeweiligen Enginepfad.
- Eine Keeperrolle allein erlaubt keine Handaktion. Der Ballkontakt muss im eigenen Strafraum liegen. Absichtlicher eigener Fußrückpass und direkter eigener Einwurf sperren die Handaktion. Klar ausgeführtes oder versuchtes Wegspielen/Befreiungsschlagen mit dem Fuß hebt diese Herkunftssperre gemäß bestätigtem Rollenplan auf; bloße Kontrolle nicht. Unzulässiger tatsächlicher Handkontakt aus gesperrter Herkunft führt zu indirektem Freistoß, niemals zu legalem Fangbesitz. Sanktionen außerhalb der Box bleiben gesondert offen. Erlaubtes Fußspiel bleibt möglich.
- Abseitsstellung wird am tatsächlichen Mitspielerkontakt festgehalten; Beteiligung löst später aus. Ein gegnerischer Kontakt allein ist kein Abseitspfiff. Direkter eigener Einwurf, Ecke und Abstoß sind bestätigte Ausnahmen. Die Tests konsumieren einen bereits festgehaltenen Abseitssnapshot; sie implementieren keine zweite Positions-/Körpergrenzenregel.
- Block und Parade können freie Bälle erzeugen. Annahme, Eigenwiederaufnahme und Gegnerinterception sind unterschiedliche tatsächliche Ereignisse. Ein Nachschuss braucht einen neuen Kontakt und eine neue Freigabe; es gibt keinen garantierten Nachschützen. Die Folgefixtures liefern separat deklarierte Testbahnen, keine vom Regeloracle erzeugte Matchsimulation.
- Freigabe-, Kontakt-, Regel- und Ergebnisereignisse bekommen stabile IDs, Zeit, Beteiligte und Elternverknüpfung. Ein Pfiff/Abbruch schließt offene Ereignisse genau einmal. Die tatsächliche idempotente Buchung bleibt beim gemeinsamen Ledger/Integrator. M01 bucht keine Statistiken, Tore oder Spielstände.

## APIs und Bestandsadapter

`oracle.cjs` exportiert ausschließlich analytische Prüfhelfer: `firstContact(ball, actors, duration)`, `ownBox(point, team, geometry)`, `handPermission(actor, point, geometry, provenance)`, `boundary(ball, geometry, duration)` und `evaluate(scene)`. Der Code nutzt keine Fähigkeiten, Zufallszahlen, Reibung, Flugparabel, Besitzlogik oder KI. Er ist ausdrücklich **keine neue Browserengine**. `validate.cjs` prüft Datenform, vollständige Matrix, IDs und feste Geometrie.

Native Koordinaten lassen sich über den gemeinsamen Adapter abbilden: `native.x=.5+z/W*(544/600)`, `native.y=.5-x/L*(688/740)`. Der unveränderte native Kontaktkern rechnet intern weiterhin mit 44/68. Bei größerem Demo-Feld ist die Abbildung eine Projektion; deren physische Reichweiten-/Geschwindigkeitsabweichung darf nicht als konfigurierbare Bestandsphysik ausgegeben werden.

| Bestandsstelle | Nutzung und Grenze |
| --- | --- |
| `work/platform/performance/native-adapter.cjs` | Isolierte flüchtige Karriere, Modellbereitschaft, `v65Show`, vorhandene Zeitgeber anhalten. Keine Nutzerkarriere übernehmen. |
| `work/check-space-passes-v150.cjs` | Vorhandenes natives Szenenharness einschließlich relevanter WeakMap-/Aktionszustand-Resets. Lädt `outputs/spieler-nutzer-match.html`, wartet auf `userMeshyMatchReady`. |
| `dist/game.js:80`, `step(delta, seconds)` | Tatsächliche Bestandsbewegung und Physik. Im Test z. B. `step(MATCH_SPEED/60,1/60)`. Rendering darf keine zusätzliche Simulation starten. |
| `dist/world-space-passes-v150.js:37`, `v150SpacePass(passer,{target,runner})` | Echte Passfreigabe, Streuung, Balljagd, Snapshot und Statistik. `runner` ist Absicht. |
| `dist/world-space-passes-v150.js:116`, `v150Contact(m,plan,from,to)` | Relativer kontinuierlicher 2D-Kontaktvergleich gegen `plan.before`; feste 0,8-Reichweite, frühester Parameter, Gleichstand Team/Trikotnummer. |
| `dist/pitch-v55.js:355`, `v55Shoot(shooter,kind)` | Echte Schussbaseline. Ergebnis wird bereits vor Ende ausgewählt; bei gehaltenem Schuss wird das Flugziel auf `v115KeeperContact` gesetzt (`:375–377`). Ein beliebig seitlicher Keeper ist deshalb kein Nachweis eines physikalisch offenen Tors. |
| `dist/pitch-v55.js:381`, `v115GoalCrossing(hit,lastTouch)` | Vorhandene Tor-/Eigentorauflösung; nicht durch Oracle ersetzen. `v55Exit` prüft bislang Mittelpunktquerung. |
| `dist/set-pieces-v50.js`, `v50LooseBall`, `v50Deflect`, `v50ChaseLooseBall` | Echte freie Bälle/Abpraller; Simulation entscheidet Folgekontakt. |
| `dist/pitch-v55.js`, `v55OffsideSnapshot`, `v55WhistleOffside` | Tatsächlicher Abspielzustand und spätere Beteiligung. |
| `dist/match-ball-events-v117.js:8–33` | Bestehendes Ledger und unterbrochene Versuche; native Ereignisse beobachten, nicht nachträglich aus Fixtureerwartungen erzeugen. |
| `dist/world-physical-v65.js:53`, `v65Snapshot` / `v65Restore` | Flug/Grätsche nicht speicherbar; Snapshot ruft Speicherung auf und Restore erwartet den Karrierekader. Isolierte Zusatzspieler/Flugzustände nicht als vollständig kompatiblen nativen Checkpoint ausgeben. |
| `dist/world-match-v64.js:295`, `v64SimulateFixture` | Kompakte Partien verwenden einen anderen Wahrscheinlichkeitsablauf. Welle 0 bestätigt dafür keine Kontaktparität. |

## Szenen, Prüfung und Grenzen

Die Familien umfassen freies Tor links/rechts neben dem Keeper, erreichbare/unerreichbare und sich entfernende Keeper, schnellen Pass zwischen bewegten Spielern, Gleichstand, eintretenden/weglaufenden Blocker, unerreichten Raum, anderen Empfänger, Eigenwiederaufnahme, Block-/Paradenabpraller mit Folgeabschluss, eigene/fremde Box und Grenzen, Herkunftssperren/Ausnahmen, vollständige Tor-/Ausquerung, Torrahmenränder und späte Abseitsbeteiligung. Alle Szenen enthalten vollständige Mannschaften; `action:'none'` markiert unbeteiligte Testakteure im analytischen Oracle. Diese Akteure bleiben in der unveränderten nativen Engine echte Spieler und dürfen dort selbstständig handeln.

Reproduzieren aus der Projektwurzel:

```text
node work/match-next/contacts/generate.cjs
node work/match-next/contacts/validate.cjs
node work/match-next/contacts/test.cjs
```

Ergebnis: 288/288 Fixtureerwartungen bestanden; ergänzend schnelle Zwischenframe-Berührung, Teilung in 30/60/144 Schritte, unabhängige Gleichstandsreihenfolge, Höhenverfehlung und fünf absichtlich fehlerhafte Kataloge geprüft. `outputs/platform/contacts/wave0-report.json` hält Einzelresultate und SHA-256 der Eingaben/maßgeblichen Bestandsquellen fest. Das ist ein Vertrags-/Oraclebeleg, kein bestandener Browser-/Unitylauf und keine Match-/Saisonfreigabe.

## Welle 1: echte Browserbaseline

`work/platform/engine-probe/web/native.js` führt die unveränderten Bestandsfunktionen auf einer flüchtigen Karriere mit dem vollständigen Szenenkader aus. `D6Probe.load({scenario,seed})`, `start`, `pause`, `resume`, `reset`, `snapshot`, `checkpoint`, `restore` und `stats` folgen dem gemeinsamen Vertrag; `advance(ticks)` dient den Prüfungen. `camera('overview'|'contact')` ändert nur die Darstellung. Eigene Aktions-/Bewegungs-/Ballparameter der Bestandsengine werden nicht durch das Oracle ersetzt. Das Ergebnis enthält konkrete Baselinehinweise und tatsächliche native Ledgerereignisse.

Bei Schuss und Pass wird ein vorhandener unbeteiligter Feldspieler für die Freigabe an den Ball gestellt; diese Anfangsbedingung wird angezeigt. Ein Nachschuss wird nicht aus einer erwarteten Ereignisfolge erfunden. Der gemeinsame Katalog enthält dafür den bereits anwesenden `finisher` und `followup.intent` als Auftrag, dem tatsächlichen freien Abpraller zu folgen und erst bei eigenem Kontakt zu schießen. Die unabhängigen analytischen Folgeballsegmente ersetzen keine physische Abprallerbahn.

Die reine Keeperberechtigungsszene liest die tatsächliche native `v150KeeperArea`-Prüfung. Der fehlende Herkunftsfilter wird als Befund ausgegeben. Abseitsfixtures mit rein fachlichem Beteiligungssnapshot sind im nativen Adapter ausdrücklich nicht ausführbar, weil ihnen eine reale native Abspielhistorie fehlt. Grenzfixtures beobachten `v55Exit` und setzen die vorhandene freie Bodenbahn fort; willkürliche Anfangshöhe und Torrahmenkollisionen werden nicht als unterstützt ausgegeben.

Der Democheckpoint speichert Anfangsszene, Seed, Tick, Quellenkennung, vollständigen beobachteten Zustand und Ereignisse. Wiederherstellung baut dieselbe native Szene neu auf, führt dieselben festen Schritte aus und vergleicht Ball, Spieler, Ereignisse, Ergebnis und Zufallszustand. Abweichung oder fremde Schema-/Quellenkennung lehnt den Checkpoint ab. Dadurch bleiben vorhandene Callbacks rekonstruierbar, ohne Karriere-Speicherfunktionen aufzurufen. Das ist eine ausdrücklich benannte **Replay-Fortsetzung**, kein Nachweis für native Karriere- oder beliebige Produktionssave-Kompatibilität.

`native-test.cjs` prüft 48 echte Browserszenen (sechs Familien × vollständige Matrix), jeweils 20 Schritte vor Checkpoint und weitere 20 nach der Fortsetzung, sofern die Probe nicht bereits beendet ist. Nachweis: `outputs/platform/native/native-report.json`, Screenshot `browser-native.png`. Kamera/Beobachtung verändern keinen Match-/Zufallszustand; fremde Checkpoints werden abgelehnt. Der Adapter schreibt keine Browserdaten. Die vorhandene Quellseite setzt beim Start ausschließlich ihre Spracheinstellung im isolierten Testprofil; dieser Startschreibvorgang wird separat protokolliert. Diese Prüfungen behaupten keine Gleichheit nativer Ergebnisse mit dem analytischen Sollkatalog. Browserprüfungen benötigen Node 20+ und die vorhandene Playwright-/Edge-Installation.

Offen bleiben die Produktionsgrenzkonvention, reale Kontaktvolumen/Reichweiten, Flug-/Sprungmodell, Reibung, Streuung, Gleichstandsregel, weitere Abseitsdetails, vollständige Foulsanktionen und kompakte Matchparität. Keine alten Spielstände oder Ereignisse werden nachberechnet. Kein Release, keine Versionsanhebung und keine kostenpflichtigen Assetjobs.
