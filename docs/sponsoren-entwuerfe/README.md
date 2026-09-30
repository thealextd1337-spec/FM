# Sponsoren – nationale Gestaltungsmuster

Die [interaktive Vorschau](index.html) zeigt je Vereinsland sechs eigene fiktive Marken mit Beispielangeboten und einer auswählbaren Werbebande. Ein Klick oder Tipp auf ein Logo zeigt die Marke auf der Bande; die Logos lassen sich auch per Tab und Eingabetaste auswählen. Die zusätzlichen Textbuttons unter den Karten entfallen. Die Vorschau lässt sich ohne Server öffnen. Deutsch und Englisch sowie die sechs Vereinsländer sind umschaltbar. Ein Länderwechsel zeigt andere Namen, Bildzeichen und Wortmarken. Die Auswahl gilt nur für die Vorschau.

Die folgenden sechs Entwürfe gehören zu Deutschland. Der [vollständige Katalog](katalog.md) und die [Logoübersicht aller sechs Länder](uebersicht.html) zeigen alle 36 Marken.

| Wortmarke (SVG) | Bildzeichen (SVG) | Branche | Gestaltung |
| --- | --- | --- | --- |
| [Voltwerk](voltwerk.svg) | [Blitz](voltwerk-zeichen.svg) | Energie | Kantiger, mehrteiliger Blitz und kräftige, geneigte Wortmarke. |
| [Bergquell](bergquell.svg) | [Berg und Tropfen](bergquell-zeichen.svg) | Getränke | Zwei Bergspitzen, Quelltropfen und Serifenschrift. |
| [Nordlauf](nordlauf.svg) | [Laufzeichen](nordlauf-zeichen.svg) | Sportartikel | Geometrisches Laufzeichen und dynamische Kleinschreibung. |
| [Atlas Reisen](atlas-reisen.svg) | [Kompass](atlas-reisen-zeichen.svg) | Reisen | Vierstrahliger Kompass und weit gesetzte Buchstaben. |
| [Korn & Kruste](korn-kruste.svg) | [Ähre](korn-kruste-zeichen.svg) | Lebensmittel | Dreifarbige Ähre und zweizeilige, handwerklich wirkende Wortmarke. |
| [Signalwerk](signalwerk.svg) | [Signalbalken](signalwerk-zeichen.svg) | Kommunikation | Drei ansteigende Signalbalken und ruhige, technische Schrift. |

Jede Marke hat eine vollständige SVG-Wortmarke (`<marke>.svg`) und ein kompaktes Bildzeichen (`<marke>-zeichen.svg`). Die exportierten SVGs zeigen jeweils die Palette ihres Vereinslands und einen passenden hellen oder dunklen Hintergrund. Jedes Land besitzt eigene Motive; die Logos werden nicht nur umgefärbt. Für weiße Landesfarben verwendet sie einen dunklen Hintergrund. Neutrale Schriftfarben sorgen für Lesbarkeit. Kleine Wortmarken müssen nicht vollständig lesbar sein; das Bildzeichen trägt dort die Wiedererkennung.

Die 36 Namen sind Gestaltungsideen mit fester Länderzuordnung innerhalb der Vorschau. Die Landesfarben beziehen sich auf das Vereinsland. Die Oberflächensprache übersetzt Angebotsbedingungen und Beschriftungen, nicht die nationalen Markennamen. Die sechs Branchen pro Land erleichtern den direkten Gestaltungsvergleich; daraus entstehen keine festen Risikoklassen.

Fixum, Einzelboni und Höchstsumme sind getrennt. Die Zahlen sind illustrative Angebote für eine Ligasaison und keine neue Wirtschaftskalibrierung. Im Spiel bleiben drei Angebote, eine Saison Laufzeit und höchstens zwei Ziele vorgesehen. Die Vorschau zeigt jeweils alle sechs Marken des gewählten Landes zum direkten Vergleich. Die Beispielbeträge bleiben zwischen den Ländern vergleichbar; der Länderwechsel ist noch keine Wirtschaftskalibrierung.

Die 36 Marken sind mit Prototyp 97 in die Vereinswelt übernommen. Das Spiel verwendet weiterhin seine bisherige Wirtschaftskalibrierung; die Beispielbeträge dieser Vorschau gelten nicht als Spielwerte. Neue Saisonangebote erhalten nationale Marken. Bestehende Angebote und Sponsorverträge werden nicht umbenannt oder neu berechnet. Angebotskarten zeigen Wortmarken, kleine Werbebanden kompakte Bildzeichen mit dem Sponsorennamen. SVG-Texte verwenden lokale Schriften; die Bildzeichen bestehen aus festen Vektorpfaden.

Erzeugung: `node work/generate-sponsor-preview.cjs`. Die zusätzlichen nationalen Motive stehen in `work/sponsor-country-concepts.cjs`. Visuelle Abnahme umfasst Desktop, Mobilgeräte, Landesfarben, deutsche und englische Beschriftungen sowie die Auswahl der Werbebande. Ein [Standbild der sechs Angebote](sponsoren-breit.png) und eine [mobile Ansicht](sponsoren-mobil.png) ergänzen die Vorschau.

Browserprüfung: alle 36 Marken bei 1360, 390 und 320 Pixeln Breite, Länderwechsel mit neuer Auswahl, unveränderte nationale Namen bei DE/EN-Wechsel, Logoauswahl per Klick und Tastatur, keine abgeschnittenen SVG-Texte und keine Browserfehler. Alle 72 SVG-Dateien wurden als XML geprüft.
