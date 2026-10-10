# AP02: Vereinsidentitäten und Übergabe

Stand: 10. Oktober 2026. **Redaktion und strukturierter Katalog umgesetzt; Laufzeitintegration und externe Namensfreigabe offen.**

## Ergebnis

Der [lesbare Katalog](ligaexpansion-vereinskatalog.md) und die [JSON-Daten](ligaexpansion-vereinskatalog.json) enthalten alle 192 Vereine: je acht spielbare Ligavereine und acht KI-Pokalvereine in zwölf Ländern. Die 48 bisherigen Identitäten bleiben erhalten; 60 Ligavereine und 84 Pokalvereine sind ergänzt. Alle Einträge haben feste Kennungen, reale Städte, drei benannte Hexfarben, eigene Geschichten und sechs getrennte relative Vereinsparameter. Für die 144 Ergänzungen liegen eigenständige Wappenmotive vor, noch keine Grafiken.

**AUT-5 heißt auf Nutzerentscheid „Innsbruck Sport“.** Der zuvor gewählte Name Union Innsbruck ist ersetzt. Stadt, Kennung und Wiederaufbaurolle bleiben erhalten. Schwarz Weiß Graz, Linzer SC Union und Wiener SC Fortuna bleiben in den gewählten Formen bestehen.

Die Länderreihenfolge und vier Länderstufen stammen unverändert aus AP01. Insgesamt 14 Stadtderbypaare verbinden Ligavereine derselben Stadt; mindestens eines pro Land. Sie erzeugen keine Spielboni und keine geskripteten Ergebnisse. Jede Liga enthält acht unterschiedliche Profilkombinationen, mit unterschiedlicher Tradition, Ausbildung, Risikobereitschaft und Vorstandsgeduld. Die redaktionelle Vorsaison aus AP01 wird dadurch nicht überschrieben: starke Startrollen müssen nicht den letzten Tabellenplatzierungen entsprechen.

## Datenvertrag

- Länder: stabile Codes und bestätigte Stufen A–D; Vereinskennung `CODE-1` bis `CODE-8`, Pokalvereine `CODE-C1` bis `CODE-C8`.
- `profile`: Tradition, Fans, Jugend, Risiko, Geduld, Startkader, jeweils 1–5. Dies sind interne Vereinsparameter, keine Spielerfähigkeiten. Startkader ist die Rolle innerhalb des Landes; ein Wert 5 verspricht nicht dieselbe absolute Qualität in jedem Land.
- `palette`: drei explizite Farbnamen und Hexwerte. Die zwei bisherigen Identitätsfarben und die bereits verwendete dritte Trikotfarbe der 48 Vereine bleiben unverändert. Der Farbabgleich gegen tatsächliche Trikots und neue Grafiken folgt AP03.
- `playable` und `kind`: Liga erlaubt Managerstart, Pokal nicht. Aus einem vollständigen redaktionellen Profil folgt keine neue Vollwirtschaft für Pokalvereine: AP03 übernimmt zunächst den in AP00 geprüften `simulationOnly`-Pfad.
- `crestConcept`: redaktionelles eigenes Motiv, bei Bestandsvereinen Hinweis auf das vorhandene eigene Wappen. Keine realen Vereinswappen importiert.
- `origin` und `nameReview`: Herkunft und begrenzter Prüfstatus bleiben nachvollziehbar. Alle neuen Geschichten sind fiktiv; sie erzeugen keine historischen Partien, Awards, Zahlungen oder Wertungspunkte.

AP03 muss die Parameter an tatsächliche Startkader, Ausbildung, Erwartungen und Mittel anbinden. AP03/AP07 kalibrieren überlappende absolute Länderbereiche; starke Vereine kleinerer Länder können schwächere Vereine größerer Länder herausfordern. Direkte Tor- oder Ergebnisfaktoren sind ausgeschlossen. Diese Wirkung ist mit dem Katalog allein noch nicht implementiert oder nachgewiesen.

## Reproduktion und Prüfung

`node work/generate-ligaexpansion-ap02.cjs` erzeugt JSON und lesbaren Katalog. Grundlagen sind der eingefrorene [48er-Bestand](ligaexpansion-bestand48.json), die Ligavereinsvorschläge, der Griechenlandentwurf und `work/ligaexpansion-editorial-data.cjs`. Der eingefrorene Bestand wurde feldweise mit dem lokalen Katalog und `origin/main` auf `37a702ea1fe465aa398b11e9ee4a29948295ee28` verglichen.

`node work/check-ligaexpansion-ap02.cjs` prüft 192 eindeutige Kennungen, je 16 Vereine mit 8/8-Verteilung, alle sechs Profilbereiche, drei aufgelöste unterschiedliche Farben, eindeutige Geschichten, Erhalt sämtlicher Bestandsfelder, gewählte österreichische Namen, Städte der Derbypaare und alle Saison-1-Verweise. Die interne Namensvorprüfung vergleicht 18.336 Paare; keine normalisierten Doppelnamen. Ein ähnliches Paar ist dokumentiert. Der Bericht liegt nach dem Lauf unter `outputs/ligaexpansion-ap02/check.json`.

## Abnahmegrenzen

Die redaktionelle Vollständigkeit und strukturellen Prüfungen sind erfüllt. Die [Namensvorprüfung](ligaexpansion-ap02-namenspruefung.md) dokumentiert interne Vergleiche, begrenzte öffentliche Recherche und noch offene externe Prüfung. Vollständige Register-/Ähnlichkeitsprüfung ist nicht als erledigt markiert. Ebenso offen bleiben die tatsächliche Wirkung auf Kader/Mittel und die Assetabnahme in AP03; damit ist die vollständige releasewirksame AP02-Abnahme noch offen.

Keine Änderungen am laufenden Spiel, keine Spielstandmigration und keine Veröffentlichung. Der Seitenfuß bleibt unverändert. AP03 kann auf dem vollständigen Katalog aufbauen; der aktuelle Hauptzweig/Unity-Stand aus AP00 muss vor Laufzeitänderungen erneut geprüft werden.
