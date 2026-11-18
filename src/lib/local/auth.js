import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { leerDb, modificarDb } from "./db";
import { hashPassword, verificarPassword } from "./password";

// ---------------------------------------------------------------------------
// Autenticación local (reemplaza a Supabase Auth)
// ---------------------------------------------------------------------------
// La sesión es una cookie httpOnly firmada con HMAC-SHA256:
//   surco_session = <id de usuario>.<expiración en ms>.<firma>
// La firma usa AUTH_SECRET; sin ella cualquiera podría fabricarse una cookie,
// así que en producción hay que definirla (en desarrollo hay un fallback).

const COOKIE = "surco_session";
const DURACION_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

function secreto() {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    console.warn("[surco] AUTH_SECRET no está definida: usando un secreto inseguro por defecto.");
  }
  return "surco-dev-secret-cambiame";
}

function firmar(valor) {
  return createHmac("sha256", secreto()).update(valor).digest("base64url");
}

function leerToken(token) {
  const partes = token?.split(".");
  if (partes?.length !== 3) return null;
  const [id, exp, firma] = partes;
  const esperada = Buffer.from(firmar(`${id}.${exp}`));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;
  if (Number(exp) < Date.now()) return null;
  return id;
}

async function abrirSesion(id) {
  const exp = Date.now() + DURACION_MS;
  const valor = `${id}.${exp}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, `${valor}.${firmar(valor)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(exp),
  });
}

// Equivalente a supabase.auth.getUser(): { id, email } o null.
export async function getUser() {
  const cookieStore = await cookies();
  const id = leerToken(cookieStore.get(COOKIE)?.value);
  if (!id) return null;
  const db = await leerDb();
  const usuario = db.usuarios.find((u) => u.id === id);
  if (!usuario) return null;
  return { id: usuario.id, email: usuario.email, created_at: usuario.creado_en };
}

// Equivalente a supabase.auth.signInWithPassword(). Además rechaza a los
// usuarios desactivados desde el panel admin (perfiles.activo = false).
export async function signInWithPassword({ email, password }) {
  const db = await leerDb();
  const usuario = db.usuarios.find((u) => u.email === email.trim().toLowerCase());
  if (!usuario || !verificarPassword(password, usuario.password_hash)) {
    return { error: { message: "Invalid login credentials" } };
  }
  const perfil = db.perfiles.find((p) => p.id === usuario.id);
  if (perfil && perfil.activo === false) {
    return { error: { message: "User disabled" } };
  }
  await abrirSesion(usuario.id);
  return { error: null };
}

// Equivalente a supabase.auth.signUp() + el trigger handle_new_user que
// creaba la fila en "perfiles" con los datos del formulario.
export async function signUp({ email, password, datos }) {
  const emailNormalizado = email.trim().toLowerCase();
  if (password.length < 6) {
    return { error: { message: "La contraseña debe tener al menos 6 caracteres." } };
  }
  const id = crypto.randomUUID();
  try {
    await modificarDb((db) => {
      if (db.usuarios.some((u) => u.email === emailNormalizado)) {
        throw new Error("User already registered");
      }
      const usuario = datos.usuario || emailNormalizado.split("@")[0];
      if (db.perfiles.some((p) => p.usuario === usuario)) {
        throw new Error("Ese nombre de usuario ya está en uso.");
      }
      const ahora = new Date().toISOString();
      db.usuarios.push({ id, email: emailNormalizado, password_hash: hashPassword(password), creado_en: ahora });
      db.perfiles.push({
        id,
        usuario,
        nombre: datos.nombre ?? "",
        apellidos: datos.apellidos ?? "",
        domicilio: datos.domicilio ?? "",
        poblacion: datos.poblacion ?? "",
        provincia: datos.provincia ?? "",
        cp: datos.cp ?? "",
        telefono: datos.telefono ?? "",
        admin: false,
        activo: true,
        creado_en: ahora,
      });
    });
  } catch (e) {
    return { error: { message: e.message } };
  }
  await abrirSesion(id);
  return { error: null };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

// Equivalente a supabase.auth.updateUser({ password }).
export async function updatePassword(id, nueva) {
  await modificarDb((db) => {
    const usuario = db.usuarios.find((u) => u.id === id);
    if (!usuario) throw new Error("Usuario no encontrado");
    usuario.password_hash = hashPassword(nueva);
  });
}

// Equivalente a supabase.auth.admin.deleteUser(): borra la cuenta y su
// perfil (en Postgres lo hacía el "on delete cascade").
export async function deleteUser(id) {
  await modificarDb((db) => {
    db.usuarios = db.usuarios.filter((u) => u.id !== id);
    db.perfiles = db.perfiles.filter((p) => p.id !== id);
  });
}
