"""Exercise publication of the REAL frozen release package entirely offline."""
import hashlib
import io
import json
import os
from pathlib import Path
from unittest import mock

import deploy_unity_assets as deploy
from test_deploy_unity_assets import FakeFTP

requests = []
def offline_http(request, **_kwargs):
    relative = request.full_url.split('.at/', 1)[1].split('?', 1)[0]
    requests.append(relative)
    return io.BytesIO(FakeFTP.instance.files['/site/' + relative])

files = deploy.publication_files()  # Real manifest sizes and SHA-256 checked here.
manifest = json.loads((deploy.UNITY / 'probe-build.json').read_text(encoding='utf-8'))
assert manifest['sourceId'] == '787a9cd134a8f784a53bcf89b23e27140b40b00a1e93ca534d3c47d59ff10eb3'
assert "productVersion:'132'" in (deploy.RUNTIME / 'runtime.js').read_text(encoding='utf-8')
secrets = dict(W4Y_FTP_HOST='ftp.test', W4Y_FTP_USER='offline',
               W4Y_FTP_PASSWORD='offline', W4Y_FTP_REMOTE_DIR='/site')
with mock.patch.dict(os.environ, secrets, clear=True), \
     mock.patch.object(deploy.ssl, 'create_default_context', return_value=object()), \
     mock.patch.object(deploy, 'FTP_TLS', FakeFTP), \
     mock.patch.object(deploy, 'urlopen', side_effect=offline_http):
    deploy.publish()
assert len(FakeFTP.instance.files) == 9
assert FakeFTP.instance.calls == ['/site/' + relative for _, relative in files]
assert FakeFTP.instance.calls[-1] == '/site/unity/probe-build.json'
assert len(requests) == 7 and not any(name.endswith('.htaccess') for name in requests)
assert not any(name.endswith('index.html') for name in FakeFTP.instance.files)
rows = []
for source, target in files:
    content = source.read_bytes()
    assert content == FakeFTP.instance.files['/site/' + target]
    rows.append(dict(source=str(source), target=target, bytes=len(content),
                     sha256=hashlib.sha256(content).hexdigest()))
out = Path('outputs/release-r132-final')
out.mkdir(parents=True, exist_ok=True)
(out / 'publication-dry-run.json').write_text(json.dumps(dict(
    status='passed', network=False, sourceId=manifest['sourceId'],
    uploadOrder=rows, httpChecks=requests), indent=2)+'\n', encoding='utf-8')
print('PASS: 9 real package files, manifest last, 7 offline HTTP checks, no index upload/network')
