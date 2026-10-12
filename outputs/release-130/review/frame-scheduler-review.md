# Frame-Scheduler: unabhängige Releaseprüfung

12. Oktober 2026. Gelesen: `dist/view-frame-scheduler-v130.js`, die Scope-Hooks in `dist/world-unity-v151.js`, das exakt eingebettete Präfix von `dist/unity-match/runtime.js` und `work/test-view-frame-scheduler-v130.cjs`. Keine Quelle, Browser-/Editorinstanz oder laufende Prüfung geändert. Zwei kleine Queue-Szenarien ausschließlich im Speicher nachgestellt.

## Gefundener und von Root behobener Blocker: Back/Forward Cache

Der zuerst geprüfte Stand löschte bei jedem `pagehide` sämtliche `pending`-Callbacks und deaktivierte den Scope, ohne `pageshow`-Handler. Bei einem BFCache-fähigen `pagehide({persisted:true})` bleiben jedoch die JS-Instanz, Unity/Emscripten-Mainloop und die Renderer-ID `loop` im Elternfenster erhalten. Dadurch wurden Callbackketten abgebrochen, ohne ihre Besitzer zu informieren.

`dist/world-unity-v151.js:274,279` setzt den Bildloop nur bei `!loop` neu auf. Der gespeicherte positive Loop-Handle hätte nach Queue-Löschung auf keinen Callback mehr verwiesen. Auch die iframe-Unity-Kette war betroffen. Ergebnis des alten Stands: potenziell eingefrorene 3D-Ansicht nach Browser-Zurück/Vorwärts.

Die In-Memory-Probe bestätigt nach einem noch wartenden rekursiven RAF und `pagehide({persisted:true})`: pending=0, native RAF=0, Timer=0, kein pageshow-Handler. Das vorhandene `pagehide clears all callbacks`-Testziel prüft ausschließlich Löschung, nicht die korrekte BFCache-Rückkehr.

**Finaler Stand von Root nach Befund:** `away` sperrt das Scheduling während `pagehide`; aktive RAF-/Timerarme werden gestoppt, Benutzerqueue und Scope-Wahl bleiben erhalten. `pageshow` setzt `away` zurück, erneuert Generation/Zeitbasis und plant den vorhandenen Callbackstapel. `enabled` meldet während der Suspendierung false. Bei endgültiger Navigation entsorgt der Browser die Instanz; ein Nachholen alter Deadline-/Matchzeit findet nicht statt.

Unabhängige In-Memory-Nachprüfung des korrigierten Stands: nach persisted pagehide pending=1, native RAF=0, Timer=0; nach pageshow genau eine Ausführung, pending=0. Kanonischer SHA-256 `a707b64ed619f7782d95eeae62bbbe4820c839c530696cf60350c18731ccb3a1`; runtime.js enthält exakt denselben Präfix. Die korrigierte Lifecycle-Assertion ersetzt den alten Löschtest sinnvoll. **Der Blocker ist im Quellstand geschlossen; keine weiteren Releaseblocker in diesem begrenzten Review gefunden.** Die tatsächliche paketierte Browser-Navigation bleibt Root-Abnahme.

## Sonstige geprüfte Verträge

- Queue-IDs und Generationstoken verhindern doppelte Ausführung derselben Anforderung über RAF und Timer. Abbruch vor Dispatch und Abbruch eines späteren Callbacks im laufenden Batch sind korrekt.
- Während des Dispatch registrierte RAF-Anforderungen warten auf einen neuen Batch; alle Callbacks des aktuellen Batches bekommen denselben Timestamp. Callbackfehler werden isoliert und gemeldet.
- Scope-Hooks aktivieren den Fallback nur für die Unity-Ansicht. 2D/dispose/verborgene Taktikansicht deaktivieren ihn. Eltern-/iframe-Verknüpfung prüft gleiche Herkunft und vorhandenen Unity-Canvas. Kein LocalPreview-Flag ist erforderlich.
- Kein Zugriff auf native Matchzeit, Spielstände oder Match-RNG im Scheduler. Native RAF bleiben der einzige Weg für inaktive Ansichten; für High-Hz-Anzeigen wird kein 60-Hz-Limit eingeführt.
- Das runtime.js-Präfix entspricht dem kanonischen Scheduler; doppeltes Laden wird durch `D6ViewFramePump` verhindert.

## Grenze der jetzigen Kadenzprüfungen

Der Timer darf schon `deadline−2 ms` gewinnen. Eine In-Memory-Probe liefert einen Fallback bei 16,000 ms und die neu angeforderte native RAF bei 16,667 ms. Es wird keine einzelne Anforderung doppelt ausgeführt, aber zwei aufeinanderfolgende Renderbatches können nur 0,667 ms auseinander liegen. Die 17 Prüfungen decken dieses Zusammenspiel mit regelmäßigen 60-Hz-RAF nicht ab. Das ist kein zweiter nachgewiesener Match-Blocker; bei der Kadenzabnahme sollte die Verteilung kurzer Frameabstände zusätzlich zum FPS-Mittel betrachtet werden. Native High-Hz-Bilder weiterhin erhalten, keinen globalen Framecap ergänzen.

Die gemeldeten 57,34 FPS des echten eigenen Karriereklons sind ein gültiger Beleg für diese Konfiguration, kein Android- oder universeller Kadenznachweis. Produktionssuite und neue vollständige 2D/Unity-Parität laufen separat bei Root; dieser Bericht nimmt ihr Ergebnis nicht vorweg.
