# Appwrite bootstrap (MOST) — TablesDB

Idempotent Python tooling for Appwrite **SDK 24+** / Cloud 1.8+ (`TablesDB`).

## Prerequisites

1. Project in [Appwrite Console](https://cloud.appwrite.io).
2. API key scopes:
   - `databases.read` / `databases.write`
   - `tables.read` / `tables.write` (**required**)
   - `columns.read` / `columns.write` (if shown)
   - `rows.read` / `rows.write` (for `--seed`)
   - `buckets.read` / `buckets.write`
   - `functions.read` / `functions.write`
3. Env:

```bash
cp .env.appwrite.example .env.appwrite
# APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID=most
```

Frankfurt example: `https://fra.cloud.appwrite.io/v1`

## Install & run

```bash
pip install -r scripts/requirements-appwrite.txt
npx tsx scripts/export-seed.ts
python scripts/setup_appwrite.py
python scripts/setup_appwrite.py --seed
python scripts/deploy_functions.py
python scripts/smoke_appwrite.py
```

`--seed` upserts rows from `data/mocks/appwrite-seed.json` (exported from `data/mocks/seed.ts`).

## Next.js wiring

Copy the same endpoint/project/key into `.env.local` (see `.env.local.example`):

- `NEXT_PUBLIC_APPWRITE_*` — public
- `APPWRITE_API_KEY` — **server only**
- `MOST_DATA_SOURCE=appwrite` + `NEXT_PUBLIC_MOST_DATA_SOURCE=appwrite`

UI talks to TablesDB through Server Actions (`lib/services/actions.ts`). AI functions are called when ready; keyword fallback runs against live rows if execution fails.

## Functions

Registered + env vars (`APPWRITE_ENDPOINT`, `PROJECT_ID`, `DATABASE_ID`, `API_KEY`) by bootstrap.
Deploy code with `scripts/deploy_functions.py` (tar.gz → `create_deployment`, activate=true).
