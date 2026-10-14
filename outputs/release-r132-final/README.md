# Release 132 · abschließende lokale Prüfung (Teil 2)

Arbeitsort `work/release-r132`, Branch `release/r132`, integrierter Ausgangsstand `3085ab55`. Veröffentlichung beauftragt; die Integration übernimmt Push auf main, Deployment und Live-Abnahme. Kein Push, Deploy oder Live-Zugriff in diesem Teil.

**Ergebnis:** 116/116 CI-Befehle, 16/16 Branchchecks und 10/10 Zusatzbefehle grün. Node v24.19.0 über `C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`; Python über `py -3`. POSIX-Variablenpräfixe sind als Prozessumgebung gesetzt; `python3` verwendet lokal denselben Python-Interpreter. Browserchecks auf localhost:4240, mit dem im Repository dokumentierten isolierten Edge/Playwright-Prüfzugang. Server nach dem Lauf beendet.

Alle 116 Befehle des Schritts „Spieltests ausführen“ wurden nach dem Animations-Merge neu ausgeführt; keine Teil-1-Ergebnisse wiederverwendet. Ein Erstlauf schlug beim Tornetz-Harness fehl. Die neue mehrzeilige Produktionsprojektion wird jetzt vollständig geladen, einschließlich ihrer Beobachtungs-/Vorbereitungshilfen; alle bisherigen Assertions und Grenzen bleiben erhalten. Nur dieser Test wurde erneut ausgeführt. Der rote Erstlauf bleibt unter [ci/002.log](ci/002.log), der grüne Wiederholungslauf unter [ci-targeted/002.log](ci-targeted/002.log) erhalten. Keine Produktkorrektur oder abgeschwächte Erwartung in Teil 2.

Branch-Altpartienvergleich gegen archiviertes `f2458c1f`: unmarkierte native Szenen einschließlich Zufallsfolge und Ledger identisch. Dies ist keine vollständige Gesamtpartie-Restore-Freigabe. Die Basisabweichung 3.540/3.676 Ticks (je 1:0) und fünf rote Altchecks bleiben im Backlog; sie wurden hier nicht erneut ausgeführt.

## Vollständige CI-Befehle

