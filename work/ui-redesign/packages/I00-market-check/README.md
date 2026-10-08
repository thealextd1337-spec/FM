# Q-MKT03 / Q-MKT04 – abschließende DOM-Aktionsprüfung

Tests-only-Auftrag, 7. Oktober 2026. Keine Produkt- oder Vertragsdateien verändert.

Aufruf: `node work/ui-redesign/packages/I00-market-check/check.cjs`. Der Runner verwendet den gebündelten Node-Runtime bei Bedarf, einen eigenen lokalen Serverport, Edge und getrennte frische Browserkontexte für Quellseite und `outputs/index.html` als echte Offline-Datei.

Finaler Beleg: `outputs/ui-redesign/I00-market-check/2026-10-07T21-34-20-109Z/checks.json`. Quelle und Offline jeweils acht Prüfgruppen bestanden, keine Browserlaufzeitfehler. Alle JavaScript-/CSS-/HTML-Dateien in `dist/` und die gesamte Offline-Datei haben vor/nach dem Lauf identische SHA-256-Hashes.

## Q-MKT03 Vertragsverlängerung

- Echter erzeugter auslaufender Vertrag, nativer Dialog und Submit. Jahresgehalt unter Minimum abgelehnt, Angebotszähler unverändert.
- Zwei niedrige DOM-Angebote erzeugen echte Gegenforderungen samt Verlauf. Danach ist Submit entfernt und das spätere Fenster erklärt.
- Browserneuladen erhält Gegenforderungsverlauf und Sperre.
- Native Transfer- und Kalendertage öffnen das zweite Fenster. DOM-Angebot mit drei Jahren wird angenommen; Vertrag und genau ein Verlängerungsereignis im Ledger bleiben nach Neuladen erhalten. Kein erneuter Verlängerungsknopf für diesen Vertrag.

## Q-MKT04 Nachwuchs

- Eine ausdrücklich markierte flüchtige Testvorbereitung setzt über `v66Book` den verfügbaren Kassenstand auf null: Übernahmeknopf ist deaktiviert. Zweite markierte Fixturebuchung stellt exakt den Ausgangsbetrag wieder her.
- Zwei unmittelbar aufeinanderfolgende DOM-Klicks auf Übernehmen ergeben genau einen Profi, einen Vertrag und eine Ausbildungsentschädigung. Der native Erfolgsdialog wird über seinen vorhandenen Button geschlossen.
- Die native Browserbestätigung bei Entlassung wird abgebrochen: vollständige serialisierte Karriere bleibt unverändert.
- Bestätigung der Entlassung ergibt genau einen freien Spieler und einen Transfereintrag, ohne Gebührenbuchung. Browserneuladen erhält Übernahme und Entlassung; beide erledigten Poolaktionen sind verschwunden und die Ausbildungsentschädigung bleibt einmalig.

Setup verwendet erzeugte Testkarrieren und bestehende Controller. Die zu prüfenden Aktionen selbst laufen ausschließlich über bestehende DOM-Knöpfe/Formulare und echte Bestätigungsdialoge. Keine Produktregeln geändert oder fehlende Geschäftszustände im Renderer nachgebildet. Die Bilder dokumentieren das gesperrte Vertragsfenster sowie den Kader nach Neuladen; die JSON-Datei enthält Einzelprüfungen und Buchungszählungen.
