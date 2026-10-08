# Q01 — Unabhängige Flutlicht-Abnahme

**Nachtrag 8. Oktober 2026:** Die anschließende Nutzerbesichtigung hat zusätzliche UI-Lücken aufgedeckt. Korrekturen, Menüinventar, Start/Erstellung und aktuelle Quell-/Buildbelege stehen in der [Nachprüfung](feedback-2026-10-08.md). Die Matrix darunter ist der historische Stand vom 7. Oktober; echte Geräte, Screenreader und 200-Prozent-Browserzoom bleiben weiterhin offen.

Stand: 7. Oktober 2026, unabhängige Schlussprüfung des lokal eingefrorenen Stands. **43 von 44 Katalogbedingungen bestanden; echter 200-Prozent-Browserzoom bleibt ausdrücklich offen. Damals keine bekannten Produktfehler offen; spätere Befunde und Abschluss siehe Nachtrag.** Besitzer: Q01. Maßgeblich bleiben [U01](../agentenauftraege/06-ui-redesign.md), [Referenz](../ui-referenz/README.md), [Produktregeln](../product.md), [Entwicklungsregeln](../development.md) und der geprüfte Code. Keine Produktdatei durch Q01 verändert.

## Nachweisregeln

- Jede Bedingung hat genau den Status **bestanden**, **offen** oder **fehlgeschlagen**. Bestanden verlangt einen Rohbeleg mit Ziel, Fall, Schritten, Soll/Ist und stabilem Quellstand. Nicht ausgeführte Prüfungen bleiben offen; ein Browserprozess ohne Fehler ist allein kein Funktionsnachweis.
- `fixture`, `source` und `build` erhalten getrennte Ergebnisse. Bereinigte Fixtures belegen Darstellung und Bedienmechanik, keine echten Controller, Speicherwege oder Integration. Paketbelege und historische Referenzchecks sind Eingaben; Q01 bestätigt die Integration unabhängig.
- Pro Lauf neues Verzeichnis `outputs/ui-redesign/Q01/<run-id>/<target>/`. Manifest: Zeitpunkt, Browser/Version, Betriebssystem, Viewport, Sprache, Farbschema, Bewegungseinstellung, Vertragsversion, Inventarversion, Befehle, URLs/Buildpfad und SHA-256 relevanter Quellen vor/nach dem Lauf. Während des Laufs geänderte relevante Quellen machen den betroffenen Nachweis ungültig: offen und wiederholen.
- Screenshots, strukturierte Behauptungen, DOM-/Accessibility-Auszüge, Konsolenfehler und kontrollierte Zustandsvergleiche erhalten Fall-IDs. Keine echten Nutzerkarrieren in Prüfberichte kopieren. Eigene frische Browserkontexte und ausschließlich Testkarrieren nutzen. Quell-, Build- und Fixtureprofile trennen.
- Die 28 übergebenen Inventar-IDs sind unter „Inventarzuordnung der Schlussprüfung“ vollständig zugeordnet. Diese Matrix ersetzt die zentrale Inventarbeschreibung nicht.
- Lokale Pflichtprüfungen müssen am eingefrorenen Quell- **und** Offline-Buildstand bestehen. Hardware, reale Screenreader und spätere Plattformanbindung bleiben getrennt. Lokale Abnahme ist keine Veröffentlichung und hebt keine Version an.

## Lokale Pflichtmatrix

Die Verfahren wurden durch die zugeordneten unabhängigen Integrationsläufe, gezielte Fach-/Fehlerprüfungen und bestehende native Regressionen geprüft. Die Statusspalte verlinkt die Rohbelege. Einschränkungen und Nachweisgrenzen stehen unter „Schlussergebnis“; Browserzoom ist ausdrücklich kein bestandener Viewporttest.

