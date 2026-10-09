# Stadien: Profilnachweise

- `profile-catalog.json`: 48 tatsächliche Ergebnisse der mit PowerShell `Add-Type` kompilierten C#-Abfragen.
- `club-stadium-profile-tests.json`: 396 erfolgreiche Prüfungen des reinen C#-Testhooks.
- `check-catalog.cjs`: unabhängiger Abgleich mit dem aktiven JS-Vereinskatalog.
- `catalog-audit.json`: Ergebnis dieses Abgleichs einschließlich SHA-256 der Eingabequellen.

Erneut aus der Worktree-Wurzel erzeugen:

```powershell
$repo = (Get-Location).Path
Add-Type -Path @((Join-Path $repo 'prototypes/match-engine-unity/ClubStadiumProfiles.cs'), (Join-Path $repo 'prototypes/match-engine-unity/ClubStadiumProfilesTests.cs'))
[Doppel6.Probe.ClubStadiumProfilesTests]::Run($repo)
$profiles = [Doppel6.Probe.ClubStadiumProfiles]::KnownClubIds | ForEach-Object { [Doppel6.Probe.ClubStadiumProfiles]::Resolve($_) }
$profiles | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $repo 'outputs/3d-quality/stadiums/profile-catalog.json')
node outputs/3d-quality/stadiums/check-catalog.cjs
```

Bei Quelländerungen einen frischen PowerShell-Prozess verwenden, weil geladene C#-Typen in derselben Session nicht ersetzt werden. Reine Architekturprofile: Renderabnahme und Geräteleistung folgen bei der Unity-Integration.
