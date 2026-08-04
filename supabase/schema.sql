-- Friend Feed - Supabase schema setup
-- Run this in the Supabase Dashboard -> SQL Editor.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  content text not null,
  created_at timestamptz not null default now(),
  likes integer not null default 0,
  dislikes integer not null default 0,
  liked_by text[] not null default '{}',
  disliked_by text[] not null default '{}',
  comments integer not null default 0,
  image_url text,
  replies jsonb not null default '[]'
);

alter table public.posts enable row level security;

drop policy if exists "posts_select_policy" on public.posts;
drop policy if exists "posts_insert_policy" on public.posts;
drop policy if exists "posts_update_policy" on public.posts;
drop policy if exists "posts_delete_policy" on public.posts;

create policy "posts_select_policy" on public.posts for select using (true);
create policy "posts_insert_policy" on public.posts for insert with check (true);
create policy "posts_update_policy" on public.posts for update using (true);
create policy "posts_delete_policy" on public.posts for delete using (true);

-- Migration for existing installs
alter table public.posts add column if not exists dislikes integer not null default 0;
alter table public.posts add column if not exists disliked_by text[] not null default '{}';
alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists replies jsonb not null default '[]';

-- Storage bucket for uploaded post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post_images_select" on storage.objects;
drop policy if exists "post_images_insert" on storage.objects;
drop policy if exists "post_images_update" on storage.objects;
drop policy if exists "post_images_delete" on storage.objects;

create policy "post_images_select" on storage.objects
  for select using (bucket_id = 'post-images');
create policy "post_images_insert" on storage.objects
  for insert with check (bucket_id = 'post-images');
create policy "post_images_update" on storage.objects
  for update using (bucket_id = 'post-images');
create policy "post_images_delete" on storage.objects
  for delete using (bucket_id = 'post-images');
