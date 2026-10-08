# Agentenaufträge: Spieler, Karriere und Taktik

Stand: 8. Oktober 2026. **P01–P06 sind auf spätere ausdrückliche Nutzeraufträge als lokale Rechner und gekennzeichnete Prüfkarriere integriert.** [P01–P03-Lieferung](../player-contracts/integration.md), [P04–P06, Taktik und Unity-Iteration](../platform/roles-tactics-football.md). Offene Parameter bleiben Testkandidaten; insbesondere P02-Verbrauch und Produktionsbalance sind nicht freigegeben. Die folgenden Fachprompts dokumentieren Auftrag und Abnahmeumfang; sie starten keine weiteren Pakete oder Veröffentlichung.

## Gemeinsame Auftragsregeln

Jeder folgende Prompt übernimmt diese Regeln vollständig:

> Du arbeitest an Doppel 6, ausschließlich an der Vereinswelt. Lies AGENTS.md sowie die unten genannten relevanten Pläne; der aktuelle Quellstand in dist/ ist maßgeblich. Neuere Nutzerentscheidungen haben Vorrang. Du bist nicht allein im Codebestand: Änderungen anderer erhalten, keine Rücksetzungen, keine fremden Dateien bearbeiten. freekickdemo/ bleibt unberührt.
>
> Status dieses Auftrags: geplant, nicht gestartet. Warte vor Ausführung auf explizite Umsetzungsfreigabe und danach auf deine Vertrags- und Produktionsgates. Arbeite nur an den exakt zugewiesenen neuen Dateien. Bestehende Hooks, Loader, Speicherintegration, Übersetzungen und Sammeldokumentation gehören ausschließlich dem Integrator. Benötigte Änderungen dort als konkrete Integrationsnotizen liefern; nicht durch globale Wrapper selbst einbauen.
>
> Bestehende Spieler und Spielstände weder nachträglich mit Werten ergänzen noch Fähigkeiten, Potenziale, Statistiken oder Ergebnisse umrechnen. Keine automatische Löschung alter Karrieren. Der Integrator vereinbart die Kennzeichnung neuer Welten und das Laden bestehender Stände; kein Agent erfindet eine zweite Kompatibilitätssimulation.
>
> Permanente Fähigkeiten verwenden 1–20 mit internen Bruchteilen. In allen Produktansichten und zugänglichen Beschriftungen ausschließlich Farbstufen, keine Fähigkeits- oder Eignungszahlen. Verborgenes Hintergrundtalent bleibt vollständig unsichtbar, auch als Sterne, Kategorie, Scoutingtext oder Farbstufe. Körpergröße in cm und Frische sind davon getrennte Eigenschaften. Keine versteckten Werte in HTML-Attributen, Tooltips oder Bildschirmlesertexten ausgeben.
>
> Reine Berechnungsmodule verwenden explizite Eingaben, deterministischen oder injizierten Zufall und keine Browser-, Rendering-, Storage- oder Engine-Abhängigkeit. Ein vorgeschlagenes API ist kein bestehender Vertrag. Schnittstellen vor Verwendung mit Integrator und Verbrauchern abstimmen. Kein Renderer verändert Simulation oder verbraucht Engine-Zufall. Engineabhängige Anbindung erst nach Enginevergleich und Freigabe.
>
> Offene Produktregeln nicht selbst festlegen. Konfigurierbare Entwurfsparameter und Szenen sind erlaubt, müssen aber als unbestätigt gekennzeichnet werden. Keine vermeintlichen Produktionsdefaults für offene Verteilungen, Potenzialgrenzen oder Gewichte. Zahlenfeintuning folgt späteren Messungen.
>
> Lieferformat bei späterer Ausführung: eigene Dateien und Vertragsstand; kurze Beschreibung des beobachtbaren Verhaltens; relevante Nachweise mit Befehl, Ergebnis und Grenzen; Integrationsnotizen mit Quellanker; offene Fragen und Gates. Keine Commits, Deployments, kostenpflichtigen Dienste oder Assetläufe ohne gesonderten Auftrag. Heute nichts ausführen.

Alle Fachmodule und Prüfdateien in den Ownership-Listen sind **vorgeschlagene neue Dateien**, keine Behauptung über bestehende Architektur. Vor späterem Start muss der Integrator prüfen, ob Pfade inzwischen existieren oder vergeben sind. Browserexport/Modulformat und neue Fähigkeitsnamen sind Teil des Vertragsgates, keine stillschweigende Engineentscheidung.

## Gemeinsamer Vertragsentwurf — noch zu vereinbaren

Der Integrator besitzt das gemeinsame Datenschema und legt die revisionsfeste Fassung vor parallelem Fachcode fest. Folgende Namen sind Entwürfe, kein aktuelles API:

- `PlayerBase`: stabile ID, Alter, Hauptposition, spielbare Profilpositionen, 13 Grundfähigkeiten, persönliche Fähigkeitsgrenzen, feste Körpergröße, bevorzugter Fuß und unveränderliche Rollenempfehlungen je Profilposition. Talent und Entwicklungsbuchhaltung bleiben im internen Teil, niemals an UI-Renderer übergeben.
- Positions-IDs können vorhandene `gk/def/mid/att` verwenden; keine Außenverteidiger-, Flügel- oder getrennten Mittelfeldpositionen. IDs für Ruhe, Antizipation, Entscheidungen und Körperkraft zentral vereinbaren. Bestehende neun Schlüssel: `tec/pas/fin/tak/pos/spd/sta/air/gk`.
- `MatchPlayerState`: Frische, aktuelle Einsatzposition/Rolle/Ausrichtung, tatsächliche Positions-/Rollenphasen und Belastungsereignisse. Startzone ist von Profilposition getrennt.
- `RatedAppearance`: neue Fixture-ID, Welt-/Saison-ID, tatsächliche Minuten, interne Bewertung einschließlich Kurzeinsätzen, Rollen-/Positionsphasen und situativ bewertete Aktionen. Fehlende historische Werte nicht rekonstruieren.
- `PositionRoutine`: Minuten/Routine je tatsächlicher Einsatzposition, beim Spieler erhalten. Trainervorgaben bleiben am taktischen Platz.
- `UiPlayerProjection`: ausschließlich freigegebene sichtbare Fakten, Fähigkeits-/Eignungsfarbstufen, Rollenempfehlungen und wichtige Fähigkeitsnamen; keine Kopie des internen Spielers.

