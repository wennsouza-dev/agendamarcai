-- Create expenses table for financial tracking
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  professional_id uuid references public.professionals(id) on delete cascade not null,
  description text not null,
  category text,
  amount numeric not null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.expenses enable row level security;

-- Create policies
create policy "Professionals can view their own expenses"
  on public.expenses for select
  using (auth.uid() in (
    select user_id from public.professionals where id = professional_id
  ));

create policy "Professionals can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() in (
    select user_id from public.professionals where id = professional_id
  ));

create policy "Professionals can update their own expenses"
  on public.expenses for update
  using (auth.uid() in (
    select user_id from public.professionals where id = professional_id
  ));

create policy "Professionals can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() in (
    select user_id from public.professionals where id = professional_id
  ));