| ID | Paket | Bedingung / Soll | Verfahren / Rohbeleg | Status |
| --- | --- | --- | --- | --- |
| Q-INV-01 | alle | Jede Erhaltungszeile vollständig, mit echter Aktion, Detailziel, zugänglicher Bezeichnung und Rückweg; kein Dummy-Stub im Produkt | Inventar-ID → Route/Element/Aktion; Feldvergleich mit aktiver Quelle auf Desktop und Mobil | bestanden — [Q1], [Q2], [M], [D], [E], [N1], [N2] |
| Q-INV-02 | I00 | Gemeinsamer Rahmen und R/A–F jeweils erreichbar; bestehende Match-/Aufstellungswege erhalten | Route-Rundgang einschließlich Startseite, laufendem Match und Rückkehr | bestanden — [Q1], [Q2], [N1] |
| Q-LOAD-01 | I00 | Alle Module/CSS/Assets laden in Quelle und Offline-Build; keine neuen Fehler oder unerwarteten externen Anfragen | Netzwerkprotokoll, pageerror, Konsole, Buildmanifest | bestanden — [Q1], [Q2], [B] |
| Q-LOAD-02 | I00/R | Wiederholtes Mount/Update/Unmount erzeugt keine doppelten Aktionen oder zurückbleibenden Tooltips/Listener; altes DOM löst nach Unmount keine Spielaktion aus | Mount→Update→Route→Unmount→Mount, ein normaler Aktionsklick; Shell-Callbacks und delegierte Controlleraufrufe zählen | bestanden — [Q1], [Q2] |
| Q-LAY-01 | alle | Jede integrierte Ansicht bei 320, 390, 768, 1280 CSS-Pixeln sowie 844 × 390, jeweils DE/EN und Hell/Dunkel: kein Seitenüberlauf, keine verlorenen Spalten oder überdeckten Aktionen | Geometrieprüfung plus Bilder kritischer Ansichten; gesamte Route-Matrix | bestanden — [Q1], [Q2], [P] |
| Q-LAY-02 | alle | Bei echtem Browserzoom 200 % bleiben Inhalte und Aktionen erreichbar; kurze Höhe und lange Namen passen | Browserzoom, nicht CSS-transform oder nur deviceScaleFactor; Bilder und Bedienfolge | offen — echter Browserzoom nicht ausgeführt |
| Q-LAY-03 | R/B | Mobiler Kopf mit Titelzahl 0/1/2/3 und langen Namen; vollständiger Spielername zugänglich; Desktop-Kaderkopf gemeinsam ausgerichtet | Grenzfall-Renderings und zugängliche Namen | bestanden — [Q1], [Q2], [P] |
| Q-LAY-04 | R/alle | Touchflächen mindestens 44 px hoch, Eingaben mindestens 16 px, Displayränder/untere Navigation berücksichtigt | Berechnete Maße, Fokus-/Scrollprüfung; reale Tastatur separat H-03 | bestanden — [P], [Q1], [Q2], [S] |
| Q-THEME-01 | R/F | Geräteautomatik ist Standard und reagiert im Betrieb; manuelle Auswahl nur Einstellungen, Hell/Dunkel überschreibt Gerät | Media-Emulation, Einstellungsbedienung, Kopf prüfen | bestanden — [Q1], [Q2] |
| Q-THEME-02 | R/F | Präferenz wird am vereinbarten Ort gespeichert und wiederhergestellt; Wechsel erhält Filter, Auswahl, Fokus und Fachphase | Vorher/nachher UI-/Fachzustand, Neuladen | bestanden — [Q1], [Q2] |
| Q-A11Y-01 | R/alle | Tastatur erreicht alle Aktionen, sichtbarer Fokus, Sprung zum Inhalt, Fokus nach Route, keine ungewollte Fokusfalle | Tab/Shift-Tab/Enter/Space/Escape, Fokusreihenfolge | bestanden — [Q1], [Q2], [D] |
| Q-A11Y-02 | R | Tooltips für Fähigkeiten/Flaggen/Titel/Statistiken/Sponsor/Ergebnisse per Hover, Fokus, Tipp; Escape, erneuter Tipp, außerhalb, Scroll und Route räumen auf | Ereignisfolgen, Begrenzung im Viewport, ARIA-Verknüpfung | bestanden — [Q1], [Q2] |
| Q-A11Y-03 | R | Hell/Dunkel: lesbarer Text-/Flächenkontrast, qualitative Farbnamen, Ergebnisbuchstaben, unterscheidbare Awards; reduzierte Bewegung wirksam | Berechnete Kontraste, DOM/AX, Bewegungs-Emulation; keine Screenreaderfreigabe daraus ableiten | bestanden — [P], [Q1], [Q2] |
| Q-NAV-01 | R/alle | Desktop-/Mobilmenüs, Untermenüs, Browser-Zurück/Vorwärts und Detailrückwege erhalten vereinbarte Such-/Filterzustände | Navigation aus gefilterten Listen in Profile und zurück, kurze Querformathöhe | bestanden — [Q1], [Q2], [D], [E] |
| Q-I18N-01 | alle | Alle neuen und erhaltenen sichtbaren sowie zugänglichen Texte in DE/EN, einschließlich Fehler/Leerzustände/Tooltips und dynamischer Zahlen | Zweisprachige Szenario-Matrix gegen vorhandenen Sprachpfad; Schlüssel/fehlende Texte protokollieren | bestanden — [Q1], [Q2], [N1], [D], [E] |
| Q-DATA-01 | I00/alle | UI-Projektionen enthalten keine numerischen Fähigkeiten, Talentwerte, Entwicklungspunkte oder versteckte Talentkategorien | Strikte Schema-Allowlist rekursiv, gezielte private Testwerte, Typen/Serialisierung/Objektreferenzen prüfen | bestanden — [Q1], [Q2], [Q3], [Q4] |
| Q-DATA-02 | alle | DOM einschließlich übernommenem Bestands-DOM, versteckter Knoten, title, aria-*, data-*, SVG-Titel und Tooltip sowie Accessibility-Baum verraten keine solchen Werte | Vollständiger DOM-/AX-Auszug je relevanter Route; gezielter Abgleich privater Felder, keine pauschale Zahlensperre | bestanden — [Q1], [Q2] |
| Q-DATA-03 | I00/alle | Reines Öffnen, Sortieren, Filtern, Theme-/Sprachwechsel und Rendern ändern keine Karriere, Wirtschaft, RNG oder Ergebnisse | Kontrollierter Fachsnapshot vor/nach wiederholter Darstellung; UI-Präferenz separat vergleichen | bestanden — [Q1], [Q2], [Q3], [Q4], [E] |
| Q-DATA-04 | I00/alle | Alte Messlücken bleiben „nicht erfasst“; null, kein Versuch, unbekannt und fehlend bleiben unterscheidbar; keine Rückrechnung | Neue und absichtlich unvollständige alte Testkarriere; Fachsnapshot | bestanden — [Q1], [Q2], [D], [E] |
| Q-OV-01 | A | Begegnungsdatum/Saison/Wettbewerb/Runde/Rang/Heim-Auswärts und Gegnerdetails korrekt; letzte bis fünf Ligaspiele beider Teams alt→neu aus jeweiliger Sicht | Abgleich mit echten Fixtures; <5 und 0 Spiele; Pokalspiele nicht unbemerkt dazuzählen | bestanden — [O], [Q1], [Q2] |
| Q-OV-02 | A | Sponsor offen/auf Kurs/endgültig erreicht jeweils bezahlt/unbezahlt fachlich korrekt; Rang unter/auf/über Ziel; keine Farbauszahlung | Kontrollierte Zustände, Vertrags-/Ledgervergleich, wiederholtes Rendern | bestanden — [O], [Q1], [Q2], [N1] |
| Q-OV-03 | A | Vollständige Übersicht mit sechs Tabellenzeilen, Wettbewerbsstatus, Finanzen, Nachrichten/Ergebnisfolge und echten Detailzielen | Inventarvergleich; mobile Inhalte gegen Desktop | bestanden — [Q1], [Q2], [D], [N2] |
| Q-SQ-01 | B | Kaderanzahl/-grenze, alle Identitäts-/Statistikfelder, Fähigkeiten dauerhaft sichtbar; Filter/Sortierung sowie Leerzustand stimmen | Eigen-/Fremdkader, Torwart/Feldspieler, lange Namen, Liste→Profil→zurück | bestanden — [Q1], [Q2] |
| Q-SQ-02 | B | Einsätze `6 (3)` bedeuten sechs insgesamt/drei eingewechselt; fehlende Einwechselzahl nicht als null | Getrennte bekannte Null-, bekannte positive und fehlende Werte; Tooltip DE/EN | bestanden — [Q1], [Q2] |
| Q-SQ-03 | B | Eigene/fremde/ehemalige Profile vollständig: Vertrag, Status, Saisonstatistik, Karriere, Awards und Titel | Inventar-Feldabgleich; Erfassungslücken, keine Versuche, teilweise erfasste Werte | bestanden — [Q1], [Q2], [E], [N2] |
| Q-MKT-01 | C | Land/Nationalität/Verein/Position/Ablöse und alle vorhandenen Such-/Sortierfilter funktionieren einschließlich unabhängig kombinierter Filter | Native Marktdaten, Nulltreffer, Reset, Profilrückweg | bestanden — [Q1], [Q2], [M], [N1] |
| Q-MKT-02 | C | Gebot/Gegenforderung/Annahme/Ablehnung/Frist und eigene Transferliste verwenden echte Controller; Pflichtbestätigungen erhalten | Mindestens eine echte erfolgreiche und eine gesperrte/fehlgeschlagene Aktion je Controllerfamilie; vorher/nachher | bestanden — [Q1], [Q2], [M], [N1] |
| Q-MKT-03 | C | Verträge: Laufzeit, Gehalt, Zusage, Fenster, Verlängerung, Gegenforderung und Pflichtentscheidung vollständig | Frist-/Grenzfälle, Wiederholung, Bestätigung und Abbruch | bestanden — [M], [Q3], [Q4] |
| Q-MKT-04 | C | Nachwuchs: Filter, Ablauf, Entschädigung, Gehalt, Kapazität, Übernahme und Entlassung erhalten | Pool leer/voll, Kadergrenze, zu wenig Geld, Bestätigung/Abbruch; echte Buchung einmalig | bestanden — [M], [Q3], [Q4], [N1] |
| Q-COMP-01 | D | Liga/Pokal/Europa inklusive Gruppen/K.-o., Hin-/Rückspiel, Gesamtstand, Verlängerung/Elfmetern, Nichtqualifikation | Feld-/Ergebnisvergleich mit Controller; 6 Länder und Saisonwahl | bestanden — [D], [N2], [Q1], [Q2] |
| Q-COMP-02 | D | Kalender, Archiv und alle bestehenden Bestenlisten vollständig mit Filtern, Leerzuständen und Spielerlinks | Tore/Vorlagen/Zu-null/Fouls/Elfmeter, historische Saison, Rückweg | bestanden — [D], [N2], [Q1], [Q2] |
| Q-COMP-03 | D | Spielbericht vollständig: Tore/Eigentore/Vorlagen, Teams, Aufstellungen, Noten, Einzelstatistiken, Awards | Native Berichtsdaten vs gerenderte Desktop-/Mobilfelder; keine Matchdarstellung verlangt | bestanden — [D], [Q3], [Q4], [Q1], [Q2] |
| Q-CLUB-01 | E | Vereins-/Trainer-/Managerprofile mit Identität, Ruf, Stationen, Kader/letzter Elf und allen Trikots erreichbar | Eigene/fremde Profile, Heim/Auswärts/beide Torwarttrikots, Rückwege | bestanden — [E], [N2], [Q1], [Q2] |
| Q-CLUB-02 | E | Finanzen samt sicherer/möglicher Prognose, Salden, Kategorien, Zahlungstagen und Sanierung erhalten | Ledgerabgleich, regulärer/knapper/negativer Zustand, reine Darstellung unverändert | bestanden — [Q1], [Q2], [N1] |
| Q-CLUB-03 | E | Chronik/Awards/Titel und ewige Top 10 Tore/Einsätze berücksichtigen ehemalige Spieler, Gleichstände, <10 und Lücken | Vergleich vorhandener kumulierter Vereinswerte; keine erfundenen Altwerte | bestanden — [E], [Q1], [Q2] |
| Q-SET-01 | F | Hilfe/3D-Hilfe, Rechtliches, Speicherhinweise, Karriereverwaltung, Sprache und Darstellung erreichbar | Start-/Karriere-/Matchrückwege, Dialog schließen, DE/EN | bestanden — [Q1], [Q2], [S] |
| Q-SAVE-01 | F/I00 | Bestehendes Speichern/Laden/Import/Export funktioniert aus neuer Navigation; Bestätigungen und Abbruch erhalten | Isolierte Karriere anlegen, exportieren, importieren, laden, vergleichen; keine echten Nutzerdaten | bestanden — [S], [Q1], [Q2], [N1] |
| Q-SAVE-02 | F/I00 | Ungültiger Import, fehlgeschlagener Schreibzugriff und volle Slots liefern brauchbaren Fehler ohne falschen Erfolg/Datenverlust | Kontrollierte Fehler-Injektion im Testprofil, Wiederholung, gespeicherte Karriere vor/nach | bestanden — [S], [Q3], [Q4], [N1] |
| Q-PHASE-01 | I00/A/C/E | Frühe echte Kette Rahmen→Leitaktion→Controller→Speichern→Neuladen besteht vor breiter Anbindung | Nutzeraktion im DOM, Aktions-/Ledgernachweis und Fortsetzungszustand; keine reine Fixtureaktion | bestanden — [Q1], [Q2] |
| Q-PHASE-02 | A/C/E | Sponsorwahl→Finanzabschluss/Jugendbudget→Transferphase mit realen Sperren und Pflichtentscheidungen | Leere Auswahl gesperrt, Auswahl/Abbruch, normale Fortsetzung; keine Dummybeträge | bestanden — [Q1], [Q2], [Q3], [Q4], [M] |
| Q-PHASE-03 | I00/alle | Vollständige echte Saisonfolge/Abschluss mit Sportbilanz, Awards, Karriereenden, Manager-/Vereinsentscheidung und neuer Saison | Native Karriere, DOM-Fortschritt an jeder betroffenen UI-Grenze; Einmaligkeit von Ergebnis und Buchungen | bestanden — [Q1], [Q2], [Q3], [Q4], [N2] |
| Q-PHASE-04 | I00/A/C/E | Doppelklick, erneuter Aufruf, Route zurück und wiederholter Saisonabschluss buchen weder Ergebnis noch Geld doppelt | Ereignis-/Buchungs-IDs, Salden und Saison vor/nach; Wiederholung nach Reload | bestanden — [Q1], [Q2], [M], [S], [N1] |
| Q-PHASE-05 | I00/A/C/E | Unterbrochene Speicherung/Buchungsbestätigung ermöglicht konsistente Fortsetzung ohne Doppelzahlung oder übersprungene Pflichtwahl | Gezielt unterbrechen, Fehlermeldung, Reload/Retry an bestätigtem Speicherpunkt; Controllerregel als Soll | bestanden — [S], [N1] |
| Q-BUILD-01 | I00 | Offline-Build enthält geprüfte Module, Labels, CSS und Assets desselben Standes; gleicher Funktionsumfang und unveränderte lokale Version | Buildhash, eingebettete Quellgleichheit, alle lokalen Fälle getrennt auf build | bestanden — [B], [Q1], [Q2] |

