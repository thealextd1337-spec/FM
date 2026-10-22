# Einführung beim Spielstart – Texte zur Freigabe

Stand: 22. Oktober 2026. Vom Nutzer freigegeben und in `dist/world-tutorial-v186.js` umgesetzt; maßgeblich ist der Code. Abweichungen nach der Browserprüfung stehen am Ende. Grundlage ist Release 133: Startablauf `v172RenderFlow()` in `dist/world-expansion-interface-v172.js`, Leitaktionen aus den `v58State()`-Überschreibungen, Bedienelemente aus `dist/ui-flutlicht/` und den `world-*`-Modulen. Fähigkeiten werden nur als Farbstufen genannt, ohne Zahlen. Knopfnamen in „…“ entsprechen den sichtbaren deutschen Beschriftungen in Release 133.

## A. Erklärungen im Startablauf

Je Schritt ein aufklappbares Feld unter dem vorhandenen Einleitungstext.

| Schritt | Aufklapper | Deutsch | Englisch |
| --- | --- | --- | --- |
| alle | Titel | Was bedeutet das? | What does this mean? |
| Manager | Text | Dein Name erscheint in der Karriere, in der Vereinschronik und in deiner Managerlaufbahn. | Your name appears in your career, in the club history and in your manager record. |
| Land | Text | Jedes Land hat eine eigene Liga mit acht Vereinen und 14 Spieltagen sowie einen nationalen Pokal. Über Liga und Pokal qualifizierst du dich für den Crown Cup und den Horizon Cup. Das Land legt fest, in welcher Liga du beginnst. | Each country has its own league with eight clubs and 14 matchdays plus a national cup. League and cup lead to the Crown Cup and the Horizon Cup. The country decides which league you start in. |
| Verein | Text | Alle acht Ligavereine sind wählbar. Nach der Wahl siehst du den erzeugten Startkader und kannst jeden Spieler ansehen, bevor du dich festlegst. Mit „Zurück“ wählst du einen anderen Verein; der Kader des jeweiligen Vereins bleibt dabei gleich. | All eight league clubs are available. After choosing, you see the generated starting squad and can open every player before you commit. Use “Back” to pick another club; each club keeps the same squad. |
| Prüfen | Text | Gespielt wird auf dem Standardfeld mit fünf Feldspielern und einem Torwart. Die Karriere wird nur in diesem Browser gespeichert. Bis zu fünf Vereinswelten haben Platz; sichere wichtige Karrieren zusätzlich über den Export auf der Startseite. | Matches use the standard pitch with five outfield players and a goalkeeper. The career is saved only in this browser. Up to five club worlds fit; back up important careers with the export on the start page. |

Option im Prüfen-Schritt, direkt über „Karriere speichern und starten“:

| | Deutsch | Englisch |
| --- | --- | --- |
| Kontrollkästchen | Einführung zeigen | Show the introduction |
| Hinweis darunter | Die Einführung führt dich durch die erste Transferphase und dein erstes Spiel. Du kannst sie jederzeit beenden oder unter Hilfe & Einstellungen neu starten. | The introduction guides you through your first transfer window and your first match. You can end it at any time or restart it under Help & Settings. |

## B. Geführte Einführung

Begleitfenster mit den Knöpfen **Weiter** / **Next**, **Zurück** / **Back**, **Kapitel überspringen** / **Skip chapter**, **Einführung beenden** / **End introduction**; bei Zielen in einem anderen Bereich zusätzlich **Hinführen** / **Take me there**. Oben im Fenster steht „Einführung · {Kapiteltitel}“ / “Introduction · {chapter title}”.

„Ziel“ ist das hervorgehobene Element. „Weiter bei“ nennt die Aktion, nach der das Fenster von selbst weitergeht; sonst geht es mit „Weiter“ weiter.

### Kapitel 1 – Willkommen

