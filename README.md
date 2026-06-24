# Task Kanban

A production-grade, open-source task management SaaS with drag-and-drop kanban boards, 
user authentication, and real-time collaboration. Built with Next.js and Supabase.

**Fork this repo and deploy your own instance in < 10 minutes.**

## Features

- ✅ User authentication (email/password signup & login)
- ✅ Create, view, and delete boards
- ✅ Drag-and-drop tasks between columns (To Do → In Progress → Done)
- ✅ Create, edit, and delete tasks with descriptions
- ✅ Persistent storage with Supabase PostgreSQL
- ✅ Row-level security (RLS) for multi-tenant safety
- ✅ Responsive Tailwind CSS design
- ✅ One-click deployment to Vercel

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- React 18
- Tailwind CSS
- shadcn/ui components

**Backend:**
- Next.js API Routes
- Supabase PostgreSQL
- Supabase Auth (email/password)

**Infrastructure:**
- Vercel (hosting)
- GitHub Actions (CI/CD)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A free [Supabase account](https://supabase.com)
- A [Vercel account](https://vercel.com) (optional, for deployment)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/task-kanban.git
cd task-kanban
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier)
3. Copy your project URL and anon key

### 3. Set Up Database

1. In Supabase, go to **SQL Editor**
2. Create a new query and paste the schema from [DEPLOYMENT.md](DEPLOYMENT.md)
3. Run the query

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
