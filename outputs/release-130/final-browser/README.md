# Schlussprüfung des tatsächlichen Release-130-Pakets

Geprüft wurde ausschließlich der vom Root-Agenten gestartete Paketserver auf `http://127.0.0.1:4548/`, mit eigenen isolierten Chrome-/Edge-Profilen. Bestehende Nutzertabs und die alten Testserver wurden nicht geöffnet oder verändert. Keine Source-, Build- oder Veröffentlichungsdatei wurde geändert; alle eigenen Browser wurden anschließend geschlossen.

HTML: `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db`. Unity-Quelle: `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82`. Manifest: `3262df2786a265c40c9fefb8bd748206120e229bb268d71c954d5fb9da7315a0`. Alle neun per HTTP ausgelieferten Dateien stimmen vor und nach den Prüfungen mit dem eingefrorenen Paket überein.

- `package-checks.json`: acht bestandene Vertragsprüfungen. Version 130; 192 Vereine und zwölf Länder; elf Profis, zwei Keeper und 6/3/2-Vertragsrollen; zwölf echte native Unity-Akteure mit vollständigem ACK; unveränderte Pause-/P02-Daten bei Fremdmeldungen; Keeper 180/Pace 119; produktiver Framepump in Parent und eigener Unity-Laufzeit ohne lokalen Opt-in-Code. Hier wird SwiftShader eingesetzt, keine GPU-Leistungszusage.
- `roster-checks.json`: beide tatsächlichen mobilen Taktikansichten mit 13 Spielern bei 390×844, Außen→Bank→Feld über vorhandene Auswahlaktionen, reale Speichercontroller, feste Kadergrenzen, qualitative Positionslegende und kein horizontaler Überlauf. Die umfassenden Drag-/Touch-/Keyboard-Belege aus der vorherigen Implementierung werden nicht erneut beansprucht.
- `parity.json`: vollständige native 2D-/Unity-Partien mit je 3037 Schritten, validierter abgeschlossener Karriere, identischem Digest `a6d98d83` und vollständiger Nutzdaten-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`. Der tatsächliche aktuelle `work/platform/qa/unity-integration-v160.js` führt identische feste native Schritte aus; Bild-Sampling beschleunigt keine Animation als Performancebehauptung.
- `lifecycle.json`: zehn bestandene Prüfungen mit echter Navigation nach `/away.html` und Zurück. Chrome hat für das originale Matchdokument tatsächlich `pageshow.persisted === true` geliefert. Der native pausierte Zustand blieb im Speicher erhalten; Uhr, Ergebnis, Events und P02 waren bytegleich. Der echte Unity-Renderzähler lief vorher und nachher weiter. In 2D bleibt die produktive Timerfallback-Zahl konstant, die Rückkehr nach 3D erhält die Pause. Keine synthetischen Pagehide-/Pageshow-Ereignisse wurden ausgelöst.

`lifecycle-navigation-wait-failure.json` ist ein historischer Prüfladerfehler: Zurück navigierte tatsächlich, aber der erste Lauf wartete bei BFCache auf ein neues `DOMContentLoaded`. Der korrigierte Prüflader wartet auf Navigations-Commit und tatsächliches `pageshow`; der Schlusslauf besteht. Die Eventliste erfasst auch eigene gleichoriginige Unterframes; `current` und `bfcacheRestored` beziehen sich auf das tatsächliche zurückgekehrte Matchdokument.

Screenshots: `package-match.png`, `roster-career.png`, `roster-prematch.png` und beide `roster-*-extras.png`. Die 3D-Aufnahme zeigt die native Pause während des unveränderten Anstoß-Countdowns; sie ist kein Live-Bewegungs- oder Performancebeleg. Die drei relevanten Ausschnitte wurden visuell geprüft.

## Wiederholung

Vom Release-130-Repository-Root mit Node 20+ (lokal Node 24.19.0) und der dokumentierten installierten Playwright-Laufzeit:

```sh
node outputs/release-130/final-browser/check-inputs.cjs
node outputs/release-130/final-browser/check-package.cjs
node outputs/release-130/final-browser/check-roster.cjs
node outputs/release-130/final-browser/check-parity.cjs
node outputs/release-130/final-browser/check-lifecycle.cjs
node outputs/release-130/final-browser/check-inputs.cjs --after
```

Der Server muss das hashgebundene Release-Paket auf 4548 ausliefern. Root besitzt Server, Source, Build und Veröffentlichung. `summary.json` bindet aktuelle Prüflader, Berichte, Helper und Bilder per SHA256.

Dies ist eine lokale Schlussprüfung des tatsächlichen Produktionspakets, keine Live- oder physische Android-Abnahme. Renderzähler belegen Schleifenfortschritt und keine GPU-Frametime/FPS-Leistung. BFCache-Verhalten ist für diesen Chrome-Lauf belegt; keine Behauptung für alle Browser. Kontakt-Ruckler und die dokumentierten historischen 3D-Grenzen bleiben offen.
