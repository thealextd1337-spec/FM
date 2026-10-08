"""Upload and verify the frozen Unity runtime before publishing the new page."""

import hashlib
import json
from pathlib import Path, PurePosixPath
import ssl
import time
from ftplib import FTP_TLS, error_perm
from urllib.request import Request, urlopen

from deploy_ftps import LIVE_URL, setting

UNITY = Path("outputs/platform/unity-web")
RUNTIME = Path("dist/unity-match")


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def publication_files():
    manifest = json.loads((UNITY / "probe-build.json").read_text(encoding="utf-8"))
    if manifest.get("worldView") != "d6-world-view-1":
        raise RuntimeError("Unity build does not support the club-world runtime")
    names = {row["file"] for row in manifest["files"]}
    if names != {"unity-web.data", "unity-web.wasm", "unity-web.framework.js", "unity-web.loader.js"}:
        raise RuntimeError("Unexpected Unity build files")
    files = []
    for row in manifest["files"]:
        file = UNITY / "Build" / row["file"]
        if file.stat().st_size != row["bytes"] or sha256(file) != row["sha256"]:
            raise RuntimeError("Unity build differs from its frozen manifest")
        files.append((file, "unity/Build/" + row["file"]))
    for name in ("runtime.html", "runtime.js", ".htaccess"):
        file = RUNTIME / name
        if not file.is_file():
            raise RuntimeError("Unity iframe runtime missing")
        files.append((file, "unity-match/" + name))
    files.append((UNITY / ".htaccess", "unity/.htaccess"))
    # Publish the manifest only after the four hash-bound runtime files.
    files.append((UNITY / "probe-build.json", "unity/probe-build.json"))
    return files


def directory(ftp, root, relative):
    ftp.cwd(root)
    for part in PurePosixPath(relative).parent.parts:
        try:
            ftp.cwd(part)
        except error_perm as error:
            if not str(error).startswith("550"):
                raise
            ftp.mkd(part)
            ftp.cwd(part)


def publish():
    host, user, password, root = [setting(name) for name in (
        "W4Y_FTP_HOST", "W4Y_FTP_USER", "W4Y_FTP_PASSWORD", "W4Y_FTP_REMOTE_DIR"
    )]
    if not root.strip("/") or any(part in ("", ".", "..") for part in root.strip("/").split("/")):
        raise RuntimeError("W4Y_FTP_REMOTE_DIR must name the existing site directory")
    files = publication_files()
    stage = "connect"
    try:
        with FTP_TLS(context=ssl.create_default_context(), timeout=60) as ftp:
            ftp.connect(host, 21)
            stage = "login"
            ftp.login(user, password)
            ftp.prot_p()
            stage = "change directory"
            ftp.cwd(root)
            root = ftp.pwd()
            for file, relative in files:
                stage = "upload " + relative
                directory(ftp, root, relative)
                with file.open("rb") as source:
                    ftp.storbinary("STOR " + file.name, source)
                ftp.voidcmd("TYPE I")
                size = ftp.size(file.name)
                if size is not None and size != file.stat().st_size:
                    raise RuntimeError("Uploaded Unity file has a different size")
    except RuntimeError:
        raise
    except Exception as error:
        status = str(error).split(" ", 1)[0]
        code = status if len(status) == 3 and status.isdigit() else type(error).__name__
        raise RuntimeError(f"FTPS {stage} failed ({code})") from error
    # .htaccess controls headers and must never be retrievable over HTTP.
    for file, relative in files:
        if file.name == ".htaccess":
            continue
        expected = sha256(file)
        for attempt in range(3):
            request = Request(LIVE_URL + relative + "?verify=" + expected,
                              headers={"Cache-Control": "no-cache"})
            try:
                with urlopen(request, timeout=120) as response:
                    digest = hashlib.sha256()
                    while block := response.read(1024 * 1024):
                        digest.update(block)
                    if digest.hexdigest() == expected:
                        break
            except OSError:
                pass
            if attempt == 2:
                raise RuntimeError("Live Unity file differs from the frozen build: " + relative)
            time.sleep(5)
    print("Unity runtime verified at", LIVE_URL + "unity/probe-build.json")


if __name__ == "__main__":
    try:
        publish()
    except Exception as error:
        message = str(error) if isinstance(error, RuntimeError) else type(error).__name__
        print("::error title=Unity deploy::" + message)
        raise
