#!/usr/bin/env python3
"""Quick smoke: list key TablesDB rows after seed."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from setup_appwrite import load_env, log  # noqa: E402
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB

TABLES = ["challenges", "organizations", "innovations", "needs", "knowledge", "grant_calls"]


def main() -> None:
    env = load_env()
    db = TablesDB(
        Client()
        .set_endpoint(env["endpoint"])
        .set_project(env["project"])
        .set_key(env["key"])
    )
    ok = True
    for table_id in TABLES:
        listing = db.list_rows(database_id=env["database_id"], table_id=table_id)
        total = getattr(listing, "total", None)
        rows = getattr(listing, "rows", None) or []
        count = total if total is not None else len(rows)
        log(f"  {table_id}: {count}")
        if count == 0:
            ok = False
    if not ok:
        log("SMOKE FAIL: empty table(s)")
        sys.exit(1)
    log("SMOKE OK")


if __name__ == "__main__":
    main()
