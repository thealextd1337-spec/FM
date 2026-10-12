# Flutlicht – lokale Integration

**Kaderrollen 12. Oktober 2026:** I00 ergänzt seriell native Vertrags-/Zusageanzeigen, Profikaderrolle, Positionsreserve und Spielzeit-Handlungsbedarf. Die vorhandenen Änderungen der Fachpakete bleiben erhalten. UI-Vertrag v1.4 ergänzt ausschließlich sichtbare Vertragsrolle und qualitativen Spielzeitstatus. Quell-/Buildprüfweg: `work/check-squad-planning-v179.cjs`; [Fachvertrag einschließlich Stärkezusammensetzung](../kadermechanik-und-matchagenda.md). Lokale Umsetzung, Veröffentlichung separat.

**Modernisierung 12. Oktober 2026:** Auf Nutzerauftrag sind die acht Astra-Vorschläge lokal integriert. U01-B lieferte Kader/Profile, U01-C Markt/Verträge und U01-D responsive Tabellen in getrennten Fachslots. Nach Übergabe liegen diese Dateien wieder bei I00. I00 übernimmt Übersicht/Büro, native Einstiegsaktionen, gemeinsame Typografie, Übersetzungen, UI-Vertrag v1.3 und Quellen-/Buildprüfung. Q01 hat die relevanten Diffs unabhängig geprüft; der gefundene Fokusverlust durch erneutes Verschieben und Ersetzen ist behoben und im gemeinsamen Browserlauf geprüft. Veröffentlichung bleibt separat.

Nachweise: `outputs/ui-modernization/source/checks.json` und `outputs/ui-modernization/build/checks.json`, Paketbelege unter U01-B/C/D sowie der native Speicher-/Importprüfweg unter I00-save-check. Die gemeinsame Prüfung umfasst tatsächliche Büro-Vertragsnavigation, mögliche/bestätigte Abschiede, Sortierung, Filter, Rücknavigation, DE/EN, Hell/Dunkel, Mobil/Desktop und unveränderte Karriere bei Darstellung/Neuladen. Physische Geräte und vollständiger Screenreaderlauf bleiben separate Prüfungen.

**Nachprüfung 8. Oktober 2026:** Nutzerfeedback zu Sponsorfläche, Angebotsdialog, Übersichtskennzahlen/Vereinsbüro/Finanzen, Vereinsregisterkarten und Ladeanzeige sowie der Rundgang durch alle Menüs einschließlich Start/Erstellung sind lokal umgesetzt und geprüft. [Aktueller Umfang und Abschlussbelege](feedback-2026-10-08.md) ersetzen die untenstehende Einschätzung des ersten Integrationsstands. P05 bleibt geplant; die drei später vorgesehenen Besichtigungspunkte bleiben offen.

Start: 7. Oktober 2026, ausdrücklicher Nutzerauftrag zur Umsetzung mit GPT-6 Astra und Denkaufwand hoch. Der Auftrag umfasst das lokale Redesign einschließlich Integration, Korrekturen, Prüfungen und Offline-Build. Veröffentlichung und andere Ausbaupakete sind nicht gestartet.

I00 besitzt Adapter, Registrierung, gemeinsame Prüfbasis, Loader/Server/Build und gemeinsame Dokumentation. Die drei Fachslots wurden zunächst mit Inventar/Rahmen/Q01, anschließend mit getrennten Ansichtsaufträgen belegt. Alle Fachagenten verwendeten GPT-6 Astra/high. Nach den Übergaben liegen sämtliche Produktdateien bei I00; Q01 bleibt für die unabhängige Prüfzusammenführung verantwortlich. Bereits vorhandene Änderungen blieben erhalten.