## Reale Geräte und assistive Technik — getrennt offen

Diese Nachweise dürfen nicht aus Chromium-Viewport- oder Media-Emulation abgeleitet werden. Fehlende Hardware blockiert die übrigen lokalen Prüfungen nicht, bedeutet aber keine vollständige Gerätefreigabe.

| ID | Gerät / Zugang | Prüffall | Status / Grund |
| --- | --- | --- | --- |
| H-01 | Reales Pixel 9a, Chrome und Testkarriere | Hoch-/Querformat, Browserleisten, tatsächliche Tippflächen, Navigation, Tooltip-Tipp/Scroll, dauerhaft sichtbare Fähigkeiten | offen — physisches Gerät und Bedienzugang noch nicht nachgewiesen |
| H-02 | Reales Pixel 9 Pro XL, Chrome und Testkarriere | Wie H-01, große Gerätefläche, Displayränder, mehrere aktuelle Titel und lange Namen | offen — physisches Gerät und Bedienzugang noch nicht nachgewiesen |
| H-03 | Beide Pixel-Geräte mit Bildschirmtastatur | Suche/Eingabe, sichtbarer Fokus, letzte Listenzeile und Fortschrittsaktion trotz Tastatur erreichbar | offen — Bildschirmtastaturtest auf realer Hardware fehlt |
| H-04 | TalkBack auf realem Android; verwendete Version protokollieren | Vollständiger Menü-/Profil-/Pflichtaktionsweg, Tooltipankündigung, qualitative Farbnamen, keine privaten Fähigkeitsdaten | offen — aktive Screenreaderbedienung und Gerät fehlen |
| H-05 | Desktop-Screenreader, z. B. NVDA mit tatsächlicher Browserkombination | Landmarken, Fokus nach Navigation, Tabellen-/Kartenbeschriftungen, Dialoge, Speicherfehler, DE/EN | offen — aktiver Screenreader-Prüfzugang nicht bestätigt |
| H-06 | Safari auf realem unterstütztem Apple-Gerät, falls für Freigabe gefordert | Responsivität, Navigation, Speichern/Laden, Medienpräferenz und Tooltip-/Fokusverhalten | offen — Zielgerät/-version und Zugriff nicht vorhanden; keine Safari-Aussage aus Chromium |

