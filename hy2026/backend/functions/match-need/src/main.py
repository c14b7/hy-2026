# Appwrite Function: match-need
# Deploy from Console after packaging this folder.

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import json
import os
import re
from datetime import datetime, timezone


def main(context):
    """
    HTTP body: { "query": str, "location"?: str, "challengeId"?: str, "authorId"?: str }
    Returns match payload and stores a document in match_queries.
    """
    req = context.req
    try:
        body = json.loads(req.body or "{}")
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
    db = Databases(client)
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    # Lightweight keyword extraction (replace with LLM later)
    tokens = [t for t in re.split(r"\W+", query.lower()) if len(t) > 3][:10]
    keywords = list(dict.fromkeys(tokens))

    innovations = db.list_documents(
        database_id=database_id,
        collection_id="innovations",
        queries=[],  # filter client-side for stub simplicity
    )
    docs = getattr(innovations, "documents", None) or innovations.get("documents", [])

    items = []
    for doc in docs:
        data = doc if isinstance(doc, dict) else doc.__dict__
        # Support both dict-like and model
        get = data.get if isinstance(data, dict) else lambda k, d=None: getattr(data, k, d)
        if get("status") != "published":
            continue
        hay = f"{get('title','')} {get('summary','')} {' '.join(get('tags') or [])}".lower()
        score = sum(18 for kw in keywords if kw in hay)
        if body.get("challengeId") and body["challengeId"] in (get("challengeIds") or []):
            score += 25
        if score < 20:
            continue
        items.append(
            {
                "targetType": "innovation",
                "targetId": get("$id") or get("id"),
                "score": min(score, 98),
                "rationale": f"Dopasowanie do słów kluczowych: {', '.join(keywords[:3]) or 'kontekst'}",
            }
        )
    items.sort(key=lambda x: x["score"], reverse=True)
    items = items[:6]

    created_at = datetime.now(timezone.utc).isoformat()
    doc = db.create_document(
        database_id=database_id,
        collection_id="match_queries",
        document_id=ID.unique(),
        data={
            "query": query,
            "keywords": keywords,
            "location": body.get("location") or None,
            "challengeId": body.get("challengeId") or None,
            "authorId": body.get("authorId") or None,
            "itemsJson": json.dumps(items, ensure_ascii=False),
            "createdAt": created_at,
        },
    )

    return context.res.json(
        {
            "id": getattr(doc, "$id", None) or (doc.get("$id") if isinstance(doc, dict) else None),
            "query": query,
            "keywords": keywords,
            "items": items,
            "createdAt": created_at,
        }
    )
