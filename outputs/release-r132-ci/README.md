# Release 132 · Teil 1: CI-Prüfsuite

Arbeitsort: `F:\Neuer Ordner (2)\ChatGPT\Fussballmanager\work\release-r132`; Branch `release/r132`. Ausgangsstand `864fe441`, Testkorrekturen `febe053c45ac896d6a359be39c8b8282d8bccf47`.

Node `v24.19.0` über die gebündelte Laufzeit, Python `3.13.7` über `py -3`. Die Python-Workflowbefehle wurden mit demselben Python-Interpreter ausgeführt; POSIX-Variablenpräfixe wurden als Prozessumgebung gesetzt.

Alle 116 Befehle des Workflow-Schritts „Spieltests ausführen“ wurden einzeln ausgeführt, einschließlich aller Langzeitvarianten und beider Python-Tests. Erstlauf: 113 grün, 3 rot. Abschluss: 116 grüne Befehlsnachweise; Build und Buildprüfung ebenfalls grün.

**Laufabgrenzung:** Die drei korrigierten Befehle wurden auf dem finalen Teststand erneut ausgeführt. Die übrigen 113 grünen Erstlauf-Ergebnisse bleiben gültig: Produktquellen, ihre Zeilenenden und die betreffenden Testskripte wurden nicht verändert. Es gab keinen zweiten vollständigen 116-Befehle-Lauf. „Grün (Erstlauf)“ macht diese Wiederverwendung ausdrücklich sichtbar.

## Fehler, Ursache und Maßnahme

| Nr. | Einordnung | Ursache / Basisbeleg | Maßnahme |
| --- | --- | --- | --- |
| 104 | Testskript: fehlende VM-Abhängigkeit | Der isolierte Ausschnitt von v99BallView ruft neu v182PenaltyFrameBall auf, lädt aber dessen Definition nicht. Auf 57f7e939 bestanden (13 Checks). | Echte markergebundene Funktion aus world-pitch-actions-v99.js mitladen; alle 13 bestehenden Assertions erhalten. Kein Stub und keine geänderte Verhaltenserwartung. |
| 106 | Testskript: unvollständige Ladereihenfolge | Der neu mit ausgeschnittene Keeper-Adapter bindet v123OwnedBall; die isolierte VM hatte den ursprünglichen Ballleser nicht geladen. Auf 57f7e939 bestanden (19 Checks). | Echte v123OwnedBall-Definition aus pitch-v55.js vor dem Adapter laden; diesen zusätzlichen Eingang im Quellhash-Nachweis erfassen. Alle 19 bestehenden Assertions erhalten. |
| 114 | Vorhandener Testskriptfehler, durch B09 sichtbar | Der Audit nimmt bei 36 Werten den oberen Mittelwert statt des statistischen Medians. Basis-Audit bestanden (Saison 10: 0,82); isolierte Medianprüfung auf Basis und 864fe441 rot: 3 statt 2,5 für [4,1,3,2]. Neue Elfmeterschießen ändern den Saisonverlauf. | Eine nicht mutierende Medianfunktion für Start-, Saison- und Schlusswerte verwenden; gerade/ungerade/einzelne Stichproben und die 36-Werte-Grenze prüfen. Grenzen 0,68–0,83, bisherige Rundung, 6 Seeds, 10 Saisons und übrige Gates unverändert. |

Der unveränderte Audit scheitert mit den Release-132-Ergebnissen bei Saison 10 (oberer Mittelwert `0,8365509082906668`, gerundet `0,84`). Der andere mittlere Wert ist `0,8302690669550249`. Ihr echter Median ist `0,8334099876228458`, nach der unverändert bestehenden Zwei-Stellen-Rundung `0,83`. Die Testgrenze wurde nicht angehoben.

Differentialbelege: Mit ausschließlich altem Elfmeterschießen ist der Audit grün; mit ausschließlich alten Transferfunktionen bleibt er rot. Mit korrektem Median besteht er mit den echten neuen Produktregeln. Diese Diagnosevarianten waren Kopien des Testskripts und haben keine Produktdatei verändert.

- [Basis: Keeper/Kontakt](base-57f7e939/results.json), [Basis: vollständiger Audit](base-audit-57f7e939/results.json). Der temporäre detached Worktree wurde jeweils entfernt.
- [Audit vor der Median-Korrektur mit Saisonwerten](audit-diagnostic/114.log), [nur altes Elfmeterschießen](probes/legacy-shootout.log), [nur alte Transfers](probes/legacy-transfers.log), [Median-Differentiallauf mit Rohwerten](probes/correct-median.log).
- Schneller Regressionstest: `node work/check-audit-median-r132.cjs`; mit Argument `864fe441` oder `57f7e939` reproduziert er den früheren Medianfehler. [Vorher rot](probes/median-before.log), [Basis rot](probes/median-base-57f7e939.log), [nachher grün](probes/median-after.log).

