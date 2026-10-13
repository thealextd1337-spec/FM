# Doppel 6: Hinweise für Entwicklungsinstanzen

Doppel 6 ist ein mobil spielbarer Fußballmanager im Browser. Maßgeblich sind der aktuelle Nutzerauftrag, der tatsächlich gewählte Checkout mit seinem Git-Status und dessen `dist/`. Der Hauptcheckout enthält den übernommenen Release-131-Quellstand; neue Nutzerentscheidungen haben Vorrang vor älteren Dokumenten.

`freekickdemo/` ist eigenständig. Die bisherige Sechserliga wird nicht weiterentwickelt; neue Produktfunktionen gehören zur Vereinswelt.

Lies nur aufgabenrelevante Dateien:

- Spielregeln, Karriere, Transfers, Pokal, Auszeichnungen und UI: `docs/product.md`.
- Codeänderungen, Tests, Build, Git-Übergabe und Veröffentlichung: `docs/development.md`.
- Offene Fehler oder Wünsche: `docs/Bugliste.md`; aktueller Umfang und zurückgestellte Ideen: `docs/entscheidungen.md`.
- Abgeschlossene Änderungen: `docs/CHANGELOG.md` ergänzen; Format in `docs/README.md`.

Historische Pläne und Agentenaufträge sind inaktiv; sie starten keine Umsetzung oder Fortsetzung. Nutze sie als Referenz nur innerhalb eines aktuellen Nutzerauftrags.

Bei jeder Veröffentlichung die Fußversion anheben und denselben Stand in Quelle, Build und Live-Seite prüfen. Bestehende Spielstände werden gemäß `docs/development.md` nicht rückwirkend umgerechnet. Spielerfähigkeiten einschließlich zugänglicher Beschriftungen nur als Farbstufen zeigen; genaue Werte und Entwicklungspunkte bleiben intern.

Bei beauftragter 3D-Modellierung, Texturierung, Rigging oder Animation darf der verfügbare Meshy-Funktionsumfang genutzt werden. Verwende dafür den Meshy-Plugin-Skill und `docs/meshy-workflow.md`. Verfügbarkeit und Credits starten keinen Assetauftrag.

Halte diesen Wegweiser kurz; feste Fachregeln stehen in `docs/product.md`, Entwicklungsregeln in `docs/development.md`.