## Spätere Plattformintegration

Accounts/Cloud, Kauf/Werbung, Engine-/Storeanbindung und öffentliche Releasegates sind nicht Gegenstand dieser lokalen U01-Abnahme. Auch neue Spieler-/Taktikregeln und P05 sind keine Vorbedingung; die bestehenden Wege bleiben Q-INV-02-pflichtig. Für eine später ausdrücklich beauftragte Veröffentlichung gelten die dann einschlägigen Gates und der gleiche erhöhte Versionsstand in Quelle, Build und Live-Seite.

## Schlussergebnis

Die abschließenden, getrennten **Quell- und Offline-Läufe bestanden jeweils 238 Assertions**, darunter je 216 Routen-/Breiten-/Sprach-/Farbfälle. Breiten: 320, 390, 768, 1280, 1440 sowie 844 × 390 im kurzen Querformat; neun Routen, DE/EN, Hell/Dunkel. Quellhashes waren während beider Läufe stabil und wurden bei der Konsolidierung erneut mit dem aktuellen Stand verglichen. Alle 18 neuen Offline-Assets sind bytegleich eingebettet, beide Offlinekopien und die bestehende lokale Version stimmen überein. [Konsolidiertes Manifest](../../outputs/ui-redesign/Q01/final/manifest.json).

