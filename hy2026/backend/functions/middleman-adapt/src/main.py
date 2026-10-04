# Appwrite Function: middleman-adapt (TablesDB)

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID
import json
import os


def _as_dict(doc):
    if isinstance(doc, dict):
        if "data" in doc and isinstance(doc["data"], dict) and "title" not in doc:
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
    """
    Body: { "innovationId": str, "institutionBrief": str, "authorId"?: str }
    Creates a service_adaptations row (rule-based stub; swap for LLM later).
    """
    raw = context.req.body
    if isinstance(raw, dict):
        body = raw
    else:
        try:
            body = json.loads(raw or "{}")
        except json.JSONDecodeError:
            return context.res.json({"error": "Invalid JSON"}, 400)

    innovation_id = body.get("innovationId")
    brief = (body.get("institutionBrief") or "").strip()
    if not innovation_id or len(brief) < 20:
        return context.res.json({"error": "innovationId and institutionBrief required"}, 400)

    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_ENDPOINT"])
        .set_project(os.environ["APPWRITE_PROJECT_ID"])
        .set_key(os.environ.get("APPWRITE_API_KEY", ""))
    )
    db = TablesDB(client)
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    inn = db.get_row(
        database_id=database_id,
        table_id="innovations",
        row_id=innovation_id,
    )
    title = _get(inn, "title") or "innowacja"

    data = {
        "innovationId": innovation_id,
        "institutionBrief": brief,
        "steps": [
            "Diagnoza lokalna potrzeby wśród mieszkańców.",
            f"Dostosuj model „{title}” do zasobów instytucji.",
            "Uruchom pilotaż 8–12 tygodni w 1–2 lokalizacjach.",
            "Zbierz feedback i zdecyduj o skalowaniu.",
        ],
        "resources": [
            "Koordynator lokalny (0.25–0.5 etatu)",
            "Sala lub kanał zdalny",
            "Budżet startowy na komunikację",
            "Partner NGO / mentor Hubu",
        ],
        "risks": [
            "Niska frekwencja na starcie",
            "Zależność od jednej osoby",
            "Niedopasowanie kadrowe — zawęź zakres pilotażu",
        ],
        "summary": f"Propozycja wdrożenia „{title}” jako usługi publicznej (stub AI).",
        "authorId": body.get("authorId") or "",
    }

    row = db.create_row(
        database_id=database_id,
        table_id="service_adaptations",
        row_id=ID.unique(),
        data=data,
    )
    return context.res.json({"id": _get(row, "$id"), **data, "createdAt": _get(row, "$createdAt")})
