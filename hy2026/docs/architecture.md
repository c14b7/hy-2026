# Architektura

## Cel

Demo łączące potrzeby mieszkańców z innowacjami, organizacjami i wiedzą Hubu. Backend w Appwrite Cloud; UI może działać offline na seedzie in-memory (`mock`).

## Stos

| Warstwa | Technologia |
|---------|-------------|
| UI | Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui |
| Domeny TS | `types/domain.ts` |
| Dostęp do danych | `lib/services/*` + Server Actions |
| Backend | Appwrite Cloud: TablesDB, Storage, Functions (Python 3.12) |
| Auth (demo) | `RoleProvider` + `localStorage` — **nie** Appwrite Account |

Repo monorepo: aplikacja w `hy2026/` (root VCS: `hy-2026`). Root directory Sites: `./hy2026`.

## Przepływ danych

```
Komponent (client/server)
    → getServices()
         ├─ mock        → mockServices (data/mocks/seed.ts, mutacje w pamięci procesu)
         └─ appwrite    → Proxy → callServiceAction (Server Action)
                              → createAppwriteServices()
                                   → node-appwrite TablesDB (+ Functions dla AI)
                                   → lib/appwrite/mappers.ts
```

- `APPWRITE_API_KEY` jest tylko na serwerze (`lib/appwrite/server.ts` + `"server-only"`).
- Przeglądarka w trybie appwrite nigdy nie dostaje klucza — tylko wywołania `callServiceAction(domain, method, args)`.
- Przełącznik: `MOST_DATA_SOURCE` / `NEXT_PUBLIC_MOST_DATA_SOURCE` ∈ `{mock, appwrite}`.

## Strefy UI

| Strefa | Layout group | Shell |
|--------|--------------|-------|
| Marketing | `app/(marketing)` | landing `/` |
| Portal | `app/(portal)` | sidebar mieszkańca |
| Panel | `app/(panel)` | sidebar organizacji / admin |
| Auth | `app/(auth)` | login z `?to=portal\|panel` |

Dostęp do panelu w UI: role `org | jst | expert | admin` (`canAccessPanel`). To kontrola demo, nie RLS Appwrite.

## AI / funkcje

`AiService` próbuje `Functions.createExecution`, potem lokalny fallback na żywych wierszach TablesDB (lub seedzie w mock):

| Metoda | Funkcja Cloud | Fallback |
|--------|---------------|----------|
| `matchNeed` | `match-need` | `lib/ai/match.ts` → zapis `match_queries` |
| `getTrendClusters` | `trend-clusters` | agregacja needs × challenges w TS |
| `adaptInnovationToService` | `middleman-adapt` | reguły lokalne → `service_adaptations` |
| `suggestKeywords` / `suggestIdeaImprovements` | — | tylko lokalnie |

Słaby wynik `match-need` (brak items lub best score < 40) też spada na fallback.

## Co świadomie nie jest produkcyjne

- Brak Appwrite Auth / Sessions / OAuth.
- Panel i mutacje idą kluczem admin API (Server Actions) — uprawnienia tabel to szablon pod przyszłe Account, nie egzekwowane z UI.
- Seed i profile użytkowników żyją w `data/mocks/seed.ts`; w Cloud profile są w tabeli `profiles`, ale UI roli ich nie czyta.
- Storage buckety są utworzone; upload z UI nie jest w pełni podpięty (media URL-e w seedzie).
