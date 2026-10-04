# MOST — Małopolski Hub Innowacji Społecznych

Prototyp (Next.js 16 + shadcn/ui) łączący potrzeby mieszkańców z innowacjami społecznymi, organizacjami i wiedzą Hubu.

Backend demo: **Appwrite Cloud (TablesDB)** przez `lib/services` + Server Actions. Fallback offline: `MOST_DATA_SOURCE=mock`.

## Uruchomienie (UI)

```bash
cp .env.local.example .env.local   # uzupełnij z .env.appwrite
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000). W stopce portalu/panelu widać znacznik **Appwrite** / **mock**.

## Backend Appwrite

```bash
cp .env.appwrite.example .env.appwrite   # credentials + scopes (tables.write, rows.write, …)
pip install -r scripts/requirements-appwrite.txt
npx tsx scripts/export-seed.ts           # seed.ts → appwrite-seed.json
python scripts/setup_appwrite.py         # schema + buckets + functions
python scripts/setup_appwrite.py --seed  # upsert demo rows
python scripts/deploy_functions.py       # deploy match-need / trend-clusters / middleman-adapt
python scripts/smoke_appwrite.py         # sanity check row counts
```

Szczegóły: [scripts/README.md](scripts/README.md). Funkcje: [backend/functions/](backend/functions/).

### Przełącznik danych

| Zmienna | Wartość | Efekt |
|---------|---------|--------|
| `MOST_DATA_SOURCE` / `NEXT_PUBLIC_MOST_DATA_SOURCE` | `appwrite` | TablesDB (API key tylko na serwerze) |
| | `mock` | pamięć + `data/mocks/seed.ts` |

Auth w UI pozostaje demo (`RoleProvider` / localStorage) — bez pełnego Appwrite Account.

## Ścieżka demo na scenę (~3 minuty)

1. **Landing** `/` — „Wejdź do portalu”.
2. **Hub** `/portal` — szybkie akcje.
3. **Matchmaking** `/potrzeba` — scenariusz „Samotność seniora” → wyniki.
4. **Biblioteka** `/innowacje`.
5. **Login panel** `/login?to=panel` — rola Admin ROPS → `/panel/admin/trendy`.
6. **Middleman** `/middleman`, **Kreator** `/pomysly/nowy`, **Tester** `/tester`.

## Struktura IA

| Strefa | Ścieżka | Shell |
|--------|---------|-------|
| Landing | `/` | minimalny |
| Portal | `/portal` + `/innowacje`, `/potrzeba`… | sidebar mieszkańców |
| Panel | `/panel/*` | sidebar organizacji |
| Login | `/login?to=portal\|panel` | dual entry |

## Deploy (produkcja)

Aplikacja buduje się jako standardowy Next.js (`npm run build` / `npm start`).

### Wymagane zmienne środowiskowe na hoście (Vercel / Node)

Skopiuj z `.env.local.example` / `.env.appwrite`:

| Zmienna | Uwagi |
|---------|--------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | np. `https://fra.cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | ID projektu |
| `APPWRITE_API_KEY` | **tylko serwer** — nie `NEXT_PUBLIC_` |
| `APPWRITE_DATABASE_ID` | `most` |
| `MOST_DATA_SOURCE` | `appwrite` |
| `NEXT_PUBLIC_MOST_DATA_SOURCE` | `appwrite` (ten sam tryb w przeglądarce) |

Przed deployem: `npm run typecheck && npm run lint && npm run build`.

Offline / CI bez Cloud: ustaw `MOST_DATA_SOURCE=mock` i `NEXT_PUBLIC_MOST_DATA_SOURCE=mock`.

## Skrypty npm

- `npm run dev` / `build` / `start` / `typecheck` / `lint`
- `npm run appwrite:export-seed` / `appwrite:setup` / `appwrite:seed` / `appwrite:deploy-functions` / `appwrite:smoke`
