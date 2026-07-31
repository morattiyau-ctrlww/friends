-- Friend Feed - Supabase schema setup
-- Run this in the Supabase Dashboard -> SQL Editor.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  content text not null,
  created_at timestamptz not null default now(),
  likes integer not null default 0,
  liked_by text[] not null default '{}',
  comments integer not null default 0
);

alter table public.posts enable row level security;

create policy "posts_select_policy" on public.posts for select using (true);
create policy "posts_insert_policy" on public.posts for insert with check (true);
create policy "posts_update_policy" on public.posts for update using (true);
create policy "posts_delete_policy" on public.posts for delete using (true);
