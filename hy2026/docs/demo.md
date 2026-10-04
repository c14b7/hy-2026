# Demo na scenę (~3 min)

Założenie: `MOST_DATA_SOURCE=appwrite`, seed wgrany, site/live lub `npm run dev`.

1. **`/`** — brand MOST, „Wejdź do portalu”.
2. **`/portal`** — mapa ścieżek (potrzeba, innowacje, wiedza).
3. **`/potrzeba`** — gotowy scenariusz „Samotność seniora” (lub własny tekst ≥ 8 znaków) → wyniki z score + rationale.
4. **`/innowacje/[id]`** — karta innowacji z matcha (np. klub sąsiedzki / seniorzy).
5. **`/login?to=panel`** — rola **Admin ROPS** → **`/panel/admin/trendy`** (klastry potrzeb).
6. Opcjonalnie: **`/middleman`** (adaptacja), **`/pomysly/nowy`** (kreator + podpowiedzi), **`/tester`** (nabór).

## Punkty do podkreślenia

- Jedna warstwa `getServices()` — ten sam UI na mock i Cloud.
- Match: funkcja Cloud z fallbackiem keyword (demo nie pada).
- Panel wiedzy: edycja TipTap (CMS).
- Badge w stopce: aktualne źródło danych.

## Role pod ręką

| Rola | Po co |
|------|--------|
| guest / seeker | portal, match, tester |
| org | panel innowacji / zgłoszenia |
| admin | trendy, moderacja, wiedza |
