import json,pathlib,urllib.request,datetime
base='https://api.github.com/repos/thealextd1337-spec/FM/actions/runs/38048077381'
get=lambda u:json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Doppel6-release121-verification'}),timeout=30))
j=get(base+'/jobs');r=get(base) if j['jobs'] and all(x['status']=='completed' for x in j['jobs']) else json.loads(pathlib.Path('outputs/release-121/ci-status.json').read_text())['run'];result={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'run':r,'jobs':j}
pathlib.Path('outputs/release-121/ci-status.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'status':r['status'],'conclusion':r['conclusion'],'current':[s['name'] for x in j['jobs'] for s in x['steps'] if s['status']=='in_progress'],'failed':[s['name'] for x in j['jobs'] for s in x['steps'] if s['conclusion'] not in [None,'success','skipped']]},ensure_ascii=True))
