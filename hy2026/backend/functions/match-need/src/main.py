# Appwrite Function: match-need (TablesDB)

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID
import json
import os
import re
from datetime import datetime, timezone


def _rows(listing):
    return getattr(listing, "rows", None) or (listing.get("rows") if isinstance(listing, dict) else []) or []


def _as_dict(doc):
    """Normalize TablesDB Row models (columns live under .data) and plain dicts."""
    if isinstance(doc, dict):
        if "data" in doc and isinstance(doc["data"], dict) and "title" not in doc and "status" not in doc:
            base = dict(doc["data"])
            base["$id"] = doc.get("$id") or doc.get("id")
            return base
        return doc
    data = getattr(doc, "data", None)
    out = dict(data) if isinstance(data, dict) else {}
    out["$id"] = getattr(doc, "id", None) or getattr(doc, "$id", None)
    return out


def _get(doc, key, default=None):
    d = _as_dict(doc)
    return d.get(key, default)


def main(context):
    """
    HTTP body: { "query": str, "location"?: str, "challengeId"?: str, "authorId"?: str }
    Returns match payload and stores a row in match_queries.
    """
    raw = context.req.body
    if isinstance(raw, dict):
        body = raw
    else:
        try:
            body = json.loads(raw or "{}")
        except json.JSONDecodeError:
            return context.res.json({"error": "Invalid JSON"}, 400)

    query = (body.get("query") or "").strip()
    if len(query) < 8:
        return context.res.json({"error": "query too short"}, 400)

    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_ENDPOINT"])
        .set_project(os.environ["APPWRITE_PROJECT_ID"])
        .set_key(os.environ.get("APPWRITE_API_KEY", context.req.headers.get("x-appwrite-key", "")))
    )
    db = TablesDB(client)
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    tokens = [t for t in re.split(r"\W+", query.lower()) if len(t) > 2][:12]
    keywords = list(dict.fromkeys(tokens))
    q = query.lower()
    q_ascii = (
        q.replace("ą", "a")
        .replace("ć", "c")
        .replace("ę", "e")
        .replace("ł", "l")
        .replace("ń", "n")
        .replace("ó", "o")
        .replace("ś", "s")
        .replace("ź", "z")
        .replace("ż", "z")
    )
    if any(x in q_ascii for x in ("samot", "sasied", "sasiada", "klub")):
        keywords.extend(["samotnosc", "seniorzy", "wolontariat"])
    if any(x in q_ascii for x in ("senior", "babcia", "dziadek", "mama", "tata")):
        keywords.append("seniorzy")
    if any(x in q_ascii for x in ("cyfr", "e-recept", "tablet", "internet")):
        keywords.extend(["wykluczenie-cyfrowe", "edukacja"])
    if any(x in q_ascii for x in ("psych", "lek", "depres", "kryzys", "mlodzie")):
        keywords.extend(["zdrowie-psychiczne", "mlodziez"])
    keywords = list(dict.fromkeys(keywords))

    listing = db.list_rows(database_id=database_id, table_id="innovations")
    items = []
    for doc in _rows(listing):
        if _get(doc, "status") != "published":
            continue
        tags = _get(doc, "tags") or []
        hay = f"{_get(doc, 'title', '')} {_get(doc, 'summary', '')} {' '.join(tags)}".lower()
        score = 0
        for kw in keywords:
            if kw in hay or any(kw in t or t in kw for t in tags):
                score += 18
        if body.get("challengeId") and body["challengeId"] in (_get(doc, "challengeIds") or []):
            score += 25
        if body.get("location"):
            loc = body["location"].lower()
            if loc in (_get(doc, "location") or "").lower() or loc in (_get(doc, "county") or "").lower():
                score += 12
        if score < 20:
            continue
        items.append(
            {
                "targetType": "innovation",
                "targetId": _get(doc, "$id") or _get(doc, "id"),
                "score": min(score, 98),
                "rationale": f"Dopasowanie do słów kluczowych: {', '.join(keywords[:3]) or 'kontekst'}",
            }
        )
    items.sort(key=lambda x: x["score"], reverse=True)
    items = items[:6]

    created_at = datetime.now(timezone.utc).isoformat()
    row_id = ID.unique()
    db.create_row(
        database_id=database_id,
        table_id="match_queries",
        row_id=row_id,
        data={
            "query": query,
            "keywords": keywords,
            "location": body.get("location") or "",
            "challengeId": body.get("challengeId") or "",
            "authorId": body.get("authorId") or "",
            "itemsJson": json.dumps(items, ensure_ascii=False),
            "createdAt": created_at,
        },
    )

    return context.res.json(
        {
            "id": row_id,
            "query": query,
            "keywords": keywords,
            "items": items,
            "createdAt": created_at,
        }
    )
