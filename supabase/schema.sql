-- Tabelle für Nutzerprofile (wird mit Auth verknüpft)
-- In Supabase Dashboard: SQL Editor → New query → einfügen und ausführen

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Row Level Security: Nutzer können nur ihr eigenes Profil lesen/aktualisieren
alter table public.profiles enable row level security;

create policy "Nutzer können eigenes Profil lesen"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Nutzer können eigenes Profil anlegen"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Nutzer können eigenes Profil aktualisieren"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: updated_at setzen
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
