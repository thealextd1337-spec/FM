# Entwurf: Identität und Entwicklung der Vereine

Status: Produktplanung für **neue Karrieren**. Beschlossen sind sechs Länder mit je sechs festen, handgestalteten Ligavereinen und zwei dauerhaften Pokalvereinen, fiktive Vereine in echten Städten, langfristig unterschiedliche Vereinscharaktere, historisch große Vereine, langsame Prestigeänderung und keine zweite Spielklasse. Ein kleiner Ligaverein kann selten Meister werden. Budget, Jugendkultur, Risikostil und Tradition bleiben bei einem Trainerwechsel am Verein. Alle Zahlen, Verteilungen und konkreten Profile in diesem Dokument sind **Vorschläge zur Kalibrierung**, keine bestätigten Spielregeln.

## Zielbild

Eine gute Mannschaft kann eine schlechte Saison spielen. Ein kleiner Verein kann durch gute Arbeit stärker werden und selten auch Meister werden. Beides soll nachvollziehbar sein, ohne dass Tabellenplätze jede Saison fast zufällig rotieren oder alle Vereine nach einigen Jahren gleich handeln. Der Verein ist die dauerhafte Institution; Trainer, Kader, Form und Kontostand können sich schneller ändern. Es gibt in der geplanten Welt keinen Auf- oder Abstieg zwischen Spielklassen.

Die 36 Ligavereine und zwölf Pokalvereine brauchen wiedererkennbare Stärken, Schwächen und Entscheidungsweisen. Ihr Charakter soll im Markt, in der Jugendförderung, in der Trainerwahl, im Umgang mit einer Krise und in realistischen Erwartungen sichtbar werden. Für jedes Merkmal gilt: Es erzeugt eine **Entscheidungsneigung oder wirtschaftliche Grenze**, keinen heimlichen Bonus auf Spielerfähigkeiten oder Tore. Die tatsächliche Mannschaftsqualität entsteht aus den Spielern, ihrer Form, Fitness, Aufstellung und Taktik.

## Drei Zeitskalen

| Ebene | Beispiele | Änderung |
| --- | --- | --- |
| Institution | Tradition, historische Erfolge, Fanbasis, Jugendkultur, Risikostil | Sehr langsam; über mehrere Saisons und Ereignisse. Trainerwechsel setzt nichts zurück. |
| Saison | Kaderqualität, Kontostand, Gehaltslast, Vorstandsziel, Trainer, Teamchemie falls eingeführt | Durch Transfers, Einnahmen, Verträge und Personalentscheidungen. Ein Saisonwechsel ist ein Prüfpunkt, kein Komplettreset. |
| Partie und kurze Serie | Form, Frische, Verletzungen falls eingeführt, Gegnerprofil, Taktik, Ergebniszufall | Von Spiel zu Spiel; erklärt auch Unterperformance eines nominell starken Kaders. |

**Prestige** ist die träge öffentliche Wahrnehmung des Vereins. **Kaderstärke** beschreibt die heute verfügbaren Spieler. **Saisonform** beschreibt zuletzt gezeigte Leistung. Diese Werte dürfen nicht als ein einzelner Vereinsstärke-Wert zusammenfallen. Ein traditionsreicher Klub kann vorübergehend einen mittelmäßigen Kader haben, und ein aufstrebender Klub kann sportlich vorne liegen, obwohl sein Prestige noch geringer ist.

## Daten eines Vereins

| Feldgruppe | Inhalt | Sichtbare Wirkung |
| --- | --- | --- |
| Identität | Stabile ID, Land, echte Stadt, fiktiver Name, Farben, Gründungs- und Erfolgsgeschichte | Wiedererkennung in Tabellen, Nachrichten und Historie. Städte, Namen und Farben stehen redaktionell im [Vereinskatalog](vereinskatalog-entwurf.md). |
| Institution | Tradition, Fanbasis, Jugendkultur, regionale Reichweite | Langsame Einnahmeentwicklung, Nachwuchskanal und realistische Anziehungskraft. |
| Vorstand | Ambition, Ergebnisgeduld, finanzielle Risikogrenze, Nachwuchsgewicht | Zielsetzung, Entlassung, Budgetfreigabe, Trainer- und Transferauswahl. |
| Wirtschaft | Bargeld, laufende Einnahmen, Gehaltsverpflichtungen, Transferbudget, Rücklage | Reale Handlungsgrenzen. Ausgaben und Verkäufe werden gebucht; kein unsichtbarer Geldzufluss. |
| Sport | Kader, Positionsabdeckung, Trainer-ID nur bei Computerverein, Ergebnisse | Leistung, Matchplanung und konkrete Kaderbedarfe. |
| Geschichte | Meisterschaften, Pokale, Europacup, Platzierungen, Trainer- und Transferstationen | Prestigeentwicklung und Karriereerzählung, ohne alte Resultate umzuschreiben. |