Ereignisse verwenden stabile IDs und virtuelle Minuten, keine Renderbilder oder echte Pausendauer. Atomare Buchung und Speichern übernimmt Integrator. P02/P03/P04 liefern Änderungen, schreiben nicht konkurrierend dieselben Weltobjekte. Kompakte KI-Partien und sichtbare Simulation brauchen vergleichbare Eingaben; der alte Tor-/Assist-Fallback ist keine freigegebene neue rollenbezogene Bewertung.

## P01 — Kohärente Spielererstellung und Vereinsqualität

**Status: Rechner und neue lokale Prüfkarriere geliefert; Produktionsverteilungen offen.** [Abnahme](../player-contracts/integration.md).

**Späterer vollständiger Agentenprompt:** Übernimm ausschließlich Spielererzeugung und permanente Positionsqualität. Erstelle einen engineunabhängigen Generator für kohärente Stärken/Schwächen, plausible Profilpositionen und Rollenrepertoires anhand der Vereinsprofile. Startkader, Nachwuchs, freie Spieler und reine Pokalteams verwenden denselben fachlichen Qualitätsvertrag. Alte Welten bleiben unangetastet. Befolge die gemeinsamen Auftragsregeln vollständig.

**Exklusive spätere Dateien — alle neu vorgeschlagen:**

- `dist/player-generation.js`
- `docs/player-contracts/generation.md`
- `work/test-player-generation.cjs`, `work/measure-player-generation.cjs`

Bestehende Dateien: keine Schreibzuständigkeit.

**Bestätigte Anforderungen:**

- Positionsqualität ist der gewichtete arithmetische Mittelwert der erreichten Grundfähigkeiten. Alle vier bestätigten Gewichtstabellen aus spieler-erstellung-rollen-plan.md exakt übernehmen, je 100 Prozent. Keine Rollengewichte daraus ableiten. Elite ab exakt 16 auf bester im Profil spielbarer Position, 15,99 darunter; keine Einzelfähigkeitsminima/vorherige Rundung. Fremde Einsatzpositionen, Form, Frische, Routine, Rolle und Talent zählen nicht. Kein sichtbares Eliteabzeichen durch diesen Auftrag.
- Persönliche Fähigkeitsgrenzen bei Erstellung profilabhängig erzeugen: prägende Stärken können höhere, schwächere/profilferne Fähigkeiten niedrigere Grenzen erhalten. Nicht überall Spielraum bis 20; Grenzen fest, mindestens beim Startwert und innerhalb der Skala. Trainerrolle verändert keine Grenzen. Hintergrundtalent steuert die Entwicklungsmenge, kein zusätzlicher direkter Talentbonus auf Grenzen durch diesen Beschluss. Genaue Verteilungen und Startprofilzusammenhänge bleiben Testparameter.
- Normal erzeugte 17-Jährige überwiegend Hauptpositionsqualität 7–10; einzelne Fähigkeiten dürfen darüber/darunter liegen. Stärkere/schwächere Ausnahmen möglich, echte Elite-Jugend selten. Andere Startalter gesondert behandeln.
- Vereinsstärke gewichtet neue Startkader: starke Vereine häufiger gute/sehr gute Spieler, mittlere solide, schwächere niedrigere Qualität. Individuelle Leistungsträger/Ergänzungsspieler, keine garantierte Elite/identische Kaderqualität. Jugendarbeit getrennt von Vereinsstärke gewichten.
- Jugendarbeit beeinflusst aktuelle Jugend-Startqualität: schwach häufiger unten, stark häufiger oben und etwas häufiger starke Ausnahmen. Globale Talentanteile bleiben:10–13 = 20 Prozent,14–17 = 60,18–19 = 15,20 = 3,21 = 1,5,22 = 0,5. Hohe Werte 20–22 nach relativen Jugendgewichten 0,5/1/2 global normalisieren; keine Jahrgangsquoten. Talent kein direkter Startfähigkeitsbonus/keine bereits erreichte Elite.
- Feldspieler gewöhnlich Hauptposition plus höchstens passende Nebenposition, keine Nebenposition erzwingen. Nachbarn Verteidiger/Mittelfeld oder Mittelfeld/Stürmer; seltene Allrounder alle drei. Tormänner ausschließlich mit Profilposition Tormann, ohne Feldspieler-Kombinationen. Mitspielender Tormann bleibt eine Rolle dieser Position. Profilpositionen nach Erstellung dauerhaft fest; zusätzliche Positionen durch Einsätze oder Fähigkeitsentwicklung zu erlernen ist verworfen.
- Kohärente Rollenempfehlungen anhand Fähigkeiten, keine regulär unabhängig ausgewürfelte Kombination Stopper/Dribbler. Meist ein bis drei passende Empfehlungen pro Profilposition, echte seltene Vielseitigkeit zulassen. P04 liefert Katalog/Bewertungsvertrag; Liste später bei Wachstum/Alterung nicht automatisch erweitern/kürzen.
- Größe endgültig bei Erstellung, ganze 165–205 cm; global ungefähr 95 Prozent 170–200 und zusammen 5 Prozent Randbereiche, profilabhängig mit Ausnahmen. Kein Rollenmindestmaß oder garantierter Kraft-/Luftspielbonus. Fuß einmal fest: rechts/links/beidfüßig.

**Startbedingungen, Vorlauf und Produktionsgate:** Nach späterer Freigabe sofort startbar: Generationspfade inventarisieren, Positionsqualitätsinvarianten und reproduzierbaren statistischen Messplan definieren. Rechner erst nach Datenvertrag. Produktionsgenerator verwendet die bestätigte profilabhängige Grenzerzeugung; genaue Grenzverteilungen, kohärente Profilverteilung, Verteilung innerhalb Talentbereiche, Vereinsprofilkategorien und Fußverteilung sind noch abzustimmen. Normale Jugendhäufigkeit, Erwachsenenverteilungen und Eliteanteile als offene Messparameter behandeln; endgültige Balance folgt Tests. Caps nicht eigenmächtig aus Talent ableiten.

**API-Entwurf zur Integratorfreigabe:** `positionQuality(baseSkills, position) -> number`; `eliteQuality(baseSkills, playablePositions) -> boolean`; `generatePlayer(context, approvedParameters, rng) -> internalPlayer`. Kontext trägt Erzeugungsart/Vereinsprofil/Jugendprofil/Alter/stabile ID. P04-Eignungsfunktion explizit injizieren, kein zyklischer Import/doppelter Katalog. Cap nie unter Startwert und höchstens20; Verteilung offen.

