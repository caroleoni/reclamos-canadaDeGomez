-- Reclamos Canada de Gomez - Initial catalog data
-- This file intentionally does not create test claims.

insert into public.categorias (nombre, slug, icono, color, orden, activa)
values
    ('Agua', 'agua', 'agua.jpeg', '#0ea5e9', 10, true),
    ('Alumbrado', 'alumbrado', 'alumbrado.jpeg', '#facc15', 20, true),
    ('Baches', 'baches', 'calles.jpeg', '#f97316', 30, true),
    ('Cloacas', 'cloacas', 'cloacas.jpeg', '#64748b', 40, true),
    ('Arbolado', 'arbolado', 'arbolado.jpeg', '#16a34a', 50, true),
    ('Calles', 'calles', 'calles.jpeg', '#6b7280', 60, true),
    ('Columnas/Cableados', 'columnas-cableados', 'columnas-cableados.jpeg', '#2563eb', 70, true),
    ('Comercios/Industrias', 'comercios-industrias', 'inmuebles.jpeg', '#475569', 80, true),
    ('Yuyos', 'yuyos', 'yuyos.jpeg', '#65a30d', 90, true),
    ('Inmuebles', 'inmuebles', 'inmuebles.jpeg', '#334155', 100, true),
    ('Contaminación', 'contaminacion', 'otros.jpeg', '#7c3aed', 110, true),
    ('Educación', 'educacion', 'otros.jpeg', '#0284c7', 120, true),
    ('Gas', 'gas', 'otros.jpeg', '#dc2626', 130, true),
    ('Luz', 'luz', 'alumbrado.jpeg', '#eab308', 140, true),
    ('Parques/Plazas', 'parques-plazas', 'parques-plazas.jpeg', '#22c55e', 150, true),
    ('Residuos', 'residuos', 'residuos.jpeg', '#15803d', 160, true),
    ('Salud', 'salud', 'otros.jpeg', '#ef4444', 170, true),
    ('Trámites Municipales', 'tramites-municipales', 'otros.jpeg', '#0891b2', 180, true),
    ('Transporte/Tránsito', 'transporte-transito', 'otros.jpeg', '#1d4ed8', 190, true),
    ('Veredas', 'veredas', 'calles.jpeg', '#78716c', 200, true),
    ('Otros', 'otros', 'otros.jpeg', '#6b7280', 210, true)
on conflict (slug) do update
set
    nombre = excluded.nombre,
    icono = excluded.icono,
    color = excluded.color,
    orden = excluded.orden,
    activa = excluded.activa,
    updated_at = now();

insert into public.emergency_numbers (label, phone, order_index, active)
values
    ('Emergencias', '911', 10, true),
    ('Bomberos', '100', 20, true),
    ('Salud', '107', 30, true),
    ('Policía', '101', 40, true)
on conflict (label) do update
set
    phone = excluded.phone,
    order_index = excluded.order_index,
    active = excluded.active,
    updated_at = now();