Die Vereins-ID und sein institutionelles Profil bleiben beim Wechsel der spielenden Person oder bei einer Trainerentlassung erhalten. Der menschlich betreute Verein hat keine zusätzliche Trainerfigur. Die spielende Person kann nur einen Ligaverein mit freiem Traineramt oder Interimstrainer übernehmen; ein fest beschäftigter KI-Trainer wird nicht verdrängt. Der zuvor betreute Verein erhält nach dem Weggang eine KI-Führung nach den normalen Besetzungsregeln. Angebote und Personalfolgen werden beim Saisonwechsel als eindeutige Ereignisse gespeichert.

## Unterschiedliche, aber stabile Entwicklung

1. **Startzustand:** Jeder der 36 Vereine erhält ein festes, kuratiertes Profil mit echter Stadt, fiktivem Namen, Geschichte, Ziel, finanzieller Ausgangslage, Kaderstruktur und Vorstandsstil. Aggregierte Kaderqualität und Finanzlage dürfen zu Beginn einer neuen Karriere jeweils um ungefähr fünf Prozent variieren; institutionelle Identität und ungefähre Ausgangsstellung bleiben erkennbar.
2. **Sportliches Ergebnis:** Spielausgänge werden aus tatsächlichem Kader und Spielverlauf ermittelt. Ergebnisse enthalten normale Varianz; ein hoher Tabellenrang ist keine Pflicht für einen starken Verein.
3. **Saisonbewertung:** Der Vorstand vergleicht Ergebnis und vorher gespeicherte Erwartung. Eine schlechte Saison kann Trainerwechsel, andere Transferprioritäten oder geringere Ausgaben auslösen. Sie löscht nicht Tradition oder Fanbasis.
4. **Wirtschaftliche Folge:** Preisgelder und Einnahmen ändern den Handlungsspielraum. Gehälter und Ablösen belasten den Kontostand. Eine gute Saison kann Wachstum ermöglichen, eine schlechte Saison Anpassungen erzwingen. Wiederholter Erfolg oder Misserfolg wirkt stärker als ein einzelnes Jahr.
5. **Langsamer Strukturwandel:** Prestige und Reichweite ändern sich nur nach mehreren passenden Saisons. Die Jugendkultur bleibt als Vereinsprofil erhalten; die jährlichen Jugendausgaben können wechseln und entfalten ihre Wirkung mit Verzögerung. Änderungen je Saison werden begrenzt und in der Historie begründet.
6. **Keine automatische Angleichung:** Kleine Vereine erhalten keinen direkten Ergebnisbonus, große Vereine keinen Besitzstandsschutz im Spiel. Beide behalten unterschiedliche Mittel und Entscheidungen. Die Liga kann sich dennoch über Jahre verändern.

Für die spätere Kalibrierung bietet sich eine begrenzte, gewichtete Entwicklung an: Der längerfristige Trend zählt stärker als das letzte Saisonergebnis; ein Saisonwert darf nur um einen kleinen Schritt steigen oder fallen. Die konkreten Gewichte müssen aus Mehrjahressimulationen folgen. Es darf keine verdeckte Mechanik geben, die einen Traditionsverein nach einer schwachen Saison sofort wieder Meister werden lässt.

Als bestätigte Balancemarken gelten ungefähr fünf bis sieben gute Saisons, bis ein kleiner Verein als dauerhaftes Spitzenteam etabliert ist, und ungefähr vier bis sechs schwache Saisons, bis ein historisch großer Verein spürbar Prestige und finanzielle Reichweite verliert. Das sind keine starren Jahreszähler: echte Kaderqualität, Wirtschaft und Ergebnisse müssen den Wandel tragen. Einzelne Ausreißer dürfen schneller einen Titel bringen, ohne die institutionelle Stellung sofort umzuschreiben.