Die unabhängigen Aktionsprüfungen belegen echte Sponsor-/Budgetbuchung genau einmal, Speichern/Neuladen, Kader-/Jugendprofile einschließlich englischer Farbnamen und effektiver Form bei Frische 20, Tooltipbedienung, Browser-Zurück aus Profilen, erhaltene Filter, rekursive Projektions-Allowlist, keine Rohobjektreferenzen oder RNG-Aufrufe, fehlende Einwechselwerte und deduplizierte Vereinsrekorde. Die native Saisonvorbereitung simuliert Partien als gekennzeichnetes Testsetup; **alle vier Rückblickseiten**, Saisonstart, Sponsor, Finanzabschluss und neues Jugendbudget werden im DOM bedient. Der normale Testlauf erzeugt keine Stellenangebote und verwendet deshalb die bestehende automatische Verbleibregel. Eine getrennte, ausdrücklich kontrollierte Interimstrainer-Fixture prüft die zwingende Managerwahl durch einen echten DOM-Klick und anschließendes Neuladen.

Q3/Q4 ergänzen unabhängig echte Nachwuchsübernahme/Entlassung mit Abbruch/Bestätigung, Vertragsverlängerung, Fehler/Retry im Einstellungsweg und Kalenderbericht → Spielerprofil → Rückweg bei unverändertem Karrieredatensatz. M prüft darüber hinaus echte Gegenforderungen, erschöpftes und neu geöffnetes Vertragsfenster, unzureichendes Budget und Persistenz. S provoziert einen **wirklichen IndexedDB-Schreibfehler**: bestätigter Altstand bleibt erhalten, Warnung/Retry sind sichtbar, Rettungskopie enthält den ungesicherten Zustand, erfolgreicher Wiederholungsversuch bucht nicht doppelt; echter Dateiexport/-import, ungültiger Import ohne Datenverlust und Neuladen sind enthalten. N1/N2 umfassen 13 native Suiten: Navigation, lokaler Start, Übersetzung, Speicherverwaltung/-wiederherstellung, Finanzabschluss/Zahlungen, Nachwuchs, Transfers, zehn Wettbewerbssaisons, Awards, Trainer und Trikots.

