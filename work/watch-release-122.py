from pathlib import Path
import json, sys, time
from urllib.request import Request, urlopen

commit=sys.argv[1]
out=Path(__file__).resolve().parents[1]/'outputs/release-122'
previous=None
jobs=[]
last_status=None
for attempt in range(40):
    endpoint='https://api.github.com/repos/thealextd1337-spec/FM/actions/runs?head_sha='+commit+'&per_page=5'
    with urlopen(Request(endpoint,headers={'Accept':'application/vnd.github+json','User-Agent':'Doppel6-release-122'}),timeout=30) as response:
        rows=json.load(response)['workflow_runs']
    rows=[r for r in rows if r['name']=='Doppel 6 deploy' and r['head_sha']==commit]
    if rows:
        run=rows[0]
        report={key:run[key] for key in ['id','html_url','head_sha','status','conclusion']}
        if attempt%3==0 or last_status!=run['status']:
            endpoint=run['jobs_url']
            with urlopen(Request(endpoint,headers={'Accept':'application/vnd.github+json','User-Agent':'Doppel6-release-122'}),timeout=30) as response:
                jobs=json.load(response)['jobs']
        last_status=run['status']
        report['jobs']=[{'name':j['name'],'status':j['status'],'conclusion':j['conclusion'],'steps':[{'name':s['name'],'status':s['status'],'conclusion':s['conclusion']} for s in j['steps']]} for j in jobs]
        (out/'deployment.json').write_text(json.dumps(report,indent=2))
        current=json.dumps(report)
        if current!=previous:print(current,flush=True);previous=current
        if run['status']=='completed':raise SystemExit(0 if run['conclusion']=='success' else 1)
    time.sleep(45)
raise SystemExit('Deployment has not completed within the bounded 30-minute observation window')
