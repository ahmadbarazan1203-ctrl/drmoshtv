create type public.app_role as enum ('admin','moderator','user');
create type public.production_status as enum ('upcoming','ongoing','completed');

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_suspended(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select suspended from public.profiles where id = _user_id), false)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin roles insert" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin roles delete" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin') and user_id <> auth.uid());

-- prevent non-admins changing protected profile columns
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.suspended is distinct from old.suspended or new.email is distinct from old.email)
     and not public.has_role(auth.uid(),'admin') and auth.role() <> 'service_role' then
    raise exception 'Not allowed';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile_columns();

-- signup handling
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  if new.email_confirmed_at is not null and lower(new.email) = 'ahmadbarazan1203@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.handle_user_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null
     and lower(new.email) = 'ahmadbarazan1203@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users for each row execute function public.handle_user_confirmed();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- genres
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null, name_en text not null, name_fr text not null, name_tr text not null,
  created_at timestamptz not null default now()
);
grant select on public.genres to anon, authenticated;
grant insert, update, delete on public.genres to authenticated;
grant all on public.genres to service_role;
alter table public.genres enable row level security;
create policy "genres public read" on public.genres for select to anon, authenticated using (true);
create policy "genres admin write" on public.genres for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.genres (slug,name_ar,name_en,name_fr,name_tr) values
('sci-fi','خيال علمي','Sci-Fi','Science-fiction','Bilim Kurgu'),
('drama','دراما','Drama','Drame','Dram'),
('thriller','إثارة','Thriller','Thriller','Gerilim'),
('fantasy','فانتازيا','Fantasy','Fantastique','Fantastik'),
('action','أكشن','Action','Action','Aksiyon'),
('mystery','غموض','Mystery','Mystère','Gizem'),
('comedy','كوميديا','Comedy','Comédie','Komedi'),
('horror','رعب','Horror','Horreur','Korku'),
('animation','رسوم متحركة','Animation','Animation','Animasyon'),
('documentary','وثائقي','Documentary','Documentaire','Belgesel');

-- series
create table public.series (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  synopsis text not null default '',
  poster_url text, cover_url text, trailer_url text,
  release_year int,
  release_date date,
  production_status production_status not null default 'ongoing',
  production text,
  keywords text,
  cast_members jsonb not null default '[]'::jsonb,
  is_original boolean not null default true,
  is_published boolean not null default false,
  is_trending boolean not null default false,
  is_latest boolean not null default false,
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index series_published_idx on public.series (is_published, created_at desc);
create trigger series_touch before update on public.series for each row execute function public.touch_updated_at();
grant select on public.series to anon, authenticated;
grant insert, update, delete on public.series to authenticated;
grant all on public.series to service_role;
alter table public.series enable row level security;
create policy "series public read" on public.series for select to anon, authenticated using (is_published or public.has_role(auth.uid(),'admin'));
create policy "series admin write" on public.series for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.series_genres (
  series_id uuid not null references public.series(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (series_id, genre_id)
);
create index series_genres_genre_idx on public.series_genres (genre_id);
grant select on public.series_genres to anon, authenticated;
grant insert, update, delete on public.series_genres to authenticated;
grant all on public.series_genres to service_role;
alter table public.series_genres enable row level security;
create policy "sg public read" on public.series_genres for select to anon, authenticated using (true);
create policy "sg admin write" on public.series_genres for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  season_number int not null,
  title text,
  created_at timestamptz not null default now(),
  unique (series_id, season_number)
);
grant select on public.seasons to anon, authenticated;
grant insert, update, delete on public.seasons to authenticated;
grant all on public.seasons to service_role;
alter table public.seasons enable row level security;
create policy "seasons public read" on public.seasons for select to anon, authenticated using (
  exists (select 1 from public.series s where s.id = series_id and s.is_published) or public.has_role(auth.uid(),'admin'));
create policy "seasons admin write" on public.seasons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  episode_number int not null,
  title text not null,
  description text not null default '',
  thumbnail_url text,
  video_url text,
  duration_minutes int,
  is_published boolean not null default false,
  publish_at timestamptz not null default now(),
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, episode_number)
);
create index episodes_series_idx on public.episodes (series_id, season_id, episode_number);
create index episodes_recent_idx on public.episodes (is_published, publish_at desc);
create trigger episodes_touch before update on public.episodes for each row execute function public.touch_updated_at();
grant select on public.episodes to anon, authenticated;
grant insert, update, delete on public.episodes to authenticated;
grant all on public.episodes to service_role;
alter table public.episodes enable row level security;
create policy "episodes public read" on public.episodes for select to anon, authenticated using (
  (is_published and publish_at <= now() and exists (select 1 from public.series s where s.id = series_id and s.is_published))
  or public.has_role(auth.uid(),'admin'));