Die ergänzenden Paketbelege D/E und die Präsentations-/Projektionsbelege P/O bleiben ihrer Herkunft nach kenntlich; sie sind kein Ersatz für unabhängige Integrationsläufe. P verwendet die echten geladenen Rahmenmodule mit bereinigten Randdaten für 96 Titel-/Namens-/Farb-/Breitenfälle, 44-Pixel-Bedienziele, 16-Pixel-Eingaben, reduzierte Bewegung und acht Kontrastpaare ≥ 4,5. O prüft native Ranggrenzen, erreichte/bezahlte Sponsorziele und die letzten fünf Ligaspiele beider Seiten; Pokalspiele werden nicht eingemischt. Frühere Fachbelege vor der abschließenden CSS-Korrektur gelten nur für unveränderte Fachpfade: Der betroffene Speicherfehlerzustand wurde danach durch S und der vollständige normale Rahmen durch Q1/Q2 erneut geprüft.

Behobene Befunde: mobile Schnellnavigation zeigte zunächst Matchplan statt Transfers; importierte Übersetzungsobjekte erzeugten englische Fähigkeitslabels mit „[object object]“; Profilrückwege konnten Details über Einstellungen stehen lassen; native Formtexte widersprachen bei Müdigkeit der effektiven Form; der Rahmen verdeckte bei Speicherfehlern die bestehende Warnung; Footer- und Fehlerheaderfarben benötigten abschließend lesbare Kontraste. Die Gegenproben sind grün. Historische Fehl-/Zwischenläufe bleiben unverändert erhalten. Ihre Testerwartungsfehler (Nullbudget ohne Buchung, unsichtbar statt entfernter Tooltip, mehrdeutiger Profilselektor, falscher Youth-Lookup) gelten nicht als offene Produktbefunde.

