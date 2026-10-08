# Ballführung, Direktaktionen und Saisonprofil v127

Lokal umgesetzt am 5. Oktober 2026. Der reguläre Offline-Build wurde neu erstellt. Noch keine Veröffentlichung; der veröffentlichte Seitenfuß bleibt Prototyp 106. Die bestehenden 32 Meshy-Clips bleiben erhalten, keine neuen Credits verbraucht.

## Verhalten und Ursachen

- **Ruhigere Ballführung:** Die zusätzliche Dribbling-Fußkorrektur setzte zuvor schlagartig mit 65 % Stärke ein und endete nach einem kurzen Phasenfenster. Sie wird jetzt über eine halbe Schrittphase mit maximal 20 % Stärke sanft ein- und ausgeblendet. Vergleich am tatsächlichen Meshy-Rig mit Ballbesitz: bei 60 Hz sinken die maximalen Fußbeschleunigungen im geraden Lauf um 33–73 %, in der Kurve um 56 % und beim Start/Stopp um 35 %. Ein absichtlich sofortiger 90°-Richtungswechsel verbessert sich nur um 7 %. Kein Austausch der Laufclips oder Änderung des Bewegungstempos.
- **Direktpass und Direktschuss:** Ein flaches Zuspiel kann am tatsächlichen Kontakt ohne vorgeschaltete Annahme weitergespielt werden. Ein Kontakt über 0,8 m, Abseits, eine blockierte Anschlussbahn, ein zu kurzer Zuspielweg oder ein ungeeigneter Rückwärtswinkel verhindern die Direktaktion. Direktschüsse sind auf geeignete zentrale Positionen bis 18 m begrenzt; passende freie Mitspieler in deutlich besserer Torposition können bevorzugt werden. Technik, Passspiel/Abschluss, Stellungsspiel und Gegnerdruck beeinflussen die Wahl; Technik beeinflusst auch die Ausführungsqualität. Luftabschlüsse bleiben im bisherigen Ablauf.
- **Direktkontakt im bestehenden Rig:** In den letzten 0,25 Sekunden des Zuspiels ist bei erreichbarer Anschlussaktion eine Vorbereitung möglich. Sie geht aus der zuletzt gezeichneten Pose in den vorhandenen Meshy-Schussclip über. Der Fußkontakt wird am eingehenden Ballpunkt gebunden und im Ausklang gelöst. Die neue Flugbahn startet genau am eingehenden Kontaktpunkt; Passgutschrift, Assistkette, Schuss-/Keeperbilanz und erneute Abseitsprüfung verwenden die bestehenden Funktionen. Die Darstellung zieht keine Zufallszahlen und verändert keine Matchdaten.
- **Aggressiveres Herauslaufen:** Das bisherige Ziel war auf acht Meter Vorstoß begrenzt und blieb oft außerhalb der Zugriffsweite des Angreifers. Der Keeper schließt jetzt bis zur Strafraumtiefe von 16,5 m auf der Ball-Tor-Linie auf einen fähigkeitsabhängigen Abstand auf, höchstens 15,2 m vor die Torlinie. Sein normales Bewegungstempo und die vorhandene bodennahe Zugriffsanimation bleiben bestehen. Fangentscheidungen benötigen weiter echten Kontakt innerhalb von 0,8 m; ein Herauslaufen garantiert keinen Ballgewinn.
- **Dribbling ins Aus:** Auch ein kontrollierter Ball wird nach dem Bewegungsschritt geprüft. Die vollständige Kugel muss die Linie überqueren; der Radius entspricht dem sichtbaren Ball. Seitenlinie, Torlinie, letzte Ballberührung und die bestehenden Einwurf-/Eckball-/Abstoß-/Torabläufe gelten gleichermaßen. Ein Ballführer darf keinen Ausball durch seine nächste Aktion weiterspielen.
- **Einsatzstatistik im Spielerprofil:** Übersicht mit Einsätzen, Minuten, aktueller qualitativer Form, Tacklingquote, Schüssen und Toren der laufenden Saison über alle abgeschlossenen Pflichtspiele, einschließlich Einsätzen vor einem Vereinswechsel. Tacklingquote = gewonnene Tacklings im Stand und per Grätsche / erfasste Versuche; offensive Ballbehauptung und Luftduelle zählen nicht als Tacklingversuche. Neue Zähler werden beim regulären Matchabschluss einmalig in die Spielerhistorie übernommen. Alte Datensätze und nicht erfasste Simulationsaktionen werden nicht nachberechnet. Fehlende Schuss-/Tacklingwerte bleiben als nicht erfasst erkennbar; ohne Tacklingversuch steht „–“. Fähigkeiten bleiben ausschließlich Farbstufen.

## Geänderte Quellstellen

| Datei | Änderung |
| --- | --- |
| [player-user-ball-actions-v111.js](../../dist/player-user-ball-actions-v111.js) | Sanfte Dribblingberührung, Einblendung und Fußkontakt neuer Direktaktionen |
| [pitch-v55.js](../../dist/pitch-v55.js) | Kontaktentscheidung, wertabhängige Direktqualität und Ausprüfung |
| [pitch-motion-v102.js](../../dist/pitch-motion-v102.js) | Eingehender Kontaktpunkt, legale Vorbereitung und Direktpose |
| [game.js](../../dist/game.js) | Ausprüfung vor der nächsten Ballführeraktion |
| [world-backpedal-v108.js](../../dist/world-backpedal-v108.js) | Erreichbare Keeper-Zielpunkte für Angreifer im Strafraum |
| [pitch-v56.js](../../dist/pitch-v56.js) | Getrennte Tacklingversuche und Ballgewinne |
| [world-match-v64.js](../../dist/world-match-v64.js) | Prospektive Übernahme erfasster Tacklingzähler beim Abschluss |
| [world-views-v68.js](../../dist/world-views-v68.js) | Saisonstatistik in der Übersicht eigener und fremder Spieler |
| [i18n-v75.js](../../dist/i18n-v75.js) | Deutsche/englische Beschriftung und Direktaktionsmeldungen |

