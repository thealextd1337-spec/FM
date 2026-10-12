# Fable: korrigierte Folgeanalyse

Claude Fable 5.1, zweite Analyse nach den Messläufen, fachlich präzisierte Abschlussfassung. Vorschläge sind nicht umgesetzt.

**Korrigierte Reviewrunde 2 (Lesebefund, keine Änderungen vorgenommen)**

**Korrekturen zu meinen R2-Aussagen**

1. Die „weiterhin über 70 % Topsiege“-Baseline war falsch. Iststand ist 49,8 % Topsiege, 39,6 % Remis, 10,6 % Außenseitersiege; der Heimspiegel liegt bei 49 %. Es gibt keine beschlossene Siegquote. Die Qualitätswirkung bleibt ein Vergleichsbefund: Top–Unten muss nach jeder Änderung deutlich asymmetrischer bleiben als Top–Top und Schwach–Schwach. Ich fordere keine Zielquote.
2. Meine Effektrechnung war überhöht. Bei rund 12 Schüssen und etwa 45 % aufs Tor ergeben 5 Prozentpunkte bedingte Torwahrscheinlichkeit nur ≈0,27 Zusatztore pro Spiel, nicht 0,5. Eine Basisanhebung allein hebt Schwach–Schwach von 1,03 nicht garantiert auf 1,5. Der Korridor 1,5–2,2 ist unbeschlossen und optional. Der Qualitätsslope 0,012 hält wegen Clamp 0,08/0,48 und Zufallsverläufen keine mathematisch identischen Siegabstände.
3. „Neutralzwillinge müssen sich unterscheiden“ gilt nicht pro Paar. Ein Heimterm von 0,002 auf einer Aktionschance von 0,003–0,045 lässt viele identische Scores zu. Benötigt ist ein Trend in einer großen Spiegelstichprobe, kein 100/100-Differenzgate.
4. shotDifficulty hängt bereits von Distanz (/35), Druck (×0,3) und Winkel (×0,15) ab. Gleichförmigkeit wurde nicht gemessen; ein Positionsmodell ist nachrangige Hypothese, keine belegte Ursache.
5. Der Marker shotBalanceRevision=119 wird nur im Initialize gesetzt und beim Lesen per Vergleich ausgewertet. Laufende Partien mit alter Kennung bleiben korrekt im Altzweig. Keine Migration vorschlagen.

**Vorschlag 1 (Priorität hoch): Torverwertung isoliert testen**
Erster Schritt: nur die Basis in der Torformel variieren, Kandidaten 0,30 und 0,32, Deckel unverändert 0,48; getrennter Lauf mit Deckel 0,52 bei Basis 0,27. Messung: dieselben Matrixserien (Top–Top, Schwach–Schwach, Top–Unten, Liga–Pokal) mit 5 gemeinsamen Seeds, Kennzahlen Tore/Spiel, 0:0-Anteil, Verwertung je Seite, Schüsse unverändert im 10–16-Band. Gegencheck: Top–Unten-Asymmetrie darf nicht einbrechen, Pokalclubs dürfen den 10-%-Abstand nicht kompensieren. Grenze: 5 Seeds liefern Richtung, keine Signifikanz. Neue Werte nur unter neuer Revisionskennung bei Spielerzeugung.

**Vorschlag 2 (Priorität mittel): Heimbonus verlegen, getrennt testen**
Befund: Der Heimterm liegt in der v64-Aktionschance, der v155-Zweig nutzt ihn nicht. Erster Schritt: einen Heim/Neutral-Faktor in v155 an Pass- oder Schusschance anlegen, relativ +2–3 % (Kandidat, unbeschlossen), nicht additiv im alten Pfad. Abnahme: exakte Replays bei gleichem Seed; Spiegelstichprobe ≥500 Zwillingspaare, Trend Heimtore minus Auswärtstore und Heimsiegquote neutral versus Heim. Kein Differenzgate pro Paar. Grenze: kleine Effekthöhe erwartet; Schüsse im Band halten.

**Vorschlag 3 (Priorität niedrig): Überlappung belassen, A3/4 nicht nachjustieren**
Überlappung 73/133/94 zeigt beidseitige Siege; das Produkt verlangt kein 50:50. Erster Schritt: nur dokumentieren. Optionaler Kandidat +1–2 % A3/4 bleibt zurückgestellt, bis Vorschlag 1 die Torbasis fixiert hat, da jede Verwertungsänderung die Überlappung mitverschiebt. Top2-Trennung und Pokal-10 %-Regel bleiben unangetastet.

**Vorschlag 4 (Hypothese, nachrangig): Difficulty-Verteilung messen**
Erster Schritt: Histogramm von shotDifficulty, Distanz und Druck je Schuss aus 500 Partien erzeugen, ohne Formeländerung. Nur wenn die Verteilung sichtbar gestaucht ist, folgt ein Modellvorschlag.

**Verteilungsgrenze:** Alle Werte sind Kandidaten. Alte Spielstände werden nicht umgerechnet; Fähigkeiten bleiben Farbstufen. Keine Realfußball-Benchmarks als Zielgröße.

