from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import json
import os


def main(context):
    """
    Body: { "innovationId": str, "institutionBrief": str, "authorId"?: str }
    Creates a service_adaptations document (rule-based stub; swap for LLM later).
    """
    try:
        body = json.loads(context.req.body or "{}")
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
    db = Databases(client)
    database_id = os.environ.get("APPWRITE_DATABASE_ID", "most")

    inn = db.get_document(
        database_id=database_id,
        collection_id="innovations",
        document_id=innovation_id,
    )
    title = getattr(inn, "title", None) or (inn.get("title") if isinstance(inn, dict) else "innowacja")

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
        "authorId": body.get("authorId"),
    }

    doc = db.create_document(
        database_id=database_id,
        collection_id="service_adaptations",
        document_id=ID.unique(),
        data=data,
    )
    doc_id = getattr(doc, "$id", None) or (doc.get("$id") if isinstance(doc, dict) else None)
    return context.res.json({"id": doc_id, **data})
