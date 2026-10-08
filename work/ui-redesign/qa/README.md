# Q01: Prüfzugang und minimale verlässliche Testfolge

Stand: 7. Oktober 2026. Q01 besitzt diesen Ordner, `docs/ui-redesign/acceptance.md` und `outputs/ui-redesign/Q01/`. Shared-Harness, Verträge und Produktdateien gehören I00 bzw. den Fachpaketen. Der folgende Vorlauf dokumentiert die ursprüngliche Herleitung; inzwischen liegen ausführbare unabhängige Prüfungen gegen den freigegebenen Vertrag v1.1 vor.

## Ausführbare unabhängige Prüfungen

- `node work/ui-redesign/qa/acceptance.cjs --target source --mode all` sowie identisch mit `--target build`: echte isolierte Karriere, Daten-/Lifecycle-/Profil-/Theme-/Navigationsprüfungen, 216 Layoutfälle pro Ziel und vollständiger Saisonrückblick mit tatsächlichen Pflichtaktionen. `quick`, `layout` und `finance` erlauben gezielte Wiederholung.
- `--mode supplement`: echte Nachwuchsübernahme/-entlassung, Verlängerung, Save-Action-Fehler/Retry, kontrollierte zwingende Managerwahl und Bericht-/Profilrückweg. Setup-Manipulationen sind im jeweiligen Ergebnis ausdrücklich benannt.
- `projection-schema.cjs`: rekursive Allowlist für jeden Feldpfad einschließlich Verein, Wettbewerbe und Report; `edge-cases.cjs` enthält unabhängige Rohobjekt-/RNG-, Einwechsel-/Chronik- und UI-Gegenproben.
- `node work/ui-redesign/qa/regressions.cjs`: neun vorhandene native Suiten in eindeutige Rohlogs; mit `--extra` zusätzlich Wettbewerb, Awards, Trainer und Trikots. Keine historischen Prüfausgaben überschreiben.
- `node work/ui-redesign/qa/finalize.cjs`: konsolidiert die explizit benannten Schlussbelege, prüft Hashgleichheit gegen aktuelle Quellen/Build und schreibt Manifest/Abnahmekatalog. Dieser dokumentbezogene Schritt startet keine Veröffentlichung. Nach neuem Produktstand müssen zuerst betroffene Belege erneuert und die Referenzen angepasst werden; der Drift-Guard darf nicht abgeschwächt werden.

Jeder Browserlauf besitzt einen frischen Kontext und ein neues Ausgabeunterverzeichnis. `results.json` enthält einzelne Assertions und Grenzen. `evidenceValid:false` macht den Lauf nicht zum Schlussnachweis, auch wenn einzelne Assertions grün waren. Die gemeinsame Shell verwendet einen absichtlich erhaltenen versteckten Tooltipknoten; Prüfung auf geschlossen bedeutet `:visible` prüfen, nicht DOM-Knotenanzahl null. Ein Budget von null kann ohne Ledgerbuchung korrekt sein; Buchungseinmaligkeit wird daher mit 200 Credits geprüft.

Die [Abnahmematrix](../../../docs/ui-redesign/acceptance.md) bleibt maßgeblich. Echter Browserzoom 200 Prozent, reale Hardware/Screenreader und Safari werden nicht durch Viewport-, DPR- oder Accessibility-Baum-Aufzeichnungen ersetzt.

## Vorhandene Muster, lesend geprüft

