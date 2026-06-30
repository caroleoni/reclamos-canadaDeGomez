-- Reclamos Canada de Gomez - Supabase Storage
-- Run after schema.sql. The bucket is public because the app renders uploaded photos by URL.

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'reclamos-fotos',
    'reclamos-fotos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read claim photos" on storage.objects;
create policy "Public can read claim photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'reclamos-fotos');

drop policy if exists "Public can upload claim photos" on storage.objects;
create policy "Public can upload claim photos"
on storage.objects
for insert
to anon, authenticated
with check (
    bucket_id = 'reclamos-fotos'
    and lower((storage.foldername(name))[1]) <> ''
);

drop policy if exists "Authenticated users can update claim photos" on storage.objects;
create policy "Authenticated users can update claim photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'reclamos-fotos')
with check (bucket_id = 'reclamos-fotos');

drop policy if exists "Authenticated users can delete claim photos" on storage.objects;
create policy "Authenticated users can delete claim photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'reclamos-fotos');
