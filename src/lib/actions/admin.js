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
