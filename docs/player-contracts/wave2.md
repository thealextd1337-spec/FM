# Welle 2: gemeinsamer Modulvertrag

Stand: 8. Oktober 2026. Umsetzung vom Nutzer freigegeben. Dieser Vertrag reserviert P01–P03; offene Balanceparameter bleiben ausdrücklich Prüfparameter. P04/P06 werden nicht vorweggenommen.

- Reine Module verwenden einen UMD-Export: `D6PlayerGeneration`, `D6EffectiveAbilities`, `D6Freshness`, `D6Development`, `D6Aging` im Browser, `module.exports` in Node. Keine globalen Spiel-/Storage-Wrapper.
- Fähigkeiten: `tec,pas,fin,tak,pos,spd,sta,air,gk,calm,ant,dec,str`. Dauerhafte Werte und Caps liegen in gleich benannten Objekten `skills` und `caps`; Werte intern 1–20, Talent intern 10–22. IDs bleiben `pid` im Weltadapter, `id` im reinen Vertragsobjekt.
- Erzeugungskontext: `id, age, mainPosition, kind, clubQuality, youthQuality`. Profilpositionen `gk/def/mid/att`. Ausgabe: `id,age,mainPosition,playablePositions,skills,caps,heightCm,preferredFoot,talent,recommendedRoles`. Fuß `right/left/both`. Rollenempfehlungen nur über injizierten P04-Rechner; ohne Rechner leer und als noch nicht erstellt behandeln.
- Produktionsoffene Verteilungen, mentale/Bewegungskurven und Belastungsteilung benötigen explizite Parameter. Messskripte dürfen gekennzeichnete Kandidaten enthalten. Keine unbestätigten Zahlen als unsichtbare Produktionsdefaults.
- P03-Einsatz: `id,worldId,seasonId,minutes,rating,skillWeights`. Bewertung und passende Verteilungsgewichte kommen vom späteren P06-/Rollenvertrag; P03 erfindet keine Notenformel. Deduplikation anhand Welt/Saison/Einsatz, Saisonminuten und schwache Serien bleiben beim Spieler und über Transfers/Laden erhalten.
- Alle Rechner verändern Eingaben nicht. Wiederholt gelieferte Ereignisse/Übergänge buchen nicht mehrfach. Zahlen, Caps, Talent und Ledger gehen niemals an UI-Renderer.
- Integration aktiviert zusätzliche Spielerdaten ausschließlich bei ausdrücklich neuen lokalen Prüfwelten. Bestehende Karrieren werden weder ergänzt noch umgerechnet. Sichtbare und kompakte Partien müssen für die spätere Produktionsaktivierung denselben Ereignis-/Notenvertrag erfüllen.

Die aktuelle Unity-Iteration bleibt eine reine Darstellung der maßgeblichen Matchsimulation. Schnelles offensives Spiel entsteht aus frühen Laufangeboten, zügigen Passentscheidungen und Anschlussläufen, nicht aus einer zweiten Unity-KI oder künstlich beschleunigten Ballkontakten.