### Berechnungsgerüst für die spätere Implementierung

Die folgenden Beziehungen beschreiben Verantwortlichkeiten, nicht beschlossene Zahlenwerte:

```text
spielbare Kaderstärke = Bewertung der tatsächlich verfügbaren Startelf und Bank
Partieerwartung = Kaderstärke beider Teams + Heimvorteil + bekannte Belastung
Saisontrend = geglättete Abweichung tatsächlicher von vorher gespeicherter Erwartung
Prestige nächstes Jahr = bisheriges Prestige + begrenzter Anteil des Mehrjahrestrends
frei planbares Geld = Kontostand - fällige Verpflichtungen - Mindestkaderreserve
```

Die Partieerwartung wird vor Anpfiff festgeschrieben. Ein späterer Kaderwechsel ändert nicht rückwirkend die Erwartung alter Partien. Weder Prestige noch eine Profilkategorie gehen als zusätzlicher Tor- oder Spielerfähigkeitsmultiplikator in die Match-Engine ein. Für Einnahmen können Fanbasis und jüngerer Erfolg zählen; diese Wirkung läuft über echte Buchungen, Transfers und Kaderqualität. Sobald reale Formeln feststehen, werden sie an langen Karrieren mit verschiedenen Seeds getestet und bei Bedarf angepasst.

Bei zufälligen Startvariationen werden die Abweichungen einmal beim Karrierebeginn gezogen und gespeichert. Finanzielle Ausgangslage und aggregierte Startkaderqualität desselben festen Vereins variieren zwischen neuen Karrieren jeweils um ungefähr fünf Prozent. Das darf die Rangfolge der institutionellen Ausgangsmittel und der Kaderstärke nur in engen Nachbarschaften verändern. Nach dem Start gelten dieselben normalen Regeln für Mensch und KI; bei einem Neuladen darf kein neuer Startzustand gezogen werden.

## Vereinsverhalten statt austauschbarer KI

Ein Vorstandsprofil beeinflusst Entscheidungen in mehreren Situationen konsistent:

| Merkmal | Bei Wachstum | In einer Krise |
| --- | --- | --- |
| Hohe Jugendkultur | Spielzeit und Kaderplätze für passende Talente; gezielte Ausbildungsinvestition | Hält vielversprechende Jugend eher, verkauft einzelne Spieler bei echtem Finanzbedarf. |
| Hohe finanzielle Vorsicht | Reserven, realistische Gehaltsobergrenze, gezielte ablösefreie Spieler | Senkt Ausgaben früh und sucht Verkäufe, bevor der Mindestkader gefährdet ist. |
| Hohe Risikobereitschaft | Nutzt tragbare Teile des Überschusses früher für Transfers | Kann Trainer früher wechseln und offensivere Kaderentscheidungen treffen, bleibt an harte Zahlungsgrenzen gebunden. |
| Hohe Tradition/Ambition | Fordert bei passendem Kader Titel und internationale Teilnahme | Bewertet enttäuschende Ergebnisse strenger; investiert nur, wenn Geld vorhanden ist. |
| Kleine Reichweite | Sucht günstige, entwicklungsfähige Spieler und passende Trainer | Verkauft Stars eher bei einem guten Angebot, hält aber den Kader spielfähig. |

Trainer empfehlen Spielerprofile, Rotation und Spielidee. Der Verein entscheidet über Vertrag, Ablöse, Gehaltsgrenze, Verkäufe und Entlassung. Ein Trainerwechsel kann deshalb den sichtbaren Matchstil rasch ändern; die Transferpolitik und Jugendkultur des Vereins bewegen sich langsamer. Für einen bestimmten Spieler können Verein und Trainer verschiedener Meinung sein; der dokumentierte Vereinsentscheid ist maßgeblich.

## Vorschlag für 36 Startprofile

