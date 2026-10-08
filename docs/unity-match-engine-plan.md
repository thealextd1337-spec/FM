# Match-Engine: Unity als gewählter Hauptpfad

Aktueller Stand vom 8. Oktober 2026: Der Nutzer priorisiert Unity für den weiteren 3D-Ausbau aufgrund der besseren visuellen Wirkung. Kontakt-, Netz- und Spielzugproben sowie die anschließend beauftragte Darstellung einer echten Vereinswelt-Partie sind lokal gebaut und geprüft: reale Aufstellung/Trikots, Pause, Wechsel, Zwischenstand, Torwiederholung und Rückschau. Die bestehende Simulation bleibt für Regeln und Karriere zuständig; ein vollständiger Partievergleich ist bestanden. [Aktueller Nachweis und Grenzen](platform/vereinswelt-unity.md). Spielergrundlagen/Rollen und die vollständige Taktiküberarbeitung folgen als nächste Fachwelle; eine neue Unity-Match-KI und mobile Freigabe bleiben offen. Die folgenden Planabsätze vom 5. Oktober bleiben historische Vergleichsgrundlage; ihre Aussagen zu noch fehlendem Projekt oder offener Enginewahl gelten nicht mehr. Keine Veröffentlichung oder Nachberechnung gespeicherter Partien.

Stand: 5. Oktober 2026. Planung und Quellenprüfung; kein Unity-Projekt angelegt, kein Enginewechsel beschlossen oder umgesetzt.

## Aktueller Planungsauftrag

Nur die Planung wird abgeschlossen; kein Engineprototyp, Build oder Messlauf ist gestartet. Die konkreten zukünftigen Aufträge E01, R01 und Q01 mit Ressourcen-/Entscheidungsgates stehen im [Agenten-Masterplan](agentenauftraege/README.md). Ein späterer ausdrücklicher Startauftrag bleibt erforderlich.

## Ziel und Umfang

PC-Browser, Google Play Store und Apple App Store sind bestätigte, gleich wichtige Zielplattformen. Der PC-Browser wird zuerst veröffentlicht, danach die beiden Apps. Handys sollen hauptsächlich über native Apps spielen. Spätere automatische Account-/Cloudfortsetzung zwischen den Plattformen ist vorgesehen. Mobile Performance ist für die Apps eine Freigabebedingung; Mobile-Web wird ergänzend bewertet. Der [Ausbauplan](match-ausbau-plan.md) enthält bestätigte Entscheidungen, offene Fragen und Parallelbearbeitung. Der Matchteil soll nachvollziehbare Ballkontakte, verlässliche Torwartregeln und Spieler mit längerfristigen, anpassbaren Absichten ermöglichen. `freekickdemo/` gehört nicht zum Umfang.

Ein Wechsel wird zuerst am Matchteil bewertet. Vereinswelt, Karriere, Transfers und vorhandene Manageroberfläche müssen für diesen Vergleich nicht neu gebaut werden. Aktuelle Rendering- und Simulationsfehler dienen als Abnahmeszenen. Eine Engine ersetzt keine Fußballregeln und keine Spielerentscheidungen.

## Zwei Vergleichskandidaten

1. Die vorhandene Browserengine erhält eine getrennte Wahrnehmungs-, Absichts-, Ausführungs- und Kontaktlogik. Raumpässe mit tatsächlichem Kontakt liefern ein vorhandenes Referenzmuster. Normale Pässe, Schüsse und Blocks folgen derselben Ergebnisreihenfolge.
2. Ein isolierter Unity-Matchprototyp setzt dieselben fachlichen Regeln um. Zuerst zwölf dargestellte Figuren mit vorgegebenen Abläufen sowie kleine Kontaktszenen mit Schütze, Verteidiger und Torwart; PC-Webbuild und native Appwege getrennt prüfen. Erst nach der Engineentscheidung die vollständige Matchlogik im gewählten System entwickeln. Keine zweite konkurrierende Simulation desselben laufenden Matches.