| Nr. | Befehl aus deploy.yml | Ergebnis | Dauer | Log |
| ---: | --- | --- | ---: | --- |
| 1 | `node work/test-release-version.cjs` | grün (Exit 0) | 0.036 s | [Log](ci/001.log) |
| 2 | `node work/test-lowpoly-goal-tail.cjs` | grün, nach Harnesskorrektur erneut (Exit 0) | 0.328 s | [Log](ci-targeted/002.log) |
| 3 | `node work/platform/qa/test-presentation-v131.cjs` | grün (Exit 0) | 0.037 s | [Log](ci/003.log) |
| 4 | `node work/test-tactics-roster-v130.cjs` | grün (Exit 0) | 8.457 s | [Log](ci/004.log) |
| 5 | `node work/run-native130-tests.cjs` | grün (Exit 0) | 0.603 s | [Log](ci/005.log) |
| 6 | `node work/test-view-frame-scheduler-v130.cjs` | grün (Exit 0) | 0.04 s | [Log](ci/006.log) |
| 7 | `node work/test-squad-planning-v179.cjs` | grün (Exit 0) | 3.179 s | [Log](ci/007.log) |
| 8 | `node work/test-start-rosters-v177.cjs --worlds=60` | grün (Exit 0) | 90.163 s | [Log](ci/008.log) |
| 9 | `node work/test-compact-balance-v178.cjs` | grün (Exit 0) | 6.325 s | [Log](ci/009.log) |
| 10 | `node work/test-native-performance-context.cjs` | grün (Exit 0) | 0.05 s | [Log](ci/010.log) |
| 11 | `node work/test-youth-legacy-v176.cjs` | grün (Exit 0) | 5.947 s | [Log](ci/011.log) |
| 12 | `node work/test-progress-v58.cjs` | grün (Exit 0) | 0.033 s | [Log](ci/012.log) |
| 13 | `node work/test-live-player-v59.cjs` | grün (Exit 0) | 0.169 s | [Log](ci/013.log) |
| 14 | `node work/test-progress-menu.cjs` | grün (Exit 0) | 0.032 s | [Log](ci/014.log) |
| 15 | `node work/test-transfer-confirmations.cjs` | grün (Exit 0) | 0.032 s | [Log](ci/015.log) |
| 16 | `node work/test-transfer-deadline-dialog.cjs` | grün (Exit 0) | 0.033 s | [Log](ci/016.log) |
| 17 | `node work/test-tactics-replacement.cjs` | grün (Exit 0) | 0.032 s | [Log](ci/017.log) |
| 18 | `node work/test-quick-lineup-cells.cjs` | grün (Exit 0) | 0.032 s | [Log](ci/018.log) |
| 19 | `node work/test-v24.cjs` | grün (Exit 0) | 0.032 s | [Log](ci/019.log) |
| 20 | `node work/test-mobile-drag-scroll.cjs` | grün (Exit 0) | 0.14 s | [Log](ci/020.log) |
| 21 | `node work/test-v20-wake-lifecycle.cjs` | grün (Exit 0) | 0.037 s | [Log](ci/021.log) |
| 22 | `node work/test-v31.cjs` | grün (Exit 0) | 1.51 s | [Log](ci/022.log) |
| 23 | `node work/test-v41.cjs` | grün (Exit 0) | 0.133 s | [Log](ci/023.log) |
| 24 | `node work/test-v42.cjs` | grün (Exit 0) | 0.191 s | [Log](ci/024.log) |
| 25 | `node work/test-v44.cjs` | grün (Exit 0) | 0.144 s | [Log](ci/025.log) |
| 26 | `node work/test-v45.cjs` | grün (Exit 0) | 0.138 s | [Log](ci/026.log) |
| 27 | `node work/test-v47.cjs` | grün (Exit 0) | 0.184 s | [Log](ci/027.log) |
| 28 | `node work/test-statistics-menu.cjs` | grün (Exit 0) | 0.154 s | [Log](ci/028.log) |
| 29 | `node work/test-player-seasons.cjs` | grün (Exit 0) | 0.137 s | [Log](ci/029.log) |
| 30 | `node work/test-v49.cjs` | grün (Exit 0) | 0.142 s | [Log](ci/030.log) |
| 31 | `node work/test-v50.cjs` | grün (Exit 0) | 0.422 s | [Log](ci/031.log) |
| 32 | `node work/test-v50-balance.cjs` | grün (Exit 0) | 22.48 s | [Log](ci/032.log) |
| 33 | `node work/test-v51.cjs` | grün (Exit 0) | 0.487 s | [Log](ci/033.log) |
| 34 | `node work/test-v52.cjs` | grün (Exit 0) | 0.184 s | [Log](ci/034.log) |
| 35 | `node work/test-v53.cjs` | grün (Exit 0) | 0.169 s | [Log](ci/035.log) |
| 36 | `node work/test-v54.cjs` | grün (Exit 0) | 39.802 s | [Log](ci/036.log) |
| 37 | `node work/test-v55.cjs` | grün (Exit 0) | 0.537 s | [Log](ci/037.log) |
| 38 | `node work/test-ai-season-stats.cjs` | grün (Exit 0) | 0.156 s | [Log](ci/038.log) |
| 39 | `node work/test-ai-career-v60.cjs` | grün (Exit 0) | 0.788 s | [Log](ci/039.log) |
| 40 | `node work/test-breakaway.cjs` | grün (Exit 0) | 0.16 s | [Log](ci/040.log) |
| 41 | `node work/test-v56.cjs` | grün (Exit 0) | 5.608 s | [Log](ci/041.log) |
| 42 | `node work/test-duel-streaks.cjs` | grün (Exit 0) | 0.534 s | [Log](ci/042.log) |
| 43 | `node work/test-v57.cjs` | grün (Exit 0) | 0.566 s | [Log](ci/043.log) |
| 44 | `node work/test-world-foundation-v61.cjs` | grün (Exit 0) | 0.12 s | [Log](ci/044.log) |
| 45 | `node work/test-world-local-start.cjs` | grün (Exit 0) | 0.93 s | [Log](ci/045.log) |
| 46 | `node work/test-world-competition-v62.cjs` | grün (Exit 0) | 11.873 s | [Log](ci/046.log) |
| 47 | `node work/test-world-coaches-v63.cjs` | grün (Exit 0) | 1.42 s | [Log](ci/047.log) |
| 48 | `node work/test-world-match-v64.cjs` | grün (Exit 0) | 0.373 s | [Log](ci/048.log) |
| 49 | `node work/test-world-penalties-v65.cjs` | grün (Exit 0) | 0.034 s | [Log](ci/049.log) |
| 50 | `node work/test-world-victory-popup.cjs` | grün (Exit 0) | 0.035 s | [Log](ci/050.log) |
| 51 | `node work/test-world-nationalities-v79.cjs` | grün (Exit 0) | 2.85 s | [Log](ci/051.log) |
| 52 | `node work/test-world-market-nationalities-v79.cjs` | grün (Exit 0) | 0.135 s | [Log](ci/052.log) |
| 53 | `node work/test-world-kits-v81.cjs` | grün (Exit 0) | 2.316 s | [Log](ci/053.log) |
| 54 | `node work/test-world-direct-transfer.cjs` | grün (Exit 0) | 0.182 s | [Log](ci/054.log) |
| 55 | `node work/test-world-navigation.cjs` | grün (Exit 0) | 0.034 s | [Log](ci/055.log) |
| 56 | `node work/test-world-swap-banner.cjs` | grün (Exit 0) | 0.031 s | [Log](ci/056.log) |
| 57 | `node work/test-world-goal-scene-v83.cjs` | grün (Exit 0) | 0.033 s | [Log](ci/057.log) |
| 58 | `node work/test-world-goal-banner-v84.cjs` | grün (Exit 0) | 0.031 s | [Log](ci/058.log) |
| 59 | `node work/test-i18n-v75.cjs` | grün (Exit 0) | 0.047 s | [Log](ci/059.log) |
| 60 | `node work/test-world-live-ranks.cjs` | grün (Exit 0) | 0.031 s | [Log](ci/060.log) |
| 61 | `node work/test-world-grid-v71.cjs` | grün (Exit 0) | 0.107 s | [Log](ci/061.log) |
| 62 | `node work/test-world-player-instructions.cjs` | grün (Exit 0) | 0.113 s | [Log](ci/062.log) |
| 63 | `node work/test-world-physical-instructions.cjs` | grün (Exit 0) | 0.155 s | [Log](ci/063.log) |
| 64 | `node work/test-world-career-plan.cjs` | grün (Exit 0) | 0.119 s | [Log](ci/064.log) |
| 65 | `node work/test-world-economy-v66.cjs` | grün (Exit 0) | 8.567 s | [Log](ci/065.log) |
| 66 | `node work/test-world-sponsors-v97.cjs` | grün (Exit 0) | 0.227 s | [Log](ci/066.log) |
| 67 | `node work/test-world-career-events.cjs` | grün (Exit 0) | 2.046 s | [Log](ci/067.log) |
| 68 | `node work/test-world-playable-rosters.cjs` | grün (Exit 0) | 0.35 s | [Log](ci/068.log) |
| 69 | `node work/test-world-transfer-list-v72.cjs` | grün (Exit 0) | 0.549 s | [Log](ci/069.log) |
| 70 | `node work/test-world-human-sale-v73.cjs` | grün (Exit 0) | 0.478 s | [Log](ci/070.log) |
| 71 | `node work/test-world-youth-manager-v67.cjs` | grün (Exit 0) | 4.231 s | [Log](ci/071.log) |
| 72 | `node work/test-finance-close-v130.cjs` | grün (Exit 0) | 1.52 s | [Log](ci/072.log) |
| 73 | `node work/test-world-payments-v124.cjs` | grün (Exit 0) | 3.366 s | [Log](ci/073.log) |
| 74 | `node work/test-3d-documentation-v134.cjs` | grün (Exit 0) | 0.066 s | [Log](ci/074.log) |
| 75 | `node work/test-mobile-performance-v135.cjs` | grün (Exit 0) | 0.038 s | [Log](ci/075.log) |
| 76 | `node work/test-world-storage-v67.cjs` | grün (Exit 0) | 0.198 s | [Log](ci/076.log) |
| 77 | `node work/test-world-storage-startup.cjs` | grün (Exit 0) | 5.563 s | [Log](ci/077.log) |
| 78 | `node work/test-world-storage-recovery.cjs` | grün (Exit 0) | 0.916 s | [Log](ci/078.log) |
| 79 | `node work/test-expansion-assets-v161.cjs` | grün (Exit 0) | 0.505 s | [Log](ci/079.log) |
| 80 | `node work/test-world-expansion-v161.cjs` | grün (Exit 0) | 13.933 s | [Log](ci/080.log) |
| 81 | `node work/test-world-expansion-domestic-v164.cjs` | grün (Exit 0) | 6.818 s | [Log](ci/081.log) |
| 82 | `node work/test-world-expansion-crown-v165.cjs` | grün (Exit 0) | 8.974 s | [Log](ci/082.log) |
| 83 | `node work/test-world-expansion-horizon-v166.cjs` | grün (Exit 0) | 163.827 s | [Log](ci/083.log) |
| 84 | `node work/test-world-expansion-active-validation-v166.cjs` | grün (Exit 0) | 10.717 s | [Log](ci/084.log) |
| 85 | `node work/test-world-expansion-rules-v167.cjs` | grün (Exit 0) | 6.341 s | [Log](ci/085.log) |
| 86 | `node work/test-world-expansion-contracts-v168.cjs` | grün (Exit 0) | 14.813 s | [Log](ci/086.log) |
| 87 | `node work/test-world-expansion-stories-v170.cjs` | grün (Exit 0) | 16.412 s | [Log](ci/087.log) |
| 88 | `node work/test-world-expansion-presentation-v172.cjs` | grün (Exit 0) | 13.248 s | [Log](ci/088.log) |
| 89 | `node work/test-world-expansion-flutlicht-v175.cjs` | grün (Exit 0) | 5.35 s | [Log](ci/089.log) |
| 90 | `node work/platform/qa/test-android-3d-acceptance.cjs` | grün (Exit 0) | 0.103 s | [Log](ci/090.log) |
| 91 | `node work/test-world-save-management-v70.cjs` | grün (Exit 0) | 1.282 s | [Log](ci/091.log) |
| 92 | `node work/test-world-views-v68.cjs` | grün (Exit 0) | 0.447 s | [Log](ci/092.log) |
| 93 | `node work/test-world-honours-v74.cjs` | grün (Exit 0) | 0.149 s | [Log](ci/093.log) |
| 94 | `node work/test-match-presentation-v74.cjs` | grün (Exit 0) | 0.165 s | [Log](ci/094.log) |
| 95 | `node work/test-player-ui-projection.cjs` | grün (Exit 0) | 0.041 s | [Log](ci/095.log) |
| 96 | `node work/test-player-aging.cjs` | grün (Exit 0) | 0.039 s | [Log](ci/096.log) |
| 97 | `node work/test-player-load-candidate-v158.cjs` | grün (Exit 0) | 0.055 s | [Log](ci/097.log) |
| 98 | `node work/test-native-career-v160.cjs` | grün (Exit 0) | 248.493 s | [Log](ci/098.log) |
| 99 | `node work/platform/qa/test-unity-integration-v160.cjs` | grün (Exit 0) | 0.037 s | [Log](ci/099.log) |
| 100 | `node work/platform/qa/test-world-unity-contract.cjs` | grün (Exit 0) | 0.036 s | [Log](ci/100.log) |
| 101 | `node work/test-world-pitch3d-v98.cjs` | grün (Exit 0) | 0.037 s | [Log](ci/101.log) |
| 102 | `node work/test-unity-label-layout.cjs outputs/3d-quality/iteration-119/label-layout` | grün (Exit 0) | 0.052 s | [Log](ci/102.log) |
| 103 | `node work/test-unity-3d-quality-v117.cjs outputs/3d-quality/iteration-119/guide-legacy` | grün (Exit 0) | 0.037 s | [Log](ci/103.log) |
| 104 | `node work/test-keeper-picture-v118.cjs outputs/3d-quality/iteration-119/keeper-legacy` | grün (Exit 0) | 0.04 s | [Log](ci/104.log) |
| 105 | `node work/test-keeper-picture-v119.cjs` | grün (Exit 0) | 0.037 s | [Log](ci/105.log) |
| 106 | `node work/test-3d-contacts-v119.cjs` | grün (Exit 0) | 0.04 s | [Log](ci/106.log) |
| 107 | `node work/test-whistle-offside-v119.cjs` | grün (Exit 0) | 0.046 s | [Log](ci/107.log) |
| 108 | `node work/test-shootout-quality-v119.cjs` | grün (Exit 0) | 0.39 s | [Log](ci/108.log) |
| 109 | `node work/test-trophy-art-v119.cjs` | grün (Exit 0) | 0.037 s | [Log](ci/109.log) |
| 110 | `node work/platform/qa/test-world-unity-slides.cjs` | grün (Exit 0) | 0.034 s | [Log](ci/110.log) |
| 111 | `DOPPEL_SEASONS=10 node work/test-world-economy-v66.cjs` | grün (Exit 0) | 16.912 s | [Log](ci/111.log) |
| 112 | `DOPPEL_SALES=1 DOPPEL_SEASONS=10 node work/test-world-economy-v66.cjs` | grün (Exit 0) | 16.731 s | [Log](ci/112.log) |
| 113 | `DOPPEL_SEASONS=10 node work/test-world-youth-manager-v67.cjs` | grün (Exit 0) | 13.116 s | [Log](ci/113.log) |
| 114 | `node work/audit-world-balance-v68.cjs` | grün (Exit 0) | 83.761 s | [Log](ci/114.log) |
| 115 | `python3 work/test_deploy_ftps.py` | grün (Exit 0) | 0.148 s | [Log](ci/115.log) |
| 116 | `python3 work/test_deploy_unity_assets.py` | grün (Exit 0) | 0.166 s | [Log](ci/116.log) |

