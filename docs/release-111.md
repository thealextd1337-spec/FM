# Release 111: Flutlicht und Unity-Fußball

Vorbereiteter Veröffentlichungsstand vom 8. Oktober 2026. Der vorherige vollständig geprüfte lokale Stand ist im Git-Commit `abc340c62caea8850e30653ed6e515d2a8d69d3c` gesichert. Die [v159-Abnahme](platform/football-experience-v159.md) bleibt ein historischer Nachweis dieses Standes; Release 111 ergänzt Versionsanzeige, Systemdokumentation und die vollständige Live-Auslieferung.

Flutlicht umfasst Start-/Vereinserstellung, Vereinswelt-Menüs, Untermenüs, Matchplan, taktische Ansichten und Spielberichte. Neue physische Partien erhalten den offensiven Ablauf mit freien Stürmerwegen, erreichbarer Ballannahme, Anschlussläufen, ballbezogener Verteidigung und tatsächlichen Schusszielen. Unity ergänzt Ballrotation, flüssigere Bewegungsübergänge, verfolgte Namensschilder sowie fünf Kameras mit Nähe-Regler.

Die Veröffentlichung lädt die vier geprüften WebGL-Dateien, iframe und Manifest unter `unity/` und `unity-match/` hoch. Alle öffentlichen Dateien werden per SHA-256 geprüft, bevor die neue HTML-Seite veröffentlicht wird. Der HTTP-Build aktiviert Unity; die lokale Datei-Brücke und der 2D-Rückweg bleiben erhalten. Keine Änderung oder Neuberechnung bestehender Ergebnisse. P01–P06-Kandidaten behalten ihre ausdrückliche Aktivierung; die Veröffentlichung macht daraus keine nachträgliche Spielstandmigration.

Lokale Veröffentlichungsvorprüfung: alle 78 Befehle des Produktionsworkflows bestanden, einschließlich Mehrjahres-Wirtschaftsläufen und zehn FTPS-/Unity-Uploadtests. 26 Flutlicht-Assets sind exakt eingebettet; beide Offline-Dateien stimmen überein. [Vorprüfung](../outputs/release-111/preflight.json).

Der fertige HTTP-Build mit tatsächlichen Produktionspfaden besteht zwölf Browserprüfungen: Unity wird standardmäßig geladen, die echten Spieler sind vorhanden, die vergrößerte Halbzeit und zweite Hälfte behalten Unity, Namen folgen echten Spieleridentitäten und der native Bericht trägt Flutlicht. Eine vollständige reguläre Partie endet in beiden Renderern identisch 1:0; Ereignisse, Spielerberichte und Finanzen stimmen exakt überein. Keine Browser-Skriptfehler. [Browsernachweis](../outputs/release-111/local-production-layout.json).

Build-SHA-256: `74e13d67e82d6d8cd486907aea7f44a5cf64bc50a6afdcc79eae96842a0e8b57`. Unity-Quellkennung: `95eb4c7224a55115dd2e2aa4dccb3f9e27f5096bdde0ee23073c5cfbb3076f3e`. Der HTML-Upload erfolgt zunächst unter einem hashgebundenen Dateinamen und wird erst nach vollständiger Übertragung auf `index.html` umbenannt.

Workflow- und Live-Nachweise werden nach der tatsächlichen Veröffentlichung ergänzt. Die in v159 dokumentierten Grenzen für Torquote, Kontakte und physische Mobilhardware bleiben bestehen.
