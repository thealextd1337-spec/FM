"""Publish the single-file build using explicit FTPS and verify the live URL."""

import hashlib
import os
from pathlib import Path
import ssl
import time
from ftplib import FTP_TLS
from urllib.request import Request, urlopen


BUILD = Path("outputs/index.html")
LIVE_URL = "https://fussball.cakamper.at/"


def setting(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"GitHub environment secret {name} is missing")
    return value


def publish() -> None:
    host = setting("W4Y_FTP_HOST")
    user = setting("W4Y_FTP_USER")
    password = setting("W4Y_FTP_PASSWORD")
    remote_dir = setting("W4Y_FTP_REMOTE_DIR")
    if any(part in ("", ".", "..") for part in remote_dir.strip("/").split("/")):
        raise RuntimeError("W4Y_FTP_REMOTE_DIR must name the existing site directory")
    if not BUILD.is_file():
        raise RuntimeError("Build missing: run node work/build.cjs first")

    local_bytes = BUILD.read_bytes()
    expected = hashlib.sha256(local_bytes).digest()
    context = ssl.create_default_context()

    with FTP_TLS(context=context, timeout=30) as ftp:
        ftp.connect(host, 21)
        ftp.login(user, password)
        ftp.prot_p()
        ftp.cwd(remote_dir)
        with BUILD.open("rb") as source:
            ftp.storbinary("STOR index.html", source)
        ftp.voidcmd("TYPE I")
        remote_size = ftp.size("index.html")
        if remote_size is not None and remote_size != len(local_bytes):
            raise RuntimeError("Uploaded index.html has a different size")

    sha = os.environ.get("DEPLOY_SHA", "manual")[:12]
    for attempt in range(1, 7):
        request = Request(f"{LIVE_URL}?deploy={sha}-{attempt}", headers={"Cache-Control": "no-cache"})
        try:
            with urlopen(request, timeout=20) as response:
                if hashlib.sha256(response.read()).digest() == expected:
                    print("Deployment verified at", LIVE_URL)
                    return
        except OSError:
            pass
        if attempt < 6:
            time.sleep(5)
    raise RuntimeError("Live site does not match the uploaded build")


if __name__ == "__main__":
    publish()