Die Tabelle beschreibt **Rollen in der Spielwelt**. Ihre echten Städte bilden die bestätigte Grundlage; Bremen ersetzt den ursprünglichen Leipziger Vorschlag und Neapel den ursprünglichen Bari-Vorschlag. Die fiktiven Vereinsnamen und Farben sind nach redaktioneller Verwechslungsprüfung im [Vereinskatalog](vereinskatalog-entwurf.md) festgelegt. In jedem Land gibt es mindestens ein mögliches Stadtderby. Pro Land stehen sechs unterschiedliche Ausgangspositionen. Die Zahl historischer Großvereine darf zwischen Ländern variieren. „Groß“ meint institutionelle Größe; „stark“ meint den aktuellen Kader. Auch große Vereine dürfen sportlich schwächeln. Die Profile sollen beim Ausarbeiten konkrete Geschichte, Kader, Einnahmen, Trainerwahl und Ziel erhalten.

Für alle 48 IDs stehen im [Vereinskatalog](vereinskatalog-entwurf.md) redaktionell festgelegte Namen, Farben und individuelle Geschichtsansätze. Zahlenwerte und Startbudgets bleiben zu kalibrieren.

| Land | Platzhalter | Stadtvorschlag | Vorgeschichte und Ausgangslage | Typischer Schwerpunkt |
| --- | --- | --- | --- | --- |
| England | ENG-1 | London | Historischer Großklub; hoher Anspruch, zuletzt nicht zwingend Meister | Große Fanbasis, hohe Gehaltslast, wenig Geduld |
| England | ENG-2 | Manchester | Jüngerer Titelanwärter mit starken Mitteln | Breiter Kader, internationale Ambition, kalkuliertes Risiko |
| England | ENG-3 | Liverpool | Traditionsklub mit unruhigen Ergebnissen | Beliebtheit und Druck, vorsichtige Erneuerung |
| England | ENG-4 | Birmingham | Gut geführter Herausforderer innerhalb derselben Liga | Analytische Verpflichtungen, begrenzte Ausgaben |
| England | ENG-5 | Bristol | Ausbildungsverein | Jugend und Weiterverkauf, stabile Kadergrenzen |
| England | ENG-6 | London | Kleiner Stadtverein | Zusammenhalt, niedriger Etat, geduldiger Vorstand |
| Spanien | ESP-1 | Madrid | Historischer internationaler Spitzenklub | Prestige, hoher Titelanspruch, Stars und Eigengewächse |
| Spanien | ESP-2 | Barcelona | Etablierter Rivale | Offensiver Stil als Vereinskultur, riskante Investitionen nur tragbar |
| Spanien | ESP-3 | Valencia | Erfolgreicher Mittelklub | Kontinuität, kompakter Kader, gezielte Transfers |
| Spanien | ESP-4 | Sevilla | Traditionsklub nach sportlicher Delle | Hohe Fanerwartung, mittlere aktuelle Kaderstärke |
| Spanien | ESP-5 | Barcelona | Nachwuchsadresse der Stadt | Lokale Talente, Ausbildung, geduldige Ziele |
| Spanien | ESP-6 | Vigo | Kleiner pragmatischer Klub | Ablösefreie Spieler, vorsichtige Finanzen |
| Italien | ITA-1 | Turin | Historischer Rekordklub | Tradition, Ergebnisdruck, erfahrene Profis |
| Italien | ITA-2 | Mailand | Starker jüngerer Herausforderer | Kaderplanung, hohe Ambition, mittleres Risiko |
| Italien | ITA-3 | Rom | Traditionsverein im Wiederaufbau | Prestige über aktueller Kaderqualität, Geduld begrenzt |
| Italien | ITA-4 | Bologna | Stabiler Taktikverein | Trainerpassung und günstige Rollenprofile |
| Italien | ITA-5 | Mailand | Jugend- und Marktklub | Entwicklung, frühe Verkäufe bei hohem Gebot |
| Italien | ITA-6 | Neapel | Ambitionierter Traditionsverein mit größerer Geschichte als aktueller Kaderstärke | Fanerwartung, gezielte Erneuerung, tragbare Gehälter |
| Deutschland | GER-1 | München | Langjähriger Großklub | Finanzdisziplin trotz Titelanspruch, große Fanbasis |
| Deutschland | GER-2 | Bremen | Alter Erfolgsverein auf dem Weg zurück | Junge Profis, eigene Ausbildung und planvolle Transfers |
| Deutschland | GER-3 | Hamburg | Beliebter Traditionsverein mit Schwankungen | Große Reichweite, sportliche Geduld schwankt nicht täglich |
| Deutschland | GER-4 | Freiburg | Ausbildungsstarker Mittelklub | Nachwuchsminuten, Wiederverkaufswert |
| Deutschland | GER-5 | Köln | Wirtschaftlich solider Regionalverein | Kostenkontrolle, passende Trainer, Kontinuität |
| Deutschland | GER-6 | München | Kleiner Stadtverein mit klarer Nische | Ablösefreie Spieler und enge Gehaltsgrenzen |
| Frankreich | FRA-1 | Paris | Finanziell starker Spitzenklub | Hohe Ansprüche, internationale Ambition, hohe Kosten |
| Frankreich | FRA-2 | Marseille | Historischer Großklub mit eigenem Nachwuchs | Tradition und Ausbildung, langer Planungshorizont |
| Frankreich | FRA-3 | Lyon | Sportlich starker Herausforderer | Scouting und Kaderentwicklung, mittleres Budget |
| Frankreich | FRA-4 | Bordeaux | Traditionsklub nach Rückschlägen | Fanbasis, wirtschaftliche Konsolidierung |
| Frankreich | FRA-5 | Lille | Jugendarbeit als Kern | Nachwuchsspielzeit, talentierte Verkäufe |
| Frankreich | FRA-6 | Paris | Kleiner Stadtverein mit Ausbildungsfokus | Niedrige Kosten, geduldige Entwicklung |
| Portugal | POR-1 | Lissabon | Historischer Spitzenklub | Titelanspruch, Nachwuchs und europäische Bühne |
| Portugal | POR-2 | Porto | Zweiter etablierter Titelklub | Konkurrenzdruck, gezielte Verpflichtungen |
| Portugal | POR-3 | Lissabon | Großer Rivale mit wechselnder Form | Prestige bleibt, Trainer und Kader können schwanken |
| Portugal | POR-4 | Braga | Jugend- und Verkaufsklub | Junge Spieler, Transfererlöse, nachhaltiger Etat |
| Portugal | POR-5 | Coimbra | Stabiler Regionalverein | Langfristige Trainerpassung, niedrige Kosten |
| Portugal | POR-6 | Aveiro | Kleiner Klub mit kluger Nischenpolitik | Ablösefreie Spieler, geringe Ergebnisansprüche |

