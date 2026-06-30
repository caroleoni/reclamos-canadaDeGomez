-- Reclamos Canada de Gomez - Demo data reset
-- Deletes operational claim data only. Categories and emergency numbers are preserved.

begin;

delete from public.reclamo_respuestas;
delete from public.reclamo_fotos;
delete from public.reclamos;

alter sequence public.reclamo_numero_seq restart with 100;

commit;