**Sinnvolle spätere Nachweise:** Gewichtssummen,15,99/16, stärkere Nebenposition vs fremde Position; Determinismus, Skala und feste Höhe/Fuß/Talent; Rollen-/Positionskohärenz einschließlich ausschließlich Tormann als Profilposition und fehlender Tormann-/Feldkombinationen; keine Mutation vorhandener Daten. Seedstichprobe trennt Jugend/Startprofis/freieSpieler/Pokal, Alter/Vereinsprofile, globale Talent-/Höhenanteile und tatsächliche Elite. Zehn-Seed-Baseline Vergleich, kein Ziel. Große Stichproben mit Unsicherheit statt festen Teamquoten. Langzeitverteilung mit P03/QA.

**Planquellen:** spieler-erstellung-rollen-plan.md, koerpergroesse-plan.md, koerperkraft-plan.md, jugendentwicklung-noten-plan.md, spieler-archetypen-plan.md.

**Geprüfte Integratoranker:** `dist/world-foundation-v61.js:114` v61GenerateRoster; `dist/world-youth-manager-v67.js:6` v67Youth; `dist/world-economy-v66.js:140` v66NewFreeAgents. profile[5]/policy.startingSquad und policy.youth existieren; neue Profilzuordnung nicht implementiert. Alte Sechserliga-Erstellung in strength-v55.js nicht ausbauen.

## P02 — Effektive Fähigkeiten, Frischeverbrauch und Erholung

**Status: reine Rechner geliefert; reguläre Verbrauchsanbindung und Kalibrierung offen.** [Abnahme](../player-contracts/integration.md).

**Späterer vollständiger Agentenprompt:** Übernimm ausschließlich gemeinsame Ableitung wirksamer Fähigkeiten und Frischeübergänge. Trenne Grundwerte, Form, Druck, Müdigkeit und Bewegung; tatsächliche Belastung messen und dieselbe Ursache nicht doppelt bestrafen. Effektive Werte nie als Grundwerte speichern. Sichtbare Simulation und kompakte KI verwenden denselben freigegebenen Fachvertrag. Befolge gemeinsame Auftragsregeln vollständig.

**Exklusive spätere Dateien — alle neu vorgeschlagen:**

- `dist/player-effective-abilities.js`, `dist/player-freshness.js`
- `docs/player-contracts/effective-abilities.md`, `docs/player-contracts/freshness.md`
- `work/test-player-effective-abilities.cjs`, `work/test-player-freshness.cjs`

Bestehende Dateien: keine Schreibzuständigkeit.

**Bestätigte Anforderungen:**

- Kraft ohne Formeffekt, linear maximal −20 Prozent bei Frische 0. Stellungsspiel/Kondition ohne eigenen Müdigkeitsabzug, Höhe konstant.
- `t=clamp((80-F)/50,0,1)`; Ruheverlust`0.20*t²` nur für tatsächlichen Druck. Technik/Pass/Abschluss/Keeper dieselbe Kurve maximal 10 Prozent, Zweikampf/Luftspiel 15. Wirksame Werte auf 1–20 begrenzen, gute Aktionen weiterhin möglich.
- Antizipation/Entscheidungen stufenlos maximal −15 Prozent bei Frische 0; Kurve offen. Beschleunigung maximal −25 Prozent, maximales Lauftempo −15 Prozent bei Frische 0, Kurven offen. Kein neuer Antrittwert/zusätzlicher Schnelligkeitsabzug.
- Grundverbrauch virtuelle Einsatzminuten plus tatsächliche Sprints/intensive Zweikämpfe/Pressing, durch Kondition gedämpft. Nicht allein Rollenlabel belasten; Sprint beim Pressing nicht doppelt zählen.
- Halbzeit +10 und Abpfiff +10 jeweils einmal bis 100. Volle spielfreie Tage `min(100,F+3+0.25*(100-F))`; reale Pause regeneriert nicht zusätzlich.
- Referenz Feld Kondition 10 normal 100→65→75→40→50, Verbrauch 70. Kondition 6/14 normal 80/60 Verbrauch. Kondition 10 ruhig/normal/intensiv 60/70/80. Das bestätigt keine universelle lineare Verbrauchsformel.
- Keeper Kondition 10 normal Verbrauch 40 inklusive typischer Sprünge, gleichmäßig 100→80→90→70→80. Einfacher Absprung 0,5/volle Hechtaktion 1, einmal auch bei Misserfolg. Keine doppelte Hechtbelastung, keine Grundlast 40 plus alle Sprünge, keine Feldspieler-Sprungkosten.

**Startbedingungen, Vorlauf und Produktionsgate:** Nach späterer Freigabe bestätigte Kurven-/Erholungsrechner und Vergleichsszenen vorbereiten, vorhandene Pipeline auf Doppelabzüge kartieren. Produktionsverbrauch wartet auf Belastungsereignisse, Keeper-Grund-/Aktionsaufteilung, allgemeine Konditionsfunktion und offene Bewegungs-/Mentalkurven. Form-/Druckzuordnung mit Matchspur vereinbaren; neue Formverteilung nicht erfinden. Engineereignisse erst nach Enginegate.

**API-Entwurf:** `effectiveAbilities(base,fresh,formContext,pressureContext,approvedParameters)`; `movementLimits(baseSpeed,fresh,approvedParameters)`; `consumeFreshness(state,virtualMinutes,uniqueLoadEvents,approvedParameters)`; `recoverFreshness(state,transition)`. Übergang hat stabile ID und Typ halftime/final-whistle/rest-day. Modul liefert Zustand, Integrator allein persistiert. Match liefert ausgeführte Aktionen, keine Wiedergabe-/Animationsaufrufe. Kompakte KI ohne Ereignisse nicht stillschweigend allein nach Rollen belasten.

**Sinnvolle spätere Nachweise:** Kurven 100/80/60/50/40/30/0, monotone Grenzen, Kraft ohne Form, pos/sta unverändert, keine Doppelstrafe. Referenzverläufe und Belastungswechsel, Keeper-Deduplikation/Feldsprünge. Halbzeitladen/erneutes Öffnen/doppelte Endverarbeitung ohne Mehrerholung; Ein-/Auswechslung, 2D/3D/langsame Geräte nach gleicher virtueller Zeit. Mehrtageserholung iterativ, nicht einmalige Formel mit Tagen multiplizieren. Grundwerte unverändert.

**Planquellen:** muedigkeit-faehigkeiten-plan.md, frische-erholung-vergleich.md, mentale-faehigkeiten-plan.md, koerperkraft-plan.md.

**Geprüfte Integratoranker:** `dist/world-match-v64.js:44` v64RecoverClub, `:99` v64Workload, `:256` Verbrauch, `:288` Endübernahme; `dist/world-physical-v65.js:404` ability-Wrapper und `dist/strength-v55.js:79` ability-Überschreibung. Integrator ordnet bisherige Kette vollständig zu, kein zusätzlicher globaler Wrapper.

