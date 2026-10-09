# Matchanzeigen und Rollenauswahl · v119

Die Rückschau liegt als schwebende Leiste über dem Spielfeld. Bei 568–1920 Pixel Breite misst sie 54 Pixel Höhe und höchstens 680 Pixel Breite. Der schmale 320-Pixel-Fallback hat zwei Zeilen und 102 Pixel Höhe. Alle Bedienziele bleiben mindestens 44 Pixel hoch. Die aufgezeichneten Ereignisse öffnen über „⋮“ in einem begrenzten, scrollbar zugänglichen Menü. Ereignissprung, Schieberegler, Abspielen/Pause und Live verwenden die vorhandenen Controller. Escape schließt das Menü; Tastaturfokus hält die Bedienung sichtbar.

Der Regler beschreibt über Tooltip und `aria-description` den tatsächlichen Beginn der Sitzungsaufzeichnung. Die vollständige Rückschau umfasst die aktuell aufgezeichnete Browser-Sitzung. Nach einem Neuladen entsteht eine neue Aufzeichnung. Die kurze automatische Torwiederholung ist davon unabhängig. Es gibt keine gespeicherte Rückschau und keine rückwirkende Berechnung von Spielständen.

Im Vollbild wachsen Ergebnis, Zeit und Wettbewerbszeile mit dem Viewport: Ergebnistext 21–30 Pixel, Zeit 15–22 Pixel. Die Anzeige reserviert Platz für die oberen Darstellungs- und Taktikbuttons. „Taktik“ verlässt Vollbild und benutzt die vorhandene Pause mit dem Ziel Taktikansicht. Während Flugball oder Grätsche bleibt die native Pausenanforderung bis zur sicheren Unterbrechung bestehen. In einer bereits pausierten Partie öffnet der Button direkt die vorhandene Übersicht.

## Wettbewerbsidentität

Die aktuelle Vereinswelt erzeugt **13 Wettbewerbe pro Saison**: sechs nationale Ligen, sechs nationale Pokale und einen Europacup. Der TV-Stil folgt dem tatsächlichen Wettbewerb und reist mit dem vergänglichen Rückschaubild. Vereins- und Trikotfarben bestimmen diesen Stil nicht. Die Teamkanten behalten zusätzlich ihre tatsächlichen Trikotfarben.

| Land / Wettbewerb | Ligakennung | Pokalkennung |
| --- | --- | --- |
| Deutschland | Gold, obere Doppellinie | Gold, umrandete Pokalkapsel |
| England | Flieder, Blockform | Flieder, Pokalkapsel |
| Spanien | Apricot, breite Seitenkante und Kursivschrift | Apricot, Pokalkapsel |
| Italien | Hellblau, untere Linie | Hellblau, Pokalkapsel |
| Frankreich | Hellgelbgrün, versetzte Überschrift | Hellgelbgrün, Pokalkapsel |
| Portugal | Mint, Doppelkante und Serifenschrift | Mint, Pokalkapsel |
| Europacup | Violettblau, Stern und eigene Rahmenform | — |

Unbekannte Wettbewerbsländer/-typen erhalten eine neutrale graue Kennung. Alte vergängliche Bilder ohne Wettbewerbsmetadaten bleiben mit dieser Kennung lesbar. Es gibt derzeit nur eine Liga pro Land, ohne gespeichertes Divisionsfeld oder Auf-/Abstieg. Die Seitenleiste ermittelt den aktuellen Ligawettbewerb anhand der Vereinszugehörigkeit. Kanonische Wettbewerbe `S< Saison >:< Land >:LEAGUE` sind Liga 1. Ein vorhandenes positives ganzzahliges `competition.division` wird bei der Darstellung übernommen; die QA prüft diese Projektion mit 2 und 3. Dadurch wird keine zweite Liga oder Aufstiegsregel eingeführt und kein Spielstand verändert.

Das Torbanner nennt den tatsächlichen Verein unter dessen Wappen. Die SVG-Wortmarke eines bekannten Sponsors steht ohne zusätzlich wiederholten Namen oder Land. Zugänglicher Sponsorname, Fixum, Bonusziele und Vertragsinformationen bleiben erhalten. Bei einem alten Sponsor ohne bekannte Wortmarke bleibt ein lesbarer Name stehen.

## Gemeinsame Rollenauswahl

`player-tactics-ui.js` erzeugt in dauerhaftem Matchplan, Spielvorbereitung und Pause denselben farbigen Auswahlkasten. Jede angebotene Rolle zeigt die tatsächliche projizierte Eignungsstufe und qualitative Beschriftung. Numerische Fähigkeits-, Eignungs- und Entwicklungswerte werden weder sichtbar noch in zugänglichen Beschriftungen ergänzt.

Die Auswahl liegt über der Oberfläche in einem nativen Popover und bleibt auf kleinen Bildschirmen scrollbar. Pfeiltasten, Home/End, Anfangsbuchstabe, Enter/Leertaste, Escape, Tab und Touch bedienen sie. Die darunterliegende native Auswahl bleibt die Änderungsbrücke zum bestehenden Rollen-Controller; Speichern, Undo und Phasenfreigabe bleiben dort. Nach einem Neuzeichnen führt dessen bestehende Fokuswiederherstellung zum sichtbaren Auslöser. Browser ohne Popover-Unterstützung behalten die native Auswahl mit qualitativen Optionsbeschriftungen; deren Systemmenü kann Farbpunkte nicht zuverlässig darstellen.

## Reproduzierbare Prüfung

Vom Worktree-Stamm aus mit dem vorhandenen Node 24 und dem installierten isolierten Edge-Workflow:

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/check-match-overlay-v119.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/platform/qa/check-tactics-wave4.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/test-player-ui-projection.cjs
```

Der erneuerte Wave-4-Runner schreibt ausschließlich nach `outputs/3d-quality/role-picker-v119/wave4`; frühere Evidenz bleibt erhalten. Er behält die ursprünglichen zwölf Breiten-/Theme-/Sprachvarianten und die Prüfungen von Projektion, Profil, dauerhaftem Plan, Vorbereitung, Pause und Undo. Hinzu kommen echte farbige Optionslisten, Keyboard und ein privater Touch-Kontext.

Die Overlay-QA verwendet die echte Quell-App auf einem eigenen Loopback-Server, reale Vereins-/Wettbewerbsdaten und eine bewusst begrenzte Bilderaufzeichnungs-Fixture. Sie prüft 1920×1080, 1280×720, 931×448, 844×390, 568×320 und den 320-Pixel-Fallback in DE/EN, alle fünf Ereignistypen, Rückschau ohne Änderung der nativen Partie, Live-Rückkehr, 13 gerenderte TV-Kennungen, Sponsor-/Vereinsidentität und die native Pausenanforderung beim Taktikbutton. Berichte und Bildschirmbilder liegen in `outputs/3d-quality/match-overlay-v119`.

Diese UI-Fixtures belegen keine Unity-Kameraposition, tatsächlichen Unity-Renderdurchsatz oder Android-Hardwareabnahme. Die separate 3D-/Geräteprüfung bleibt dafür erforderlich.
