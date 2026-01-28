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

-- 2. Create Clients Table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text,
  email text,
  mobile text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Appointments Table
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals(id),
  client_id uuid references public.clients(id), -- Can be null for guest bookings
  service_name text, -- Changed from 'service' to 'service_name' to match usage
  date text, -- Changed to text to match usage (YYYY-MM-DD or DD/MM/YYYY) or keep as date but handle conversion
  time text,
  status text default 'pending', -- pending, confirmed, cancelled, completed
  client_name text, -- Denormalized
  client_whatsapp text, -- Denormalized, added based on usage
  price numeric, -- Snapshot of service price at booking/completion time
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Reviews Table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals(id),
  client_name text,
  rating integer,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS)
alter table public.professionals enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.reviews enable row level security;

-- Policy: Professionals can view/edit their own data
create policy "Professionals can view own data" on public.professionals
  for select using (auth.uid() = user_id);

create policy "Professionals can update own data" on public.professionals
  for update using (auth.uid() = user_id);

-- Policy: Allow public read of professionals (for client search)
create policy "Public can view professionals" on public.professionals
  for select using (true);

-- Policy: Public/Anon can insert appointments (for guest booking)
create policy "Public can insert appointments" on public.appointments
  for insert with check (true);

create policy "Professionals can view their appointments" on public.appointments
  for select using (auth.uid() in (select user_id from public.professionals where id = professional_id));
  
create policy "Public can view reviews" on public.reviews
  for select using (true);

-- 6. Trigger to automatically create a professional record on signup
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
