# Release 130: schmale Quellenkompatibilitätsprüfung

13. Oktober 2026. Lesend geprüft wurden die bedingte `step`-Registrierung in `dist/world-pitch3d-v98.js`, die tatsächlichen Skriptpositionen in `dist/index.html` und die Produktions-Scope-Hooks in `dist/world-unity-v151.js`. Keine Quelle, laufende Suite, Browser-/Editorinstanz oder Buildausgabe verändert; nur dieser Bericht und seine JSON-Datei wurden geschrieben.

**Keine Blocker gefunden.** `if(typeof step==='function')` umfasst ausschließlich das Einhängen des Beobachtungshooks. WeakMap und reine Projektionshelfer bleiben unabhängig davon verfügbar. Eine absichtlich reine View-Fixture ohne nativen `step` darf die Datei deshalb laden; es wurde kein falscher No-op-Controller eingeführt. Im realen Spiel wird `game.js` vorher geladen, sodass genau derselbe Hook installiert wird wie vor dem Guard.

Die tatsächliche Quellseite enthält die relevanten Skripte jeweils einmal, in Reihenfolge: Scheduler (Index 0), game (1), pitch-motion (111), attack-flow (116), world-pitch3d (121), world-unity (123). Kontaktuhr und native Skalierungs-/Aktivitätshelfer sind damit vor Hook-Installation vorhanden. Die spätere Unity-Startbarriere kapselt den vorhandenen Hook weiterhin; solange Unity lädt, wird kein nativer Schritt ausgeführt oder Beobachtungszustand künstlich fortgeschrieben.

Der Hook ruft den bisherigen nativen Schritt einmal auf und gibt dessen Ergebnis unverändert zurück. Er beobachtet abgeschlossene Positionen und Kontaktuhr; nur die private WeakMap erhält beobachtete Wege/Geschwindigkeiten. Fehlende Bewegung, Neustartwechsel, Matchwechsel oder unterbrochene Kontaktuhr werden nicht als Reise rekonstruiert. Der Guard ändert keine Match-, RNG-, Save- oder P02-Autorität.

Produktions-Schedulerhooks sind unverändert: Aktivierung bei Unity-Erstellung/sichtbarer Fläche, Deaktivierung bei Dispose/2D/verborgener Taktik, gleiche Herkunft für den iframe. Die bereits überprüfte BFCache-Suspendierung erhält Warteschlangen und erneuert die Deadline beim Zurückkehren. Das runtime.js-Präfix wurde erneut unabhängig mit dem kanonischen Scheduler verglichen: exakt gleich. Keine zweite Einbindung in der Quellseite.

Quellenhash `world-pitch3d-v98.js`: `3c2b6074fc578d05183b3151019beed16517f227a523b26f78b2bb546c990dba`. Von Root gemeldete aktuelle Nachweise: reine Projektion einschließlich 90 Kamerafällen, 56 Native-130-Fälle und Unityadapter/Vertrag bestanden. Diese Suites wurden hier nicht nochmals ausgeführt; die laufende vollständige Produktionsprüfung und endgültige Live-Version bleiben Root-Abnahme.