Start: erste Ansicht der Karriere nach dem Speichern (Phase Sponsorwahl).

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 1.1 | – | – | **Willkommen beim {Verein}!** Diese Einführung begleitet dich durch deine erste Transferphase und dein erstes Spiel. Du kannst jeden Schritt überspringen. | **Welcome to {club}!** This introduction guides you through your first transfer window and your first match. You can skip any step. |
| 1.2 | Leitaktion `.fl-topbar [data-fl-lead]` | – | **Der nächste Schritt.** Dieser Knopf zeigt immer, was als Nächstes ansteht. Wenn du nicht weiterweißt, schau hierher. | **The next step.** This button always shows what comes next. Whenever you are unsure, look here. |
| 1.3 | Navigation `.fl-main-nav` / mobil `.fl-mobile-nav` | – | **Deine Bereiche.** Hier erreichst du Übersicht, Kader, Aufstellung & Taktik, Transfers, Wettbewerbe, Kalender, Statistik und Verein. Auf dem Handy liegen Übersicht, Kader und Transfers unten, alles Weitere unter „Menü“. | **Your sections.** From here you reach Overview, Squad, Line-up & tactics, Transfers, Competitions, Calendar, Statistics and Club. On a phone, Overview, Squad and Transfers sit at the bottom; everything else is under “Menu”. |
| 1.4 | `.fl-overview-office` | – | **Das Vereinsbüro.** Auf der Übersicht sammelt das Vereinsbüro, was gerade zu tun ist: eingegangene Angebote, auslaufende Verträge und Nachwuchs. Ein Tipp auf eine Aufgabe führt direkt an die passende Stelle. | **The club office.** On the overview, the club office collects what needs your attention: incoming offers, expiring contracts and youth players. Tap a task to go straight to it. |
| 1.5 | `#v170-office` | – | **Die News.** Darunter erscheinen die Meldungen deiner Vereinswelt: Meilensteine deines Vereins, Erfolge in den Cups und Trainerwechsel bei anderen Vereinen. Neue Meldungen sind als ungelesen markiert. Über die Links öffnest du den Verein, den Spieler oder die Partie. Zu Beginn ist der Bereich noch leer. | **The news.** Below it you find the news of your club world: your club's milestones, cup successes and coach changes at other clubs. New items are marked as unread. The links open the club, the player or the match. At the start this section is still empty. |
| 1.6 | `#v66-sponsor` | Sponsor gewählt (`v66ChooseSponsor`) | **Dein Sponsor.** Wähle zuerst einen Sponsor. Jedes Angebot zeigt ein festes Fixum, Bonusziele mit Beträgen und die Auszahlungstermine. Höhere Ziele bringen mehr Geld, sind aber schwerer zu schaffen. | **Your sponsor.** First choose a sponsor. Each offer shows a fixed base amount, bonus targets with amounts and the payment dates. Higher targets pay more but are harder to reach. |

### Kapitel 2 – Jugendförderung

Start: Leitaktion „Finanzabschluss und Jugendförderung“ (`v124-budget`).

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 2.1 | `#v124-budget` | Förderung bezahlt (`v124SetYouthBudget`) | **Jugendförderung.** Lege fest, wie viel du in deinen Nachwuchs investierst, und bestätige mit „Jugendförderung bezahlen und Transfers öffnen“. Danach beginnt die Transferphase. | **Youth funding.** Decide how much you invest in your youth players and confirm with “Pay youth funding and open transfers”. The transfer window starts afterwards. |

### Kapitel 3 – Transferphase

