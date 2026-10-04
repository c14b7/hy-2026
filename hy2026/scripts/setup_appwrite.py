#!/usr/bin/env python3
"""
Idempotent Appwrite bootstrap for MOST (TablesDB API — Appwrite SDK 24+).

Creates: database, tables, columns, indexes, relationships,
storage buckets, function registrations. Optional --seed inserts demo rows.

Usage:
  python scripts/setup_appwrite.py
  python scripts/setup_appwrite.py --seed

Requires .env.appwrite (see .env.appwrite.example).

API key scopes (Console → API Keys):
  databases.read, databases.write
  tables.read, tables.write   (TablesDB — required on Cloud 1.8+)
  columns.read, columns.write (if listed separately)
  rows.read, rows.write       (for --seed)
  buckets.read, buckets.write
  files.read, files.write
  functions.read, functions.write
  users.read, users.write     (optional, for later Auth wiring)
  teams.read, teams.write     (optional)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Callable, Iterable, Optional

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.appwrite"

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # type: ignore

from appwrite.client import Client
from appwrite.exception import AppwriteException
from appwrite.id import ID
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.services.functions import Functions
from appwrite.services.storage import Storage
from appwrite.services.tables_db import TablesDB
from appwrite.enums.tables_db_index_type import TablesDBIndexType
from appwrite.enums.relationship_type import RelationshipType
from appwrite.enums.relation_mutate import RelationMutate

try:
    from appwrite.enums.runtime import Runtime
except ImportError:
    Runtime = None  # type: ignore


PUBLISH = ["draft", "pending", "published", "rejected"]
STAGES = ["idea", "prototype", "pilot", "scaled", "archived"]
IDEA_STAGES = ["concept", "prototype", "testing", "ready"]
ORG_TYPES = ["ngo", "jst", "rops", "other"]
LABELS = ["seeker", "expert", "admin", "org", "jst"]
KNOWLEDGE_KINDS = ["edu", "report", "canvas", "video"]
THREAD_STATUS = ["open", "waiting", "resolved"]
RELATED_TYPES = ["innovation", "need", "idea", "organization"]
MEDIA_TYPES = ["image", "video"]
BEN_STATUS = ["active", "paused", "closed"]
STAFF_ROLES = ["employee", "volunteer", "coordinator"]
USER_ROLES = ["guest", "seeker", "org", "jst", "expert", "admin"]


def log(msg: str) -> None:
    print(msg, flush=True)


def load_env() -> dict[str, str]:
    if load_dotenv and ENV_FILE.exists():
        load_dotenv(ENV_FILE)
    elif ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

    endpoint = os.environ.get("APPWRITE_ENDPOINT", "").rstrip("/")
    project = os.environ.get("APPWRITE_PROJECT_ID", "")
    key = os.environ.get("APPWRITE_API_KEY", "")
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    if not endpoint or not project or not key:
        log("Missing APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY")
        log("Copy .env.appwrite.example → .env.appwrite and fill values.")
        sys.exit(1)

    return {
        "endpoint": endpoint,
        "project": project,
        "key": key,
        "database_id": database_id,
    }


def ensure(fn: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
    try:
        return fn(*args, **kwargs)
    except AppwriteException as e:
        if e.code == 409:
            return None
        if e.code == 401:
            log("")
            log("=== 401 Unauthorized ===")
            log(str(e.message))
            log("")
            log("Fix: Appwrite Console → Overview → API Keys → edit your key.")
            log("Enable scopes for TablesDB (Cloud 1.8+), typically:")
            log("  databases.read, databases.write")
            log("  tables.read, tables.write")
            log("  columns.read, columns.write   (if shown)")
            log("  rows.read, rows.write         (needed for --seed)")
            log("  buckets.read, buckets.write")
            log("  functions.read, functions.write")
            log("Do NOT rely only on legacy 'collections.*' scopes.")
            log("")
        raise


def status_value(obj: Any) -> str:
    s = getattr(obj, "status", None)
    if s is None and isinstance(obj, dict):
        s = obj.get("status")
    if hasattr(s, "value"):
        return str(s.value).lower()
    if hasattr(s, "name") and not isinstance(s, str):
        return str(s.name).lower()
    return str(s or "").lower()


def _column_items(listing: Any) -> list[Any]:
    items = getattr(listing, "columns", None)
    if items is None and isinstance(listing, dict):
        items = listing.get("columns") or listing.get("attributes")
    return list(items or [])


def _find_column(db: TablesDB, database_id: str, table_id: str, key: str) -> Any | None:
    """
    Resolve a column by key via list_columns.

    SDK 24 get_column cannot hydrate varchar/text/longtext responses
    ("Unable to match response to any known model"), so polling must
    use list_columns instead.
    """
    try:
        listing = db.list_columns(database_id, table_id)
    except AppwriteException:
        return None
    for col in _column_items(listing):
        col_key = getattr(col, "key", None)
        if col_key is None and isinstance(col, dict):
            col_key = col.get("key")
        if col_key == key:
            return col
    return None


def wait_column(db: TablesDB, database_id: str, table_id: str, key: str, timeout: int = 120) -> None:
    deadline = time.time() + timeout
    last_st = ""
    while time.time() < deadline:
        col = _find_column(db, database_id, table_id, key)
        if col is None:
            time.sleep(1.5)
            continue
        st = status_value(col)
        if st != last_st:
            if st and st != "available":
                log(f"    {table_id}.{key} status={st}")
            last_st = st
        if st == "available":
            return
        if st in ("failed", "stuck"):
            err = getattr(col, "error", None)
            if err is None and isinstance(col, dict):
                err = col.get("error")
            raise RuntimeError(f"Column {table_id}.{key} {st}: {err or ''}")
        time.sleep(1.5)
    raise TimeoutError(f"Column {table_id}.{key} not available in {timeout}s (last status={last_st or 'missing'})")


def _index_items(listing: Any) -> list[Any]:
    items = getattr(listing, "indexes", None)
    if items is None and isinstance(listing, dict):
        items = listing.get("indexes")
    return list(items or [])


def wait_index(db: TablesDB, database_id: str, table_id: str, key: str, timeout: int = 90) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        idx = None
        try:
            idx = db.get_index(database_id, table_id, key)
        except AppwriteException:
            # Fall back to list_indexes if get_index model-matching fails.
            try:
                listing = db.list_indexes(database_id, table_id)
            except AppwriteException:
                time.sleep(1.5)
                continue
            for item in _index_items(listing):
                idx_key = getattr(item, "key", None)
                if idx_key is None and isinstance(item, dict):
                    idx_key = item.get("key")
                if idx_key == key:
                    idx = item
                    break
        if idx is None:
            time.sleep(1.5)
            continue
        st = status_value(idx)
        if st == "available":
            return
        if st in ("failed", "stuck"):
            raise RuntimeError(f"Index {table_id}.{key} {st}")
        time.sleep(1.5)
    raise TimeoutError(f"Index {table_id}.{key} not available")


def runtime_python() -> Any:
    # Cloud FRA currently accepts python-3.12; python-3.11 returns 404 unsupported.
    if Runtime is not None:
        for cand in (
            "PYTHON_3_12",
            "PYTHON_312",
            "PYTHON_3_13",
            "PYTHON_3_11",
            "PYTHON_311",
            "PYTHON_3_10",
            "PYTHON_310",
        ):
            val = getattr(Runtime, cand, None)
            if val is not None:
                return val
    return "python-3.12"


class Bootstrap:
    def __init__(self, env: dict[str, str]) -> None:
        self.database_id = env["database_id"]
        self.client = (
            Client()
            .set_endpoint(env["endpoint"])
            .set_project(env["project"])
            .set_key(env["key"])
        )
        self.db = TablesDB(self.client)
        self.storage = Storage(self.client)
        self.functions = Functions(self.client)
        self.pending_columns: list[tuple[str, str]] = []

    def perms_public_read(self) -> list[str]:
        return [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.label("admin")),
            Permission.delete(Role.label("admin")),
        ]

    def perms_org_content(self) -> list[str]:
        return [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.update(Role.label("admin")),
            Permission.delete(Role.label("admin")),
        ]

    def perms_private_user(self) -> list[str]:
        return [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.update(Role.label("admin")),
            Permission.delete(Role.label("admin")),
        ]

    def perms_admin_heavy(self) -> list[str]:
        return [
            Permission.read(Role.label("admin")),
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.label("admin")),
            Permission.delete(Role.label("admin")),
        ]

    def create_database(self) -> None:
        log(f"[db] ensure database '{self.database_id}'")
        ensure(self.db.create, database_id=self.database_id, name="MOST Hub")

    def create_table(
        self,
        table_id: str,
        name: str,
        permissions: list[str],
        row_security: bool = True,
    ) -> None:
        log(f"[table] {table_id}")
        ensure(
            self.db.create_table,
            database_id=self.database_id,
            table_id=table_id,
            name=name,
            permissions=permissions,
            row_security=row_security,
            enabled=True,
        )

    def _track(self, table_id: str, key: str, result: Any = None) -> None:
        # Always wait — even on 409 (already exists). Newly created varchar/text
        # columns are not readable via get_column in SDK 24, and existing columns
        # must still be confirmed available before indexes.
        _ = result
        self.pending_columns.append((table_id, key))

    def varchar(
        self,
        table_id: str,
        key: str,
        size: int,
        required: bool = False,
        array: bool = False,
    ) -> None:
        r = ensure(
            self.db.create_varchar_column,
            self.database_id,
            table_id,
            key,
            size,
            required,
            array=array if array else None,
        )
        self._track(table_id, key, r)

    def longtext(self, table_id: str, key: str, required: bool = False) -> None:
        r = ensure(
            self.db.create_longtext_column,
            self.database_id,
            table_id,
            key,
            required,
        )
        self._track(table_id, key, r)

    def text(self, table_id: str, key: str, required: bool = False) -> None:
        r = ensure(
            self.db.create_text_column,
            self.database_id,
            table_id,
            key,
            required,
        )
        self._track(table_id, key, r)

    def email_col(self, table_id: str, key: str, required: bool = False) -> None:
        r = ensure(
            self.db.create_email_column,
            self.database_id,
            table_id,
            key,
            required,
        )
        self._track(table_id, key, r)

    def url_col(self, table_id: str, key: str, required: bool = False) -> None:
        r = ensure(
            self.db.create_url_column,
            self.database_id,
            table_id,
            key,
            required,
        )
        self._track(table_id, key, r)

    def boolean(self, table_id: str, key: str, required: bool = False) -> None:
        r = ensure(
            self.db.create_boolean_column,
            self.database_id,
            table_id,
            key,
            required,
        )
        self._track(table_id, key, r)

    def integer(
        self,
        table_id: str,
        key: str,
        required: bool = False,
        min_v: Optional[int] = None,
        max_v: Optional[int] = None,
    ) -> None:
        kwargs: dict[str, Any] = {}
        if min_v is not None:
            kwargs["min"] = min_v
        if max_v is not None:
            kwargs["max"] = max_v
        r = ensure(
            self.db.create_integer_column,
            self.database_id,
            table_id,
            key,
            required,
            **kwargs,
        )
        self._track(table_id, key, r)

    def datetime_col(self, table_id: str, key: str, required: bool = False) -> None:
        r = ensure(
            self.db.create_datetime_column,
            self.database_id,
            table_id,
            key,
            required,
        )
        self._track(table_id, key, r)

    def enum(
        self,
        table_id: str,
        key: str,
        elements: Iterable[str],
        required: bool = False,
    ) -> None:
        r = ensure(
            self.db.create_enum_column,
            self.database_id,
            table_id,
            key,
            list(elements),
            required,
        )
        self._track(table_id, key, r)

    def flush_columns(self) -> None:
        seen: set[tuple[str, str]] = set()
        for table_id, key in self.pending_columns:
            if (table_id, key) in seen:
                continue
            seen.add((table_id, key))
            log(f"  wait column {table_id}.{key}")
            wait_column(self.db, self.database_id, table_id, key)
        self.pending_columns.clear()

    def index(
        self,
        table_id: str,
        key: str,
        type_name: str,
        columns: list[str],
    ) -> None:
        log(f"  index {table_id}.{key} ({type_name})")
        type_map = {
            "key": TablesDBIndexType.KEY,
            "unique": TablesDBIndexType.UNIQUE,
            "fulltext": TablesDBIndexType.FULLTEXT,
        }
        ensure(
            self.db.create_index,
            database_id=self.database_id,
            table_id=table_id,
            key=key,
            type=type_map[type_name],
            columns=columns,
        )
        try:
            wait_index(self.db, self.database_id, table_id, key, timeout=60)
        except Exception as e:
            log(f"  ! index wait skipped/failed: {e}")

    def relationship(
        self,
        table_id: str,
        related_table_id: str,
        type_name: str,
        key: str,
        two_way: bool = False,
        two_way_key: Optional[str] = None,
        delete: str = "setNull",
    ) -> None:
        log(f"  rel {table_id}.{key} -> {related_table_id} ({type_name})")
        type_map = {
            "manyToOne": RelationshipType.MANYTOONE,
            "oneToMany": RelationshipType.ONETOMANY,
            "oneToOne": RelationshipType.ONETOONE,
            "manyToMany": RelationshipType.MANYTOMANY,
        }
        delete_map = {
            "cascade": RelationMutate.CASCADE,
            "restrict": RelationMutate.RESTRICT,
            "setNull": RelationMutate.SETNULL,
        }
        kwargs: dict[str, Any] = {
            "database_id": self.database_id,
            "table_id": table_id,
            "related_table_id": related_table_id,
            "type": type_map[type_name],
            "two_way": two_way,
            "key": key,
            "on_delete": delete_map[delete],
        }
        if two_way and two_way_key:
            kwargs["two_way_key"] = two_way_key
        ensure(self.db.create_relationship_column, **kwargs)
        wait_column(self.db, self.database_id, table_id, key, timeout=120)

    # --- tables ---
    def schema_profiles(self) -> None:
        self.create_table("profiles", "Profiles", self.perms_private_user())
        self.varchar("profiles", "displayName", 128, required=True)
        self.email_col("profiles", "email", required=True)
        self.varchar("profiles", "orgId", 64)
        self.enum("profiles", "primaryLabel", LABELS, required=True)
        self.flush_columns()
        self.index("profiles", "idx_email", "unique", ["email"])
        self.index("profiles", "idx_orgId", "key", ["orgId"])

    def schema_organizations(self) -> None:
        self.create_table("organizations", "Organizations", self.perms_public_read())
        self.varchar("organizations", "name", 256, required=True)
        self.enum("organizations", "type", ORG_TYPES, required=True)
        self.varchar("organizations", "location", 128, required=True)
        self.varchar("organizations", "county", 128, required=True)
        self.longtext("organizations", "description", required=True)
        self.varchar("organizations", "tags", 64, array=True)
        self.email_col("organizations", "contactEmail", required=True)
        self.url_col("organizations", "website")
        self.varchar("organizations", "logoInitials", 8, required=True)
        self.varchar("organizations", "teamId", 64, required=True)
        self.varchar("organizations", "logoFileId", 64)
        self.flush_columns()
        self.index("organizations", "idx_teamId", "unique", ["teamId"])
        self.index("organizations", "idx_type", "key", ["type"])
        self.index("organizations", "idx_county", "key", ["county"])
        self.index("organizations", "idx_name_ft", "fulltext", ["name"])

    def schema_challenges(self) -> None:
        self.create_table("challenges", "Challenges", self.perms_public_read(), row_security=False)
        self.varchar("challenges", "slug", 128, required=True)
        self.varchar("challenges", "title", 256, required=True)
        self.text("challenges", "summary", required=True)
        self.text("challenges", "metricsJson", required=True)
        self.varchar("challenges", "relatedTags", 64, array=True)
        self.flush_columns()
        self.index("challenges", "idx_slug", "unique", ["slug"])
        self.index("challenges", "idx_title_ft", "fulltext", ["title"])

    def schema_innovations(self) -> None:
        self.create_table("innovations", "Innovations", self.perms_org_content())
        self.varchar("innovations", "title", 256, required=True)
        self.text("innovations", "summary", required=True)
        self.longtext("innovations", "description", required=True)
        self.enum("innovations", "stage", STAGES, required=True)
        self.varchar("innovations", "orgId", 64, required=True)
        self.varchar("innovations", "challengeIds", 64, array=True)
        self.varchar("innovations", "tags", 64, array=True)
        self.varchar("innovations", "location", 128, required=True)
        self.varchar("innovations", "county", 128, required=True)
        self.enum("innovations", "mediaType", MEDIA_TYPES)
        self.url_col("innovations", "mediaUrl")
        self.varchar("innovations", "mediaLabel", 256)
        self.varchar("innovations", "mediaFileId", 64)
        self.boolean("innovations", "testRecruiting", required=True)
        self.enum("innovations", "status", PUBLISH, required=True)
        self.text("innovations", "beneficiaries", required=True)
        self.flush_columns()
        for key, t, cols in [
            ("idx_status", "key", ["status"]),
            ("idx_orgId", "key", ["orgId"]),
            ("idx_county", "key", ["county"]),
            ("idx_stage", "key", ["stage"]),
            ("idx_testRecruiting", "key", ["testRecruiting"]),
            ("idx_title_ft", "fulltext", ["title"]),
            ("idx_summary_ft", "fulltext", ["summary"]),
        ]:
            self.index("innovations", key, t, cols)

    def schema_needs(self) -> None:
        self.create_table("needs", "Needs", self.perms_org_content())
        self.longtext("needs", "body", required=True)
        self.varchar("needs", "location", 128)
        self.varchar("needs", "county", 128)
        self.varchar("needs", "challengeIds", 64, array=True)
        self.varchar("needs", "tags", 64, array=True)
        self.enum("needs", "authorRole", USER_ROLES, required=True)
        self.varchar("needs", "authorName", 128, required=True)
        self.varchar("needs", "authorId", 64)
        self.enum("needs", "status", PUBLISH, required=True)
        self.flush_columns()
        self.index("needs", "idx_status", "key", ["status"])
        self.index("needs", "idx_county", "key", ["county"])
        self.index("needs", "idx_body_ft", "fulltext", ["body"])

    def schema_ideas(self) -> None:
        self.create_table("ideas", "Ideas", self.perms_org_content())
        self.varchar("ideas", "title", 256, required=True)
        self.text("ideas", "essence", required=True)
        self.varchar("ideas", "audience", 512, required=True)
        self.enum("ideas", "stage", IDEA_STAGES, required=True)
        self.longtext("ideas", "description", required=True)
        self.varchar("ideas", "authorId", 64, required=True)
        self.varchar("ideas", "authorName", 128, required=True)
        self.varchar("ideas", "challengeIds", 64, array=True)
        self.varchar("ideas", "tags", 64, array=True)
        self.enum("ideas", "status", PUBLISH, required=True)
        self.flush_columns()
        self.index("ideas", "idx_status", "key", ["status"])
        self.index("ideas", "idx_authorId", "key", ["authorId"])
        self.index("ideas", "idx_title_ft", "fulltext", ["title"])

    def schema_grant_calls(self) -> None:
        self.create_table("grant_calls", "Grant calls", self.perms_public_read(), row_security=False)
        self.varchar("grant_calls", "title", 256, required=True)
        self.text("grant_calls", "summary", required=True)
        self.datetime_col("grant_calls", "opensAt", required=True)
        self.datetime_col("grant_calls", "closesAt", required=True)
        self.boolean("grant_calls", "active", required=True)
        self.flush_columns()
        self.index("grant_calls", "idx_active", "key", ["active"])
        self.index("grant_calls", "idx_closesAt", "key", ["closesAt"])

    def schema_knowledge(self) -> None:
        self.create_table("knowledge", "Knowledge", self.perms_org_content())
        self.varchar("knowledge", "slug", 128, required=True)
        self.varchar("knowledge", "title", 256, required=True)
        self.enum("knowledge", "kind", KNOWLEDGE_KINDS, required=True)
        self.text("knowledge", "summary", required=True)
        self.longtext("knowledge", "body", required=True)
        self.varchar("knowledge", "challengeIds", 64, array=True)
        self.varchar("knowledge", "tags", 64, array=True)
        self.integer("knowledge", "readingMinutes", required=True, min_v=1, max_v=240)
        self.enum("knowledge", "status", PUBLISH, required=True)
        self.varchar("knowledge", "attachmentFileIds", 64, array=True)
        self.flush_columns()
        self.index("knowledge", "idx_slug", "unique", ["slug"])
        self.index("knowledge", "idx_status", "key", ["status"])
        self.index("knowledge", "idx_kind", "key", ["kind"])
        self.index("knowledge", "idx_title_ft", "fulltext", ["title"])
        self.index("knowledge", "idx_body_ft", "fulltext", ["body"])

    def schema_test_signups(self) -> None:
        self.create_table("test_signups", "Test signups", self.perms_private_user())
        self.varchar("test_signups", "innovationId", 64, required=True)
        self.varchar("test_signups", "userId", 64, required=True)
        self.varchar("test_signups", "userName", 128, required=True)
        self.integer("test_signups", "rating", min_v=1, max_v=5)
        self.text("test_signups", "feedback")
        self.text("test_signups", "improvement")
        self.flush_columns()
        self.index("test_signups", "idx_innovationId", "key", ["innovationId"])
        self.index("test_signups", "idx_userId", "key", ["userId"])
        self.index("test_signups", "idx_user_innovation", "unique", ["userId", "innovationId"])

    def schema_threads(self) -> None:
        self.create_table("threads", "Threads", self.perms_private_user())
        self.varchar("threads", "subject", 256, required=True)
        self.varchar("threads", "participantIds", 64, array=True)
        self.varchar("threads", "participantNames", 128, array=True)
        self.enum("threads", "relatedType", RELATED_TYPES)
        self.varchar("threads", "relatedId", 64)
        self.enum("threads", "status", THREAD_STATUS, required=True)
        self.boolean("threads", "unreadForAdmin", required=True)
        self.flush_columns()
        self.index("threads", "idx_status", "key", ["status"])
        self.index("threads", "idx_unread", "key", ["unreadForAdmin"])
        self.index("threads", "idx_related", "key", ["relatedType", "relatedId"])

    def schema_messages(self) -> None:
        self.create_table("messages", "Messages", self.perms_private_user())
        self.varchar("messages", "threadId", 64, required=True)
        self.varchar("messages", "authorId", 64, required=True)
        self.varchar("messages", "authorName", 128, required=True)
        self.longtext("messages", "body", required=True)
        self.flush_columns()
        self.index("messages", "idx_threadId", "key", ["threadId"])

    def schema_match_queries(self) -> None:
        self.create_table("match_queries", "Match queries", self.perms_private_user())
        self.longtext("match_queries", "query", required=True)
        self.varchar("match_queries", "keywords", 64, array=True)
        self.varchar("match_queries", "location", 128)
        self.varchar("match_queries", "challengeId", 64)
        self.varchar("match_queries", "authorId", 64)
        self.longtext("match_queries", "itemsJson", required=True)
        self.datetime_col("match_queries", "createdAt", required=True)
        self.flush_columns()
        self.index("match_queries", "idx_authorId", "key", ["authorId"])

    def schema_service_adaptations(self) -> None:
        self.create_table("service_adaptations", "Service adaptations", self.perms_private_user())
        self.varchar("service_adaptations", "innovationId", 64, required=True)
        self.longtext("service_adaptations", "institutionBrief", required=True)
        self.varchar("service_adaptations", "steps", 1000, array=True)
        self.varchar("service_adaptations", "resources", 1000, array=True)
        self.varchar("service_adaptations", "risks", 1000, array=True)
        self.longtext("service_adaptations", "summary", required=True)
        self.varchar("service_adaptations", "authorId", 64)
        self.flush_columns()
        self.index("service_adaptations", "idx_innovationId", "key", ["innovationId"])

    def schema_beneficiaries(self) -> None:
        self.create_table("beneficiaries", "Beneficiaries", self.perms_admin_heavy())
        self.varchar("beneficiaries", "orgId", 64, required=True)
        self.varchar("beneficiaries", "displayName", 128, required=True)
        self.enum("beneficiaries", "status", BEN_STATUS, required=True)
        self.longtext("beneficiaries", "notes", required=True)
        self.flush_columns()
        self.index("beneficiaries", "idx_orgId", "key", ["orgId"])

    def schema_staff_members(self) -> None:
        self.create_table("staff_members", "Staff members", self.perms_admin_heavy())
        self.varchar("staff_members", "orgId", 64, required=True)
        self.varchar("staff_members", "displayName", 128, required=True)
        self.enum("staff_members", "role", STAFF_ROLES, required=True)
        self.email_col("staff_members", "email", required=True)
        self.boolean("staff_members", "active", required=True)
        self.varchar("staff_members", "userId", 64)
        self.flush_columns()
        self.index("staff_members", "idx_orgId", "key", ["orgId"])

    def schema_relationships(self) -> None:
        log("[relationships]")
        self.relationship(
            "innovations",
            "organizations",
            "manyToOne",
            key="org",
            two_way=True,
            two_way_key="innovations",
            delete="setNull",
        )
        self.relationship(
            "test_signups",
            "innovations",
            "manyToOne",
            key="innovation",
            two_way=True,
            two_way_key="testSignups",
            delete="cascade",
        )
        self.relationship(
            "messages",
            "threads",
            "manyToOne",
            key="thread",
            two_way=True,
            two_way_key="messages",
            delete="cascade",
        )

    def create_buckets(self) -> None:
        log("[storage] buckets")
        specs = [
            (
                "innovation-media",
                "Innovation media",
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.label("admin")),
                    Permission.delete(Role.label("admin")),
                ],
                ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"],
                50 * 1024 * 1024,
            ),
            (
                "knowledge-files",
                "Knowledge files",
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.label("admin")),
                    Permission.delete(Role.label("admin")),
                ],
                ["pdf", "md", "txt", "png", "jpg", "jpeg", "webp", "doc", "docx"],
                20 * 1024 * 1024,
            ),
            (
                "org-logos",
                "Organization logos",
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.label("admin")),
                    Permission.delete(Role.label("admin")),
                ],
                ["jpg", "jpeg", "png", "webp", "svg"],
                5 * 1024 * 1024,
            ),
        ]
        for bucket_id, name, perms, exts, max_size in specs:
            log(f"  bucket {bucket_id}")
            ensure(
                self.storage.create_bucket,
                bucket_id=bucket_id,
                name=name,
                permissions=perms,
                file_security=True,
                enabled=True,
                maximum_file_size=max_size,
                allowed_file_extensions=exts,
            )

    def create_functions(self) -> None:
        log("[functions] register")
        specs = [
            ("match-need", "Match need (AI/keywords)", "src/main.py"),
            ("trend-clusters", "Trend clusters (admin)", "src/main.py"),
            ("middleman-adapt", "Middleman adapt innovation", "src/main.py"),
        ]
        runtime = runtime_python()
        log(f"  runtime {getattr(runtime, 'value', runtime)}")
        for function_id, name, entrypoint in specs:
            log(f"  function {function_id}")
            try:
                ensure(
                    self.functions.create,
                    function_id=function_id,
                    name=name,
                    runtime=runtime,
                    execute=["users"],
                    timeout=30,
                    enabled=True,
                    logging=True,
                    entrypoint=entrypoint,
                    commands="pip install -r requirements.txt",
                )
            except AppwriteException as e:
                log(f"  ! skip function {function_id}: {e.message}")
                continue
            existing_keys: set[str] = set()
            try:
                listed = self.functions.list_variables(function_id)
                for item in getattr(listed, "variables", None) or []:
                    k = getattr(item, "key", None)
                    if k:
                        existing_keys.add(k)
            except Exception:
                pass

            for key, value in [
                ("APPWRITE_ENDPOINT", os.environ.get("APPWRITE_ENDPOINT", "")),
                ("APPWRITE_PROJECT_ID", os.environ.get("APPWRITE_PROJECT_ID", "")),
                ("APPWRITE_DATABASE_ID", self.database_id),
            ]:
                if not value or key in existing_keys:
                    continue
                # Variable IDs are project-global in Cloud — prefix with function id.
                variable_id = f"{function_id}-{key.lower().replace('_', '-')}"[:36]
                try:
                    ensure(
                        self.functions.create_variable,
                        function_id=function_id,
                        variable_id=variable_id,
                        key=key,
                        value=value,
                    )
                except Exception as e:
                    log(f"  ! variable {function_id}.{key}: {e}")

        log("  Deploy stubs from backend/functions/*/ via Console or Appwrite CLI.")

    def seed(self) -> None:
        log("[seed] demo rows (synthetic)")

        def row(table_id: str, row_id: str, data: dict[str, Any]) -> None:
            ensure(
                self.db.create_row,
                database_id=self.database_id,
                table_id=table_id,
                row_id=row_id,
                data=data,
            )

        challenges = [
            (
                "ch-starzenie",
                {
                    "slug": "starzenie-sie-spoleczenstwa",
                    "title": "Starzenie się społeczeństwa",
                    "summary": "Nowe formy opieki i aktywizacji seniorów.",
                    "metricsJson": json.dumps(
                        [{"label": "Udział 65+", "value": "21%"}], ensure_ascii=False
                    ),
                    "relatedTags": ["seniorzy", "opieka", "aktywizacja"],
                },
            ),
            (
                "ch-samotnosc",
                {
                    "slug": "samotnosc",
                    "title": "Samotność",
                    "summary": "Izolacja społeczna seniorów i osób w kryzysie.",
                    "metricsJson": json.dumps(
                        [{"label": "Sieci lokalne", "value": "niedobór"}], ensure_ascii=False
                    ),
                    "relatedTags": ["samotnosc", "sasiedztwo", "wolontariat"],
                },
            ),
            (
                "ch-cyfrowe",
                {
                    "slug": "wykluczenie-cyfrowe",
                    "title": "Wykluczenie cyfrowe",
                    "summary": "Trudności z e-usługami wśród seniorów i mieszkańców wsi.",
                    "metricsJson": json.dumps(
                        [{"label": "Kompetencje 65+", "value": "niskie"}], ensure_ascii=False
                    ),
                    "relatedTags": ["wykluczenie-cyfrowe", "edukacja"],
                },
            ),
        ]
        for rid, data in challenges:
            row("challenges", rid, data)

        orgs = [
            (
                "org-rops",
                {
                    "name": "ROPS Kraków (demo)",
                    "type": "rops",
                    "location": "Kraków",
                    "county": "Kraków",
                    "description": "Koordynator Hubu — dane demonstracyjne.",
                    "tags": ["hub", "koordynacja"],
                    "contactEmail": "demo-hub@example.com",
                    "logoInitials": "RK",
                    "teamId": "team-rops-demo",
                },
            ),
            (
                "org-fundacja",
                {
                    "name": "Fundacja Most Pokoleń (demo)",
                    "type": "ngo",
                    "location": "Kraków",
                    "county": "Kraków",
                    "description": "Kluby sąsiedzkie i wolontariat międzypokoleniowy.",
                    "tags": ["seniorzy", "samotnosc", "wolontariat"],
                    "contactEmail": "demo-ngo@example.com",
                    "logoInitials": "MP",
                    "teamId": "team-fundacja-demo",
                },
            ),
        ]
        for rid, data in orgs:
            row("organizations", rid, data)

        innovations = [
            (
                "inn-1",
                {
                    "title": "Klub Sąsiedzki 60+",
                    "summary": "Cotygodniowe spotkania seniorów z wolontariuszami.",
                    "description": "Model klubu sąsiedzkiego — dane demonstracyjne.",
                    "stage": "scaled",
                    "orgId": "org-fundacja",
                    "challengeIds": ["ch-starzenie", "ch-samotnosc"],
                    "tags": ["seniorzy", "samotnosc", "wolontariat"],
                    "location": "Kraków",
                    "county": "Kraków",
                    "testRecruiting": True,
                    "status": "published",
                    "beneficiaries": "Seniorzy 60+ mieszkający samodzielnie",
                },
            ),
            (
                "inn-2",
                {
                    "title": "Cyfrowy Asystent Gminny",
                    "summary": "Punkty pomocy z e-usługami w bibliotekach.",
                    "description": "Dyżury pomocy cyfrowej — dane demonstracyjne.",
                    "stage": "pilot",
                    "orgId": "org-fundacja",
                    "challengeIds": ["ch-cyfrowe"],
                    "tags": ["wykluczenie-cyfrowe", "edukacja"],
                    "location": "Olkusz",
                    "county": "olkuski",
                    "testRecruiting": True,
                    "status": "published",
                    "beneficiaries": "Seniorzy i mieszkańcy wsi",
                },
            ),
        ]
        for rid, data in innovations:
            row("innovations", rid, data)

        row(
            "knowledge",
            "know-canva",
            {
                "slug": "canva-innowacji",
                "title": "Canva innowacji społecznych",
                "kind": "canvas",
                "summary": "Szablon do prototypowania innowacji.",
                "body": "## Cel\n\nOpisz problem, odbiorców i pierwszy test.\n\n- Problem\n- Dla kogo\n- Rozwiązanie",
                "challengeIds": [],
                "tags": ["canva", "prototypowanie"],
                "readingMinutes": 5,
                "status": "published",
                "attachmentFileIds": [],
            },
        )
        row(
            "grant_calls",
            "grant-1",
            {
                "title": "Nabór mikrograntów sąsiedzkich 2026 (demo)",
                "summary": "Do 5 000 zł na lokalne mikroinnowacje.",
                "opensAt": "2026-03-01T00:00:00.000+00:00",
                "closesAt": "2026-04-15T23:59:59.000+00:00",
                "active": True,
            },
        )
        log("[seed] done")

    def run(self, with_seed: bool = False) -> None:
        self.create_database()
        self.schema_profiles()
        self.schema_organizations()
        self.schema_challenges()
        self.schema_innovations()
        self.schema_needs()
        self.schema_ideas()
        self.schema_grant_calls()
        self.schema_knowledge()
        self.schema_test_signups()
        self.schema_threads()
        self.schema_messages()
        self.schema_match_queries()
        self.schema_service_adaptations()
        self.schema_beneficiaries()
        self.schema_staff_members()
        self.schema_relationships()
        self.create_buckets()
        self.create_functions()
        if with_seed:
            self.seed()
        log("")
        log("=== MOST Appwrite bootstrap complete (TablesDB) ===")
        log(f"Database ID: {self.database_id}")
        log("Tables: profiles, organizations, challenges, innovations, needs, ideas,")
        log("  grant_calls, knowledge, test_signups, threads, messages, match_queries,")
        log("  service_adaptations, beneficiaries, staff_members")
        log("Buckets: innovation-media, knowledge-files, org-logos")
        log("Functions: match-need, trend-clusters, middleman-adapt")


def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap Appwrite TablesDB schema for MOST")
    parser.add_argument("--seed", action="store_true", help="Insert synthetic demo rows")
    args = parser.parse_args()
    env = load_env()
    Bootstrap(env).run(with_seed=args.seed)


if __name__ == "__main__":
    main()
