"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { deleteUser, getUser } from "@/lib/local/auth";
import { leerDb, modificarDb, siguienteId } from "@/lib/local/db";
import { adminActualizarEstadoPedido } from "@/lib/local/rpc";

// IMPLEMENTACIÓN LOCAL (la versión con Supabase quedó comentada al final).
// En Supabase los permisos los garantizaba RLS; acá los garantiza
// requireAdmin() al principio de cada acción.

async function requireAdmin() {
  const user = await getUser();
  if (!user) throw new Error("No autenticado");
  const db = await leerDb();
  const perfil = db.perfiles.find((p) => p.id === user.id);
  if (!perfil?.admin) throw new Error("No autorizado");
  return user;
}

function leerProducto(formData) {
  return {
    nombre: formData.get("nombre")?.toString().trim(),
    autor: formData.get("autor")?.toString().trim(),
    descripcion: formData.get("descripcion")?.toString().trim() || "",
    precio: Number(formData.get("precio")),
    existencias: Number(formData.get("existencias")),
    imagen: formData.get("imagen")?.toString().trim() || "/img/covers/placeholder.jpg",
    categoria_id: Number(formData.get("categoria_id")),
  };
}

function validarProducto(p) {
  if (!p.nombre || !p.autor) return "Nombre y artista son obligatorios.";
  if (!(p.precio > 0)) return "El precio debe ser mayor a 0.";
  if (!Number.isInteger(p.existencias) || p.existencias < 0) return "Las existencias deben ser un entero ≥ 0.";
  if (!p.categoria_id) return "Elegí una categoría.";
  return null;
}

export async function crearProducto(_prevState, formData) {
  await requireAdmin();
  const producto = leerProducto(formData);
  const errorValidacion = validarProducto(producto);
  if (errorValidacion) return { error: errorValidacion };

  try {
    await modificarDb((db) => {
      if (!db.categorias.some((c) => c.id === producto.categoria_id)) throw new Error("Categoría inválida");
      db.productos.push({
        id: siguienteId(db.productos),
        ...producto,
        descripcion_en: null,
        descripcion_nb: null,
        creado_en: new Date().toISOString(),
      });
    });
  } catch {
    return { error: "No se pudo crear el producto." };
  }

  revalidatePath("/admin/productos");
  redirect({ href: "/admin/productos", locale: await getLocale() });
}

export async function actualizarProducto(id, _prevState, formData) {
  await requireAdmin();
  const producto = leerProducto(formData);
  const errorValidacion = validarProducto(producto);
  if (errorValidacion) return { error: errorValidacion };

  try {
    await modificarDb((db) => {
      const actual = db.productos.find((p) => p.id === Number(id));
      if (!actual) throw new Error("Producto no encontrado");
      if (!db.categorias.some((c) => c.id === producto.categoria_id)) throw new Error("Categoría inválida");
      Object.assign(actual, producto);
    });
  } catch {
    return { error: "No se pudo actualizar el producto." };
  }

  revalidatePath("/admin/productos");
  redirect({ href: "/admin/productos", locale: await getLocale() });
}

export async function borrarProducto(id) {
  await requireAdmin();
  let resultado;
  try {
    resultado = await modificarDb((db) => {
      if (db.detalle.some((d) => d.producto_id === Number(id))) {
        return { error: "No se puede borrar: el producto tiene pedidos asociados." };
      }
      db.productos = db.productos.filter((p) => p.id !== Number(id));
      return { success: true };
    });
  } catch {
    resultado = { error: "No se pudo borrar el producto." };
  }
  revalidatePath("/admin/productos");
  return resultado;
}