## Branch: alle Befehle

| Nr. | Befehl | Ergebnis | Dauer | Log |
| ---: | --- | --- | ---: | --- |
| 1 | `node work/test-freekick-plan-r132.cjs` | grün (Exit 0) | 0.076 s | [Log](branch/01-test-freekick-plan-r132.log) |
| 2 | `node work/test-restart-facing-v130.cjs` | grün (Exit 0) | 0.091 s | [Log](branch/02-test-restart-facing-v130.log) |
| 3 | `node work/test-observed-facing-r132.cjs` | grün (Exit 0) | 0.088 s | [Log](branch/03-test-observed-facing-r132.log) |
| 4 | `node work/test-penalty-quality-v182.cjs` | grün (Exit 0) | 1.006 s | [Log](branch/04-test-penalty-quality-v182.log) |
| 5 | `node work/test-corner-quality-v182.cjs` | grün (Exit 0) | 100.895 s | [Log](branch/05-test-corner-quality-v182.log) |
| 6 | `node work/test-keeper-hold-v182.cjs` | grün (Exit 0) | 41.882 s | [Log](branch/06-test-keeper-hold-v182.log) |
| 7 | `node work/test-loose-ball-v182.cjs` | grün (Exit 0) | 11.428 s | [Log](branch/07-test-loose-ball-v182.log) |
| 8 | `node work/test-defensive-pursuit-v182.cjs` | grün (Exit 0) | 45.112 s | [Log](branch/08-test-defensive-pursuit-v182.log) |
| 9 | `node work/test-review-fixes-v182.cjs` | grün (Exit 0) | 0.936 s | [Log](branch/09-test-review-fixes-v182.log) |
| 10 | `node work/check-old-matches-v182.cjs work/tmp-base182` | grün (Exit 0) | 16.941 s | [Log](branch/10-check-old-matches-v182.log) |
| 11 | `node work/test-whistle-offside-v119.cjs` | grün (Exit 0) | 0.049 s | [Log](branch/11-test-whistle-offside-v119.log) |
| 12 | `node work/test-world-offer-withdraw-reply-r132.cjs` | grün (Exit 0) | 2.024 s | [Log](branch/12-test-world-offer-withdraw-reply-r132.log) |
| 13 | `node work/check-audit-median-r132.cjs` | grün (Exit 0) | 0.033 s | [Log](branch/13-check-audit-median-r132.log) |
| 14 | `node work/check-finance-guide-r132.cjs` | grün (Exit 0) | 131.132 s | [Log](branch/14-check-finance-guide-r132.log) |
| 15 | `node work/check-tactics-pointer-r132.cjs` | grün (Exit 0) | 117.585 s | [Log](branch/15-check-tactics-pointer-r132.log) |
| 16 | `node work/check-offer-withdraw-reply-browser-r132.cjs` | grün (Exit 0) | 48.882 s | [Log](branch/16-check-offer-withdraw-reply-browser-r132.log) |

