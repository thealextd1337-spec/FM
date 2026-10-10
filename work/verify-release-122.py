from pathlib import Path
import hashlib, json, re, sys
from urllib.request import Request, urlopen

root=Path(__file__).resolve().parents[1]
out=root/'outputs/release-122'
html=(root/'outputs/index.html').read_bytes()
assert html==(root/'outputs/Doppel-6-Fussballmanager.html').read_bytes()
assert set(re.findall(rb'PROTOTYP (\d+)',html))=={b'122'}
assert b'runtime.html?v=122' in html
source=(root/'dist/index.html').read_bytes()
assert set(re.findall(rb'PROTOTYP (\d+)',source))=={b'122'}
manifest=json.loads((root/'outputs/platform/unity-web/probe-build.json').read_text())
assert manifest['sourceId']=='affd013bcc8e6b8528ba407f9d24f860221dad19af14416509ac5e0461371032'
assets=[]
for row in manifest['files']:
    p=root/'outputs/platform/unity-web/Build'/row['file']
    data=p.read_bytes()
    assert hashlib.sha256(data).hexdigest()==row['sha256']
    assets.append({'file':row['file'],'sha256':row['sha256'],'bytes':len(data)})
report={'version':122,'identicalOutputs':True,'sourceSha256':hashlib.sha256(source).hexdigest(),'buildSha256':hashlib.sha256(html).hexdigest(),'unitySourceId':manifest['sourceId'],'assets':assets}
native=json.loads((root/'outputs/ligaexpansion-ap11/native.json').read_text())
changed=[name for name,value in native['sourceHashes'].items() if hashlib.sha256((root/name).read_bytes()).hexdigest()!=value]
assert native['pass']
assert set(changed)=={'dist/index.html','dist/progress-v58.js','dist/world-3d-documentation-data-v134.js','dist/world-expansion-awards-v171.js'},changed
report['previousNativeTenSeasons']={'pass':True,'sourceFiles':len(native['sourceHashes']),'unchangedFiles':len(native['sourceHashes'])-len(changed),'changedPresentationFiles':changed}
if '--live' in sys.argv:
    def get(path):
        with urlopen(Request('https://fussball.cakamper.at/'+path,headers={'Cache-Control':'no-cache'}),timeout=55) as response:return response.read()
    live=get('?release122=hashcheck')
    assert live==html,'Live HTML differs from frozen candidate'
    report['liveHtmlMatches']=True
    for row in assets:
        data=get('unity/Build/'+row['file'])
        assert hashlib.sha256(data).hexdigest()==row['sha256'],'Live Unity differs: '+row['file']
        row['liveMatches']=True
    for name in ['runtime.html','runtime.js']:
        local=(root/'dist/unity-match'/name).read_bytes()
        assert get('unity-match/'+name)==local,'Live runtime differs: '+name
    report['liveRuntimeMatches']=True
    assert get('unity/probe-build.json')==(root/'outputs/platform/unity-web/probe-build.json').read_bytes()
(out/('live-hashes.json' if '--live' in sys.argv else 'frozen-candidate.json')).write_text(json.dumps(report,indent=2))
print(json.dumps({'version':122,'buildSha256':report['buildSha256'],'liveMatches':report.get('liveHtmlMatches',False),'unityFiles':len(assets)}))