Diese Matrix ist ein Ausgangspunkt, keine Pflicht zur gleichförmigen Sechser-Schablone. Vor der Umsetzung wird jeder Platzhalter auf Überschneidungen geprüft. Länder dürfen unterschiedliche Finanzspannen und Kaderstile haben, aber keine Nation soll per verborgenem Matchmultiplikator bevorzugt werden. Aus fiktiven Vereinsgeschichten können bereits vor Saison 1 frühere Meister, Pokalsieger und Pokalfinalisten entstehen; die Vorjahresdaten bestimmen die ersten Europacupplätze, ohne alte Spielerstatistiken nachträglich zu erzeugen.

## Die zwölf Pokalvereine

Jedes Land hat zwei zusätzliche, dauerhafte Vereine außerhalb der sechs Teams umfassenden Liga. Beide besitzen eine eigene ID, fiktive Identität, Kader, Finanzen, Trainer und Historie. Sie nehmen am nationalen Pokal teil und können sich durch einen Pokalsieg oder als nachrückender Pokalfinalist für den Europacup qualifizieren. Sie sind nicht als Karriereverein der spielenden Person verfügbar. Es gibt keinen Aufstieg in die Liga.

Die folgende Verteilung ist ein Vorschlag für die Ausgestaltung der zwölf Profile. Sie verhindert, dass alle Pokalvereine bloß namenlose Kopien mit abgesenkter Spielstärke sind.