Start: erster Transfertag (`v66-day`, Tag 1).

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 3.1 | `.fl-lead-progress` | – | **Fünf Transfertage.** Die Transferphase dauert fünf Tage. An jedem Tag gibst du Angebote ab; Vereine und Spieler antworten am nächsten Transfertag. | **Five transfer days.** The transfer window lasts five days. Each day you make offers; clubs and players answer on the next transfer day. |
| 3.2 | Transfers → `[data-fl-section-tab="search"]` | – | **Spielersuche.** Unter Transfers → Spielersuche stehen alle Spieler, die du verpflichten kannst. Filtere nach Position und Ablöse. „Nur ablösefreie“ zeigt vereinslose Spieler, für die du keine Ablöse zahlst. Weitere Filter wie Land oder Verein klappst du auf. | **Player search.** Transfers → Player search lists every player you can sign. Filter by position and fee. “Free agents only” shows players without a club, so no transfer fee is due. Open further filters such as country or club. |
| 3.3 | erstes `.v66-player-card [data-v66-profile]` | – | **Spieler ansehen.** Ein Tipp auf den Namen öffnet das Profil. Fähigkeiten siehst du als Farbstufen; die Legende im Profil erklärt jede Stufe. | **View a player.** Tap the name to open the profile. Abilities appear as colour levels; the legend in the profile explains each level. |
| 3.4 | erstes `.v66-player-pick` | Gebot abgegeben (`v72Start`) oder Vertragsangebot gesendet | **Spieler kaufen: das Gebot.** Tippe auf „Angebot planen“. Bei einem Spieler mit Verein legst du zuerst die Ablöse fest und tippst auf „Gebot abgeben“. Einem ablösefreien Spieler schickst du direkt ein Vertragsangebot. Du kannst diesen Schritt auch nur lesen und weitergehen. | **Buying a player: the bid.** Tap “Plan offer”. For a player with a club you first set the transfer fee and tap “Place bid”. A free agent gets a contract offer straight away. You can also just read this step and continue. |
| 3.5 | – | – | **Spieler kaufen: der Vertrag.** Stimmt der Verein der Ablöse zu, verhandelst du mit dem Spieler Gehalt, Laufzeit und Einsatzversprechen und sendest das Vertragsangebot. Gegenangebote beantwortest du im Ergebnisfenster oder unter Transfers → Angebote & Verhandlungen. | **Buying a player: the contract.** Once the club accepts the fee, you negotiate wage, contract length and a playing-time promise with the player and send the contract offer. Answer counter-offers in the results window or under Transfers → Offers & negotiations. |
| 3.6 | Kader `[data-fl-route="squad"]`, im Profil `[data-v72-list-own]` | Spieler angeboten (`v72ListOwn`) | **Spieler verkaufen.** Öffne unter Kader das Profil eines eigenen Spielers. Lege eine verhandelbare Ablöse fest und tippe auf „Zum Verkauf anbieten“. Interessierte Vereine melden sich an den nächsten Transfertagen. | **Selling a player.** Under Squad, open one of your players' profiles. Set a negotiable fee and tap “Offer for sale”. Interested clubs respond on the following transfer days. |
| 3.7 | Transfers → `[data-fl-section-tab="own"]` | – | **Deine Transferliste.** Unter Transfers → Eigene Transferliste stehen deine angebotenen Spieler. Dort senkst du den Preis, ziehst ein Angebot zurück oder nimmst Kaufangebote an, lehnst sie ab oder stellst eine Gegenforderung. Angebote für Spieler, die du nicht angeboten hast, findest du unter „Angebote & Verhandlungen“. | **Your transfer list.** Transfers → Own transfer list shows the players you offered. There you lower the price, withdraw a player or accept, reject or counter purchase offers. Offers for players you did not list appear under “Offers & negotiations”. |
| 3.8 | Kader → `[data-fl-section-tab="contracts"]` | – | **Verträge.** Unter Kader → Verträge siehst du, wessen Vertrag ausläuft. Spieler im letzten Vertragsjahr kannst du dort verlängern. Wie das geht, zeigt dir die Einführung, sobald ein Vertrag ausläuft. | **Contracts.** Squad → Contracts shows whose contract is running out. Players in their final contract year can be extended there. The introduction shows you how as soon as a contract is running out. |
| 3.9 | Leitaktion | Transfertag ausgeführt (`v66RunMarketDay`) | **Nächster Transfertag.** Wenn du für heute fertig bist, tippe auf „Nächster Transfertag“. Ein Fenster zeigt dann alle Antworten: angenommene Gebote, Gegenangebote und abgeschlossene Transfers. | **Next transfer day.** When you are done for today, tap “Next transfer day”. A window then shows every answer: accepted bids, counter-offers and completed transfers. |
| 3.10 | Ergebnisfenster (`v72ShowResults`) | – | **Antworten.** Hier entscheidest du, wie es weitergeht. Mit „Später“ verschiebst du die Antwort; offene Verhandlungen bleiben unter „Angebote & Verhandlungen“. Das Kapitel endet hier, die übrigen Transfertage gehören dir. | **Answers.** Decide how to continue here. “Later” postpones your answer; open negotiations stay under “Offers & negotiations”. This chapter ends here; the remaining transfer days are yours. |

