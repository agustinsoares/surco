"use server";

import { getUser } from "@/lib/local/auth";
import { modificarDb, siguienteId } from "@/lib/local/db";

// IMPLEMENTACIÓN LOCAL (la versión con Supabase quedó comentada al final).

export async function enviarContacto(_prevState, formData) {
  const mensaje = formData.get("mensaje")?.toString().trim();
  if (!mensaje) return { error: "Escribí un mensaje." };

  const user = await getUser();
  if (!user) return { error: "Iniciá sesión para poder enviarnos un mensaje." };

  try {
    await modificarDb((db) => {
      db.contacto.push({
        id: siguienteId(db.contacto),
        usuario_id: user.id,
        mensaje,
        creado_en: new Date().toISOString(),
      });
    });
  } catch {
    return { error: "No se pudo enviar el mensaje." };
  }

  return { success: "¡Gracias! Te vamos a responder a la brevedad." };
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
*/
