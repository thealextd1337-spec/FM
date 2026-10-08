# P05 – reine Rollenoberfläche im Flutlicht-Design

Die neuen Dateien `dist/player-tactics-ui.js` und `dist/player-tactics-ui.css` ergänzen die gewählte Flutlicht-Oberfläche. Der Renderer besitzt keinen eigenen Taktikzustand. Rollenwahl, Ausrichtung, Speichern/Laden, Verschieben, Tausch, Einwechslung und Partieverlauf bleiben im gemeinsamen Vor-/Halbzeitcontroller des Integrators. Die drei zurückgestellten UI-Besichtigungspunkte sind hiervon unabhängig und bleiben offen.

## Bereinigte Eingabe

`D6PlayerTacticsUI` ist UMD/CommonJS und akzeptiert ausschließlich bereinigte Anzeigeprojektionen:

```js
{
  pid, name,
  skills: [{key, label, band, colorLabel, important}],
  recommendations: [{position, roleId, label, band, colorLabel, best}],
  assignment: {position, roleId, label, orientation},
  allowedRoles: [{id, label, band, colorLabel}],
  zone: {x, y, width, height}
}
```

Die Renderer lesen einzelne bekannte Felder und reichen keine internen Objekte durch. `band` akzeptiert nur `violetgray`, `bluegray`, `yellow`, `orange`, `pink`; unbekannte Werte ergeben `unknown`. Farbtexte akzeptieren die vorhandenen DE-/EN-Namen je tatsächlicher Farbstufe: Violettgrau/Violet grey, Blaugrau/Blue grey, Gelb/Yellow, Orange und Pink. Ein als Farbtext gelieferter Rohscore wird verworfen. Talent, Caps, interne Eignung, Routine und rohe Fähigkeitswerte werden weder in sichtbaren Text noch Titel, ARIA, Datenattribute oder Klassen übernommen.

`labels` enthält lokalisierte Texte: `roles`, `role`, `orientation`, `defensive`, `neutral`, `offensive`, `importantSkills`, `suitability`, `best`, `zone`, `zoneHint`, `empty`, `skillHint`; optional `positions:{gk,def,mid,att}` für die Profilgruppierung. Rollen- und Fähigkeitsnamen sowie Farbtexte liefert der Integrator bereits übersetzt. Alle Text-/Identitätsfelder werden als Text ausgegeben und für HTML escaped.

## Renderer und Bedienvertrag

- `renderProfileRoles(ui, labels)` zeigt die feste Empfehlungsliste nach Profilposition gruppiert, mit tatsächlichem Eignungsfarbpunkt und dezentem Highlight der besten Rolle. Es fügt keine Empfehlung hinzu. Relevante Fähigkeiten aus `skills` mit `important:true` erhalten einen kleinen SVG-Haken und einen zugänglichen Hinweis; ihre tatsächliche Farbstufe bleibt unverändert.
- `renderTacticRoleControl(ui, labels)` zeigt die **vollständige zulässige Rollenmenge** aus `allowedRoles`, einschließlich nicht empfohlener oder schlecht geeigneter Rollen. Das native Select verwendet `data-d6-role="pid"`; Optionen enthalten Rolle und Farbname, keinen Score. Drei Ausrichtungsbuttons verwenden die vorhandenen `data-v64-orientation="-1|0|1"`, zusätzlich `data-d6-orientation-player="pid"` und `aria-pressed`. Keeper erhalten beide Keeperrollen, keinen Ausrichtungseditor. Eine leere Rollenliste deaktiviert das Select. Keine alte individuelle Einzelanweisung wird erzeugt.
- `renderPitchRole(ui, labels)` liefert ein kleines Rollenlabel über dem Spielertoken. Der Eignungsfarbpunkt stammt aus der aktuell gewählten Rolle in `allowedRoles`, ersatzweise einer passenden Empfehlung. Name, Tooltip und Farbe beziehen sich auf den tatsächlichen Auftrag, nicht die Profilpräferenz.
- `renderRoleZone(zone, labels)` liefert **ein** SVG mit einer ungefähren gemeinsamen Rechteckzone, ohne exakte Laufroute und ohne Ballbesitz-/Abwehrumschalter. Die Zone ist normalisiert auf 0–1, auf das Feld begrenzt und für die Darstellung auf ganze Prozent gerundet. Der Integrator leitet die Rolle/Startstelle ab und setzt dieses Overlay in den bestehenden relativ positionierten Fußballplatz. Der zugängliche Text beschreibt ausdrücklich den ungefähren, situationsabhängigen Raum; keine numerischen Grenzen werden in Text/Titel erklärt. Ungültige Geometrie erzeugt keine Zone.

Die bestehende `D6Flutlicht.components.skill`-Komponente wird genutzt, wenn sie verfügbar ist; sie erhält nur `{label,band,colorLabel}`. Der gleichwertige CommonJS-Fallback verwendet dieselben Klassen. Es gibt keinen Storagezugriff, DOM-Zugriff, Listener, RNG, Timer, Matchloop oder Schreibzugriff auf die Projektion. Der Integrator verdrahtet die zentralen Controllerereignisse.

## Gestaltung und Geräte

CSS ist auf Nachfahren von `.fl-shell`, `.fl-match`, `.fl-dialog` begrenzt. Vorhandene Schrift-/Farb-/Themevariablen bestimmen die Managementoberfläche, Feldlabels bleiben auf dem grünen Fußballplatz weiß. Native Rollenwahl und Ausrichtungsbuttons haben mindestens 44 Pixel Höhe und einen sichtbaren Tastaturfokus. Drei gleich breite Ausrichtungsbuttons, flexible Farbstufentags und umbrechende Profiltexte unterstützen 320/390 Pixel und längere EN-Beschriftungen. Das Zonen-SVG ist ein durchlässiges Overlay und fängt keine Maus-/Touchaktion ab.

## Nachweis und Integrationsgrenze

`work/test-player-ui-projection.cjs`: **11 Gruppen bestanden**. Prüfung von Rohwert-/Talent-Sentinels einschließlich ARIA/Titel, vollständiger erlaubter Auswahl gegenüber festen Empfehlungen, Keepereditor, unveränderten wichtigen Fähigkeitsfarben, bestehendem Flutlicht-Komponentenvertrag, DE/EN, einer begrenzten ungefähren Zone, tatsächlichem Pitch-Auftrag, leeren/missgebildeten Eingaben, HTML-/Attributescaping und vollständiger Renderreinheit ohne DOM/Storage/RNG. P04 zusätzlich **25 Gruppen bestanden**.

Die echte Browserabnahme mit Vor-/Halbzeitcontroller, Rolle/Verschieben/Tausch/Wechsel, Speicherparität, Tastatur/Touch, hellem/dunklem Thema, 320/390 Pixel/Desktop und Quell-/Offline-Build gehört I02/I03. Die gemeinsame visuelle Prüfung erfolgt dort als gebündelte Desktop-/Mobilrunde; dieser reine Renderer behauptet keine bereits abgeschlossene gesamte Menü- oder Gerätefreigabe.