## Zusatz: alle Befehle

| Nr. | Befehl | Ergebnis | Dauer | Log |
| ---: | --- | --- | ---: | --- |
| 1 | `node work/build.cjs` | grün (Exit 0) | 39.152 s | [Log](supplemental/01.log) |
| 2 | `node work/ui-redesign/shared/verify-build.cjs` | grün (Exit 0) | 2.933 s | [Log](supplemental/02.log) |
| 3 | `node work/test-club-crests.cjs` | grün (Exit 0) | 0.292 s | [Log](supplemental/03.log) |
| 4 | `node work/test-expansion-crests.cjs` | grün (Exit 0) | 5.887 s | [Log](supplemental/04.log) |
| 5 | `node work/test-completed-crests.cjs` | grün (Exit 0) | 5.084 s | [Log](supplemental/05.log) |
| 6 | `node work/test-expansion-sponsors.cjs` | grün (Exit 0) | 3.133 s | [Log](supplemental/06.log) |
| 7 | `node work/test-no-player-images.cjs` | grün (Exit 0) | 0.271 s | [Log](supplemental/07.log) |
| 8 | `py -3 work/test_deploy_unity_assets.py` | grün (Exit 0) | 0.175 s | [Log](supplemental/08.log) |
| 9 | `py -3 work/check-release-r132-publication.py` | grün (Exit 0) | 0.43 s | [Log](supplemental/09.log) |
| 10 | `node work/test-release-version.cjs` | grün (Exit 0) | 0.034 s | [Log](supplemental/10.log) |

