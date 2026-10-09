# C01: Accountvertrag, Entwurf 1

Stand: 9. Oktober 2026. Der Nutzer hat den parallelen Vertragsvorlauf mit „Setze es um“ gestartet; 3D-Qualität bleibt erste Priorität. Die älteren Planungsstopps in [C01/C02-Aufträgen](../agentenauftraege/04-accounts-adminstatistik.md) und [Accountplan](../account-admin-statistik-plan.md) sind für **diesen Dokumentationsvorlauf** aufgehoben. Dieses Dokument beschreibt vorgeschlagene technische Schnittstellen, keine vorhandenen APIs, implementierte Anmeldung oder Produktionsfreigabe. Bestätigte Produktregeln stehen in diesen Quellen und [Produktregeln](../product.md); neue technische Entscheidungen sind unten ausdrücklich als Vorschlag oder Gate markiert.

## Umfang und gemeinsame Grenze

C01 liefert verpflichtenden Accountzugang per E-Mail-Anmeldelink und Google, ohne eigenes Passwort/Gastzugang. C02 konsumiert dieselbe zentrale Identität, Rechteprüfung, Elternfreigabe und Löschereignisse; seine Datenverträge stehen in [C02](admin-statistics-contract.md). Vollständige Cloudspielstände, S01-Geräteübergabe und öffentliche Hall of Fame sind eigene spätere Pakete. Ein Statistiksnapshot ist kein wiederherstellbarer Spielstand.

Der Integrator reserviert Provideradapter, Repositorytransaktionen, Sitzungen, Router, Schema, Loader, Übersetzungen, sichere Start-/Speicher-/Lifecyclehooks und Deployment. C01/C02 erzeugen keinen konkurrierenden Authpfad. Implementierung beginnt erst nach Freigabe des gemeinsamen Vertrags und Dateibesitzes; echte Anmeldung braucht zusätzlich gewählten und eingerichteten Provider-/Betriebsweg.

## Vorschlag: zentrale serverseitige Schnittstellen

Alle Typen sind Referenznotation, keine Quellmodule. `AuthContext` entsteht ausschließlich im zentralen Serveradapter nach tatsächlich geprüfter Sitzung. Request-JSON darf diesen Typ nicht liefern oder verändern.

```ts
type AuthMethod = 'email_link' | 'google';
type AccountState = 'active' | 'blocked' | 'deletion_pending' | 'deleted';
type AgeGroup = 'under_14' | '14_plus' | 'unknown' | 'conflicting';
type ParentalState = 'not_required' | 'pending' | 'approved' | 'rejected'
  | 'revoked' | 'expired' | 'unknown';

interface AuthContext { // nur serverintern
  accountId: string;
  sessionId: string;
  authMethod: AuthMethod;
  authenticatedAt: string; // UTC, vom Server
  accountState: AccountState;
  authorizationRevision: number;
}
interface AccessDecision { // von C01/zentraler Policy, nicht aus Browserflags
  allowed: boolean;
  reason: 'allowed' | 'unauthenticated' | 'account_blocked' | 'account_deleted'
    | 'age_unresolved' | 'parental_approval_required' | 'parental_approval_revoked'
    | 'not_owner' | 'not_admin' | 'google_session_required';
  authorizationRevision: number;
}
interface IdentityPort {
  requireSession(request: unknown): Promise<AuthContext>;
  authorize(ctx: AuthContext, capability: 'play' | 'career_create'
    | 'statistics_ingest' | 'usage_ingest' | 'admin_statistics_read'
    | 'admin_csv_export', careerId?: string): Promise<AccessDecision>;
}
```

`authorize` liest aktuellen Account-/Elternstatus und die serverseitige Karrierezuordnung; ein beim Login erzeugter veralteter Clientstatus genügt nicht. Repository-/Sitzungsfehler erzeugen keine Erlaubnis. Bei Ingestion müssen Rechteprüfung und Commit denselben wirksamen Berechtigungs-/Löschstand beachten, damit paralleler Widerruf oder Löschung keine neue Aufnahme zulässt. Der Integrator wählt Transaktion, Versionsprüfung oder gleichwertige Durchsetzung.

