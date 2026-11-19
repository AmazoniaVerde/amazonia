-- Libro de Reclamaciones y sugerencias de Amazonia Verde.
-- Ejecutar una vez en Supabase SQL Editor.

create table if not exists public.libro_reclamaciones (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  tipo text not null check (tipo in ('Reclamo', 'Queja', 'Sugerencia')),
  nombre text not null,
  dni text not null check (dni ~ '^[0-9]{8}$'),
  telefono text not null,
  correo text not null,
  producto_servicio text not null,
  monto numeric(10,2) check (monto is null or monto >= 0),
  detalle text not null,
  pedido_consumidor text not null,
  estado text not null default 'Recibido' check (estado in ('Recibido', 'En atención', 'Respondido')),
  respuesta text
);

alter table public.libro_reclamaciones enable row level security;
revoke all on public.libro_reclamaciones from anon, authenticated;
grant select, update on public.libro_reclamaciones to authenticated;

drop policy if exists "Solo administradores consultan reclamaciones" on public.libro_reclamaciones;
create policy "Solo administradores consultan reclamaciones"
  on public.libro_reclamaciones for select to authenticated using (true);

drop policy if exists "Solo administradores actualizan reclamaciones" on public.libro_reclamaciones;
create policy "Solo administradores actualizan reclamaciones"
  on public.libro_reclamaciones for update to authenticated using (true) with check (true);

create or replace function public.registrar_comunicacion(
  p_tipo text,
  p_nombre text,
  p_dni text,
  p_telefono text,
  p_correo text,
  p_producto_servicio text,
  p_monto numeric,
  p_detalle text,
  p_pedido_consumidor text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if p_tipo not in ('Reclamo', 'Queja', 'Sugerencia') then raise exception 'Tipo de comunicación no válido'; end if;
  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_telefono), '') = '' or coalesce(trim(p_correo), '') = '' then
    raise exception 'Completa los datos de contacto';
  end if;
  if p_dni !~ '^[0-9]{8}$' then raise exception 'El DNI debe tener 8 dígitos'; end if;
  if coalesce(trim(p_producto_servicio), '') = '' or coalesce(trim(p_detalle), '') = '' or coalesce(trim(p_pedido_consumidor), '') = '' then
    raise exception 'Completa el detalle y el pedido concreto';
  end if;

  insert into public.libro_reclamaciones
    (tipo, nombre, dni, telefono, correo, producto_servicio, monto, detalle, pedido_consumidor)
  values
    (p_tipo, trim(p_nombre), p_dni, trim(p_telefono), trim(p_correo), trim(p_producto_servicio), p_monto, trim(p_detalle), trim(p_pedido_consumidor))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.registrar_comunicacion(text, text, text, text, text, text, numeric, text, text) from public;
grant execute on function public.registrar_comunicacion(text, text, text, text, text, text, numeric, text, text) to anon, authenticated;
