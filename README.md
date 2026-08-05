# Friends — Friend Feed

A static Next.js (App Router) "friend feed" deployed to GitHub Pages. Posts are
stored in **Supabase** (Postgres + Storage) so they sync across every device —
there is no local-only persistence for posts.

## How posts sync

- **On page load:** the feed fetches all posts from the Supabase `posts` table
  and renders them, newest first.
- **On submit:** the new post payload is inserted into Supabase, and the
  returned row is added to the UI state.
- **Likes, dislikes, replies, edits, deletes:** the change is written to
  Supabase first, then reflected in the UI.

Only lightweight, per-device preferences (your display name and any
self-created authors) are kept in `localStorage`.

## Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project

## 1. Create the Supabase project

1. Go to https://supabase.com and create a project (or use an existing one).
2. Open **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon / publishable key** — this is the public key used by the browser.
     It is safe to ship it; row-level security protects your data.

## 2. Set up the database schema

1. In the Supabase Dashboard, open **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
3. Verify the `posts` table and the `post-images` storage bucket exist.

This creates:

- `public.posts` — `id` (uuid, PK), `author`, `content`, `created_at`,
  `likes`, `dislikes`, `liked_by` (text[]), `disliked_by` (text[]), `comments`,
  `image_url`, `replies` (jsonb)
- Row-level security policies allowing anyone to read/insert/update/delete
  posts (public feed — no auth).
- The public `post-images` storage bucket used for photo uploads.

> **Not a Supabase user?** You can substitute Firebase Firestore: create a
> `posts` collection mirroring the fields above, and swap the functions in
> `src/lib/storage.ts` for the Firestore SDK calls. The components in
> `src/components/` don't need to change.

## 3. Configure environment variables

Copy the example file and fill in your project credentials:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon/publishable key>
```

These two variables are required. If they are missing, image uploads and post
writes will fail with a clear "Supabase is not configured" error.

## 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Posts you create are
written straight to Supabase and will appear on any other device pointing at
the same project.

## 5. Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds the static export and
publishes it to the `gh-pages` branch.

It reads the two Supabase variables from GitHub **Actions secrets**, and falls
back to the defaults already committed in the workflow file:

1. In your GitHub repo go to **Settings → Secrets and variables → Actions**.
2. Add repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually).
4. Your site (under the `/friends` base path) will sync to the same Supabase
   project, so every visitor sees the same posts.

## Useful commands

```bash
npm run dev      # start the dev server
npm run build    # static export (used by GitHub Pages)
npm run lint     # run ESLint
```