**Offen:** Q-LAY-02, echter Browserzoom 200 Prozent. Es wurde kein deviceScaleFactor oder CSS-Zoom als Ersatz anerkannt. H-01 bis H-06 bleiben ebenfalls offen: reale Pixelgeräte, Bildschirmtastatur, tatsächliche Screenreader und Safari. Damit ist keine vollständige Geräte-/Accessibility-Freigabe oder uneingeschränkte Gesamtabnahme behauptet. Keine Veröffentlichung und keine Versionserhöhung.

## Inventarzuordnung der Schlussprüfung

Alle 28 Erhaltungszeilen haben integrierte Ziele. Die Fachansichten dekorieren erhaltene native DOM-/Controllerwege; neue Projektionen schließen dokumentierte Datenlücken, ohne neue Fachautorität. Aufstellung und Match bleiben bewusst bestehende Ziele. Diese Zuordnung ergänzt die weiterhin von I00 gepflegte [Inventarmatrix](inventory.md).

| Inventar-IDs | Integriertes Ziel und Nachweis |
| --- | --- |
| 001–002 | Rahmen/Leitaktion; Q1/Q2, P, Saison-/Speicherprüfungen S |
| 003–006 | Übersicht/Gegner/Wettbewerbe/Nachrichten; Q1/Q2, O, D, N2 |
| 007–011 | Kader und vollständige Profil-/Karrieredialoge; Q1/Q2, D/E, N2 |
| 012–016 | Verträge/Nachwuchs/Suche/Listen/Verhandlungen/Bilanz; Q1/Q2, Q3/Q4, M, N1 |
| 017–019 | Wettbewerbe/Länder/Saisons/Archiv/Kalender/Bestenlisten; Q1/Q2, D, N2 |
| 020–021 | Verein/Trikots/Chronik/Finanzen; Q1/Q2, E, N1/N2 |
| 022–023 | Jahresabschluss/Sponsor; Q1/Q2, O, S, N1 |
| 024–025 | Manager/Fremdprofile/letzte Elf/Rückblick/neue Saison; Q1/Q2, Q3/Q4, E, N2 |
| 026 | Einstellungen/Hilfe/3D-Hilfe/Sprache/Karrieren/Recht; Q1/Q2, S, N1 |
| 027 | Erhaltener Matchplan-/Matchanschluss, kein neuer Matchentwurf; Q1/Q2 Routenprüfung, native Navigation N1 |
| 028 | Berichtdatendialog mit Profilrückweg, gespeicherten Werten und ehrlichen Messlücken; Q3/Q4, D, N2 |