Der Provideradapter liefert intern geprüfte `{issuer, subject, method}`. Er prüft die zum gewählten Mechanismus gehörenden Signaturen, Ziel/Audience, Gültigkeit und Callbackbindung. `issuer + subject` werden zentral einem stabilen `accountId` zugeordnet; Name oder vom Browser behauptete E-Mail bestimmen keine Identität. Prüfung/Refresh/Callbackdetails folgen dem noch zu wählenden Provider. Secrets bleiben im jeweiligen Auth-/Sessionbereich; C02 erhält weder Provideridentität noch E-Mail.

## Vorschlag: Accountaktionen und erlaubte Antworten

| Serviceoperation | Erlaubte Eingabe | Resultat und Regeln |
| --- | --- | --- |
| `beginEmailLogin` | E-Mail ausschließlich an C01, freigegebenes Rücksprungziel, Request-ID | Einheitliche Versand-/Fehlerantwort ohne verratene Kontoexistenz; Frist, Versandlimit und Maildienst sind Gate |
| `completeEmailLogin` | Zweckspezifische Linkcredential über gewählten sicheren Mechanismus | Atomarer begrenzter Verbrauch; Retry derselben abgeschlossenen Anfrage erzeugt kein zweites Konto; kein Elternlink als Login |
| `beginGoogleLogin / completeGoogleLogin` | Providerprotokoll über Adapter | Geprüfte stabile Identität; abgebrochener/fremder/abgelaufener Callback erzeugt keine Sitzung |
| `getAccountStatus` | Zentrale Sitzung | Nur eigene Accountstatusantwort gemäß folgender Allowlist |
| `linkAuthMethod` | Gültige Accountsession, neuer separat geprüfter Anmeldeweg, Aktionsbezug | Berechtigung für beide Wege; keine Zusammenführung per gleicher E-Mail; Konflikt bei bereits anderem Account zugeordnetem Subject |
| `checkOnlineAccess` | Gültige Sitzung und registrierter Gerätebezug | Aktuellen Account-/Elternstatus prüfen, erst danach neue Offlinefreigabe |
| `logout` | Eigene Sitzung/Gerät, Request-ID | Lokale Sperre sofort; serverseitige Entwertung separat quittieren, offline als ausstehend kennzeichnen |
| `requestAccountDeletion` | Zentral festgelegte frische Identitätsbestätigung, Request-ID | Account sperren, Sitzungen entwerten, Löschauftrag an C02 idempotent weitergeben; Fristen/Backupablauf sind Gate |

Vorgeschlagene eigene Accountstatusantwort: `{contractVersion, accountId, accountState, displayName?, authMethods[], ageGroup, parentalState, canPlay, accessReason, serverCheckedAt, offlineValidUntil?, deletionState?}`. Angaben dienen Konto-/Zugangsdarstellung. Elternkontakt, Linkcredential, Providersecrets und fremde Sitzungen sind keine Antwortfelder. `canPlay` ist Darstellung des servergeprüften Zustands, keine vom Client wieder hochladbare Autorität. Anzeige-/Namensregeln bleiben freizugeben.

Der Betreiber meldet sich bestätigt über Google an. Vorschlag für Adminaktionen: Google-Sitzung **und** zentral provisionierte stabile Betreiber-Accountkennung prüfen. Ein per Mail-Link eingeloggter verknüpfter Betreiberaccount erhält nach diesem Entwurf erst nach Googleanmeldung Adminlesen/-export. Ob der ausgewählte Provider diesen Authmethodennachweis tragfähig liefert, ist Gate. Provisionierung erfolgt über einen kontrollierten Betriebsweg; es gibt kein Selbstbeförderungsfeld, keinen „erster Nutzer wird Admin“-Mechanismus und keine zusätzliche App-TOTP-Abfrage. Ein Googlelogin behauptet keinen zusätzlich geprüften Faktor.