### Kapitel 4 – Transferschluss

Start: Leitaktion „Transferschluss bestätigen“ (Tag 5).

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 4.1 | Leitaktion | – | **Transferschluss.** Mit „Transferschluss bestätigen“ endet die Transferphase; laufende Verhandlungen werden danach noch abgeschlossen. Gehälter zahlst du nicht jetzt, sondern am Saisonende nach der Platzierungsprämie. | **Transfer deadline.** “Confirm transfer deadline” ends the window; ongoing negotiations are settled afterwards. Wages are not paid now but at the end of the season, after the placement bonus. |

### Kapitel 5 – Aufstellung und Taktik

Start: erste Leitaktion „Nächstes Spiel vorbereiten“.

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 5.1 | `[data-fl-route="matchplan"]` | – | **Aufstellung & Taktik.** Hier stellst du deine Startelf auf: einen Torwart und fünf Feldspieler. Der Rest sitzt auf der Ersatzbank. | **Line-up & tactics.** This is where you pick your starting team: one goalkeeper and five outfield players. Everyone else sits on the bench. |
| 5.2 | erstes `[data-v64-career-slot]` | Aufstellung geändert (`v64CareerCommit`) | **Spieler aufstellen.** Ziehe einen Spieler von der Ersatzbank auf das Spielfeld oder verschiebe Spieler auf dem Feld. Ein einfacher Tipp markiert nur. Auf dem Handy wischst du einen Bankspieler seitlich heraus und ziehst ihn aufs Feld. | **Placing players.** Drag a player from the bench onto the pitch or move players around the pitch. A single tap only selects. On a phone, swipe a bench player sideways and drag him onto the pitch. |
| 5.3 | Spielfeld | – | **Positionen.** Die Reihe bestimmt die Einsatzposition: vorne Angriff, in der Mitte Mittelfeld, hinten Abwehr. Ein gelber Rand mit Warnzeichen zeigt einen Spieler außerhalb seiner Stammposition; dort spielt er etwas schwächer. | **Positions.** The row sets the match position: front is attack, middle is midfield, back is defence. A yellow border with a warning sign marks a player outside his usual position, where he plays slightly worse. |
| 5.4 | `[data-v64-career-tab="tactics"]` | – | **Taktik.** Im Reiter Taktik legst du Grundordnung, Pressing, Passspiel, Angriffsfokus, Abwehrlinie und Zweikampfverhalten fest. | **Tactics.** The Tactics tab sets formation, pressing, passing, attacking focus, defensive line and tackling. |
| 5.5 | Leitaktion | Spielvorbereitung geöffnet | **Zum Spiel.** Mit „Nächstes Spiel vorbereiten“ werden die Partien vor deiner berechnet, dann öffnet sich die Spielvorbereitung. | **To the match.** “Prepare next match” plays the fixtures before yours, then the match preparation opens. |

### Kapitel 6 – Dein erstes Spiel