## P03 — Leistungsentwicklung und Altersabbau

**Status: Rechner geliefert, in neuen Rollen-Prüfkarrieren mit tatsächlichen P06-Einsätzen verbunden; Produktionsbalance offen.** [Abnahme](../platform/roles-tactics-football.md).

**Späterer vollständiger Agentenprompt:** Übernimm ausschließlich permanente Fähigkeitstransaktionen aus neuen Spielleistungen und Saisonwechseln. Lernbudgets sind Gesamtpunkte, kein Zuwachs auf jede Fähigkeit. Verwende Bruchteile und feste persönliche Caps; alte Spiele nicht rückwirkend bewerten. Trenne reine Berechnung vom einmaligen Ereignisbuchen durch den Integrator. Befolge die gemeinsamen Auftragsregeln vollständig.

**Exklusive spätere Dateien — alle neu vorgeschlagen:**

- `dist/player-development.js`, `dist/player-aging.js`
- `docs/player-contracts/development.md`
- `work/test-player-development.cjs`, `work/test-player-aging.cjs`

Bestehende Dateien: keine Schreibzuständigkeit.

**Bestätigte Anforderungen:**

- Letzte bis zu drei intern bewertete Einsätze minutengewichtet; Kurzeinsätze unter 20 Minuten intern bewerten und kumulieren. Bei erst ein/zwei Einsätzen positive Entwicklung möglich. Wettbewerbe gleich behandeln, kein Europacupfaktor.
- Ab Fensterbewertung 6,5 positiver Betrag `0.5*(Talent/19)*Altersfaktor*(neueMinuten/90)` innerhalb Saisonstaffel; 5,5 bis unter 6,5 kein Zuwachs. Altersfaktor bis 19 = 1, 20–21 = 0,8, 22–23 = 0,5. Ab 24 ausschließlich Ruhe, Antizipation, Entscheidungen und Stellungsspiel; 24–29 Faktor 0,2, ab 30 Faktor 0,1 bis Karriereende. Kein Erwachsenenzuwachs in Technik/Körper.
- Erste 900 tatsächliche Saisonminuten volle Rate, nächste 900 mit 25 Prozent, über 1800 kein weiterer positiver Matchzuwachs. Grenzübertritt innerhalb Einsatz aufteilen. Auch schlechte Einsätze verbrauchen Minuten; Transfer/Laden setzen Zähler nicht zurück. Talent ist keine garantierte Vierjahresgutschrift oder lebenslange feste Punkteobergrenze.
- Jugendrückgang nur, wenn letzte drei Noten einzeln unter 5,5 und schwache ununterbrochene Serie mindestens 90 tatsächliche Minuten umfasst. Note ≥ 5,5 setzt Serie zurück. Aktuelle qualifizierte neue Partie trägt `0.1*(eigeneMinuten/90)` insgesamt bei, frühere Spiele nicht nachträglich belasten. Höchstens 1 tatsächlich abgezogener Gesamtpunkt pro Welt-/Saison als Bruttogrenze; positive Entwicklung setzt sie nicht zurück. Ab 24 keine dauerhafte Abwertung allein aus Noten.
- Rolle und tatsächlich sinnvoll bewertete Aktionen bestimmen Verteilung; nicht nach größten Potenzialabständen allein. Kein pauschaler Teamresultatbonus, keine Passzahlfarm. Situative Schwierigkeit, taktischen Nutzen und Aufgaben ohne Ball berücksichtigen. Interne Kurzeinsatznote trotz fehlender sichtbarer Note.
- Positive Restanteile an Caps nur zu anderen passenden Fähigkeiten mit Spielraum umverteilen, sonst verwerfen; keine Bank. Keine Verlangsamung nahe Cap, kein Capwachstum durch Noten. Negative Anteile sofort bis Boden 1 buchen, Caps unverändert. Wiederaufbau normal innerhalb Saisonstaffel, keine Erstattung.
- Altersabbau genau einmal beim Saisonwechsel anhand Alter der neuen Saison: 30–32 Schnelligkeit/Kraft je −0,5, Kondition −0,25; ab 33 je −1/−1/−0,5. Alle einschließlich Keeper, nur diese drei Grundfähigkeiten, Boden 1. Höhe/Fuß/Talent fest, keine zusätzliche Qualitätsstrafe. Rücktritt wie bisher.

**Startbedingungen, Vorlauf und Produktionsgate:** Nach späterer Freigabe freigegebene synthetische RatedAppearance-Daten für isolierte Betrags-/Grenz-/Altersrechnung nutzen. Produktionsentwicklung wartet auf P01-Caps, neue konsistente Matchbewertung inklusive Kurzeinsätzen und Rollen-/Aktionsverteilungsgewichte. Keine neue Notenformel als Nebenaufgabe erfinden; P06 liefert den Bewertungsvertrag und RatedAppearance; Ereigniseingaben mit Match/QA vereinbaren. Erwachsene in neuen Welten brauchen intern vereinbarte Talent-/Capdaten; alte Profis nicht ergänzen.

**API-Entwurf:** `developmentDelta(player, ledger, appearance, approvedWeights) -> {skillDelta, nextLedger, rejectedRemainder}`; `agingDelta(baseSkills, newAge) -> skillDelta`. Ledger enthält Welt-/Saison-ID, tatsächliche Saisonminuten, Leistungsfenster, schwache Serienminuten, tatsächlich verbuchte Negativsumme und verarbeitete IDs. Deduplikation/atomare Speicherung gehören dem Integrator. Rollen-/Positionsphasen aus Simulation, interne Matchnote aus P06. P03 verändert keine Empfehlungen; P04 darf Farben/bestes Highlight innerhalb fester Liste neu ableiten.

**Sinnvolle spätere Nachweise:** Talent-19-Referenz und Altersgrenzen 19/20/22/24/30; Staffelsplits 899/900/1799/1800; alle Wettbewerbe/Kurzeinsätze; drei schwache Kurzspiele unter 90 Minuten noch ohne Abzug, längere Serie erreicht 90. Negativcap trotz positiver Zwischenentwicklung. Transfer/Laden/doppelte Fixture einmalig; Saisonreset. Caps, Bruchteilpräzision, geeignete Überlaufempfänger und fehlender Spielraum. Alterswechsel 29→30/32→33 einmal, Keeper/Feld gleich, Boden 1, kein Rücktrittsumbau. Akzeptiertes Sechs-Spiele-Stürmerbeispiel mit Talent 16/Note 7 und ausdrücklich illustrativen Gewichten reproduzieren; Beispielgewichte sind keine Produktionsfreigabe.

