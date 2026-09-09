"use server";

import { createClient } from "@/lib/supabase/server";

export async function enviarContacto(_prevState, formData) {
  const mensaje = formData.get("mensaje")?.toString().trim();
  if (!mensaje) return { error: "Escribí un mensaje." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Iniciá sesión para poder enviarnos un mensaje." };

  const { error } = await supabase.from("contacto").insert({
    usuario_id: user.id,
    mensaje,
  });
  if (error) return { error: "No se pudo enviar el mensaje." };

  return { success: "¡Gracias! Te vamos a responder a la brevedad." };
}
