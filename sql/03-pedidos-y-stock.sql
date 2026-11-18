-- Ejecutar una sola vez en Supabase.
-- Registra el pedido y descuenta el stock en una sola transacción.
create or replace function public.crear_pedido(
  p_nombre_cliente text,
  p_total numeric,
  p_items jsonb,
  p_estado text default 'Pendiente'
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
  v_cantidad integer;
begin
  if coalesce(trim(p_nombre_cliente), '') = '' then
    raise exception 'El nombre del cliente es obligatorio';
  end if;

  insert into public.pedidos (nombre_cliente, total, items, estado)
  values (trim(p_nombre_cliente), greatest(coalesce(p_total, 0), 0), coalesce(p_items, '[]'::jsonb), coalesce(p_estado, 'Pendiente'))
  returning id into v_pedido_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    v_id := (v_item->>'id')::bigint;
    v_cantidad := greatest(coalesce((v_item->>'cantidad')::integer, 1), 1);

    update public.variedades
       set stock = stock - v_cantidad
     where id = v_id
       and stock >= v_cantidad;

    if not found then
      raise exception 'Stock insuficiente para el producto %', v_id;
    end if;
  end loop;

  return v_pedido_id;
end;
$$;

revoke all on function public.crear_pedido(text, numeric, jsonb, text) from public;
grant execute on function public.crear_pedido(text, numeric, jsonb, text) to anon, authenticated;