| Paket | Status | Nächster Schritt |
| --- | --- | --- |
| I00 | lokal umgesetzt | Alle Bereiche und Offline-Build; finale Quelle/Build-Läufe je 238 Prüfgruppen bestanden |
| U01-I | übergeben | 28 Inventarzeilen vollständig; Datei jetzt I00 |
| U01-R | integriert | 16 Fixturefälle bestanden; vier Rahmendateien jetzt I00 |
| U01-A | integriert | Fixture und echte Sponsor-/Budgetaktion geprüft; Dateien I00 |
| U01-B | integriert | Kader/Profile, Filter/Sortierung/Sprachrefresh und Spielstandreinheit geprüft; Dateien I00 |
| U01-C | integriert | Transfers/Nachwuchs; Fixture geprüft, integrierte Transaktionen bei Q01; Dateien I00 |
| U01-D | integriert | Tabellen, native Filter, gespeicherte/archivierte Berichte und Profilrückwege geprüft |
| U01-E | integriert | Vereinsrekorde, ehemalige Spieler/Gleichstände/alte Aufstellungen und Trikotwege geprüft; Dateien I00 |
| U01-F | integriert | Einstellungen, Help-/Rechtscontroller und Karriereverwaltung; Dateien I00 |
| Q01 | Schlussprüfung dokumentiert | 43 von 44 lokalen Katalogbedingungen bestanden; echter 200-Prozent-Browserzoom offen |

Die lokale Quelle ist der vorhandene, uncommittierte Stand. Quellhashes und spätere Laufbelege liegen unter `outputs/ui-redesign/`; Nachweise gelten nur für ihren tatsächlich geprüften Stand.

Die eingefrorene [Quelle](../../outputs/ui-redesign/Q01/2026-10-07T21-44-53-678Z/source/results.json) und der [Offline-Build](../../outputs/ui-redesign/Q01/2026-10-07T21-45-15-219Z/build/results.json) bestanden jeweils 238 automatisierte Prüfungen, darunter 216 Layoutfälle. Beide Läufe enthalten keine Laufzeitfehler oder Änderungen der geprüften Dateien. [Speicherfehler, Wiederholung, Rettungsexport und Import](../../outputs/ui-redesign/I00-save-check/2026-10-07T21-44-41-783Z/checks.json) wurden zusätzlich an beiden Zielen geprüft. Die [Buildprüfung](../../outputs/ui-redesign/I00/build-2026-10-07T21-44-22-364Z/manifest.json) bestätigt die eingebundenen UI-Dateien und identischen Offline-Kopien.

Die [Abnahme](acceptance.md) und das [Schlussmanifest](../../outputs/ui-redesign/Q01/final/manifest.json) ordnen sämtliche 28 Inventarzeilen zu. Echter Browserzoom bei 200 Prozent sowie die getrennten Prüfungen auf realen Geräten und mit Screenreadern bleiben offen; die vollständige Abnahme ist deshalb noch nicht erteilt. Die damalige Prüfung meldete keine offenen Produktfehler; die spätere Nutzerbesichtigung zeigte zusätzliche Lücken, deren Korrektur im oben verlinkten Bericht vom 8. Oktober dokumentiert ist. Es erfolgten weder Veröffentlichung noch Versionsanhebung; der lokale Stand bleibt PROTOTYP 110.

Am 8. Oktober 2026 ausdrücklich für später vorgemerkt: echter 200-%-Browserzoom, Smartphone-/Screenreaderprüfung einschließlich Tastatur und Dialogen sowie gemeinsame visuelle Besichtigung von Lesbarkeit, Abständen und Bedienung. Diese drei Punkte blockieren die beauftragte lokale Welle-0/1-Enginevergleichsdemo nicht.

Technischer Ansatz: Einbindung nach der letzten geladenen `v61RenderCareer`-Hülle (`world-kits-ui-v81.js`). Bestehende Ansichts-DOM-Knoten und delegierte Aktionsattribute bleiben erhalten. Aktive Partien bleiben im bisherigen Renderer. Neue Teilansichten gestalten vorhandene Inhalte und ergänzen ausschließlich bereinigte Projektionen; Spielzustand und Speicherung bleiben bei bestehenden Controllern.
