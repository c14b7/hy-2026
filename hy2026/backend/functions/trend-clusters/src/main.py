from appwrite.client import Client
from appwrite.services.databases import Databases
import json
import os
from collections import defaultdict


def main(context):
    """
    Admin-oriented aggregation of needs → challenge clusters.
    Body optional: { "adminLabelCheck": true }
    """
    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_ENDPOINT"])
        .set_project(os.environ["APPWRITE_PROJECT_ID"])
        .set_key(os.environ.get("APPWRITE_API_KEY", ""))
    )
    db = Databases(client)
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    needs = db.list_documents(database_id=database_id, collection_id="needs")
    challenges = db.list_documents(database_id=database_id, collection_id="challenges")

    need_docs = getattr(needs, "documents", None) or needs.get("documents", [])
    ch_docs = getattr(challenges, "documents", None) or challenges.get("documents", [])

    def g(doc, key, default=None):
        if isinstance(doc, dict):
            return doc.get(key, default)
        return getattr(doc, key, default)

    titles = {g(c, "$id"): g(c, "title") for c in ch_docs}
    clusters = defaultdict(lambda: {"count": 0, "topTags": [], "sampleNeeds": []})

    for n in need_docs:
        for cid in g(n, "challengeIds") or []:
            c = clusters[cid]
            c["count"] += 1
            c["topTags"] = list(dict.fromkeys(c["topTags"] + (g(n, "tags") or [])))[:5]
            body = (g(n, "body") or "")[:120] + "…"
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
