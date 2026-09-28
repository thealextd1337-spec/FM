# Spielerfrisuren – visuelle Beispiele

Status: Zehn Frisuren mit je einer frontalen Profil- und Jubelansicht sowie alle vier Jubelposen sind in der Vereinswelt eingebunden. [Die aktuelle Sprite-Vorschau](spieler-sprites-vorschau.html) zeigt die tatsächlichen Trikots, Nummern, Posen und Pixelwappen; [drei Beispielpaare](spieler-sprites-beispiele.svg) zeigen die Größen direkt. Nach Rückmeldung zur Bildqualität wurden die transparenten Vorlagen detaillierter neu gezeichnet und ihre Platzhalternummern entfernt. Die endgültige visuelle Freigabe durch den Nutzer steht aus.

Die überarbeiteten Bögen zeigen pro Zeile denselben fiktiven Spieler: links eine Frontalansicht mit Kopf und Oberkörper für das Profil, rechts eine statische Jubelpose für den Torbanner. Das grüne Trikot und die Nummer 9 dienen nur als Platzhalter. Nationalität, Hautton und Frisur sind nicht fest aneinander gebunden.

| Kennung | Frisur | Bildbogen und Zeile | Erkennbares Merkmal |
| --- | --- | --- | --- |
| `buzz` | Kurzrasur | [Bogen 1](spielerfrisuren-beispiele-frontal-1.png), 1 | Gleichmäßig sehr kurzes Haar |
| `side_part` | Seitenscheitel | Bogen 1, 2 | Geordneter Scheitel und seitlich fallende Front |
| `medium_waves` | Mittellange Wellen | Bogen 1, 3 | Locker gewellte Strähnen bis zu den Ohren |
| `round_afro` | Runder Afro | Bogen 1, 4 | Voluminöse, runde Silhouette |
| `cornrows` | Eng geflochtene Zöpfe | Bogen 1, 5 | Sichtbare Reihen am Kopf und kurze Zopfenden |
| `textured_crop` | Strukturierter Kurzhaarschnitt | [Bogen 2](spielerfrisuren-beispiele-frontal-2.png), 1 | Kurze strukturierte Oberseite und kürzere Seiten |
| `tight_curls` | Kurze Locken | Bogen 2, 2 | Dichte kleine Locken mit weicher Kontur |
| `short_locs` | Kurze Locs | Bogen 2, 3 | Einzelne herabhängende Strähnen |
| `long_tied` | Zurückgebundenes langes Haar | Bogen 2, 4 | Langes Haar mit gebundenem Hinterkopf |
| `bald` | Glatze | Bogen 2, 5 | Keine Haarfläche, klare Kopfform |

## Vier Jubelposen

Alle vier zur Freigabe stehenden Posen zeigen denselben Beispielspieler mit Kurzrasur und grünem Platzhaltertrikot. Sein Mund ist nur wenig geöffnet; eine schmale helle Zahnreihe bleibt sichtbar. Die Bildbögen zeigen ältere Frisur- und Haltungsreferenzen, die vier überarbeiteten Einzeldateien sind für die Posenfreigabe maßgeblich. [Mobile Banner-Vorschau](jubelposen-vorschau.html) zeigt sie in einem 375 Pixel breiten Beispiel mit Trikotnummer, Ergebnis und Wappenplatzhalter.

| Kennung | Haltung | Vorlage |
| --- | --- | --- |
| `double_fists` | Beide Fäuste oben | [Beide Fäuste oben](jubelpose-beide-faeuste-v2.png) |
| `two_fingers_up` | Beide Arme nach oben ausgestreckt, je ein Zeigefinger zeigt nach oben; freigegeben | [Zwei Zeigefinger hoch](jubelpose-zwei-zeigefinger-hoch.png) |
| `arms_wide` | Arme ausgebreitet | [Arme ausgebreitet](jubelpose-arme-weit-v2.png) |
| `fist_chest` | Faust an der Brust, anderer Arm zeigt nach außen | [Faust an der Brust](jubelpose-faust-brust-v2.png) |

Die vier Armhaltungen sind auch in der [Laufzeitvorschau](spieler-sprites-vorschau.html) auf einem 375 Pixel breiten Bildschirm unterscheidbar. Die endgültige Spielernummer wird im Torbanner über dem nummernlosen, transparenten Bildkörper gezeichnet. Die älteren Einzelbilder mit Nummer 9 bleiben hier als Entwürfe erhalten.

