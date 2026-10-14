"""Freeze complete final-run evidence and produce the command-by-command handoff."""
import hashlib
import html
import json
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
out = root / 'outputs/release-r132-final'
def read(path):
    return json.loads(path.read_text(encoding='utf-8'))
ci = read(root / 'outputs/release-r132-ci/final-merged/results.json')
targeted = read(root / 'outputs/release-r132-ci/final-targeted-merged/results.json')
branch = read(out / 'branch/results.json')
extra = read(out / 'supplemental/results.json')
assert len(ci['results']) == 116 and len(branch['results']) == 16 and len(extra['results']) == 10
assert [row['index'] for row in ci['results']] == list(range(1, 117))
assert [row['index'] for row in ci['results'] if row['exit']] == [2]
assert len(targeted['results']) == 1 and targeted['results'][0]['index'] == 2
assert not any(row['exit'] for group in [targeted, branch, extra] for row in group['results'])
for source, target in [('outputs/release-r132-ci/final-merged', 'ci'),
                       ('outputs/release-r132-ci/final-targeted-merged', 'ci-targeted'),
                       ('outputs/finance-guide-r132', 'browser/finance'),
                       ('outputs/tactics-pointer-r132', 'browser/tactics'),
                       ('outputs/offer-reply-r132', 'browser/transfers')]:
    shutil.copytree(root / source, out / target, dirs_exist_ok=True)
# Keep regenerated check reports here, preserving their earlier tracked locations.
for name in ['outputs/3d-quality/corner-quality-v182/native.json',
             'outputs/3d-quality/iteration-119/whistle-offside-tests.json',
             'outputs/lowpoly-live-rollout-20261013/goal-tail-controlled.json']:
    target = out / 'reports' / Path(name).parent.name / Path(name).name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(root / name, target)

ci_rows = []
for original in ci['results']:
    row = dict(original, group='CI', log='ci/'+original['log'])
    if row['index'] == 2:
        row.update(targeted['results'][0])
        row.update(group='CI', log='ci-targeted/'+row['log'], rerun=True)
    ci_rows.append(row)
groups = [('CI', ci_rows),
          ('Branch', [dict(row, group='Branch', log='branch/'+row['log']) for row in branch['results']]),
          ('Zusatz', [dict(row, group='Zusatz', log='supplemental/'+row['log']) for row in extra['results']])]
summary = dict(status='passed', base='3085ab55', ci=116, branch=16, supplemental=10,
               networkPublication=False, reusedPart1Results=False,
               nodeVersion=subprocess.check_output([ci['node'], '--version']).decode().strip(),
               pythonVersion=subprocess.check_output(['py', '-3', '--version']).decode().strip(),
               commands=[row for _, rows in groups for row in rows])
