"""Offline proof that preview deployment cannot upload to the main site root."""
import io
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock
import zipfile
from ftplib import error_perm
sys.path.insert(0, str(Path(__file__).parent))
import deploy_preview_ftps as deploy


class FakeFTP:
    instance = None
    old_page = b""
    def __init__(self, **_args):
        self.calls = []
        self.files = {}
        FakeFTP.instance = self
    def __enter__(self): return self
    def __exit__(self, *_args): return False
    def connect(self, *_args): pass
    def login(self, *_args): pass
    def prot_p(self): self.calls.append(("TLS",))
    def cwd(self, name): self.calls.append(("cwd", name))
    def mkd(self, name): self.calls.append(("mkd", name))
    def retrbinary(self, _cmd, callback):
        if self.old_page: callback(self.old_page)
        else: raise error_perm("550 Missing")
    def storbinary(self, cmd, stream):
        self.calls.append(("upload", cmd));self.files[cmd.split(" ",1)[1]]=stream.read()
    def voidcmd(self, _cmd): pass
    def size(self, name): return len(self.files[name])
    def rename(self, src, dest): self.files[dest]=self.files.pop(src)


class PreviewTests(unittest.TestCase):
    def setUp(self):
        self.directory=tempfile.TemporaryDirectory()
        self.build=Path(self.directory.name)/"index.html"
        self.content=deploy.MARKER+b" PROTOTYP 105 real game"
        self.build.write_bytes(self.content)
        self.settings={"W4Y_FTP_HOST":"example.test","W4Y_FTP_USER":"test","W4Y_FTP_PASSWORD":"hidden","W4Y_FTP_REMOTE_DIR":"/fussball"}
        self.patches=[mock.patch.object(deploy,"BUILD",self.build),mock.patch.dict(os.environ,self.settings,clear=True),mock.patch.object(deploy,"FTP_TLS",FakeFTP),mock.patch.object(deploy.ssl,"create_default_context",return_value=object()),mock.patch.object(deploy.time,"sleep",lambda _seconds:None)]
        for patch in self.patches: patch.start()
        FakeFTP.old_page=b""
    def tearDown(self):
        for patch in reversed(self.patches): patch.stop()
        self.directory.cleanup()
    def test_uploads_only_child_directory_and_verifies_all_downloads(self):
        def live(request, **_args):
            self.assertTrue(request.full_url.startswith(deploy.LIVE_URL))
            name=request.full_url.split("?")[0].rsplit("/",1)[1]
            return io.BytesIO(FakeFTP.instance.files[name])
        with mock.patch.object(deploy,"urlopen",side_effect=live): deploy.publish()
        calls=FakeFTP.instance.calls
        self.assertEqual(calls[:3],[("TLS",),("cwd","/fussball"),("cwd","3d")])
        self.assertEqual(set(FakeFTP.instance.files),{"index.html","doppel6.zip","download.html"})
        self.assertEqual(FakeFTP.instance.files["index.html"],self.content)
        with zipfile.ZipFile(io.BytesIO(FakeFTP.instance.files["doppel6.zip"])) as archive:
            self.assertEqual(archive.namelist(),["doppel6.html"])
            self.assertEqual(archive.read("doppel6.html"),self.content)
    def test_existing_unrelated_page_is_never_overwritten(self):
        FakeFTP.old_page=b"Another website"
        with self.assertRaisesRegex(RuntimeError,"unrelated page"): deploy.publish()
        self.assertFalse(any(call[0]=="upload" for call in FakeFTP.instance.calls))
    def test_marked_preview_can_be_updated(self):
        FakeFTP.old_page=deploy.MARKER+b"previous preview"
        with mock.patch.object(deploy,"urlopen",side_effect=lambda request,**_:io.BytesIO(FakeFTP.instance.files[request.full_url.split("?")[0].rsplit("/",1)[1]])): deploy.publish()
    def test_rejects_path_traversal_before_connection(self):
        for value in ["/","/fussball/../main","/fussball//main"]:
            with mock.patch.dict(os.environ,{"W4Y_FTP_REMOTE_DIR":value}),mock.patch.object(deploy,"FTP_TLS") as ftp:
                with self.assertRaisesRegex(RuntimeError,"directory"): deploy.publish()
                ftp.assert_not_called()
    def test_rejects_unmarked_or_wrong_version_build(self):
        for content in [b"PROTOTYP 105",deploy.MARKER+b"PROTOTYP 97"]:
            self.build.write_bytes(content)
            with self.assertRaisesRegex(RuntimeError,"prototype 105"): deploy.payloads()
    def test_live_mismatch_is_reported(self):
        with mock.patch.object(deploy,"urlopen",side_effect=lambda *_args,**_kwargs:io.BytesIO(b"wrong")):
            with self.assertRaisesRegex(RuntimeError,"Live verification failed"): deploy.publish()


if __name__=="__main__": unittest.main()