## Rohbelege

- [Q1](../../outputs/ui-redesign/Q01/2026-10-07T21-44-53-678Z/source/results.json)
- [Q2](../../outputs/ui-redesign/Q01/2026-10-07T21-45-15-219Z/build/results.json)
- [Q3](../../outputs/ui-redesign/Q01/2026-10-07T21-35-44-977Z/source/results.json)
- [Q4](../../outputs/ui-redesign/Q01/2026-10-07T21-35-54-976Z/build/results.json)
- [N1](../../outputs/ui-redesign/Q01/2026-10-07T21-34-22-190Z/regression/results.json)
- [N2](../../outputs/ui-redesign/Q01/2026-10-07T21-40-36-911Z/regression/results.json)
- [S](../../outputs/ui-redesign/I00-save-check/2026-10-07T21-44-41-783Z/checks.json)
- [M](../../outputs/ui-redesign/I00-market-check/2026-10-07T21-34-20-109Z/checks.json)
- [P](../../outputs/ui-redesign/I00/presentation-2026-10-07T21-34-06-435Z/checks.json)
- [O](../../outputs/ui-redesign/I00/overview-data-2026-10-07T21-35-50-980Z/checks.json)
- [B](../../outputs/ui-redesign/I00/build-2026-10-07T21-44-22-364Z/manifest.json)
- [D](../../outputs/ui-redesign/U01-D/source-2026-10-07T21-26-49-579Z/checks.json)
- [E](../../outputs/ui-redesign/U01-E/source-2026-10-07T21-23-13-585Z/checks.json)

[Q1]: ../../outputs/ui-redesign/Q01/2026-10-07T21-44-53-678Z/source/results.json
[Q2]: ../../outputs/ui-redesign/Q01/2026-10-07T21-45-15-219Z/build/results.json
[Q3]: ../../outputs/ui-redesign/Q01/2026-10-07T21-35-44-977Z/source/results.json
[Q4]: ../../outputs/ui-redesign/Q01/2026-10-07T21-35-54-976Z/build/results.json
[N1]: ../../outputs/ui-redesign/Q01/2026-10-07T21-34-22-190Z/regression/results.json
[N2]: ../../outputs/ui-redesign/Q01/2026-10-07T21-40-36-911Z/regression/results.json
[S]: ../../outputs/ui-redesign/I00-save-check/2026-10-07T21-44-41-783Z/checks.json
[M]: ../../outputs/ui-redesign/I00-market-check/2026-10-07T21-34-20-109Z/checks.json
[P]: ../../outputs/ui-redesign/I00/presentation-2026-10-07T21-34-06-435Z/checks.json
[O]: ../../outputs/ui-redesign/I00/overview-data-2026-10-07T21-35-50-980Z/checks.json
[B]: ../../outputs/ui-redesign/I00/build-2026-10-07T21-44-22-364Z/manifest.json
[D]: ../../outputs/ui-redesign/U01-D/source-2026-10-07T21-26-49-579Z/checks.json
[E]: ../../outputs/ui-redesign/U01-E/source-2026-10-07T21-23-13-585Z/checks.json