**Planquellen:** jugendentwicklung-noten-plan.md, spieler-alterung-plan.md, stuermer-sechs-spiele-entwicklung.md, beispiel-jugendspieler-entwicklung.md.

**Geprüfte Integratoranker:** `dist/world-youth-manager-v67.js:42` v67Grow, `:56` v67AfterFixture, `:118` v67BeforeNextSeason, `:121` Alterserhöhung; `dist/world-match-v64.js:284` sichtbare Note erst ab 20/bestehender Fallback, `:287` Spielerrecord. `dist/world-physical-v65.js:215` Ratingerfassung existiert, ist noch kein freigegebener neuer Rollenbewertungsvertrag. processedFixture zentral verwenden; alten/neuen Wachstumspfad nicht parallel buchen.

## P04 — Rolleneignung, Positionsroutine und taktische Übergänge

**Status: Rechner, Minutenbuchung und Rollenauftrag lokal in neuen Prüfkarrieren integriert.** [Abnahme](../platform/roles-tactics-football.md).

**Späterer vollständiger Agentenprompt:** Übernimm ausschließlich Rollenkatalog, Eignungsberechnung, Positionsroutine und reine Übergangsregeln der Trainerzuweisung. Trainerrolle steht über dem Spieler; Profilposition, Einsatzposition, Startzone, Empfehlung und gewählte Rolle getrennt halten. Kein eigener Matchentscheidungsagent und kein UI-Code. Befolge die gemeinsamen Auftragsregeln vollständig.

**Exklusive spätere Dateien — alle neu vorgeschlagen:**

- `dist/player-role-suitability.js`, `dist/player-position-routine.js`, `dist/player-tactic-transitions.js`
- `docs/player-contracts/roles-routine.md`
- `work/test-player-role-suitability.cjs`, `work/test-player-position-routine.cjs`, `work/test-player-tactic-transitions.cjs`

Bestehende Dateien: keine Schreibzuständigkeit.

**Bestätigte Anforderungen:**

- Genau 13 Rollen: Linientormann, mitspielender Tormann; Ausputzer, Stopper, ballspielender Verteidiger; Spielmacher, Abräumer, Box-to-Box, Flügelspieler; Torjäger, Stoßstürmer, Zielspieler, Dribbler. Aufgaben/relevante Fähigkeiten nach Archetypenplan. Stoßstürmer antizipiert Tiefenläufe. Keine neuen Rollennamen oder Nebenrollen erfinden.
- Eignung aus Fähigkeiten und Positionsroutine; im Profil dauerhafte Werte plus Routine, keine Form-/Frische-Rekolorierung. Empfehlungen feste Liste; bestes Highlight innerhalb Liste bei deutlich besserer Eignung wechseln, bei fast gleicher bisherige Rolle behalten. Coachzuweisung nicht automatisch verändern.
- Hauptposition ab Generierung volle Routine, auch Jugend, nie über Cap. Nebenposition Grundroutine, fremde Position 0. Alle tatsächlichen Minuten je Position sammeln, auch Kurzspiele; Rollenwechsel innerhalb Position kein Reset. Transfer/Nichtnutzung/Pause/Saison kein Verfall. Matchwirkung Laufwege/Timing/Abstimmung, kein Basiswertbonus. Keine zusätzlichen Profilpositionen durch Minuten oder Fähigkeitsentwicklung; Haupt- und Nebenpositionen bleiben dauerhaft fest. Fremde Positionen können Routine erhalten, ohne Profilfreischaltung.
- Auswahl nur in passender taktischer Startzone; fehlende Empfehlung/schlechte Eignung sperrt zulässige Rolle nicht. Stürmer in zentralem Mittelfeld darf Abräumer wählen. Keine harten Bewegungsgrenzen im Match.
- Freies Verschieben: Rolle bleibt, wenn Ziel gültig, sonst zufällige zulässige Rolle aus vollständigem Zonenkatalog; Ausrichtung immer neutral. Tausch zweier belegter Plätze: Rolle/Ausrichtung bleiben am Platz. Auswechslung übernimmt bisherige Rolle, keine automatische Profilbestrolle.
- Längs vom eigenen Tor Abwehr erste 30 Prozent, Mittelfeld mittlere 40 Prozent, Angriff letzte 30 Prozent. Mittelfeld/Angriff mittlere 50 Prozent Breite zentral, äußere 25 je Seite. Flügelspieler seitliches Mittelfeld/Angriff; Spielmacher/Abräumer/Box-to-Box zentral im Mittelfeld; Torjäger/Stoßstürmer/Zielspieler zentral im Angriff; Dribbler zentral/seitlich im Angriff. Verteidigerrollen gesamte Abwehrbreite. Gleicher relativer Vertrag für alle Feldkombinationen.

**Startbedingungen, Vorlauf und Produktionsgate:** Nach späterer Freigabe Katalog/Zonen- und Übergangsszenen vorbereiten, Minutenbuchhaltung inventarisieren. Produktionsroutine/Eignung wartet auf Skala, Grundroutine, Minutenrate, Kombinations-/Rollengewichte und Hysteresemarge. Längszonen bestätigt: vom eigenen Tor Abwehr 30 Prozent, Mittelfeld 40 Prozent, Angriff 30 Prozent. Grenzpunktkonvention aus gemeinsamem Mastervertrag verwenden; Erstgleichstand der Rolleneignung bleibt offen. Tormänner ausschließlich mit Profilposition Tormann sind bestätigt; mitspielender Tormann ergänzt keine Feldposition. Profilpositionen bleiben dauerhaft fest; deren spätere Erweiterung ist kein offenes Gate mehr. Injizierter RNG; Integrator bestimmt Zufallsstrom/Speicherfolge. Tormannverschiebung/Tausch nicht selbst erweitern.

**API-Entwurf:** `roleSuitability(baseSkills, positionRoutine, roleId, approvedWeights)`; `bestRecommendedRole(fixedList, previousBest, suitability, approvedMargin)`; `routineTransition(routine, actualPositionMinutes, approvedRate)`; `allowedRoles(startZone, pitchGeometry)`; `tacticTransition(action, state, geometry, rng) -> nextAssignments`. Aktion unterscheidet free-move/swap/substitution, keine Pixelheuristik. Routineminuten/Frischeereignisse getrennt. Gemeinsame Geometrie, keine zweite Felddefinition. Match erhält Katalog/freigegebene Routinemodifikatoren, keine UI-Scores.

