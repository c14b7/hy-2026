# MOST — Małopolski Hub Innowacji Społecznych

Prototyp (Next.js 16 + shadcn/ui) łączący potrzeby mieszkańców z innowacjami społecznymi, organizacjami i wiedzą Hubu.

Backend: **Appwrite Cloud (TablesDB)** przez `lib/services` + Server Actions. Offline: `MOST_DATA_SOURCE=mock`.

**Dokumentacja:** [docs/](./docs/README.md) — architektura, setup, dane, frontend, funkcje, deploy, demo.

## Szybki start

```bash
cp .env.local.example .env.local   # mock albo wartości z .env.appwrite
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) — badge **Appwrite** / **mock** w stopce.

### Backend Cloud

```bash
cp .env.appwrite.example .env.appwrite
pip install -r scripts/requirements-appwrite.txt
npx tsx scripts/export-seed.ts
python scripts/setup_appwrite.py
python scripts/setup_appwrite.py --seed
python scripts/deploy_functions.py
python scripts/smoke_appwrite.py
```

Szczegóły: [docs/setup.md](./docs/setup.md), [scripts/README.md](./scripts/README.md).

### Przełącznik danych

| Zmienna | Wartość | Efekt |
|---------|---------|--------|
| `MOST_DATA_SOURCE` / `NEXT_PUBLIC_MOST_DATA_SOURCE` | `appwrite` | TablesDB (API key tylko na serwerze) |
| | `mock` | pamięć + `data/mocks/seed.ts` |

Auth UI: demo (`RoleProvider` / localStorage) — bez Appwrite Account. Zob. [docs/architecture.md](./docs/architecture.md).

## Demo (~3 min)

Zob. [docs/demo.md](./docs/demo.md): `/` → `/portal` → `/potrzeba` → `/innowacje` → login Admin → `/panel/admin/trendy`.

## Deploy

Appwrite Sites: adapter **SSR**, root `./hy2026`. Nie używaj `static` (brak `index.html` → „page doesn’t exist”).  
Pełna checklista: [docs/deploy.md](./docs/deploy.md).

## Skrypty npm

- `dev` / `build` / `start` / `typecheck` / `lint`
- `appwrite:export-seed` / `appwrite:setup` / `appwrite:seed` / `appwrite:deploy-functions` / `appwrite:smoke`