## Prüfungen und Nachweise

| Prüfung | Ergebnis |
| --- | --- |
| [Dribbling vorher](dribble-baseline-v127.json) / [nachher](dribble-qa-v127.json), 18 identische Sequenzen bei 30/60/120 Hz | Alle Beschleunigungsspitzen und Mittelwerte kleiner; gerade Läufe mindestens 25 % weniger Spitze. Laufphase kontinuierlich, Pause stabil, Matchdaten unverändert. |
| [Ballaktionen und Regeln](play-actions-qa-v127.json) | Direktpass/-schuss mit Kontaktpunkt ohne Annahme; entfernte/blockierte/unerreichbare/abseitsstehende und ungeeignet zurückspielende Empfänger führen keine Direktaktion aus. Beide Teams, alle vier Auslinien, vollständig/teilweise überquerter Ball geprüft. |
| Fähigkeitseinfluss in jeweils 500 kontrollierten Direktpass-/Direktschussszenen | Schwache Kombination 116, starke Kombination 300 Direktaktionen. Keine garantierte Direktaktion; dieselben Seedfolgen und übrigen Szenen. |
| [Native Direktaktionen](direct-visual-qa-v127.json), sechs Abläufe | Tatsächlicher gepufferter 3D-Renderer bei 30/60/120 Hz, Vorbereitungs- und Schuss-/Passclip, kein Flugstartversatz und keine Renderänderung an Matchdaten. Größter Fußschritt unter 0,40 m; Ballbewegung entspricht Pass-/Schusstempo. |
| Keeper-Herauslaufen | Zwölf zentrale/seitliche Strafraumszenen beider Teams mit erreichbarem Ziel und Kontakt; vier entfernte Szenen ohne Zugriff. Höchstens 0,063 m Bewegung pro 60-Hz-Schritt. Zusätzlich [Keeperregression](keeper-scenarios-qa-v127.json): starke Keeper gewinnen mehr Zugriffe und halten mehr der identischen Zielschüsse; keine Aufnahme aus Distanz. |
| [Saisonprofil](season-profile-qa-v127.json) | Desktop 1270 px und Mobil 390 px, DE/EN, Reiterwechsel, Saison-/Vereinswechselaggregation, JSON-Sicherung, fehlende Zähler und keine Doppelbuchung oder Altstandänderung. |
| [Laufen im Matchrenderer](running-qa-v127.json) | Freier Lauf und Ballführung bei 30/60/120 Hz und schwankenden Bildzeiten: keine falschen Bremsclips oder Renderänderungen. |
| [Meshy-Ballkontakte](ball-actions-qa-v127.json), [Fußbindung](locomotion-qa-v127.json) | Bestehende Pass-, Flanken-, Annahme-, Schuss-, Dribbling- und Keeperaktionen einschließlich Pause bestanden. |
| [Bodenspielszenen](ground-scenarios-qa-v127.json), [Ballphysik](ball-motion-qa-v127.json), [Aufsprung](air-bounce-qa-v127.json) | Distanz-/Fähigkeitseinfluss, Annahmefehler, sichere Keeper-Ausspiele, Abprallerdeckung, kurze Bodenpässe, Kontaktweiten, freie Rollrichtung und Energieverlust bestanden. Der alte Balltest mit fest erzwungener Landung nach 0,30 s wurde auf die bereits seit v124 geltende freie Flug-/Aufsprungdauer angepasst; alte Nachweise bleiben unverändert. |
| [Zwei vollständige 3D-Partien](warping-qa-v127.json) | 5.427 Physikschritte und 16.275 Renderbilder; keine nicht endlichen Zustände, sichtbaren Spieler-/Ball-Sprünge oder Renderänderungen. Unsichtbare reguläre Standardversetzungen werden getrennt geführt. |
| [Regulärer Offline-/2D-/3D-Vergleich](../../outputs/world3d-parity-v127.json) | Identischer Verlauf, Ergebnis, Ereignisse, Wechsel, Statistiken und Buchung in 2.739 Schritten; Pause, Halbzeit, Standards, Speicherablauf, Orientierung und Grafik-Rückfall geprüft. |

Reproduzieren: `node work/check-dribble-v127.cjs --baseline`, danach ohne `--baseline`; `check-play-actions-v127.cjs`, `check-direct-visual-v127.cjs`, `check-season-profile-v127.cjs`, `run-air-bounce-v127.cjs`. Die Regressionadapter `run-dribble-regression-v127.cjs` und `run-dribble-match-v127.cjs` erhalten ältere Prüfnachweise. Abschließende Hash-/Buildprüfung: `node work/verify-play-block-v127.cjs` und [Prüfmanifest](verification-v127.json).

Sichtbare Beispiele: [Saisonprofil mobil](../../outputs/season-profile-390-de-v127.png), [englisch](../../outputs/season-profile-390-en-v127.png). Technische Grenzen: Die kontrollierten Szenen und wenigen vollständigen Seeds sind keine neue Saison-Balancekalibrierung. Die Grundclips, langsames Gehen und extreme sofortige Wendemanöver haben weiter die Grenzen des vorhandenen Rigs. Das Profil verwendet die gespeicherte Form und berechnet keine neue Saisonform. Die neue Direktwahl kann zukünftige Matchausgänge verändern.
