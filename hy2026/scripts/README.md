# Appwrite bootstrap (MOST) — TablesDB

Idempotent Python script for Appwrite **SDK 24+** / Cloud 1.8+ (`TablesDB`: tables, columns, rows).

## Prerequisites

1. Create a project in [Appwrite Console](https://cloud.appwrite.io).
2. Create an **API key** with these scopes (names may vary slightly in UI):
   - `databases.read` / `databases.write`
   - `tables.read` / `tables.write` (**required** — not only `collections.*`)
   - `columns.read` / `columns.write` (if shown)
   - `rows.read` / `rows.write` (for `--seed`)
   - `buckets.read` / `buckets.write`
   - `functions.read` / `functions.write`
3. Copy env:

```bash
cp .env.appwrite.example .env.appwrite
# fill APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
```

Endpoint example for Frankfurt: `https://fra.cloud.appwrite.io/v1`

## Install

```bash
pip install -r scripts/requirements-appwrite.txt
# or: pip install "appwrite>=24" python-dotenv
```

## Run

```bash
python scripts/setup_appwrite.py
python scripts/setup_appwrite.py --seed
```

If you see `401 ... missing scopes (["collections.write"])` you are on an old script or key — update the key with **tables.write** and re-run this TablesDB script.

## Function stubs

See `backend/functions/` — registered by the script; deploy code via Console/CLI.