| Datei | Wiederverwendbares Muster | Grenze |
| --- | --- | --- |
| `work/check-finance-close-v130.cjs` | Playwright/Edge, neue Browserkontexte, Sponsor→Budget, Controllerdaten mit DOM vergleichen, Neuladen, DE/EN, 320/390/1280, Quelle und Offline | Standard-Quell-URL Port 4196 (`D6_TEST_URL`); Offline `outputs/index.html`. Manipuliert Karriere/Abschlusszustand zum Setup und überspringt Schritte: kein vollständiger Karrieretest. Feste Ausgabe `outputs/finance-close-v130` nicht für neue Q01-Läufe überschreiben. |
| `work/world-finance-harness-v124.cjs` | Native Controller in Node-VM, deterministische Karrieren, Sponsor/Budget/Markt/Saison und Karrierevalidator | Kein DOM, kein echter Browserstorage. Lädt Quellsegmente per Textgrenze und verändert Daten über Controller; ersetzt keine Integration. |
| `work/test-finance-close-v130.cjs` | Konten stimmen pro Verein, Kategorien einmalig, Bericht ist read-only, Finanzierungsgrenzen | Reiner Controller-/Datencheck; keine Zugänglichkeit oder UI-Aktionen. |
| `work/test-world-local-start.cjs` | Schreibfehler, Retry, Export, alte Karrieren, fünf Slots, keine unbestätigten Phantomkarrieren | Stub-Storage im VM-Kontext; UI und IndexedDB-/Browserverhalten gesondert prüfen. |
| `work/check-season-profile-v127.cjs`, `work/check-rank-labels-v129.cjs` | Eigene Browserkontexte, Offlineprüfung, DOM-Feldvergleich und Karrieresnapshot vor/nach | Historische Selektoren, begrenzte Viewports, teils direkt gesetzte Ergebnisse; keine Redesign-Abnahme. |
| `work/test-i18n-v75.cjs` | Bestehender Übersetzungspfad, dynamische Labels und Warnungen | Stichproben von Übersetzungsausdrücken; prüft nicht sämtliche neuen gerenderten oder zugänglichen Texte. |
| `work/server.cjs` | Quellserver auf Loopback, Standard 4173 (`SECHSER_PORT`), explizite Assetfreigabe | Neue Unterordner/Assets brauchen I00-Integration; kein beliebiger Static-Server. |
| `work/preview.cjs` | Offline-Vorschau, Standard 4174 (`SECHSER_PREVIEW_PORT`) | Liefert primär gebaute HTML-Datei; nicht mit Quelle oder Fixture gleichsetzen. |

Vorhandene Browserprüfungen laden Playwright aus dem gebündelten Runtime-Pfad und Edge aus `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`. Einige verwenden `D6_PLAYWRIGHT`/`D6_BROWSER`; neue Prüfungen sollten verfügbare Runtime/Browserversion dokumentieren. Ein `browser.newContext()` isoliert Speicher vom Nutzerprofil. Der Buildpfad ist nicht überall gleich (`outputs/index.html` gegenüber `outputs/Doppel-6-Fussballmanager.html`); I00 muss das tatsächlich geprüfte Artefakt im Manifest benennen. Zum Zeitpunkt dieser Vorlaufaufnahme war noch kein Browser gestartet und kein bestehender Test ausgeführt. Die späteren tatsächlichen Läufe sind oben und im Abnahmekatalog dokumentiert.

## Benötigte Vertragseigenschaften (Vorschlag an I00, keine neue API)

I00 hat inzwischen als vorläufige Richtung bestätigt: `D6Flutlicht.components`, `shell.mount(emptyHost, sanitizedProjection, {navigate, lead, themeChanged})` mit Rückgabe `{update, unmount, content}`, `adapter.project(career)`/`refresh()` sowie `registry.register({id, enhance})`. Der Adapter besitzt Rohdatenzugriff und Präferenzspeicherung; Fachpakete ergänzen bestehendes DOM unter Erhalt delegierter Attribute/Controller. Dieser Hinweis ist kein Ersatz für die endgültige Vertragsversion. Diese Vorlaufbedingung ist inzwischen durch Vertragsfreigabe v1.1 erfüllt; die aktuelle rekursive Prüfspezifikation steht in projection-schema.cjs.

Für diese Integrationsform muss die Datengrenzenprüfung ausdrücklich auch das **übernommene Bestands-DOM** und dessen zugängliche Beschriftungen erfassen; saubere neue Komponenten allein reichen nicht. Der Lifecyclefall muss sowohl Shell-Callbacks als auch erhaltene delegierte Aktionen zählen: `mount → update → Route wechseln → unmount → mount → ein normaler Klick` darf den aktuellen Controller genau einmal aufrufen. Eine am alten DOM festgehaltene Referenz darf nach Unmount keine neue Spielaktion mehr auslösen. Die UI kann einen Callback besitzen; der Callback ist kein Vorwand, Rohkarrieren als Projektion mitzuschicken.

