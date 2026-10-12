# Lokale Demos: Nighttime und Klares Low-Poly

Nutzerauftrag vom 13. Oktober 2026: Nighttime zuerst, Klares Low-Poly danach. Qualität hat Vorrang vor dem Richtwert morgen gegen 10:00 Uhr. Claude-Kontingente sind keine garantierten Arbeitszeiten. Keine Veröffentlichung der Demos beauftragt.

## Gemeinsame Basis

Release 130, Produktcommit `1063ed6f96d507bfa14b0b8a8cfd764646771bb6`, Unity-Quellkennung `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82`. Die Live-Dateiprüfung vom 12. Oktober 2026, 22:57 UTC bestätigt HTML `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db` und Unity-Manifest `3262df2786a265c40c9fefb8bd748206120e229bb268d71c954d5fb9da7315a0`. Alte Root-Dokumente und R20-Berichte ersetzen diese Basis nicht.

Die isolierten Branches beginnen am Produktcommit. Lokale Testausgaben des Release-Worktrees werden nicht als Änderungen übernommen. Originalassets und importierte Unity-Assets werden inventarisiert. Native Regeln, Speicherung, Animationsauswahl, Kontaktphasen, Vereinsfarben und Sponsorzuordnung bleiben erhalten. Die verbindlichen Details stehen in [Kompatibilität](kompatibilitaet.md), [Nighttime](nighttime-opus55.md) und [Klares Low-Poly](klares-low-poly-opus55.md).

## Zuständigkeiten und Parallelität

- Root/Codex: Basissicherung, Planung, getrennte Arbeitsplätze, Git-/Buildbindung, Integration der Sonnet-Werkzeuge, eigene Schlussprüfung und Übergabe. Besitz dieses Plans und der Basisdatei.
- Opus 5.5: Nighttime-Gestaltung und zusammenhängende Licht-/Material-/Shaderarbeit im Checkout `work/demo-nighttime`. Exklusiver Besitzer des eigenen Unity-Projekts `G:/unity/Doppel6-Nighttime-Demo`, des Renderers und der Unity-Builds. Erst bestehende Modelle verwenden; Ersatz nur bei nachgewiesener sichtbarer Lücke. Erhält Rückmeldungen der Prüfer als konkrete Befunde.
- Sonnet 5.5: begrenzte Implementierung von Start-, Paket- und Prüfwerkzeugen im Checkout `work/demo-style-support`; besitzt ausschließlich `work/style-demos/` und `docs/3d-stilauftraege/demo-start-und-pruefung.md`. Keine Runtime-, Shader-, Szenen-, Import- oder Buildsettingsänderungen. Nach Übergabe des Kandidaten folgt ein gesonderter Browser-Abnahmeauftrag.
- Haiku 5.5: lesendes Assetinventar und Auswahl einer überschaubaren Prüfmatrix. Schreibt ausschließlich in den eigens genannten Audit-Ausgabeordner, keine Produktänderungen und kein Editorzugriff. Zuerst Nighttime, anschließend Vorschlag für Low-Poly-Übernahme.
- Fable 5.1: Troubleshooter bei belegtem größeren Blocker, etwa wiederholtem Buildfehler, schwarzem WebGL-Bild, Rig-/Maskenregression oder widersprüchlicher Quellenbindung. Erhält reproduzierbares Beispiel, Logs und bisherige Hypothesen; zuerst Diagnose, dann eng begrenzte Reparatur nach Zuständigkeitsübergabe. Kein vorsorglich laufender vierter Claude-Auftrag.

Alle Agenten wissen, dass andere gleichzeitig arbeiten, und dürfen fremde Änderungen nicht zurücksetzen. Keine verschachtelten Agenten ohne Root-Zuweisung. Opus, Sonnet und Haiku dürfen parallel an ihren getrennten Verantwortungen arbeiten. Unity-Import, Renderaufnahmen, WebGL-Builds und GPU-Leistungsmessungen werden seriell eingeplant; keine Messung mit mehreren aktiven Matches.

## Meilensteine

1. Basis prüfen, committen und die eigene Unity-Kopie auf den veröffentlichten Quellstand abgleichen. Vorherbilder desselben gespeicherten Fixtures aufnehmen. Assetentscheidungen dokumentieren.
2. Nighttime in einem Musterstadion abstimmen; realen WebGL-Build früh erstellen. Ball, helle/dunkle Trikots und Keeper in Spielkamera und Übersicht prüfen, normal und reduced.
3. Einen lokalen Startbefehl und einen hashgebundenen eigenen HTTP-Zugang liefern. Sonnet-Werkzeuge werden durch Root gezielt integriert; keine zweite Matchsimulation. Ein stiller alter Renderer-Fallback darf keinen Test bestehen.
4. Nachweis auf mindestens vier vorhandene Architekturtypen erweitern. Bestehende Clips und prozedurale Posen, beide Richtungen, Kontaktfenster, Pause/Fortsetzen, Rückschau, Neuladen und 2D-Rückfall prüfen. Native Ergebnis-/Ereignisparität gegen identische Ausgangsfixtures sichern.
5. Framezeiten, Draw Calls, Textur-/Meshspeicher und Downloadgröße gegen dieselbe Basis messen. Mobile Querformate lokal prüfen. Physische Android-Abnahme bleibt ein getrennt benannter offener Nachweis.
6. Nighttime als geprüften lokalen Kandidaten übergeben. Danach Low-Poly im eigenen Checkout: zuerst Material-/Facettenvergleich, dann echte kontrollierte Meshvereinfachung am bestehenden Rig und vollständige Masken-/Sohlen-/Kalibrierprüfung. Der Facettenprototyp wird ausdrücklich als Zwischenstand bezeichnet.

## Versionsbindung und Kontingentwechsel

Jeder übergebene Kandidat enthält Git-Branch/Commit, vollständigen Quellhash, Originalasset- und Buildhashes, Änderungsliste, Startbefehl und Prüfprotokoll. Lokale Produktdateien und der Git-Stand müssen dieselbe Version abdecken. Darstellungsquellen, Hilfsskripte und erforderliche Importdateien werden gezielt eingecheckt; Unity-Library, Temp, Logs und Zugangsdaten bleiben außerhalb von Git. Generierte große Builds dürfen als hashgebundene Artefakte liegen, müssen aus dem angegebenen Git-Stand reproduzierbar sein. Kein Push auf main, kein Deployment. Eine etwaige Veröffentlichung braucht einen eigenen Auftrag und Versionsanhebung.

Vor Kontingentende oder längerer Unterbrechung: funktionsfähigen Zwischenstand sichern, eigenen Commit erstellen, Source-/Buildkennung und relevante Logs erfassen und den nächsten konkreten Schritt im Handoff notieren. Es gibt keine wiederholten blinden Quota-Retryschleifen. Ein Deadline-Zwischenstand wird nicht als vollständig abgenommen bezeichnet.

## Geerbte Grenzen

Release 130 dokumentiert historische Kontakt-Ruckler/Diagnosefehler, direkte Freistoßvorbereitung vor bekanntem Ziel sowie offene Live-Verfolgung und Geh-/Traben-/Sprintwahl. Die Stildemos dürfen diese Befunde nicht verstecken oder als neue Stilregression ausgeben. Native Spielzeit-/Schussbalance, neue Regeln, Accounts und freekickdemo gehören nicht zu diesem Auftrag.
