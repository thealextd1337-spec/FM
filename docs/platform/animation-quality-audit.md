# A02: Animationsqualität – Asset- und Quellcodeaudit

## Fortschreibung durch Release 117

[Release 117](../release-117.md) ergänzt auf dem vorhandenen Rig eine eigene `airLand`-Auswahl, zusammenhängende Luft-/Landefolgen, Ausschwingen hoher Pässe/Flanken, Volleyhaltung, native Einwurfphasen und lokale Keeper-Seitenauswahl. 106 tatsächliche Unity-Iterationsprüfungen, vollständige Suiten, aktuelle Editorbilder und WebGL-Build sind getrennt nachgewiesen. Es wurden keine neuen Clips gekauft oder erzeugt. Die nachfolgende 48-Zeilen-Klassifikation beschreibt ausdrücklich den historischen Release-115-Quellstand; die dortige fehlende `airLand`-Auswahl ist damit geschlossen. Eigenständige Nachfass-/Abspielketten und physische Gerätequalität werden dadurch nicht pauschal freigegeben.

## Historischer Auditstand

Stand: 9. Oktober 2026. Aktueller eingefrorener Unity-Quellstand `959aea1e62482d85aff5d6c7d1d001f23bb64097f6497fe1389f5cb444128b93` mit integrierter nativer Grätschenprojektion und Unity-Zweikampf-/Bewegungsanbindung, inzwischen als Teil von [Release 115 veröffentlicht](../release-115.md). Dieser Audit bleibt ein lokaler Asset-/Quellnachweis; keine neuen Meshy-Aufträge.

Der Audit ist ausführbar und untersucht tatsächliche Assetbytes, den Bildvertrag sowie den Unity-Katalog und dessen Aktionsauswahl. **Dies ist keine neue visuelle Abnahme.** Insbesondere wurden weder Unity-Editor/-Build gestartet noch Screenshots, Videos oder Smartphonebefunde erzeugt. Vorhandene ältere Importberichte sind als historische Referenz gekennzeichnet.

## Befund des historischen Audits: Unity 959aea

Maßgeblich ist der neue Lauf [unity-959aea-final/report.json](../../outputs/3d-quality/animation-audit/unity-959aea-final/report.json), mit [lesbarer Aktionsliste](../../outputs/3d-quality/animation-audit/unity-959aea-final/README.md). Historische `source-baseline`- und `unity-959aea-candidate`-Dateien bleiben unverändert. Der Kandidatenlauf hatte Keeper-Seitwärtsschritt und Dribbling fälschlich als nicht angebunden geführt; diese Parserfehler sind im neuen Lauf korrigiert.

Der aktuelle Bestand bleibt **34 Originalclips, zwei Pilotclips und 28 Gelenke**. Der Unity-Katalog enthält jetzt **29** zugewiesene vorhandene Clips. Die 48 Aktions-/Variantenzeilen verteilen sich aktuell auf:

| Klassifikation | Anzahl | Bedeutung |
| --- | --- | --- |
| `present+integrated` | 33 | Quellselektor vorhanden, mit vorhandenen Clips und/oder prozeduraler Pose |
| `integrated-quality-defect` | 8 | Belegte generische/teilweise Quellsubstitution; sichtbare Schwere ungemessen |
| `missing` | 1 | `airLand`: keine eigene Landepose/-auswahl im Unity-Weltselektor |
| `present-unwired` | 0 | Keine aktuelle Restlücke dieser Art im geprüften Umfang |
| `unproven` | 6 | Eigenständige Auslösung oder vollständige Bewegungsfolge nicht nachgewiesen |

**Quellanbindung erledigt:** Front-/Seiten-/Rückseitengrätsche einschließlich Ballgewinn, freiem Ball, Fehlversuch und Foul nutzt denselben nativen `slide`-Pfad und die prozedurale niedrige Körperpose. `slideRecovery` verwendet die bestehende Keeper-Aufstehbasis mit `FootballDuelTiming.RiseTime/Recovery`. Stehendes `tackle` wählt die Annahmebasis, linke/rechte Fußkorrektur und prozeduralen Lunge. `foulOffender` wählt den vorhandenen kurzen Stolperabschnitt mit Lunge-/Standübergang. Diese Aufgaben sind nicht länger offene P1-Anbindungsaufträge.