## Aktuelle Laufzeitbilder

- `dist/sprites/player-atlas-a.png` und `player-atlas-b.png`: je fünf Paare aus frontalem Porträt und Jubelpose mit zwei Fäusten, transparent und ohne Platzhalternummer.
- `dist/sprites/player-pose-arms-wide.png`, `player-pose-fist-chest.png` und `player-pose-two-fingers.png`: die drei weiteren detaillierten Körperposen, ebenfalls transparent und ohne Platzhalternummer. Der Laufzeit-Zeichner setzt den zur gespeicherten Frisur passenden Kopf ein.
- Die beiden Atlasbilder und die drei Einzelposen wurden mit dem eingebauten Bildgenerator aus den freigegebenen Vorlagen überarbeitet. Ziel der Nachbearbeitung: präzisere Gesichtszüge, Hände und Trikotfalten im 16-Bit-Stil, gleiche Pose und Figur, freie Hintergrundpixel und vollständig entfernte Nummer 9. Vereinsfarben, Muster, Hautton und echte Nummer werden erst beim Zeichnen der Spielansicht eingesetzt.

## Paletten für den späteren Sprite-Baukasten

- Hauttöne: sechs neutrale Basisstufen von hell bis dunkel; jeder Ton erhält im Sprite getrennte Licht- und Schattenpixel. Die Beispielbögen zeigen nur eine Auswahl dieser Stufen.
- Haarfarben: Schwarz, Dunkelbraun, Braun, Hellbraun, Blond, Rotbraun und Grau. Bei `bald` entfällt die Haarfarbe in der Darstellung.
- Die Aussehensziehung verwendet vorläufige, locker gewichtete Häufigkeiten nach Nationalität und Hautton. Jede Frisur und jeder Hautton bleibt für jede Nationalität erreichbar; die visuelle Kalibrierung folgt beim Sprite-Einbau.
- Für die Spielansicht müssen die Motive später auf feste kleine Rastergrößen übertragen und ohne weiche Kanten geprüft werden. Die Bildbögen sind Referenzen für Form und Wiedererkennbarkeit, keine fertige Laufzeit-Textur.

## Gesichter und Wiedererkennbarkeit

- Für jeden neuen Spieler wird ein Aussehensdatensatz gespeichert. Er umfasst Hautton, Haarfarbe, Frisur, Kopfform, Augen- und Brauenform, Nasenform, Mundform, gegebenenfalls Bart sowie die feste Jubelpose. Beide künftigen Sprite-Ansichten verwenden denselben Datensatz; die Pose ändert keine Identitätsmerkmale.
- Ein eigener deterministischer Zufallsstrom aus der Spieler-ID zieht die Merkmale unabhängig von Name, Fähigkeiten und Trikot. Nach Laden oder Transfer werden sie nicht neu ausgewürfelt. Die Nationalität gewichtet den Hautton locker; der gezogene Hautton gewichtet Haarfarbe und Frisur. Gesichtsform, Augen, Nase und Mund werden keiner Nationalität zugeordnet.
- Eine Kombination aus Gesichtskontur, Augen/Brauen, Nase, Mund, Bart und Frisur bildet die strukturelle Signatur; Farben zählen nicht. Bei der Erzeugung eines neuen Vereins- oder Nachwuchskaders werden gleiche Signaturen innerhalb dieser Gruppe erneut gezogen. Für den gesamten Spielerpool wird keine absolute Einzigartigkeit behauptet.
- Die Varianten müssen bei der tatsächlichen Profilgröße unterscheidbar sein. Zur Abnahme werden mindestens 100 neu erzeugte Porträts in Spielgröße betrachtet und Profil- und Jubelansicht derselben Spieler verglichen; bloße Farbunterschiede zählen nicht als ausreichende Gesichtsvariation.

Erstellt und für die Frontalansicht überarbeitet mit dem eingebauten Bildgenerator. Die ursprünglichen Bildbögen bleiben als Entwürfe erhalten.

## Bildgenerator-Prompts

**Bogen 1:**

