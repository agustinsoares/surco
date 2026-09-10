import { createClient } from "@/lib/supabase/server";

export async function getEstados() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("estados").select("id, descripcion").order("id");
  if (error) throw error;
  return data;
}

export async function getCategorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, slug, descripcion")
    .order("id");
  if (error) throw error;
  return data;
}

export async function getProductos({ q, categoria } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("productos")
    .select("id, nombre, autor, descripcion, precio, existencias, imagen, categoria_id, categorias(slug, descripcion)")
    .order("nombre");

  if (q) {
    query = query.ilike("nombre", `${q}%`);
  } else if (categoria) {
    query = query.eq("categorias.slug", categoria).not("categorias", "is", null);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Supabase no permite filtrar por columna de una relación embebida sin
  // "!inner"; lo resolvemos filtrando en memoria cuando hace falta.
  if (categoria && !q) {
    return data.filter((p) => p.categorias?.slug === categoria);
  }
  return data;
}

export async function getProducto(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(
      "id, nombre, autor, descripcion, descripcion_en, descripcion_nb, precio, existencias, imagen, categoria_id, categorias(slug, descripcion)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUsuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  return { auth: user, perfil };
}

export async function getPedidosDeUsuario(usuarioId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, fecha, importe, estado_id, estados(descripcion)")
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPedidoConDetalle(pedidoId) {
  const supabase = await createClient();
  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("id, fecha, importe, estado_id, direccion_envio, usuario_id, estados(descripcion)")
    .eq("id", pedidoId)
    .maybeSingle();
  if (error) throw error;
  if (!pedido) return null;

  const { data: lineas, error: errorLineas } = await supabase
    .from("detalle")
    .select("producto_id, unidades, precio_unitario, productos(nombre, autor, imagen)")
    .eq("pedido_id", pedidoId);
  if (errorLineas) throw errorLineas;

  return { ...pedido, lineas };
}

export async function getTodosLosPedidos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, fecha, importe, estado_id, estados(descripcion), perfiles(usuario, nombre, apellidos)")
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTodosLosUsuarios() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("id, usuario, nombre, apellidos, telefono, admin, activo, pedidos(id)")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data.map((u) => ({ ...u, num_pedidos: u.pedidos?.length ?? 0 }));
}

export async function getTodosLosContactos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacto")
    .select("id, mensaje, creado_en, perfiles(usuario, nombre, apellidos)")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTodosLosProductosAdmin() {
  const supabase = await createClient();
  const { data: productos, error } = await supabase
    .from("productos")
    .select("id, nombre, autor, descripcion, precio, existencias, imagen, categoria_id, categorias(descripcion)")
    .order("id");
  if (error) throw error;

  const { data: detalles, error: errorDetalle } = await supabase
    .from("detalle")
    .select("producto_id");
  if (errorDetalle) throw errorDetalle;

  const conPedidos = new Set(detalles.map((d) => d.producto_id));
  return productos.map((p) => ({ ...p, tiene_detalles: conPedidos.has(p.id) }));
}

export async function esAdmin(userId) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("perfiles")
    .select("admin")
    .eq("id", userId)
    .maybeSingle();
  return !!data?.admin;
}