Der Keeper-Shuffle benötigt **keine** Aktion `keeperShuffle`. `FootballLocomotion.Lateral` kommt aus tatsächlicher Verschiebung relativ zur erhaltenen Blickrichtung. `WorldFootballPose` wählt bei `|Lateral| > 0,72`, Geschwindigkeit über 0,12 und unter 4,1 m/s sowie außerhalb Turn/Brake den zugewiesenen Shuffleclip; rechts wird derselbe Zyklus rückwärts gesampelt. Die konkrete Auswahl und der Körperübergang bleiben visuell zu prüfen.

Dribbling ist ebenfalls angebunden: der Weltselektor bindet den Nicht-Keeper-Ballbesitzer und verwendet den tatsächlichen `locomotionAction && carrying`-Zweig mit alternierendem Fußreach, Bodennähe und Reichweitenbegrenzung. Der alte Parser suchte dessen früheren Guard ohne `locomotionAction`. Ein eigener Dribbelclip ist für diese Quellanbindung keine Voraussetzung.

### Echte Restliste und noch nötige Sichtprüfung

- **Eine fehlende Quellauswahl:** Luftlandung `airLand`. Vollständiger Absprung/Kopfkontakt/Landungsübergang benötigt einen isolierten lokalen oder prozeduralen Kandidaten und tatsächliche Sichtprüfung.
- **Acht belegte Quellsubstitutionen:** hoher Pass, Flanke, Volley, Kopfball, Luftvorbereitung, Keeperabstoß, Einwurf und Eckball. Diese verwenden generische Fuß-/Kopf-/Handbasis statt einer vollständig belegten aktionsgerechten Körperfolge. Eine zusätzliche gekaufte Clipfamilie ist dadurch nicht automatisch erforderlich.
- **Sechs nicht nachgewiesene Folgen/Auslöser:** allgemeines Stolpern außerhalb Foul, separates Keeperfangen/-halten, Abpraller/Nachfassen, Keeperwurf/-rollen, vollständige Elfmeterfolge und Anstoß-/Wiederanstoßfolge. Wo der native Auslöser fehlt, keine zusätzliche Matchregel nur zur Animation erfinden. Der Bildvertrag belegt weiterhin keine eigenständige `saved`-/`holding`-Sequenz.
- **Visuelle Gates der bereits angebundenen P1-Aktionen:** führendes Bein, Becken-/Bodenkontakt und Aufstehkontinuität; tatsächliche Ball-/Foulkontakte und Abbruch; Stolperfenster/Standblend; Shuffle links/rechts mit rückwärts laufendem rechten Zyklus und Bereitschaft/Stop/Hechten; stehender Zweikampf und Carrier-Fußreach beidseitig. Diese sind Sicht-/Qualitätsprüfungen, keine weiterhin fehlenden Quellzweige.
- **Gesamtabnahme:** TV-/Nahsicht, beide Angriffsrichtungen, Pause/Rückschau, normale/große Geometrie und zwölf/vierzehn Spieler. Tatsächliche Render-/Kontakt-/Gerätemessungen werden separat nachgewiesen. Der Audit liefert insbesondere keinen Smartphonebeleg.

Empfehlungen werden im JSON nun konditional aus der tatsächlich nachgewiesenen Anbindung erzeugt: vorhandene Slide-/Recovery-/Tackle-/Foul-/Shuffle-/Carrierzweige erhalten `visual-review`; fehlen sie, entsteht `source-gap`. Abwesenheit eines neuen Autorenclips wird nicht mit fehlender prozeduraler Integration gleichgesetzt.

**16 Auditprüffamilien bestanden.** Zusätzlich zu den historischen neun Prüffamilien prüfen sieben Regressionen die aktuellen bewegungsbasierten Selektoren und Empfehlungen. Negative Mutationen entfernen nur in einer Arbeitsspeicherkopie Lateral-Guard, Shuffleclipwahl, tatsächliche Lateralmessung, Carrier-Guard oder Fußreach. Dann bleibt der Clip vorhanden, die betroffene Aktion wird korrekt `present-unwired`. Auch Empfehlungen wechseln bei entferntem Tackle-Zweig zurück zur Quelllücke. Keine Produkt-/Unitydatei oder historischer Bericht wurde für diese Mutationen verändert.

## Reproduzieren

Vom aktuellen Worktree aus:

```powershell
node work/platform/animation/quality-audit.cjs --self-test --out outputs/3d-quality/animation-audit/<neuer-laufname>
```