export async function cambiarEstadoPedido(pedidoId, nuevoEstadoId) {
  const user = await requireAdmin();
  let resultado = { success: true };
  try {
    await adminActualizarEstadoPedido(user.id, Number(pedidoId), Number(nuevoEstadoId));
  } catch (error) {
    resultado = { error: error.message };
  }
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${pedidoId}`);
  return resultado;
}

export async function borrarPedido(pedidoId) {
  await requireAdmin();
  let resultado;
  try {
    resultado = await modificarDb((db) => {
      const pedido = db.pedidos.find((p) => p.id === Number(pedidoId));
      const cancelado = db.estados.find((e) => e.descripcion === "Cancelado");
      if (!pedido || pedido.estado_id !== cancelado?.id) {
        return { error: "Solo se pueden borrar pedidos cancelados." };
      }
      db.detalle = db.detalle.filter((d) => d.pedido_id !== pedido.id);
      db.pedidos = db.pedidos.filter((p) => p.id !== pedido.id);
      return { success: true };
    });
  } catch {
    resultado = { error: "No se pudo borrar el pedido." };
  }
  revalidatePath("/admin/pedidos");
  return resultado;
}

export async function actualizarUsuarioAdmin(id, _prevState, formData) {
  await requireAdmin();
  const datos = {
    nombre: formData.get("nombre")?.toString().trim(),
    apellidos: formData.get("apellidos")?.toString().trim(),
    telefono: formData.get("telefono")?.toString().trim(),
    admin: formData.get("admin") === "on",
  };
  try {
    await modificarDb((db) => {
      const perfil = db.perfiles.find((p) => p.id === id);
      if (!perfil) throw new Error("Usuario no encontrado");
      Object.assign(perfil, datos);
    });
  } catch {
    revalidatePath("/admin/usuarios");
    return { error: "No se pudo actualizar el usuario." };
  }
  revalidatePath("/admin/usuarios");
  return { success: "Usuario actualizado." };
}

export async function toggleActivoUsuario(id, activoActual) {
  await requireAdmin();
  try {
    await modificarDb((db) => {
      const perfil = db.perfiles.find((p) => p.id === id);
      if (!perfil) throw new Error("Usuario no encontrado");
      perfil.activo = !activoActual;
    });
  } catch {
    revalidatePath("/admin/usuarios");
    return { error: "No se pudo actualizar." };
  }
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function borrarUsuario(id) {
  await requireAdmin();
  const db = await leerDb();
  if (db.pedidos.some((p) => p.usuario_id === id)) {
    return { error: "No se puede borrar: el usuario tiene pedidos." };
  }

  try {
    await deleteUser(id);
  } catch {
    revalidatePath("/admin/usuarios");
    return { error: "No se pudo borrar el usuario." };
  }
  revalidatePath("/admin/usuarios");
  return { success: true };
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
"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: perfil } = await supabase.from("perfiles").select("admin").eq("id", user.id).maybeSingle();
  if (!perfil?.admin) throw new Error("No autorizado");
  return supabase;
}

function leerProducto(formData) {
  return {
    nombre: formData.get("nombre")?.toString().trim(),
    autor: formData.get("autor")?.toString().trim(),
    descripcion: formData.get("descripcion")?.toString().trim() || "",
    precio: Number(formData.get("precio")),
    existencias: Number(formData.get("existencias")),
    imagen: formData.get("imagen")?.toString().trim() || "/img/covers/placeholder.jpg",
    categoria_id: Number(formData.get("categoria_id")),
  };
}

function validarProducto(p) {
  if (!p.nombre || !p.autor) return "Nombre y artista son obligatorios.";
  if (!(p.precio > 0)) return "El precio debe ser mayor a 0.";
  if (!Number.isInteger(p.existencias) || p.existencias < 0) return "Las existencias deben ser un entero ≥ 0.";
  if (!p.categoria_id) return "Elegí una categoría.";
  return null;
}

export async function crearProducto(_prevState, formData) {
  const supabase = await requireAdmin();
  const producto = leerProducto(formData);
  const errorValidacion = validarProducto(producto);
  if (errorValidacion) return { error: errorValidacion };

  const { error } = await supabase.from("productos").insert(producto);
  if (error) return { error: "No se pudo crear el producto." };

  revalidatePath("/admin/productos");
  redirect({ href: "/admin/productos", locale: await getLocale() });
}

export async function actualizarProducto(id, _prevState, formData) {
  const supabase = await requireAdmin();
  const producto = leerProducto(formData);
  const errorValidacion = validarProducto(producto);
  if (errorValidacion) return { error: errorValidacion };

  const { error } = await supabase.from("productos").update(producto).eq("id", id);
  if (error) return { error: "No se pudo actualizar el producto." };

  revalidatePath("/admin/productos");
  redirect({ href: "/admin/productos", locale: await getLocale() });
}

export async function borrarProducto(id) {
  const supabase = await requireAdmin();
  const { count } = await supabase
    .from("detalle")
    .select("*", { count: "exact", head: true })
    .eq("producto_id", id);
  if (count > 0) return { error: "No se puede borrar: el producto tiene pedidos asociados." };

  const { error } = await supabase.from("productos").delete().eq("id", id);
  revalidatePath("/admin/productos");
  if (error) return { error: "No se pudo borrar el producto." };
  return { success: true };
}

export async function cambiarEstadoPedido(pedidoId, nuevoEstadoId) {
  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("admin_actualizar_estado_pedido", {
    p_pedido_id: pedidoId,
    p_nuevo_estado_id: nuevoEstadoId,
  });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${pedidoId}`);
  if (error) return { error: error.message };
  return { success: true };
}

export async function borrarPedido(pedidoId) {
  const supabase = await requireAdmin();
  const { data: pedido } = await supabase.from("pedidos").select("estado_id, estados(descripcion)").eq("id", pedidoId).maybeSingle();
  if (pedido?.estados?.descripcion !== "Cancelado") {
    return { error: "Solo se pueden borrar pedidos cancelados." };
  }
  await supabase.from("detalle").delete().eq("pedido_id", pedidoId);
  const { error } = await supabase.from("pedidos").delete().eq("id", pedidoId);
  revalidatePath("/admin/pedidos");
  if (error) return { error: "No se pudo borrar el pedido." };
  return { success: true };
}

export async function actualizarUsuarioAdmin(id, _prevState, formData) {
  const supabase = await requireAdmin();
  const datos = {
    nombre: formData.get("nombre")?.toString().trim(),
    apellidos: formData.get("apellidos")?.toString().trim(),
    telefono: formData.get("telefono")?.toString().trim(),
    admin: formData.get("admin") === "on",
  };
  const { error } = await supabase.from("perfiles").update(datos).eq("id", id);
  revalidatePath("/admin/usuarios");
  if (error) return { error: "No se pudo actualizar el usuario." };
  return { success: "Usuario actualizado." };
}

export async function toggleActivoUsuario(id, activoActual) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("perfiles").update({ activo: !activoActual }).eq("id", id);
  revalidatePath("/admin/usuarios");
  if (error) return { error: "No se pudo actualizar." };
  return { success: true };
}

export async function borrarUsuario(id) {
  const supabase = await requireAdmin();
  const { count } = await supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("usuario_id", id);
  if (count > 0) return { error: "No se puede borrar: el usuario tiene pedidos." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  revalidatePath("/admin/usuarios");
  if (error) return { error: "No se pudo borrar el usuario." };
  return { success: true };
}
*/
