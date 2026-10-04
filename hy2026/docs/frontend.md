# Frontend

## Struktura katalogów (istotne)

```
app/
  (marketing)/page.tsx          # /
  (portal)/…                    # portal mieszkańca
  (panel)/panel/…               # panel org / admin
  (auth)/login/page.tsx
  layout.tsx                    # ThemeProvider, RoleProvider
components/
  layout/portal-shell.tsx
  layout/panel-shell.tsx
  matchmaking|innovations|knowledge|tester|middleman|…
lib/
  services|appwrite|ai|…
data/mocks/seed.ts
types/domain.ts
```

## Mapa tras

### Marketing

| Ścieżka | Opis |
|---------|------|
| `/` | Landing MOST → CTA portal / panel |

### Portal

| Ścieżka | Opis |
|---------|------|
| `/portal` | Hub szybkich akcji |
| `/potrzeba`, `/potrzeba/wynik` | Matchmaking potrzeb |
| `/innowacje`, `/innowacje/[id]` | Biblioteka innowacji |
| `/organizacje`, `/organizacje/[id]` | Katalog org |
| `/wyzwania`, `/wyzwania/[slug]` | Obszary wyzwań |
| `/wiedza`, `/wiedza/[slug]` | Baza wiedzy (public) |
| `/pomysly`, `/pomysly/nowy`, `/pomysly/[id]` | Pomysły / kreator |
| `/middleman` | Adaptacja innowacji do instytucji |
| `/tester`, `/tester/[id]` | Nabór testerów |
| `/komunikacja` | Inbox (demo) |

### Panel

| Ścieżka | Opis |
|---------|------|
| `/panel` | Dashboard org |
| `/panel/innowacje` | Innowacje org + status |
| `/panel/zgloszenia` | Moderacja needs/ideas |
| `/panel/wiedza` (+ nowy / edytuj) | CMS wiedzy (TipTap) |
| `/panel/nabor` | Grant calls |
| `/panel/komunikacja` | Wątki |
| `/panel/podopieczni`, `/panel/zespol` | CRM |
| `/panel/admin/trendy` | Klastry potrzeb (admin) |

### Auth

| Ścieżka | Opis |
|---------|------|
| `/login?to=portal\|panel` | Wybór roli demo → redirect |

## Role demo

`components/shared/role-provider.tsx`:

- Klucz `localStorage`: `most-demo-role`
- Role: `guest | seeker | org | jst | expert | admin`
- Użytkownicy mapowani ze `seed.users` (Anna, Marek, …)
- `canAccessPanel` dla org/jst/expert/admin
- Przełącznik roli w UI (nie jest to bezpieczeństwo)

## Konwencje UI

- Shell portal/panel: nawigacja + badge źródła danych (`DataSourceBadge`)
- Filtry list: `FilterBar` + Fuse/query w serwisach lub komponencie
- Wiedza: TipTap (`rich-body-editor`) → body HTML; podgląd `markdown-view` / HTML
- Motyw: `next-themes` + `ThemeControl` (light/dark/system)
- Landing: hero pełnoekranowy (shader/gradient), bez kart w pierwszym viewport

## Server vs Client

- Listy SSR: strony `async` wołają `getServices()` bezpośrednio (serwer).
- Formularze / interakcje: client → `getServices()` → w appwrite Proxy → Server Action.
- Nie importuj `lib/appwrite/server` ani `createAppwriteServices` w komponentach client.

## Labele

Polskie etykiety enumów: `lib/labels.ts` (`ROLE_LABELS`, stage, status, …).