## Elternfreigabe: gemeinsame Zustände

Bestätigt ist die nötige Unterscheidung `under_14` / `14_plus` statt Geburtsdatum oder exakter Alterszahl. Fehlende/widersprüchliche Angaben bleiben `unknown`/`conflicting`, bis der noch freizugebende Korrektur-/Prüfablauf sie auflöst. Die Gruppenauswahl allein verifiziert weder Alter noch elterliche Verantwortung.

| Zustand | Spielzugang/Erfassung | Erlaubter nächster Schritt |
| --- | --- | --- |
| Altersstatus unbekannt/widersprüchlich | Gesperrt; keine automatische Spielzeit-/Karrierestatistik | Zentraler Klärungs-/Korrekturablauf |
| `14_plus`, nach freigegebenem Verfahren geklärt | Elternstatus `not_required`; übrige Account-/Sitzungsprüfung gilt | Onlinefreigabe |
| `under_14`, `pending` | Online/Offline gesperrt; nur erforderliche Antragsverarbeitung | Elternverfahren abschließen |
| `under_14`, `approved` | Nur mit aktueller gültiger Freigabe für freigegebene Zwecke | Onlinefreigabe, Statistikverarbeitung |
| `rejected`, `revoked`, `expired`, `unknown` | Gesperrt; neue Aufnahme/Erfassung unterbinden | Je Zustand neuer/berichtigter Antrag nach festgelegtem Verfahren |

Vorgeschlagener serverinterner Datensatz: `{approvalId, accountId, state, purposeVersion, requestedAt, decidedAt?, authorizationRevision, expiresAt?}`. Elternkontakt und Nachweisverfahren bleiben separat im C01-Bereich, niemals in Statistikantwort/CSV. Konkrete Aufbewahrung, Freigabe-/Antragsfristen, Alters-/Elternverifikation und Widerruf sind vor Produktion zu entscheiden; `approved` darf erst das tatsächlich freigegebene Verfahren setzen.

Der bestätigte E-Mail-Link führt auf eine zweckgebundene Entscheidungsseite ohne Eltern-Spielkonto. GET/Linköffnen durch Vorschau oder Mailscanner ändert den Status nicht. Die explizite Entscheidung benötigt den passenden gültigen Antrag, Zweckversion und noch verwendbare Credential; Bestätigung/Retry sind atomar und idempotent. Fremde, abgelaufene oder widerrufene Anträge scheitern definiert. Neue Anfrage kopiert keine Freigabe eines anderen Accounts. Elterninformation umfasst Konto, Spielzeit, Karrierestatistik, private Adminansicht/CSV, Aufbewahrung und Löschung. Die Freigabe eröffnet keinen pauschalen Werbe-/Kauf-/Hall-of-Fame-Zweck.

Widerruf erhöht die zentrale Berechtigungsrevision und stoppt weitere Verarbeitung gemäß vereinbartem Zweck. Umgang mit vorhandenen Statistiken, offline entstandenen Beiträgen und nach erneuter Freigabe eintreffenden alten Puffern bleibt im Zweck-/Löschvertrag zu entscheiden; der Entwurf sieht bis dahin keine Wiederaufnahme solcher Altbeiträge vor. Ohne Netz kann ein Gerät einen entfernten Widerruf nicht sofort erfahren.

## Offlinefreigabe: bestätigte Regel und technischer Vorschlag

Erste Anmeldung braucht Netz. Danach darf derselbe freigeschaltete Account auf diesem Gerät offline weiterspielen. Bestätigte Gültigkeit: 30 Tage ab letzter erfolgreicher Onlineprüfung. Vorschlag zur exakten Grenze: **30 × 24 Stunden**, UTC; `estimatedNow < validUntil` erlaubt, Gleichheit/Überschreitung sperrt. Bloße Verbindung, Neustart, Statistikretry oder fehlgeschlagene Prüfung verlängern nicht.

