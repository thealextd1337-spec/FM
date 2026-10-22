# Optionale Einführung und Erklärungen beim Spielstart – Plan

Stand: 22. Oktober 2026. Auf Nutzerauftrag umgesetzt in `dist/world-tutorial-v186.js` und `.css` auf Branch `feat/tutorial` (Worktree `work/tutorial`); Prüfung `work/check-tutorial.cjs`. Mit Release 134 veröffentlicht. Basis ist Release 133 (`work/release-r133`, Branch `release/r133`). Gilt nur für die Vereinswelt; Sechserliga, 3D-Hilfe und `freekickdemo/` gehören nicht zum Umfang.

## Ziel

Die Einführung führt neue Manager durch die erste Transferphase und das erste Spiel. Sie erklärt dabei die wichtigsten Funktionen: einen Spieler kaufen, verkaufen und aufstellen sowie das Vereinsbüro mit den News. Erfahrene Spieler werden nicht gestört. Spielstände und ihr Schema bleiben unverändert.

## Nutzerentscheidungen vom 22. Oktober 2026

1. Die Einführung ist im Prüfen-Schritt vorausgewählt, solange auf dem Gerät noch keine Karriere gespeichert ist; sonst ist sie abgewählt.
2. Umfang (zweite Präzisierung, ersetzt die zuvor geplanten Einzelhinweise je Phase): eine geführte Einführung durch die erste Transferphase und das erste Spiel, mit Kaufen, Verkaufen, Aufstellen und Vereinsbüro samt News.
3. Basis ist Release 133.

## Bausteine

**A. Erklärungen im Startablauf (immer verfügbar, nicht verpflichtend).** `v172RenderFlow()` in `world-expansion-interface-v172.js` erhält je Schritt ein aufklappbares „Was bedeutet das?“ (`<details>`). Im Prüfen-Schritt steht die Option „Einführung zeigen“.

**B. Geführte Einführung in Kapiteln.** Jedes Kapitel startet, wenn die Karriere seine Phase zum ersten Mal erreicht (erkannt über `v58State()` bzw. das geöffnete Match- oder Berichtsfenster). Innerhalb eines Kapitels zeigt ein Begleitfenster Schritt für Schritt, was zu tun ist:

- Das Begleitfenster ist **nicht modal**. Es sitzt mobil unten, am Desktop unten rechts, damit die Bedienung darunter frei bleibt; die Leitaktion oben wird nie verdeckt.
- Der gemeinte Knopf oder Bereich wird **hervorgehoben** (Umrandung und ins Bild scrollen), sofern er sichtbar ist. Liegt er in einem anderen Bereich, führt „Hinführen“ dorthin, indem das Begleitfenster den vorhandenen Navigationseintrag anklickt.
- Knöpfe: **Weiter**, **Zurück**, **Kapitel überspringen**, **Einführung beenden**.
- Nichts ist erzwungen. Kauf und Verkauf werden gezeigt und erklärt; der Manager muss keinen Spieler kaufen oder verkaufen. Führt er die gezeigte Aktion aus, geht das Begleitfenster selbst zum nächsten Schritt.

Kapitel (Texte in [tutorial-texte.md](tutorial-texte.md)):

1. Willkommen: Leitaktion, Navigation, Vereinsbüro mit News, Sponsorwahl
2. Jugendförderung
3. Transferphase: Spielersuche, Profil, Kaufen, Verkaufen, eigene Transferliste, Verträge, nächster Transfertag
4. Transferschluss
5. Aufstellung und Taktik
6. Erstes Spiel: Spielvorbereitung, Anpfiff, Pause mit Taktik und Wechseln, Frische, Halbzeit, Spielbericht, Abschluss
7. Vertrag verlängern: startet unabhängig von der Reihenfolge, sobald ein eigener Spieler im letzten Vertragsjahr verlängert werden kann, auch nach Kapitel 6 oder in einer späteren Saison; wartet, falls gerade ein anderes Kapitel läuft

**C. Hilfe & Einstellungen.** Neuer Abschnitt „Einführung“ in `ui-flutlicht/views/settings.js`: Einführung ein/aus, „Einführung neu starten“ für die aktuelle Karriere und ein aufklappbares Kurzglossar (Farbstufen, Stamm-/Einsatzposition, Frische, Transfertage, Gehälter, Crown/Horizon).

## Technik

- Ein neues Modul `world-tutorial-v<Fußversion>.js` mit eigener CSS-Datei, in `index.html` nach `world-expansion-interface-v172.js` und den `ui-flutlicht/*`-Skripten geladen und in den Dateilisten von `work/build.cjs` eingetragen.
- Startablauf: Es umhüllt `v172RenderFlow` (Erklärungen) und liest im `create`-Zweig die Option.
- Erkennen von Phasen und Aktionen: Das Spiel sendet keine eigenen Ereignisse. Das Modul umhüllt deshalb vorhandene globale Funktionen, wie es die Codebasis selbst tut:
  - Ansicht und Phase: `v61RenderCareer`, `v58State`
  - Saisonstart: `v66ChooseSponsor`, `v124SetYouthBudget`
  - Verträge: `v66Renew`, `v66OpenRenewDialog`; Auslöser für Kapitel 7 über `v66Contract` und `v66RenewalWindow` der eigenen Spieler
  - Kaufen: `v72Start`, `v72SubmitFee`, `v72SubmitContract`, `v66MakeBid`
  - Verkaufen: `v72ListOwn`, `v72SellerRespond`, `v66RespondBid`
  - Transfertag: `v66RunMarketDay`, `v72ShowResults`
  - Aufstellung: `v64CareerCommit`
  - Spiel: `v61AdvanceCareer`, `v65Pause`, `v65Resume`, `v65ShowPostMatch`
