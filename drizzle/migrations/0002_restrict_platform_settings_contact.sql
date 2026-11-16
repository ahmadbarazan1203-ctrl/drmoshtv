drop policy if exists "settings public read" on public.platform_settings;
revoke select on public.platform_settings from anon, authenticated;
grant select (id, site_name, site_description, seo_title, seo_description, og_image, social_links, section_order, updated_at) on public.platform_settings to anon, authenticated;
grant select on public.platform_settings to authenticated;
create policy "settings public read" on public.platform_settings for select to anon, authenticated using (id = 1);

create or replace function public.public_contact()
returns table(contact_email text, contact_phone text)
language sql stable security definer set search_path = public as $$
  select contact_email, contact_phone from public.platform_settings where id = 1
$$;
revoke all on function public.public_contact() from public;
grant execute on function public.public_contact() to anon, authenticated;