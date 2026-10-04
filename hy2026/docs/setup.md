# Setup

## Wymagania

- Node 22+ (zalecane; Sites buduje na `node-22`)
- Python 3.11+ (skrypty + runtime funkcji)
- Projekt Appwrite Cloud + API key ze scopes TablesDB

## 1. Frontend lokalnie

```bash
cd hy2026
cp .env.local.example .env.local
# uzupełnij z .env.appwrite albo zostaw MOST_DATA_SOURCE=mock
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) — w stopce portalu/panelu badge **Appwrite** / **mock**.

Bez Cloud:

```env
MOST_DATA_SOURCE=mock
NEXT_PUBLIC_MOST_DATA_SOURCE=mock
```

## 2. Env Appwrite (skrypty)

```bash
cp .env.appwrite.example .env.appwrite
```

| Zmienna | Przykład |
|---------|----------|
| `APPWRITE_ENDPOINT` | `https://fra.cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | ID projektu |
| `APPWRITE_API_KEY` | standard key |
| `APPWRITE_DATABASE_ID` | `most` |

Scopes klucza (Console → API Keys):

- `databases.read/write`
- `tables.read/write` (**wymagane** — Cloud 1.8+ TablesDB)
- `columns.read/write` (jeśli widoczne)
- `rows.read/write` (seed)
- `buckets.read/write`, `files.read/write`
- `functions.read/write`

Same `collections.*` **nie wystarczą**.

## 3. Bootstrap schematu + seed

```bash
pip install -r scripts/requirements-appwrite.txt
npx tsx scripts/export-seed.ts          # seed.ts → data/mocks/appwrite-seed.json
python scripts/setup_appwrite.py        # DB, tabele, indeksy, buckety, rejestracja funkcji
python scripts/setup_appwrite.py --seed # upsert wierszy
python scripts/deploy_functions.py      # tar.gz → create_deployment (activate)
python scripts/smoke_appwrite.py        # sanity counts
```

Albo npm: `appwrite:export-seed` / `appwrite:setup` / `appwrite:seed` / `appwrite:deploy-functions` / `appwrite:smoke`.

Seed jest idempotentny po `$id` wiersza. Kolejność tabel w skrypcie respektuje zależności (organizations → innovations → …).

## 4. Podłączenie Next do Cloud

W `.env.local` (jak `.env.local.example`):

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=…
APPWRITE_API_KEY=…
APPWRITE_DATABASE_ID=most
MOST_DATA_SOURCE=appwrite
NEXT_PUBLIC_MOST_DATA_SOURCE=appwrite
```

Oba `MOST_DATA_SOURCE` muszą być zgodne — serwer czyta `MOST_DATA_SOURCE`, klient badge/`getServices` w przeglądarce: `NEXT_PUBLIC_*`.

## 5. Weryfikacja

1. `npm run typecheck && npm run lint`
2. `/potrzeba` → scenariusz „Samotność seniora” → wyniki (funkcja lub fallback)
3. `/panel/admin/trendy` po loginie jako Admin ROPS
4. Stopka: **Appwrite**

## Typowe błędy

| Objaw | Przyczyna |
|-------|-----------|
| 401 przy setup | brak `tables.*` / `rows.*` na kluczu |
| UI na mock mimo env | brak `NEXT_PUBLIC_MOST_DATA_SOURCE=appwrite` albo restart `next dev` |
| Puste listy | brak `--seed` / zły `APPWRITE_DATABASE_ID` |
| AI „nie działa” | funkcja nie zdeployowana — powinien zadziałać fallback keyword |
