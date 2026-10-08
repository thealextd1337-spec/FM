# Flutlicht – lokale Integration

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
