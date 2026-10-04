# Appwrite Function: trend-clusters (TablesDB)

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
import os
from collections import defaultdict


def _rows(listing):
    return getattr(listing, "rows", None) or (listing.get("rows") if isinstance(listing, dict) else []) or []


def _as_dict(doc):
    if isinstance(doc, dict):
        if "data" in doc and isinstance(doc["data"], dict) and "title" not in doc and "body" not in doc:
            base = dict(doc["data"])
            base["$id"] = doc.get("$id") or doc.get("id")
            return base
        return doc
    data = getattr(doc, "data", None)
    out = dict(data) if isinstance(data, dict) else {}
    out["$id"] = getattr(doc, "id", None) or getattr(doc, "$id", None)
    return out


def _get(doc, key, default=None):
    return _as_dict(doc).get(key, default)


def main(context):
    """Admin-oriented aggregation of needs → challenge clusters."""
    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_ENDPOINT"])
        .set_project(os.environ["APPWRITE_PROJECT_ID"])
        .set_key(os.environ.get("APPWRITE_API_KEY", ""))
    )
    db = TablesDB(client)
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    need_docs = _rows(db.list_rows(database_id=database_id, table_id="needs"))
    ch_docs = _rows(db.list_rows(database_id=database_id, table_id="challenges"))

    titles = {_get(c, "$id"): _get(c, "title") for c in ch_docs}
    clusters = defaultdict(lambda: {"count": 0, "topTags": [], "sampleNeeds": []})

    for n in need_docs:
        for cid in _get(n, "challengeIds") or []:
            c = clusters[cid]
            c["count"] += 1
            c["topTags"] = list(dict.fromkeys(c["topTags"] + (_get(n, "tags") or [])))[:5]
            body = (_get(n, "body") or "")[:120] + "…"
            if len(c["sampleNeeds"]) < 3:
                c["sampleNeeds"].append(body)

    result = [
        {
            "challengeId": cid,
            "challengeTitle": titles.get(cid, cid),
            "count": data["count"],
            "topTags": data["topTags"],
            "sampleNeeds": data["sampleNeeds"],
        }
        for cid, data in clusters.items()
    ]
    result.sort(key=lambda x: x["count"], reverse=True)

    return context.res.json({"clusters": result})
