-- ============================================================================
-- Surco — esquema Postgres/Supabase
-- Migrado desde daw-20260601-1407.sql (MariaDB, proyecto universitario)
-- Ejecutar completo en el SQL Editor de Supabase (proyecto nuevo, vacío).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------------

create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  slug text not null unique,
  descripcion text not null
);

create table if not exists public.estados (
  id bigint generated always as identity primary key,
  descripcion text not null unique
);

create table if not exists public.productos (
  id bigint generated always as identity primary key,
  nombre text not null,
  autor text not null,
  descripcion text default '',
  precio numeric(8, 2) not null default 0 check (precio >= 0),
  existencias integer not null default 0 check (existencias >= 0),
  imagen text not null,
  categoria_id bigint not null references public.categorias (id),
  creado_en timestamptz not null default now()
);

-- Perfil de cada usuario autenticado (1:1 con auth.users). Reemplaza la
-- tabla `usuarios` original; la contraseña ahora la gestiona Supabase Auth.
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  usuario text unique,
  nombre text not null default '',
  apellidos text not null default '',
  domicilio text not null default '',
  poblacion text not null default '',
  provincia text not null default '',
  cp text not null default '',
  telefono text not null default '',
  admin boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists public.pedidos (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfiles (id),
  fecha timestamptz not null default now(),
  importe numeric(8, 2) not null default 0,
  estado_id bigint not null references public.estados (id),
  -- Dirección de envío congelada en el momento del pedido (el original NO
  -- guardaba esto y siempre miraba el perfil actual; lo corregimos aquí).
  direccion_envio jsonb not null default '{}'::jsonb
);

create table if not exists public.detalle (
  pedido_id bigint not null references public.pedidos (id) on delete cascade,
  producto_id bigint not null references public.productos (id),
  unidades integer not null default 1 check (unidades > 0),
  precio_unitario numeric(8, 2) not null default 0,
  primary key (pedido_id, producto_id)
);

create table if not exists public.contacto (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfiles (id),
  mensaje text not null,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. FUNCIONES DE APOYO
-- ---------------------------------------------------------------------------

-- Evita la recursión de RLS al comprobar el rol admin dentro de las propias
-- policies de "perfiles".
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select admin from public.perfiles where id = auth.uid()),
    false
  );
$$;