| Land | Platzhalter | Stadtvorschlag | Vorgeschlagener Charakter |
| --- | --- | --- | --- |
| England | ENG-C1 | Sheffield | Regionaler Traditionsverein mit treuer kleiner Fanbasis und vorsichtigem Budget. |
| England | ENG-C2 | Plymouth | Junger Ausbildungsverein, der Talente meist nach wenigen Einsätzen verkauft. |
| Spanien | ESP-C1 | Córdoba | Lokaler Pokalspezialist mit erfahrenem Kader und kurzer Bank. |
| Spanien | ESP-C2 | Gijón | Jugendverein mit sparsamer Führung und wechselnder Form. |
| Italien | ITA-C1 | Parma | Regionaler Traditionsverein mit defensiver Kaderplanung. |
| Italien | ITA-C2 | Lecce | Kleiner Marktverein, der günstige ablösefreie Spieler sucht. |
| Deutschland | GER-C1 | Jena | Gemeinnützig geprägter Ausbildungsverein mit guter Jugendkultur und wenig Geld. |
| Deutschland | GER-C2 | Lübeck | Kleiner Regionalverein mit routinierter Startelf und knapper Reserve. |
| Frankreich | FRA-C1 | Toulouse | Jugendverein mit jungen Spielern und vorsichtiger Gehaltsgrenze. |
| Frankreich | FRA-C2 | Metz | Traditionsverein einer kleineren Stadt mit hoher regionaler Bindung. |
| Portugal | POR-C1 | Évora | Entwicklungsverein mit Fokus auf Spielerverkäufe. |
| Portugal | POR-C2 | Faro | Regionaler Pokalverein mit erfahrenem Trainer und engem Etat. |

Ihre angestrebte Kaderstärke wird vor jeder Saison gegen die sechs Ligavereine des Landes neu geprüft. Ein Abstand von ungefähr 20–30 Prozent wird über kleinere Budgets und normale Marktentscheidungen angestrebt, ohne Spielerwerte umzuschreiben, Transfers zu erzwingen oder Siege zu sperren. Erfolge können vorübergehend zu einem stärkeren Pokalverein führen. Die Vergleichsgröße muss bei der Implementierung präzise definiert werden, etwa aus der einsatzfähigen Startelf statt aus einem versteckten Torbonus.

Pokalvereine erhalten einen ausgewiesenen jährlichen Posten regionaler Grundeinnahmen. Pokal- und mögliche Europacupprämien zu denselben Sätzen wie bei Ligavereinen kommen hinzu; laufende Gehälter und Transfers gehen davon ab. Diese Einnahmen werden kalibriert, damit ein dauerhafter, spielfähiger Kader ohne Schulden möglich ist. Form, Frische, Einsatzstatistik und Jugendentwicklung entstehen nur durch tatsächlich sichtbare Pokal- und Europacuppartien. Es gibt keine unsichtbaren Pflichtspiele und keine nachträglichen Einsatzpunkte. Die geringe Zahl an Spielen ist Teil ihres sportlichen Nachteils und muss in der Trainerbewertung berücksichtigt werden: Die Prüfung nach dem dritten Pflichtspiel unter einem Trainer kann mehrere Saisons dauern.

## Finanz- und Talentkreislauf

Jeder Verein erhält seine Mittel aus benannten Quellen wie Grundumsatz, Wettbewerbserfolg und Marktgeschäften. Verpflichtungen bestehen aus Spielergehältern, Ablösen und dem jährlichen Jugendbudget; Trainer und die spielende Person erhalten kein Managergehalt. Der Computerverein reserviert Geld für einen spielfähigen Kader und prüft die erwartete Liquidität bis zum nächsten Saisonabschluss. Er darf für Ablösen oder Gehälter keine neuen Schulden aufnehmen und nur vorhandene Mittel ausgeben. Bei Bedarf prüft er zuerst bezahlbare ablösefreie Spieler und reguläre Marktangebote; Verkäufe können Mittel freisetzen. Kann ein Verein trotz Planung niemanden finanzieren, ist die Balance von Einnahmen, Kosten und Marktangebot zu korrigieren, nicht das Ergebnis einer Partie heimlich zu manipulieren.

Beim menschlich geführten Verein bleibt bewusstes Risiko mit noch ungewissen Erfolgsprämien möglich. Ein negativer Schlusskontostand beendet die neue Karriere nicht, sondern wird ohne Zinsen vorgetragen. Die Sanierung sperrt Käufe mit Ablöse mindestens bis zum folgenden Saisonabschluss. Verkäufe bleiben in der regulären Transferphase möglich; ablösefreie Verpflichtungen sind währenddessen auf das Auffüllen bis zehn Profis begrenzt. Eigene Nachwuchsspieler dürfen gegen sofort bezahlbare Ausbildungsentschädigung übernommen werden. Ein dann erreichter negativer Schlusskontostand verlängert die Sanierung. Die spielende Person darf währenddessen zum Saisonwechsel ein passendes Vereinsangebot annehmen. Der alte Verein bleibt mit seiner geerbten Schuld und Sanierung KI-gesteuert, darf aber keine neuen Schulden einplanen. Alte Karrieren behalten ihren bisherigen Game-Over-Pfad.