**Sinnvolle spätere Nachweise:** Katalog/Zonenmatrix/alle vier Feldkombinationen/Seitenwechsel/Grenzpunktvertrag; Verschieben/Tausch/Auswechslung, Rollenübernahme/Neutralreset, unempfohlene zulässige Rolle, niedrige Eignung ohne Sperre. Hauptposition auch Jugend voll, Neben-/Fremdstart, tatsächliche Minuten/Positionswechsel, kein Reset/Verfall/Transferverlust. Auch volle Routine und verbesserte Fähigkeiten auf fremden Positionen erweitern keine Profilpositionen oder Empfehlungen. Empfehlungsliste bleibt; Farben/bestes Highlight nur nach vereinbarten permanenten Ursachen, Hysterese. Seed/Speichern/Laden identisch, kein Renderzufall.

**Planquellen:** spieler-archetypen-plan.md und spieler-erstellung-rollen-plan.md.

**Geprüfte Integratoranker:** `dist/world-match-v64.js:9` v64PlayerInstructions, `:109` v64Orientation, `:117` v64GridRole, `:134` v64MoveCell, `:193` v64QueueSubstitution; `dist/world-physical-v65.js:273` v65SwapPositions, `:27` v65ApplyTactics. Aktuelles state.roles enthält Positionsgruppen: neue Archetypen nicht stillschweigend in bestehende IDs schreiben. Datentrennung/Hookwechsel ist Integratoraufgabe.

## P05 — Taktik- und Spielerprofiloberfläche

**Status: gemeinsame Rollen-/Zonenoberfläche lokal integriert; drei zurückgestellte Besichtigungen bleiben offen.** [Abnahme](../platform/roles-tactics-football.md).

Am 8. Oktober 2026 ist P05 für die neue lokale Rollen-Prüfkarriere integriert: Rollen über dem Spieler, defensiv/neutral/offensiv, eine ungefähre Wirkungszone und gemeinsame Bedienelemente im dauerhaften Matchplan, vor Anpfiff und in der Pause. Empfehlungen und Farbstufen verwenden die sichere P01/P04-Projektion. Unity bleibt der gewählte Hauptpfad; es liest den gemeinsamen Matchzustand. [Lieferung und Prüfgrenzen](../platform/roles-tactics-football.md). Bestehende Karrieren werden nicht nachgerüstet; Produktionsbalance und die drei zurückgestellten UI-Besichtigungen bleiben offen.

**Späterer vollständiger Agentenprompt:** Übernimm ausschließlich schmale Renderer für Rolle, wichtige Fähigkeiten, Eignungsfarben und ungefähre Laufzonen. Keine Erzeugung, Entwicklungs-/Frische-/Routinerechnung oder Simulation. Verwende bereinigte UiPlayerProjection und freigegebene Taktikverträge. Bestehende Menüs, Profil, Prematch/Pause, Eingabe-/Speicherpfade gehören ausschließlich dem Integrator. Befolge die gemeinsamen Auftragsregeln vollständig.

**Exklusive spätere Dateien — alle neu vorgeschlagen:**

- `dist/player-tactics-ui.js`, `dist/player-tactics-ui.css`
- `docs/player-contracts/tactics-ui.md`
- `work/check-player-tactics-ui.cjs`, `work/test-player-ui-projection.cjs`

Bestehende Dateien: keine Schreibzuständigkeit.

