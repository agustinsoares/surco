// ---------------------------------------------------------------------------
// Lecturas de datos para Server Components — IMPLEMENTACIÓN LOCAL
// ---------------------------------------------------------------------------
// Antes estas funciones consultaban Supabase (el código original quedó
// comentado al final del archivo). Ahora leen la base JSON local
// (src/lib/local/db.js) y devuelven exactamente la misma forma de datos,
// incluidas las "relaciones embebidas" que armaba PostgREST
// (p. ej. producto.categorias = { slug, descripcion }), así que las páginas
// no necesitaron cambios.

import { connection } from "next/server";
import { leerDb as leerDbLocal } from "@/lib/local/db";
import { getUser } from "@/lib/local/auth";

// `connection()` marca la ruta como dinámica (antes lo hacía el cliente de
// Supabase al leer las cookies), así el catálogo y el stock nunca quedan
// congelados con los valores del build.
async function leerDb() {
  await connection();
  return leerDbLocal();
}

const porId = (filas, id) => filas.find((f) => f.id === id) ?? null;
const pick = (obj, campos) => (obj ? Object.fromEntries(campos.map((c) => [c, obj[c]])) : null);
const porFechaDesc = (campo) => (a, b) => new Date(b[campo]) - new Date(a[campo]);

function conCategoria(db, p, campos = ["slug", "descripcion"]) {
  return { ...p, categorias: pick(porId(db.categorias, p.categoria_id), campos) };
}

function conEstado(db, pedido) {
  return { ...pedido, estados: pick(porId(db.estados, pedido.estado_id), ["descripcion"]) };
}

export async function getEstados() {
  const db = await leerDb();
  return db.estados.map((e) => pick(e, ["id", "descripcion"])).sort((a, b) => a.id - b.id);
}

export async function getCategorias() {
  const db = await leerDb();
  return db.categorias.map((c) => pick(c, ["id", "slug", "descripcion"])).sort((a, b) => a.id - b.id);
}

export async function getProductos({ q, categoria } = {}) {
  const db = await leerDb();
  let productos = db.productos.map((p) => conCategoria(db, p));

  if (q) {
    // Igual que el ilike `${q}%` de antes: empieza con, sin distinguir mayúsculas.
    const prefijo = q.toLocaleLowerCase("es");
    productos = productos.filter((p) => p.nombre.toLocaleLowerCase("es").startsWith(prefijo));
  } else if (categoria) {
    productos = productos.filter((p) => p.categorias?.slug === categoria);
  }

  return productos.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export async function getProducto(id) {
  const db = await leerDb();
  const producto = porId(db.productos, Number(id));
  return producto ? conCategoria(db, producto) : null;
}

export async function getUsuarioActual() {
  const user = await getUser();
  if (!user) return null;

  const db = await leerDb();
  const perfil = porId(db.perfiles, user.id);
  return { auth: user, perfil };
}

export async function getPedidosDeUsuario(usuarioId) {
  const db = await leerDb();
  return db.pedidos
    .filter((p) => p.usuario_id === usuarioId)
    .map((p) => conEstado(db, pick(p, ["id", "fecha", "importe", "estado_id"])))
    .sort(porFechaDesc("fecha"));
}

export async function getPedidoConDetalle(pedidoId) {
  const db = await leerDb();
  const pedido = porId(db.pedidos, Number(pedidoId));
  if (!pedido) return null;

  const lineas = db.detalle
    .filter((d) => d.pedido_id === pedido.id)
    .map((d) => ({
      producto_id: d.producto_id,
      unidades: d.unidades,
      precio_unitario: d.precio_unitario,
      productos: pick(porId(db.productos, d.producto_id), ["nombre", "autor", "imagen"]),
    }));

  return { ...conEstado(db, pedido), lineas };
}

export async function getTodosLosPedidos() {
  const db = await leerDb();
  return db.pedidos
    .map((p) => ({
      ...conEstado(db, pick(p, ["id", "fecha", "importe", "estado_id"])),
      perfiles: pick(porId(db.perfiles, p.usuario_id), ["usuario", "nombre", "apellidos"]),
    }))
    .sort(porFechaDesc("fecha"));
}

export async function getTodosLosUsuarios() {
  const db = await leerDb();
  return db.perfiles
    .map((u) => ({
      ...pick(u, ["id", "usuario", "nombre", "apellidos", "telefono", "admin", "activo"]),
      num_pedidos: db.pedidos.filter((p) => p.usuario_id === u.id).length,
      creado_en: u.creado_en,
    }))
    .sort(porFechaDesc("creado_en"));
}

export async function getTodosLosContactos() {
  const db = await leerDb();
  return db.contacto
    .map((c) => ({
      ...pick(c, ["id", "mensaje", "creado_en"]),
      perfiles: pick(porId(db.perfiles, c.usuario_id), ["usuario", "nombre", "apellidos"]),
    }))
    .sort(porFechaDesc("creado_en"));
}

export async function getTodosLosProductosAdmin() {
  const db = await leerDb();
  const conPedidos = new Set(db.detalle.map((d) => d.producto_id));
  return db.productos
    .map((p) => ({ ...conCategoria(db, p, ["descripcion"]), tiene_detalles: conPedidos.has(p.id) }))
    .sort((a, b) => a.id - b.id);
}

export async function esAdmin(userId) {
  if (!userId) return false;
  const db = await leerDb();
  return !!porId(db.perfiles, userId)?.admin;
}

// ===========================================================================
// IMPLEMENTACIÓN CON SUPABASE (desactivada)
// ---------------------------------------------------------------------------
// Código original que leía/escribía en Supabase. Se dejó comentado para poder
// volver a usarlo: descomentarlo, borrar la implementación local de arriba y
// definir las variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// (y SUPABASE_SERVICE_ROLE_KEY). Ver docs/datos-supabase.md.
// ===========================================================================
/*
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
*/
