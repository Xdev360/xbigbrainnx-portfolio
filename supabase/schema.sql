-- xbigbrainnx portfolio CMS — run in Supabase SQL Editor
-- Project Settings → SQL → New query → paste → Run

-- Content key/value (text fields, image URLs, categories, etc.)
create table if not exists public.cms_content (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Dynamic lists (add/delete cards)
create table if not exists public.cms_lists (
  list_key text primary key,
  item_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Default categories
insert into public.cms_content (id, value)
values (
  '__cms.categories',
  '["AI","Fintech","Web3","Gaming","SaaS","Retail","Brand","Agency","Editorial","Creator Tools"]'::jsonb
)
on conflict (id) do nothing;

-- Storage bucket for uploaded images/audio
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  15728640,
  array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/mp3','audio/wav']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Replace with your own random secret (must match supabase-config.js adminWriteKey)
-- Example only — change before production
alter table public.cms_content enable row level security;
alter table public.cms_lists enable row level security;

drop policy if exists "cms_content_public_read" on public.cms_content;
drop policy if exists "cms_content_admin_write" on public.cms_content;
drop policy if exists "cms_lists_public_read" on public.cms_lists;
drop policy if exists "cms_lists_admin_write" on public.cms_lists;
drop policy if exists "portfolio_media_public_read" on storage.objects;
drop policy if exists "portfolio_media_admin_write" on storage.objects;
drop policy if exists "portfolio_media_admin_update" on storage.objects;
drop policy if exists "portfolio_media_admin_delete" on storage.objects;

create policy "cms_content_public_read"
  on public.cms_content for select
  using (true);

create policy "cms_content_admin_write"
  on public.cms_content for all
  using (
    coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  )
  with check (
    coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  );

create policy "cms_lists_public_read"
  on public.cms_lists for select
  using (true);

create policy "cms_lists_admin_write"
  on public.cms_lists for all
  using (
    coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  )
  with check (
    coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  );

create policy "portfolio_media_public_read"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "portfolio_media_admin_write"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-media'
    and coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  );

create policy "portfolio_media_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-media'
    and coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  );

create policy "portfolio_media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-media'
    and coalesce(
      (current_setting('request.headers', true)::json ->> 'x-admin-key'),
      ''
    ) = 'REPLACE_WITH_YOUR_ADMIN_WRITE_KEY'
  );

-- Realtime (optional — live updates across tabs)
alter publication supabase_realtime add table public.cms_content;
alter publication supabase_realtime add table public.cms_lists;
