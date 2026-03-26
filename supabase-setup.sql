
-- Table users (profil)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  created_at timestamp with time zone default now()
);

-- Table goal_data (données de l'app par utilisateur)
create table if not exists public.goal_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal text,
  streak integer default 0,
  last_active text,
  entries jsonb default '{}',
  missions jsonb default '[]',
  devoirs jsonb default '[]',
  settings jsonb default '{}',
  updated_at timestamp with time zone default now()
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.goal_data enable row level security;

-- Policies profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Policies goal_data
create policy "Users can view own data" on public.goal_data for select using (auth.uid() = user_id);
create policy "Users can insert own data" on public.goal_data for insert with check (auth.uid() = user_id);
create policy "Users can update own data" on public.goal_data for update using (auth.uid() = user_id);
create policy "Users can delete own data" on public.goal_data for delete using (auth.uid() = user_id);

-- Trigger pour creer le profil automatiquement
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