Unity bietet Werkzeuge für Animation und zielgebundene Gelenkpositionen. Das kann die Arbeit an Fuß-, Hand- und Ballkontakten erleichtern. Ob diese Werkzeuge die vorhandene Kontaktqualität tatsächlich verbessern, ist eine offene Projektfrage und muss am bestehenden Spielerrig gezeigt werden. Siehe [Inverse Kinematics](https://docs.unity.com/en-us/engine/6000.0/manual/animation-section/animation-mecanim/avatar-creationand-setup/inverse-kinematics).

## Regeln und Schnittstelle unabhängig von der Engine

- Wahrnehmung, längerfristige Absicht, konkrete Aktion, Ballkontakt und Ergebnis sind getrennte Zustände. Bindung und Neubewertung folgen dem [Entwurf mentaler Fähigkeiten](mentale-faehigkeiten-plan.md).
- Simulationsschritte laufen mit einer festen Zeitbasis. Grafikbilder lesen Momentaufnahmen; sie ziehen keinen Spielzufall und entscheiden keine Kontakte.
- Der Matchstart erhält Spielerkennungen, effektive Fähigkeiten, Aufstellung, Teamtaktik, Regeln, Abmessungen und Zufallsstart. Der Matchabschluss liefert Ergebnis, tatsächliche Ereignisse, Statistiken und Spielerzustände anhand dieser Kennungen zurück.
- Zwischen Browseroberfläche und Unity werden definierte Befehle und Zustände ausgetauscht: Start, Pause, Fortsetzen, erlaubte Taktik-/Wechselaktionen sowie Abschluss. Nicht jedes Gelenkbild über die Schnittstelle senden. Unity dokumentiert die [Interaktion mit Browser-JavaScript](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-interactingwithbrowserscripting.html).
- Genau ein System ist für Uhr, Ballbesitz, Kontakte und Statistik zuständig. Eine Darstellung kann das Ergebnis nicht nachträglich korrigieren.
- Zufallsstart und feste Schritte allein garantieren bei unterschiedlicher Physik keine bitgleichen Resultate über Engines und Geräte. Innerhalb eines unterstützten Pfads werden Reproduzierbarkeit, 2D-/3D-Parität und Fortsetzung geprüft; der Enginevergleich bewertet dieselben Regeln, Szenen und Ergebnisverteilungen statt identischer Endstände.
- Der Nutzer akzeptiert die Fortsetzung am letzten sicheren Unterbrechungspunkt. Ein solcher Zustand bewahrt Zeit, Zufall, Spieler-/Ballzustand, Absichten und abgeschlossene Buchungen. Ein App-Abbruch während eines Flugs fällt auf diesen Punkt zurück; der laufende Flug muss dafür nicht nachträglich erfunden oder vollständig gespeichert werden. Bestehende Karriereformate und historische Statistiken werden für den Prototyp nicht umgerechnet. Die Einführung einer anderen Engine in aktive Spielstände braucht vor Umsetzung eine eigene Kompatibilitätsentscheidung.

## Browseranforderungen und geprüfte Quellen

Unity nennt in der geprüften Unity-6.5-Dokumentation Unterstützung für iOS Safari ab 15 und Android Chrome ab 58. Die Dokumentation empfiehlt aktuelle Browser; diese Mindestangaben ersetzen keine Geräteprüfung. Auch der Hinweis auf IndexedDB-Einschränkungen in Safari-iFrames ist bei der Einbettung relevant. Siehe [Web browser compatibility](https://docs.unity.com/en-us/engine/6000.5/manual/platform-specific/webgl/intro/browsercompatibility).

Für den Vergleich werden eine unterstützte stabile Editorversion und ein fester Paketstand gewählt. Aus der Unterstützung eines Desktop-Webbuilds wird keine ausreichende Mobilperformance abgeleitet. Native App-Builds werden getrennt von Webbuilds bewertet.

Nach aktueller offizieller Lizenzinformation darf Unity Personal bei höchstens 200.000 US-Dollar maßgeblicher Finanzen in den letzten zwölf Monaten verwendet werden. Die genaue Berechtigung hängt vom Nutzungsfall ab; vor einer konkreten Einführung erneut prüfen. Die Runtime Fee wurde gestrichen. Quellen: [Lizenzberechtigung](https://unity.com/pages/license-compliance), [Unity Editor Software Terms Update](https://unity.com/blog/terms-update-runtime-fee-cancellation).

## Vergleichsszenen

- Freies Tor bei seitlich versetztem oder weit herausgelaufenem Keeper: Ziel im Tor und tatsächliche erreichbare Parade.
- Hoher, flacher und seitlicher Schuss: Ballhöhe, Fuß-/Handkontakt, Abpraller und vollständige Torquerung.
- Torwart-Handaufnahme an der Strafraumgrenze und außerhalb; erlaubter Fußkontakt außerhalb; Herkunft des Balls bei Rückpass und Einwurf.
- Normaler Pass mit zwei konkurrierenden Abfangspielern; Abfangen erst bei Kontakt und anschließend korrekte Statistik.
- Tiefenlauf mit fortgesetzter Absicht, geschlossenem Passweg und Ballbesitzwechsel; keine dauernden Zielwechsel und keine starren Läufe nach Planverlust.
- Block mit erreichbarem und unerreichbarem Verteidiger; Abpraller läuft von tatsächlichem Kontakt aus weiter.
- Pause, Rückschau, Fortsetzen und Speichern/Laden ohne nachgeholte Zeit oder doppelte Ereignisse.

## Messung und Entscheidung

### Mobile Performance als Freigabebedingung

Die vorhandenen mobilen Defizite sind Ausgangspunkt des Vergleichs. Auf einem Pixel 9 Pro XL wurde starkes Ruckeln gemeldet. Die bisherigen Änderungen senken Renderauflösung und Schattenaufwand, vermeiden doppelte Renderaufrufe und begrenzen die Bildrate. Die Messung erfolgte jedoch im isolierten Browser mit SwiftShader; tatsächliche Flüssigkeit und Erwärmung auf dem Pixel wurden damit nicht belegt. Siehe [Mobile Performance v135](mobile-3d-performance-v135.md).

Der Enginevergleich muss daher auch auf echten Mobilgeräten bestehen. Ein schneller Desktoplauf, ein emulierter Viewport oder ein bestandener kleiner Dreispieler-Prototyp genügt nicht. Browser- und native Unity-Builds erhalten jeweils eigene Messungen; ein schneller nativer Build belegt keine Verbesserung im Browser. Native Android-/iOS-Apps und PC-Web sind bestätigte Ziele; Handys nutzen hauptsächlich die Apps. Pixel 9a und Pixel 9 Pro XL sind als verbindliche Android-Referenzgeräte gesetzt; stabile 30 Bilder/s sind als Android-Leistungsziel bestätigt, iPhone-Zugriff bleibt zurückgestellt.

- Zuerst CPU-Zeit für Simulation, Aktionswahl, Rig-/Kontaktanimation und Rendering sowie GPU-Aufwand, Speicher und Ladezeit getrennt erfassen. Erst der gemessene Engpass bestimmt die Optimierung. Die Ursachen der verbleibenden Ruckler sind noch offen.
- Für den PC-Browser ist seit dem 6. Oktober 2026 das Ziel bestätigt: erstes 3D-Match auf einer guten Verbindung innerhalb von höchstens 10–15 Sekunden bereit, mit Fortschrittsanzeige und Zwischenspeicherung für schnellere Folgematches. Beide Kandidaten messen den vollständigen Ladevorgang bis zum spielbereiten Bild einschließlich Import/Entpacken, mit dokumentierter Verbindung und kaltem beziehungsweise warmem Cache. Eine numerische MB-Grenze wird aus den Messungen abgeleitet; bisher nicht bestätigt.
- Bestätigtes Android-Leistungsziel ist eine stabile Darstellung mit 30 Bildern/s auf Pixel 9a und Pixel 9 Pro XL. Automatische Grafikreduzierung ist zulässig, ohne Simulation oder Regeln zu verändern. 60 Bilder/s ist eine optionale zusätzliche Qualitätsstufe, keine Voraussetzung. Bildzeiten und lange Ausreißer zählen zusätzlich zur Durchschnittsbildrate. Die Referenzgeräte Pixel 9a und Pixel 9 Pro XL sind verbindlich festgelegt; Das Bildratenziel ist bestätigt; tatsächliche Hardwaremessungen und konkrete Ausreißer-/Speicherbudgets stehen aus.
- Die fachliche Simulation behält eine feste Zeitbasis und dieselben Kontaktregeln. Eine geringere Grafikbildrate verändert weder Spieltempo noch Wahrnehmungsreaktion, Fähigkeiten, Zufallsfolge oder Ergebnis.
- Bestätigt am 6. Oktober 2026: Auflösung, Schatten und Details dürfen bei Rucklern oder Erwärmung automatisch reduziert werden; eine manuelle Qualitätswahl ergänzt die Automatik. Die plattformspezifisch verfügbaren Messsignale werden in der Probe geprüft. Die Anpassung betrifft ausschließlich die Darstellung und ist noch nicht umgesetzt.
- Absichten werden ereignisbezogen und mit begrenzter periodischer Neubewertung fortgeführt. Die regelmäßigen Bewertungen werden über Spieler verteilt. Zwingende Kontakt-/Regelprüfungen bleiben in jedem notwendigen Simulationsschritt aktiv; ein langsamerer Planungstakt darf keine Parade oder Regelunterbrechung verzögern.
- Vorhersagen bleiben kurz und Kandidatenmengen begrenzt. Keine vollständige Simulation vieler zukünftiger Spielszenen für jeden Spieler in jedem Schritt. Gemeinsam benötigte Geometrie darf je Simulationsschritt wiederverwendet werden.
- Grafikqualität wird bei Bedarf abgestuft: interne Auflösung, Schatten, Stadiondetails und Aufwand entfernter Figuren. Kontaktrelevante Zustände bleiben gemeinsam in der Simulation verfügbar; grafische Vereinfachung darf keinen anderen Kontakt erzeugen. Rig-, Material- und Zeichenaufrufoptimierung wird nur bei nachgewiesenem Engpass priorisiert.
- Die vollständige Rückschau der aktuellen Partie bleibt erhalten. Speicheraufwand wird durch kompaktere Daten und gegebenenfalls eine geprüfte angepasste Aufzeichnungsrate reduziert, nicht durch eine unangekündigte zeitliche Begrenzung. Marker, Kontaktverlauf und Wiedergabequalität sind dabei Abnahmekriterien.
- Kalter und warmer Start, mehrere vollständige Partien und eine mindestens 20-minütige Sitzung gehören zur Mobilprüfung. Speicher darf über wiederholte Partien nicht unbegrenzt wachsen. Hintergrundwechsel, Rückkehr, Pause, Vollbild und Geräteausrichtung werden mitgeprüft. Erwärmung und möglicher Leistungsverlust im Verlauf werden dokumentiert.
- Verbindliche Geräteauswahl: Pixel 9a und Pixel 9 Pro XL; der Pixel 9 Pro XL ist zugleich bekanntes Problemgerät. iPhone-Zugriff für die spätere Appabnahme klären; schwächeres Android ergänzend prüfen, sobald verfügbar. Für jedes Gerät Browser-/Systemstand, Grafikstufe und tatsächlich gemessene Ergebnisse nennen. Ohne verfügbare Geräte die betreffende Abnahme als offen ausweisen. Emulatoren helfen bei Layout/Funktion, ersetzen keine Leistungsabnahme.
- Die Nutzerfrage nach iPhone-Testzugriff ist seit dem 6. Oktober 2026 zurückgestellt. Zunächst PC-/Androidfragen klären; iOS-Ziel und spätere Hardwareabnahme bleiben bestehen.

Eine vorläufige Unity-Entscheidung ist nach bestandenem PC-/Androidvergleich und belegtem Vorteil gegenüber der Browserfassung einschließlich ihres geprüften Appwegs möglich. Nach der späteren Zurückstellung von iPhone werden iOS-Architekturannahmen dokumentiert; die tatsächliche iOS-Build-/Integrationsprobe und Hardwareabnahme folgen später und blockieren die PC-/Androidstufe nicht. Die endgültige iOS-Appfreigabe setzt reale iPhone-Abnahme voraus; diese bleibt bei fehlender Hardware offen. Unterstützte Mobilbrowser allein reichen nicht aus. Eine Optimierung der bestehenden Engine bleibt ein gleichwertiger Vergleichskandidat. Phasen, Ressourcen und Parallelbearbeitung stehen im [Ausbauplan](match-ausbau-plan.md).

Für beide Kandidaten dieselben Spielermodelle, Kameraaufgaben, Szenen und vergleichbare Grafikqualität verwenden. Vor der Engineentscheidung reichen zwölf dargestellte Figuren mit vorgegebenen Abläufen und die kleinen fachlichen Kontaktszenen; kein paralleler Vollausbau zweier Match-KIs. Nach der Entscheidung wird die gewählte Engine in vollständigen Partien auf Desktop und Android abgenommen, vor iOS-Appfreigabe zusätzlich auf einem echten iPhone. Geräte und Browserstände benennen.

Erfassen: Downloadgröße, Zeit bis zum spielbaren Match bei kaltem und warmem Start, Bildzeiten einschließlich Ausreißern, Speicherbedarf, lange Unterbrechungen, Kontaktqualität und Aufwand für eine zusätzliche geprüfte Matchregel. Auf Mobilgeräten auch eine längere Sitzung mit wiederholten Partien, Unterbrechen/Fortsetzen und Geräteausrichtung testen.

Vor dem Prototyp konkrete Leistungsbudgets anhand der bisherigen Browserfassung und verfügbarer Zielgeräte festlegen. Ein Wechsel setzt bestandene Fußballregeln, akzeptable Mobilwerte und einen belegten Vorteil für weitere Entwicklung voraus. Bei ausreichender bestehender Browserengine wird deren fachliche Trennung beibehalten und Unity nicht allein wegen seiner Werkzeuge übernommen.

Nächster Planungsschritt: Szenen und Messbudgets festlegen. Ein Prototyp, ein Projektumbau und eine Veröffentlichung sind gesonderte Umsetzungsschritte.
