"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Valida los datos de pago igual que el checkout original (solo formato,
// no hay pasarela real: es un proyecto de portfolio).
function validarPago(metodo, datos) {
  if (metodo === "tarjeta") {
    const numero = (datos.numero || "").replace(/\s+/g, "");
    if (!/^\d{16}$/.test(numero)) return "Número de tarjeta inválido (16 dígitos).";
    if (!/^\d{2}\/\d{2}$/.test(datos.caducidad || "")) return "Formato de caducidad inválido (MM/AA).";
    const [mes, anio] = datos.caducidad.split("/").map(Number);
    const ahora = new Date();
    const anioActual = ahora.getFullYear() % 100;
    const mesActual = ahora.getMonth() + 1;
    if (mes < 1 || mes > 12) return "Mes de caducidad inválido.";
    if (anio < anioActual || (anio === anioActual && mes < mesActual)) return "La tarjeta está caducada.";
    if (!/^\d{3,4}$/.test(datos.cvv || "")) return "CVV inválido.";
  } else if (metodo === "transferencia") {
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test((datos.iban || "").toUpperCase())) {
      return "IBAN inválido.";
    }
  } else {
    return "Elegí un método de pago.";
  }
  return null;
}

export async function crearPedido(_prevState, formData) {
  const carritoRaw = formData.get("carrito")?.toString();
  let items;
  try {
    items = JSON.parse(carritoRaw).map((l) => ({
      producto_id: Number(l.codigo),
      unidades: Number(l.cantidad),
    }));
  } catch {
    return { error: "El carrito llegó dañado, volvé a intentarlo." };
  }
  if (!items?.length) return { error: "Tu carrito está vacío." };

  const metodo = formData.get("metodoPago")?.toString();
  const datosPago = {
    numero: formData.get("numeroTarjeta")?.toString(),
    caducidad: formData.get("caducidad")?.toString(),
    cvv: formData.get("cvv")?.toString(),
    iban: formData.get("iban")?.toString(),
  };
  const errorPago = validarPago(metodo, datosPago);
  if (errorPago) return { error: errorPago };

  const direccion = {
    nombre: formData.get("nombre")?.toString().trim(),
    apellidos: formData.get("apellidos")?.toString().trim(),
    domicilio: formData.get("domicilio")?.toString().trim(),
    poblacion: formData.get("poblacion")?.toString().trim(),
    provincia: formData.get("provincia")?.toString().trim(),
    cp: formData.get("cp")?.toString().trim(),
    telefono: formData.get("telefono")?.toString().trim(),
    metodo_pago: metodo,
  };
  if (Object.entries(direccion).some(([k, v]) => k !== "metodo_pago" && !v)) {
    return { error: "Completá los datos de envío." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión para completar el pedido." };

  const { data: pedidoId, error } = await supabase.rpc("crear_pedido", {
    items,
    direccion,
  });

  if (error) {
    return { error: error.message.includes("stock") ? error.message : "No se pudo crear el pedido. Probá de nuevo." };
  }

  revalidatePath("/cuenta");
  redirect(`/pedido-creado/${pedidoId}`);
}

export async function cancelarPedido(pedidoId) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_pedido", { p_pedido_id: pedidoId });
  revalidatePath("/cuenta");
  if (error) return { error: error.message };
  return { success: true };
}
