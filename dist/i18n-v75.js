/* Interface language is independent of career saves and game rules. */
(()=>{
 'use strict';
 const key='doppel6.language';
 const labels=new Map(`
Sprache	Language
Deutsch	German
MEISTERSCHAFT	CHAMPIONSHIP
KLEINES FELD. DEINE TAKTIK.	SMALL PITCH. YOUR TACTICS.
Dein Plan fürs Spiel.	Your game plan.
Fünf Feldspieler. Ein Torwart. Du bestimmst die Ordnung.	Five outfield players. One goalkeeper. You choose the formation.
AUFSTELLUNG	LINEUP
ANGRIFF ↑	ATTACK ↑
Aufstellungsraster	Lineup grid
MITTELFELD	MIDFIELD
ABWEHR	DEFENCE
LIGASPIEL	LEAGUE MATCH
Animiertes Fußballspiel	Animated football match
Bereit zum Anpfiff	Ready for kickoff
● Spieler wählen	● Select player
＋ Freies Feld antippen	＋ Tap an empty cell
Deine Mannschaft	Your team
Spieler antippen, Position und Ausrichtung festlegen.	Tap a player to set position and role.
Scouting:	Scouting:
Fähigkeiten werden bewusst nur ungefähr beschrieben. Alter, Form und Frische sind bekannt.	Abilities are shown as colour levels. Age, form and fitness are known.
Ausrichtung	Player role
Defensiv	Defensive
Balance	Balanced
Offensiv	Attacking
Teamtaktik	Team tactics
Grundordnung	Formation
Kompakt	Compact
Mutig	Bold
Pressing	Pressing
Abwarten	Wait
Früh angreifen	Press early
Passspiel	Passing
Kurze Pässe	Short passes
Schnell nach vorne	Quick forward passes
DEIN MATCHPLAN	YOUR MATCH PLAN
Ausgewogenes 2-2-1	Balanced 2-2-1
Stabile Staffelung mit kurzen Passwegen.	Stable shape with short passing lanes.
VON DER SEITENLINIE	FROM THE SIDELINE
Dein Team spielt.	Your team is playing.
Statistik	Statistics
Heimteam	Home team
Gastteam	Away team
Schüsse	Shots
Ecken	Corners
Fouls	Fouls
Freistöße	Free kicks
Ballbesitz	Possession
Passquote	Pass completion
Spielverlauf	Match events
Ligaspiel starten	Start league match
Zurück zur Taktik	Back to tactics
Ca. 100 Sekunden · 2 × 45 Ingame-Minuten · Keine Änderungen nach Anpfiff	About 100 seconds · 2 × 45 game minutes · No changes after kickoff
Deine Farben. Dein Fußball.	Your colours. Your football.
DEIN VEREIN. DEIN FUSSBALL.	YOUR CLUB. YOUR FOOTBALL.
Willkommen bei Doppel 6.	Welcome to Doppel 6.
Fünf Feldspieler. Ein Torwart. Und dein Plan.	Five outfield players. One goalkeeper. Your plan.
Deine nächste Fußballgeschichte	Your next football story
Gründe deinen eigenen Verein und bring deine Taktik auf den Platz.	Create your own club and bring your tactics onto the pitch.
Neues Spiel	New game
Vereinsname	Club name
Vereinsfarben	Club colours
Hauptfarbe	Primary colour
Zweitfarbe	Secondary colour
Drittfarbe	Third colour
Vereinswappen	Club crest
Heimtrikot	Home kit
Auswärtstrikot	Away kit
Torwarttrikot	Goalkeeper kit
Einfarbig	Plain
Mittelstreifen	Centre stripe
Querstreifen	Horizontal stripes
Zweifarbig	Two colours
Diagonal	Diagonal
Nadelstreifen	Pinstripes
Limette	Lime
Rot	Red
Blau	Blue
Violett	Violet
Türkis	Turquoise
Koralle	Coral
Silber	Silver
Orange	Orange
Gold	Gold
Kreis	Circle
Schild	Shield
Viereck	Square
Pur	Plain
Streifen	Stripes
Winkel	Chevron
Vereinslogo	Club logo
Wähle eines von sechs Mustern.	Choose one of six patterns.
Wähle das erste Trikot für deinen Torwart. Es gilt für Heim- und Auswärtsspiele.	Choose your goalkeeper's first kit. It applies to home and away matches.
Gewähltes Torwarttrikot	Selected goalkeeper kit
Torwarttrikot wählen	Choose goalkeeper kit
Dein Verein erhält zusätzlich ein festes zweites Torwarttrikot. Im Match wird bei Bedarf wegen des Kontrasts zwischen beiden gewechselt.	Your club also gets a fixed second goalkeeper kit. During matches, the game switches between them when needed for contrast.
Form und Verzierung verwenden deine Vereinsfarben.	The shape and decoration use your club colours.
Aktuelle Logovorschau	Current logo preview
Weiter zur Kaderwahl	Continue to squad selection
Heim und Auswärts	Home and away
STARTKADER	STARTING SQUAD
Wähle Erfahrung und Zukunft.	Choose experience and potential.
Beste Fähigkeiten	Top abilities
Zurück zum Verein	Back to club
Ausgewogenen Kader wählen	Choose balanced squad
Die Positions- und Altersvorgaben müssen vollständig erfüllt sein.	All position and age requirements must be met.
Höchstens zwei Spieler sind jünger als 24.	At most two players may be younger than 24.
Mindestens drei müssen 31 oder älter sein.	At least three must be 31 or older.
Der Startkader ist bewusst erfahren.	The starting squad is intentionally experienced.
Österreich	Austria
Australien	Australia
Kroatien	Croatia
Polen	Poland
Slowakei	Slovakia
Ungarn	Hungary
Tschechien	Czechia
JAHRE	years
ALTER	AGE
GEHÄLTER	SALARIES
SECHSERLIGA	SIX-TEAM LEAGUE
Für die neue Saison	For the new season
Menü	Menu
SPONSORWAHL	SPONSOR SELECTION
TRANSFERSCHLUSS	TRANSFER DEADLINE
GEHALTSABSCHLUSS	SALARY SETTLEMENT
Wähle deinen Hauptsponsor.	Choose your main sponsor.
Der Vertrag gilt für eine Saison und kann danach nicht mehr gewechselt werden.	The contract lasts one season and cannot be changed afterwards.
SICHERER SPONSOR	SAFE SPONSOR
ERFOLGSSPONSOR	RESULTS SPONSOR
OFFENSIVSPONSOR	ATTACKING SPONSOR
FIXUM	FIXED PAYMENT
VARIABEL	VARIABLE
keine Bedingung	no condition
bei Platz 1–3	for a top-three finish
ab 12 Ligatoren	after 12 league goals
Hauptsponsor wählen	Choose main sponsor
Nächstes Spiel	Next match
Ablösefreie Spieler	Free agents
Ablösefrei verpflichten	Sign free agent
Keine Ablöse, aber das Jahresgehalt zählt vollständig. Neue Spieler sind ab dem nächsten Spiel einsetzbar.	No transfer fee, but the full annual salary applies. New players can play from the next match.
Pro Wert nur Spieler mit mindestens einem Eintrag, maximal die Top 10. „Zu null“ gilt nur für Torhüter. Fouls sind begangene Fouls. Ergebnisse paralleler KI-Spiele werden vereinfacht simuliert; ältere KI-Ligaspiele können nur bei Zu-null-Spielen und Gegentoren ergänzt werden.	Each category shows only players with at least one recorded event, up to the top 10. Clean sheets apply only to goalkeepers. Fouls are committed fouls. Parallel AI matches use a simplified simulation; older AI league matches can be completed only for clean sheets and goals conceded.
Jahresgehälter	Annual salaries
Nach Gehältern heute	After salaries today
Es fehlen derzeit 1230 Credits für die Gehälter. Siege, Unentschieden können die Lücke schließen.	The club is currently 1230 Credits short of its salaries. Wins and draws can close the gap.
Vereinsidentität	Club identity
Gegner auf Augenhöhe	evenly matched opponent
Kadercheck	Squad check
Aktuelle Ligatabelle	Current league table
Nachrichten	News
alles gelesen	all read
Noch keine Nachrichten.	No news yet.
Gespeichert	Saved
Vorstadt FK ist ein	Vorstadt FK is an
Form der letzten fünf Spiele: Noch keine Spiele	Form in the last five matches: No matches yet
dein Verein	your club
Verein gründen	Create club
Abbrechen	Cancel
Gespeicherte Spiele	Saved games
Automatisch gespeichert auf diesem Gerät und in diesem Browser. Laufende Matches werden nicht gespeichert.	Saved automatically on this device and in this browser. Matches in progress are not saved.
Spieldaten teilen	Share match data
Nur lokal spielen	Play locally only
Speichern & zum Startscreen	Save and return to start
Extras & Einstellungen	Extras & settings
Einstellungen & Speicher	Settings & saves
Impressum	Legal notice
Datenschutz	Privacy
Rechtliche Hinweise	Legal information
Cookies & Speicher	Cookies & storage
Hinweise schließen	Close legal information
Schließen	Close
Medieninhaber und Betreiber	Site owner and operator
Inhaltliche Ausrichtung	Nature of the site
Doppel 6 ist ein kostenloses Fußballmanager-Browserspiel. Die Seite informiert über das Spiel und stellt es zur Nutzung bereit.	Doppel 6 is a free browser-based football manager game. This site describes the game and makes it available to play.
Die Credits im Spiel sind eine fiktive Spielwährung. Es finden darüber keine Echtgeldzahlungen statt.	Credits are fictional in-game currency. No real-money payments take place through them.
Verantwortlicher	Data controller
Kontakt:	Contact:
Aufruf der Website	Accessing the website
Die Seite wird bei World4You Internet Services GmbH gehostet. Bei einem Aufruf verarbeitet der Webserver technische Verbindungsdaten, insbesondere IP-Adresse, Zeitpunkt, angeforderte Adresse und Browserangaben, um die Seite auszuliefern und den Betrieb zu sichern. Grundlage ist das berechtigte Interesse am sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Angaben zur Verarbeitung durch den Hoster stehen in dessen	The site is hosted by World4You Internet Services GmbH. When you visit, the web server processes technical connection data, especially your IP address, the time, the requested address and browser details, to deliver the site and keep it secure. The legal basis is the legitimate interest in operating the website securely (Article 6(1)(f) GDPR). Details of the host's processing are in its
Datenschutzerklärung	privacy policy
Spielstände auf deinem Gerät	Saves on your device
Spielstände, die Sprachwahl und die Wahl zur Datenübertragung werden im lokalen Speicher deines Browsers abgelegt. Spielstände werden nicht an den Spielserver übertragen. Du kannst einzelne Spielstände im Startbildschirm löschen oder exportieren. Beim Löschen der Website-Daten im Browser verschwinden auch die lokal gespeicherten Spielstände und Einstellungen.	Saves, your language choice and your data-sharing choice are stored in your browser's local storage. Saves are not sent to the game server. You can delete or export individual saves on the start screen. Clearing the website's browser data also removes locally stored saves and settings.
Freiwillige Spielstatistiken	Optional match statistics
Nur wenn du „Spieldaten teilen“ aktivierst, sendet das Spiel nach einem Match Ergebnis, Taktik und Spielerstatistiken an den eigenen Server. Die gesendeten Daten enthalten keine Vereins- oder Spielernamen und keine dauerhafte Nutzerkennung; pro Match wird eine zufällige Kennung erzeugt. Die Statistikdatei enthält keine IP-Adresse. Bei der HTTP-Übertragung verarbeitet der Hoster die IP-Adresse technisch. Grundlage der freiwilligen Übertragung ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit unter „Cookies & Speicher“ für künftige Spiele widerrufen. Die bis dahin erfolgte Verarbeitung bleibt rechtmäßig.	Only if you enable “Share match data” does the game send the result, tactics and player statistics to its server after a match. The data contains no club or player names and no persistent user identifier; a random ID is generated for each match. The statistics file does not contain an IP address. The host processes the IP address technically during the HTTP transfer. This optional transfer is based on your consent (Article 6(1)(a) GDPR). You can withdraw consent for future matches at any time under “Cookies & storage”. Processing carried out before withdrawal remains lawful.
Statistikdateien, die älter als 90 Tage sind, werden beim nächsten Eingang einer Spielzusammenfassung gelöscht. Da die Datensätze keine dauerhafte Nutzerkennung enthalten, können bereits übertragene Zusammenfassungen nicht zuverlässig einem Spielstand zugeordnet und einzeln entfernt werden.	Statistics files older than 90 days are deleted when the next match summary arrives. Because the records contain no persistent user identifier, previously sent summaries cannot reliably be linked to a save and removed individually.
Empfänger und Rechte	Recipients and your rights
World4You erbringt das Hosting. Im Spielcode werden keine Werbe- oder Analyseangebote Dritter eingebunden. Du kannst dich wegen Auskunft, Berichtigung, Löschung, Einschränkung oder Widerspruch an die oben genannte E-Mail-Adresse wenden. Außerdem besteht ein Beschwerderecht bei der	World4You provides hosting. The game code includes no third-party advertising or analytics services. You can contact the email address above to request access, correction, deletion or restriction of your data, or to object to processing. You also have the right to complain to the
österreichischen Datenschutzbehörde	Austrian Data Protection Authority
Cookies und Speichereinstellungen ansehen	View cookies and storage settings
Was wird gespeichert?	What is stored?
Der Spielcode setzt keine Cookies. Für Spielstände nutzt Doppel 6 den lokalen Speicher des Browsers (Local Storage). Dort liegen auch deine Sprachwahl und deine Wahl zur freiwilligen Übertragung von Spielstatistiken. Spielstände kannst du im Startbildschirm einzeln löschen; die Übertragungswahl kannst du jederzeit ändern. Beim Löschen der Website-Daten im Browser verschwinden diese Einträge.	The game code sets no cookies. Doppel 6 uses your browser's local storage for saves, your language choice and your choice about optional match statistics. You can delete saves individually on the start screen and change your sharing choice at any time. Clearing the website's browser data removes these entries.
Für das Spielen und Speichern auf diesem Gerät ist keine Zustimmung zur Übertragung von Spielstatistiken nötig. Ohne ausdrückliche Aktivierung bleibt sie ausgeschaltet.	You do not need to agree to send match statistics to play and save on this device. Sharing remains off unless you enable it.
Mit „Spieldaten teilen“ erlaubst du die Übertragung künftiger Match-Zusammenfassungen an den eigenen Server. Mit „Nur lokal spielen“ widerrufst du diese Wahl jederzeit für künftige Spiele.	“Share match data” allows future match summaries to be sent to the game's server. “Play locally only” withdraws that choice for future matches at any time.
Datenschutzhinweise lesen	Read privacy information
Spieldaten teilen ist aktiviert.	Match data sharing is enabled.
Nur lokal spielen ist aktiv.	Local-only play is active.
Die Auswahl konnte nicht gespeichert werden.	Your choice could not be saved.
Datenschutz & lokale Spielstände	Privacy and local saves
Doppel 6 speichert Spielstände in deinem Browser. Freiwillige Spielstatistiken werden nur nach deiner Aktivierung übertragen. Der Spielcode setzt keine Cookies.	Doppel 6 stores saves in your browser. Optional match statistics are sent only after you enable sharing. The game code sets no cookies.
Hinweise und Einstellungen ansehen	View information and settings
Freiwillig: Nach jedem Match werden Ergebnis, Taktik und Spielerstatistiken an den eigenen Server gesendet. Ohne Vereinsnamen, Spielernamen oder dauerhafte Nutzerkennung. Mehr dazu unter Datenschutz.	Optional: after each match, the result, tactics and player statistics are sent to the game's server. No club names, player names or persistent user identifier are included. See Privacy for details.
Deine neue Fußballwelt	Your new football world
Sechs Länder. 36 spielbare Ligavereine. Wähle Land und Verein und sieh dir den Kader vor der Entscheidung an. Bis zu fünf Vereinswelten können gespeichert werden.	Six countries. 36 playable league clubs. Choose a country and club, and review the squad before deciding. You can save up to five club careers.
Neues Spiel starten	Start new game
Bisherige Sechserliga	Original six-team league
Der bisherige Spielmodus bleibt während des Ausbaus der neuen Welt spielbar.	The original game mode remains playable while the new world grows.
Bisherige Liga starten	Start original league
Spielstart	New game setup
Land	Country
Verein	Club
Kader	Squad
Zur Startseite	Back to start
Wähle dein Land	Choose your country
Jedes Land hat sechs Ligavereine und zwei Pokalvereine.	Each country has six league clubs and two cup clubs.
6 Vereine ansehen	View 6 clubs
Alle Länder	All countries
Tippe auf einen Verein, um Geschichte und Kader anzusehen.	Tap a club to see its history and squad.
Vereinsfarben:	Club colours:
Startkader	Starting squad
Elf Profis · Spieler öffnen für das vollständige Profil.	Eleven professionals · Open a player for the full profile.
Verein übernehmen	Take charge of club
Öffnen	Open
Exportieren	Export
Endgültig löschen	Delete permanently
Löschen	Delete
Für eine neue Vereinswelt zuerst einen Spielstand exportieren oder löschen.	Export or delete a save before starting a new club career.
Gespeicherte Vereinswelten konnten nicht gelesen werden.	Saved club careers could not be read.
Vereinswelten werden geladen …	Loading club careers …
Vereinswelten laden	Loading club careers
Karrieremenü	Career menu
Aktueller Kader	Current squad
Elf fest gespeicherte Profis · Spieler öffnen für das Profil.	Eleven saved professionals · Open a player to view the profile.
Erfolge dieser Karriere	Career honours
Noch kein Titel gewonnen.	No title won yet.
Spielerprofil schließen	Close player profile
Rückennummer	Shirt number
Form	Form
Fitness	Fitness
Spielertyp	Player type
Fähigkeiten	Abilities
Spielerstatistiken folgen mit den Live-Matches.	Player statistics will appear with live matches.
Übersicht	Overview
Transfers	Transfers
Wettbewerbe	Competitions
Kalender	Calendar
Statistiken	Statistics
Saison	Season
Spieltag	Matchday
Spieler	Player
Trainer	Coach
Verein	Club
Tabelle	Standings
Liga	League
Nationaler Pokal	National cup
Europacup	European cup
Ergebnisse	Results
Weiter	Continue
Zurück	Back
Pause	Pause
Fortsetzen	Resume
Aufstellung	Lineup
Taktik	Tactics
Taktik & Wechsel	Tactics & substitutions
Wechsel	Substitutions
Torwart	Goalkeeper
Verteidigung	Defence
Abwehr	Defence
Mittelfeld	Midfield
Angriff	Attack
Technik	Technique
Abschluss	Finishing
Zweikampf	Tackling
Stellungsspiel	Positioning
Geschwindigkeit	Speed
Kondition	Stamina
Luftspiel	Aerial ability
Torwartspiel	Goalkeeping
Körperlich	Physical
Farbstufen	Colour levels
durchschnittlich	average
solide	solid
stark	strong
sehr stark	very strong
eher schwach	rather weak
Linksfuß	left-footed
Rechtsfuß	right-footed
Jahre	 years
frisch	fresh
einsatzbereit	ready
leicht müde	slightly tired
müde	tired
erschöpft	exhausted
sehr schwach	very weak
schwach	weak
normal	normal
gut	good
sehr gut	very good
Anpfiff	Kickoff
Halbzeit	Half-time
Abpfiff	Full-time
Tor	Goal
Tore	Goals
Vorlagen	Assists
Zu-null-Spiele	Clean sheets
Gegentore	Goals conceded
Elfmeter	Penalty
Verwarnung	Warning
Sieg	Win
Niederlage	Defeat
Unentschieden	Draw
Heim	Home
Gast	Away
Auswärts	Away
Datum	Date
Alter	Age
Position	Position
Nationalität	Nationality
Marktwert	Market value
Gehalt	Salary
Vertrag	Contract
Verträge	Contracts
Finanzen	Finances
Kontostand	Balance
Sponsoren	Sponsors
Nachwuchs	Youth players
Jugend	Youth
Profil	Profile
Karriere	Career
Chronik	History
Erfolge	Honours
Auszeichnungen	Awards
Mannschaft	Team
Spielbericht	Match report
Ergebnisse und Saisonstatistik	Results and season statistics
Turnierbaum	Tournament bracket
Zur Vereinszentrale	Back to club centre
Spielende · Noten von 1 bis 10 · T = Tore · V = Vorlagen	Full-time · Ratings from 1 to 10 · G = Goals · A = Assists
Teamstatistik	Team statistics
SIEGER	WINNER
Aufs Tor	On target
Gewonnene Zweikämpfe	Duels won
Hohe Pässe	High passes
Flanken	Crosses
Kopfballschüsse	Headers
Volleyschüsse	Volley shots
Eingewechselt	Came on
Ausgewechselt	Went off
Note	Rating
Pt.	Pts
Ligatabelle	League table
Noch keine Ergebnisse in dieser Runde.	No results in this round yet.
Saisonrückblick	Season review
Rückblick	Review
Deine Saison	Your season
Kaderübersicht	Squad overview
Pokale & Awards	Cups & awards
Saisonübersicht	Season summary
Zum Saisonwechsel	Continue to season transition
Nicht qualifiziert	Did not qualify
Keine Partie	No match
Teilgenommen	Participated
Ausgeschieden	Eliminated
Remis	Draws
Titel	Title
🏆 Titel	🏆 Title
Titel gewonnen	Title won
Meisterschaft	Championship
Mannschaftspokal	Team trophy
Mannschaftspokale	Team trophies
gewonnen.	won.
Deine Liga	Your league
Meister	Champion
Pokalsieger	Cup winner
Europacupsieger	European cup winner
Noch offen	To be decided
Torschützenkönig · Top 3	Top scorers · Top 3
Spieler der Saison · Top 3	Players of the season · Top 3
Rangfolge der Spieler der Saison: Durchschnittsnote, Tore und Vorlagen. Mindestens drei Einsätze und 135 Minuten.	Player of the season ranking: average rating, goals and assists. At least three appearances and 135 minutes.
Nach der Ligaphase	After the league phase
zuletzt	last match
gesamt	aggregate
i. E.	on penalties
Keine qualifizierten Spieler.	No eligible players.
Ruf	Reputation
Jahresbudget	Annual budget
Das Budget wird einmal zu Saisonbeginn aus dem Kassenstand bezahlt. Mehrjährige Förderung erhöht die Zahl und die Chance auf stärkere Talente, ohne einen Fund zu garantieren.	The budget is paid from the club balance once at the start of the season. Investing across several years increases the number of prospects and the chance of stronger talent, without guaranteeing a find.
Du bleibst bei deinem Verein.	You stay at your club.
Diesmal gibt es kein passendes Stellenangebot.	There is no suitable job offer this time.
freier Kaderplatz	free squad place
freie Kaderplätze	free squad places
Kandidat	candidate
Kandidaten	candidates
Erinnerung schließen	Close reminder
Bestätigung schließen	Close confirmation
Vertrag	contract
Verträge	contracts
Nach dem 8. Ligaspieltag laufen	After the eighth league match,
deines Vereins zum Saisonende aus. Du kannst jetzt noch Verlängerungen verhandeln.	at your club expire at season end. You can still negotiate extensions.
wurde in den Profikader aufgenommen.	has joined the professional squad.
Verein übernehmen	Take charge of club
Kassenstand	Balance
Von	From
Zu	To
Keine Wechsel.	No transfers.
Ausbildungsentschädigung	Training compensation
Gehalt	Salary
bis Saison	until season
bis Ende Saison	until end of season
Fähigkeiten sind im Profil als Farbstufen sichtbar. Entwicklung beginnt erst nach einer Übernahme durch tatsächliche Pflichtspieleinsätze.	Abilities appear as colour levels in the profile. Development begins only after joining the professional squad and playing competitive matches.
Entlassene Nachwuchsspieler sind diese und die nächste Saison für alle Vereine ablösefrei; danach beenden sie ohne Vertrag ihre Laufbahn.	Released youth players are free agents for this season and the next; after that, they retire if they have no contract.
Keine Kandidaten in dieser Auswahl.	No candidates match this selection.
In den Profikader übernehmen	Promote to the professional squad
Entlassen	Release
Ende Saison	End of season
Neue Saison	New season
Dein Angebot:	Your offer:
Gegenforderung:	Counteroffer:
Die nächste Verhandlungsrunde öffnet am	The next negotiation round opens on
Auch die spätere Verhandlungsrunde ist abgeschlossen.	The later negotiation round is also complete.
Vor Vertragsende ist kein weiteres Verhandlungsfenster möglich.	No further negotiation window is available before the contract ends.
Ende Saison	End of season
Verfügbar:	Available:
Maximal investierbar:	Maximum investment:
Du übernimmst den Verein.	You take charge of the club.
Deine Station bei diesem Verein endet.	Your time at this club ends.
Zum Verein gekommen	Joined the club
Verein verlassen	Left the club
Keine Zugänge.	No arrivals.
Keine Abgänge.	No departures.
Die letzte Partie ist gespielt.	The final match has been played.
NÄCHSTER SCHRITT	NEXT STEP
Sponsor wählen	Choose sponsor
SAISONÜBERBLICK	SEASON OVERVIEW
Saisonüberblick	Season overview
NÄCHSTER GEGNER ·	NEXT OPPONENT ·
Nächster Gegner ·	Next opponent ·
gegen	vs
Deine letzten fünf Spiele	Your last five matches
Deine Wettbewerbe	Your competitions
Ligaphase · Tabelle	League phase · Standings
K.-o.-Duelle	Knockout ties
Die K.-o.-Duelle stehen nach der Ligaphase fest.	Knockout ties are set after the league phase.
Persönliche Awards	Individual awards
Torschützenkönig	Top scorer
Noch nicht vergeben	Not awarded yet
Spieler der Saison	Player of the season
Saison auf einen Blick	Season at a glance
Noch keine Ligaspiele	No league matches yet
Viertelfinale	Quarter-final
Halbfinale	Semi-final
Finale	Final
Saison auswählen	Select season
aktuell	current
Andere Länder	Other countries
Wettbewerbe anzeigen	Show competitions
Dein Spielplan	Your fixtures
Noch keine Partie gespielt.	No match played yet.
Ligastatistik	League statistics
Pokalstatistik	Cup statistics
Zu null	Clean sheets
Elfmeter verwandelt	Penalties scored
Elfmeter verschossen	Penalties missed
In dieser Saison ist noch kein Wert erfasst.	No value has been recorded this season.
Verein heute	Club today
Manager: Du	Manager: You
In dieser Karriere noch kein Titel.	No title won in this career yet.
Kaderbewegungen	Squad changes
Transferhistorie	Transfer history
Saison der Transferhistorie	Transfer history season
Zugänge	Arrivals
Abgänge	Departures
Keine Zugänge in dieser Saison.	No arrivals this season.
Keine Abgänge in dieser Saison.	No departures this season.
Spielerprofile öffnen.	Open player profiles.
Vereins- und Trainerchronik	Club and coach history
Noch keine Trainer- oder Managerwechsel.	No coach or manager changes yet.
Vereinsfinanzen	Club finances
GEPLANTE GEHÄLTER	PLANNED SALARIES
Geplante Gehälter	Planned salaries
PROFESSIONALS	PROFESSIONALS
STATUS	STATUS
Regulär	Normal
Letzte Buchungen	Latest transactions
Jahresgrundbetrag	Annual base payment
Managerlaufbahn	Manager career
Ruf: Solide	Reputation: Solid
Vereinsprofil	Club profile
Spielerprofil ansehen	View player profile
Profil ansehen	View profile
Jahresgehalt	Annual salary
Beginn	Start
Vertrag bis	Contract until
Gegenforderungen	Counteroffers
Vertragsverhandlung	Contract negotiation
Dein abgegebenes Angebot	Your submitted offer
Gegenforderung	Counteroffer
Laufzeit	Contract length
Angebot senden	Send offer
Tabelle seitlich scrollen, um alle Spalten zu sehen.	Scroll the table sideways to see all columns.
Fixum erhalten	Upfront payment received
Bonusziele	Bonus targets
Prüfe Angebote und Verhandlungen im Transfermenü.	Review offers and negotiations in the transfer menu.
Transfers öffnen	Open transfers
Annehmen	Accept
Ablehnen	Decline
Neues Gehalt	New salary
Einmal verbessern	Improve once
Transferbilanz	Transfer balance
Gehälter zum Saisonende	Salaries at season end
Gemeinsamer Spielermarkt	Shared player market
Eingegangene Angebote	Offers received
Deine Angebote	Your offers
Keine Spieler in dieser Auswahl.	No players match this selection.
Verträge prüfen	Review contracts
Später	Later
Zu den Verträgen	Go to contracts
Neu im Profikader	New to the professional squad
Zum Kader	Go to squad
Veränderungen zum Saisonende	Changes at season end
Vertrag beendet · verlässt den Verein ablösefrei	Contract ended · leaves the club on a free transfer
Keine qualifizierten Spieler.	No eligible players.
In dieser Saison ging kein persönlicher Award an deinen Verein.	No player at your club received an individual award this season.
Weitere Sieger	Other winners
Saisonwechsel	Season transition
Stellenangebote	Job offers
Jahresbudget	Annual budget
Budget bestätigen und Saison starten	Confirm budget and start season
Keine Wechsel.	No transfers.
Vereinseigener Nachwuchs	Club youth players
Keine Kandidaten in dieser Auswahl.	No candidates match this selection.
Nachwuchskandidat	Youth candidate
Ausbildungsentschädigung	Training compensation
Künftiges Jahresgehalt	Future annual salary
Ausgewechselter Spieler fehlt auf dem Feld.	The substituted player is missing from the pitch.
Bitte eine gültige verhandelbare Ablöse ab 10 Credits eingeben.	Enter a valid negotiable fee of at least 10 Credits.
Bitte öffne die laufenden Verhandlungen und schließe sie ab.	Open the ongoing negotiations and complete them.
Das Angebot ist inzwischen nicht mehr ausführbar.	This offer can no longer be completed.
Das Angebot ist nicht mehr offen.	This offer is no longer open.
Das Jugendbudget ist nicht verfügbar oder nicht gedeckt.	The youth budget is unavailable or cannot be funded.
Das Sponsorangebot ist nicht mehr wählbar.	This sponsor offer can no longer be selected.
Das Vertragsangebot ist ungültig.	The contract offer is invalid.
Das neue Gehalt muss höher sein.	The new salary must be higher.
Der Anpfiff ist bereits erfolgt.	The match has already kicked off.
Der KI-Verein kann den Vertrag nicht finanzieren.	The AI club cannot afford the contract.
Der Kader hat bereits 14 Profis.	The squad already has 14 professionals.
Der Profikader hat bereits 14 Spieler.	The professional squad already has 14 players.
Computermannschaften dürfen höchstens drei Torhüter im Kader haben.	Computer-controlled teams may have at most three goalkeepers in their squad.
Diese Torwartfreistellung ist nicht möglich.	This goalkeeper cannot be released in the current situation.
Der Spieler gehört bereits einem Profikader an.	The player is already in a professional squad.
Der Verein kann die Ausbildungsentschädigung nicht bezahlen.	The club cannot pay the training compensation.
Der Verein kann dieses Angebot nicht finanzieren.	The club cannot afford this offer.
Der Verein muss mindestens zehn Profis und einen Torwart behalten.	The club must keep at least ten professionals and one goalkeeper.
Der Vertrag ist ungültig oder nicht finanzierbar.	The contract is invalid or unaffordable.
Der Wechsel ist inzwischen nicht mehr möglich.	The transfer is no longer possible.
Der Weltkalender konnte nicht abgeschlossen werden.	The world calendar could not be completed.
Die Europacup-Qualifikation ist ungültig.	European cup qualification is invalid.
Die Forderung kann nur im laufenden Transferfenster gesenkt werden.	The asking price can only be lowered during the open transfer window.
Die Gegenforderung muss über dem letzten Gebot liegen.	The counteroffer must exceed the last bid.
Die Mannschaft ist nicht vollständig.	The team is incomplete.
Die Partie ist beendet.	The match is over.
Die Partie ist noch nicht beendet.	The match has not ended yet.
Die Saison ist noch nicht abgeschlossen.	The season has not ended yet.
Die Startelf kann nur vor Anpfiff geändert werden.	The starting lineup can only be changed before kickoff.
Die Trainerstelle ist nicht mehr frei.	The coaching job is no longer available.
Die Transferphase ist nicht offen.	The transfer window is closed.
Die Vereinswelt ist unvollständig.	The club career is incomplete.
Die Vereinswelt-Datei ist unvollständig oder beschädigt.	The club career file is incomplete or damaged.
Die gespeicherten Vereinswelten sind ungültig.	The saved club careers are invalid.
Die neue Forderung muss mindestens 10 Credits betragen und niedriger sein als bisher.	The new asking price must be at least 10 Credits and lower than before.
Diese Ablöse ist nicht finanzierbar.	This transfer fee is unaffordable.
Diese Positionen können nicht getauscht werden.	These positions cannot be swapped.
Diese Vereinswelt wurde nicht gefunden.	This club career was not found.
Diese Vereinswelt-Datei hat ein nicht unterstütztes Format.	This club career file has an unsupported format.
Dieser Nachwuchsspieler kann nicht entlassen werden.	This youth player cannot be released.
Dieser Nachwuchsspieler steht nicht mehr zur Verfügung.	This youth player is no longer available.
Dieser Spieler ist bereits vereinslos.	This player is already a free agent.
Dieser Startelftausch ist nicht zulässig.	This starting lineup swap is not allowed.
Dieser Vertrag kann nicht verlängert werden.	This contract cannot be renewed.
Dieser Wechsel ist nicht zulässig.	This substitution is not allowed.
Dieses Ablöseangebot kann nicht mehr geändert werden.	This transfer fee offer can no longer be changed.
Dieses Angebot ist außerhalb der Transferphase nicht möglich.	This offer is unavailable outside the transfer window.
Dieses Folgeangebot ist nicht gültig.	This follow-up offer is invalid.
Dieses Kaufangebot ist nicht mehr offen.	This purchase offer is no longer open.
Dieses Stellenangebot ist nicht verfügbar.	This job offer is unavailable.
Dieses Verkaufsangebot ist nicht mehr verfügbar.	This sale listing is no longer available.
Dieses Vertragsangebot kann nicht mehr geändert werden.	This contract offer can no longer be changed.
Dieses eigene Verkaufsangebot ist nicht aktiv.	This sale listing is no longer active.
Doppelte Spiel-ID.	Duplicate match ID.
Ein Landeswettbewerb ist noch nicht abgeschlossen.	A national competition has not ended yet.
Ein Spiel der abgelaufenen Saison fehlt.	A match from the completed season is missing.
Ein neues Gebot ist erst im nächsten Transferfenster möglich.	A new bid is only possible in the next transfer window.
Es liegt keine offene Vereinsentscheidung vor.	There is no open club decision.
Es sind höchstens zwei Wechsel möglich.	At most two substitutions are allowed.
Europacup-Heimrecht konnte nicht verteilt werden.	European cup home advantage could not be assigned.
Für den Saisonstart brauchst du mindestens zehn Profis und einen Torwart. Der letzte Transfertag bleibt offen.	You need at least ten professionals and one goalkeeper to start the season. The final transfer day stays open.
Für den Saisonstart brauchst du mindestens zehn Profis, einen Torwart und fünf Feldspieler. Der letzte Transfertag bleibt offen.	You need at least ten professionals, one goalkeeper and five outfield players to start the season. The final transfer day stays open.
Nach dem fünften Tag braucht jeder Verein mindestens zehn Profis, einen Torwart und fünf Feldspieler. Offene Angebote werden nach Fristablauf automatisch abgelehnt.	After the fifth day every club needs at least ten professionals, one goalkeeper and five outfield players. Open offers expire at the deadline.
Kader für das nächste Spiel vervollständigen	Complete the squad for the next match
Für eine Partie brauchst du mindestens einen Torwart und fünf Feldspieler. Vereinslose Spieler können auch jetzt verpflichtet werden.	A match needs at least one goalkeeper and five outfield players. Free agents can still be signed now.
Dein Kader ist voll. Du kannst einen Torwart freistellen; das bis dahin angefallene Gehalt bleibt fällig.	Your squad is full. You can release a goalkeeper; salary accrued so far remains payable.
Kader unvollständig	Squad incomplete
Kader vervollständigen	Complete squad
Ablösefreies Angebot auswerten	Resolve free-agent offer
Torwart freistellen? Das bis dahin angefallene Gehalt bleibt fällig.	Release the goalkeeper? Salary accrued so far remains payable.
Für diese Aufstellung fehlen Profis.	There are not enough professionals for this lineup.
Für diesen Spieler besteht bereits ein Angebot.	An offer for this player already exists.
Für diesen Spieler gab es in diesem Transferfenster bereits ein Verkaufsangebot.	This player has already been listed for sale in this transfer window.
Für diesen Spieler liegt bereits ein Angebot vor oder lag eines vor.	An offer for this player exists or existed already.
Für diesen Spieler läuft bereits eine Verhandlung.	A negotiation for this player is already in progress.
In Abwehr, Mittelfeld und Angriff muss jeweils mindestens ein Spieler stehen.	At least one player must be placed in defence, midfield and attack.
Kein beendetes eigenes Spiel vorhanden.	No completed match for your club is available.
Maximal fünf Vereinswelten.	A maximum of five club careers is allowed.
Maximal fünf Vereinswelten. Exportiere oder lösche zuerst einen Spielstand.	You can save up to five club careers. Export or delete a save first.
Nach der Ablöseeinigung kann die Verhandlung nicht mehr beendet werden.	The negotiation cannot be ended after the transfer fee is agreed.
Nach einer Ablöseeinigung kann der Spieler nicht mehr zurückgezogen werden.	The player cannot be withdrawn after the transfer fee is agreed.
Nur Feldspieler können im Raster verschoben werden.	Only outfield players can be moved on the grid.
Nur ein Ligaverein kann übernommen werden.	You can only take charge of a league club.
Preis, Gehalt oder Laufzeit sind ungültig.	The fee, salary or contract length is invalid.
Spieler können nur während des Transferfensters angeboten werden.	Players can only be listed during the transfer window.
Torwart und Feldspieler können ihre Position nicht tauschen.	A goalkeeper and outfield player cannot swap positions.
Traineramt ist bereits besetzt.	The coaching job is already filled.
Trainerwelt ist bereits angelegt.	The coaching world already exists.
Ungültige Antwort auf das Kaufangebot.	Invalid response to the purchase offer.
Ungültige Feldbesetzung.	Invalid pitch lineup.
Ungültige Grundordnung.	Invalid formation.
Ungültige Spielpaarung.	Invalid fixture.
Ungültige Taktik.	Invalid tactic.
Ungültige Wechselvormerkung.	Invalid planned substitution.
Ungültiger Geldbetrag.	Invalid amount of money.
Ungültiges Rasterfeld.	Invalid grid cell.
Vereinswelten werden noch geladen.	Club careers are still loading.
Zuerst Stellenangebote und Jugendbudget entscheiden.	Choose a job offer and youth budget first.
Verfügbar bis	Available until
Speichern & beenden	Save and exit
Der Spielverlauf erscheint nach Anpfiff.	Match events appear after kickoff.
Abwehrlinie	Defensive line
Zweikämpfe	Challenges
Spielerwechsel	Substitutions
Spielmenü	Match menu
Das Spiel wird nach der laufenden Ballaktion gespeichert.	The match will be saved after the current ball action.
Sturm	Attack
Zentrum	Centre
Abwartend	Cautious
Früh	Early
Kurz	Short
Direkt	Direct
Vorsichtig	Cautious
Aggressiv	Aggressive
Hoch	High
Tief	Deep
Normal	Normal
Tor per direktem Freistoß	Goal from a direct free kick
Wechsel noch möglich	substitutions remaining
Vorlage	Assist
Min.	min
Werbebanner	Advertising boards
Fremdposition	Out of position
Stammposition	Natural position
Einsatzposition	Playing position
Aktuelle Note	Current rating
Wechsel vorgemerkt	Substitution planned
Freies Feld	Empty cell
Reihe	Row
Spalte	Column
Deine Startelf auf dem Spielfeld	Your starting lineup on the pitch
Ausgewogen	Balanced
Nr.	No.
Auf ein Trikot ziehen	Drag onto a shirt
Vor dem Spiel	Before the match
Vor Anpfiff	Before kickoff
Live	Live
Bis zu zwei Wechsel. Eine Vormerkung wird erst bei der nächsten Spielunterbrechung ausgeführt.	Up to two substitutions. A planned change takes effect at the next stoppage.
Entfernen	Remove
Vom Feld	From the pitch
Von der Bank	From the bench
Wechsel vormerken	Plan substitution
Die Partie und die übrigen Begegnungen dieses Kalendertags sind gespeichert.	This match and the other fixtures on this calendar day have been saved.
Dein Verein	Your club
vorgemerkt	planned
VERTEIDIGUNG	DEFENCE
Individuelle Ausrichtung	Individual role
Ausgewählter Spieler	Selected player
Ersatzbank	Bench
Details	Details
Frischeste	Fittest
Defensiver	More defensive
Offensiver	More attacking
Letzte Änderung zurücknehmen	Undo last change
Aufstellung gültig · Änderungen werden automatisch gespeichert.	Valid lineup · Changes are saved automatically.
Wähle Formation und Spielidee. Änderungen sind sofort auf dem Spielfeld sichtbar.	Choose a formation and playing style. Changes appear on the pitch immediately.
Wähle ein Trikot auf dem Feld. Für einen Wechsel ziehe einen Reservespieler auf das Feldtrikot.	Select a shirt on the pitch. To make a substitution, drag a reserve player onto the shirt.
Spielpause	Match paused
Taktikänderungen gelten sofort. Wechsel erfolgen bei der nächsten Unterbrechung.	Tactical changes take effect immediately. Substitutions happen at the next stoppage.
Spiel fortsetzen	Resume match
Live-Spiel	Live match
Dein Spiel pausiert.	Your match is paused.
Dein Spiel läuft.	Your match is live.
POKALSPIEL	CUP MATCH
EUROPACUP	EUROPEAN CUP
PAUSE	PAUSED
Die Partie läuft. Pausiere, um Taktik und Wechsel anzupassen.	The match is running. Pause to adjust tactics and substitutions.
Spiel pausieren	Pause match
Spiel läuft	Match live
Spiel pausiert	Match paused
Spielsteuerung	Match controls
Während der Spielpause	During the match pause
Deine Spieler auf dem Spielfeld	Your players on the pitch
Form und Müdigkeit	Form and fatigue
Bereit zum Anpfiff.	Ready for kickoff.
Nächster Transfertag	Next transfer day
Transferschluss bestätigen	Confirm transfer deadline
Nächstes Spiel vorbereiten	Prepare next match
Match starten	Start match
Bitte warten …	Please wait …
Transferschluss wird ausgewertet …	The transfer deadline is being processed …
ANG	ATT
MIT	MID
VER	DEF
Nächste KI-Prüfung nach Tor, zur Halbzeit oder an der 15-Minuten-Marke.	Next AI review after a goal, at half-time or at the 15-minute mark.
Spielerstatistik	Player statistics
Noch keine Pflichtspieleinsätze.	No competitive appearances yet.
Raus:	Off:
Rein:	On:
Aus der Trainerwelt	From the coaching world
Verein nicht gefunden.	Club not found.
Trainer nicht gefunden.	Coach not found.
Trainerprofil	Coach profile
Spielidee	Playing style
Stationen	Club history
Noch keine Vereinsstation.	No club appointment yet.
Titelarchiv · bisherige Sieger	Honours archive · past winners
Seit deinem letzten Fortschritt	Since your last advance
Kader und Vereinsprofil ansehen	View squad and club profile
Team Awards	Team honours
Noch keine Mannschaftstitel.	No team titles yet.
Noch keine persönlichen Awards.	No individual awards yet.
Leistungen je Verein und Saison	Performance by club and season
Awards und Titel	Awards and titles
Pl.	Pos.
Sp.	Pld
TD	GD
Pkt.	Pts
Sponsor	Sponsor
Sofortiges Fixum	Upfront payment
Mögliche Boni	Possible bonuses
Maximal bei allen Zielen	Maximum if all targets are met
Das Fixum wird sofort gebucht. Jedes erreichte Bonusziel wird am Saisonende einzeln bezahlt.	The upfront payment is booked immediately. Each achieved bonus target is paid separately at season end.
Handelspartner	Trade partner
Regionalpartner	Regional partner
Reisepartner	Travel partner
Stadtwerke	Municipal utilities
Sportpartner	Sports partner
Medienpartner	Media partner
Profiverträge	Professional contracts
Profiverträge, seitlich scrollbar	Professional contracts, horizontally scrollable
Gehalt / Saison	Salary / season
Restlaufzeit	Time remaining
Einsatz-Zusage	Playing time promise
Aktion	Action
Torhüter	Goalkeepers
Profis	Professionals
Einsätze	Appearances
Nachwuchspool	Youth pool
VEREINSEIGENER NACHWUCHS	CLUB YOUTH PLAYERS
Fähigkeiten sind im Profil als Farbstufen sichtbar. Entwicklung beginnt erst nach einer Übernahme durch tatsächliche Pflichtspieleinsätze.	Abilities are visible as colour levels in profiles. Development begins after promotion through competitive match appearances.
Entlassene Nachwuchsspieler sind diese und die nächste Saison für alle Vereine ablösefrei; danach beenden sie ohne Vertrag ihre Laufbahn.	Released youth players are available to every club for free this season and the next; after that, they retire without a contract.
Sortierung	Sort order
Alle Positionen	All positions
Ablauf zuerst	Expiring first
Jüngste zuerst	Youngest first
Marktwert zuerst	Highest market value first
In den Profikader übernehmen	Promote to professional squad
Entlassen	Release
GEMEINSAMER SPIELERMARKT	SHARED PLAYER MARKET
Eigene Verkaufsangebote	Your sale listings
Öffne das Profil eines eigenen Spielers, um ihn zum Verkauf anzubieten.	Open one of your player's profiles to list him for sale.
Von Vereinen angeboten	Listed by clubs
Verhandelbare Ablöse	Negotiable transfer fee
Zum Verkauf gestellt	Listed for sale
Im Transfermenü verwalten	Manage in transfer menu
Das Verkaufsangebot für dieses Transferfenster ist beendet.	This sale listing has ended for the current transfer window.
Zum Verkauf anbieten	List for sale
Die öffentliche Forderung bleibt bis zum Ende des Transferfensters fest.	The public asking price stays fixed until the transfer window ends.
Für einen Verkauf müssen mindestens zehn Profis und ein Torwart im Kader bleiben.	A sale must leave at least ten professionals and one goalkeeper in the squad.
Verkaufsangebote sind im Transferfenster möglich.	Sale listings are available during the transfer window.
Verkaufsangebot	Sale listing
Ein Angebot ist erst im nächsten Transferfenster möglich.	An offer is possible only in the next transfer window.
Neue Forderung	New asking price
Verhandlung öffnen	Open negotiation
Angebot zurückziehen	Withdraw offer
Laufende Verhandlungen	Ongoing negotiations
Dialog öffnen	Open dialog
Ablöse verhandeln	Negotiate transfer fee
Zur Transferübersicht	Back to transfer overview
Zurück zur Verhandlung	Back to negotiation
Verhandlung endgültig beenden	End negotiation permanently
Dein Ablösegebot	Your transfer fee offer
Gebot abgeben	Submit offer
Dein letztes Gebot	Your last offer
Neues Ablösegebot	New transfer fee offer
Antwort senden	Send response
Vertragsangebot senden	Send contract offer
Verhandlung beenden	End negotiation
Öffentliche Forderung	Public asking price
Deine Ablöse	Your transfer fee
Letzte Änderung	Last change
Gebot annehmen	Accept offer
Deine Gegenforderung	Your counteroffer
Gegenforderung senden	Send counteroffer
Gebot ablehnen	Decline offer
Gebot dieses Käufers	This buyer's offer
Frei	Free
Von	From
Bisheriger Verein	Previous club
Zielverein	Destination club
Spieler suchen	Search players
Vereinsland	Club country
Alle Länder	All countries
Alle Vereine und Freie	All clubs and free agents
Vereinslos	Free agent
Ablöse	Transfer fee
Ablösefrei	Free transfer
Alle Spieler	All players
Nur ablösefreie	Free agents only
Nur mit Ablöse	Transfer fee only
Angebot planen	Plan offer
Verhandelbare Ablöse bis	Negotiable fee up to
Wechselbereitschaft	Willingness to transfer
Alle	All
Offen	Open
Unsicher	Unsure
Wird nicht wechseln	Will not move
Für diese Filter gibt es kein aktives Verkaufsangebot.	No active sale listing matches these filters.
Marktwert und Gehalt sind Richtwerte. Spielerfähigkeiten stehen nur als Farbstufen im Profil.	Market value and salary are estimates. Abilities appear only as colour levels in player profiles.
Während der Saison sind nur ablösefreie Verpflichtungen möglich.	Only free agents can be signed during the season.
Die reguläre Transferphase ist geschlossen.	The regular transfer window is closed.
Die reguläre Transferphase ist geöffnet.	The regular transfer window is open.
Alle Profis anderer Vereine und vereinslose Spieler sind sichtbar. Das ist keine Verkaufsliste: Du kannst jedem gebundenen Spieler ein Angebot machen. Vereinslose erscheinen zuerst, danach die höchsten Marktwert-Richtwerte; die Liste zeigt bis zu 48 Treffer, bei der Auswahl „Vereinslos“ alle verfügbaren Spieler. Der Länderfilter bezieht sich bei Profis auf den Verein, bei Vereinslosen auf die Nationalität.	You can see professionals at other clubs and free agents. This is not a sale list: you can make an offer for any contracted player. Free agents appear first, followed by the highest estimated market values; the list shows up to 48 results, or all available players when you select “Free agent”. For professionals, the country filter applies to their club; for free agents, it applies to nationality.
Keine Einträge	No entries
Noch kein Spielstand. Dein erster Verein wartet auf dich.	No save yet. Your first club awaits.
Automatisch gespeichert auf diesem Gerät und in diesem Browser.	Saved automatically on this device and in this browser.
Elfmeterschießen testen	Try penalty shootouts
Wähle zwei von vier Demo-Teams. Zwei sind sehr stark, zwei eher schwach. Das Ergebnis verändert keine Karriere.	Choose two of four demo teams. Two are very strong and two are weaker. The result does not affect any career.
Dein Team	Your team
Gegner	Opponent
Elfmeterschießen starten	Start penalty shootout
Sehr stark	Very strong
Eher schwach	Rather weak
Spielstände sichern	Back up saves
JSON-Datei	JSON file
Exportierte Spielstände können auf einem anderen Browser oder Gerät wieder importiert werden.	Exported saves can be imported into another browser or device.
Spielstand importieren	Import save
Die Spielstände konnten nicht gelesen werden. Vorhandene Daten werden nicht überschrieben.	Saved games could not be read. Existing data will not be overwritten.
Teilen aktiviert. Änderung jederzeit möglich.	Sharing enabled. You can change this at any time.
Nur lokal: Es werden keine Spielzusammenfassungen gesendet.	Local only: no match summaries are sent.
Letzte Spielzusammenfassung erfolgreich übertragen.	Latest match summary sent successfully.
Letzte Übertragung nicht möglich. Dein Spielstand ist weiterhin lokal gespeichert.	Latest upload failed. Your save is still stored locally.
Vereinswelt gelöscht.	Club career deleted.
Export der Vereinswelt gestartet.	Club career export started.
Ehemals landesweit prägender Mitgliederklub mit großer Anhängerschaft; heute hohe Ansprüche und teure Erneuerung.	Once a nationally influential members' club with a large following; now facing high expectations and costly renewal.
Jüngerer Titelanwärter, gewachsen aus einem städtischen Sportnetzwerk; plant Kaderbreite und internationale Spiele.	A newer title contender grown from a city sports network; planning squad depth and European matches.
Alte Hafenvereinigung mit viel Rückhalt; nach wechselhaften Jahren ringt der Vorstand um einen geduldigen Umbau.	An old port club with strong support; after uneven years, its board is working towards a patient rebuild.
Eigentümer aus lokaler Industrie führten den Klub mit nüchterner Kaderanalyse ins obere Mittelfeld.	Owners from local industry used measured squad analysis to lift the club into the upper half.
Ausbildungsverein am Fluss; verkauft gelegentlich Talente, ohne sein Nachwuchsnetz aufzugeben.	A riverside development club that occasionally sells talent while preserving its youth network.
Kleiner Nachbarschaftsverein mit Derbyreiz; hält Gehälter niedrig und vertraut auf langfristige Trainerarbeit.	A small neighbourhood club with derby appeal; keeps wages low and trusts long-term coaching.
Regional verankerter Pokalverein mit kleinen Einnahmen und routinierter Stammelf.	A regional cup club with modest income and an experienced first team.
Küstenklub mit junger Talentsuche und hoher Bereitschaft zu Verkäufen.	A coastal club seeking young talent and willing to sell players.
Historischer Spitzenverein mit internationalen Erinnerungen und großem Anspruch, doch ohne Anspruch auf dauernde Titel.	A historic leading club with European memories and high ambitions, though titles are never guaranteed.
Etablierter großer Rivale mit offensiver Spielkultur und wachsamem Blick auf die eigenen Mittel.	An established major rival with an attacking style and a watchful eye on its finances.
Beständiger Herausforderer; bevorzugt einen kompakten Kader und wenige gezielte Käufe.	A steady challenger that prefers a compact squad and a few targeted signings.
Traditionsreicher Klub nach einer sportlichen Delle; die Anhängerschaft bleibt größer als die aktuelle Kaderqualität.	A traditional club recovering from a poor run; its following remains stronger than its current squad.
Jüngerer Stadtverein mit lokaler Talentsuche und ungewöhnlich geduldigem Vorstand.	A newer city club scouting local talent, backed by an unusually patient board.
Küstenverein mit enger Rechnung, klaren Rollen und Augenmerk auf ablösefreie Spieler.	A coastal club with a tight budget, clear roles and a focus on free agents.
Erfahrener Regionalverein, der im Pokal oft defensiv und mit kurzer Bank plant.	An experienced regional club that often plans for cup ties with defensive tactics and a short bench.
Sparsamer Jugendverein; gute Jahrgänge wechseln sich mit Kaderlücken ab.	A frugal youth club where strong age groups alternate with gaps in the squad.
Historisch großer Werksklub mit Ergebnisdruck; vertraut lange auf erfahrene Profis.	A historic works club under pressure to deliver results; it sticks with experienced professionals.
Sportlich starker jüngerer Konkurrent mit methodischer Kaderplanung und mittlerem Finanzrisiko.	A strong newer rival with methodical squad planning and moderate financial risk.
Großer Stadtverein im Wiederaufbau; Tradition und Anhängerschaft übersteigen die momentane Kaderstärke.	A major city club rebuilding; its tradition and support exceed its current squad strength.
Ruhiger Taktikverein, der passende Rollen und Trainer höher bewertet als große Namen.	A measured tactical club that values suitable roles and coaches over famous names.
Nachwuchs- und Marktklub, der gute Spieler zu tragbaren Zeitpunkten verkauft.	A youth and transfer market club that sells good players at sustainable moments.
Ambitionierter Traditionsverein, der mit gezielten Verpflichtungen und neuer Führung an frühere Erfolge anschließen will.	An ambitious traditional club seeking past success through targeted signings and new leadership.
Regionaler Traditionsverein, der trotz begrenztem Geld erfahrene Defensivspieler hält.	A traditional regional club that retains experienced defenders despite limited funds.
Marktverein mit engem Gehaltsrahmen und Suche nach ablösefreien Chancen.	A market-focused club with a tight wage budget that looks for free-agent opportunities.
Über viele Jahre erfolgreicher Großverein mit Titelanspruch und eigener Finanzdisziplin.	A major club successful for many years, with title ambitions and financial discipline.
Verein mit langer Erfolgsgeschichte, der durch junge Profis und eigene Ausbildung wieder an die Spitze will.	A club with a long record of success, seeking a return to the top through young professionals and its academy.
Beliebter Traditionsklub; Reichweite bleibt hoch, während Ergebnisse zeitweise schwanken.	A popular traditional club whose reach stays high even when results fluctuate.
Ausbildung und Einsatzminuten für Talente zählen mehr als kurzfristige Größe.	Developing talent and giving young players minutes matter more than short-term stature.
Regional verwurzelter Mittelklub mit klarer Kostenkontrolle und Trainerkontinuität.	A mid-table club with regional roots, strict cost control and coaching continuity.
Kleiner Stadtverein, der aus ablösefreien Zugängen und enger Gehaltsführung lebt.	A small city club built around free transfers and careful wage management.
Gemeinschaftlich geprägter Ausbildungsverein mit guter Jugendkultur und wenig Geld.	A community-led development club with a strong youth culture and little money.
Regionalverein mit routinierter Startelf, knapper Reserve und vorsichtigem Vorstand.	A regional club with an experienced first team, limited reserves and a cautious board.
Finanzstarker moderner Spitzenklub mit großer Bühne und hohen laufenden Kosten.	A wealthy modern leading club with a big stage and high running costs.
Historisch großer Verein mit breiter Jugendbasis; verfolgt längere sportliche Zyklen.	A historic major club with a broad youth base that plans over longer sporting cycles.
Herausforderer mit guter Suche nach Entwicklungsspielern und begrenztem Spitzenbudget.	A challenger skilled at finding developing players, but with a limited top-end budget.
Reichweitenstarker Traditionsklub nach wirtschaftlichen Rückschlägen und vorsichtiger Erneuerung.	A widely followed traditional club recovering from financial setbacks through cautious renewal.
Ausbildungsadresse, die Jugendminuten und spätere Transfererlöse bewusst verbindet.	A development club that deliberately links youth minutes with future transfer income.
Kleiner Stadtklub mit lokaler Jugend und geringem kurzfristigem Ergebnisdruck.	A small city club with local youth players and little short-term pressure for results.
Nachwuchsverein mit vorsichtiger Gehaltsgrenze und viel Geduld bei schwachen Jahrgängen.	A youth club with a cautious wage cap and patience through weaker age groups.
Regionaler Traditionsverein mit treuer kleiner Anhängerschaft.	A traditional regional club with a small, loyal following.
Historischer Spitzenverein mit Titelanspruch, Jugendarbeit und langer Europacupgeschichte.	A historic leading club with title ambitions, youth development and a long European history.
Zweiter etablierter Titelklub mit konzentrierter Suche nach passenden Profis.	Another established title contender focused on finding the right professionals.
Dritter großer Rivale; Prestige bleibt auch dann bestehen, wenn Trainer und Kader wechseln.	A third major rival whose prestige endures through changes in coach and squad.
Jugend- und Verkaufsklub, der seine Mittel über mehrere Saisons plant.	A youth and selling club that plans its finances across several seasons.
Beständiger Regionalverein mit niedrigen Kosten und sorgfältiger Trainerpassung.	A steady regional club with low costs and careful coach selection.
Kleiner Nischenklub, der ablösefreie Spieler und ruhige Ziele vorzieht.	A small niche club that prefers free agents and modest goals.
Entwicklungsverein, dessen knappes Budget Verkäufe gelegentlich erzwingt.	A development club whose tight budget sometimes forces sales.
Regionaler Pokalverein mit erfahrenem Trainer und engem Etat.	A regional cup club with an experienced coach and a tight budget.
`.trim().split('\n').map(line=>line.split('\t')));
 const labelsLower=new Map([...labels].map(([de,en])=>[de.toLocaleLowerCase('de'),en]));
 const patterns=[
  [/^Bereit zum Anpfiff\.$/,()=>`Ready for kick-off.`],
  [/^Anstoß: (.+) spielt kurz zurück\.$/,(_,name)=>`Kick-off: ${name} plays a short pass back.`],
  [/^(.+) gewinnt das Duell gegen (.+)\.$/,(_,winner,loser)=>`${winner} wins the duel against ${loser}.`],
  [/^(.+) gewinnt den Ball im Zweikampf\.$/,(_,name)=>`${name} wins the ball in a duel.`],
  [/^(.+) setzt zur Grätsche gegen (.+) an\.$/,(_,name,target)=>`${name} slides in on ${target}.`],
  [/^(.+) grätscht den Ball frei\.$/,(_,name)=>`${name} slides in and clears the ball.`],
  [/^(.+) gewinnt den Ball mit einer Grätsche\.$/,(_,name)=>`${name} wins the ball with a sliding tackle.`],
  [/^(.+) behauptet den Ball gegen die Grätsche\.$/,(_,name)=>`${name} keeps the ball despite the sliding tackle.`],
  [/^(.+) rutscht am Ball vorbei\.$/,(_,name)=>`${name} slides past the ball.`],
  [/^(.+) fängt (den Pass|den Passweg|den Freistoß) ab\.$/,(_,name,what)=>`${name} intercepts ${what==='den Freistoß'?'the free kick':'the pass'}.`],
  [/^(.+) spielt auf (.+)\.$/,(_,name,target)=>`${name} passes to ${target}.`],
  [/^(.+) köpft zu (.+)\.$/,(_,name,target)=>`${name} heads the ball to ${target}.`],
  [/^(.+) zieht ab!$/,(_,name)=>`${name} shoots!`],
  [/^(.+) läuft frei Richtung Tor\.$/,(_,name)=>`${name} breaks free towards goal.`],
  [/^(.+) hält den Abschluss\.$/,(_,name)=>`${name} saves the shot.`],
  [/^(.+) setzt den Ball vorbei\.$/,(_,name)=>`${name} puts the ball wide.`],
  [/^(.+) nimmt den freien Ball auf\.$/,(_,name)=>`${name} collects the loose ball.`],
  [/^(.+) nimmt den hohen Ball an\.$/,(_,name)=>`${name} controls the high ball.`],
  [/^(.+) gewinnt den hohen Ball\.$/,(_,name)=>`${name} wins the high ball.`],
  [/^(.+) köpft den hohen Ball weg\.$/,(_,name)=>`${name} heads the high ball clear.`],
  [/^(.+) erreicht die Flanke\.$/,(_,name)=>`${name} reaches the cross.`],
  [/^(.+) bringt die Ecke vor das Tor\.$/,(_,name)=>`${name} sends the corner into the box.`],
  [/^(.+) klärt die Ecke\.$/,(_,name)=>`${name} clears the corner.`],
  [/^(.+) versucht es direkt mit dem Freistoß\.$/,(_,name)=>`${name} shoots directly from the free kick.`],
  [/^(.+) spielt den Freistoß (?:nach Abseits kurz )?auf (.+)\.$/,(_,name,target)=>`${name} plays the free kick to ${target}.`],
  [/^(.+) wirft auf (.+) ein\.$/,(_,name,target)=>`${name} throws in to ${target}.`],
  [/^(.+) erreicht den Einwurf nicht\.$/,(_,name)=>`${name} cannot reach the throw-in.`],
  [/^Aus! Einwurf für (.+)\. (.+) läuft zur Seitenlinie\.$/,(_,club,name)=>`Out! Throw-in for ${club}. ${name} heads to the touchline.`],
  [/^(.+) hat Anstoß$/,(_,club)=>`${club} kicks off`],
  [/^TOR! (.+) trifft (per direktem Freistoß )?für (.+)\.$/,(_,name,freeKick,club)=>`GOAL! ${name} scores ${freeKick?'directly from a free kick ':''}for ${club}.`],
  [/^ELFMETERTOR! (.+) trifft für (.+)\.$/,(_,name,club)=>`PENALTY GOAL! ${name} scores for ${club}.`],
  [/^Abpfiff! (.+) (\d+) : (\d+) (.+)\.$/,(_,home,homeGoals,awayGoals,away)=>`Full time! ${home} ${homeGoals} : ${awayGoals} ${away}.`],
  [/^Transferphase · Tag (\d+) von (\d+)$/,(_,day,total)=>`Transfer window · Day ${day} of ${total}`],
  [/^Transfertag (\d+) wird vorbereitet …$/,(_,day)=>`Preparing transfer day ${day} …`],
  [/^(\d+) Minuten (\d+) Sekunden$/,(_,minutes,seconds)=>`${minutes} minutes ${seconds} seconds`],
  [/^(.+): Spielerinformationen anzeigen$/,(_,name)=>`Show ${name}'s player information`],
  [/^Statistik von (.+) anzeigen$/,(_,name)=>`Show ${name}'s statistics`],
  [/^↑ Eingewechselt (.+) · (\d+) min$/,(_,minute,duration)=>`↑ Came on ${minute} · ${duration} min`],
  [/^↓ Ausgewechselt (.+) · (\d+) min$/,(_,minute,duration)=>`↓ Went off ${minute} · ${duration} min`],
  [/^(.+) · Note (\d+,\d+)$/,(_,club,rating)=>`${club} · Rating ${rating}`],
  [/^Form: (.+); Frische: (.+) \((\d+) von (\d+)\)$/,(_,form,fitness,value,total)=>`Form: ${translate(form)}; fitness: ${translate(fitness)} (${value} of ${total})`],
  [/^(.+) gegen (.+)$/,(_,home,away)=>`${translate(home)} vs ${translate(away)}`],
  [/^(\d{1,2})\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)$/i,(_,day,month)=>`${day} ${months[month.toLowerCase()]}`],
  [/^(\d+) Jahre$/,(_,n)=>`${n} years`],
  [/^(\d+) Spiel$/,(_,n)=>`${n} match`],
  [/^(\d+) Sieg$/,(_,n)=>`${n} win`],
  [/^(\d+) Siege$/,(_,n)=>`${n} wins`],
  [/^(\d+) Niederlage$/,(_,n)=>`${n} loss`],
  [/^(\d+) Niederlagen$/,(_,n)=>`${n} losses`],
  [/^(\d+) Minute$/,(_,n)=>`${n} minute`],
  [/^(\d+) Minuten$/,(_,n)=>`${n} minutes`],
  [/^(\d+) Einsatz$/,(_,n)=>`${n} appearance`],
  [/^(\d+) Kandidat$/,(_,n)=>`${n} candidate`],
  [/^(\d+) Kandidaten$/,(_,n)=>`${n} candidates`],
  [/^(\d+) freier Kaderplatz$/,(_,n)=>`${n} free squad place`],
  [/^(\d+) freie Kaderplätze$/,(_,n)=>`${n} free squad places`],
  [/^(\d+) (Mannschaftspokal|Mannschaftspokale) gewonnen\.$/,(_,n,trophy)=>`${n} ${n==='1'?'team trophy':'team trophies'} won.`],
  [/^Platz (\d+) von (\d+)$/,(_,place,total)=>`Position ${place} of ${total}`],
  [/^Seite (\d+) von (\d+)$/,(_,page,total)=>`Page ${page} of ${total}`],
  [/^Tabelle (Spanien|Italien|Deutschland|Frankreich|Portugal|England) Liga (\d+)$/,(_,country,league)=>`Standings: ${translate(country)} League ${league}`],
  [/^Tabelle (.+)$/,(_,competition)=>`Standings: ${translate(competition)}`],
  [/^(\d+) Remis$/,(_,n)=>`${n} draws`],
  [/^(\d+) Verträge$/,(_,n)=>`${n} contracts`],
  [/^(\d+) Vertrag$/,(_,n)=>`${n} contract`],
  [/^Nach dem 8\. Ligaspieltag laufen (\d+) (Vertrag|Verträge) deines Vereins zum Saisonende aus\. Du kannst jetzt noch Verlängerungen verhandeln\.$/,(_,n)=>`After the eighth league match, ${n} ${n==='1'?'contract':'contracts'} at your club expire at season end. You can still negotiate extensions.`],
  [/^Dein Ruf: (.+)\. Diese Trainerstellen sind zum Saisonende vorläufig besetzt\. Wähle einen Verein oder bleibe bei (.+)\.$/,(_,reputation,club)=>`Your reputation: ${translate(reputation)}. These coaching jobs are provisionally available at season end. Choose a club or stay at ${club}.`],
  [/^Spieler fordert mindestens (.+)\. Ein verbessertes Angebot ist möglich\.$/,(_,salary)=>`The player asks for at least ${salary}. You can improve your offer.`],
  [/^Für (.+) fehlt ein Spieler der Startelf\.$/,(_,club)=>`${club} is missing a starting player.`],
  [/^Computerkader (.+) ist noch unvollständig\.$/,(_,club)=>`The AI squad of ${club} is still incomplete.`],
  [/^Kein bezahlbarer vereinsloser Spieler für (.+)\.$/,(_,club)=>`No affordable free agent is available for ${club}.`],
  [/^Ein neues Verhandlungsfenster öffnet am (.+)\.$/,(_,date)=>`A new negotiation window opens on ${translate(date)}.`],
  [/^Vereinswelt konnte nicht gespeichert werden: (.+)$/,(_,error)=>`The club career could not be saved: ${translate(error)}`],
  [/^Du übernimmst (.+)\.$/,(_,club)=>`You take charge of ${club}.`],
  [/^(.+) · (\d+) Profis · (.+) Kassenstand$/,(_,history,count,balance)=>`${translate(history)} · ${count} professionals · Balance ${balance}`],
  [/^Verfügbar: (.+) · Maximal investierbar: (.+)$/,(_,balance,max)=>`Available: ${balance} · Maximum investment: ${max}`],
  [/^(.+): (\d+:\d+(?: · i\. E\. \d+:\d+)?(?: · gesamt \d+:\d+)?) gegen (.+)$/,(_,round,score,club)=>`${translate(round)}: ${translate(score)} vs ${club}`],
  [/^Nach der Ligaphase · Platz (\d+) von (\d+) · zuletzt (.+) gegen (.+)$/,(_,place,total,score,club)=>`After the league phase · Position ${place} of ${total} · last match ${translate(score)} vs ${club}`],
  [/^Saison (\d+) · Rückblick (\d+) von (\d+)$/,(_,season,step,total)=>`Season ${season} · Review ${step} of ${total}`],
  [/^Weitere Sieger · Saison (\d+)$/,(_,season)=>`Other winners · Season ${season}`],
  [/^Transfers · Saison (\d+)$/,(_,season)=>`Transfers · Season ${season}`],
  [/^(Zum Verein gekommen|Verein verlassen) · (\d+)$/,(_,title,count)=>`${translate(title)} · ${count}`],
  [/^(Von|Zu) (.+)$/,(_,direction,club)=>`${translate(direction)} ${club}`],
  [/^Ruf: (.+)$/,(_,reputation)=>`Reputation: ${translate(reputation)}`],
  [/^(.+) wurde in den Profikader aufgenommen\.$/,(_,name)=>`${name} has joined the professional squad.`],
  [/^(.+), Österreich\. Kontakt:$/,(_,address)=>`${address}, Austria. Contact:`],
  [/^(\d+(?:\+\d+)?′) (Tor per direktem Freistoß|Tor) für (.+)$/,(_,minute,goal,club)=>`${minute} ${translate(goal)} for ${club}`],
  [/^(\d+(?:\+\d+)?′) Wechsel$/,(_,minute)=>`${minute} Substitution`],
  [/^(\d+(?:\+\d+)?′) Halbzeit$/,(_,minute)=>`${minute} Half-time`],
  [/^⚠ Fremdposition: Stammposition (.+), Einsatzposition (.+)\.$/,(_,natural,playing)=>`⚠ Out of position: natural position ${translate(natural)}, playing position ${translate(playing)}.`],
  [/^(.+) · (\d+) Jahre · Nr\. (\d+)$/,(_,position,age,number)=>`${translate(position)} · ${age} years · No. ${number}`],
  [/^(\d+) (Kandidat|Kandidaten) · Saisonbudget (.+) · Profikader (\d+) \/ (\d+)$/,(_,n,candidate,budget,count,limit)=>`${n} ${n==='1'?'candidate':'candidates'} · Season budget ${budget} · Professional squad ${count} / ${limit}`],
  [/^(.+) · (\d+) Jahre · bis Ende Saison (\d+)$/,(_,position,age,season)=>`${translate(position)} · ${age} years · until end of season ${season}`],
  [/^Ausbildungsentschädigung (.+) · Gehalt (.+) je Saison · (\d+) (freier Kaderplatz|freie Kaderplätze)$/,(_,fee,salary,spots)=>`Training compensation ${fee} · Salary ${salary} per season · ${spots} ${spots==='1'?'free squad place':'free squad places'}`],
  [/^(.+) aus dem Nachwuchspool entlassen\? Er ist diese und die nächste Saison für alle Vereine ablösefrei\. Ohne Vertrag beendet er danach seine Karriere\.$/,(_,name)=>`Release ${name} from the youth pool? He will be a free agent for this season and the next. If he remains unsigned, he will retire afterwards.`],
  [/^(\d+) Wechsel noch möglich$/,(_,n)=>`${n} substitutions remaining`],
  [/^(\d+) Min\.$/,(_,n)=>`${n} min`],
  [/^(\d+) Tor$/,(_,n)=>`${n} goal`],
  [/^(\d+) Tore$/,(_,n)=>`${n} goals`],
  [/^(\d+) Vorlage$/,(_,n)=>`${n} assist`],
  [/^(\d+) Vorlagen$/,(_,n)=>`${n} assists`],
  [/^Aktuelle Note (.+)$/,(_,rating)=>`Current rating ${rating}`],
  [/^Reihe (\d+)$/,(_,row)=>`Row ${row}`],
  [/^Spalte (\d+)$/,(_,column)=>`Column ${column}`],
  [/^Ausrichtung (defensiv|ausgewogen|offensiv)$/,(_,role)=>`Role ${translate(role)}`],
  [/^Form (.+)$/,(_,form)=>`Form ${translate(form)}`],
  [/^Stammposition (.+)$/,(_,position)=>`Natural position ${translate(position)}`],
  [/^Einsatzposition (.+)$/,(_,position)=>`Playing position ${translate(position)}`],
  [/^Animiertes Spielfeld (.+) gegen (.+)$/,(_,home,away)=>`Animated match pitch: ${home} vs ${away}`],
  [/^(\d+) Credits\/Jahr$/,(_,n)=>`${n} Credits/year`],
  [/^(\d+)\/(\d+) Spieler$/,(_,n,total)=>`${n}/${total} players`],
  [/^(\d+) verfügbar$/,(_,n)=>`${n} available`],
  [/^gegen (.+)$/,(_,opponent)=>`vs ${opponent}`],
  [/^SAISON (\d+)$/,(_,n)=>`SEASON ${n}`],
  [/^Es fehlen derzeit (.+) für die Gehälter\. Siege, Unentschieden können die Lücke schließen\.$/,(_,amount)=>`The club is currently ${amount} short of its salaries. Wins and draws can close the gap.`],
  [/^(\d+) Credits sofort\. Keine sportliche Bedingung\.$/,(_,amount)=>`${amount} Credits upfront. No sporting condition.`],
  [/^(\d+) Credits sofort\. \+(\d+) Credits bei Platz 1–3 am Saisonende\.$/,(_,fixed,bonus)=>`${fixed} Credits upfront. +${bonus} Credits for a top-three finish at season end.`],
  [/^(\d+) Credits sofort\. \+(\d+) Credits ab (\d+) Ligatoren am Saisonende\.$/,(_,fixed,bonus,goals)=>`${fixed} Credits upfront. +${bonus} Credits after ${goals} league goals at season end.`],
  [/^(\d+) Hinweise$/,(_,n)=>`${n} notices`],
  [/^(\d+) Spieler sind mindestens (\d+) und können am Saisonende zurücktreten\.$/,(_,n,age)=>`${n} players are at least ${age} and may retire at season end.`],
  [/^Nach aktueller Gehaltsprognose fehlen (.+)\.$/,(_,amount)=>`The current salary forecast has a shortfall of ${amount}.`],
  [/^(\d+) Torwart · (\d+) Verteidiger · (\d+) Mittelfeldspieler · (\d+) Angreifer$/,(_,g,d,m,a)=>`${g} goalkeeper · ${d} defenders · ${m} midfielders · ${a} forwards`],
  [/^Profil von (.+) ansehen$/,(_,name)=>`View ${name}'s profile`],
  [/^Vereinsinfo und Kader von (.+) öffnen$/,(_,name)=>`Open ${name}'s club information and squad`],
  [/^Vereinswappen (.+)$/,(_,name)=>`${name} club crest`],
  [/^Torwarttrikot (.+)$/,(_,color)=>`Goalkeeper kit ${translate(color)}`],
  [/^(.+) ist ein$/,(_,name)=>`${name} is an`],
  [/^Saison (\d+) · SECHSERLIGA$/,(_,n)=>`Season ${n} · SIX-TEAM LEAGUE`],
  [/^Saison (\d+) · SPONSORWAHL$/,(_,n)=>`Season ${n} · SPONSOR SELECTION`],
  [/^Spieltag (\d+)\/(\d+)$/,(_,n,total)=>`Matchday ${n}/${total}`],
  [/^(\d+) Saison$/,(_,n)=>`${n} season`],
  [/^Liga (\d+)$/,(_,n)=>`League ${n}`],
  [/^Runde (\d+)$/,(_,n)=>`Round ${n}`],
  [/^Spieltag (\d+) von (\d+)$/,(_,n,total)=>`Matchday ${n} of ${total}`],
  [/^ab Saison (\d+)$/,(_,n)=>`from season ${n}`],
  [/^Kontostand (.+)$/,(_,value)=>`Balance ${value}`],
  [/^bis Ende Saison (\d+)$/,(_,n)=>`until end of season ${n}`],
  [/^Ausbildungsentschädigung ([^·]+)$/,(_,fee)=>`Training compensation ${fee.trim()}`],
  [/^Gehalt (.+) je Saison$/,(_,salary)=>`Salary ${salary} per season`],
  [/^(\d+) freie Kaderplätze$/,(_,n)=>`${n} free squad places`],
  [/^Jahresgrundbetrag (.+)$/,(_,value)=>`Annual base payment ${value}`],
  [/^(\d+) \/ (\d+) Profis$/,(_,n,limit)=>`${n} / ${limit} professionals`],
  [/^(\d+) Profis · Verträge und Spielerprofile öffnen\.$/,(_,n)=>`${n} professionals · Open contracts and player profiles.`],
  [/^(\d+) \/ (\d+) Profis · Verträge und Spielerprofile öffnen\.$/,(_,n,limit)=>`${n} / ${limit} professionals · Open contracts and player profiles.`],
  [/^Nächstes Spiel: (.+) gegen (.+)$/,(_,date,away)=>`Next match: ${translate(date)} vs ${away}`],
  [/^Nächstes Spiel · (.+)$/,(_,date)=>`Next match · ${translate(date)}`],
  [/^Liga: Platz (\d+) oder besser \+ (.+)$/,(_,rank,bonus)=>`League: finish ${ordinal(rank)} or better + ${bonus}`],
  [/^Liga: Platz (\d+) oder besser$/,(_,rank)=>`League: finish ${ordinal(rank)} or better`],
  [/^Liga: mindestens (\d+) reguläre Tore \+ (.+)$/,(_,goals,bonus)=>`League: at least ${goals} regulation goals + ${bonus}`],
  [/^Liga: mindestens (\d+) reguläre Tore$/,(_,goals)=>`League: at least ${goals} regulation goals`],
  [/^Nationaler Pokal: (Finale|Halbfinale|Viertelfinale) erreichen \+ (.+)$/,(_,round,bonus)=>`National cup: reach the ${translate(round).toLowerCase()} + ${bonus}`],
  [/^Nationaler Pokal: (Finale|Halbfinale|Viertelfinale) erreichen$/,(_,round)=>`National cup: reach the ${translate(round).toLowerCase()}`],
  [/^Nationaler Pokal: mindestens (\d+) reguläre Tore$/,(_,goals)=>`National cup: at least ${goals} regulation goals`],
  [/^Saison (\d+)$/,(_,n)=>`Season ${n}`],
  [/^Spieltag (\d+)$/,(_,n)=>`Matchday ${n}`],
  [/^(\d+) Spiele$/,(_,n)=>`${n} games`],
  [/^(\d+) Saisons$/,(_,n)=>`${n} seasons`],
  [/^(\d+) Einsätze$/,(_,n)=>`${n} appearances`],
  [/^(\d+) Profis$/,(_,n)=>`${n} professionals`],
  [/^(\d+) angezeigt$/,(_,n)=>`${n} shown`],
  [/^Sponsor für Saison (\d+) wählen$/,(_,n)=>`Choose sponsor for season ${n}`],
  [/^Jugendbudget für Saison (\d+)$/,(_,n)=>`Youth budget for season ${n}`],
  [/^Ende Saison (\d+)$/,(_,n)=>`End of season ${n}`],
  [/^Transfertag (\d+) von (\d+) läuft$/,(_,day,total)=>`Transfer day ${day} of ${total} is in progress`],
  [/^Angebot für (?!.* planen$)(.+)$/,(_,name)=>`Offer for ${name}`],
  [/^Bei (.+) bleiben$/,(_,club)=>`Stay at ${club}`],
  [/^Die letzte Partie ist gespielt\. Hier siehst du, was dein Verein in Saison (\d+) erreicht hat\.$/,(_,season)=>`The final match has been played. Here is what your club achieved in season ${season}.`],
  [/^Alle eingesetzten Spieler von (.+) in Saison (\d+), nach Position geordnet\.$/,(_,club,season)=>`All ${club} players who appeared in season ${season}, sorted by position.`],
  [/^Ausbildungsentschädigung: (.+)\. Der Spieler ist jetzt im Kader verfügbar\.$/,(_,fee)=>`Training compensation: ${fee}. The player is now available in the squad.`],
  [/^Man of the Match · insgesamt (\d+)×$/,(_,n)=>`Man of the Match · ${n} total`],
  [/^(.+) · Du übernimmst den Verein\.$/,(_,when)=>`${translate(when)} · You take charge of the club.`],
  [/^(.+) · Deine Station bei diesem Verein endet\.$/,(_,when)=>`${translate(when)} · Your time at this club ends.`],
  [/^Angebot für (.+) planen$/,(_,name)=>`Plan offer for ${name}`],
  [/^(.+) freistellen$/,(_,name)=>`Release ${name}`],
  [/^Vereinsprofil (.+) öffnen$/,(_,name)=>`Open ${name}'s club profile`],
  [/^(.+) · (Torwart|Abwehr|Mittelfeld|Angriff), (\d+)$/,(_,club,position,age)=>`${translate(club)} · ${translate(position)}, ${age}`],
  [/^(.+) · (Torwart|Abwehr|Mittelfeld|Angriff) · (\d+) Jahre$/,(_,club,position,age)=>`${translate(club)} · ${translate(position)} · ${age} years`],
  [/^(\d+) Spieler stehen zum Verkauf\. Die angezeigte Ablöse ist verhandelbar\.$/,(_,n)=>`${n} players are listed for sale. The shown fee is negotiable.`],
  [/^(\d+) Kandidaten · (.+)$/,(_,n,rest)=>`${n} candidates · ${translate(rest)}`],
  [/^Saisonbudget (.+) · Profikader (.+)$/,(_,budget,squad)=>`Season budget ${budget} · Professional squad ${squad}`],
  [/^(Torwart|Abwehr|Mittelfeld|Angriff) · (\d+) Jahre · bis Ende Saison (\d+) Ausbildungsentschädigung (.+) · Gehalt (.+) je Saison · (\d+) freie Kaderplätze$/,(_,position,age,season,fee,salary,spots)=>`${translate(position)} · ${age} years · training compensation ${fee} until end of season ${season} · salary ${salary} per season · ${spots} free squad places`],
  [/^Profil von (.+) öffnen$/,(_,name)=>`Open ${name}'s profile`],
  [/^Vereinslogo (.+)$/,(_,name)=>`${name} club crest`],
  [/^Vereine in (.+)$/,(_,country)=>`Clubs in ${translate(country)}`],
  [/^Deine Vereinswelten · (.+)$/,(_,count)=>`Your club careers · ${count}`],
  [/^(.+) · Saison (\d+)$/,(_,country,season)=>`${translate(country)} · Season ${season}`],
  [/^Saison (\d+) · (.+)$/,(_,season,country)=>`Season ${season} · ${translate(country)}`],
  [/^(.+) und alle Fortschritte dieser Vereinswelt endgültig löschen\?$/,(_,name)=>`Permanently delete ${name} and all progress in this club career?`],
  [/^(.+) Spiele · (.+)$/,(_,games,date)=>`${games} games · ${date}`],
  [/^(.+) · (\d+) Jahre · (Links|Rechts)fuß$/,(_,position,age,foot)=>`${translate(position)} · ${age} years · ${foot==='Links'?'left':'right'}-footed`],
  [/^(.+) · (\d+) Jahre$/,(_,position,age)=>`${translate(position)} · ${age} years`],
  [/^(.+): (sehr schwach|eher schwach|schwach|durchschnittlich|solide|stark|sehr stark|normal|gut|sehr gut)$/,(_,ability,level)=>`${translate(ability)}: ${translate(level)}`],
  [/^(Spanien|Italien|Deutschland|Frankreich|Portugal|England) · (.+)$/,(_,country,rest)=>`${translate(country)} · ${translate(rest)}`]
 ];
 const countries={Spanien:'Spain',Italien:'Italy',Deutschland:'Germany',Frankreich:'France',Portugal:'Portugal',England:'England'};
 const ordinal=n=>`${n}${n%100>=11&&n%100<=13?'th':{1:'st',2:'nd',3:'rd'}[n%10]||'th'}`;
 const months={januar:'January',februar:'February',märz:'March',april:'April',mai:'May',juni:'June',juli:'July',august:'August',september:'September',oktober:'October',november:'November',dezember:'December'};
 const colors={Anthrazit:'charcoal',Bernstein:'amber',Bordeaux:'burgundy',Braun:'brown',Creme:'cream',Dunkelblau:'dark blue',Dunkelgrün:'dark green',Eisblau:'ice blue',Elfenbein:'ivory',Flieder:'lilac',Gold:'gold',Grau:'grey',Grün:'green',Hellgrau:'light grey',Himmelblau:'sky blue',Indigo:'indigo',Jade:'jade',Karmin:'carmine',Kobaltblau:'cobalt blue',Koralle:'coral',Kupfer:'copper',Marineblau:'navy blue',Mint:'mint',Moosgrün:'moss green',Nachtblau:'midnight blue',Ocker:'ochre',Oliv:'olive',Orange:'orange',Petrol:'teal',Pflaume:'plum',Purpur:'purple',Rostrot:'rust red',Safran:'saffron',Sand:'sand',Schiefer:'slate',Schwarz:'black',Seegrün:'sea green',Silber:'silver',Smaragd:'emerald',Tannengrün:'fir green',Terrakotta:'terracotta',Türkis:'turquoise',Ultramarin:'ultramarine',Violett:'violet',Waldgrün:'forest green',Weinrot:'wine red',Weiß:'white',Ziegelrot:'brick red'};
 function translate(source){
  if(labels.has(source))return labels.get(source);
  if(source.endsWith(' →'))return `${translate(source.slice(0,-2))} →`;
  const insensitive=labelsLower.get(source.toLocaleLowerCase('de'));
  if(insensitive){
   if(source===source.toLocaleUpperCase('de'))return insensitive.toLocaleUpperCase('en');
   if(source[0]===source[0].toLocaleUpperCase('de'))return insensitive[0].toLocaleUpperCase('en')+insensitive.slice(1).toLocaleLowerCase('en');
   return insensitive.toLocaleLowerCase('en');
  }
  if(countries[source])return countries[source];
  if(/^Vereinsfarben: /.test(source))return 'Club colours: '+source.slice(15).split('/').map(color=>colors[color]||color).join('/');
  if(/^(Ligaverein|Pokalverein) · Vereinsfarben: /.test(source)){const [kind,palette]=source.split(' · Vereinsfarben: ');return `${kind==='Ligaverein'?'League club':'Cup club'} · Club colours: ${palette.split('/').map(color=>colors[color]||color).join('/')}`}
  for(const [pattern,replacement] of patterns)if(pattern.test(source))return source.replace(pattern,replacement);
  if(source.includes(' · '))return source.split(' · ').map(translate).join(' · ');
  if(source.includes(': ')){const index=source.indexOf(': '),before=source.slice(0,index),after=source.slice(index+2);if(labels.has(before)||countries[before])return `${translate(before)}: ${translate(after)}`}
  if(source.includes(', '))return source.split(', ').map(translate).join(', ');
  return source;
 }
 let language='de';
 try{if(localStorage.getItem(key)==='en')language='en'}catch{}
 const originalText=new WeakMap(),renderedText=new WeakMap(),originalAttributes=new WeakMap(),renderedAttributes=new WeakMap();
 const attributes=['aria-label','title','placeholder','alt'];
 function oldMatch(element){return element.closest('#game-screen')&&!document.body.classList.contains('v65-world-match')}
 function applyText(node){
  if(!node.parentElement||node.parentElement.closest('script,style,textarea,#language-select option,[contenteditable="true"]')||oldMatch(node.parentElement))return;
  const current=node.nodeValue,last=renderedText.get(node);
  if(!originalText.has(node)||current!==last)originalText.set(node,current);
  const source=originalText.get(node),match=source.match(/^(\s*)([\s\S]*?)(\s*)$/),next=language==='en'&&/[A-Za-zÄÖÜäöüß]/.test(match[2])?match[1]+translate(match[2])+match[3]:source;
  renderedText.set(node,next);
  if(current!==next)node.nodeValue=next;
 }
 function applyAttributes(element){
  if(oldMatch(element))return;
  let sources=originalAttributes.get(element),rendered=renderedAttributes.get(element);
  if(!sources){sources={};rendered={};originalAttributes.set(element,sources);renderedAttributes.set(element,rendered)}
  for(const attribute of attributes){
   const current=element.getAttribute(attribute);
   if(current===null)continue;
   if(!(attribute in sources)||current!==rendered[attribute])sources[attribute]=current;
   const next=language==='en'?translate(sources[attribute]):sources[attribute];
   rendered[attribute]=next;
   if(current!==next)element.setAttribute(attribute,next);
  }
 }
 function apply(root){
  if(root.nodeType===3){applyText(root);return}
  if(root.nodeType!==1)return;
  if(root.matches('script,style,textarea,[contenteditable="true"]')||oldMatch(root))return;
  applyAttributes(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode;
   if(node.nodeType===3)applyText(node);
   else applyAttributes(node);
  }
 }
 function setLanguage(next){
  if(next!=='de'&&next!=='en')return;
  language=next;
  document.documentElement.lang=next;
  document.title=next==='en'?'Doppel 6 · Football Manager':'Doppel 6 · Fußballmanager';
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content=next==='en'?'Your 6-a-side football manager. Pick your team and watch your tactics unfold on the pitch.':'Dein 6-gegen-6-Fußballmanager. Stelle dein Team auf und erlebe deine Taktik auf dem Platz.';
  const select=document.querySelector('#language-select');if(select)select.value=next;
  try{localStorage.setItem(key,next)}catch{}
  apply(document.body);
 }
 const select=document.querySelector('#language-select');
 if(select)select.addEventListener('change',event=>setLanguage(event.target.value));
 setLanguage(language);
 new MutationObserver(mutations=>{
  for(const mutation of mutations){
   if(mutation.type==='characterData')applyText(mutation.target);
   else if(mutation.type==='attributes')mutation.attributeName==='hidden'?apply(mutation.target):applyAttributes(mutation.target);
   else for(const node of mutation.addedNodes)apply(node);
  }
 }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...attributes,'hidden']});
 window.doppel6Language={get:()=>language,set:setLanguage,translate,localize:source=>language==='en'?translate(source):source};
})();