Der Build ist im Zusatzlauf neu erzeugt; beide HTML-Dateien sind bytegleich und zeigen Footer/Runtime-Cache 132. [Versions- und SHA-256-Nachweis](package-verification.json) bindet Produktquellen, Tests, Workflow und beide Builds. Der Unity-WebGL-Payload wurde nicht neu gebaut oder verändert.

## Browserbelege und Offline-Publikation

- Finanzführung: acht Szenarien (Desktop/Mobil, DE/EN, Saison 1/2), [Bericht](browser/finance/browser-check.json).
- Taktikpläne: 211 Prüfungen über Matchplan, Vorbereitung und Pause; Maus-/Touch-Drag, Klick ohne Verschiebung, Abbruch, Tastatur/assistive Bedienung und Überlauf; [Bericht](browser/tactics/browser-check.json).
- Angebotsrückzug/Antworten: Desktop und 390 px, DE/EN, Vereinsannahme/Gegenangebot/Ablehnung, Spielerforderung, Rückzug/neues Angebot und Fokus; [Log](branch/16-check-offer-withdraw-reply-browser-r132.log). Screenshots liegen unter `browser/transfers/`.
- Echte Manifest-/Build-Trockenprüfung: neun reale Dateien mit Größen/SHA-256, bytegleichem Fake-FTPS-Upload, Manifest zuletzt, sieben simulierte HTTP-Prüfungen und kein index.html. Kein Netzwerk; die Live-URL in der Ausgabe des unveränderten Deployers ist hier ausschließlich ein Mockziel. [Uploadplan](publication-dry-run.json).

## Übergabegrenzen

B01 bleibt auf Nutzerentscheidung unbehandelt; B02-Fix wegen Nebenwirkungen zurückgenommen; B05 nur teilweise (Knieflips). Offene Tackling-/Pass-/Beckengrenzen, Gesamtpartie-Restore-Parität, fünf rote Basischecks und das B10-Folgeballverhalten sind dokumentiert. P01 bleibt unter dem Ziel von 4–6 Minuten/10–16 Schüssen: Basis 3,24/4,7/1,98/1,5 gegenüber neu 2,86/3,85/1,35/1,13 (Zeit/Schüsse/aufs Tor/Tore, 40 vorhandene Vollpartien; hier nicht neu gemessen).

Neue Matchregeln nur für neue Partien, Kennung 182; keine Nachberechnung gespeicherter Partien. Nutzerabnahme der Korrekturen und reale Geräte-/Dauerlastabnahme bleiben offen. Beim Deployment zuerst die neue Unity-Laufzeit veröffentlichen, danach die Seite; Quelle, Build und Live-Version 132 sowie öffentliche Dateihashes prüfen. [Releasebericht](../../docs/release-132.md).