Node 18 genügt; keine zusätzlichen Pakete, Server oder Geräte. Der Ausgabepfad muss unter dem eigenen Auditverzeichnis liegen. Vorhandene Läufe werden nicht überschrieben. Ändert sich eine gelesene Quelle während des kurzen Laufs, bricht der Audit ab und muss wiederholt werden. Quellen erhalten Bytezahl und Texthash; Assets erhalten SHA-256 der echten Bytes. Nach Rendereränderungen einen neuen Lauf erstellen und die Aktionsbeschreibungen gegen die neuen Zweige prüfen: Der Parser ist keine automatische Beurteilung sichtbarer Qualität.

Historischer erster bestandener Lauf: [JSON mit vollständigen Einzelbelegen](../../outputs/3d-quality/animation-audit/source-baseline/report.json), [lesbare Aktionsliste](../../outputs/3d-quality/animation-audit/source-baseline/README.md). Er umfasst **48 Aktions-/Variantenzeilen**, nicht 48 unabhängige Clipfamilien. Eine Grätschenbewegung kann mehrere Richtungen und Ausgänge abdecken. Die folgenden Bestands-/P1-/P2-Abschnitte dokumentieren diesen damaligen Ausgangsstand; für aktuelle Arbeit gelten der neue Lauf und die Restliste oben.

## Historischer Bestand und damalige Anbindung

Die GLB enthält tatsächlich **34 Originalclips und 28 Gelenke**. Clipdauer und Samples kommen aus den binären Zeitaccessors, die Clipnamen stimmen mit dem A01-Manifest überein. Der eingefrorene Masterhash stimmt. Die vorhandene FBX ist vorhanden und gehasht; der Unity-Import wurde hier nicht neu ausgeführt.

Zwei zusätzliche Pilotclips, `pass_inside_meshy` und `receive_ground_meshy`, ergeben insgesamt 36 verfügbare Bewegungen. Hashes von FBX und `.anim` stimmen mit dem Pilotmanifest. Die Textkurven binden unter `target_character`, nicht an den äußeren Actorroot. Numerische Unity-Bindinghashes sind keine Transformpfade. Die vorhandenen Kontaktzeitangaben 0,8 beziehungsweise 0,7 Sekunden sind übernommene bereits dokumentierte Pilotmessungen, keine neue Kontaktmessung dieses Audits.

Zum ersten Auditzeitpunkt enthält `FootballClips()` **27 der vorhandenen Clips**. `ProbeSetup` und `FootballSetup` weisen sie explizit zu. `ProbeBridge` verwendet einen manuellen `PlayableGraph` mit vorgelagerten Mixerknoten; ein AnimatorController ist hierfür keine fehlende Pflichtkomponente. Die Matchuhr treibt Clipzeit und Blend; dieselbe Uhr friert die Pose ein, Rückschau-/Zeitsprünge schneiden unmittelbar auf das empfangene Bild. Kontaktfenster haben Vorrang, normale Übergänge dauern 0,12 Sekunden, dringliche Keeperübergänge 0,035 Sekunden.

Die Klassifikation des ersten Laufs:

- **22 present+integrated:** Bewegungsgrundlage, Bodenpass/-annahme, Schuss, Foulopfer, Keeperparaden/-aufstehen, Torjubel und weitere Grundaktionen sind anhand von Asset, Setup und Quellen angebunden.
- **8 integrated-quality-defect:** Hohe Pässe, Flanken/Ecken, Volley, Kopfball-/Luftvorbereitung, Einwurf und Keeperabstoß verwenden bislang generische oder unvollständige Körperbewegungen. Der Begriff bezeichnet belegte Quellsubstitutionen; wie störend sie aussehen, ist ungemessen.
- **9 missing:** stehender Zweikampf, Luftlandung und aktive Grätschen samt Richtungs-/Ausgangsvarianten haben im damaligen Unity-Aktionsselektor keine eigene Pose. In den 36 verfügbaren Clips gibt es keine vollständige Grätsch-/Kopfball-/Volley-/Einwurffamilie. Lokale prozedurale Lösungen sind ausdrücklich möglich.
- **3 present-unwired:** `foul_stumble_meshy`, `keeper_shuffle_meshy` und die Aufstehbasis für `slideRecovery` sind vorhanden, aber ihre betreffenden Aktionszweige fehlen im damaligen Unity-Selektor.
- **6 unproven:** allgemeines Stolpern, eigenständige Fang-/Abprallersequenz, Keeperwurf/-rollen sowie komplette Elfmeter- und Anstoßsequenz sind durch diesen Audit nicht nachgewiesen. Generische Pass-/Schuss-/Savezweige ersetzen diesen Sequenznachweis nicht.

`present+integrated` bedeutet Quellanbindung. Es beweist weder die aktuelle Editor-Szene noch den gelieferten WebGL-Build oder eine schöne Darstellung.