Start: Spielvorbereitung mit Leitaktion „Match starten“.

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 6.1 | `[data-v64-quick]` | – | **Spielvorbereitung.** Vor dem Anpfiff kannst du Aufstellung und Taktik noch ändern. Die Schnellknöpfe passen beides mit einem Tipp an; „Rückgängig“ nimmt Änderungen zurück. | **Match preparation.** Before kick-off you can still change line-up and tactics. The quick buttons adjust both with one tap; “Undo” reverts changes. |
| 6.2 | Leitaktion | Spiel gestartet (`v61AdvanceCareer`) | **Anpfiff.** Mit „Match starten“ beginnt dein Spiel live. | **Kick-off.** “Start match” begins your match live. |
| 6.3 | `#career-progress-action` | Pause (`v65Pause`) | **Live dabei.** Dein Spiel läuft. Mit „Taktik & Wechsel“ oder „Pause“ hältst du es an, um einzugreifen. | **Watching live.** Your match is running. “Tactics & subs” or “Pause” stops it so you can step in. |
| 6.4 | `#v65-pause-tabs` | – | **Taktik und Wechsel.** In der Pause änderst du die Taktik oder wechselst aus: Ziehe einen Bankspieler auf einen Feldspieler. Der Wechsel erfolgt bei der nächsten Spielunterbrechung und lässt sich bis dahin zurücknehmen. | **Tactics and subs.** While paused you can change tactics or make a substitution: drag a bench player onto a player on the pitch. The substitution happens at the next stoppage and can be undone until then. |
| 6.5 | erste `.v51-pitch-bar` | – | **Frische.** Der Balken an jedem Spieler zeigt seine Frische. Müde Spieler verlieren an Wirkung; wechsle sie rechtzeitig aus. Mit „Spiel fortsetzen“ geht es weiter. | **Freshness.** The bar on each player shows his freshness. Tired players lose impact, so substitute them in time. “Resume match” continues. |
| 6.6 | Leitaktion (Halbzeit) | 2. Halbzeit gestartet (`v65Resume`) | **Halbzeit.** Zur Pause hält das Spiel automatisch an. Prüfe Frische und Taktik, dann geht es mit „2. Halbzeit starten“ weiter. | **Half-time.** The match stops automatically at the break. Check freshness and tactics, then continue with “Start 2nd half”. |
| 6.7 | `#v47-match-report` | – | **Spielbericht.** Nach dem Abpfiff zeigt der Spielbericht Tore, Noten und Statistiken. Danach folgen die Ergebnisse des Spieltags; „Zur Vereinszentrale“ bringt dich zurück. | **Match report.** After the final whistle the report shows goals, ratings and statistics. The matchday results follow; “To club home” takes you back. |
| 6.8 | – | – | **Geschafft!** Das war die Einführung. Neue Aufgaben und News findest du im Vereinsbüro auf der Übersicht, Erklärungen jederzeit unter Hilfe & Einstellungen. Viel Erfolg in deiner ersten Saison! | **Done!** That's the introduction. New tasks and news wait in the club office on the overview, and explanations are always under Help & Settings. Good luck in your first season! |

### Kapitel 7 – Vertrag verlängern

Start: sobald ein eigener Spieler im letzten Vertragsjahr verlängert werden kann (Vertragsende in der laufenden Saison, Saison nicht beendet, nicht während der Sponsorwahl). Das Kapitel ist an keine Reihenfolge gebunden und kann auch nach Kapitel 6 oder in einer späteren Saison kommen. Läuft gerade ein anderes Kapitel, wartet es, bis dieses beendet ist. {Spieler} ist der erste betroffene Spieler.