Jugendarbeit wird durch ein jährlich festgelegtes Budget gesteuert. Beim eigenen Verein bedient die spielende Person dafür zum Saisonwechsel einen Slider; Computervereine wählen den Betrag nach Jugendkultur, Kaderbedarf und Finanzlage. Der Betrag wird zu Saisonbeginn vollständig bezahlt und bleibt während der Saison unverändert. Im nächsten Jahr kann er erhöht oder gesenkt werden. Höhere Jugendausgaben binden Geld, das dann nicht für teurere Profispieler verfügbar ist; niedrigere Ausgaben lassen mehr Spielraum auf dem Markt. Zum Start besitzt jeder Verein zwei bis vier Nachwuchskandidaten aus seiner Vorgeschichte, die ohne Übernahme nach Saison 2 ausscheiden. Neue Talente erscheinen danach ebenfalls zuerst in diesem vereinseigenen Nachwuchspool. Ein höheres Budget bringt mehr Kandidaten und etwas bessere Chancen auf gute Talente, aber keine garantierten Stars; bei hohem Budget sind ungefähr fünf bis sechs neue Kandidaten pro Saison vorgesehen. Die Wirkung beginnt teilweise in der Folgesaison und wird bei wiederholten Ausgaben über mehrere Jahre stärker. Bestehende Spielerfähigkeiten und früher erzeugte Talente werden nicht nachträglich angehoben. Poolspieler entwickeln sich ohne Profieinsätze nicht weiter. Der eigene Verein kann sie gegen 20–30 Prozent ihres Marktwerts als Ausbildungsentschädigung übernehmen; danach fallen Gehalt und Kaderplatz an. Unverpflichtete Kandidaten bleiben nach ihrer Entdeckung noch zwei vollständige Folgesaisons im Pool; ein Fund aus Saison 1 scheidet nach Abschluss von Saison 3 aus, ohne auf den Markt zu kommen. Die genauen Qualitätswahrscheinlichkeiten bleiben zur Kalibrierung offen.

Ein separates Ausbau- oder Budgetsystem für Stadion und Trainingsgelände ist vorerst nicht vorgesehen. Das Jugendbudget wird aus vorhandenen Mitteln bezahlt und einmalig gebucht. Es darf keine versteckte Sieggarantie erzeugen. Gehälter und ein spielfähiger Kader behalten Vorrang.

Jugendkultur verändert die Bereitschaft, Talente zu suchen und ihnen Einsätze zu geben. Sie hebt nicht automatisch die Fähigkeiten aller Jugendlichen an. Reale Entwicklung folgt für Mensch und KI denselben Einsatz- und Alterregeln. Eigene Nachwuchskandidaten sind ohne Sichtungskosten qualitativ bekannt; die genaue Qualitätsverteilung und der Anteil internationaler Talente bleiben zur Kalibrierung offen. Die Nationalität der neuen Talente entspricht überwiegend dem Land ihres Vereins, ein Teil kommt aus anderen Ländern; sie erzeugt keine Ausländerquote oder unmittelbare Spielstärke. Die Oberfläche zeigt Spielerfähigkeiten weiterhin nur als Farbstufen, auch in Trainer- und Vereinsansichten.

Auch bei vielen Kandidaten bleiben alle Poolspieler sichtbar; eine zusätzliche Anzeigegrenze gibt es nicht. Sortierung und Filter helfen bei bis zu ungefähr 18 gleichzeitig vorhandenen Spielern.

Ein Verein setzt sein Saisonziel aus Kaderqualität, Gegnerfeld, Finanzlage, jüngerer Entwicklung und eigener Ambition. Die Erwartung für eine Partie wird **vor** dem Spiel fixiert. Trainer werden ab ihrem dritten Pflichtspiel nach jeder Partie und am Saisonende an wiederholter Abweichung gemessen. Historisches Prestige erhöht den Anspruch nur in einem plausiblen Maß; ein inzwischen schwächerer Traditionsverein darf nicht so beurteilt werden, als hätte er automatisch den besten Kader. Pokal und Europacup erhalten eigene Erwartungen. Eine Entlassung verändert die institutionellen Parameter nicht und kostet keine Abfindung.

