import json,pathlib,urllib.request,hashlib,datetime
p=pathlib.Path('outputs/release-121');before=json.loads((p/'prepublication.json').read_text());ci=json.loads((p/'ci-status.json').read_text())
assert ci['run']['head_sha']==before['productCommit'] and ci['run']['conclusion']=='success'
record={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productCommit':before['productCommit'],'version':121,'sourceId':before['sourceId'],'requestHeaders':{'Cache-Control':'no-cache','Pragma':'no-cache'},'ci':{'id':ci['run']['id'],'url':ci['run']['html_url'],'headSha':ci['run']['head_sha'],'conclusion':ci['run']['conclusion'],'jobs':[{'id':j['id'],'conclusion':j['conclusion'],'steps':j['steps']} for j in ci['jobs']['jobs']]},'files':[]}
try:
 for row in before['files']:
  request=urllib.request.Request(row['url']+'?verify='+row['sha256'],headers={**record['requestHeaders'],'User-Agent':'Doppel6-release121-verification'})
  with urllib.request.urlopen(request,timeout=60) as response:
   body=response.read(); actual=hashlib.sha256(body).hexdigest();result={**row,'httpStatus':response.status,'liveBytes':len(body),'liveSha256':actual,'matches':len(body)==row['bytes'] and actual==row['sha256']};record['files'].append(result)
   assert result['matches'],row['url'];print(row['url'],len(body),actual)
  if row['file']=='outputs/index.html':
   text=body.decode('utf8');assert 'PROTOTYP 121' in text;record['htmlVersion']='PROTOTYP 121'
  elif row['file'].endswith('probe-build.json'):assert json.loads(body)['sourceId']==before['sourceId']
 record['passed']=True
finally:(p/'live-hashes.json').write_text(json.dumps(record,indent=2)+'\n')
print('PASS 8 actual live byte hashes')
