# Aura Admin

Super admin web dashboard untuk [Aura](https://github.com/Syidh13/aura).
Build: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Supabase JS.

## What it does

- Login (super_admin only — non-admin accounts get bounced)
- Dashboard: aggregate stats (total warga, RW/RT status breakdown, pending pengajuan count)
- **Pengajuan** queue — approve / reject calon ketua RT/RW
- **RW & RT** browser — drill down: RW list → RT list per RW → Warga list per RT

Same Supabase backend as the mobile app (`elsadrgrgntubaadwghr`). Reuses
existing RPCs (`approve_pengajuan_ketua`, `get_pengajuan_for_approver`,
`admin_dashboard_stats`, `admin_list_warga_in_rt`).

## Setup

```bash
npm install
cp .env.local.example .env.local  # paste Supabase URL + anon key
npm run dev
```

Open <http://localhost:3000>. You'll get bounced to `/login` — sign in with
a `super_admin` Supabase account.

## Tech notes

- Next.js 16 renamed `middleware.ts` → `proxy.ts`. Convention is loose-typed
  to the framework expectations.
- Auth state lives in Supabase cookies (via `@supabase/ssr`). Server pages
  read via `createClient()` from `lib/supabase/server.ts`. Client components
  use `lib/supabase/client.ts`.
- Role gate (`super_admin` only) enforced in `proxy.ts` — runs on every
  request, non-admins get signed out and redirected to
  `/login?error=not_admin`.
- Server actions (`app/pengajuan/actions.ts`) call the existing
  `approve_pengajuan_ketua` / `reject_pengajuan_ketua` RPCs and
  `revalidatePath` the affected pages.

## Project structure

```
app/
  layout.tsx             — root shell (font, body bg)
  page.tsx               — dashboard
  login/
    page.tsx             — login (Suspense-wrapped)
    LoginForm.tsx        — client-only form
  pengajuan/
    page.tsx             — list pending + decided
    PengajuanRow.tsx     — row with approve/reject buttons (client)
    actions.ts           — server actions
  rws/
    page.tsx             — all RWs
    [id]/page.tsx        — RTs in this RW
  rts/[id]/page.tsx      — warga in this RT
components/
  AdminShell.tsx         — sidebar + content layout (client, for nav state)
  StatusBadge.tsx        — shell/pending/active pill
lib/supabase/
  client.ts              — browser Supabase client
  server.ts              — server Supabase client (uses async cookies())
proxy.ts                 — auth + super_admin role gate
```

## Related repos

- [Syidh13/aura](https://github.com/Syidh13/aura) — mobile app (React Native + Expo)
