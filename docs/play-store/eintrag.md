# Google Play: Eintrag und Formulare (Entwurf)

Stand: 27. Oktober 2026. Entwurf für die erste Play-Version (Nutzerentscheidung vom 27. Oktober 2026: Spiel wie im Browser, ohne Account, Werbung und Kauf; [Android-App](../android-app.md)). Nichts davon ist eingereicht; es gibt noch kein Entwicklerkonto.

## Ablauf bis zur Veröffentlichung

1. **Nutzer:** Play-Console-Konto als Privatperson anlegen (einmalig 25 US-Dollar, Ausweis- und Gerätebestätigung mit einem echten Android-Handy).
2. **Erledigt am 27. Oktober 2026:** App angelegt, `app-release.aab` in einen geschlossenen Test geladen (Nutzer). Der Fingerabdruck des App-Signaturschlüssels von Google steht seit Release 138 in `dist/.well-known/assetlinks.json` ([Android-App](../android-app.md#bauen-und-signieren)). Offen sind die Formulare unten.
3. **Nutzer:** mindestens 12 Testpersonen mit Android-Handy und Google-Konto einladen. Sie müssen sich anmelden und 14 Tage ununterbrochen dabei bleiben. Zu empfehlen sind 15–20, falls jemand austritt.
4. Nach 14 Tagen den Produktionszugang beantragen: Rekrutierung, Rückmeldungen, Änderungen, Zielgruppe. Die Prüfung dauert meist bis zu 7 Tage.
5. Produktion freigeben. Die erste Version geht in den gewählten Ländern sofort an 100 %; eine Staffelung gibt es erst bei Updates.

## Store-Eintrag

- **App-Name (max. 30):** Doppel 6 – Fußballmanager
- **Kurzbeschreibung (max. 80):** Führe deinen Verein: Kader, Taktik, Transfers und Partien live in 2D und 3D.
- **Kategorie:** Spiele › Sport. **Kontakt:** alex@cakamper.at. **Website:** https://fussball.cakamper.at/
- **Datenschutzerklärung:** https://fussball.cakamper.at/datenschutz.html
- **Grafiken:** Symbol `icon-512.png`, Vorstellungsgrafik `feature-graphic.png` (1024 × 500), beide in diesem Ordner, erzeugt mit `work/generate-app-icons.cjs`. **Offen:** mindestens zwei Handy-Screenshots vom Pixel, etwa Vereinsbüro, Aufstellung, Transfermarkt und Live-Partie in 3D.

**Beschreibung:**

> Doppel 6 ist ein Fußballmanager für Kleinfeldfußball. Du übernimmst einen Verein und führst ihn durch Liga und Pokal.
>
> • Stelle deinen Kader zusammen: Spieler kaufen und verkaufen, Ablösen und Verträge verhandeln, Talente aus der Jugend holen.
> • Lege Formation, Rollen, Pressing und Passspiel fest und sieh deine Taktik live auf dem Platz, in 2D oder 3D.
> • Gegnerische Trainer reagieren während der Partie und stellen um, wenn sie unter Druck geraten.
> • Halte die Finanzen im Blick: Sponsoren, Gehälter, Prämien und Jugendbudget.
> • Spiele eine Karriere über viele Saisons und baue deine Vereinsgeschichte auf.
>
> Kostenlos, ohne Werbung und ohne Käufe. Deine Spielstände bleiben auf deinem Gerät. Deutsch und Englisch.

Englische Fassung für weitere Länder: bei Bedarf aus diesem Text übersetzen.

## Formulare

| Formular | Antwort |
| --- | --- |
| App-Zugriff | Alle Funktionen ohne Anmeldung nutzbar. |
| Werbung | Enthält keine Werbung. |
| Altersfreigabe (IARC) | Keine Gewalt, sexuellen Inhalte, Schimpfwörter, Drogen oder Glücksspiel. Keine Nutzerinteraktion, kein Standort, keine digitalen Käufe. Erwartet: USK 0 / PEGI 3. |
| Zielgruppe | **Offen, Nutzerentscheidung.** Laut Produktregeln gehören Kinder unter 14 dazu. Schließt die Zielgruppe Kinder unter 13 ein, gilt die Familienrichtlinie von Google. Ohne Werbung und Account ist sie erfüllbar; Werbung und Anmeldung müssen dann später dafür zugelassen sein. |
| Datensicherheit | Siehe unten. |
| Behörden-, Finanz-, Gesundheits- und Nachrichten-App | Nein. |

**Datensicherheit (Entwurf):**

- Die Vereinswelt sendet keine Daten; Spielstände bleiben lokal in Chrome.
- Nur der alte Spielmodus „Bisherige Sechserliga“ sendet nach aktivierter Freigabe „Spieldaten teilen“ eine Matchzusammenfassung an `/api/match.php`. Sie enthält Ergebnis, Taktik und Werte fiktiver Spieler, keine Namen und keine dauerhafte Kennung. Angabe: „App-Aktivität › Andere Aktionen“, optional, Zweck Analyse, nicht weitergegeben, Übertragung verschlüsselt (HTTPS). Eine Löschung einzelner Datensätze ist nicht möglich, weil sie keinem Gerät zuzuordnen sind; sie werden nach 90 Tagen gelöscht.
  - Einfachere Alternative: das Teilen in der App abschalten. Dann lautet die Antwort „Keine Daten erhoben“.
- Webserver-Protokolle des Hosters (IP-Adresse) dienen nur der Auslieferung. Ihre Speicherfrist bei World4You ist noch zu klären; das ist laut [Rechtsanalyse](../recht-datenschutz-release-analyse.md) ohnehin offen.
- Chrome und Google Play verarbeiten Daten nach Googles eigenen Bedingungen; das gehört nicht in diese Angaben.
