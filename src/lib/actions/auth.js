"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function iniciarSesion(_prevState, formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const next = formData.get("next")?.toString() || "/cuenta";

  if (!email || !password) {
    return { error: "Ingresá tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect({ href: next, locale: await getLocale() });
}

export async function registrarse(_prevState, formData) {
  const campos = [
    "email",
    "password",
    "usuario",
    "nombre",
    "apellidos",
    "domicilio",
    "poblacion",
    "provincia",
    "cp",
    "telefono",
  ];
  const valores = Object.fromEntries(campos.map((c) => [c, formData.get(c)?.toString().trim() || ""]));

  if (Object.entries(valores).some(([k, v]) => k !== "usuario" && !v)) {
    return { error: "Completá todos los campos obligatorios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: valores.email,
    password: valores.password,
    options: {
      data: {
        usuario: valores.usuario || valores.email.split("@")[0],
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        domicilio: valores.domicilio,
        poblacion: valores.poblacion,
        provincia: valores.provincia,
        cp: valores.cp,
        telefono: valores.telefono,
      },
    },
  });

  if (error) {
    return { error: error.message === "User already registered" ? "Ese email ya está registrado." : error.message };
  }

  revalidatePath("/", "layout");
  redirect({ href: "/cuenta", locale: await getLocale() });
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/", locale: await getLocale() });
}

export async function actualizarPerfil(_prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión." };

  const datos = {
    nombre: formData.get("nombre")?.toString().trim(),
    apellidos: formData.get("apellidos")?.toString().trim(),
    domicilio: formData.get("domicilio")?.toString().trim(),
    poblacion: formData.get("poblacion")?.toString().trim(),
    provincia: formData.get("provincia")?.toString().trim(),
    cp: formData.get("cp")?.toString().trim(),
    telefono: formData.get("telefono")?.toString().trim(),
  };

  const { error } = await supabase.from("perfiles").update(datos).eq("id", user.id);
  if (error) return { error: "No se pudieron guardar los cambios." };

  revalidatePath("/cuenta");
  return { success: "Datos actualizados." };
}

export async function cambiarPassword(_prevState, formData) {
  const actual = formData.get("actual")?.toString();
  const nueva = formData.get("nueva")?.toString();
  const confirmar = formData.get("confirmar")?.toString();

  if (!actual || !nueva || !confirmar) {
    return { error: "Completá los tres campos." };
  }
  if (nueva.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }
  if (nueva !== confirmar) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Tenés que iniciar sesión." };

  const { error: errorReauth } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: actual,
  });
  if (errorReauth) return { error: "La contraseña actual no es correcta." };

  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) return { error: "No se pudo cambiar la contraseña." };

  return { success: "Contraseña actualizada." };
}
