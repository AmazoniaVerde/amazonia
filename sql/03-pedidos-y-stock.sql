-- Ejecutar una sola vez en Supabase.
-- Registra el pedido y descuenta el stock en una sola transacción.
create or replace function public.crear_pedido(
  p_nombre_cliente text,
  p_total numeric,
  p_items jsonb,
  p_estado text default 'Pendiente',
  p_datos jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido_id bigint;
  v_item jsonb;
  v_id bigint;
  v_presentacion_id bigint;
  v_cantidad integer;
begin
  if coalesce(trim(p_nombre_cliente), '') = '' then
    raise exception 'El nombre del cliente es obligatorio';
  end if;

  insert into public.pedidos (nombre_cliente, total, items, estado)
  values (
    trim(p_nombre_cliente),
    greatest(coalesce(p_total, 0), 0),
    jsonb_build_object(
      'productos', coalesce(p_items, '[]'::jsonb),
      'cliente', coalesce(p_datos, '{}'::jsonb)
    ),
    coalesce(p_estado, 'Pendiente')
  )
  returning id into v_pedido_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    v_id := (v_item->>'id')::bigint;
    v_presentacion_id := nullif(v_item->>'presentacion_id', '')::bigint;
    v_cantidad := greatest(coalesce((v_item->>'cantidad')::integer, 1), 1);

    if v_presentacion_id is not null then
      update public.presentaciones
         set stock = stock - v_cantidad
       where id = v_presentacion_id
         and stock >= v_cantidad;
    else
      update public.variedades
         set stock = stock - v_cantidad
       where id = v_id
         and stock >= v_cantidad;
    end if;

    if not found then
      raise exception 'Stock insuficiente para el producto %', v_id;
    end if;
  end loop;

  return v_pedido_id;
end;
$$;

revoke all on function public.crear_pedido(text, numeric, jsonb, text, jsonb) from public;
grant execute on function public.crear_pedido(text, numeric, jsonb, text, jsonb) to anon, authenticated;