- Ziele im Bild über vorhandene Selektoren, etwa `.fl-topbar [data-fl-lead]`, `[data-fl-route="transfers"]`, `[data-fl-section-tab="search"]`, `.v66-player-pick`, `[data-v72-list-own]`, `[data-v64-career-slot]`, `#v65-pause-tabs`, `.fl-overview-office`, `#v170-office`. Fehlt ein Ziel, bleibt der Schritt ohne Hervorhebung lesbar.
- Zustand nur in localStorage `doppel6.tutorial` als `{enabled, careerId, chapter, step, done:[…]}`, mit try/catch wie die übrigen Einstellungen. Nicht im Spielstand, weil `v61ValidateCareer` unbekannte Felder ablehnt und Bestände nicht umgerechnet werden. Die Einführung gehört zu der Karriere, für die sie gewählt wurde.
- Bestehende Karrieren zeigen keine Einführung, solange sie nicht in den Einstellungen neu gestartet wird.
- Texte auf Deutsch und Englisch über `v170Text(de,en)`. Keine Fähigkeitszahlen oder Entwicklungspunkte.
- Zugänglichkeit: Das Begleitfenster ist eine beschriftete Region mit `aria-live="polite"`; Weiter/Zurück per Tastatur; Esc schließt das Kapitel. Die Hervorhebung hängt nicht allein an der Farbe. Mobil bei 390 px Breite ohne Überlauf.

## Ablauf

1. Texte (DE/EN) schreiben und vom Nutzer freigeben lassen: Entwurf in [tutorial-texte.md](tutorial-texte.md).
2. Modul mit Startablauf-Erklärungen und Begleitfenster.
3. Kapitel einzeln anschließen und je Kapitel im Browser prüfen.
4. Einstellungsabschnitt C.
5. Prüfskript `work/check-tutorial.cjs` nach dem Muster von `work/check-career-start-defaults.cjs`:
   - Neue Karriere mit Einführung: Kapitel 1 startet nach dem Speichern.
   - Jedes Kapitel startet in seiner Phase; jedes Ziel ist im jeweiligen Schritt vorhanden und sichtbar.
   - Gebot abgeben, Spieler zum Verkauf anbieten, Vertragsangebot senden und Spieler aufstellen schalten den Schritt weiter.
   - Kapitel 7 startet bei einem auslaufenden Vertrag, auch nach Kapitel 6, und unterbricht kein laufendes Kapitel.
   - Fortschritt bleibt nach Neuladen erhalten.
   - „Einführung beenden“, „Kapitel überspringen“ und abgewählte Einführung zeigen nichts mehr.
   - Eine bestehende Karriere bleibt ohne Einführung.
   - Voreinstellung mit und ohne vorhandene Karriere stimmt.
   - Englisch, Desktop und 390 px Breite; Begleitfenster verdeckt weder Leitaktion noch Ziel.
6. `docs/product.md`, `docs/CHANGELOG.md`, Fußversion anheben, Quelle, Build und Live-Seite abgleichen.

## Nicht im Umfang

Übungsmatch, Videos, Einführung für spätere Saisonphasen (Saisonende, Finanzabschluss, Stellenangebote; ausgenommen Kapitel 7), Elfmeterschießen, Änderungen an der 3D-Hilfe, Sechserliga.

## Befunde aus Release 133

- Der Vereinsschritt zeigt nur Wappen, Name und Stadt; die Erklärtexte versprechen keine Stärkeangabe.
- Das Vereinsbüro ist kein eigener Reiter. Es steht auf der Übersicht: Karte „Im Vereinsbüro“ (`.fl-overview-office`, offene Aufgaben) und darunter „Vereinsbüro“ mit News (`details#v170-office`, nur lesen). Die Reiterleiste aus v172 wird für neue Karrieren nicht angezeigt.
- In einer frischen Karriere ist der News-Bereich vermutlich leer („Noch keine Meilensteine erfasst.“); der Text erklärt deshalb, was dort erscheinen wird.
- Aufstellen geht nur durch Ziehen. Ein Tipp markiert nur; mobil werden Bankspieler seitlich herausgewischt.
- „Nächstes Spiel vorbereiten“ öffnet erst eine Spielvorbereitung; „Match starten“ beginnt das Live-Spiel. Die Frische ist in der Pause als Balken sichtbar.
- An der Oberfläche laufen derzeit keine anderen Änderungen; Konflikte mit den SI- und Ballphysik-Zweigen sind nicht zu erwarten.
- Vertragsverlängerung: nur im letzten Vertragsjahr, während der ganzen Saison außer Sponsorwahl und nach Saisonende. Der Spieler antwortet sofort mit Zusage oder Gegenforderung. Zwei Angebote je Runde, danach höchstens eine zweite Runde 60–90 Tage später (`world-economy-v66.js`: `v66Renew`, `v66RenewalWindow`).
- Nicht geprüft: 3D-/Unity-Liveansicht mit Begleitfenster und die englischen Navigationsnamen.
