"""Offline checks for complete, hash-bound Unity publication."""
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock

import deploy_unity_assets as deploy


class FakeFTP:
    instance = None

    def __init__(self, **_kwargs):
        self.path = "/site"
        self.files = {}
        self.calls = []
        FakeFTP.instance = self

    def __enter__(self): return self
    def __exit__(self, *_args): return False
    def connect(self, *_args): pass
    def login(self, *_args): pass
    def prot_p(self): pass
    def pwd(self): return self.path
    def voidcmd(self, *_args): pass

    def cwd(self, value):
        self.path = value if value.startswith("/") else self.path + "/" + value

    def storbinary(self, command, source):
        name = self.path + "/" + command.removeprefix("STOR ")
        self.files[name] = source.read()
        self.calls.append(name)

    def size(self, name): return len(self.files[self.path + "/" + name])


class DeployTests(unittest.TestCase):
    def fixture(self, root):
        unity, runtime = root / "unity", root / "runtime"
        (unity / "Build").mkdir(parents=True)
        runtime.mkdir()
        rows = []
        for name in ("unity-web.data", "unity-web.wasm", "unity-web.framework.js", "unity-web.loader.js"):
            content = name.encode()
            (unity / "Build" / name).write_bytes(content)
            rows.append({"file": name, "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()})
        (unity / "probe-build.json").write_text(json.dumps({"worldView": "d6-world-view-1", "files": rows}))
        (unity / ".htaccess").write_text("AddType application/wasm .wasm")
        for name in ("runtime.html", "runtime.js", ".htaccess"):
            (runtime / name).write_text(name)
        return unity, runtime

    def test_complete_assets_verified_without_publishing_index(self):
        secrets = {"W4Y_FTP_HOST": "ftp.test", "W4Y_FTP_USER": "deploy", "W4Y_FTP_PASSWORD": "hidden", "W4Y_FTP_REMOTE_DIR": "/site"}
        requests = []

        def live(request, **_kwargs):
            relative = request.full_url.split(".at/", 1)[1].split("?", 1)[0]
            requests.append(relative)
            return io.BytesIO(FakeFTP.instance.files["/site/" + relative])

        with tempfile.TemporaryDirectory() as folder:
            unity, runtime = self.fixture(Path(folder))
            # Fake FTPS does not use TLS; keep this offline test independent of
            # the host OpenSSL configuration removed by the clean environment.
            with mock.patch.object(deploy, "UNITY", unity), mock.patch.object(deploy, "RUNTIME", runtime), mock.patch.dict(os.environ, secrets, clear=True), mock.patch.object(deploy.ssl, "create_default_context", return_value=object()), mock.patch.object(deploy, "FTP_TLS", FakeFTP), mock.patch.object(deploy, "urlopen", side_effect=live):
                deploy.publish()
        self.assertEqual(len(FakeFTP.instance.files), 9)
        self.assertEqual(FakeFTP.instance.calls[-1], "/site/unity/probe-build.json")
        self.assertEqual(len(requests), 7)
        self.assertFalse(any(name.endswith("index.html") for name in FakeFTP.instance.files))
        self.assertFalse(any(name.endswith(".htaccess") for name in requests))

    def test_corrupt_build_rejected_before_network(self):
        with tempfile.TemporaryDirectory() as folder:
            unity, runtime = self.fixture(Path(folder))
            (unity / "Build" / "unity-web.wasm").write_bytes(b"damaged")
            with mock.patch.object(deploy, "UNITY", unity), mock.patch.object(deploy, "RUNTIME", runtime):
                with self.assertRaisesRegex(RuntimeError, "frozen manifest"):
                    deploy.publication_files()

    def test_unexpected_manifest_path_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            unity, runtime = self.fixture(Path(folder))
            (unity / "probe-build.json").write_text(json.dumps({"worldView": "d6-world-view-1", "files": [{"file": "../../index.html"}]}))
            with mock.patch.object(deploy, "UNITY", unity), mock.patch.object(deploy, "RUNTIME", runtime):
                with self.assertRaisesRegex(RuntimeError, "Unexpected"):
                    deploy.publication_files()

    def test_missing_secret_rejected_before_network(self):
        with mock.patch.dict(os.environ, {}, clear=True), mock.patch.object(deploy, "FTP_TLS") as ftp:
            with self.assertRaisesRegex(RuntimeError, "W4Y_FTP_HOST"):
                deploy.publish()
            ftp.assert_not_called()

    def test_creates_only_required_subdirectories_inside_root(self):
        from ftplib import error_perm

        class DirectoryFTP(FakeFTP):
            known = {"/site"}

            def cwd(self, value):
                target = value if value.startswith("/") else self.path + "/" + value
                if target not in self.known:
                    raise error_perm("550 missing directory")
                self.path = target

            def mkd(self, value):
                self.known.add(self.path + "/" + value)

        ftp = DirectoryFTP()
        deploy.directory(ftp, "/site", "unity/Build/unity-web.wasm")
        self.assertEqual(ftp.known, {"/site", "/site/unity", "/site/unity/Build"})
        self.assertEqual(ftp.pwd(), "/site/unity/Build")

    def test_rejects_remote_traversal_before_publication(self):
        secrets = {"W4Y_FTP_HOST": "ftp.test", "W4Y_FTP_USER": "deploy", "W4Y_FTP_PASSWORD": "hidden", "W4Y_FTP_REMOTE_DIR": "/site/../other"}
        with mock.patch.dict(os.environ, secrets, clear=True), mock.patch.object(deploy, "publication_files") as files:
            with self.assertRaisesRegex(RuntimeError, "existing site directory"):
                deploy.publish()
            files.assert_not_called()


if __name__ == "__main__": unittest.main()
