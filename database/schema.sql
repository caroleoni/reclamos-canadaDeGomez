-- Reclamos Canada de Gomez - Supabase schema
-- Run this file before policies.sql, storage.sql and seed.sql.

create extension if not exists "pgcrypto";

do $$
begin
    if not exists (select 1 from pg_type where typname = 'claim_status') then
        create type public.claim_status as enum ('pendiente', 'resuelto');
    end if;

    if not exists (select 1 from pg_type where typname = 'claim_priority') then
        create type public.claim_priority as enum ('baja', 'media', 'alta');
    end if;
end $$;

create sequence if not exists public.reclamo_numero_seq
    start with 100
    increment by 1
    minvalue 100
    no maxvalue
    cache 1;

create table if not exists public.categorias (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    slug text not null unique,
    icono text not null default 'otros.jpeg',
    color text,
    orden integer not null default 0,
    activa boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.reclamos (
    id uuid primary key default gen_random_uuid(),
    numero_reclamo text not null unique,
    categoria_id uuid not null references public.categorias(id) on update cascade on delete restrict,
    descripcion text not null,
    estado public.claim_status not null default 'pendiente',
    prioridad public.claim_priority not null default 'media',
    visto boolean not null default false,
    nombre_reclamante text not null,
    apellido_reclamante text not null,
    dni_reclamante text,
    telefono_reclamante text not null,
    email_reclamante text,
    domicilio_reclamante text,
    domicilio_reclamo text,
    barrio_zona text,
    latitud numeric(10, 7) not null,
    longitud numeric(10, 7) not null,
    notas_internas text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.reclamo_fotos (
    id uuid primary key default gen_random_uuid(),
    reclamo_id uuid not null references public.reclamos(id) on update cascade on delete cascade,
    storage_path text not null unique,
    public_url text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.reclamo_respuestas (
    id uuid primary key default gen_random_uuid(),
    reclamo_id uuid not null references public.reclamos(id) on update cascade on delete cascade,
    respuesta text not null,
    created_by uuid references auth.users(id) on update cascade on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists public.emergency_numbers (
    id uuid primary key default gen_random_uuid(),
    label text not null unique,
    phone text not null,
    order_index integer not null default 0,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_categorias_active_order on public.categorias(activa, orden);
create index if not exists idx_reclamos_categoria_id on public.reclamos(categoria_id);
create index if not exists idx_reclamos_estado on public.reclamos(estado);
create index if not exists idx_reclamos_created_at on public.reclamos(created_at desc);
create index if not exists idx_reclamo_fotos_reclamo_id on public.reclamo_fotos(reclamo_id);
create index if not exists idx_reclamo_respuestas_reclamo_id on public.reclamo_respuestas(reclamo_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.set_reclamo_number()
returns trigger
language plpgsql
as $$
begin
    if new.numero_reclamo is null or new.numero_reclamo = '' then
        new.numero_reclamo = 'REC' || nextval('public.reclamo_numero_seq')::text;
    end if;

    return new;
end;
$$;

drop trigger if exists set_categorias_updated_at on public.categorias;
create trigger set_categorias_updated_at
before update on public.categorias
for each row
execute function public.set_updated_at();

drop trigger if exists set_reclamos_updated_at on public.reclamos;
create trigger set_reclamos_updated_at
before update on public.reclamos
for each row
execute function public.set_updated_at();

drop trigger if exists set_reclamo_number_before_insert on public.reclamos;
create trigger set_reclamo_number_before_insert
before insert on public.reclamos
for each row
execute function public.set_reclamo_number();

drop trigger if exists set_emergency_numbers_updated_at on public.emergency_numbers;
create trigger set_emergency_numbers_updated_at
before update on public.emergency_numbers
for each row
execute function public.set_updated_at();

create or replace function public.crear_reclamo_publico(
    _nombre_reclamante text,
    _apellido_reclamante text,
    _dni_reclamante text,
    _telefono_reclamante text,
    _email_reclamante text,
    _domicilio_reclamante text,
    _categoria_id uuid,
    _descripcion text,
    _domicilio_reclamo text,
    _barrio_zona text,
    _latitud numeric,
    _longitud numeric
)
returns setof public.reclamos
language plpgsql
security definer
set search_path = public
as $$
declare
    inserted_claim public.reclamos;
begin
    insert into public.reclamos (
        nombre_reclamante,
        apellido_reclamante,
        dni_reclamante,
        telefono_reclamante,
        email_reclamante,
        domicilio_reclamante,
        categoria_id,
        descripcion,
        domicilio_reclamo,
        barrio_zona,
        latitud,
        longitud
    )
    values (
        nullif(trim(_nombre_reclamante), ''),
        nullif(trim(_apellido_reclamante), ''),
        nullif(trim(_dni_reclamante), ''),
        nullif(trim(_telefono_reclamante), ''),
        nullif(trim(_email_reclamante), ''),
        nullif(trim(_domicilio_reclamante), ''),
        _categoria_id,
        nullif(trim(_descripcion), ''),
        nullif(trim(_domicilio_reclamo), ''),
        nullif(trim(_barrio_zona), ''),
        _latitud,
        _longitud
    )
    returning * into inserted_claim;

    return next inserted_claim;
end;
$$;

create or replace function public.obtener_reclamos_mapa_publico()
returns table (
    id uuid,
    numero_reclamo text,
    latitud numeric,
    longitud numeric,
    categoria_nombre text,
    categoria_slug text,
    categoria_icono text,
    descripcion text,
    foto_url text,
    created_at timestamptz,
    estado public.claim_status,
    prioridad public.claim_priority,
    barrio_zona text,
    domicilio_reclamo text
)
language sql
stable
security definer
set search_path = public
as $$
    select
        r.id,
        r.numero_reclamo,
        r.latitud,
        r.longitud,
        c.nombre as categoria_nombre,
        c.slug as categoria_slug,
        c.icono as categoria_icono,
        r.descripcion,
        f.public_url as foto_url,
        r.created_at,
        r.estado,
        r.prioridad,
        r.barrio_zona,
        r.domicilio_reclamo
    from public.reclamos r
    join public.categorias c on c.id = r.categoria_id
    left join lateral (
        select public_url
        from public.reclamo_fotos rf
        where rf.reclamo_id = r.id
        order by rf.created_at asc
        limit 1
    ) f on true
    where r.latitud is not null
      and r.longitud is not null
    order by r.created_at desc;
$$;

create or replace function public.buscar_reclamo_por_numero(p_numero text)
returns table (
    id uuid,
    numero_reclamo text,
    categoria_nombre text,
    estado public.claim_status,
    descripcion text,
    domicilio_reclamo text,
    barrio_zona text,
    notas_internas text,
    foto_url text,
    created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    select
        r.id,
        r.numero_reclamo,
        c.nombre as categoria_nombre,
        r.estado,
        r.descripcion,
        r.domicilio_reclamo,
        r.barrio_zona,
        r.notas_internas,
        f.public_url as foto_url,
        r.created_at
    from public.reclamos r
    join public.categorias c on c.id = r.categoria_id
    left join lateral (
        select public_url
        from public.reclamo_fotos rf
        where rf.reclamo_id = r.id
        order by rf.created_at asc
        limit 1
    ) f on true
    where upper(r.numero_reclamo) = upper(trim(p_numero))
    limit 1;
$$;

create or replace function public.actualizar_gestion_reclamo_admin(
    p_reclamo_id uuid,
    p_estado public.claim_status,
    p_notas_internas text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'Authentication required';
    end if;

    update public.reclamos
    set
        estado = p_estado,
        notas_internas = nullif(trim(p_notas_internas), '')
    where id = p_reclamo_id;
end;
$$;

create or replace function public.marcar_reclamo_visto(p_reclamo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'Authentication required';
    end if;

    update public.reclamos
    set visto = true
    where id = p_reclamo_id;
end;
$$;
