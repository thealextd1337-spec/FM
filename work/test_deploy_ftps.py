"""Offline checks for the World4You upload command."""

import importlib.util
from ftplib import error_perm
import io
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock


spec = importlib.util.spec_from_file_location("deploy_ftps", Path(__file__).with_name("deploy_ftps.py"))
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class FakeFTP:
    instance = None

    def __init__(self, **kwargs):
        self.calls = []
        self.uploaded = b""
        FakeFTP.instance = self

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def connect(self, host, port):
        self.calls.append(("connect", host, port))

    def login(self, user, password):
        self.calls.append(("login", user, password))

    def prot_p(self):
        self.calls.append(("protected",))

    def cwd(self, path):
        self.calls.append(("cwd", path))

    def storbinary(self, command, source):
        self.calls.append(("upload", command))
        self.uploaded = source.read()

    def voidcmd(self, command):
        self.calls.append(("command", command))

    def size(self, name):
        self.calls.append(("size", name))
        return len(self.uploaded)


class DeployTests(unittest.TestCase):
    def test_uploads_only_index_and_checks_live_bytes(self):
        content = b"Doppel 6 test build"
        with tempfile.TemporaryDirectory() as directory:
            build = Path(directory) / "index.html"
            build.write_bytes(content)
            secrets = {
                "W4Y_FTP_HOST": "ftp.example.test",
                "W4Y_FTP_USER": "deploy",
                "W4Y_FTP_PASSWORD": "hidden",
                "W4Y_FTP_REMOTE_DIR": "/fussball",
                "DEPLOY_SHA": "abc123",
            }
            with mock.patch.dict(os.environ, secrets, clear=True), mock.patch.object(deploy, "BUILD", build), mock.patch.object(deploy.ssl, "create_default_context", return_value=object()), mock.patch.object(deploy, "FTP_TLS", FakeFTP), mock.patch.object(deploy, "urlopen", return_value=io.BytesIO(content)) as urlopen:
                deploy.publish()
        self.assertEqual(FakeFTP.instance.uploaded, content)
        self.assertEqual(FakeFTP.instance.calls[0], ("connect", "ftp.example.test", 21))
        self.assertEqual(FakeFTP.instance.calls[2], ("protected",))
        self.assertEqual(FakeFTP.instance.calls[3:5], [("cwd", "/fussball"), ("upload", "STOR index.html")])
        self.assertIn("deploy=abc123-1", urlopen.call_args.args[0].full_url)

    def test_rejects_missing_secret_before_network(self):
        with mock.patch.dict(os.environ, {}, clear=True), mock.patch.object(deploy, "FTP_TLS", FakeFTP):
            with self.assertRaisesRegex(RuntimeError, "W4Y_FTP_HOST"):
                deploy.publish()

    def test_reports_login_stage_without_credentials(self):
        class RejectedLogin(FakeFTP):
            def login(self, user, password):
                raise error_perm("530 Authentication rejected")

        with tempfile.TemporaryDirectory() as directory:
            build = Path(directory) / "index.html"
            build.write_bytes(b"test")
            secrets = {"W4Y_FTP_HOST": "ftp.example.test", "W4Y_FTP_USER": "deploy", "W4Y_FTP_PASSWORD": "hidden", "W4Y_FTP_REMOTE_DIR": "/fussball"}
            with mock.patch.dict(os.environ, secrets, clear=True), mock.patch.object(deploy, "BUILD", build), mock.patch.object(deploy.ssl, "create_default_context", return_value=object()), mock.patch.object(deploy, "FTP_TLS", RejectedLogin):
                with self.assertRaisesRegex(RuntimeError, r"FTPS login failed \(530\)") as failure:
                    deploy.publish()
        self.assertNotIn("hidden", str(failure.exception))


if __name__ == "__main__":
    unittest.main()