| Nr. | Ziel | Weiter bei | Deutsch | Englisch |
| --- | --- | --- | --- | --- |
| 7.1 | Aufgabe „Auslaufende Verträge“ `[data-fl-overview-section="contracts"]` | – | **Ein Vertrag läuft aus.** Der Vertrag von {Spieler} endet mit dieser Saison. Das Vereinsbüro meldet das unter „Auslaufende Verträge“. Verlängerst du nicht, verlässt er den Verein am Saisonende. | **A contract is running out.** {player}'s contract ends this season. The club office lists this under “Expiring contracts”. If you do not extend it, he leaves the club at the end of the season. |
| 7.2 | Kader → Verträge, `[data-fl-contract-filter="attention"]` | – | **Handlungsbedarf.** Unter Kader → Verträge zeigt „Handlungsbedarf“ alle Spieler, um die du dich kümmern solltest: auslaufende Verträge, laufende Verhandlungen und angekündigte Karriereenden. | **Action needed.** Under Squad → Contracts, “Action needed” lists every player who needs your attention: expiring contracts, ongoing negotiations and announced retirements. |
| 7.3 | `[data-v66-renew-open]` bei {Spieler} | Verhandlung geöffnet | **Verlängern.** Tippe bei {Spieler} auf „Verlängern“. | **Extend.** Tap “Extend” next to {player}. |
| 7.4 | `#v66-renew-dialog` | Angebot gesendet (`v66Renew`) | **Dein Angebot.** Lege Jahresgehalt, Laufzeit (zwei oder drei Saisons) und eine Einsatz-Zusage fest und tippe auf „Angebot senden“. Der Spieler antwortet sofort. | **Your offer.** Set the annual wage, the contract length (two or three seasons) and a playing-time promise, then tap “Send offer”. The player answers right away. |
| 7.5 | `#v66-renew-dialog` | – | **Die Antwort.** Ist ihm das Gehalt zu niedrig, nennt er eine Gegenforderung. Pro Verhandlungsrunde hast du zwei Angebote. Scheitern beide, öffnet sich später in der Saison eine zweite Runde; das Datum steht im Dialog. Spieler, die ihr Karriereende angekündigt haben, lassen sich nicht verlängern. | **The answer.** If the wage is too low, he names a counter-demand. You have two offers per negotiation round. If both fail, a second round opens later in the season; the dialog shows the date. Players who have announced their retirement cannot be extended. |

## C. Hilfe & Einstellungen, Abschnitt „Einführung“

| Element | Deutsch | Englisch |
| --- | --- | --- |
| Überschrift | Einführung | Introduction |
| Schalter | Einführung anzeigen | Show introduction |
| Knopf | Einführung für diese Karriere neu starten | Restart introduction for this career |
| Bestätigung nach Knopf | Die Einführung beginnt wieder mit Kapitel 1 und folgt deiner Karriere ab ihrer aktuellen Phase. | The introduction starts again at chapter 1 and follows your career from its current phase. |
| Glossar-Titel | Grundlagen | Basics |

Glossar, je Eintrag ein Aufklapper:

| Begriff DE / EN | Deutsch | Englisch |
| --- | --- | --- |
| Farbstufen / Colour levels | Fähigkeiten werden in fünf Farbstufen gezeigt, von schwach bis herausragend. Die Legende im Spielerprofil nennt jede Stufe auch als Wort. | Abilities are shown in five colour levels, from weak to outstanding. The legend in the player profile also names each level. |
| Stamm- und Einsatzposition / Usual and match position | Die Stammposition gehört zum Spieler. Die Einsatzposition ergibt sich aus seiner Reihe im Aufstellungsraster. Auf einer fremden Position spielt er im Match etwas schwächer. | The usual position belongs to the player. The match position follows from his row on the line-up grid. Out of position he plays slightly worse during the match. |
| Frische / Freshness | Frische sinkt im Spiel und steigt an spielfreien Tagen wieder. Ausdauernde Spieler ermüden langsamer. Zu Saisonbeginn sind alle Spieler voll frisch. | Freshness drops during matches and recovers on days without a match. Players with more stamina tire more slowly. Everyone starts the season fully fresh. |
| Transfertage / Transfer days | In jeder Transferphase gibt es fünf Tage. Angebote werden am nächsten Transfertag beantwortet. | Each transfer window has five days. Offers are answered on the next transfer day. |
| Gehälter / Wages | Gehälter werden einmal am Saisonende nach der Platzierungsprämie bezahlt. | Wages are paid once at the end of the season after the placement bonus. |
| Crown Cup und Horizon Cup | Die beiden internationalen Wettbewerbe neben Liga und Pokal. Der Crown Cup ist der höhere. | The two international competitions alongside league and cup. The Crown Cup is the higher one. |

