# Warstwa danych

## Kontrakt

Wszystkie domeny przechodzą przez `Services` (`lib/services/interfaces.ts`):

`innovations`, `organizations`, `challenges`, `needs`, `ideas`, `knowledge`, `grants`, `communication`, `tester`, `ai`, `orgCrm`.

Typy domenowe: `types/domain.ts`. Filtrowanie innowacji/organizacji: `InnovationFilters` / `OrganizationFilters`.

## Przełącznik

```ts
// lib/services/index.ts
getServices()
  → mock:     mockServices
  → appwrite: Proxy → callServiceAction → createAppwriteServices()
```

Implementacje:

| Plik | Rola |
|------|------|
| `lib/services/mock.ts` | In-memory + seed; mutacje tylko w procesie Node |
| `lib/services/appwrite.ts` | TablesDB + Functions |
| `lib/services/actions.ts` | `"use server"` bridge |
| `lib/appwrite/server.ts` | Client admin, TablesDB, Functions |
| `lib/appwrite/mappers.ts` | Row ↔ typy domenowe |

## Database `most` (TablesDB)

Tworzone przez `scripts/setup_appwrite.py`:

| Tabela | Public read (szablon) | Zawartość |
|--------|----------------------|-----------|
| `profiles` | private user | konta demo (seed) |
| `organizations` | any | NGO / JST / ROPS |
| `challenges` | any | obszary wyzwań |
| `innovations` | org content | innowacje + media meta |
| `needs` | org content | zgłoszenia potrzeb |
| `ideas` | org content | pomysły |
| `grant_calls` | any | nabory |
| `knowledge` | org content | artykuły (slug, body HTML/MD) |
| `test_signups` | private | zapisy testerów |
| `threads` / `messages` | private | komunikacja |
| `match_queries` | private | historia matchmakingu (`itemsJson`) |
| `service_adaptations` | private | wynik middlemana |
| `beneficiaries` / `staff_members` | admin | CRM org |

Kolumny i enumy (`PublishStatus`, stage, …) są zdefiniowane w bootstrapie — nie edytuj schematu ręcznie bez aktualizacji skryptu i mapperów.

Relacje / indeksy: setup tworzy je idempotentnie (409 = już istnieje).

## Seed

Źródło prawdy UI/demo: `data/mocks/seed.ts`.

```
npx tsx scripts/export-seed.ts
→ data/mocks/appwrite-seed.json
→ setup_appwrite.py --seed (upsert po row id)
```

Po zmianie seeda: export → `--seed`. Nie commituj sekretów; JSON seed jest OK w repo.

## Storage

| Bucket | Max | Użycie |
|--------|-----|--------|
| `innovation-media` | 50 MB | media innowacji |
| `knowledge-files` | 20 MB | załączniki wiedzy |
| `org-logos` | 5 MB | logotypy |

UI na razie często trzyma `media.url` jako string w wierszu (seed/CDN), nie zawsze File ID.

## Mapowanie

Mappery zakładają, że pola biznesowe są na wierszu (lub w `.data` — funkcje Python normalizują obie formy). Stałe ID seeda (`org-…`, `inn-…`) są stabilne między mock a Cloud — to important for demo deep-links.

## Uprawnienia vs rzeczywistość demo

Permissje na tabelach (Role.any / users / label admin) przygotowują pod Account. Aktualny Next zawsze używa **API key** po stronie Server Action, więc omija RLS użytkownika. Zmiana na sesje klienta wymaga osobnego wiring (`Account` + client SDK bez admin key w browserze).