(out / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

note = '''# Release 132 · abschließende lokale Prüfung (Teil 2)

Arbeitsort `work/release-r132`, Branch `release/r132`, integrierter Ausgangsstand `3085ab55`. Veröffentlichung beauftragt; die Integration übernimmt Push auf main, Deployment und Live-Abnahme. Kein Push, Deploy oder Live-Zugriff in diesem Teil.

**Ergebnis:** 116/116 CI-Befehle, 16/16 Branchchecks und 10/10 Zusatzbefehle grün. Node v24.19.0 über `C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`; Python über `py -3`. POSIX-Variablenpräfixe sind als Prozessumgebung gesetzt; `python3` verwendet lokal denselben Python-Interpreter. Browserchecks auf localhost:4240, mit dem im Repository dokumentierten isolierten Edge/Playwright-Prüfzugang. Server nach dem Lauf beendet.

Alle 116 Befehle des Schritts „Spieltests ausführen“ wurden nach dem Animations-Merge neu ausgeführt; keine Teil-1-Ergebnisse wiederverwendet. Ein Erstlauf schlug beim Tornetz-Harness fehl. Die neue mehrzeilige Produktionsprojektion wird jetzt vollständig geladen, einschließlich ihrer Beobachtungs-/Vorbereitungshilfen; alle bisherigen Assertions und Grenzen bleiben erhalten. Nur dieser Test wurde erneut ausgeführt. Der rote Erstlauf bleibt unter [ci/002.log](ci/002.log), der grüne Wiederholungslauf unter [ci-targeted/002.log](ci-targeted/002.log) erhalten. Keine Produktkorrektur oder abgeschwächte Erwartung in Teil 2.

Branch-Altpartienvergleich gegen archiviertes `f2458c1f`: unmarkierte native Szenen einschließlich Zufallsfolge und Ledger identisch. Dies ist keine vollständige Gesamtpartie-Restore-Freigabe. Die Basisabweichung 3.540/3.676 Ticks (je 1:0) und fünf rote Altchecks bleiben im Backlog; sie wurden hier nicht erneut ausgeführt.

## Vollständige CI-Befehle

| Nr. | Befehl aus deploy.yml | Ergebnis | Dauer | Log |
| ---: | --- | --- | ---: | --- |
'''
for row in ci_rows:
    label = 'grün, nach Harnesskorrektur erneut' if row.get('rerun') else 'grün'
    note += f'| {row["index"]} | `{row["command"]}` | {label} (Exit 0) | {row["seconds"]} s | [Log]({row["log"]}) |\n'
for title, rows in groups[1:]:
    note += f'\n## {title}: alle Befehle\n\n| Nr. | Befehl | Ergebnis | Dauer | Log |\n| ---: | --- | --- | ---: | --- |\n'
    for row in rows:
        note += f'| {row["index"]} | `{row["command"]}` | grün (Exit 0) | {row["seconds"]} s | [Log]({row["log"]}) |\n'
note += '''
Der Build ist im Zusatzlauf neu erzeugt; beide HTML-Dateien sind bytegleich und zeigen Footer/Runtime-Cache 132. [Versions- und SHA-256-Nachweis](package-verification.json) bindet Produktquellen, Tests, Workflow und beide Builds. Der Unity-WebGL-Payload wurde nicht neu gebaut oder verändert.

## Browserbelege und Offline-Publikation

- Finanzführung: acht Szenarien (Desktop/Mobil, DE/EN, Saison 1/2), [Bericht](browser/finance/browser-check.json).
- Taktikpläne: 211 Prüfungen über Matchplan, Vorbereitung und Pause; Maus-/Touch-Drag, Klick ohne Verschiebung, Abbruch, Tastatur/assistive Bedienung und Überlauf; [Bericht](browser/tactics/browser-check.json).
- Angebotsrückzug/Antworten: Desktop und 390 px, DE/EN, Vereinsannahme/Gegenangebot/Ablehnung, Spielerforderung, Rückzug/neues Angebot und Fokus; [Log](branch/16-check-offer-withdraw-reply-browser-r132.log). Screenshots liegen unter `browser/transfers/`.
- Echte Manifest-/Build-Trockenprüfung: neun reale Dateien mit Größen/SHA-256, bytegleichem Fake-FTPS-Upload, Manifest zuletzt, sieben simulierte HTTP-Prüfungen und kein index.html. Kein Netzwerk; die Live-URL in der Ausgabe des unveränderten Deployers ist hier ausschließlich ein Mockziel. [Uploadplan](publication-dry-run.json).

## Übergabegrenzen

B01 bleibt auf Nutzerentscheidung unbehandelt; B02-Fix wegen Nebenwirkungen zurückgenommen; B05 nur teilweise (Knieflips). Offene Tackling-/Pass-/Beckengrenzen, Gesamtpartie-Restore-Parität, fünf rote Basischecks und das B10-Folgeballverhalten sind dokumentiert. P01 bleibt unter dem Ziel von 4–6 Minuten/10–16 Schüssen: Basis 3,24/4,7/1,98/1,5 gegenüber neu 2,86/3,85/1,35/1,13 (Zeit/Schüsse/aufs Tor/Tore, 40 vorhandene Vollpartien; hier nicht neu gemessen).

Neue Matchregeln nur für neue Partien, Kennung 182; keine Nachberechnung gespeicherter Partien. Nutzerabnahme der Korrekturen und reale Geräte-/Dauerlastabnahme bleiben offen. Beim Deployment zuerst die neue Unity-Laufzeit veröffentlichen, danach die Seite; Quelle, Build und Live-Version 132 sowie öffentliche Dateihashes prüfen. [Releasebericht](../../docs/release-132.md).
'''
(out / 'README.md').write_text(note, encoding='utf-8')

all_rows = summary['commands']
tr = ''.join(f'<tr data-group="{row["group"]}"><td>{row["group"]} {row["index"]}</td><td><code>{html.escape(row["command"])}</code>{"<small>nach Harnesskorrektur erneut</small>" if row.get("rerun") else ""}</td><td class="ok">grün</td><td>{row["seconds"]} s</td></tr>' for row in all_rows)
page = '''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{font-family:var(--font-sans,system-ui);color:var(--foreground,#202020);margin:0}p{line-height:1.45}label{display:block;font-weight:600;margin:16px 0 8px}.controls{display:flex;gap:8px;flex-wrap:wrap}input,select{padding:9px;border:1px solid var(--border,#ccc);border-radius:6px;background:var(--background,white);color:inherit;font:inherit}input{flex:1;min-width:150px}table{width:100%;border-collapse:collapse;font-size:13px}td,th{text-align:left;padding:9px 6px;border-bottom:1px solid var(--border,#ddd);vertical-align:top}th{position:sticky;top:0;background:var(--background,white)}code{font-family:var(--font-mono,monospace);overflow-wrap:anywhere}td:nth-child(2){width:64%}small{display:block;color:var(--muted-foreground,#666);margin-top:5px}.ok{color:var(--success,#13823c);font-weight:600}.scroll{max-height:420px;overflow:auto;margin-top:12px}#count{color:var(--muted-foreground,#666);font-size:13px;margin:9px 0}strong{font-weight:650}</style>
<p><strong>Release 132 · vollständige lokale Prüfungen</strong><br>116/116 CI-Befehle · 16/16 Branchchecks · 10/10 Zusatzbefehle grün.</p>
<p>Alle CI-Befehle nach dem Animations-Merge neu ausgeführt. Der Tornetz-Test wurde nach Korrektur des VM-Ladeblocks wiederholt; seine Verhaltensassertions und Grenzen bleiben erhalten. Keine Teil-1-Ergebnisse wiederverwendet.</p>
<label for="search">Befehle durchsuchen</label><div class="controls"><input id="search" type="search" placeholder="Dateiname oder Befehl"><select id="group" aria-label="Prüfgruppe"><option value="CI">CI (116)</option><option value="Branch">Branch (16)</option><option value="Zusatz">Zusatz (10)</option><option value="all">Alle (142)</option></select></div><p id="count" aria-live="polite"></p><div class="scroll"><table><thead><tr><th>Nr.</th><th>Befehl</th><th>Ergebnis</th><th>Dauer</th></tr></thead><tbody>'''+tr+'''</tbody></table></div>
<p>Node v24.19.0 · Python über py -3 · Browserchecks localhost:4240. Neun reale Unity-Dateien offline geprüft; Manifest zuletzt, sieben simulierte HTTP-Prüfungen, kein index.html-Upload und kein Netzwerk.</p>
<script>const rows=[...document.querySelectorAll('tbody tr')],search=document.querySelector('#search'),group=document.querySelector('#group');function filter(){let n=0;for(const r of rows){r.hidden=!(group.value==='all'||r.dataset.group===group.value)||!r.textContent.toLowerCase().includes(search.value.toLowerCase());if(!r.hidden)n++}document.querySelector('#count').textContent=n+' Befehle angezeigt'}search.addEventListener('input',filter);group.addEventListener('change',filter);filter();console.assert(rows.length===142,'All 142 commands present');console.assert(rows.filter(r=>r.dataset.group==='CI').length===116,'All 116 CI commands present');console.log('Release handoff: 142 rows; initial CI filter '+rows.filter(r=>!r.hidden).length);</script></html>'''
(out / 'handoff.html').write_text(page, encoding='utf-8')
print('PASS: complete handoff, 142 commands, immutable first-failure and rerun logs')