## Vor der Umsetzung offene Punkte

Alle Punkte wurden im Browser oder im Code geprüft; die Folgen stehen unter „Umgesetzte Abweichungen“. Zu Kapitel 7: Der Startkader enthält einen Vertrag mit Ende in Saison 1, und ein nicht verlängerter Vertrag des eigenen Vereins endet am Saisonende mit Wechsel in die Vereinslosen (`world-economy-v66.js`). Die 3D-/Unity-Liveansicht ist nicht automatisiert geprüft; die Spielprüfung läuft mit `?engine=browser`.

- Kapitelreihenfolge am Saisonstart: Sponsorwahl → Jugendförderung → Transfertag 1 (laut Code; die Phase `budget` liegt vor der Transferphase).
- Englische Knopf- und Navigationsnamen; die Tabelle nennt sinngemäße Übersetzungen, umgesetzt werden die tatsächlichen Beschriftungen aus `doppel6Language.localize`.
- Wortlaut der Schnellknöpfe in der Spielvorbereitung (6.1) und ob die Frische auch vor dem Anpfiff sichtbar ist.
- Kapitel 6 mit der 3D-/Unity-Liveansicht: Begleitfenster darf das Spielbild nicht dauerhaft verdecken; notfalls während des laufenden Spiels einklappen.
- Kapitel 7: ob der Startkader in Saison 1 schon Verträge mit Ende in Saison 1 enthält; dann kommt das Kapitel meist früh, direkt nach dem laufenden Kapitel.
- Kapitel 7: ob der Spieler bei Vertragsende den Verein ablösefrei verlässt (Text 7.1).
- Mobile Aufstellung: ob das seitliche Herauswischen der Bankspieler so verständlich beschrieben ist.

## Umgesetzte Abweichungen nach der Browserprüfung

- Der Navigationspunkt heißt „Matchplan“; Kapitel 1.3 und 5.1 nennen ihn so.
- Das Aufstellungsfeld liegt am Desktop quer: 5.3 spricht von den Zonen Verteidigung, Mittelfeld und Angriff statt von vorne/hinten.
- 6.1 nennt die Schnellknöpfe „Frischeste“, „Defensiver“ und „Offensiver“.
- 6.3/6.4: Aufstellung, Wechsel und Frischebalken erscheinen erst nach „Taktik & Wechsel“ in der Pause; der Text fordert dazu auf. Beide Schritte erscheinen nur während Pause oder Halbzeit.
- 6.7 bleibt auch in der anschließenden Ergebnisansicht sichtbar.
- 3.10 setzt kein Antwortfenster voraus.
- 2.1 hebt den Bestätigungsknopf hervor statt des ganzen Abschnitts.
- Kapitel 7 startet erst nach Kapitel 3 oder nach der Transferphase, weil schon der Startkader einen in Saison 1 auslaufenden Vertrag enthält.
- Englische Knopfnamen werden zur Laufzeit aus der Übersetzungstabelle des Spiels übernommen (`doppel6Language.translate`).
- Liegt das Ziel in der unteren Bildschirmhälfte, rückt das Begleitfenster nach oben unter die Leitaktion.
- Der Schrittzähler zählt fest von 1 bis zur letzten Schrittnummer des Kapitels.