create policy "episodes admin write" on public.episodes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- watchlists
create table public.watchlists (
  user_id uuid not null,
  series_id uuid not null references public.series(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);
grant select, insert, delete on public.watchlists to authenticated;
grant all on public.watchlists to service_role;
alter table public.watchlists enable row level security;
create policy "own watchlist read" on public.watchlists for select to authenticated using (user_id = auth.uid());
create policy "own watchlist insert" on public.watchlists for insert to authenticated with check (user_id = auth.uid() and not public.is_suspended(auth.uid()));
create policy "own watchlist delete" on public.watchlists for delete to authenticated using (user_id = auth.uid());

create table public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  progress_seconds int not null default 0,
  duration_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, episode_id)
);
create index watch_history_user_idx on public.watch_history (user_id, updated_at desc);
grant select, insert, update, delete on public.watch_history to authenticated;
grant all on public.watch_history to service_role;
alter table public.watch_history enable row level security;
create policy "own history read" on public.watch_history for select to authenticated using (user_id = auth.uid());
create policy "own history insert" on public.watch_history for insert to authenticated with check (user_id = auth.uid() and not public.is_suspended(auth.uid()));
create policy "own history update" on public.watch_history for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own history delete" on public.watch_history for delete to authenticated using (user_id = auth.uid());

-- featured content
create table public.featured_content (
  id uuid primary key default gen_random_uuid(),
  slot text not null default 'hero',
  series_id uuid not null references public.series(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.featured_content to anon, authenticated;
grant insert, update, delete on public.featured_content to authenticated;
grant all on public.featured_content to service_role;
alter table public.featured_content enable row level security;
create policy "featured public read" on public.featured_content for select to anon, authenticated using (true);
create policy "featured admin write" on public.featured_content for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- platform settings (single row)
create table public.platform_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'درموش تي في',
  site_description text not null default 'منصة البث الأولى للمسلسلات والإنتاجات المصنوعة بالذكاء الاصطناعي.',
  seo_title text not null default 'درموش تي في — مسلسلات الذكاء الاصطناعي',
  seo_description text not null default 'شاهد مسلسلات وقصصاً أصلية وإنتاجات سينمائية مصنوعة بالذكاء الاصطناعي على درموش تي في.',
  og_image text,
  social_links jsonb not null default '{}'::jsonb,
  contact_email text,
  contact_phone text,
  section_order text[] not null default array['latest','trending','popular','recent_episodes','recommended','originals','genres'],
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (id) values (1);
grant select on public.platform_settings to anon, authenticated;
grant update on public.platform_settings to authenticated;
grant all on public.platform_settings to service_role;
alter table public.platform_settings enable row level security;
create policy "settings public read" on public.platform_settings for select to anon, authenticated using (true);
create policy "settings admin update" on public.platform_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "ann public read" on public.announcements for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "ann admin write" on public.announcements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- view events for analytics
create table public.view_events (
  id bigint generated always as identity primary key,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  user_id uuid,
  created_at timestamptz not null default now()
);
create index view_events_created_idx on public.view_events (created_at);
grant select on public.view_events to authenticated;
grant all on public.view_events to service_role;
alter table public.view_events enable row level security;
create policy "views admin read" on public.view_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.record_view(_episode_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _series uuid;
begin
  select e.series_id into _series from public.episodes e join public.series s on s.id = e.series_id
   where e.id = _episode_id and e.is_published and e.publish_at <= now() and s.is_published;
  if _series is null then return; end if;
  insert into public.view_events (episode_id, series_id, user_id) values (_episode_id, _series, auth.uid());
  update public.episodes set views = views + 1 where id = _episode_id;
  update public.series set views = views + 1 where id = _series;
end $$;
revoke all on function public.record_view(uuid) from public;
grant execute on function public.record_view(uuid) to anon, authenticated;

-- admin stats
create or replace function public.admin_daily_views(_days int default 30)
returns table(day date, views bigint) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  return query select d::date, count(v.id) from generate_series(current_date - (_days-1), current_date, interval '1 day') d
    left join public.view_events v on v.created_at::date = d::date group by d order by d;
end $$;
grant execute on function public.admin_daily_views(int) to authenticated;

-- storage policies for media bucket
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));