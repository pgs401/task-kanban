# Task Kanban

Production-grade task management SaaS with kanban boards, user authentication,
and persistent storage. Built with **Next.js 14 (App Router)**, **TypeScript**,
**Tailwind CSS + shadcn/ui**, **Supabase** (PostgreSQL + Auth), and
**react-beautiful-dnd**. Deployable to Vercel.

## Features

- **Authentication** — email/password signup, login, logout, persistent
  sessions. Unauthenticated users are redirected to `/login` by middleware.
- **Boards** — list, create (unique title per user), and delete (with
  confirmation) boards from the dashboard.
- **Kanban** — three columns (To Do, In Progress, Done) with per-column card
  counts. Create, edit, and delete cards. Drag cards between columns and
  reorder within a column; both column and position are persisted.
- **UX** — responsive layout, loading states, toast notifications (sonner),
  and confirm dialogs for destructive actions.
- **Security** — Postgres Row-Level Security isolates each user's data.

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
editor and run [`supabase/schema.sql`](./supabase/schema.sql). This creates the
`boards` and `cards` tables, enables RLS, and installs the access policies.

> In **Authentication → Providers → Email**, disable "Confirm email" for the
> smoothest local experience, or leave it on to require email confirmation.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your project values (found in
**Project Settings → API**):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server           |
| `npm run build`     | Production build               |
| `npm run start`     | Start the production server    |
| `npm run lint`      | Run ESLint                     |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   environment variables.
4. Deploy.

## Project structure

```
src/
  app/
    layout.tsx              Root layout + Toaster
    page.tsx                Redirects based on auth state
    login/                  Login page + auth server actions
    signup/                 Signup page
    auth/signout/           Sign-out route handler
    dashboard/              Board list (server) + client logic
    board/[id]/             Kanban board (server) + DnD client
  components/
    ui/                     shadcn/ui primitives
    auth-form.tsx           Shared login/signup form
    app-header.tsx          App header with sign-out
  lib/supabase/             Browser, server, and middleware clients
  types/database.types.ts   Typed Supabase schema
middleware.ts               Session refresh + route protection
supabase/schema.sql         Database schema, RLS, and policies
```
