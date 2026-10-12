# Release130: abschließende Live-Abnahme

Status: **pass**. Ausschließlich Worktree release-130, Node v24.19.0.

CI: https://github.com/thealextd1337-spec/FM/actions/runs/38316574115; Head `1063ed6f96d507bfa14b0b8a8cfd764646771bb6`; Status `completed`, Conclusion `success`. Keine eigene Veröffentlichung oder automatische Wiederholung.

Runstatus erhoben 2026-10-12T22:51:14.315Z; Job-/Stepstatus erhoben 2026-10-12T22:51:14.315Z. Nur der eigene lesende Poller wurde am konservativen Wartezeitlimit beendet; die frühere erste REST-Abfrage lag vor dem gespeicherten Pollerstart. CI wurde nicht abgebrochen oder verändert.

Job deploy: completed/success; aktive Schritte: keine. Relevante Schritte: Spieltests ausführen: completed/success; Einzeldatei bauen: completed/success; Unity-Laufzeit vor der neuen Spielseite hochladen und prüfen: completed/success; Per FTPS zu World4You hochladen und Live-Datei prüfen: completed/success.

Live-Seite: https://fussball.cakamper.at/. Footer: Doppel 6 / PROTOTYP 130.

HTML: `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db`. Unity-Quelle: `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82`. Manifest: `3262df2786a265c40c9fefb8bd748206120e229bb268d71c954d5fb9da7315a0`.

- pass: CIExactHead
- pass: CISuccess
- pass: publicEightFiles
- pass: livePackage
- pass: mobileRosterBoth
- pass: fullGenuineMatches
- pass: allCareersValidateStrictly
- pass: fullDigestPartsIdentical
- pass: fullSavedCareersAndP02Reloaded
- pass: inputArtifactsStable

Alle acht öffentlichen Dateien wurden vollständig, einschließlich Größe und SHA256, gegen package.json gelesen. .htaccess wurde nicht abgerufen. Einzelwerte stehen in handoff.json und ../live-files.json.

2D: 3037 native Schritte, 98 Minuten, Ergebnis 0:0, strikter Karrierevalidator true, Digest `a6d98d83`, vollständige DigestParts-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`. QA-Matchausführung 6293 ms; Gesamtprüfung einschließlich Laden/Neuladen 23176 ms. Vollständige eigene DigestParts liegen als JSON bei.

Unity: 3037 native Schritte, 98 Minuten, Ergebnis 0:0, strikter Karrierevalidator true, Digest `a6d98d83`, vollständige DigestParts-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`. QA-Matchausführung 7754 ms; Gesamtprüfung einschließlich Laden/Neuladen 27692 ms. Vollständige eigene DigestParts liegen als JSON bei.

Paket: 12 Checks; 192 Vereine / 12 Länder, 11 Profis / 2 Keeper / Vertragsrollen 6/3/2, zwölf echte Unity-ACK-Akteure, Keeper180/Pace119, Parent-/Child-Pause und deaktivierter 2D-Timerfallback.

Mobil: beide echten 13er-Taktikansichten 390×844, Außenspieler→Bank→Feld mit nativen Auswahl- und Speichercontrollern; vollständige gespeicherte Karriere nach Neuladen exakt identisch einschließlich P02.

- No publication/retry/upload was performed by this test agent.
- Own blank isolated Chrome/Edge profiles; no user saves or tabs accessed.
- Complete native games are fixed .05-second steps using unchanged current QA160 helper and identical fixture/seed/call sequence; wall times are QA execution times, not human real-time game-duration/FPS measurements.
- Unity picture/render counters prove rendering progress, not GPU FPS or physical Android acceptance.
- BFCache was genuinely proved locally in final-browser; not redundantly repeated on live.
- 15 contact windows, five historical diagnostic gates, direct-free-kick preparation, situational pace choice, defender pursuit, Pixel hardware and 4–6 minute / 10–16 total-shot goals remain open in Bugliste.

Belege und Prüflader sind in handoff.json per SHA256 gebunden. Root übernimmt ausschließlich bei bestandenen Nachweisen die Release-Metadaten.
