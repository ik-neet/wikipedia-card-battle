# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (run before deploying)
npm run lint      # ESLint check

# No test suite is configured
```

## Environment Variables

Required in `.env.local` (local) and Vercel dashboard (production):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Supabase client (`src/lib/supabase.ts`) throws at runtime if these are missing — this was the cause of the "ルームの作成に失敗しました" production bug.

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Supabase Realtime

The entire app renders from a single route `src/app/page.tsx` (`'use client'`, `force-dynamic`). Phase-based rendering: the active component is determined by `state.phase` (CPU mode) or multiplayer state.

### CPU vs Multiplayer split

- **CPU mode**: `useGame` hook manages all state locally. Flow: `title → difficulty → drawing → battle → result`
- **Multiplayer mode**: `MultiplayerGame` component wraps everything; `useMultiplayerGame` hook syncs state via Supabase Realtime

### Supabase Realtime sync (`useMultiplayerGame.ts`)

- The `rooms` table is the single source of truth
- Both players subscribe to `UPDATE` events on their room's `code`
- **Host-only logic**: Battle start, card evaluation, round results, and score updates are computed only by the host (`roleRef.current === 'host'`) to avoid race conditions
- `useRef` pattern: `roomRef` and `roleRef` mirror state so async callbacks always read fresh values without stale closures
- `createRoom(settings, name)` inserts with `host_name`; `joinRoom(code, name)` updates with `guest_name` and flips `status` to `'drawing'`

### Game flow (multiplayer)

`waiting → drawing → battle → result`

- **waiting**: Host waits for guest; guest joins by room code
- **drawing**: Both players draw cards from Wikipedia API; each can redraw (limited); confirm when ready
- **battle**: Turn-based; attacker selects card, defender selects card, then reveal. Host determines outcome and writes `round_results`, `host_score`, `guest_score`, `current_attacker`
- **result**: Final scores shown; host can create new room

### Wikipedia cards (`src/lib/wikipedia.ts`)

Cards are fetched from the Wikipedia API. Each `WikiCard` has a `power` value derived from article metadata. The total hand power determines who attacks first.

### Key types

- `Room` (`src/types/room.ts`): Full DB row shape including `host_name`, `guest_name`, all hand/field/score fields
- `RoomStatus`: `'waiting' | 'drawing' | 'battle' | 'result'`
- `RoomBattleSubPhase`: `'attacker_select' | 'defender_select' | 'reveal'`

### Database schema

Schema is in `supabase/schema.sql`. Run in the Supabase SQL Editor to initialize or update. RLS is enabled with a single "allow all for anon" policy. Realtime is enabled via `alter publication supabase_realtime add table rooms`.

### Derived display values

`useMultiplayerGame` exports `myName` and `opponentName` derived from `room.host_name`/`room.guest_name` + `role`. These are passed as props into `MultiplayerBattleScreen` and `MultiplayerResultScreen` to replace hardcoded "あなた"/"相手" labels.