> Produce ONE clean 16-bit pixel-art game sprite reference sheet for a fictional football manager. Transparent background. Exact layout: 5 horizontal rows and 2 equal columns, ten isolated sprites total, generous transparent gutters, no borders, no text or labels. Each row depicts the SAME fictional adult male footballer in two poses: left is a head-and-upper-chest portrait facing slightly left with neutral expression; right is a waist-up goal celebration with raised clenched fists, still image, facing slightly left. Match face, skin tone, hair, shirt, and number within each row. All characters wear a simple green home football jersey with white trim and a white number 9 integrated into the fabric; no club logo, no real team marks. Distinct hairstyle by row, top to bottom: very short buzz cut, neat side part, medium wavy hair, rounded natural afro, close cornrow braids. Use varied plausible skin tones and hair colors across rows. Crisp square pixels, chunky shadows, limited 16-bit palette, clear readable silhouettes at small game UI size, no anti-aliasing, no smooth gradients, no photorealism. Exactly ten sprites and no extra limbs or faces.

**Bogen 2:**

> Use the supplied first sprite sheet only as a style and grid reference. Create a second distinct sprite reference sheet. Exact 5 rows by 2 columns, ten isolated static sprites total, no text or labels. Each row shows the same adult male player identity in a calm head-and-upper-chest portrait on the left and a waist-up goal celebration with two raised clenched fists on the right. Match face, skin tone, shirt and hairstyle within the row. Simple green home jersey with white trim and integrated white number 9, no logo. Hairstyles top to bottom: short textured crop with faded sides, tight short curls, short natural locs, long straight hair tied back, completely bald scalp. Vary skin tones naturally. Match the reference's crisp square-pixel 1990s football game style and character scale. Transparent background, no scenery, glow or gradient, large transparent gutters. No extra faces or limbs; exactly five matched pairs.

**Frontal-Überarbeitung:** Beide ursprünglichen Bögen dienten einzeln als Vorlage. Nur die linke Spalte sollte zu mittigen Frontalporträts mit geradem Blick und sichtbaren Augen und Ohren werden. Frisur, Hautton, grünes Trikot und Paarung mit der Jubelpose sollten erhalten bleiben. Die Gesichter sollten sich in Kiefer, Wangen, Augenabstand, Brauen, Nase und Mund unterscheiden; Raster, rechte Spalte und transparenter Hintergrund möglichst unverändert bleiben.

**Weitere Jubelposen:** Der erste Bogen diente als Stil- und Identitätsreferenz. Drei separate Bildgenerator-Aufträge zeigten denselben kurzhaarigen Beispielspieler im grünen Trikot mit integrierter Nummer 9: einmal mit einem Arm hoch, einmal mit weit ausgebreiteten Armen und einmal mit einer Faust an der Brust und dem anderen Arm nach außen. Für alle galt: eine isolierte Halbfigur im 16-Bit-Stil, transparenter Hintergrund, keine Beschriftung und keine zusätzlichen Personen oder Gliedmaßen.

**Mundkorrektur:** Für jede der drei Einzelposen diente das jeweilige Bild als Editiervorlage; die Pose mit beiden Fäusten wurde aus der ersten Zeile des Bildbogens als Einzelbild erstellt. Die Korrektur verkleinerte den weit geöffneten dunklen Mund zu einem schmalen Jubelgrinsen mit sichtbaren oberen Zähnen. Pose, Kleidung, Nummer, Figur und Transparenz sollten erhalten bleiben. Die ursprünglichen Dateien bleiben als Entwürfe erhalten.

**Verworfene Arm-Pose:** Die Pose mit einem erhobenen Arm erhielt zwischenzeitlich statt der offenen Hand einen ausgestreckten Zeigefinger. Der Nutzer möchte die gesamte Pose ersetzen; diese Version bleibt nur als Entwurf erhalten.

**Verworfener Vorschlag Hand am Ohr:** Der Spieler hielt eine Hand ans Ohr und die andere an die Hüfte. Die Version bleibt als Entwurf erhalten.

**Verworfener Vorschlag beide Daumen hoch:** Beide Hände zeigten auf Brusthöhe mit den Daumen nach oben. Die Version bleibt als Entwurf erhalten.

**Freigegebene Pose zwei Zeigefinger hoch:** Beide Arme sind nach oben ausgestreckt. An jeder Hand zeigt genau ein Zeigefinger nach oben; die anderen Finger sind eingeklappt. Trikotnummer 9, das kleine Grinsen und der transparente Hintergrund bleiben sichtbar. Der erste Jubelbogen diente als Stil- und Identitätsreferenz.
