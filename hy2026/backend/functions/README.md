# Appwrite Functions (stubs)

These are placeholder Python handlers for MOST. The bootstrap script
`scripts/setup_appwrite.py` registers the functions; deploy code via Console/CLI.

| Folder | Function ID | Purpose |
|--------|-------------|---------|
| `match-need/` | `match-need` | Keyword matchmaking → `match_queries` |
| `trend-clusters/` | `trend-clusters` | Aggregate needs into challenge clusters |
| `middleman-adapt/` | `middleman-adapt` | Build service adaptation plan |

Each function needs runtime env:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY` (function-scoped or project key)
- `APPWRITE_DATABASE_ID=most`

Entrypoint: `src/main.py` → `main(context)`.
