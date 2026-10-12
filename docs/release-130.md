# Release 130 – 3D-Bewegung und vollständige Kaderauswahl

Quellstand auf dem veröffentlichten Release 129 (`a29556ede15da4d018d1f049192407706242a4f4`). Produktive Bildzeitplanung und Standardbuild sind lokal geprüft; Upload und Live-Nachweis stehen noch aus. Die bestehenden Jugend-, Vertrags-, Wettbewerbs- und Flutlicht-Funktionen von 129 bleiben erhalten.

## Enthaltene Änderungen

- Zusätzliche Vereinsroster-Spieler erscheinen in Matchplan und Spielvorbereitung unter einer schmalen Trennlinie. Die vorhandenen Start-/Bankplätze lassen sich mit Maus, Touch oder Tastatur tauschen; Rollen, Orientierung, Belastungsdaten und Speicherung bleiben an den nativen Controllern. Positionsfarben und Beschriftungen ergänzen die bekannten Fähigkeits-/Rollenfarben. Nach Anpfiff bleibt die Spieltagsauswahl gesperrt; die native Vereinsrostergrenze bleibt 14.
- Keeperjagd 180 verwendet die geprüften künftigen nativen Ground-Pursuit-Regeln. Bestehende gespeicherte Kennungen werden nicht umgerechnet.
- Die 3D-Projektion liest tatsächlich abgeschlossene native Bewegungen bei Wiederanstoßpositionierungen. Alte Restgeschwindigkeit ersetzt dort keine beobachtete Laufrichtung. Ein langsam ausgeführter Pass behält die bereits mit dem realen Ziel übereinstimmende Körperrichtung. Bekannte native Aktionszeit/-dauer werden an Unity übermittelt; die Matchuhr bleibt nativ.
- Claudes eingefrorener R21-Unity-Stand korrigiert die zu hohe Hüfte der Foulpose und den Übergang aus dem Sprint. Ein falsch gebundener T-Pose-Clip war nicht die Ursache. Quelle und WebGL-Payload sind an `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82` gebunden.
- Die bodennahe Kamerakorrektur umfasst auch die breite Ansicht. Die Kamera verändert keine Spielaktionen oder Ergebnisse.
- Eine gemeinsame Bildzeitplanung fängt ausbleibende Browser-Frames ausschließlich in sichtbaren Unity-Ansichten ab. Callbackanforderungen werden bei konkurrierendem Timer-/Browsercallback genau einmal ausgeführt. Ausblenden und Browsernavigation pausieren den Ersatz; Rückkehr erhält die wartenden Anforderungen. Native Matchuhr, Aktionen und Zufallsfolge bleiben maßgeblich.

## Vorliegende lokale Nachweise

Der geprüfte separate 129+R21-Testbuild enthält diese Quellen gemeinsam mit einer ausschließlich lokalen Bildzeitplanung. Seine vollständigen 2D-/Unity-Partien mit je 3037 Schritten haben identische native Zustands-/P02-/RNG-Digests und Nutzdaten. Zwei integrierte mobile Taktikansichten und acht Paketprüfungen bestehen. Die zusätzliche isolierte Kaderprüfung besteht 428 Prüfungen in Quelle und Offline-Build einschließlich echter Maus-/Touchaktionen, Tastaturalternative, Save/JSON und Anpfiffs-/Torwartschutz. 16 Spieler sind lediglich ein ungültiger Anzeige-Stresstest, keine gültige Karriere.

Diese Nachweise beziehen sich auf den lokalen Vorgänger-Testbuild. Sie sind keine Produktions- oder Live-Abnahme des neuen Release-130-Quellbaums. Der [Integrationsnachweis](../outputs/release-130/integration-handoff.json) bindet kopierte Quellen, originale 129-Basishashes, Loader-/Versionsänderungen, 41 Unity-Identitätsdateien und die vier WebGL-Artefakte. Lokale Diagnose-Framepump und Performancepanel wurden nicht übernommen.

