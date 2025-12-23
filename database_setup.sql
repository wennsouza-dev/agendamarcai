-- Create tables for the MarcAI Agenda Application

-- 1. Create Professionals Table
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text,
  email text,
  mobile text,
  photo text,
  specialty text,
  bio text,
  services jsonb default '[]'::jsonb,
  working_hours jsonb default '[]'::jsonb,
  special_dates jsonb default '[]'::jsonb,
  whatsapp text,
  address text,
  image_url text, -- For profile photo
  expire_days integer default -1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ... rest of the tables ...

-- 6. Storage Setup
-- Run these as a separate migration or in the SQL editor:
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);
*/




-- 3. Create Appointments Table
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals(id),
  client_id uuid references public.clients(id),
  client_name text, -- Denormalized for valid display even if client record is deleted
  service text,
  date timestamp with time zone,
  status text default 'pending', -- pending, confirmed, cancelled, completed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS) - Optional for now but recommended
alter table public.professionals enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;

-- Policy: Professionals can view/edit their own data
create policy "Professionals can view own data" on public.professionals
  for select using (auth.uid() = user_id);

create policy "Professionals can update own data" on public.professionals
  for update using (auth.uid() = user_id);

-- Policy: Allow public read of professionals (for client search)
create policy "Public can view professionals" on public.professionals
  for select using (true);

-- 5. Trigger to automatically create a professional record on signup
-- This is critical for the "keeping users logged in" logic
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.professionals (user_id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
