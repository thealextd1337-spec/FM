# Release130: abschließende Live-Abnahme

Status: **in_progress**. Ausschließlich Worktree release-130, Node v24.19.0.

CI: https://github.com/thealextd1337-spec/FM/actions/runs/38316574115; Head `1063ed6f96d507bfa14b0b8a8cfd764646771bb6`; Status `in_progress`, Conclusion `null`. Keine eigene Veröffentlichung oder automatische Wiederholung.

Runstatus erhoben 2026-10-12T22:46:25.353Z; Job-/Stepstatus erhoben 2026-10-12T22:47:09.062Z. Nur der eigene lesende Poller wurde am konservativen Wartezeitlimit beendet; die frühere erste REST-Abfrage lag vor dem gespeicherten Pollerstart. CI wurde nicht abgebrochen oder verändert.

Job deploy: in_progress/null; aktive Schritte: Einzeldatei bauen. Relevante Schritte: Spieltests ausführen: completed/success; Einzeldatei bauen: in_progress/null; Unity-Laufzeit vor der neuen Spielseite hochladen und prüfen: pending/null; Per FTPS zu World4You hochladen und Live-Datei prüfen: pending/null.

Live-Seite: https://fussball.cakamper.at/. Footer: noch nicht live geprüft.

HTML: `nicht geprüft`. Unity-Quelle: `nicht geprüft`. Manifest: `nicht geprüft`.

- pass: CIExactHead
- in_progress: CISuccess
- not_run_pending_ci: publicEightFiles
- not_run_pending_ci: livePackage
- not_run_pending_ci: mobileRosterBoth
- not_run_pending_ci: fullGenuineMatches
- not_run_pending_ci: allCareersValidateStrictly
- not_run_pending_ci: fullDigestPartsIdentical
- not_run_pending_ci: fullSavedCareersAndP02Reloaded
- pass: inputArtifactsStable

**Keine Live-Freigabe.** Die Live-Dateien, Footer, Browserverträge und Live-Partien wurden noch nicht geprüft. Die eigenen Prüflader sind nur vorbereitet. Paket-Sollwerte und vorhandene lokale Belege sind in expectedPackage/inputs-before.json gebunden.

Nach tatsächlichem CI-success: Root-verify-live.cjs, danach die eigenen check-package.cjs, check-roster.cjs und check-parity.cjs seriell mit Node24 aus Release130 ausführen. Anschließend bind-inputs.cjs --after und write-handoff.cjs. Vor einem bestätigten Nachweis keine Release-Metadaten als bestanden markieren.

- No publication/retry/upload was performed by this test agent.
- Own blank isolated Chrome/Edge profiles; no user saves or tabs accessed.
- Complete native games are fixed .05-second steps using unchanged current QA160 helper and identical fixture/seed/call sequence; wall times are QA execution times, not human real-time game-duration/FPS measurements.
- Unity picture/render counters prove rendering progress, not GPU FPS or physical Android acceptance.
- BFCache was genuinely proved locally in final-browser; not redundantly repeated on live.
- 15 contact windows, five historical diagnostic gates, direct-free-kick preparation, situational pace choice, defender pursuit, Pixel hardware and 4–6 minute / 10–16 total-shot goals remain open in Bugliste.

Belege und Prüflader sind in handoff.json per SHA256 gebunden. Root übernimmt ausschließlich bei bestandenen Nachweisen die Release-Metadaten.