1. Explizite Aufzählung aller Paket-/Routen-IDs und Randfixtures; gleiche freigegebene Mount-/Update-/Unmount-Schnittstelle bei Fixture, Quelle und Build.
2. Bereinigte Projektion als serialisierbarer, rekursiv prüfbarer Wert. Keine Karriere-/Spielerobjekte, versteckten Rohfähigkeiten, Talentdaten, Entwicklungspunkte oder Funktionsclosure mit zugänglichem Fachzustand als UI-Payload. Zulässige numerische Felder (Alter, Geld, Frische, Ergebnis, Note, Minuten) stehen in einer Allowlist.
3. Erlaubte Aktionen mit Payload, Sperr-/Fehlerantwort, Aktualisierungsweg und vorhandener Controllerautorität. Deterministisches Testsetup darf Testdaten bereitstellen; der zu beweisende Nutzerweg muss echte DOM-Aktionen und Controller verwenden.
4. Testprofil und feste Seeds; Quelle/Build ohne Nutzerprofil. Ein ausschließlich testseitiger Fachsnapshot darf intern Werte vergleichen, gehört aber nicht in die UI-Projektion oder veröffentlichte Prüfausgaben. Nur relevante Salden/IDs und Vergleichsergebnis ausgeben.
5. Speicher- und Renderbereitschaft müssen beobachtbar sein. Auf Bedingungen warten, keine willkürlichen Timer. Fehler können gezielt im Testprofil ausgelöst werden; kein produktiver Speicher oder fremde Karriere wird verändert.
6. Freeze-Manifest aller relevanten Quell-/Builddateien einschließlich bestehender Module, Labels, Loader und Assets. Vor-/Nachhashvergleich entscheidet über Nachweisgültigkeit.

## Minimale Ausführungsfolge nach Vertragsfreigabe

1. **Vertrag und Fixture:** Jede registrierte Ansicht laden, eindeutige Hauptüberschrift und Aktionen finden, Schema auf private Werte prüfen, Renderer gegen eingefrorene Projektion ausführen. Nachweis ist ausdrücklich `fixture`.
2. **Frühe Quelle:** Frische Karriere über freigegebenes Setup; Rahmen öffnen, echte Sponsor-/Leitaktion im DOM auslösen, tatsächlichen Controller-/Ledgerfortschritt und Speicherung abwarten, neu laden und dieselbe Karriere fortsetzen. Erst bei Erfolg weitere integrierte Ansichten anschließen.
3. **Routen und Inhalte:** Alle Inventarziele samt Details/Rückwegen in DE/EN und Hell/Dunkel; Desktop-/Mobilfelder vergleichen. Kaderfähigkeiten dauerhaft sichtbar. Leere, fehlende, gesperrte und historische Zustände ausdrücklich testen.
4. **Datengrenze und Read-only:** Projektionen, gesamtes Render-DOM, Attribute, Tooltips und Browser-Accessibility-Baum prüfen. Numerische private Testwerte müssen feldbezogen geprüft werden: die bloße Suche nach „17“ würde erlaubte Alters-/Tor-/Geldwerte treffen. Striktes Schema, gezielte Testdaten und Snapshotvergleich ergänzen sich. Private Talentkategorien/Stars sind ebenfalls unzulässig. Navigation/Filter/Theme/Sprache dürfen Fachzustand, RNG und Ledger nicht verändern.
5. **Aktions-/Speichergates:** Sponsor, Budget, eine echte Markt-/Nachwuchs-/Vertragsaktion pro vorhandener Familie; erfolgreiche/gesperrte/abgebrochene Wege, doppelte Auslösung, Speicherfehler und Retry. Ergebnis-/Buchungs-IDs, Salden, Pflichtzustand und Neuladen prüfen. Kein Erfolg allein aus einem verschwundenen Button ableiten.
6. **Saisonabschluss:** Native Karriere bis Abschluss vorbereiten; alle von der neuen UI verantworteten Abschluss-/Pflichtschritte tatsächlich bedienen. Wiederholen, zurück navigieren und neu laden. Einmaliger Ergebnis-/Finanzabschluss und vollständiger neuer Saisonstart; direktes Setzen von `reviewStep` oder Überspringen einer Pflichtwahl kann nur Setup für einen Teilfall sein.
7. **Layout/Bedienung:** Matrix aus 320/390/768/1280 und 844 × 390, DE/EN, Hell/Dunkel; allen Routen zuordnen. 200-%-Browserzoom separat, Keyboard-/Tooltipereignisse, reduzierte Bewegung, geräteabhängiger Modus und Präferenzpersistenz. Screenshots und Geometrie zusammen; reine scrollWidth-Prüfung findet keine verdeckten Buttons.
8. **Eingefrorener Offline-Build:** Dieselben Integrationsgates am benannten Offlineartefakt wiederholen, Asset-/Quellgleichheit belegen. Lokale Source-/Build-Ergebnisse niemals aus Fixtureerfolg ableiten.

Der unabhängige Q01-Abschluss und seine konkrete verbleibende Zoom-/Gerätegrenze sind im Abnahmekatalog dokumentiert. Physische Pixelgeräte, Bildschirmtastatur und echte Screenreader bleiben gesonderte Fälle der Abnahmematrix. Vorlauf liefert keine pauschale Barrierefreiheits- oder Gerätefreigabe.