**Abgrenzung zum Menüredesign:** [U01-R](06-ui-redesign.md#exklusive-zuständigkeit-und-teilpakete) besitzt Flutlicht-Rahmen, gemeinsame Farben/Tooltips; U01-A bis U01-F besitzen getrennte Verwaltungsansichten. P05 liefert seine fachlichen Teilrenderer gegen den von I00 freigegebenen Komponentenvertrag; der Integrator bindet sie ein. P05-Produktionsrenderer benötigen lauffähige U01-R-Komponenten zusätzlich zum Fachvertrag; Viewmodel-Vorlauf kann vorher gegen gekennzeichnete Stubs erfolgen. U01s eigenständige lokale Bestandsmodernisierung wartet nicht auf neue P05-Funktionen und hält bestehende Taktikwege erreichbar. Die Dummy-Referenz nimmt weder Aufstellung noch Matchansicht vorweg.

**Bestätigte Anforderungen:**

- Taktiksheet weist Rolle über dem Spieler zu; relevante Fähigkeiten hervorheben, einen gemeinsamen ungefähren Raum/Laufweg anzeigen. Keine exakte individuelle Route oder getrennte Ballbesitz-/Abwehransicht. Ausrichtung defensiv/neutral/offensiv. Individuelle Einzelanweisungen im neuen Modell vorerst ersetzen, Mannschaftstaktiken separat erhalten.
- Profil zeigt beste Rolle/weitere Empfehlungen primär spielbarer Positionen; feste Liste/P04-Highlight, kein beliebiger vollständiger Katalog. Taktik bietet Zonenrollen unabhängig von Empfehlung. Keine Flügelprofilposition.
- Fähigkeiten/Eignung nur Farbstufen, auch aria-label/title/Tooltip; Bildschirmleser verwendet bestehende Farbstufennamen, keine Zahlen. Relevante Fähigkeiten verständlich markieren. Talent vollständig verborgen; Höhe/Fuß normale Eigenschaften. Kein exakter Eignungsscore im DOM.
- Bewegung/Tausch/Wechsel folgen P04; Neutralreset/Zufallsrolle aus Zustandsauftrag, kein Renderer-RNG. Gemeinsamer Renderer für Prematch/Pause, kein zweiter Taktikzustand.
- Mouse/Touch/Tastatur/Mobilebreiten, PC-Browser zuerst und später Android. Aktuelle Farbstufen erhalten. Viewmodel engineunabhängig planen, konkrete Engine-UI nach Vergleich.

**Startbedingungen, Vorlauf und Produktionsgate:** Nach späterer Freigabe Viewmodel/Interaktionszustände mit Dummy-Farben skizzieren. Produktionsrenderer wartet auf P04-Katalog/Zonen und bereinigte P01/P04-Projektion. Individuelle Einzelanweisungen werden vorerst durch Rolle/Ausrichtung ersetzt; Mannschaftstaktiken bleiben separat erhalten. Keine versteckten individuellen Zusatzaufträge in neuen Welten und keine Bereinigung alter Spielstände. Zusätzliche Optionen allenfalls später anhand von Tests erneut abstimmen. DE–EN und Zonenmarkierungen abnehmen. Kein großer Menüumbau.

**API-Entwurf:** `renderProfileRoles(uiProjection, labels)`; `renderTacticRoleControl(assignment, allowedRoles, uiProjection, labels)`; `renderRoleZone(zoneViewModel)`. Callbacks liefern choose-role/choose-orientation/Move-Aufträge an zentralen Controller. Whitelist-Projektion mit bereits abgeleiteten Farbstufen, keine Verbindung zum versteckten internen Spieler. Keine Storagezugriffe/Simulation/eigene Updateschleife.

**Sinnvolle spätere Nachweise:** Profil/Prematch/Pause, Haupt-/Neben-/Fremdposition, Zonen, Rollenwechsel/Verschieben/Tausch/Auswechslung, Integrator-Speichern/Laden. DE/EN, Tastatur/Touch, 320/390 Pixel/Desktop, Zonen aller Feldkombinationen. DOM/Accessibility/Tooltip-/Screenshotprüfungen auf Fähigkeits-/Eignungs-/Talentoffenlegung; versteckte Sentinelwerte und indirekte Talentkategorien prüfen. Renderer mutiert Input nicht und ruft kein RNG/Simulation auf. Dummy-Vorschau nur freigegebene Projektion, keine internen Produktionswerte im HTML.

**Planquellen:** spieler-archetypen-plan.md, product.md, development.md.

**Geprüfte Integratoranker:** `dist/world-views-v68.js:248` v68OpenPlayerProfile; `dist/strength-v55.js:24` v55SkillGroupsHTML/Farbstufen; `dist/world-match-ui-v64.js:132` v64UiTactics, `:157` v64UiPrematchPitch; `dist/world-physical-v65.js:261` Pausenrenderer, `:450` Ausrichtungsbedienung; `dist/world-grid-touch-v71.js` Touchanbindung. i18n-v75.js/Bestandsstyles/Loader bleiben Integrator.

## P06 — Rollen- und aktionsbezogene Matchnoten

**Status: Rechner und tatsächliche native/kompakte Aktionsanbindung lokal integriert; Notengewichte bleiben Testkandidaten.** [Abnahme](../platform/roles-tactics-football.md).

**Späterer vollständiger Agentenprompt:** Übernimm ausschließlich die neue Leistungsbewertung anhand beobachteter Matchaktionen, tatsächlicher Aufgaben und Einsatzphasen. Liefere interne Noten auch für Kurzeinsätze und den RatedAppearance-Vertrag für P03. Kein eigener Matchablauf, kein Entwicklungsrechner und kein pauschaler Spielerqualitätsbonus. Befolge die gemeinsamen Auftragsregeln vollständig. Die Bewertungsregeln sind ein eigenständiges Arbeitspaket; P03 darf sie nicht als Nebenaufgabe erfinden.

**Exklusive spätere Dateien — alle neu vorgeschlagen:**

- `dist/player-match-ratings.js`
- `docs/player-contracts/match-ratings.md`
- `work/test-player-match-ratings.cjs`
- Eigener neuer Szenenordner `work/player-next/ratings/`; darin insbesondere `scenarios.json` und `expected-invariants.md`. Alle Szenen dieses Ordners gehören P06, keine gemeinsamen Match-/QA-Szenen ändern.

Bestehende Dateien: keine Schreibzuständigkeit. Speicherung von Noten und Integration in Matchrecord, Form und Entwicklung liegen beim Integrator.

**Bestätigte Anforderungen und Abgrenzung:**

- Primär Erfüllung des tatsächlichen Trainerauftrags bewerten: offensive, defensive und Aufgaben ohne Ball nach Rolle, Einsatzposition und jeweiliger Spielsituation. Rollenwechsel innerhalb eines Spiels werden als eigene zeitlich begrenzte Phasen erfasst, keine Bewertung aller Minuten anhand der Endrolle.
- Aktionen anhand situativer Schwierigkeit und taktischem Nutzen bewerten. Erfolgreiche sinnvolle Pässe, Chancenerschaffung, Abschlüsse, Raumgewinn, Ballverluste, vermeidbare Fehler, Tacklings und Absicherung fachlich unterscheiden. Keine Punktefarm durch viele risikolose Wiederholungspässe. Sinnvolle Entscheidungen ohne anschließenden Erfolg und tatsächliche Fehlerursachen getrennt betrachten; genaue Gewichtung bleibt offen.
- Kein pauschaler Sieg-, Niederlagen- oder Zu-null-Bonus. Keeperleistung nach beobachteten Paraden, Fang-/Abwehraktionen, Abspiel, Raumdeckung und eigenen Fehlern bewerten; ein kaum geprüfter Keeper erhält keine automatische Spitzennote und Gegentore sind keine automatische individuelle Schuld. Für Feldspieler zählt auch taktisch nützliche Arbeit ohne Tor/Assist.
- Alle tatsächlichen Einsatzminuten zählen intern, auch 1–19 Minuten. Kurzeinsätze mit echter Rolle und beobachteter Leistung intern bewerten. Die bisherige sichtbare Schwelle von 20 Minuten bleibt, sofern nicht separat geändert; interne Note und Sichtbarkeit sind verschiedene Felder. Nicht eingesetzte Spieler erhalten keinen bewerteten Einsatz.
- Keine Notenänderung allein aufgrund gespeicherten Talents, Potenzials, Fähigkeitswerts, Form oder Routine. Hohe Grundfähigkeit darf die tatsächliche Aktion beeinflussen, aber nicht nochmals einen direkten Notenbonus geben. P06 erhält keinen vollständigen internen Spieler mit Talent. Für identischen Auftrag und identische beobachtete Leistung muss die Bewertung unabhängig vom Generationsprofil gleich sein.
- Neue Bewertung nur für neue Matches in den freigegebenen neuen Welten. Historisch fehlende Aktionskontexte nicht rekonstruieren und alte Noten nicht nachberechnen. Keine Umrechnung bestehender Karrieren durch einen neuen Bewertungsrechner.

**Startbedingungen, Vorlauf und Produktionsgate:** Nach späterer Freigabe startbar sind Bewertungsvertrag, Szenen und strukturierte Ereignisbeispiele. P04 liefert Rollenauftrag und Positionsphasen, Matchagenten tatsächliche Aktions-/Kontakt-/Absicherungsereignisse. Vor produktiver Formel genaue Notengewichte, Baseline, Umgang mit geringer Ereignismenge, Kontextnormalisierung und Regel für fehlende Ereignisdaten freigeben. Die vorhandene Notenskala 1–10 dient als Integrationsreferenz; neue Gewichte sind damit nicht beschlossen. Ohne-Ball-Nutzen muss tatsächlich beobachtet werden; beabsichtigter Laufplan allein ist kein nachgewiesener Erfolg. Keine Perfect-Information-Bewertung anhand zukünftiger Ereignisse.

Der Integrator vereinbart einen einheitlichen Ereignisvertrag für sichtbare Simulation und kompakte KI-Partien. Wenn kompakte KI die erforderlichen Kontexte nicht liefert, ist deren Erfassung/Anpassung ein explizites Integrationsgate. Der alte Tor-/Assist-Fallback ist keine automatische Ersatzformel für die neue Bewertung. Freigegebene Stubs ermöglichen parallelen P03-Vorlauf; reale Matchereignisse und echte P06-Ergebnisse sind Pflicht für Endabnahme.

**API-Entwurf zur Freigabe:** `rateAppearance({playerId, fixtureId, worldId, seasonId, virtualMinutes, rolePositionPhases, actualEvents}, approvedRatingParameters) -> RatedAppearance`. Phase enthält startMinute/endMinute, tatsächliche Position, Rolle, Ausrichtung und Auftragskontext. Ereignis enthält stabile ID, virtuellen Zeitpunkt, beteiligte Spieler, Aktionsart, beobachtetes Ergebnis und verfügbare Schwierigkeits-/Nutzenkontexte; fehlender Kontext explizit als nicht erfasst behandeln. Stabile Ereignis-ID dient Deduplikation, keine neue Statistik durch Replay/Renderer.

Ausgabeentwurf: stabile Identitäten, tatsächliche Minuten, interne numerische Note, sichtbare Note oder null gemäß bestehender Minutenschwelle, Rollen-/Positionsphasen und nachvollziehbare interne Beitragszusammenfassung. P03 bildet daraus sein minutengewichtetes Dreierfenster; P06 aggregiert nicht nochmals die letzten drei Spiele und bucht keine Lernpunkte. Bereits erfasste Spiele nicht rückwirkend überschreiben. Beitragsdaten sind internes QA-Material, keine neue Produktanzeige versteckter Werte.

**Sinnvolle spätere Nachweise:**

- Derselbe Aktionsverlauf bei unterschiedlich hohem Talent, Grundfähigkeiten oder Potenzial ergibt dieselbe Note; dieses Wissen ist nicht Teil der Eingabe.
- Gleiche individuelle Leistung bei Sieg/Niederlage/Zu-null ohne automatische Notenverschiebung; Keeper mit vielen schwierigen Paraden, eigener Fangfehler und kaum geprüfter Keeper getrennt. Abräumer mit sinnvoller Absicherung ohne Scorerpunkte und Stürmer mit nützlichen Tiefenläufen fair erfassen.
- Rollen-/Positionswechsel, Ein-/Auswechslung und Anteil der Phasen korrekt; 1/5/19 Minuten intern bewertet, 19/20-Sichtbarkeit, 0 Minuten kein Einsatz. Identische virtuelle Leistung bei anderer realer Spielgeschwindigkeit/2D/3D gleich.
- Wiederholte triviale Pässe erzeugen keine unbeschränkte Spitzennote; schwieriger taktisch nützlicher Pass, unnötiger Ballverlust und sinnvoller Lauf ohne tatsächlichen Nutzen getrennt. Keine doppelten Beiträge bei mehrfach geliefertem Ereignis oder Replay.
- P06→P03 durchgehender Vertrag: drei echte schwache Kurzeinsätze plus kumulierte weitere Minuten, gute Einsätze an der 6,5-Grenze und Fensterunterbrechung ab 5,5 nach den freigegebenen P03-Regeln. Fehlende Kontexte werden offengelegt; keine erfundenen Altaktionen.
- Endabnahme mit echten neuen Fixture-Records aus sichtbarer und kompakter Simulation, nicht nur synthetischen Stubs. Besondere Kontext-/Keeperfälle im exklusiven Szenenordner dokumentieren; freigegebene Gewichte und Stichprobengröße bei Balancebefunden nennen.

**Planquellen:** jugendentwicklung-noten-plan.md, spieler-archetypen-plan.md, spieler-erstellung-rollen-plan.md und product.md.

**Geprüfte Integratoranker:** `dist/world-match-v64.js:284` aktuelle sichtbare Note erst ab 20 Minuten mit Tor-/Assist-Fallback, `:287` Matchrecord und `:289` v64UpdateForm; `dist/world-physical-v65.js:215` Übernahme der bisherigen performanceRating-Werte. `dist/game.js:92` bestehende performanceRating-Funktion ist Referenz für tatsächlichen Altstand, kein freigegebener neuer Rollenbewertungsvertrag. Umstellung dieser Bestandsfunktionen, Formbuchung und Weitergabe an P03 übernimmt Integrator.

## Integratorübergabe und Ownership-Kollisionen

Alle gemeinsamen Bestandsdateien gehören dem Integrator: world-foundation-v61.js, world-youth-manager-v67.js, world-economy-v66.js, world-match-v64.js, world-match-ui-v64.js, world-physical-v65.js, world-views-v68.js, world-grid-touch-v71.js, strength-v55.js, player-status-v51.js, i18n-v75.js, game.js, pitch-v55.js, index.html sowie Build-/Offline-/Store-/Speicherpfade und Rootdokumentation. Das verhindert P01/P03-Konflikte in youth-manager und P02/P04/P05/P06/Match-Konflikte in match/physical. Keine globalen Monkeypatches als Umgehung.

Schnittstellen: P01↔P04 kohärente Empfehlungen; P01↔P03 Caps/Talent; P02↔Match tatsächliche Belastung/effektive Fähigkeiten; P06↔Match tatsächliche Ereignisse/Rollenphasen; P06↔P04 Rollenauftrag; P06↔P03 RatedAppearance einschließlich Kurzspiele; P04↔Match Routine/Rollen/Geometrie; P04↔P05 bereinigte Anzeige/zulässige Aktionen. Matchagenten besitzen match-contact-rules.js, match-action-choice.js, match-player-intents.js und ihre Verträge; keines dieser Module gehört P01–P06.

Nach späterer Freigabe können Vertrags-/Szenenvorläufe parallel beginnen. Fachcode nach gemeinsamem Vertragsgate; P01-Generator/P03-Lernverteilung/P04-Routine/P05-Integration/P06-Notenformel warten auf ihre offenen Entscheidungen. P05 kann mit Dummy-Projektionen und P03 mit von P06/Integrator freigegebenen RatedAppearance-Stubs vorarbeiten. Endabnahme verlangt echte P06-Ergebnisse aus Matchereignissen; Stubs reichen dafür nicht. Integration/Save-/Match-/UI-Parität in gesonderter Integrator-/QA-Welle. Wellenvergabe im Masterplan README.md. **Aktuell bleibt jeder Auftrag geplant und nicht gestartet.**