## Offene Abnahme und Grenzen

Die lokalen Produktionskommandos, produktive Bildzeitplanung und Standardbuilds bestehen. Eine reine Projektionsprüfung fand zunächst einen fehlenden `step`-Controller; der schmale Guard erhält den realen Beobachtungshook und erlaubt reine View-Leser ohne künstlichen Controller. Anschließende Projektions-, Keeper-/Restart-, Unityadapter- und Vertragsprüfungen bestehen. Ein unabhängiger Review fand keinen verbleibenden Blocker im Guard oder Scheduler. Der anfangs gefundene Browsercache-Queuefehler ist korrigiert und als Lifecycle-Regression geprüft.

Die 41 Identitätsquellen, 32 Manifestquellen, Originalasset und Kontaktkatalog sowie vier WebGL-Dateihashes stimmen mit dem eingefrorenen Unity-Kandidaten überein. Beide Standardbuilds sind bytegleich; HTML-SHA256 `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db`. Quelle, Runtime-Produktmetadaten und Hilfedaten zeigen 130. [Artefaktprüfung](../outputs/release-130/artifact-verification.json).

17 Schedulerprüfungen, 56 native Keeper-/Restartprüfungen und 96 Kaderprüfungen sind dauerhaft im Produktionsworkflow verankert. Alle 119 lokalen Produktionskommandos bestehen, einschließlich der gezielten Wiederholung nach dem schmalen Projektionsguard. Ein isolierter Chrome-Lauf mit der produktiven Zeitplanung erreichte rund 57 FPS in Standardqualität auf diesem PC. Dies ist eine Desktop-Einzelmessung, kein allgemeines Leistungsversprechen.

Das finale HTTP-Paket besteht acht Integrationsprüfungen, beide mobilen 13er-Taktikansichten sowie zwei vollständige 2D-/Unity-Partien mit je 3037 Schritten. Native Zustände, P02 und RNG sind identisch: Digest `a6d98d83`, vollständige Nutzdaten-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`. Alle neun HTTP-Paketdateien sind vor und nach den Läufen hashgleich. Eine tatsächliche Chrome-Navigation und Rückkehr lieferte `pageshow.persisted:true`; Unity-Bilder laufen weiter, während native Pause, Uhr, Ergebnis, Ereignisse und P02 unverändert bleiben. Zehn Lifecycle-Prüfungen bestehen. Der erste Prüflader wartete bei Cache-Rückkehr unzutreffend auf `DOMContentLoaded`; der korrigierte Prüflauf nutzt die tatsächliche Rückkehr und bewahrt den historischen Fehlbericht. [Paketvertrag](../outputs/release-130/final-browser/package-checks.json), [vollständige Matchparität](../outputs/release-130/final-browser/parity.json), [Browserrückkehr](../outputs/release-130/final-browser/lifecycle.json).

Upload, Linux-CI und Live-Dateiidentität werden nach dem tatsächlichen Veröffentlichungsworkflow ergänzt.

15 belegte Kontakt-Ruckler und die historischen R20-Kontaktgrenzen bleiben ausdrücklich offen. Echte Live-Verfolgung, bewusste Geh-/Traben-/Sprintwahl und die direkte Freistoßvorbereitung vor Bekanntwerden des nativen Schussziels bleiben weitere Aufgaben. Es gibt keine neue physische Android-Freigabe oder allgemeine GPU-/Browser-Leistungszusage. 48 Stadionprofile bleiben erhalten; keine Behauptung neuer individueller Modelle für alle Vereine. Ziele von 4–6 Minuten und 10–16 Gesamtschüssen bleiben separate native Abstimmungsaufgaben.

Die [Bugliste](Bugliste.md) führt offene Probleme, nächste Prüfungen und lokale Korrekturen getrennt. Fünf historische Diagnosefehler bleiben berichtet; eine universelle Verbesserung aller Kontaktfenster gegenüber dem veröffentlichten 129 wird nicht behauptet.