## Historische Ausgangsbefunde und damalige Zuständigkeiten

### P1: Grätschen und Erholung

Die native Engine besitzt bereits Front-/Seiten-/Rückseitenansatz, tatsächliche Ball-/Körperkontakte, legalen Ballgewinn, freien Ball, Fehlversuch und Foul. Belege stehen in `dist/pitch-v56.js`, insbesondere `v56ApproachInfo`, `v56StartSlide` und `v56AdvanceSlide`. Eine neue Unity-Animation darf diese Entscheidungen nicht ersetzen.

Der Integrator hat die zuvor fehlende Bildprojektion inzwischen geliefert: `slide` und `slideRecovery` werden aus dem vorhandenen nativen Zustand abgeleitet. Der Audit führt den echten `D6WorldUnityContract.picture` in einem isolierten Node-Kontext aus. Aktive Grätsche und Erholung kommen an; Foulreaktionen haben Vorrang. Der bloße Inputwert `slideActive` wird damit nicht länger als vermeintlicher Unitybeleg gewertet. [Projektionsvertrag und native Parität](native-slide-presentation.md).

**Claude:** Aktionsauswahl, niedriges Becken/führendes Bein, Bodenkontakt und Übergang zur nativen Erholung umsetzen. Die existierende Aufstehbewegung kann eine lokale Basis sein, muss aber zum tatsächlichen Rutsch-/Liegeendzustand passen. Anfangs genügt eine geeignete gemeinsame Grätschpose; Front/Seite/hinten sind Kontakt-/Richtungsfälle, keine zwingend drei neu zu kaufenden Clips. Kein lokaler Timer, keine künstliche Ballanziehung, keine zusätzliche Matchregel.

**Abnahme:** Ballgewinn, Abfälschen/freier Ball, Verfehlen und Foul von drei Ansatzrichtungen; Abbruch durch Ballwechsel, Wiederanstoß oder Matchende; gescheiterte Kontakte; eingefrorene Pause und Rückschau über Phasenwechsel. `slideRecovery` muss sichtbar vom Boden hochführen, bevor normale Fortbewegung übernimmt.

### P1: Foulverursacher und Keeper-Seitwärtsbewegung

`foulOffender` kommt aus `v113FoulAction`, aber im ersten Audit fehlen Loader-/Katalog-/Selektorzweige für `foul_stumble_meshy`. Die Bewegung liegt bereits im Master und in der historischen Unity-Importliste. Ihre Gesamtdauer von etwa 11,37 Sekunden ist kein geeigneter automatischer Foulzeitraum: ein passendes kurzes Fenster muss am Rig geprüft werden. Das Foulopfer besitzt bereits Sturz → Aufstehen im nativen 2,7-Sekundenfenster; Boden-/Hüftkontinuität am Clipwechsel bleibt ein sichtbares Gate.

Der Keeper-Seitwärtsschritt `keeper_shuffle_meshy` ist ebenfalls vorhanden, aber im ersten Katalog nicht enthalten. Gewöhnliche Walk-/Run-/Backbewegung ist kein Beleg für einen Keeper-Shuffle. **Claude** soll die Auswahl aus tatsächlicher seitlicher Verschiebung relativ zur Blickrichtung ableiten und beide Seiten, Bereitschaft, Stopp, Hechten und Aufstehen prüfen. Keine zusätzliche Keeper-KI.

### P2: Ballaktionen und Standards

Hohe Pässe/Flanken/Ecken verwenden die Boden-Innenseitpassbasis; Volley und Abstoß die Bodenschussbasis. Kopfball und `airReady` besitzen begrenzte Head-/Spine-Korrektur, aber keine vollständige Absprung-/Kopfball-/Landebewegung. `airLand` und stehendes `tackle` haben im ersten Selektor keine eigene Anbindung. **Claude** kann zunächst isolierte prozedurale oder lokale Ableitungen erstellen; erst ein nachgewiesener Restmangel begründet neue Quellclips.

Einwurf hebt beide Hände zum tatsächlichen Ball, liefert aber im ersten Selektor keine zusammenhängende Aufnahme-/Halte-/Aushol-/Abwurfbewegung. Der Bildvertrag verwirft bisher `holding`, `pickup`, `saved` und `height`. **Integrator und Claude** müssen erst bestimmen, welche vorhandenen Darstellungsfelder für die volle Sequenz benötigt werden. Diese Befunde rechtfertigen weder neue gespeicherte Spielzustände noch erfundene Keeperwurfregeln.