Vorgeschlagene signierte Offlinefreigabe:

```ts
interface OfflineGrant { // vorgeschlagene Claims; Verifikation über zentralen Adapter
  version: 1;
  grantId: string;
  accountId: string;
  deviceId: string;
  accountEpoch: number;
  deviceAuthorizationRevision: number;
  purposeVersion: string;
  checkedOnlineAt: string;
  validUntil: string;
  capability: 'play';
}
```

Die signierte Hülle, Schlüsselhaltung/-wechsel, Gerätespeicher und Gerätebindungsstärke sind Gate. Browserablagen sind keine manipulationssichere Plattform; eine Signatur allein verhindert weder Geräteuhrzurückstellen noch Wiederherstellen einer alten lokalen Kopie. Keine entsprechende Sicherheitszusage ableiten. Offlinefreigabe autorisiert **keinen** Adminzugriff, Upload oder serverseitigen Gerätewechsel. Elternfreigabe muss bei Ausstellung servergeprüft gültig sein; das Gerät führt nur den zuletzt bestätigten Zustand, bis eine neuere Onlineprüfung verfügbar ist.

Vorschlag für legitime Zeitprüfung: Serverzeit und lokalen Zeitanker beim Erfolg dauerhaft speichern; in laufender Session monotone Zeit nutzen. Zurücklaufende Uhr, widersprüchlicher gespeicherter Anker oder nicht verifizierbare Freigabe verlangen Onlineprüfung. Zwischen Neustarts bleibt die sichere Erkennung weiterer Clock-/Speicheränderungen ein Plattformgate. Keine Freigabe allein aus Client-Wanduhr rekonstruieren.

Ausdrückliche Abmeldung schreibt zuerst eine dauerhafte lokale Entwertung/Sperre, sperrt offene Tabs und entwertet den aktiven Spielzugang. Der Integrator stoppt Fortschrittskommandos/Matchtakt an der sicheren Speichergrenze; vorhandener Fortschritt bleibt erhalten. Vorschlag: gemeinsame geräteweite Sperrrevision plus tabübergreifendes Signal. Eine misslungene dauerhafte Sperrspeicherung ist kein erfolgreicher Logout; Fehler und Wiederherstellungsweg sind explizit zu behandeln. Re-Login mit Internet desselben Accounts stellt nach erneuter Prüfung wieder frei. Andere Accounts erhalten die erhaltenen Karrieren nicht. Serverwiderruf einer offline ausgelösten Abmeldung wird mit stabiler Request-ID nachgeliefert; bis Quittierung bleibt er ausstehend.

Automatischer API-Sitzungsablauf ist von ausdrücklicher Abmeldung getrennt. Vorschlag: Er beendet Serveraktionen, lässt eine noch gültige Offlinefreigabe zum Spielen bestehen. Bekannt gewordene Sperre/Löschung/Widerruf entwertet dagegen lokal sofort, nachdem der Serverzustand empfangen wurde. Genaues Verhalten bei Ablauf im laufenden Match und sicherer Unterbrechung ist vor Implementierung freizugeben.

## Neue Karrieren und Löschereignisse

Neue accountgebundene Karrieren sind der Einstieg. Altkarrieren bleiben unverändert erhalten, sind aber im neuen Ausbau weder zuordenbar noch importierbar oder Quelle von Statistiken/Titeln. Manipulierte Clientkennung, neu gesetzter Marker oder umbenannte Savekopie begründen keine Herkunft.

