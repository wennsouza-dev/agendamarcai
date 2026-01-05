-- Add gallery_enabled column to professionals table
alter table professionals 
add column if not exists gallery_enabled boolean default false;
