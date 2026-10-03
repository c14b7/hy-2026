# MOST — Małopolski Hub Innowacji Społecznych

Prototyp frontendu (Next.js 16 + shadcn/ui `base-rhea` / stone) łączący potrzeby mieszkańców z innowacjami społecznymi, organizacjami i wiedzą Hubu.

Dane są **wyłącznie demonstracyjne** (mock). Warstwa `lib/services` jest gotowa na podpięcie Appwrite.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Struktura IA

| Strefa | Ścieżka | Shell |
|--------|---------|-------|
| Landing | `/` | minimalny (bez mega-nav) |
| Portal | `/portal` + `/innowacje`, `/potrzeba`… | sidebar mieszkańców |
| Panel | `/panel/*` | sidebar organizacji |
| Login | `/login?to=portal\|panel` | dual entry |

## Ścieżka demo na scenę (~3 minuty)

1. **Landing** `/` — „Wejdź do portalu”.
2. **Hub** `/portal` — szybkie akcje.
3. **Matchmaking** `/potrzeba` — scenariusz „Samotność seniora” → wyniki.
4. **Biblioteka** `/innowacje` (sidebar).
5. **Login panel** `/login?to=panel` — rola Admin ROPS → `/panel/admin/trendy`.
6. **Middleman** `/middleman`, **Kreator** `/pomysly/nowy`.

## Moduły (PDF)

| Moduł | Ścieżka |
|-------|---------|
| Matchmaking | `/potrzeba` |
| Zasobnik wiedzy | `/wiedza`, `/wyzwania` |
| Kreator pomysłów | `/pomysly` |
| Tester | `/tester` |
| Komunikacja | `/komunikacja`, `/panel/komunikacja` |
| Panel admina | `/panel`, `/panel/zgloszenia`, `/panel/admin/trendy` |
| Middleman AI | `/middleman` |

## Role demo

Ukryte pod „Tryb demo” w sidebarze. Login: mieszkaniec → portal, org/JST/ekspert/admin → panel (localStorage).

## Skrypty

- `npm run dev` / `build` / `typecheck` / `lint`