Vorschlag `CareerRegistryPort.registerNewCareer(ctx, {creationRequestId, creationContractVersion, ruleVersion, sourceVersion, localGenerationId}) -> {careerId, ownerAccountId, origin:'new_account_career', registeredAt, ownershipRevision}`. Der Server vergibt/verankert ID und Eigentümer aus `ctx`; der Integrator bindet das Resultat ausschließlich an seinen tatsächlich neuen Erstellungsablauf. Keine API `claimExistingSave`. Verfahren für Erzeugung neuer Karrieren ohne Netz sowie Herkunfts-/Kopierprüfung sind Gate; eine durch den Browser behauptete neue Herkunft wird nicht als technisch sicher verifiziert dargestellt. Vollständige Cloudsaves würden einen späteren stärkeren Herkunftsvertrag benötigen.

Accountlöschung liefert vorgeschlagen `{eventId, accountId, accountEpoch, kind:'account_deleted', effectiveAt}` über den zentralen Outbox-/Repositoryvertrag. Verarbeitung ist wiederholbar. C02 entfernt aktive und archivierte Ranglistenstatistiken, zugehörige Caches und accountbezogene Beiträge; lokale Uploadpuffer werden entwertet. Bestehende lokale Karrieren werden nicht allein dadurch gelöscht oder einem neu angelegten Konto zugewiesen. Tombstone-/Backupwiederherstellung verhindert Wiederbelebung; genaue Lösch-/Backupfristen sind Gate. Elternwiderruf ist ein anderes Ereignis und ersetzt nicht automatisch den noch offenen Datenlöschvertrag.

## Fehler und negative Abnahmefälle

Vorschlag Fehlerhülle: `{error:{code, retryable, requestId}}`; verständliche DE/EN-Texte im Client, keine Payloads/Secrets/Elternkontakte in Fehlern. HTTP-Zuordnung legt der Integrator fest: nicht authentifiziert 401, nicht erlaubt 403, Konflikt 409, ungültiges Schema 422, begrenzte Anfrage 429, Abhängigkeit nicht verfügbar 503. Fremde Karrierekennungen erhalten nach freizugebender Enumerationpolicy eine einheitliche 403/404-Antwort.

| Fall | Erwartete Abnahme |
| --- | --- |
| Erster Start offline / Providerfehler | Keine Anmeldung/Offlinefreigabe erfunden; kein Gastfallback |
| Beide Loginwege, abgelaufener/verbrauchter Link, Callbackretry | Nur geprüfte Identität; kein zweites Konto; definierter Fehler |
| Elternlink als Login, GET-Scanner, falscher Antrag/Zweck | Kein Login, keine Freigabe |
| U14 pending/rejected/revoked, manipulierte Alters-/Elternflags | Online/Offline gesperrt; direkte Statistik-/Zeitroute ebenfalls abgewiesen |
| Linking fremder Subject, gleiche Client-E-Mail | Keine Accountübernahme oder stille Zusammenführung |
| Normaler Account mit `admin=true`, erstes Konto, Mail-Session des Betreibers | Kein Adminzugang; nur freigegebener Google-/Provisionierungsweg |
| Offlinefrist vor/an/nach Grenze; Fehlprüfung, Uhrzurückstellen, Neustart | Grenze und Zeitgate wie freigegeben; gespeicherter Fortschritt erhalten |
| Abmeldung offline, offene Tabs/Match, Crash/Neustart | Dauerhafte Sperre wirksam; keine frühere Freigabe reaktiviert |
| API-Tokenablauf bei gültiger Offlinefreigabe | Verhalten gemäß freigegebenem separatem Ablaufvertrag |
| Konto A → B; alte Saves/Import/umbenannte Kopie | Kein Datenzugriff/Upload/Übernahme durch B; kein Altimport |
| Accountlöschung + spätere Wiederholungen/Backuprestore | Aktive und archivierte Statistik bleibt entfernt; alte Eigentümerschaft nicht übertragen |

Diese Fälle sind Spezifikation, nicht ausgeführte Auth-/Gerätetests. Offene Gates und die Umsetzungsreihenfolge stehen in [Vorlauf](account-preflight.md). Anbieterunabhängige Dokumente allein erfüllen den Accountrelease nicht.
