"""Publish the 3D build only in the existing site's isolated /3d/ directory."""
import hashlib
import io
import os
from pathlib import Path
import ssl
import time
from ftplib import FTP_TLS, error_perm
from urllib.request import Request, urlopen
import zipfile
from deploy_ftps import setting

BUILD = Path("outputs/index.html")
LIVE_URL = "https://fussball.cakamper.at/3d/"
MARKER = b'<meta name="doppel6-preview" content="3d">'


def payloads():
    content = BUILD.read_bytes()
    if MARKER not in content or b"PROTOTYP 105" not in content:
        raise RuntimeError("Expected marked prototype 105 build")
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
        bundle.writestr("doppel6.html", content)
    download = ('<!doctype html><html lang="de"><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width"><title>Doppel 6 Downloads</title>'
                '<body style="font:18px system-ui;padding:30px;background:#142b2c;color:#f3f8ed">'
                '<h1>Doppel 6 · 3D-Version 105</h1><p><a style="color:#c7f36b" href="./">Spiel öffnen / Play</a></p>'
                '<p><a style="color:#c7f36b" href="doppel6.zip" download>ZIP herunterladen / Download ZIP</a></p>'
                '<p><a style="color:#c7f36b" href="index.html" download="doppel6.html">HTML herunterladen / Download HTML</a></p>'
                '<p>ZIP entpacken und doppel6.html im Browser öffnen.<br>Extract ZIP and open doppel6.html in your browser.</p></body></html>').encode()
    return {"doppel6.zip": archive.getvalue(), "download.html": download, "index.html": content}


def publish():
    root = setting("W4Y_FTP_REMOTE_DIR")
    if not root.strip("/") or any(p in ("", ".", "..") for p in root.strip("/").split("/")):
        raise RuntimeError("Invalid existing website directory")
    files = payloads()
    with FTP_TLS(context=ssl.create_default_context(), timeout=60) as ftp:
        ftp.connect(setting("W4Y_FTP_HOST"), 21)
        ftp.login(setting("W4Y_FTP_USER"), setting("W4Y_FTP_PASSWORD"))
        ftp.prot_p()
        ftp.cwd(root)
        try:
            ftp.cwd("3d")
        except error_perm:
            ftp.mkd("3d")
            ftp.cwd("3d")
        previous = bytearray()
        try:
            ftp.retrbinary("RETR index.html", previous.extend)
        except error_perm as error:
            if not str(error).startswith("550"):
                raise
        if previous and MARKER not in previous:
            raise RuntimeError("Refusing to overwrite an unrelated page in /3d/")
        for name, content in files.items():
            temporary = name + ".upload"
            ftp.storbinary("STOR " + temporary, io.BytesIO(content))
            ftp.voidcmd("TYPE I")
            if ftp.size(temporary) != len(content):
                raise RuntimeError("Upload size mismatch")
            ftp.rename(temporary, name)
    for name, content in files.items():
        expected = hashlib.sha256(content).digest()
        verified = False
        for attempt in range(6):
            request = Request(f"{LIVE_URL}{name}?verify={attempt}", headers={"Cache-Control": "no-cache"})
            try:
                with urlopen(request, timeout=60) as response:
                    verified = hashlib.sha256(response.read()).digest() == expected
            except OSError:
                pass
            if verified:
                break
            time.sleep(3)
        if not verified:
            raise RuntimeError(f"Live verification failed: {name}")
    print("3D game and public downloads verified:", LIVE_URL)


if __name__ == "__main__":
    try:
        publish()
    except Exception as error:
        # Never print server messages containing credential-related details.
        print("::error title=3D preview deploy::" + (str(error) if isinstance(error, RuntimeError) else type(error).__name__))
        raise SystemExit(1)
