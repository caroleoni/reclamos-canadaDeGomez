-- Reclamos Canada de Gomez - Row Level Security and grants
-- Run after schema.sql.

alter table public.categorias enable row level security;
alter table public.reclamos enable row level security;
alter table public.reclamo_fotos enable row level security;
alter table public.reclamo_respuestas enable row level security;
alter table public.emergency_numbers enable row level security;

grant usage on schema public to anon, authenticated;
grant usage, select on sequence public.reclamo_numero_seq to authenticated;

grant select on public.categorias to anon, authenticated;
grant select on public.emergency_numbers to anon, authenticated;
grant select on public.reclamos to authenticated;
grant update on public.reclamos to authenticated;
grant select, insert on public.reclamo_fotos to anon, authenticated;
grant select, insert, update, delete on public.reclamo_respuestas to authenticated;

grant execute on function public.crear_reclamo_publico(
    text, text, text, text, text, text, uuid, text, text, text, numeric, numeric
) to anon, authenticated;
grant execute on function public.obtener_reclamos_mapa_publico() to anon, authenticated;
grant execute on function public.buscar_reclamo_por_numero(text) to anon, authenticated;
grant execute on function public.actualizar_gestion_reclamo_admin(uuid, public.claim_status, text) to authenticated;
grant execute on function public.marcar_reclamo_visto(uuid) to authenticated;

drop policy if exists "Public can read active categories" on public.categorias;
create policy "Public can read active categories"
on public.categorias
for select
to anon, authenticated
using (activa = true);

drop policy if exists "Authenticated users can manage categories" on public.categorias;
create policy "Authenticated users can manage categories"
on public.categorias
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can read claims" on public.reclamos;
create policy "Authenticated users can read claims"
on public.reclamos
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update claim management fields" on public.reclamos;
create policy "Authenticated users can update claim management fields"
on public.reclamos
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Public can insert claim photos metadata" on public.reclamo_fotos;
create policy "Public can insert claim photos metadata"
on public.reclamo_fotos
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read claim photos metadata" on public.reclamo_fotos;
create policy "Public can read claim photos metadata"
on public.reclamo_fotos
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can manage claim responses" on public.reclamo_respuestas;
create policy "Authenticated users can manage claim responses"
on public.reclamo_respuestas
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read active emergency numbers" on public.emergency_numbers;
create policy "Public can read active emergency numbers"
on public.emergency_numbers
for select
to anon, authenticated
using (active = true);

drop policy if exists "Authenticated users can manage emergency numbers" on public.emergency_numbers;
create policy "Authenticated users can manage emergency numbers"
on public.emergency_numbers
for all
to authenticated
using (true)
with check (true);