Keeper-Save wählt hoch/tief/seitlich anhand Kontaktpunkt und Lage, bindet eine oder zwei Hände und nutzt native Erholung. Catch/Parry/Rebound haben keinen hier nachgewiesenen eigenständigen Ausgangs-/Haltepfad. Die seitliche Auswahl benutzt aktuell globale Z-Differenz, Hand-/Divekorrektur jedoch lokale Körperachsen; schräge Blickrichtungen müssen besonders geprüft werden. Bestehende Rigtests sind eine Referenz, keine neue sichtbare Bestätigung.

## Abnahme nach der Umsetzung

Für Claude/Integrator: TV- und Kontaktblick, beide Angriffsrichtungen, normale/große Geometrie, zwölf/vierzehn Spieler. Echte Gelenke, Standfuß, Boden/Becken, linke/rechte Varianten, unerreichbarer Kontakt, Vorbereitung abbrechen, Ball bereits freigegeben und Rückkehr zum Laufen prüfen. Pause, Rückschau über Aktionsbeginn/-ende und sichere Fortsetzung müssen dieselbe Posephase darstellen. Eine Leistungsprüfung pro physischem Gerät; der Audit monopolisiert kein Gerät.

Mindestens zusammenhängende Folgen aufnehmen: Lauf → Annahme → Pass → Flanke/Kopfball/Landung; Sprint → Grätsche → Gewinn/Verfehlen → Aufstehen; Grätsche → Foulopfer/-verursacher → Freistoß; Keeperbereitschaft → Shuffle → Catch/Parry → Nachfassen/Aufstehen → Abstoß; Einwurf und Elfmeter einschließlich Vorbereitung und Wiederaufnahme.

Die Quell-/Assetprüfungen bestanden mit **neun Prüffamilien**: Masterhash, echte Clips/Gelenke, Bestandsgleichheit, Pilotbytes/-bindung, Katalogzuweisungen, Trennung Demo/Welt, Pflichtaktionen/Klassifikationen, Negativfall „Clip allein beweist keine Anbindung“ und echter Bildvertrag/Foulvorrang. Die erste Pilot-Bindprüfung deckte numerische Unity-Bindinghashes als Parser-Sonderfall auf; der Parser wurde korrigiert und der gesamte Lauf wiederholt. Es wurde kein Asset geändert.

Der Integrator ergänzt den gemeinsamen Changelog-/Entwicklungsnachtrag. Keine Render-/Hardware-/Releasefreigabe durch diesen Audit.

## Fortschreibung: Torwartfolgen in Release 118

Der [Releasebericht](../release-118.md) führt die anschließende Umsetzung und ihre Abnahme. Der ursprüngliche Auditbestand bleibt als historische Baseline erhalten. Neun Torwartsequenzen wurden aus fünf tatsächlichen nativen Partien aufgezeichnet: Abstoß in beiden Richtungen, mittlere/hohe Paraden und Gegentorfolgen. Separate kontrollierte Szenen prüfen Halten, Nachfassen, Sichern sowie die Negativfälle Abwehrergebnis und fehlende Fakten; diese sind keine natürlich aufgetretenen Matchfolgen.

Der aktuelle Renderer unterscheidet zentrale und seitliche Paraden, verwendet das jeweilige Clipende für Landung, Erholung und Aufstehen und bereitet den vorhandenen Abstoß vor. Bestätigtes Halten erfordert bekannte Fang-/Abwehr-/Flugfakten, tatsächlichen Torwartbesitz und einen erreichbaren Ball. Abwehrergebnis, Gegentor, unbekannte Fakten und unerreichbarer Ball erzeugen keinen behaupteten Handkontakt. Der Integrator hat außerdem den durch eine ältere Parade verdrängten nativen Nachfasskontakt korrigiert. 160 gezielte Unity-Prüfungen prüfen echte Clips/Gelenke, Phasen, Pause, Rückschau und Vertragsgrenzen.

Offen bleiben die vollständige natürlich aufgetretene Folge Parade → Nachfassen/Sichern → Aufstehen → Abspiel, die gemeinsame Sichtabnahme im tatsächlichen mobilen Spiel und physische Android-Leistung/Wachhalten. Ein eigenständiger Torwartwurf-/Rollauslöser fehlt im nativen Match weiterhin; die vorhandenen kurzen und hohen Pässe bleiben maßgeblich. Editorbilder und kontrollierte Kontaktproben belegen weder ein neues Matchereignis noch mobile Hardwarequalität.