-- Crea automáticamente el perfil al registrarse (los datos del formulario
-- de registro viajan en auth.users.raw_user_meta_data).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (
    id, usuario, nombre, apellidos, domicilio, poblacion, provincia, cp, telefono
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'usuario', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellidos', ''),
    coalesce(new.raw_user_meta_data ->> 'domicilio', ''),
    coalesce(new.raw_user_meta_data ->> 'poblacion', ''),
    coalesce(new.raw_user_meta_data ->> 'provincia', ''),
    coalesce(new.raw_user_meta_data ->> 'cp', ''),
    coalesce(new.raw_user_meta_data ->> 'telefono', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. RPC: crear pedido (atómico — reemplaza ProcesarPedido + TramitarPedido)
-- ---------------------------------------------------------------------------
-- items: [{"producto_id": 1, "unidades": 2}, ...]
-- direccion: {"nombre":"","apellidos":"","domicilio":"","poblacion":"","provincia":"","cp":"","telefono":"","metodo_pago":"tarjeta|transferencia"}
create or replace function public.crear_pedido(items jsonb, direccion jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_item record;
  v_stock integer;
  v_cantidad integer;
  v_precio numeric(8,2);
  v_nombre text;
  v_total numeric(8,2) := 0;
  v_pedido_id bigint;
  v_lineas jsonb := '[]'::jsonb;
begin
  if v_usuario is null then
    raise exception 'Debés iniciar sesión para completar un pedido';
  end if;

  -- Bloquea cada fila de producto implicada para evitar condiciones de
  -- carrera si dos personas compran el último stock a la vez.
  for v_item in select * from jsonb_to_recordset(items) as x(producto_id bigint, unidades integer)
  loop
    select existencias, precio, nombre into v_stock, v_precio, v_nombre
    from public.productos where id = v_item.producto_id
    for update;

    if v_stock is null then
      continue; -- producto inexistente, se ignora
    end if;

    v_cantidad := least(v_item.unidades, v_stock);
    if v_cantidad <= 0 then
      continue;
    end if;

    v_lineas := v_lineas || jsonb_build_object(
      'producto_id', v_item.producto_id,
      'unidades', v_cantidad,
      'precio_unitario', v_precio
    );
    v_total := v_total + (v_precio * v_cantidad);
  end loop;

  if jsonb_array_length(v_lineas) = 0 then
    raise exception 'No hay stock disponible para los productos del carrito';
  end if;

  insert into public.pedidos (usuario_id, importe, estado_id, direccion_envio)
  values (v_usuario, v_total, (select id from public.estados where descripcion = 'Pendiente'), direccion)
  returning id into v_pedido_id;

  insert into public.detalle (pedido_id, producto_id, unidades, precio_unitario)
  select v_pedido_id, (l ->> 'producto_id')::bigint, (l ->> 'unidades')::integer, (l ->> 'precio_unitario')::numeric
  from jsonb_array_elements(v_lineas) as l;

  update public.productos p
  set existencias = existencias - (l ->> 'unidades')::integer
  from jsonb_array_elements(v_lineas) as l
  where p.id = (l ->> 'producto_id')::bigint;

  return v_pedido_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. RPC: cancelar pedido (usuario dueño, o admin)
-- ---------------------------------------------------------------------------
create or replace function public.cancelar_pedido(p_pedido_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_estado_actual text;
  v_pendiente_id bigint;
  v_cancelado_id bigint;
begin
  select usuario_id into v_owner from public.pedidos where id = p_pedido_id;
  if v_owner is null then
    raise exception 'Pedido no encontrado';
  end if;
  if v_owner <> auth.uid() and not public.is_admin() then
    raise exception 'No tenés permiso para cancelar este pedido';
  end if;

  select id into v_pendiente_id from public.estados where descripcion = 'Pendiente';
  select id into v_cancelado_id from public.estados where descripcion = 'Cancelado';

  update public.pedidos set estado_id = v_cancelado_id
  where id = p_pedido_id and estado_id = v_pendiente_id;

  if not found then
    raise exception 'Solo se pueden cancelar pedidos en estado Pendiente';
  end if;

  update public.productos p
  set existencias = existencias + d.unidades
  from public.detalle d
  where d.pedido_id = p_pedido_id and d.producto_id = p.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. RPC admin: cambiar estado de un pedido (con la lógica de stock del
--    panel PHP original: al cancelar se repone stock, al reactivar desde
--    Cancelado se vuelve a descontar si hay stock suficiente).
-- ---------------------------------------------------------------------------
create or replace function public.admin_actualizar_estado_pedido(p_pedido_id bigint, p_nuevo_estado_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado_actual bigint;
  v_cancelado_id bigint;
  v_faltante record;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el estado de un pedido';
  end if;

  select id into v_cancelado_id from public.estados where descripcion = 'Cancelado';
  select estado_id into v_estado_actual from public.pedidos where id = p_pedido_id;
  if v_estado_actual is null then
    raise exception 'Pedido no encontrado';
  end if;
  if v_estado_actual = p_nuevo_estado_id then
    return;
  end if;

  -- Reactivar desde Cancelado: verificar stock suficiente antes de tocar nada.
  if v_estado_actual = v_cancelado_id and p_nuevo_estado_id <> v_cancelado_id then
    for v_faltante in
      select p.nombre, p.existencias, d.unidades
      from public.detalle d join public.productos p on p.id = d.producto_id
      where d.pedido_id = p_pedido_id and p.existencias < d.unidades
    loop
      raise exception 'Stock insuficiente para "%": disponible %, necesario %',
        v_faltante.nombre, v_faltante.existencias, v_faltante.unidades;
    end loop;

    update public.productos p
    set existencias = existencias - d.unidades
    from public.detalle d
    where d.pedido_id = p_pedido_id and d.producto_id = p.id;
  end if;

  -- Pasar a Cancelado: reponer stock.
  if p_nuevo_estado_id = v_cancelado_id and v_estado_actual <> v_cancelado_id then
    update public.productos p
    set existencias = existencias + d.unidades
    from public.detalle d
    where d.pedido_id = p_pedido_id and d.producto_id = p.id;
  end if;

  update public.pedidos set estado_id = p_nuevo_estado_id where id = p_pedido_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------------

alter table public.categorias enable row level security;
alter table public.estados enable row level security;
alter table public.productos enable row level security;
alter table public.perfiles enable row level security;
alter table public.pedidos enable row level security;
alter table public.detalle enable row level security;
alter table public.contacto enable row level security;

-- Catálogo: lectura pública, escritura solo admin.
create policy "categorias_select_publica" on public.categorias for select using (true);
create policy "categorias_admin_escribe" on public.categorias for all using (public.is_admin()) with check (public.is_admin());

create policy "estados_select_publica" on public.estados for select using (true);
create policy "estados_admin_escribe" on public.estados for all using (public.is_admin()) with check (public.is_admin());

create policy "productos_select_publica" on public.productos for select using (true);
create policy "productos_admin_escribe" on public.productos for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles: cada quien ve/edita el suyo; admin ve y edita todos.
create policy "perfiles_select_propio_o_admin" on public.perfiles
  for select using (id = auth.uid() or public.is_admin());
create policy "perfiles_update_propio" on public.perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "perfiles_admin_update" on public.perfiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Pedidos: el dueño ve los suyos; admin ve todos. La creación/cambio de
-- estado pasa siempre por las funciones RPC (security definer) de arriba,
-- así que no se permite insert/update directo desde el cliente.
create policy "pedidos_select_propio_o_admin" on public.pedidos
  for select using (usuario_id = auth.uid() or public.is_admin());

-- Detalle: visible si el pedido es propio o si sos admin.
create policy "detalle_select_propio_o_admin" on public.detalle
  for select using (
    public.is_admin() or exists (
      select 1 from public.pedidos p
      where p.id = detalle.pedido_id and p.usuario_id = auth.uid()
    )
  );

-- Contacto: cualquier usuario autenticado puede crear el suyo y ver los
-- propios; admin ve todos.
create policy "contacto_insert_propio" on public.contacto
  for insert with check (usuario_id = auth.uid());
create policy "contacto_select_propio_o_admin" on public.contacto
  for select using (usuario_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- 6.1 Permisos de las RPC
-- ---------------------------------------------------------------------------
-- handle_new_user es solo para el trigger, nunca se debe invocar por RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Las funciones de pedidos requieren sesión iniciada (auth.uid() no nulo);
-- se revoca a "anon" para que ni siquiera puedan intentarlo.
revoke execute on function public.crear_pedido(jsonb, jsonb) from anon;
revoke execute on function public.cancelar_pedido(bigint) from anon;
revoke execute on function public.admin_actualizar_estado_pedido(bigint, bigint) from anon;

grant execute on function public.crear_pedido(jsonb, jsonb) to authenticated;
grant execute on function public.cancelar_pedido(bigint) to authenticated;
grant execute on function public.admin_actualizar_estado_pedido(bigint, bigint) to authenticated;

-- Nota: el linter de seguridad de Supabase sigue marcando crear_pedido,
-- cancelar_pedido, admin_actualizar_estado_pedido e is_admin como
-- SECURITY DEFINER invocables por "authenticated" (y is_admin también por
-- "anon", ya que las policies RLS lo llaman internamente). Es intencional:
-- cada una valida auth.uid()/is_admin() puertas adentro antes de tocar
-- datos, que es justamente para lo que están pensadas.

-- ---------------------------------------------------------------------------
-- 7. SEED — catálogo (estados, categorías, productos)
-- ---------------------------------------------------------------------------

insert into public.estados (descripcion) values
  ('Pendiente'), ('Enviado'), ('Entregado'), ('Cancelado')
on conflict (descripcion) do nothing;

insert into public.categorias (slug, descripcion) values
  ('indie-rock', 'Indie Rock'),
  ('electronica', 'Electrónica'),
  ('soul-jazz', 'Soul & Jazz')
on conflict (slug) do nothing;

insert into public.productos (nombre, autor, descripcion, precio, existencias, imagen, categoria_id)
select v.nombre, v.autor, v.descripcion, v.precio, v.existencias, v.imagen, c.id
from (values
  ('Marea Baja', 'Los Cometas Pálidos', 'Segundo LP grabado en una casa junto al mar.', 25.00, 8, '/img/covers/marea-baja.jpg', 'indie-rock'),
  ('Vidrio', 'Aurora Seca', 'Synth-pop introspectivo grabado en Bergen.', 22.00, 10, '/img/covers/vidrio.jpg', 'electronica'),
  ('Humo de Domingo', 'Cigarra Roja', 'Soul contemporáneo con vientos en vivo.', 28.00, 6, '/img/covers/humo-de-domingo.jpg', 'soul-jazz'),
  ('Satélite Doméstico', 'Fósforo', 'Rock lo-fi grabado en un garaje de Valencia.', 20.00, 12, '/img/covers/satelite-domestico.jpg', 'indie-rock'),
  ('Nocturama Vol. 2', 'DJ Ceniza', 'Techno melódico para noches largas.', 24.00, 9, '/img/covers/nocturama-vol-2.jpg', 'electronica'),
  ('Tinta y Sal', 'Marola', 'Jazz vocal con influencias mediterráneas.', 30.00, 5, '/img/covers/tinta-y-sal.jpg', 'soul-jazz'),
  ('Kilómetro Cero', 'Los Cometas Pálidos', 'EP conceptual sobre volver a casa.', 18.00, 14, '/img/covers/kilometro-cero.jpg', 'indie-rock'),
  ('Campo Magnético', 'Aurora Seca', 'Ambient/IDM grabado con sintetizadores modulares.', 26.00, 7, '/img/covers/campo-magnetico.jpg', 'electronica'),
  ('Bajo Fondo', 'Río Tinto Trío', 'Trío de jazz instrumental, grabación en directo.', 32.00, 4, '/img/covers/bajo-fondo.jpg', 'soul-jazz'),
  ('Antenas', 'Fósforo', 'Segundo álbum, sonido más pulido.', 23.00, 11, '/img/covers/antenas.jpg', 'indie-rock'),
  ('Fricción', 'Circuito Norte', 'Electro-pop bailable con letras en español.', 21.00, 15, '/img/covers/friccion.jpg', 'electronica'),
  ('Aguas Quietas', 'Marola', 'Balada y bossa, colaboración con Río Tinto Trío.', 29.00, 6, '/img/covers/aguas-quietas.jpg', 'soul-jazz'),
  ('Cinta Adhesiva', 'Los Cometas Pálidos', 'Grandes éxitos + inéditos, edición limitada.', 35.00, 3, '/img/covers/cinta-adhesiva.jpg', 'indie-rock'),
  ('Paralelo 40', 'DJ Ceniza', 'House minimalista, mezcla continua.', 24.00, 10, '/img/covers/paralelo-40.jpg', 'electronica'),
  ('Sombra Larga', 'Cigarra Roja', 'Neo-soul, producción con caja de ritmos analógica.', 27.00, 8, '/img/covers/sombra-larga.jpg', 'soul-jazz'),
  ('Radiofrecuencia', 'Circuito Norte', 'Debut, sintetizadores y voz procesada.', 19.00, 13, '/img/covers/radiofrecuencia.jpg', 'electronica'),
  ('Ceniza y Vidrio', 'Fósforo', 'Colaboración con Aurora Seca, cruce rock/electrónica.', 25.00, 9, '/img/covers/ceniza-y-vidrio.jpg', 'indie-rock'),
  ('Bitácora', 'Río Tinto Trío', 'Jazz de cámara, cuerdas y piano.', 33.00, 5, '/img/covers/bitacora.jpg', 'soul-jazz'),
  ('Litoral', 'Marola', 'Debut, grabado en Bergen durante un intercambio.', 26.00, 10, '/img/covers/litoral.jpg', 'soul-jazz'),
  ('Interferencia', 'DJ Ceniza & Circuito Norte', 'Split LP, dos caras, dos productores.', 22.00, 12, '/img/covers/interferencia.jpg', 'electronica')
) as v(nombre, autor, descripcion, precio, existencias, imagen, categoria_slug)
join public.categorias c on c.slug = v.categoria_slug
where not exists (select 1 from public.productos p where p.nombre = v.nombre and p.autor = v.autor);

-- ---------------------------------------------------------------------------
-- 8. Primer administrador
-- ---------------------------------------------------------------------------
-- Registrate primero desde /registro con tu cuenta normal. Después corré
-- esto (reemplazando el email) para convertirte en admin:
--
--   update public.perfiles set admin = true
--   where id = (select id from auth.users where email = 'tu@email.com');