Die Vorstandsreaktion soll erklärbar sein: „Vier Spiele unter dem vorab erwarteten Ergebnis“, „Kaderplatzierung trotz guter Mittel verfehlt“ oder „Finanzlage erfordert eine andere Kaderplanung“. Eine reine Zufallsentlassung ohne sportlichen oder wirtschaftlichen Auslöser ist nicht vorgesehen. Die genauen Schwellen bleiben zur Kalibrierung offen.

## Angebote an die spielende Person

Zum Saisonwechsel kann nur ein anderer Ligaverein mit freiem Traineramt oder Interimstrainer ein Angebot machen. Null bis drei passende Angebote werden anhand der Reichweite und Ambition der anbietenden Vereine, der Leistung und des Rufs der spielenden Person sowie eines plausiblen Karriereschritts ausgewählt. Ein Spitzenklub muss nicht allein wegen einer guten Saison einen Manager aus einem kleineren Klub holen; umgekehrt dürfen kleine Vereine ambitionierte Manager anfragen. Ein abgelehnter Verein sucht danach einen KI-Trainer. Bei Annahme bleibt der bisher betreute Verein als Computerverein bestehen und sucht ebenfalls einen KI-Trainer nach den normalen Regeln. Der Ruf der spielenden Person kann bei längerer Unterleistung relativ zur Kadererwartung langsam sinken, obwohl ihr aktueller Verein sie nicht entlässt. Trainer, Kader und Ergebnisse der anderen Vereine werden dabei nicht umgeschrieben.

## Sichtbarkeit für Spielende

Ein Vereinsprofil sollte zu Karrierestart wenige verständliche Aussagen zeigen: Geschichte, aktuelles Ziel, finanzielle Lage, Jugendkultur und Geduld des Vorstands. Vor einer wichtigen Entscheidung sind Gründe sichtbar, etwa „Der Verein priorisiert einen bezahlbaren Torwart“ oder „Der Vorstand hält trotz Platz fünf am Trainer fest, weil der Kader entsprechend eingeschätzt wurde“. Langsame Änderungen erscheinen als mehrjährige Trends. Die Darstellung soll keine exakten versteckten KI-Gewichte oder Spielerfähigkeitszahlen veröffentlichen.

## Balance und Prüfkriterien

Die spätere Implementierung braucht reproduzierbare Karrieresimulationen mit festen Seeds über viele Saisons. Ausgewertet werden mindestens: Meister und Tabellenplätze je Klub, Abstand zwischen erwartetem und tatsächlichem Ergebnis, Varianz je Saison, Häufigkeit längerer Leistungsphasen, Trainerwechsel, Kadergröße, Kontostand, Gehaltsquote, Jugendminuten, Transfers und Managerangebote. Gesucht wird eine Welt, in der Favoriten oft, aber nicht garantiert vorne landen, Außenseiter selten, aber glaubhaft gewinnen können und einzelne schlechte Saisons Prestige nicht zerstören. Ein Verein darf nicht allein wegen seiner Profilkategorie dauerhaft unspielbar oder dauerhaft unbesiegbar sein.

Zusätzlich werden Extremfälle geprüft: mehrere schlechte Jahre eines Großklubs, wiederholte Erfolge eines kleinen Klubs, Kaderverlust durch Karriereenden, Trainerwechsel in einer Krise, Wechsel der spielenden Person und zehn oder mehr Saisons mit wachsendem Trainerpool. Alle finanziellen und personellen Veränderungen müssen als Ereignisse erklärbar und nach Neuladen einmalig bleiben.

## Offene Produktentscheidungen

1. Welche konkreten Startwerte erhalten die 48 bereits benannten Vereine? Die Städte, Namen und Farben sind festgelegt; finanzielle und sportliche Zahlen bleiben zu kalibrieren.
2. Wie hoch sind Grundbetrag, Sponsorengeld, Wettbewerbsprämien, Gehaltsgrenzen und Jugendbudget in den unterschiedlichen Vereinsprofilen?
3. Welche Leistung und welcher Ruf genügen für konkrete Managerangebote, und wie oft bleiben Stellen ohne passendes Angebot?
4. Welche mehrjährige Glättung verbindet gezahltes Jugendbudget, Vereins-Jugendkultur und neue Kandidaten?
