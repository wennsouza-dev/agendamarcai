-- 1. Create the gallery bucket
-- Note: If this fails, please create a public bucket named 'gallery' manually in the Supabase Storage dashboard.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- 2. Create the table to track images
create table if not exists professional_gallery (
  id uuid default gen_random_uuid() primary key,
  professional_id uuid references professionals(id) on delete cascade not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Security (RLS)
alter table professional_gallery enable row level security;

-- 4. Access Policies (Who can do what)

-- Everyone can VIEW images
create policy "Public can view gallery images"
  on professional_gallery for select
  using (true);

-- Only the professional can UPLOAD their own images
create policy "Professionals can insert their own images"
  on professional_gallery for insert
  with check (auth.uid() in (
    select user_id from professionals where id = professional_gallery.professional_id
  ));

-- Only the professional can DELETE their own images
create policy "Professionals can delete their own images"
  on professional_gallery for delete
  using (auth.uid() in (
    select user_id from professionals where id = professional_gallery.professional_id
  ));

-- 5. Storage Policies (File access)

create policy "Public Access to Gallery"
  on storage.objects for select
  using ( bucket_id = 'gallery' );

create policy "Professionals can upload to Gallery"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery' AND
    auth.role() = 'authenticated'
  );

create policy "Professionals can delete from Gallery"
  on storage.objects for delete
  using (
    bucket_id = 'gallery' AND
    auth.role() = 'authenticated'
  );

-- 6. (Optional) Database trigger to enforce 25 image limit strictly
create or replace function check_gallery_limit()
returns trigger as $$
begin
  if (select count(*) from professional_gallery where professional_id = new.professional_id) >= 25 then
    raise exception 'Limite de 25 fotos atingido.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists enforce_gallery_limit on professional_gallery;

create trigger enforce_gallery_limit
  before insert on professional_gallery
  for each row
  execute function check_gallery_limit();
