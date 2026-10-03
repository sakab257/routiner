# Routiner

Suivi d'habitudes personnel en PWA : pas de compte, pas de backend, tout reste dans le
`localStorage` de l'appareil et l'app fonctionne hors ligne.

Design de référence : `design/Routiner.dc.html` + `design/RoutinerScreen.dc.html` (Claude Design),
lui-même dérivé du Figma « Routiner ».

## Démarrer

```bash
pnpm install
pnpm dev          # http://localhost:3000 (service worker désactivé en dev)
pnpm build && pnpm start   # pour tester la PWA et le hors-ligne
```

| Script            | Rôle                                               |
| ----------------- | -------------------------------------------------- |
| `pnpm test`       | Tests Vitest de la logique métier et du store      |
| `pnpm lint`       | ESLint (config Next)                               |
| `pnpm typecheck`  | `tsc --noEmit`                                     |
| `pnpm icons`      | Régénère les icônes PWA depuis `public/icons/logo-white.png` |
| `pnpm emoji-index` | Régénère l'index de recherche d'icônes (`lib/emoji-index.json`, noms français CLDR) |

## Architecture

- **Next.js 16 (App Router, Turbopack)**. Toutes les pages sont statiques ; les écrans de détail
  lisent un `?id=` (`/habitude?id=…`, `/defi?id=…`) pour pouvoir être précachés.
- **Données** : `lib/store.ts`, Zustand + `persist` sous la clé `routiner:v1`, schéma versionné
  (`DATA_VERSION`, `MIGRATIONS` dans `lib/data.ts`). Le store est réhydraté côté client
  (`skipHydration`) et chaque chargement est assaini par zod (`sanitizeData`).
- **Règles métier** (fonctions pures, testées) dans `lib/logic/` :
  - `habits.ts` : issue d'un jour, séries (`done` prolonge, `failed` casse, `skipped` neutre),
    habitudes « à arrêter » = jours sans rechute ;
  - `stats.ts` : taux de réussite, complétées, points, meilleure série, passées, échouées ;
  - `challenges.ts` : progression des défis personnels ;
  - `rewards.ts` : points (10 par habitude faite, 50 par défi réussi) et badges par paliers de série.
- **Dates** : `lib/date.ts`, clés de jour `AAAA-MM-JJ` en date **locale** (jamais `toISOString`).
  Les tests tournent en `Europe/Paris` pour couvrir les changements d'heure.
- **UI** : Tailwind CSS v4 (tokens dans `app/globals.css`), shadcn/ui (Radix), lucide-react,
  motion (swipe, overlays), recharts (courbe), canvas-confetti (badges).
- **PWA** : `app/manifest.ts`, logos officiels (`logo-blue.png`, `logo-white.png`) et icônes générées dans `public/icons`, service worker Serwist
  (`app/sw.ts`, servi par `app/serwist/[path]/route.ts`) qui précache toutes les pages,
  avec `/~offline` en secours. Rappels uniquement dans l'app (bannière à l'ouverture).

## Sauvegarde

Réglages → Exporter en JSON. L'import valide le fichier avec zod avant de remplacer les données.
