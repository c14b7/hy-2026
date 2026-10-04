# Funkcje Appwrite

Kod: `backend/functions/<id>/` (Python, entrypoint `src/main.py`).  
Rejestracja + env: `setup_appwrite.py`. Deploy paczki: `deploy_functions.py`.

Runtime: Python 3.12. Timeout: 30 s. Install: `pip install -r requirements.txt`.

Env w funkcji (ustawiane przy bootstrapie):

```
APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID
APPWRITE_DATABASE_ID
APPWRITE_API_KEY
```

Wywołanie z Next: `Functions.createExecution` (sync), body JSON, `method: POST`.

## `match-need`

**Body:** `{ query, location?, challengeId?, authorId? }`  
**Warunek:** `query` ≥ 8 znaków.

1. Tokenizacja + synonimy PL (senior/samotność/cyfrowe…).
2. Skoring opublikowanych `innovations` (+ org / needs wg implementacji).
3. Zapis wiersza w `match_queries`.
4. Response: `{ id, query, keywords, items[{ targetType, targetId, score, rationale }], createdAt }`.

Next odrzuca wynik i robi fallback, gdy brak items lub max score < 40.

## `trend-clusters`

Agreguje `needs` względem `challenges` → `{ challengeId, challengeTitle, count, topTags, sampleNeeds }[]`.

Używane w `/panel/admin/trendy`.

## `middleman-adapt`

**Body:** `{ innovationId, institutionBrief }`

Czyta innowację, generuje kroki / zasoby / ryzyka (reguły), zapisuje `service_adaptations`, zwraca ten sam kształt co `ServiceAdaptation`.

## Deploy

```bash
python scripts/deploy_functions.py
```

Buduje `.tar.gz` z katalogu funkcji (bez `__pycache__`), `create_deployment(..., activate=True)`. Status buildu sprawdzaj w Console → Functions.

## Debug Row / `.data`

Funkcje normalizują wiersze TablesDB (`doc.data` vs flat dict) przez `_as_dict` / `_get` — nie zakładaj jednego kształtu SDK.

## Fallback po stronie Next

Gdy execution fail / weak match: logika w `lib/services/appwrite.ts` + `lib/ai/match.ts` na żywych listach TablesDB. Demo nie pada, gdy funkcje są niedostępne, ale wtedy nie ma logiki „w chmurze”.
