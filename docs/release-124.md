# Release 124 – zuverlässiger Speicherstart

11. Oktober 2026. Nutzerauftrag zur Veröffentlichung der Wappen-/Sponsoränderungen.

Enthält Release 123: 96 individuelle neue Vereinswappen, 36 Sponsoren mit Wortmarken und Symbolen, eingebettete Zurücknavigation sowie vollständige Bonusziele/Beträge in der Sponsorwahl. Der abschließende Live-Neuladetest fand ein Startzeitproblem: IndexedDB konnte gültige Expansionswelten prüfen, bevor deren Validatoren installiert waren. Derselbe gespeicherte Spielstand ist nach dem Modulaufbau gültig.

`v61StartStorage` beginnt das Lesen erst nach `DOMContentLoaded`, wenn der Parser noch läuft; bei bereits geladener Seite startet es unmittelbar. Kein Timer, keine erneute Berechnung, keine Spielstandmigration. Die vorhandenen Lese-, Validierungs- und Schreibregeln bleiben erhalten.

## Prüfung und Veröffentlichung

Eine gezielte Regression prüft mit echter gespeicherter Expansionswelt, dass vor Installation der Validatoren kein IndexedDB-Zugriff erfolgt und danach dieselben Daten gültig geladen werden. Bestehende Speicher-, Wappen- und Sponsorprüfungen bestehen. Der erste Korrekturkandidat wurde vor dem Upload gestoppt, da sein tatsächlicher Startaufruf noch nicht umgestellt war; Regression und echter Offline-Neuladetest prüfen den endgültigen Aufruf.

[Produktionslauf 38143576879](https://github.com/thealextd1337-spec/FM/actions/runs/38143576879) für Commit `22e117857df71beb477b845205c2a009e8e683fa` erfolgreich: 109 Produktionskommandos, Build, Logo-Prüfungen sowie öffentlich geprüfte Laufzeit und HTML-Upload. Quellseite, Kopfzeile, Hilfedaten, beide Builddateien und Live-Seite zeigen 124. HTML-SHA-256 `6ff813fffc343bfebd41b156751d5777a0a27341bdea69f417e26c6072e0c405` stimmt live bytegenau überein. Alle 648 neuen PNGs sind offline eingebettet.

Live-Abnahme bei 390/1440 Pixeln in Deutsch/Englisch: regulärer Karriereablauf, drei Sponsorangebote mit sechs vollständigen Bonuszielen und Beträgen, kein Überlauf, unveränderte Angebote durch Sprachwechsel. 264 verwendete Wappenbilder/Konturen und Sponsorvarianten dekodieren ohne Fehler. Auswahlklick bucht genau das gewählte Fixum (550 Credits) und wechselt zum Jugendbudget. Bereits unter 123 gespeicherte Welt und neue 124-Welt laden nach echter Navigation gültig und mit identischem serialisiertem SHA-256/Kontostand. Keine Browserfehler oder fehlenden Netzdateien in der abschließenden Sitzung. Keine physische Geräte- oder neue Matchleistungsprüfung aus diesen UI-Belegen ableiten.

[Deployment](../outputs/release-124/deployment.json), [Dateigleichheit](../outputs/release-124/live-hashes.json), [Live-Browser und unveränderte Spielstände](../outputs/release-124/live-browser.json).