Es waren keine Produktfixes und keine Anpassungen an alte bewusst geänderte Verhaltenserwartungen nötig. Sämtliche Korrekturen betreffen den Testaufbau beziehungsweise seine Auswertung.

## Alle CI-Befehle

| Nr. | Befehl aus deploy.yml | Vorher | Nachher | Beleg |
| ---: | --- | --- | --- | --- |
| 1 | `node work/test-release-version.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.09 s](before/001.log) |
| 2 | `node work/test-lowpoly-goal-tail.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.376 s](before/002.log) |
| 3 | `node work/platform/qa/test-presentation-v131.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.045 s](before/003.log) |
| 4 | `node work/test-tactics-roster-v130.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 9.448 s](before/004.log) |
| 5 | `node work/run-native130-tests.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 1.084 s](before/005.log) |
| 6 | `node work/test-view-frame-scheduler-v130.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.04 s](before/006.log) |
| 7 | `node work/test-squad-planning-v179.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 3.184 s](before/007.log) |
| 8 | `node work/test-start-rosters-v177.cjs --worlds=60` | grün (Exit 0) | grün (Erstlauf) | [vorher, 92.528 s](before/008.log) |
| 9 | `node work/test-compact-balance-v178.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 6.415 s](before/009.log) |
| 10 | `node work/test-native-performance-context.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.064 s](before/010.log) |
| 11 | `node work/test-youth-legacy-v176.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 6.049 s](before/011.log) |
| 12 | `node work/test-progress-v58.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.053 s](before/012.log) |
| 13 | `node work/test-live-player-v59.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.204 s](before/013.log) |
| 14 | `node work/test-progress-menu.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.052 s](before/014.log) |
| 15 | `node work/test-transfer-confirmations.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.033 s](before/015.log) |
| 16 | `node work/test-transfer-deadline-dialog.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.041 s](before/016.log) |
| 17 | `node work/test-tactics-replacement.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.058 s](before/017.log) |
| 18 | `node work/test-quick-lineup-cells.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.04 s](before/018.log) |
| 19 | `node work/test-v24.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.039 s](before/019.log) |
| 20 | `node work/test-mobile-drag-scroll.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.157 s](before/020.log) |
| 21 | `node work/test-v20-wake-lifecycle.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.071 s](before/021.log) |
| 22 | `node work/test-v31.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 1.551 s](before/022.log) |
| 23 | `node work/test-v41.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.133 s](before/023.log) |
| 24 | `node work/test-v42.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.213 s](before/024.log) |
| 25 | `node work/test-v44.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.153 s](before/025.log) |
| 26 | `node work/test-v45.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.165 s](before/026.log) |
| 27 | `node work/test-v47.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.178 s](before/027.log) |
| 28 | `node work/test-statistics-menu.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.163 s](before/028.log) |
| 29 | `node work/test-player-seasons.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.149 s](before/029.log) |
| 30 | `node work/test-v49.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.148 s](before/030.log) |
| 31 | `node work/test-v50.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.43 s](before/031.log) |
| 32 | `node work/test-v50-balance.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 24.864 s](before/032.log) |
| 33 | `node work/test-v51.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.526 s](before/033.log) |
| 34 | `node work/test-v52.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.192 s](before/034.log) |
| 35 | `node work/test-v53.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.193 s](before/035.log) |
| 36 | `node work/test-v54.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 46.457 s](before/036.log) |
| 37 | `node work/test-v55.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.553 s](before/037.log) |
| 38 | `node work/test-ai-season-stats.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.165 s](before/038.log) |
| 39 | `node work/test-ai-career-v60.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.744 s](before/039.log) |
| 40 | `node work/test-breakaway.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.167 s](before/040.log) |
| 41 | `node work/test-v56.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 5.576 s](before/041.log) |
| 42 | `node work/test-duel-streaks.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.537 s](before/042.log) |
| 43 | `node work/test-v57.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.585 s](before/043.log) |
| 44 | `node work/test-world-foundation-v61.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.134 s](before/044.log) |
| 45 | `node work/test-world-local-start.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.962 s](before/045.log) |
| 46 | `node work/test-world-competition-v62.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 11.955 s](before/046.log) |
| 47 | `node work/test-world-coaches-v63.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 1.401 s](before/047.log) |
| 48 | `node work/test-world-match-v64.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.38 s](before/048.log) |
| 49 | `node work/test-world-penalties-v65.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.035 s](before/049.log) |
| 50 | `node work/test-world-victory-popup.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.041 s](before/050.log) |
| 51 | `node work/test-world-nationalities-v79.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 2.793 s](before/051.log) |
| 52 | `node work/test-world-market-nationalities-v79.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.139 s](before/052.log) |
| 53 | `node work/test-world-kits-v81.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 2.157 s](before/053.log) |
| 54 | `node work/test-world-direct-transfer.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.192 s](before/054.log) |
| 55 | `node work/test-world-navigation.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.042 s](before/055.log) |
| 56 | `node work/test-world-swap-banner.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.039 s](before/056.log) |
| 57 | `node work/test-world-goal-scene-v83.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.04 s](before/057.log) |
| 58 | `node work/test-world-goal-banner-v84.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.041 s](before/058.log) |
| 59 | `node work/test-i18n-v75.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.051 s](before/059.log) |
| 60 | `node work/test-world-live-ranks.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.04 s](before/060.log) |
| 61 | `node work/test-world-grid-v71.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.114 s](before/061.log) |
| 62 | `node work/test-world-player-instructions.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.121 s](before/062.log) |
| 63 | `node work/test-world-physical-instructions.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.165 s](before/063.log) |
| 64 | `node work/test-world-career-plan.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.13 s](before/064.log) |
| 65 | `node work/test-world-economy-v66.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 8.343 s](before/065.log) |
| 66 | `node work/test-world-sponsors-v97.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.242 s](before/066.log) |
| 67 | `node work/test-world-career-events.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 2.046 s](before/067.log) |
| 68 | `node work/test-world-playable-rosters.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.362 s](before/068.log) |
| 69 | `node work/test-world-transfer-list-v72.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.65 s](before/069.log) |
| 70 | `node work/test-world-human-sale-v73.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.446 s](before/070.log) |
| 71 | `node work/test-world-youth-manager-v67.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 4.753 s](before/071.log) |
| 72 | `node work/test-finance-close-v130.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 1.565 s](before/072.log) |
| 73 | `node work/test-world-payments-v124.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 3.788 s](before/073.log) |
| 74 | `node work/test-3d-documentation-v134.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.093 s](before/074.log) |
| 75 | `node work/test-mobile-performance-v135.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.052 s](before/075.log) |
| 76 | `node work/test-world-storage-v67.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.226 s](before/076.log) |
| 77 | `node work/test-world-storage-startup.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 6.849 s](before/077.log) |
| 78 | `node work/test-world-storage-recovery.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.977 s](before/078.log) |
| 79 | `node work/test-expansion-assets-v161.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 1.115 s](before/079.log) |
| 80 | `node work/test-world-expansion-v161.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 19.185 s](before/080.log) |
| 81 | `node work/test-world-expansion-domestic-v164.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 8.938 s](before/081.log) |
| 82 | `node work/test-world-expansion-crown-v165.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 9.268 s](before/082.log) |
| 83 | `node work/test-world-expansion-horizon-v166.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 169.165 s](before/083.log) |
| 84 | `node work/test-world-expansion-active-validation-v166.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 10.614 s](before/084.log) |
| 85 | `node work/test-world-expansion-rules-v167.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 6.206 s](before/085.log) |
| 86 | `node work/test-world-expansion-contracts-v168.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 14.554 s](before/086.log) |
| 87 | `node work/test-world-expansion-stories-v170.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 16.37 s](before/087.log) |
| 88 | `node work/test-world-expansion-presentation-v172.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 13.621 s](before/088.log) |
| 89 | `node work/test-world-expansion-flutlicht-v175.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 5.583 s](before/089.log) |
| 90 | `node work/platform/qa/test-android-3d-acceptance.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.111 s](before/090.log) |
| 91 | `node work/test-world-save-management-v70.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 1.134 s](before/091.log) |
| 92 | `node work/test-world-views-v68.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.403 s](before/092.log) |
| 93 | `node work/test-world-honours-v74.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.133 s](before/093.log) |
| 94 | `node work/test-match-presentation-v74.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.157 s](before/094.log) |
| 95 | `node work/test-player-ui-projection.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.048 s](before/095.log) |
| 96 | `node work/test-player-aging.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.044 s](before/096.log) |
| 97 | `node work/test-player-load-candidate-v158.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.058 s](before/097.log) |
| 98 | `node work/test-native-career-v160.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 276.369 s](before/098.log) |
| 99 | `node work/platform/qa/test-unity-integration-v160.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.046 s](before/099.log) |
| 100 | `node work/platform/qa/test-world-unity-contract.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.042 s](before/100.log) |
| 101 | `node work/test-world-pitch3d-v98.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.049 s](before/101.log) |
| 102 | `node work/test-unity-label-layout.cjs outputs/3d-quality/iteration-119/label-layout` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.059 s](before/102.log) |
| 103 | `node work/test-unity-3d-quality-v117.cjs outputs/3d-quality/iteration-119/guide-legacy` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.047 s](before/103.log) |
| 104 | `node work/test-keeper-picture-v118.cjs outputs/3d-quality/iteration-119/keeper-legacy` | rot (Exit 1) | grün (Exit 0, erneut) | [vorher, 0.042 s](before/104.log) / [nachher, 0.04 s](final-targeted/104.log) |
| 105 | `node work/test-keeper-picture-v119.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.048 s](before/105.log) |
| 106 | `node work/test-3d-contacts-v119.cjs` | rot (Exit 1) | grün (Exit 0, erneut) | [vorher, 0.044 s](before/106.log) / [nachher, 0.041 s](final-targeted/106.log) |
| 107 | `node work/test-whistle-offside-v119.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.058 s](before/107.log) |
| 108 | `node work/test-shootout-quality-v119.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.394 s](before/108.log) |
| 109 | `node work/test-trophy-art-v119.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.051 s](before/109.log) |
| 110 | `node work/platform/qa/test-world-unity-slides.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.041 s](before/110.log) |
| 111 | `DOPPEL_SEASONS=10 node work/test-world-economy-v66.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 16.936 s](before/111.log) |
| 112 | `DOPPEL_SALES=1 DOPPEL_SEASONS=10 node work/test-world-economy-v66.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 17.972 s](before/112.log) |
| 113 | `DOPPEL_SEASONS=10 node work/test-world-youth-manager-v67.cjs` | grün (Exit 0) | grün (Erstlauf) | [vorher, 15.11 s](before/113.log) |
| 114 | `node work/audit-world-balance-v68.cjs` | rot (Exit 1) | grün (Exit 0, erneut) | [vorher, 91.297 s](before/114.log) / [nachher, 83.121 s](final-targeted/114.log) |
| 115 | `python3 work/test_deploy_ftps.py` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.181 s](before/115.log) |
| 116 | `python3 work/test_deploy_unity_assets.py` | grün (Exit 0) | grün (Erstlauf) | [vorher, 0.217 s](before/116.log) |

## Anschließender Build

| Befehl | Ergebnis | Beleg |
| --- | --- | --- |
| `node work/build.cjs` | grün (Exit 0), 37.023 s | [Ausgabe](build/001.log) |
| `node work/ui-redesign/shared/verify-build.cjs` | grün (Exit 0), 2.689 s | [Ausgabe](build/002.log) |

Beide HTML-Dateien haben SHA-256 `91ac4f5882772da9e7daaac425f43663953de4672a45f912828c0084931dd8b7`. Quelle und Build behalten `PROTOTYP 131`; in diesem Teilauftrag wurde die Fußversion nicht geändert. Die Verifikationsdatei prüft alle 26 Flutlicht-Assets, ihre Offline-Einbettung, gleiche HTML-Kopien und gleiche Versionsangaben. [Buildmetadaten](build/results.json).

## Git-übergabe und Umfang

- Lokaler Fixcommit: `febe053c45ac896d6a359be39c8b8282d8bccf47`; erforderlicher Co-Author ist enthalten. Ein weiterer lokaler Commit enthält dieses Protokoll und die Rohbelege.
- Bewusst aktualisierte bestehende Belege: `outputs/3d-quality/iteration-119/contacts-tests.json` (19 unveränderte Checks, zusätzliche echte Abhängigkeit im Quellhash-Vertrag) und `outputs/3d-quality/iteration-119/keeper-legacy/bridge-tests.json` (13 unveränderte Checks, aktuelle Quellhashes). Andere automatisch veränderte getrackte Nachweise wurden auf ihren Ausgangsstand zurückgesetzt.
- `outputs/index.html` und `outputs/Doppel-6-Fussballmanager.html` sind lokal gebaut und bleiben absichtlich uncommitted.
- Kein Produktcode, kein Workflow, keine Spielstände, keine Fußversion und keine der untersagten Dokumentationsdateien geändert. Kein Unity-Build, Deployment oder Push. Keine eigenen Server gestartet.
- Verbleibende rote CI-Befehle: **keine**.

Diese Prüfung gilt für Teil 1 auf dem genannten Quellstand. Das später hinzukommende Animationspaket und der neue Unity-Build benötigen ihre eigene abschließende Integration und Prüfung.
