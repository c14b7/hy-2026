#!/usr/bin/env python3
"""Package and deploy backend/functions/* to Appwrite Cloud (tar.gz)."""

from __future__ import annotations

import io
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from setup_appwrite import load_env, log  # noqa: E402

from appwrite.client import Client
from appwrite.input_file import InputFile
from appwrite.services.functions import Functions

FUNCTIONS = [
    ("match-need", "src/main.py"),
    ("trend-clusters", "src/main.py"),
    ("middleman-adapt", "src/main.py"),
]


def tar_gz_function(folder: Path) -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for path in folder.rglob("*"):
            if path.is_file() and "__pycache__" not in path.parts:
                tar.add(path, arcname=path.relative_to(folder).as_posix())
    return buf.getvalue()


def main() -> None:
    env = load_env()
    client = (
        Client()
        .set_endpoint(env["endpoint"])
        .set_project(env["project"])
        .set_key(env["key"])
    )
    functions = Functions(client)
    base = ROOT / "backend" / "functions"
    tmp_dir = ROOT / ".tmp"
    tmp_dir.mkdir(exist_ok=True)

    for function_id, entrypoint in FUNCTIONS:
        folder = base / function_id
        if not folder.exists():
            log(f"! missing {folder}")
            continue
        log(f"[deploy] {function_id}")
        data = tar_gz_function(folder)
        tmp = tmp_dir / f"{function_id}.tar.gz"
        tmp.write_bytes(data)
        try:
            deployment = functions.create_deployment(
                function_id=function_id,
                code=InputFile.from_path(str(tmp)),
                activate=True,
                entrypoint=entrypoint,
                commands="pip install -r requirements.txt",
            )
            dep_id = getattr(deployment, "$id", None) or getattr(deployment, "id", "?")
            status = getattr(deployment, "status", "?")
            log(f"  deployment {dep_id} status={status}")
        except Exception as e:
            log(f"  ! deploy failed: {e}")
        finally:
            try:
                tmp.unlink(missing_ok=True)
            except Exception:
                pass

    log("[deploy] done - builds may take a minute in Console > Functions")


if __name__ == "__main__":
    main()
