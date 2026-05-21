-- Run this in Supabase SQL Editor if admin saves fail with "Save failed"
-- Fixes: custom x-admin-key headers are not reliable for table RLS on Supabase

drop policy if exists "cms_content_admin_write" on public.cms_content;
drop policy if exists "cms_lists_admin_write" on public.cms_lists;
drop policy if exists "cms_content_no_direct_write" on public.cms_content;
drop policy if exists "cms_content_no_direct_update" on public.cms_content;
drop policy if exists "cms_content_no_direct_delete" on public.cms_content;
drop policy if exists "cms_lists_no_direct_write" on public.cms_lists;
drop policy if exists "cms_lists_no_direct_update" on public.cms_lists;
drop policy if exists "cms_lists_no_direct_delete" on public.cms_lists;

create policy "cms_content_no_direct_write"
  on public.cms_content for insert
  with check (false);

create policy "cms_content_no_direct_update"
  on public.cms_content for update
  using (false);

create policy "cms_content_no_direct_delete"
  on public.cms_content for delete
  using (false);

create policy "cms_lists_no_direct_write"
  on public.cms_lists for insert
  with check (false);

create policy "cms_lists_no_direct_update"
  on public.cms_lists for update
  using (false);

create policy "cms_lists_no_direct_delete"
  on public.cms_lists for delete
  using (false);

create or replace function public.cms_check_admin(p_admin_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(p_admin_key, '') = 'xbigx244340';
$$;

create or replace function public.cms_upsert_content(
  p_admin_key text,
  p_id text,
  p_value jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.cms_check_admin(p_admin_key) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  insert into public.cms_content (id, value, updated_at)
  values (p_id, p_value, now())
  on conflict (id) do update
    set value = excluded.value, updated_at = now();

  return p_value;
end;
$$;

create or replace function public.cms_delete_content(
  p_admin_key text,
  p_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.cms_check_admin(p_admin_key) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  delete from public.cms_content where id = p_id;
end;
$$;

create or replace function public.cms_delete_content_ids(
  p_admin_key text,
  p_ids text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.cms_check_admin(p_admin_key) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  delete from public.cms_content where id = any (p_ids);
end;
$$;

create or replace function public.cms_delete_content_prefix(
  p_admin_key text,
  p_prefix text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.cms_check_admin(p_admin_key) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  delete from public.cms_content where id like p_prefix || '%';
end;
$$;

create or replace function public.cms_upsert_list(
  p_admin_key text,
  p_list_key text,
  p_item_ids jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.cms_check_admin(p_admin_key) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  insert into public.cms_lists (list_key, item_ids, updated_at)
  values (p_list_key, coalesce(p_item_ids, '[]'::jsonb), now())
  on conflict (list_key) do update
    set item_ids = excluded.item_ids, updated_at = now();
end;
$$;

grant execute on function public.cms_check_admin(text) to anon, authenticated;
grant execute on function public.cms_upsert_content(text, text, jsonb) to anon, authenticated;
grant execute on function public.cms_delete_content(text, text) to anon, authenticated;
grant execute on function public.cms_delete_content_ids(text, text[]) to anon, authenticated;
grant execute on function public.cms_delete_content_prefix(text, text) to anon, authenticated;
grant execute on function public.cms_upsert_list(text, text, jsonb) to anon, authenticated;

-- Storage: custom headers don't reach storage RLS either — allow portfolio-media bucket writes
drop policy if exists "portfolio_media_admin_write" on storage.objects;
drop policy if exists "portfolio_media_admin_update" on storage.objects;
drop policy if exists "portfolio_media_admin_delete" on storage.objects;
drop policy if exists "portfolio_media_cms_insert" on storage.objects;
drop policy if exists "portfolio_media_cms_update" on storage.objects;
drop policy if exists "portfolio_media_cms_delete" on storage.objects;

create policy "portfolio_media_cms_insert"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-media');

create policy "portfolio_media_cms_update"
  on storage.objects for update
  using (bucket_id = 'portfolio-media');

create policy "portfolio_media_cms_delete"
  on storage.objects for delete
  using (bucket_id = 'portfolio-media');
