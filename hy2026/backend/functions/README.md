# Appwrite Functions (MOST)

Szczegóły kontraktów i fallbacku: [docs/functions.md](../../docs/functions.md).

Python 3.12 stubs using **TablesDB** (SDK 24+).

| Function ID | Purpose |
|-------------|---------|
| `match-need` | Keyword match → innovations + row in `match_queries` |
| `trend-clusters` | Aggregate needs by challenge |
| `middleman-adapt` | Rule-based service adaptation → `service_adaptations` |

## Env (set by `scripts/setup_appwrite.py`)

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_API_KEY`

## Deploy

```bash
python scripts/deploy_functions.py
```

Or package each folder as `.tar.gz` and upload in Console → Functions → Deployments.

Next.js calls these via `node-appwrite` `Functions.createExecution`; on failure it falls back to local keyword logic against live TablesDB rows.
