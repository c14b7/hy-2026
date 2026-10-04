# Deploy

## Target: Appwrite Sites

Projekt Cloud `hy`, site `hy-2026`.

| Ustawienie | Wartość |
|------------|---------|
| Framework | Next.js |
| Adapter | **`ssr`** (nie `static`) |
| Root directory | `./hy2026` |
| Install / build | `npm install` / `npm run build` |
| Output | `./.next` |
| Build runtime | `node-22` |

### Dlaczego SSR

`adapter: static` oczekuje artefaktów typu `index.html`. Next App Router generuje `.next` (prerender + dynamic `ƒ`). Przy static edge kończy się komunikatem w stylu „page doesn’t exist” mimo zielonego builda. SSR bundluje runtime Next i serwuje trasy poprawnie.

### Zmienne na Site

W Console → Site → Variables (lub API):

| Key | Secret? |
|-----|---------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | nie |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | nie |
| `APPWRITE_ENDPOINT` | nie (opcjonalnie, spójność) |
| `APPWRITE_PROJECT_ID` | nie |
| `APPWRITE_DATABASE_ID` | nie (`most`) |
| `APPWRITE_API_KEY` | **tak** (oznacz jako secret) |
| `MOST_DATA_SOURCE` | nie → `appwrite` |
| `NEXT_PUBLIC_MOST_DATA_SOURCE` | nie → `appwrite` |

Po zmianie zmiennych: redeploy (VCS push lub ręczny).

### Domeny

- Produkcyjna generowana / custom, np. `https://most.appwrite.network`
- Branch / commit domains bywają `401` bez auth preview — do dema używaj domeny Active deployment

### Checklist przed releasem

1. `python scripts/setup_appwrite.py --seed` (dane aktualne)
2. `python scripts/deploy_functions.py`
3. `python scripts/smoke_appwrite.py`
4. Lokalnie: `npm run typecheck && npm run lint && npm run build`
5. Sites: adapter `ssr`, root `./hy2026`, env jak wyżej
6. Po `ready`: HTTP 200 na `/`, smoke `/potrzeba`, `/portal`, `/login?to=panel`

Edge distribution „partial (N/M)” przy `status: ready` zwykle jest OK — sprawdź URL, nie tylko log.

## Alternatywa: własny host Node

```bash
npm run build && npm start
```

Te same zmienne env. Nie commituj `.env.local` / `.env.appwrite`.

## Offline / CI

```env
MOST_DATA_SOURCE=mock
NEXT_PUBLIC_MOST_DATA_SOURCE=mock
```

Build bez Cloud i bez API key.
